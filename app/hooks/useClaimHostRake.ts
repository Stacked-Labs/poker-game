'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';

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
    const { mutateAsync: sendTx } = useSendAndConfirmTransaction();

    const [pendingRake, setPendingRake] = useState<bigint | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;

    const refresh = useCallback(async () => {
        if (!contractAddress || !chainCfg) return;
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const amount = await readContract({ contract, method: hostRakePendingAbi, params: [] });
            setPendingRake(amount);
        } catch {
            setPendingRake(null);
        }
    }, [contractAddress, chainCfg]);

    useEffect(() => { refresh(); }, [refresh]);

    const claim = useCallback(async (): Promise<boolean> => {
        if (!contractAddress || !chainCfg || !account) return false;
        setClaiming(true);
        setError(null);
        try {
            const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
            const tx = prepareContractCall({ contract, method: claimHostRakeAbi, params: [] });
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

    return { pendingRake, claiming, error, claim, refresh };
}
