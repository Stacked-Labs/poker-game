'use client';

import { useCallback, useMemo } from 'react';
import { CHAIN_CONFIG } from '@/app/thirdwebclient';

type ChainName = string | undefined | null;

interface ExplorerBuilder {
    address: (addr: string) => string | null;
    tx: (hash: string) => string | null;
    block: (n: number | bigint) => string | null;
    token: (addr: string) => string | null;
    base: string | null;
}

const EXPLORER_BASE: Record<string, string> = {
    'base': 'https://basescan.org',
    'base-sepolia': 'https://sepolia.basescan.org',
};

function resolveBase(chain: ChainName): string | null {
    if (!chain) return null;
    const key = chain.toLowerCase().replace(/\s+/g, '-');
    return EXPLORER_BASE[key] ?? null;
}

export function buildExplorerUrls(chain: ChainName): ExplorerBuilder {
    const base = resolveBase(chain);
    return {
        base,
        address: (addr) => (base && addr ? `${base}/address/${addr}` : null),
        tx: (hash) => (base && hash ? `${base}/tx/${hash}` : null),
        block: (n) => (base ? `${base}/block/${n.toString()}` : null),
        token: (addr) => (base && addr ? `${base}/token/${addr}` : null),
    };
}

export function useExplorerUrl(chain: ChainName): ExplorerBuilder {
    const explorer = useMemo(() => buildExplorerUrls(chain), [chain]);
    return explorer;
}

export function useCopy(): (value: string) => Promise<boolean> {
    return useCallback(async (value: string) => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
        try {
            await navigator.clipboard.writeText(value);
            return true;
        } catch {
            return false;
        }
    }, []);
}

export function chainDisplayName(chain: ChainName): string | null {
    if (!chain) return null;
    const key = chain.toLowerCase().replace(/\s+/g, '-');
    if (key === 'base') return 'Base';
    if (key === 'base-sepolia') return 'Base Sepolia';
    return chain;
}

export function isChainConfigured(chain: ChainName): boolean {
    if (!chain) return false;
    const key = chain.toLowerCase().replace(/\s+/g, '-');
    return Boolean(CHAIN_CONFIG[key]);
}
