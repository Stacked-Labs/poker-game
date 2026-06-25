'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Input,
    Progress,
    Spinner,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiCheck, FiCopy, FiPlus } from 'react-icons/fi';
import useToastHelper from '../../hooks/useToastHelper';
import {
    createFreeCode,
    getFreeTickets,
    type FreeTicketCode,
    type FreeTicketsPanelData,
} from '../../hooks/server_actions';

interface FreeTicketsPanelProps {
    tournamentId: number;
}

const TAG_OPTIONS: { tag: 'x' | 'discord' | 'tg' | 'custom'; label: string }[] = [
    { tag: 'x', label: '+X' },
    { tag: 'discord', label: '+Discord' },
    { tag: 'tg', label: '+TG' },
    { tag: 'custom', label: '+Custom' },
];

function shareUrl(code: FreeTicketCode): string {
    if (code.share_url) return code.share_url;
    const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${code.claim_path}`;
}

/**
 * Host-only Free Tickets panel (Viral §3.1). Shows the cap + multiplier, the public share
 * link, channel-tagged tracking links, and live claim counters. Rendered only when the
 * connected wallet is the tournament's Host.
 */
export default function FreeTicketsPanel({
    tournamentId,
}: FreeTicketsPanelProps) {
    const toast = useToastHelper();
    const [data, setData] = useState<FreeTicketsPanelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingTag, setCreatingTag] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const cardBg = useColorModeValue('white', 'whiteAlpha.50');
    const borderCol = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
    const rowBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');

    const load = useCallback(async () => {
        try {
            setError(null);
            const d = await getFreeTickets(tournamentId);
            setData(d);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        void load();
    }, [load]);

    const publicCode = useMemo(
        () => data?.codes.find((c) => c.code_type === 'public'),
        [data]
    );
    const taggedCodes = useMemo(
        () => data?.codes.filter((c) => c.code_type === 'tagged') ?? [],
        [data]
    );

    const copy = useCallback(
        async (code: FreeTicketCode) => {
            try {
                await navigator.clipboard.writeText(shareUrl(code));
                setCopiedId(code.id);
                window.setTimeout(() => setCopiedId(null), 1500);
                toast.success('Link copied');
            } catch {
                toast.error('Could not copy link');
            }
        },
        [toast]
    );

    const addTag = useCallback(
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
                <Spinner />
            </Flex>
        );
    }
    if (error || !data) {
        return (
            <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderCol}
                borderRadius="16px"
                p={5}
            >
                <Text color="text.muted" fontSize="sm">
                    {error ?? 'Free tickets unavailable.'}
                </Text>
            </Box>
        );
    }

    const capLabel = data.infinite ? '∞' : String(data.cap);
    const claimedPct =
        data.infinite || data.cap === 0
            ? 0
            : Math.min(100, Math.round((data.claimed / data.cap) * 100));

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderCol}
            borderRadius="16px"
            p={5}
        >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="md" fontWeight="bold" color="text.primary">
                    🎟 Free Tickets
                </Text>
                <Text fontSize="xs" color="text.muted">
                    Host panel
                </Text>
            </Flex>

            {/* Config */}
            <HStack spacing={6} mb={5} flexWrap="wrap">
                <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="text.muted">
                        Cap
                    </Text>
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        {capLabel}
                        {!data.infinite && (
                            <Text
                                as="span"
                                fontSize="xs"
                                color="text.muted"
                                ml={1}
                            >
                                free entries
                            </Text>
                        )}
                    </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="text.muted">
                        Codes per claimer
                    </Text>
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        {data.codes_per_claimer}
                    </Text>
                </VStack>
            </HStack>

            {/* Shareable link */}
            {publicCode && (
                <Box mb={4}>
                    <Text fontSize="xs" color="text.muted" mb={1.5}>
                        Shareable link
                    </Text>
                    <Flex
                        bg={rowBg}
                        borderRadius="10px"
                        px={3}
                        py={2}
                        align="center"
                        gap={2}
                    >
                        <Input
                            value={shareUrl(publicCode)}
                            isReadOnly
                            variant="unstyled"
                            fontSize="sm"
                            color="text.primary"
                        />
                        <IconButton
                            aria-label="Copy link"
                            size="sm"
                            variant="ghost"
                            icon={
                                copiedId === publicCode.id ? (
                                    <FiCheck />
                                ) : (
                                    <FiCopy />
                                )
                            }
                            onClick={() => copy(publicCode)}
                        />
                    </Flex>
                </Box>
            )}

            {/* Tagged tracking links */}
            <Box mb={5}>
                <Text fontSize="xs" color="text.muted" mb={2}>
                    Tagged links for tracking
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                    {TAG_OPTIONS.map((opt) => (
                        <Button
                            key={opt.tag}
                            size="sm"
                            variant="outline"
                            leftIcon={<FiPlus />}
                            isLoading={creatingTag === opt.tag}
                            onClick={() => addTag(opt.tag)}
                        >
                            {opt.label.replace('+', '')}
                        </Button>
                    ))}
                </HStack>
                {taggedCodes.length > 0 && (
                    <VStack align="stretch" spacing={2} mt={3}>
                        {taggedCodes.map((c) => (
                            <Flex
                                key={c.id}
                                bg={rowBg}
                                borderRadius="10px"
                                px={3}
                                py={2}
                                align="center"
                                gap={2}
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                    minW="60px"
                                >
                                    {c.source_tag}
                                </Text>
                                <Input
                                    value={shareUrl(c)}
                                    isReadOnly
                                    variant="unstyled"
                                    fontSize="sm"
                                    color="text.primary"
                                />
                                <IconButton
                                    aria-label="Copy tagged link"
                                    size="sm"
                                    variant="ghost"
                                    icon={
                                        copiedId === c.id ? (
                                            <FiCheck />
                                        ) : (
                                            <FiCopy />
                                        )
                                    }
                                    onClick={() => copy(c)}
                                />
                            </Flex>
                        ))}
                    </VStack>
                )}
            </Box>

            {/* Live counters */}
            <Box>
                <Flex justify="space-between" align="baseline" mb={1.5}>
                    <Text fontSize="xs" color="text.muted">
                        Claimed
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                        {data.claimed}
                        {!data.infinite && data.cap > 0
                            ? ` / ${data.cap}`
                            : ''}
                        <Text as="span" color="text.muted" ml={2}>
                            · Played {data.played}
                        </Text>
                    </Text>
                </Flex>
                {!data.infinite && data.cap > 0 && (
                    <Progress
                        value={claimedPct}
                        size="sm"
                        borderRadius="full"
                        colorScheme="green"
                        mb={2}
                    />
                )}
                <Text fontSize="xs" color="text.muted">
                    Codes in circulation: {data.codes_in_circulation}
                </Text>
            </Box>
        </Box>
    );
}
