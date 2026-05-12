'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Chain, getContract, readContract } from 'thirdweb';
import { client } from '@/app/thirdwebclient';

const POLL_INTERVAL_MS = 10_000;
const MAX_SEATED_PROBE = 12;

export interface OnchainPlayer {
    address: string;
    chips: bigint;
    usdcDeposited: bigint;
    seated: boolean;
    withdrawable: boolean;
}

export interface OnchainSnapshot {
    totalDepositedUSDC: bigint;
    contractUsdcBalance: bigint;
    usdcTokenAddress: string;
    lastSettlement: bigint;
    isActive: boolean;
    gameCreator: string;
    hostWithdrawable: bigint;
    players: OnchainPlayer[];
    fetchedAt: number;
}

interface UseOnchainTableSnapshotResult {
    snapshot: OnchainSnapshot | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

async function readSeatedAddresses(
    contract: ReturnType<typeof getContract>
): Promise<string[]> {
    const probes = Array.from({ length: MAX_SEATED_PROBE }, (_, i) =>
        readContract({
            contract,
            method: 'function players(uint256) view returns (address)',
            params: [BigInt(i)],
        }) as Promise<string>
    );
    const settled = await Promise.allSettled(probes);
    const addresses: string[] = [];
    for (const r of settled) {
        if (r.status !== 'fulfilled') break;
        addresses.push(r.value);
    }
    return addresses;
}

async function readPlayerInfo(
    contract: ReturnType<typeof getContract>,
    address: string
): Promise<Omit<OnchainPlayer, 'address'>> {
    const [chips, usdcDeposited, seated, withdrawable] = (await readContract({
        contract,
        method:
            'function getPlayerInfo(address player) view returns (uint256 chips, uint256 usdcDeposited, bool seated, bool withdrawable)',
        params: [address],
    })) as [bigint, bigint, boolean, boolean];
    return { chips, usdcDeposited, seated, withdrawable };
}

export function useOnchainTableSnapshot(
    contractAddress: string | undefined,
    chain: Chain,
    usdcAddress: string,
    enabled: boolean
): UseOnchainTableSnapshotResult {
    const [snapshot, setSnapshot] = useState<OnchainSnapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inFlight = useRef(false);

    const refresh = useCallback(async () => {
        if (!contractAddress) return;
        if (inFlight.current) return;
        inFlight.current = true;
        setLoading(true);
        try {
            const table = getContract({ client, chain, address: contractAddress });
            const usdc = getContract({ client, chain, address: usdcAddress });

            const [
                totalDepositedUSDC,
                contractUsdcBalance,
                usdcTokenAddress,
                lastSettlement,
                isActive,
                gameCreator,
                seatedAddresses,
            ] = await Promise.all([
                readContract({
                    contract: table,
                    method: 'function totalDepositedUSDC() view returns (uint256)',
                    params: [],
                }) as Promise<bigint>,
                readContract({
                    contract: usdc,
                    method: 'function balanceOf(address) view returns (uint256)',
                    params: [contractAddress],
                }) as Promise<bigint>,
                readContract({
                    contract: table,
                    method: 'function usdcToken() view returns (address)',
                    params: [],
                }) as Promise<string>,
                readContract({
                    contract: table,
                    method: 'function lastSettlement() view returns (uint256)',
                    params: [],
                }) as Promise<bigint>,
                readContract({
                    contract: table,
                    method: 'function isActive() view returns (bool)',
                    params: [],
                }) as Promise<boolean>,
                readContract({
                    contract: table,
                    method: 'function gameCreator() view returns (address)',
                    params: [],
                }) as Promise<string>,
                readSeatedAddresses(table),
            ]);

            const hostWithdrawable = (await readContract({
                contract: table,
                method:
                    'function hostWithdrawableBalance(address) view returns (uint256)',
                params: [gameCreator],
            })) as bigint;

            const playerInfos = await Promise.all(
                seatedAddresses.map((addr) => readPlayerInfo(table, addr))
            );
            const players: OnchainPlayer[] = seatedAddresses.map(
                (address, i) => ({ address, ...playerInfos[i] })
            );

            setSnapshot({
                totalDepositedUSDC,
                contractUsdcBalance,
                usdcTokenAddress,
                lastSettlement,
                isActive,
                gameCreator,
                hostWithdrawable,
                players,
                fetchedAt: Date.now(),
            });
            setError(null);
        } catch (err) {
            console.error('[useOnchainTableSnapshot] read failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to read contract');
        } finally {
            inFlight.current = false;
            setLoading(false);
        }
    }, [contractAddress, chain, usdcAddress]);

    useEffect(() => {
        if (!enabled || !contractAddress) return;

        let visible =
            typeof document === 'undefined' || document.visibilityState !== 'hidden';
        let interval: ReturnType<typeof setInterval> | null = null;

        const start = () => {
            if (interval !== null) return;
            refresh();
            interval = setInterval(refresh, POLL_INTERVAL_MS);
        };
        const stop = () => {
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }
        };

        const onVisibilityChange = () => {
            const nowVisible = document.visibilityState !== 'hidden';
            if (nowVisible && !visible) {
                visible = true;
                start();
            } else if (!nowVisible && visible) {
                visible = false;
                stop();
            }
        };

        if (visible) start();
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', onVisibilityChange);
        }
        return () => {
            stop();
            if (typeof document !== 'undefined') {
                document.removeEventListener(
                    'visibilitychange',
                    onVisibilityChange
                );
            }
        };
    }, [enabled, contractAddress, refresh]);

    return { snapshot, loading, error, refresh };
}
