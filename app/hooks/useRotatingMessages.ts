import { useEffect, useState } from 'react';

export function useRotatingMessages(
    messages: readonly string[],
    intervalMs: number,
    active: boolean
): string {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!active) {
            setIndex(0);
            return;
        }
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % messages.length);
        }, intervalMs);
        return () => clearInterval(id);
    }, [active, intervalMs, messages.length]);

    return messages[index] ?? messages[0] ?? '';
}
