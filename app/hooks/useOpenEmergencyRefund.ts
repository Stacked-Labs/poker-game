'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

const EMERGENCY_DELAY_MS = 24 * 60 * 60 * 1000;

export interface OpenEmergencyRefundState {
    available: boolean;           // past advertisedEndAt + 24h
    msUntilAvailable: number;    // 0 once available
    opening: boolean;
    opened: boolean;
    error: string | null;
    open: () => Promise<boolean>;
}

export function useOpenEmergencyRefund(
    contractAddress: string | undefined,
    chainName: string | undefined,
    advertisedEndAt: string | undefined,
    tournamentStatus: string | undefined,
): OpenEmergencyRefundState {
    const account = useActiveAccount();
    const sendOnChain = useChainBoundSend();

    const [msUntilAvailable, setMsUntilAvailable] = useState<number>(Infinity);
    const [opening, setOpening] = useState(false);
    const [opened, setOpened] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;
    const isRunning = tournamentStatus === 'running';

    useEffect(() => {
        if (!advertisedEndAt || !isRunning) {
            setMsUntilAvailable(Infinity);
            return;
        }

        const updateCountdown = () => {
            const deadline = new Date(advertisedEndAt).getTime() + EMERGENCY_DELAY_MS;
            const remaining = deadline - Date.now();
            setMsUntilAvailable(Math.max(0, remaining));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 10_000);
        return () => clearInterval(interval);
    }, [advertisedEndAt, isRunning]);

    const available = isRunning && msUntilAvailable === 0;

    const open = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        setOpening(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({
                contract,
                method: 'function openEmergencyRefund()',
                params: [],
            });
            await sendOnChain(chainCfg.chain, tx);
            setOpened(true);
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Transaction failed');
            return false;
        } finally {
            setOpening(false);
        }
    }, [contractAddress, chainCfg, account, sendOnChain]);

    return { available, msUntilAvailable, opening, opened, error, open };
}
