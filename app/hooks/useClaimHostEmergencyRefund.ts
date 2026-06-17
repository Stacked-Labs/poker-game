'use client';

import { useState, useEffect, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, CHAIN_CONFIG } from '../thirdwebclient';

const hostFundingDepositedAbi = {
    name: 'hostFundingDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
} as const;

const claimHostEmergencyRefundAbi = {
    name: 'claimHostEmergencyRefund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
} as const;

export interface HostEmergencyRefundState {
    depositUsdc: bigint | null; // host's reserved guarantee deposit (null = loading)
    claimed: boolean;           // had a balance this session, now zero
    loading: boolean;
    claiming: boolean;
    error: string | null;
    claim: () => Promise<boolean>;
    refresh: () => Promise<void>;
}

// When a tournament stalls past its advertised end, opening emergency refunds
// reserves the host's funded guarantee out of the player refund pool. This hook
// reads that reserved deposit and lets the host reclaim it via
// claimHostEmergencyRefund(). Active only in emergency_refund state, for the host.
export function useClaimHostEmergencyRefund(
    contractAddress: string | undefined,
    chainName: string | undefined,
    tournamentStatus: string | undefined,
    isHost: boolean,
): HostEmergencyRefundState {
    const account = useActiveAccount();
    const { mutateAsync: sendTx } = useSendAndConfirmTransaction();

    const [depositUsdc, setDepositUsdc] = useState<bigint | null>(null);
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chainCfg = chainName ? CHAIN_CONFIG[chainName] : undefined;
    const isEmergency = tournamentStatus === 'emergency_refund';

    const readOnce = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !chainCfg || !isEmergency || !isHost) return null;
        const contract = getContract({ client, chain: chainCfg.chain, address: contractAddress });
        return readContract({ contract, method: hostFundingDepositedAbi, params: [] });
    }, [contractAddress, chainCfg, isEmergency, isHost]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setDepositUsdc(await readOnce());
        } catch {
            setDepositUsdc(null);
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
            const tx = prepareContractCall({ contract, method: claimHostEmergencyRefundAbi, params: [] });
            await sendTx(tx);
            // Poll until the reserved deposit reads 0 — a single read right after the
            // tx can land on an RPC node a block behind and still show the old amount.
            for (let i = 0; i < 6; i++) {
                const amount = await readOnce().catch(() => null);
                if (amount !== null) {
                    setDepositUsdc(amount);
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

    return { depositUsdc, claimed, loading, claiming, error, claim, refresh };
}
