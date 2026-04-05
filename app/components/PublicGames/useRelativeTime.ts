'use client';

import { useState, useEffect } from 'react';

function formatRelativeTime(dateStr: string, isActive: boolean): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 0) return isActive ? 'Running' : 'Just created';

    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (isActive) {
        if (hours > 0) return `Running ${hours}h ${remainingMinutes}m`;
        if (minutes > 0) return `Running ${minutes}m`;
        return 'Just started';
    }

    if (hours > 0) return `Created ${hours}h ${remainingMinutes}m ago`;
    if (minutes > 0) return `Created ${minutes}m ago`;
    return 'Just created';
}

export function useRelativeTime(dateStr: string, isActive: boolean): string {
    const [text, setText] = useState(() => formatRelativeTime(dateStr, isActive));

    useEffect(() => {
        setText(formatRelativeTime(dateStr, isActive));
        const id = setInterval(() => {
            setText(formatRelativeTime(dateStr, isActive));
        }, 60_000);
        return () => clearInterval(id);
    }, [dateStr, isActive]);

    return text;
}

export function isNewTable(createdAt: string): boolean {
    return Date.now() - new Date(createdAt).getTime() < 600_000;
}

export function isHotTable(spectatorCount: number, playerCount: number): boolean {
    return spectatorCount >= 3 || (spectatorCount > playerCount && spectatorCount > 0);
}

export function getSeatsLeft(playerCount: number, maxPlayers: number): number {
    return maxPlayers - playerCount;
}
