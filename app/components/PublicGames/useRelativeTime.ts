'use client';

import { useState, useEffect } from 'react';

function formatRelativeTime(dateStr: string): string {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export function useRelativeTime(dateStr: string): string {
    const [text, setText] = useState(() => formatRelativeTime(dateStr));

    useEffect(() => {
        setText(formatRelativeTime(dateStr));
        const id = setInterval(() => {
            setText(formatRelativeTime(dateStr));
        }, 60_000);
        return () => clearInterval(id);
    }, [dateStr]);

    return text;
}
