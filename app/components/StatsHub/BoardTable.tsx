'use client';

import React from 'react';
import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react';
import BoardRow from './BoardRow';
import BoardRowsSkeleton from '@/app/components/Skeletons/BoardRowsSkeleton';
import type { BoardResponse } from '@/app/hooks/server_actions';

export interface BoardTableProps {
    data: BoardResponse | null;
    loading: boolean;
    currentAddress?: string;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    emptyText?: string;
}

// Generic ranked board: rows, your-position pinned, load-more pagination, and graceful
// loading/empty/unavailable states. Shared by every Stats Hub tab.
const BoardTable: React.FC<BoardTableProps> = ({
    data,
    loading,
    currentAddress,
    onLoadMore,
    loadingMore,
    emptyText,
}) => {
    const normalizedCurrent = currentAddress?.toLowerCase();
    const rows = data?.rows ?? [];
    const player = data?.player ?? null;
    const total = data?.total ?? 0;
    const hasMore = rows.length < total;

    // Pin the player only when they're outside the visible page (in-page rows already highlight).
    const playerInPage =
        player != null && rows.some((r) => r.wallet.toLowerCase() === player.wallet.toLowerCase());
    const showPinned = player != null && !playerInPage;

    if (loading) {
        return (
            <Box width="100%">
                <Box
                    width="100%"
                    bg="card.white"
                    borderRadius="20px"
                    boxShadow="card.lift"
                    py={{ base: 2, md: 3 }}
                    px={{ base: 1, md: 2 }}
                >
                    <BoardRowsSkeleton rows={6} />
                </Box>
            </Box>
        );
    }

    return (
        <Box width="100%">
            {/* "Your position" surfaced on top when the signed-in player is off the current page. */}
            {showPinned && player && (
                <Box
                    mb={3}
                    bg="card.white"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="brand.green"
                    boxShadow="card.lift"
                    px={{ base: 1, md: 2 }}
                    py={1}
                >
                    <HStack px={3} pt={2} pb={1}>
                        <Text fontSize="2xs" fontWeight={800} letterSpacing="0.12em" color="brand.green" textTransform="uppercase">
                            Your position
                        </Text>
                    </HStack>
                    <BoardRow row={player} isCurrent pinned />
                </Box>
            )}

            <Box
                width="100%"
                bg="card.white"
                borderRadius="20px"
                boxShadow="card.lift"
                py={{ base: 2, md: 3 }}
                px={{ base: 1, md: 2 }}
            >
                {data && !data.available && rows.length === 0 ? (
                    <Flex justify="center" align="center" py={12} px={4}>
                        <Text color="text.secondary" fontSize="sm" textAlign="center">
                            {data.note || 'This board is coming soon.'}
                        </Text>
                    </Flex>
                ) : rows.length === 0 ? (
                    <Flex justify="center" align="center" py={10} px={4}>
                        <Text color="text.secondary" fontSize="sm" textAlign="center">
                            {emptyText || 'No players on this board yet.'}
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

                        {hasMore && onLoadMore && (
                            <Flex justify="center" py={3}>
                                <Button
                                    size="sm"
                                    variant="tactileNeutral"
                                    isLoading={loadingMore}
                                    onClick={onLoadMore}
                                >
                                    Load more
                                </Button>
                            </Flex>
                        )}
                    </VStack>
                )}
            </Box>
        </Box>
    );
};

export default BoardTable;
