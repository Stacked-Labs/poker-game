'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

const bulletsUsedAbi = {
    name: 'bulletsUsed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ type: 'uint8' }],
} as const;

const refundedAbi = {
    name: 'refunded',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ type: 'bool' }],
} as const;

const buyInAbi = {
    name: 'buyIn',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
} as const;

const claimRefundAbi = {
    name: 'claimRefund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
} as const;

export interface RefundState {
    eligible: boolean;       // registered (bulletsUsed > 0), not yet refunded, and buyIn > 0
    alreadyClaimed: boolean;
    estimatedUsdc: bigint | null; // null for emergency_refund (pro-rata, unknown until claim)
    loading: boolean;
    claiming: boolean;
    error: string | null;
    claim: () => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function useClaimRefund(
    contractAddress: string | undefined,
    chainName: string | undefined,
    tournamentStatus: string | undefined,
): RefundState {
    const account = useActiveAccount();
    const sendOnChain = useChainBoundSend();

    const [eligible, setEligible] = useState(false);
    const [alreadyClaimed, setAlreadyClaimed] = useState(false);
    const [estimatedUsdc, setEstimatedUsdc] = useState<bigint | null>(null);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;
    const isRefundable = tournamentStatus === 'cancelled' || tournamentStatus === 'emergency_refund';

    // readOnce returns the raw on-chain refund standing (or null when not applicable),
    // so callers can both render it and poll on it after a claim.
    const readOnce = useCallback(async () => {
        if (!contractAddress || !chainCfg || !account || !isRefundable) return null;
        const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
        const addr = account.address;
        const [bullets, alreadyRefunded, buyIn] = await Promise.all([
            readContract({ contract, method: bulletsUsedAbi, params: [addr] }),
            readContract({ contract, method: refundedAbi, params: [addr] }),
            readContract({ contract, method: buyInAbi, params: [] }),
        ]);
        return { bullets: Number(bullets), alreadyRefunded, buyIn };
    }, [contractAddress, chainCfg, account, isRefundable]);

    const apply = useCallback(
        (s: { bullets: number; alreadyRefunded: boolean; buyIn: bigint }) => {
            setAlreadyClaimed(s.alreadyRefunded);
            if (s.bullets === 0 || s.alreadyRefunded || s.buyIn === BigInt(0)) {
                setEligible(false);
                setEstimatedUsdc(null);
            } else {
                setEligible(true);
                // emergency_refund is a pro-rata split, unknown without a live balance read.
                setEstimatedUsdc(
                    tournamentStatus === 'cancelled'
                        ? BigInt(s.buyIn) * BigInt(s.bullets)
                        : null
                );
            }
        },
        [tournamentStatus]
    );

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const s = await readOnce();
            if (s) apply(s);
        } catch {
            setEligible(false);
        } finally {
            setLoading(false);
        }
    }, [readOnce, apply]);

    useEffect(() => { refresh(); }, [refresh]);

    const claim = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        setClaiming(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({ contract, method: claimRefundAbi, params: [] });
            await sendOnChain(chainCfg.chain, tx);
            // Poll on-chain until the refund is reflected — a single read right after
            // the tx can hit an RPC node a block behind and still show "claim".
            for (let i = 0; i < 6; i++) {
                const s = await readOnce().catch(() => null);
                if (s) {
                    apply(s);
                    if (s.alreadyRefunded) break;
                }
                await new Promise((r) => setTimeout(r, 1500));
            }
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Claim failed');
            return false;
        } finally {
            setClaiming(false);
        }
    }, [contractAddress, chainCfg, account, sendOnChain, readOnce, apply]);

    return { eligible, alreadyClaimed, estimatedUsdc, loading, claiming, error, claim, refresh };
}
