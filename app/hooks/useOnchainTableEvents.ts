'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    type Chain,
    getContract,
    getContractEvents,
    prepareEvent,
} from 'thirdweb';
import { eth_blockNumber, getRpcClient } from 'thirdweb/rpc';
import { client } from '@/app/thirdwebclient';

const WINDOW_SIZE = BigInt(5_000);
const MIN_PAGE_RESULTS = 20;
const MAX_WINDOWS_PER_CALL = 12;
const ZERO = BigInt(0);
const ONE = BigInt(1);

export type OnchainEventName =
    | 'PlayerDeposited'
    | 'PlayerWithdrew'
    | 'PlayerSeated'
    | 'PlayerLeft'
    | 'ChipsSettled'
    | 'RakeDistributed'
    | 'HostRakeWithdrawn'
    | 'EmergencyWithdrawal'
    | 'EmergencyWithdrawAll'
    | 'BlindsUpdated'
    | 'TableClosed';

export interface OnchainEventRow {
    eventName: OnchainEventName;
    txHash: string;
    blockNumber: bigint;
    logIndex: number;
    args: Record<string, unknown>;
}

const PREPARED_EVENTS = [
    prepareEvent({
        signature:
            'event PlayerDeposited(address indexed player, uint256 usdcAmount, uint256 chipAmount)',
    }),
    prepareEvent({
        signature:
            'event PlayerWithdrew(address indexed player, uint256 chipAmount, uint256 usdcAmount)',
    }),
    prepareEvent({
        signature: 'event PlayerSeated(address indexed player)',
    }),
    prepareEvent({
        signature: 'event PlayerLeft(address indexed player)',
    }),
    prepareEvent({
        signature:
            'event ChipsSettled(uint256 handId, address[] players, uint256[] newChips, uint256 rakeCollected)',
    }),
    prepareEvent({
        signature:
            'event RakeDistributed(uint256 handId, uint256 platformRake, uint256 hostRake, uint256 totalRake)',
    }),
    prepareEvent({
        signature:
            'event HostRakeWithdrawn(address indexed host, uint256 amount)',
    }),
    prepareEvent({
        signature:
            'event EmergencyWithdrawal(address indexed player, uint256 usdcAmount)',
    }),
    prepareEvent({
        signature:
            'event EmergencyWithdrawAll(uint256 totalWithdrownUSDC, uint256 timestamp)',
    }),
    prepareEvent({
        signature:
            'event BlindsUpdated(uint256 newSmallBlind, uint256 newBigBlind)',
    }),
    prepareEvent({
        signature:
            'event TableClosed(uint256 totalDepositedUSDC, uint256 finalBalance)',
    }),
];

interface UseOnchainTableEventsResult {
    events: OnchainEventRow[];
    loading: boolean;
    initialLoading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    reload: () => Promise<void>;
}

function sortDescending(rows: OnchainEventRow[]): OnchainEventRow[] {
    return [...rows].sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
            return b.logIndex - a.logIndex;
        }
        return a.blockNumber > b.blockNumber ? -1 : 1;
    });
}

export function useOnchainTableEvents(
    contractAddress: string | undefined,
    chain: Chain,
    enabled: boolean
): UseOnchainTableEventsResult {
    const [events, setEvents] = useState<OnchainEventRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const cursorRef = useRef<bigint | null>(null);
    const reachedGenesisRef = useRef(false);
    const inFlight = useRef(false);
    const seenKeys = useRef<Set<string>>(new Set());

    const fetchWindow = useCallback(
        async (isInitial: boolean) => {
            if (!contractAddress) return;
            if (inFlight.current) return;
            inFlight.current = true;
            setLoading(true);
            if (isInitial) setInitialLoading(true);

            try {
                const contract = getContract({
                    client,
                    chain,
                    address: contractAddress,
                });

                let cursor: bigint | null = cursorRef.current;
                if (cursor === null) {
                    const rpc = getRpcClient({ client, chain });
                    const latest = await eth_blockNumber(rpc);
                    cursor = latest;
                }

                const collected: OnchainEventRow[] = [];
                let windowsScanned = 0;
                let reachedGenesis = false;

                while (
                    windowsScanned < MAX_WINDOWS_PER_CALL &&
                    cursor !== null &&
                    cursor >= ZERO &&
                    collected.length < MIN_PAGE_RESULTS
                ) {
                    const toBlock: bigint = cursor;
                    const fromBlock: bigint =
                        cursor >= WINDOW_SIZE - ONE
                            ? cursor - (WINDOW_SIZE - ONE)
                            : ZERO;

                    const logs = await getContractEvents({
                        contract,
                        events: PREPARED_EVENTS,
                        fromBlock,
                        toBlock,
                    });

                    for (const log of logs) {
                        const eventName = log.eventName as OnchainEventName;
                        if (!eventName) continue;
                        const key = `${log.transactionHash}-${log.logIndex}`;
                        if (seenKeys.current.has(key)) continue;
                        seenKeys.current.add(key);
                        collected.push({
                            eventName,
                            txHash: log.transactionHash,
                            blockNumber: log.blockNumber,
                            logIndex: log.logIndex,
                            args: (log.args ?? {}) as Record<string, unknown>,
                        });
                    }

                    windowsScanned += 1;
                    if (fromBlock === ZERO) {
                        reachedGenesis = true;
                        break;
                    }
                    cursor = fromBlock - ONE;
                }

                cursorRef.current = reachedGenesis ? null : cursor;
                reachedGenesisRef.current = reachedGenesis;
                setHasMore(!reachedGenesis);

                setEvents((prev) =>
                    sortDescending(isInitial ? collected : [...prev, ...collected])
                );
                setError(null);
            } catch (err) {
                console.error('[useOnchainTableEvents] fetch failed:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load onchain events'
                );
            } finally {
                inFlight.current = false;
                setLoading(false);
                if (isInitial) setInitialLoading(false);
            }
        },
        [contractAddress, chain]
    );

    const reload = useCallback(async () => {
        cursorRef.current = null;
        reachedGenesisRef.current = false;
        seenKeys.current = new Set();
        setEvents([]);
        setHasMore(true);
        await fetchWindow(true);
    }, [fetchWindow]);

    const loadMore = useCallback(async () => {
        if (reachedGenesisRef.current) return;
        await fetchWindow(false);
    }, [fetchWindow]);

    useEffect(() => {
        if (!enabled || !contractAddress) return;
        cursorRef.current = null;
        reachedGenesisRef.current = false;
        seenKeys.current = new Set();
        setEvents([]);
        setHasMore(true);
        fetchWindow(true);
    }, [enabled, contractAddress, fetchWindow]);

    return {
        events,
        loading,
        initialLoading,
        error,
        hasMore,
        loadMore,
        reload,
    };
}
