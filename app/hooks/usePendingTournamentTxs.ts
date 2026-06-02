'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'stacked:pending:tournament:txs';
const TTL_MS = 5 * 60 * 1000; // auto-expire after 5 minutes

export interface PendingTournamentTx {
    tournamentId: number;
    txHash: string;
    type: 'register' | 'unregister';
    chainName: string;
    submittedAt: number; // unix ms
}

function explorerTxUrl(chainName: string, txHash: string): string {
    if (chainName === 'base') return `https://basescan.org/tx/${txHash}`;
    return `https://sepolia.basescan.org/tx/${txHash}`;
}

function readFromStorage(): PendingTournamentTx[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const items: PendingTournamentTx[] = JSON.parse(raw);
        const now = Date.now();
        return items.filter((x) => now - x.submittedAt < TTL_MS);
    } catch {
        return [];
    }
}

function writeToStorage(items: PendingTournamentTx[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* localStorage may be unavailable in SSR or private browsing */ }
}

export function usePendingTournamentTxs() {
    const [pending, setPending] = useState<PendingTournamentTx[]>([]);

    // Load from storage once on mount
    useEffect(() => {
        setPending(readFromStorage());
    }, []);

    const add = useCallback((entry: Omit<PendingTournamentTx, 'submittedAt'>) => {
        const item: PendingTournamentTx = { ...entry, submittedAt: Date.now() };
        setPending((prev) => {
            const next = [
                ...prev.filter(
                    (x) => !(x.tournamentId === entry.tournamentId && x.type === entry.type)
                ),
                item,
            ];
            writeToStorage(next);
            return next;
        });
    }, []);

    const remove = useCallback((tournamentId: number, type?: 'register' | 'unregister') => {
        setPending((prev) => {
            const next = prev.filter(
                (x) => !(x.tournamentId === tournamentId && (!type || x.type === type))
            );
            writeToStorage(next);
            return next;
        });
    }, []);

    const getForTournament = useCallback(
        (tournamentId: number) => pending.find((x) => x.tournamentId === tournamentId),
        [pending]
    );

    const explorerUrl = useCallback(
        (tx: PendingTournamentTx) => explorerTxUrl(tx.chainName, tx.txHash),
        []
    );

    return { pending, add, remove, getForTournament, explorerUrl };
}
