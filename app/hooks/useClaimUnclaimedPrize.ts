'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';

const claimableAbi = {
    name: 'claimable',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'winner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
} as const;

const claimUnclaimedPrizeAbi = {
    name: 'claimUnclaimedPrize',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
} as const;

export interface UnclaimedPrizeState {
    claimableUsdc: bigint | null; // null = loading / not applicable
    claimed: boolean;             // had a balance this session, now zero
    loading: boolean;
    claiming: boolean;
    error: string | null;
    claim: () => Promise<boolean>;
    refresh: () => Promise<void>;
}

// At settlement, the contract pushes each winner's prize directly; only a failed
// push is parked in claimable[winner] for the winner to pull later. This hook reads
// that balance and pulls it via claimUnclaimedPrize(). Active only once the
// tournament is completed — claimable is always zero before then.
export function useClaimUnclaimedPrize(
    contractAddress: string | undefined,
    chainName: string | undefined,
    tournamentStatus: string | undefined,
): UnclaimedPrizeState {
    const account = useActiveAccount();
    const { mutateAsync: sendTx } = useSendAndConfirmTransaction();

    const [claimableUsdc, setClaimableUsdc] = useState<bigint | null>(null);
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;
    const isCompleted = tournamentStatus === 'completed';

    const readOnce = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !chainCfg || !account || !isCompleted) return null;
        const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
        return readContract({ contract, method: claimableAbi, params: [account.address] });
    }, [contractAddress, chainCfg, account, isCompleted]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setClaimableUsdc(await readOnce());
        } catch {
            setClaimableUsdc(null);
        } finally {
            setLoading(false);
        }
    }, [readOnce]);

    useEffect(() => { refresh(); }, [refresh]);

    const claim = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        setClaiming(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({ contract, method: claimUnclaimedPrizeAbi, params: [] });
            await sendTx(tx);
            // Poll until the claimable balance reads 0 — a single read right after the
            // tx can land on an RPC node a block behind and still show the old amount.
            for (let i = 0; i < 6; i++) {
                const amount = await readOnce().catch(() => null);
                if (amount !== null) {
                    setClaimableUsdc(amount);
                    if (amount === BigInt(0)) {
                        setClaimed(true);
                        break;
                    }
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
    }, [contractAddress, chainCfg, account, sendTx, readOnce]);

    return { claimableUsdc, claimed, loading, claiming, error, claim, refresh };
}
