'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    searchPlayers,
    type PlayerSearchResult,
} from '@/app/hooks/server_actions';
import PlayerSearchView from './PlayerSearchView';

// Find-a-player search (Viral §1 / #346) — data container. Debounced live search over the
// #344 API; keyboard-navigable (↑/↓/Enter/Esc). Rendering lives in PlayerSearchView.
export default function PlayerSearch({
    placeholder = 'Search players…',
    maxW = '320px',
}: {
    placeholder?: string;
    maxW?: string | object;
}) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PlayerSearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(-1);
    const boxRef = useRef<HTMLDivElement>(null);

    // Debounced search.
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        let active = true;
        const t = setTimeout(() => {
            searchPlayers(q)
                .then((r) => {
                    if (active) {
                        setResults(r);
                        setActive(-1);
                    }
                })
                .finally(() => active && setLoading(false));
        }, 300);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [query]);

    // Close on outside click.
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // Keep the highlighted row in view during keyboard navigation.
    useEffect(() => {
        if (active < 0) return;
        document
            .getElementById(`ps-opt-${active}`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const clear = () => {
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!open || results.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            clear();
            router.push(`/profile/${results[active].wallet}`);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <PlayerSearchView
            ref={boxRef}
            query={query}
            results={results}
            loading={loading}
            open={open && query.trim().length >= 2}
            active={active}
            placeholder={placeholder}
            maxW={maxW}
            onQueryChange={(v) => {
                setQuery(v);
                setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onRowMouseEnter={setActive}
            onRowClick={clear}
        />
    );
}
