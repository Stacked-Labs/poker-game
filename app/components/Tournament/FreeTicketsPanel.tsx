'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import useToastHelper from '../../hooks/useToastHelper';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import {
    createFreeCode,
    getFreeTickets,
    type FreeTicketCode,
    type FreeTicketsPanelData,
} from '../../hooks/server_actions';
import FreeTicketsPanelView from './FreeTicketsPanelView';

interface FreeTicketsPanelProps {
    tournamentId: number;
    /** Row-chip ground, supplied by the page so the panel matches its card system. */
    rowBg?: string;
}

// Host-only Free Tickets panel (§3.1) — data container. Fetches the config,
// links, and counters, then renders the flattened presentational section.
export default function FreeTicketsPanel({
    tournamentId,
    rowBg = 'bg.pillNeutral',
}: FreeTicketsPanelProps) {
    const toast = useToastHelper();
    const { copy } = useCopyToClipboard();
    const [data, setData] = useState<FreeTicketsPanelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingTag, setCreatingTag] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            setData(await getFreeTickets(tournamentId));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        void load();
    }, [load]);

    const onCopy = useCallback(
        async (code: FreeTicketCode) => {
            const url =
                code.share_url ||
                `${typeof window !== 'undefined' ? window.location.origin : ''}${code.claim_path}`;
            if (await copy(url)) {
                setCopiedId(code.id);
                window.setTimeout(() => setCopiedId(null), 1500);
            }
        },
        [copy]
    );

    const onAddTag = useCallback(
        async (tag: 'x' | 'discord' | 'tg' | 'custom') => {
            setCreatingTag(tag);
            try {
                await createFreeCode(tournamentId, tag);
                await load();
            } catch (e) {
                toast.error(
                    e instanceof Error ? e.message : 'Could not create link'
                );
            } finally {
                setCreatingTag(null);
            }
        },
        [tournamentId, load, toast]
    );

    if (loading) {
        return (
            <Flex justify="center" py={8}>
                <Spinner aria-label="Loading free tickets" />
            </Flex>
        );
    }
    if (error || !data) {
        return (
            <Text color="text.muted" fontSize="sm">
                {error ?? 'Free tickets unavailable.'}
            </Text>
        );
    }

    return (
        <FreeTicketsPanelView
            data={data}
            rowBg={rowBg}
            copiedId={copiedId}
            creatingTag={creatingTag}
            onCopy={onCopy}
            onAddTag={onAddTag}
        />
    );
}
