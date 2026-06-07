import { useEffect, useState } from 'react';
import type { Tournament } from '../../hooks/server_actions';

// Tournament money is stored as 6-decimal micro-USDC integers. Cash blinds use a
// different scale (chips), so these helpers live apart from types.ts on purpose.
const MICRO = 1_000_000;

export function formatUsdc(micro: number, opts: { decimals?: number } = {}): string {
    const value = (micro ?? 0) / MICRO;
    const decimals = opts.decimals ?? (Number.isInteger(value) ? 0 : 2);
    return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function isFreePlay(t: Tournament): boolean {
    return (t.buy_in_usdc ?? 0) === 0;
}

export function formatTournamentStart(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export function formatCountdown(diffMs: number): string {
    if (diffMs <= 0) return 'now';
    const totalMinutes = Math.floor(diffMs / 60_000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'under a minute';
}

// SSR-safe future countdown. `now` is null until mount so the server and first
// client render agree; the label fills in once mounted, then ticks.
export function useCountdown(targetIso: string, tickMs = 30_000) {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), tickMs);
        return () => clearInterval(id);
    }, [tickMs]);

    const target = new Date(targetIso).getTime();
    const valid = !Number.isNaN(target);
    const ready = now !== null && valid;
    const diffMs = ready ? target - (now as number) : 0;

    return {
        ready,
        diffMs,
        isPast: ready && diffMs <= 0,
        label: ready ? formatCountdown(diffMs) : '',
    };
}

export type StatusTone = 'open' | 'live' | 'done' | 'cancelled' | 'setup' | 'refund';

// Recreational-friendly labels for the backend's free-form status string.
export function getStatusDescriptor(status: string): { label: string; tone: StatusTone } {
    switch (status) {
        case 'registration':
            return { label: 'Registering', tone: 'open' };
        case 'running':
            return { label: 'Live', tone: 'live' };
        case 'completed':
            return { label: 'Final', tone: 'done' };
        case 'cancelled':
            return { label: 'Cancelled', tone: 'cancelled' };
        case 'pending':
            return { label: 'Not open yet', tone: 'setup' };
        case 'emergency_refund':
            return { label: 'Refunds open', tone: 'refund' };
        default:
            return {
                label: status ? status[0].toUpperCase() + status.slice(1) : 'Unknown',
                tone: 'setup',
            };
    }
}

// Finishing-position ordinal: 1 → "1st", 2 → "2nd", 11 → "11th".
export function ordinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

// Block-explorer origin for a tournament's chain (mainnet vs Sepolia testnet).
export function explorerBase(chain?: string): string {
    return chain === 'base'
        ? 'https://basescan.org'
        : 'https://sepolia.basescan.org';
}

// Hides ONLY the horizontal scrollbar while keeping a slim vertical one. In
// WebKit/Blink the scrollbar's `height` is the horizontal bar's thickness and
// `width` is the vertical bar's, so height:0 removes the (ugly) bottom bar and a
// styled thumb keeps vertical scrolling discoverable. Covers iOS Safari +
// Android/Chrome where dense tables scroll sideways on narrow screens; Firefox
// keeps native bars, but desktop tables fit so no horizontal bar shows there.
export const HIDE_X_SCROLLBAR_SX = {
    '&::-webkit-scrollbar': { height: '0px', width: '8px' },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(128, 128, 128, 0.4)',
        borderRadius: '4px',
    },
} as const;
