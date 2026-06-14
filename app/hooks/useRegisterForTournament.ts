'use client';

import { useState, useCallback } from 'react';
import { type Chain, getContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { approve, allowance } from 'thirdweb/extensions/erc20';
import { client } from '../thirdwebclient';
import { CHAIN_CONFIG } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';
import { registerForTournament, unregisterFromTournament, type Tournament } from './server_actions';

export type RegisterStatus = 'idle' | 'approving' | 'registering' | 'success' | 'error';

interface UseRegisterResult {
    register: (passwordCode?: string) => Promise<{ ok: boolean; txHash?: string; error?: string }>; // passwordCode only used for non-crypto
    reenter: (passwordCode?: string) => Promise<{ ok: boolean; txHash?: string; error?: string }>;
    unregister: () => Promise<{ ok: boolean; txHash?: string; error?: string }>;
    status: RegisterStatus;
    error: string | null;
    isLoading: boolean;
    reset: () => void;
}

export function useRegisterForTournament(tournament: Tournament | undefined): UseRegisterResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<RegisterStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const sendOnChain = useChainBoundSend();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    // True when this tournament requires on-chain interaction
    const isCrypto = !!(tournament && tournament.contract_address);

    const errMsg = (e: unknown, fallback: string) =>
        e instanceof Error ? e.message : fallback;

    const register = useCallback(async (passwordCode?: string): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
        if (!tournament) return { ok: false, error: 'No tournament' };

        if (!isCrypto) {
            try {
                setStatus('registering');
                const passwordCodeHash = passwordCode
                    ? '0x' + Buffer.from(passwordCode).toString('hex')
                    : undefined;
                await registerForTournament(tournament.id, passwordCodeHash ? { passwordCodeHash } : undefined);
                setStatus('success');
                return { ok: true };
            } catch (e) {
                const msg = errMsg(e, 'Registration failed');
                setError(msg); setStatus('error');
                return { ok: false, error: msg };
            }
        }

        if (!account) { const msg = 'Connect your wallet first'; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const chainName = tournament.chain ?? 'base-sepolia';
        const chainCfg = CHAIN_CONFIG[chainName];
        if (!chainCfg) { const msg = `Unknown chain: ${chainName}`; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const { chain, usdc: usdcAddress } = chainCfg;
        const contractAddress = tournament.contract_address!;
        const buyIn = BigInt(tournament.buy_in_usdc);

        try {
            const usdcContract = getContract({ client, chain, address: usdcAddress });
            const tournamentContract = getContract({ client, chain, address: contractAddress });

            const currentAllowance = await allowance({ contract: usdcContract, owner: account.address, spender: contractAddress });
            if (currentAllowance < buyIn) {
                setStatus('approving');
                await sendOnChain(chain, approve({ contract: usdcContract, spender: contractAddress, amountWei: buyIn }));
            }

            setStatus('registering');
            const receipt = await sendOnChain(chain, prepareContractCall({ contract: tournamentContract, method: 'function register(bytes calldata operatorSig)', params: ['0x'] }));
            setStatus('success');
            return { ok: true, txHash: receipt.transactionHash };
        } catch (e) {
            const msg = errMsg(e, 'Registration failed');
            setError(msg); setStatus('error');
            return { ok: false, error: msg };
        }
    }, [tournament, isCrypto, account, sendOnChain]);

    const reenter = useCallback(async (passwordCode?: string): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
        if (!tournament) return { ok: false, error: 'No tournament' };

        if (!isCrypto) {
            try {
                setStatus('registering');
                await registerForTournament(tournament.id);
                setStatus('success');
                return { ok: true };
            } catch (e) {
                const msg = errMsg(e, 'Re-entry failed');
                setError(msg); setStatus('error');
                return { ok: false, error: msg };
            }
        }

        if (!account) { const msg = 'Connect your wallet first'; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const chainName = tournament.chain ?? 'base-sepolia';
        const chainCfg = CHAIN_CONFIG[chainName];
        if (!chainCfg) { const msg = `Unknown chain: ${chainName}`; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const { chain, usdc: usdcAddress } = chainCfg;
        const contractAddress = tournament.contract_address!;
        const buyIn = BigInt(tournament.buy_in_usdc);

        try {
            const usdcContract = getContract({ client, chain, address: usdcAddress });
            const tournamentContract = getContract({ client, chain, address: contractAddress });

            const currentAllowance = await allowance({ contract: usdcContract, owner: account.address, spender: contractAddress });
            if (currentAllowance < buyIn) {
                setStatus('approving');
                await sendOnChain(chain, approve({ contract: usdcContract, spender: contractAddress, amountWei: buyIn }));
            }

            setStatus('registering');
            const receipt = await sendOnChain(chain, prepareContractCall({ contract: tournamentContract, method: 'function reEnter(bytes calldata operatorSig)', params: ['0x'] }));
            setStatus('success');
            return { ok: true, txHash: receipt.transactionHash };
        } catch (e) {
            const msg = errMsg(e, 'Re-entry failed');
            setError(msg); setStatus('error');
            return { ok: false, error: msg };
        }
    }, [tournament, isCrypto, account, sendOnChain]);

    const unregister = useCallback(async (): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
        if (!tournament) return { ok: false, error: 'No tournament' };

        if (!isCrypto) {
            try {
                setStatus('registering');
                await unregisterFromTournament(tournament.id);
                setStatus('success');
                return { ok: true };
            } catch (e) {
                const msg = errMsg(e, 'Unregister failed');
                setError(msg); setStatus('error');
                return { ok: false, error: msg };
            }
        }

        if (!account) { const msg = 'Connect your wallet first'; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const chainName = tournament.chain ?? 'base-sepolia';
        const chainCfg = CHAIN_CONFIG[chainName];
        if (!chainCfg) { const msg = `Unknown chain: ${chainName}`; setError(msg); setStatus('error'); return { ok: false, error: msg }; }

        const { chain } = chainCfg;

        try {
            const tournamentContract = getContract({ client, chain, address: tournament.contract_address! });
            setStatus('registering');
            const receipt = await sendOnChain(chain, prepareContractCall({ contract: tournamentContract, method: 'function unregister()', params: [] }));
            setStatus('success');
            return { ok: true, txHash: receipt.transactionHash };
        } catch (e) {
            const msg = errMsg(e, 'Unregister failed');
            setError(msg); setStatus('error');
            return { ok: false, error: msg };
        }
    }, [tournament, isCrypto, account, sendOnChain]);

    return {
        register,
        reenter,
        unregister,
        status,
        error,
        isLoading: status === 'approving' || status === 'registering',
        reset,
    };
}
