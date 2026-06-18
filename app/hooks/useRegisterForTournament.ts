'use client';

import { useState, useCallback } from 'react';
import { type Chain, getContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { approve, allowance } from 'thirdweb/extensions/erc20';
import { client } from '../thirdwebclient';
import { CHAIN_CONFIG } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';
import { registerForTournament, unregisterFromTournament, getRegistrationPermit, type Tournament } from './server_actions';

export type RegisterStatus = 'idle' | 'approving' | 'registering' | 'success' | 'error';

interface UseRegisterResult {
    // passwordCodeHash is the SHA-256 hash of the access code (already hashed by the caller),
    // forwarded as-is to the backend. Only used for non-crypto (free-play) tournaments.
    register: (passwordCodeHash?: string) => Promise<{ ok: boolean; txHash?: string; error?: string }>;
    reenter: (passwordCodeHash?: string) => Promise<{ ok: boolean; txHash?: string; error?: string }>;
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

    const register = useCallback(async (passwordCodeHash?: string): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
        if (!tournament) return { ok: false, error: 'No tournament' };

        // In-flight guard: don't start a second register tx while one is running.
        if (status === 'approving' || status === 'registering') {
            return { ok: false, error: 'Registration already in progress' };
        }

        if (!isCrypto) {
            try {
                setStatus('registering');
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

            // Private crypto tournaments require an operator permit: the server
            // verifies the access code and signs a single-use authorisation bound
            // to this wallet's on-chain nonce. Open tournaments use empty bytes.
            let operatorSig: `0x${string}` = '0x';
            if (tournament.is_private) {
                if (!passwordCodeHash) { const msg = 'Access code required'; setError(msg); setStatus('error'); return { ok: false, error: msg }; }
                const { operator_sig } = await getRegistrationPermit(tournament.id, passwordCodeHash);
                operatorSig = operator_sig as `0x${string}`;
            }

            const currentAllowance = await allowance({ contract: usdcContract, owner: account.address, spender: contractAddress });
            if (currentAllowance < buyIn) {
                setStatus('approving');
                await sendOnChain(chain, approve({ contract: usdcContract, spender: contractAddress, amountWei: buyIn }));
            }

            setStatus('registering');
            const receipt = await sendOnChain(chain, prepareContractCall({ contract: tournamentContract, method: 'function register(bytes calldata operatorSig)', params: [operatorSig] }));
            setStatus('success');
            return { ok: true, txHash: receipt.transactionHash };
        } catch (e) {
            const msg = errMsg(e, 'Registration failed');
            setError(msg); setStatus('error');
            return { ok: false, error: msg };
        }
    }, [tournament, isCrypto, account, sendOnChain, status]);

    const reenter = useCallback(async (passwordCodeHash?: string): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
        if (!tournament) return { ok: false, error: 'No tournament' };

        // In-flight guard: don't start a second re-entry tx while one is running
        // (mirrors register()), so a double-fire can't trigger a second on-chain
        // buy-in on a real-money re-entry.
        if (status === 'approving' || status === 'registering') {
            return { ok: false, error: 'Re-entry already in progress' };
        }

        if (!isCrypto) {
            try {
                setStatus('registering');
                await registerForTournament(tournament.id, passwordCodeHash ? { passwordCodeHash } : undefined);
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

            // Private crypto tournaments require a fresh operator permit per entry
            // (the on-chain nonce advances after each registration), so re-entry
            // re-verifies the access code just like the initial registration.
            let operatorSig: `0x${string}` = '0x';
            if (tournament.is_private) {
                if (!passwordCodeHash) { const msg = 'Access code required'; setError(msg); setStatus('error'); return { ok: false, error: msg }; }
                const { operator_sig } = await getRegistrationPermit(tournament.id, passwordCodeHash);
                operatorSig = operator_sig as `0x${string}`;
            }

            const currentAllowance = await allowance({ contract: usdcContract, owner: account.address, spender: contractAddress });
            if (currentAllowance < buyIn) {
                setStatus('approving');
                await sendOnChain(chain, approve({ contract: usdcContract, spender: contractAddress, amountWei: buyIn }));
            }

            setStatus('registering');
            const receipt = await sendOnChain(chain, prepareContractCall({ contract: tournamentContract, method: 'function reEnter(bytes calldata operatorSig)', params: [operatorSig] }));
            setStatus('success');
            return { ok: true, txHash: receipt.transactionHash };
        } catch (e) {
            const msg = errMsg(e, 'Re-entry failed');
            setError(msg); setStatus('error');
            return { ok: false, error: msg };
        }
    }, [tournament, isCrypto, account, sendOnChain, status]);

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
