'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';

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

const isFreeEntryAbi = {
    name: 'isFreeEntry',
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
    eligible: boolean;       // registered and not yet refunded and not free entry
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
    const { mutateAsync: sendTx } = useSendAndConfirmTransaction();

    const [eligible, setEligible] = useState(false);
    const [alreadyClaimed, setAlreadyClaimed] = useState(false);
    const [estimatedUsdc, setEstimatedUsdc] = useState<bigint | null>(null);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;
    const isRefundable = tournamentStatus === 'cancelled' || tournamentStatus === 'emergency_refund';

    const refresh = useCallback(async () => {
        if (!contractAddress || !chainCfg || !account || !isRefundable) return;
        setLoading(true);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const addr = account.address;

            const [bullets, alreadyRefunded, freeEntry, buyIn] = await Promise.all([
                readContract({ contract, method: bulletsUsedAbi, params: [addr] }),
                readContract({ contract, method: refundedAbi, params: [addr] }),
                readContract({ contract, method: isFreeEntryAbi, params: [addr] }),
                readContract({ contract, method: buyInAbi, params: [] }),
            ]);

            setAlreadyClaimed(alreadyRefunded);

            if (bullets === 0 || freeEntry || alreadyRefunded) {
                setEligible(false);
                setEstimatedUsdc(null);
            } else {
                setEligible(true);
                if (tournamentStatus === 'cancelled') {
                    setEstimatedUsdc(BigInt(buyIn) * BigInt(bullets));
                } else {
                    // emergency_refund: pro-rata split, unknown without live balance read
                    setEstimatedUsdc(null);
                }
            }
        } catch {
            setEligible(false);
        } finally {
            setLoading(false);
        }
    }, [contractAddress, chainCfg, account, isRefundable, tournamentStatus]);

    useEffect(() => { refresh(); }, [refresh]);

    const claim = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        setClaiming(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({ contract, method: claimRefundAbi, params: [] });
            await sendTx(tx);
            await refresh();
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Claim failed');
            return false;
        } finally {
            setClaiming(false);
        }
    }, [contractAddress, chainCfg, account, sendTx, refresh]);

    return { eligible, alreadyClaimed, estimatedUsdc, loading, claiming, error, claim, refresh };
}
