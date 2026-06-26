'use client';

import React, { useEffect, useState } from 'react';
import { Box, Flex, VStack, HStack, Text, Button, Spinner, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import BoardRow from './BoardRow';
import { getBoard, type BoardResponse } from '@/app/hooks/server_actions';

// The recruitment centerpiece (Viral §2 / #351): a public board of real players earning real USDC
// by hosting (cash + tournament host fees combined), with a "Host a table" CTA. Honest social
// proof — the main marketing tool for driving hosting. Real-money only, never blurred with Free
// Play, never a guaranteed-return promise.
//
// Built reusable: the Stats Hub passes `data` + pagination handlers (hub-managed fetch); standalone
// surfaces (homepage module, share card) pass `selfFetch` + `limit` and the board fetches itself.
// `compact` drops the load-more affordance for an embedded preview.

export interface TopHostsBoardProps {
    // Hub-managed mode: the parent supplies the fetched page + handlers.
    data?: BoardResponse | null;
    loading?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    currentAddress?: string;
    // Standalone mode: fetch the board internally (e.g. homepage module / share card).
    selfFetch?: boolean;
    limit?: number;
    // Presentation
    compact?: boolean;
    showCta?: boolean;
}

const HEADLINE = 'Real players earning real USDC by hosting';
const SUBLINE = 'Earn ~1% of every pot you run.';

const TopHostsBoard: React.FC<TopHostsBoardProps> = ({
    data,
    loading,
    onLoadMore,
    loadingMore,
    currentAddress,
    selfFetch,
    limit = 10,
    compact,
    showCta = true,
}) => {
    const [selfData, setSelfData] = useState<BoardResponse | null>(null);
    const [selfLoading, setSelfLoading] = useState(false);

    useEffect(() => {
        if (!selfFetch) return;
        let cancelled = false;
        setSelfLoading(true);
        getBoard('top_hosts', { page: 1, limit, address: currentAddress }).then((res) => {
            if (!cancelled) {
                setSelfData(res);
                setSelfLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [selfFetch, limit, currentAddress]);

    const board = selfFetch ? selfData : data ?? null;
    const isLoading = selfFetch ? selfLoading : !!loading;
    const rows = board?.rows ?? [];
    const total = board?.total ?? 0;
    const hasMore = !compact && rows.length < total && !!onLoadMore;
    const normalizedCurrent = currentAddress?.toLowerCase();

    const player = board?.player ?? null;
    const playerInPage =
        player != null && rows.some((r) => r.wallet.toLowerCase() === player.wallet.toLowerCase());
    const showPinned = !compact && player != null && !playerInPage;

    return (
        <Box
            width="100%"
            bg="card.white"
            borderRadius="24px"
            boxShadow="0 14px 28px rgba(12, 21, 49, 0.08)"
            _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
            overflow="hidden"
        >
            {/* Marketing header — honest social proof, never a guaranteed-return promise. */}
            <Box
                px={{ base: 4, md: 6 }}
                pt={{ base: 4, md: 5 }}
                pb={{ base: 3, md: 4 }}
                bgGradient="linear(to-r, rgba(54,163,123,0.10), rgba(54,163,123,0.02))"
                _dark={{ bgGradient: 'linear(to-r, rgba(54,163,123,0.18), rgba(54,163,123,0.04))' }}
                borderBottom="1px solid"
                borderColor="border.lightGray"
                sx={{ '@media (prefers-reduced-motion: no-preference)': {} }}
            >
                <HStack spacing={2} mb={1}>
                    <Text fontSize={{ base: 'lg', md: 'xl' }}>🎟</Text>
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="extrabold" color="text.primary">
                        Top Hosts
                    </Text>
                </HStack>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="text.secondary">
                    {HEADLINE}
                </Text>
            </Box>

            {/* Board */}
            <Box px={{ base: 1, md: 2 }} py={{ base: 2, md: 3 }}>
                {isLoading ? (
                    <Flex justify="center" align="center" py={12}>
                        <Spinner size="lg" color="brand.green" thickness="3px" speed="0.7s" />
                    </Flex>
                ) : rows.length === 0 ? (
                    <Flex justify="center" align="center" py={10} px={4}>
                        <Text color="text.secondary" fontSize="sm" textAlign="center">
                            No hosts have earned yet — be the first to host and earn real USDC.
                        </Text>
                    </Flex>
                ) : (
                    <VStack spacing={1} align="stretch">
                        {rows.map((row) => (
                            <BoardRow
                                key={`${row.wallet}-${row.rank}`}
                                row={row}
                                isCurrent={row.wallet.toLowerCase() === normalizedCurrent}
                            />
                        ))}
                        {hasMore && (
                            <Flex justify="center" py={3}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="text.secondary"
                                    isLoading={loadingMore}
                                    onClick={onLoadMore}
                                    _hover={{ bg: 'card.lightGray', _dark: { bg: 'legacy.grayDark' } }}
                                >
                                    Load more
                                </Button>
                            </Flex>
                        )}
                    </VStack>
                )}
            </Box>

            {showPinned && player && (
                <Box px={{ base: 1, md: 2 }} pb={2}>
                    <Box
                        bg="card.lightGray"
                        _dark={{ bg: 'legacy.grayDark' }}
                        borderRadius="14px"
                        border="1px solid"
                        borderColor="brand.green"
                    >
                        <BoardRow row={player} isCurrent pinned />
                    </Box>
                </Box>
            )}

            {/* CTA — drive hosting. Outcome framing, not a vendor or a guarantee. */}
            {showCta && (
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align={{ base: 'stretch', sm: 'center' }}
                    justify="space-between"
                    gap={3}
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 4 }}
                    borderTop="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                >
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold" color="text.primary">
                        {SUBLINE}
                    </Text>
                    <Button
                        as={NextLink}
                        href="/create-game"
                        size="md"
                        bg="brand.green"
                        color="white"
                        rightIcon={<Icon as={FaArrowRight} boxSize="12px" />}
                        flexShrink={0}
                        _hover={{ bg: 'brand.green', opacity: 0.92, transform: 'translateY(-1px)' }}
                        _active={{ transform: 'translateY(0)' }}
                        _focusVisible={{ boxShadow: '0 0 0 3px rgba(54, 163, 123, 0.45)' }}
                    >
                        Host a table
                    </Button>
                </Flex>
            )}

            {/* Honest framing footnote: real, past earnings — never implied future returns. */}
            {!compact && rows.length > 0 && (
                <Text fontSize="2xs" color="text.secondary" textAlign="center" px={4} pb={3} opacity={0.7}>
                    Earnings are real host fees from cash games and tournaments. Real-money only.
                </Text>
            )}
        </Box>
    );
};

export default TopHostsBoard;
