'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

const hostRakePendingAbi = {
    name: 'hostRakePending',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
} as const;

const claimHostRakeAbi = {
    name: 'claimHostRake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
} as const;

export function useClaimHostRake(contractAddress: string | undefined, chainName: string | undefined) {
    const account = useActiveAccount();
    const sendOnChain = useChainBoundSend();

    const [pendingRake, setPendingRake] = useState<bigint | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;

    const readOnce = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !chainCfg) return null;
        const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
        return readContract({ contract, method: hostRakePendingAbi, params: [] });
    }, [contractAddress, chainCfg]);

    const refresh = useCallback(async () => {
        try {
            setPendingRake(await readOnce());
        } catch {
            setPendingRake(null);
        }
    }, [readOnce]);

    useEffect(() => { refresh(); }, [refresh]);

    const claim = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        // Nothing pending — don't send a wasted no-op tx on stale state.
        if (!pendingRake || pendingRake === BigInt(0)) return false;
        setClaiming(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({ contract, method: claimHostRakeAbi, params: [] });
            await sendOnChain(chainCfg.chain, tx);
            // Poll until the pending rake reads 0 — a single read right after the tx
            // can land on an RPC node a block behind and still show the old amount.
            for (let i = 0; i < 6; i++) {
                const amount = await readOnce().catch(() => null);
                if (amount !== null) {
                    setPendingRake(amount);
                    if (amount === BigInt(0)) break;
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
    }, [contractAddress, chainCfg, account, sendOnChain, readOnce, pendingRake]);

    return { pendingRake, claiming, error, claim, refresh };
}
