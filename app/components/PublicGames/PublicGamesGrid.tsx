'use client';

import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Button,
    Badge,
    SimpleGrid,
} from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';
import type { PublicGame, FilterValue, SortKey, SortConfig } from './types';
import PublicGameCard from './PublicGameCard';
import FilterBar from './FilterBar';
import SortHeader from './SortHeader';

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

function getFeaturedGames(games: PublicGame[]): PublicGame[] {
    const candidates = games.filter(
        (g) => g.is_active && g.player_count / g.max_players >= 0.7
    );
    if (candidates.length > 0) {
        return candidates
            .sort((a, b) => b.player_count / b.max_players - a.player_count / a.max_players)
            .slice(0, 3);
    }
    const bySpectators = games
        .filter((g) => g.spectator_count > 0)
        .sort((a, b) => b.spectator_count - a.spectator_count);
    return bySpectators.slice(0, 3);
}

interface PublicGamesGridProps {
    games: PublicGame[];
    totalCount: number;
    filter: FilterValue;
    onFilterChange: (f: FilterValue) => void;
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export default function PublicGamesGrid({
    games,
    totalCount,
    filter,
    onFilterChange,
    sortConfig,
    onSortChange,
    hasMore,
    isLoadingMore,
    onLoadMore,
}: PublicGamesGridProps) {
    const featured = getFeaturedGames(games);
    const featuredNames = new Set(featured.map((g) => g.name));
    const remainingGames = games.filter((g) => !featuredNames.has(g.name));

    return (
        <VStack w="full" spacing={{ base: 6, md: 8 }}>
            {/* Featured row */}
            {featured.length > 0 && (
                <VStack w="full" spacing={3} align="start">
                    <HStack spacing={2} align="center">
                        <FiTrendingUp size={16} color="var(--chakra-colors-brand-pink)" />
                        <Heading
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="bold"
                            color="text.primary"
                        >
                            Featured Tables
                        </Heading>
                        <Badge
                            bg="rgba(235, 11, 92, 0.12)"
                            color="brand.pink"
                            _dark={{ bg: 'rgba(235, 11, 92, 0.18)' }}
                            borderRadius="full"
                            px={2}
                            fontSize="2xs"
                            fontWeight="bold"
                            backdropFilter="blur(8px)"
                        >
                            {featured.length}
                        </Badge>
                    </HStack>
                    <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        gap={4}
                        w="full"
                    >
                        {featured.map((game) => (
                            <PublicGameCard key={game.name} game={game} variant="featured" />
                        ))}
                    </SimpleGrid>
                </VStack>
            )}

            {/* All games section */}
            <VStack w="full" spacing={{ base: 4, md: 5 }}>
                <HStack justify="space-between" align="center" w="full" spacing={4}>
                    <HStack spacing={3} align="center">
                        <Heading
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="extrabold"
                            color="text.primary"
                        >
                            All Public Games
                        </Heading>
                        <Badge
                            bg="rgba(54, 163, 123, 0.12)"
                            color="brand.green"
                            _dark={{ bg: 'rgba(54, 163, 123, 0.2)' }}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                            letterSpacing="0.08em"
                            backdropFilter="blur(8px)"
                        >
                            {totalCount}
                        </Badge>
                    </HStack>
                    <FilterBar filter={filter} onFilterChange={onFilterChange} />
                </HStack>

                <Box
                    w="full"
                    bg="card.white"
                    borderRadius="20px"
                    boxShadow="glass"
                    overflow="hidden"
                    _dark={{
                        bg: 'legacy.grayLight',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <SortHeader sortConfig={sortConfig} onSortChange={onSortChange} />

                    <Box position="relative">
                        <VStack
                            w="full"
                            spacing={{ base: 1.5, md: 2 }}
                            maxH={{ base: 'none', lg: '680px' }}
                            overflowY={{ base: 'visible', lg: 'auto' }}
                            px={{ base: 3, md: 6 }}
                            py={{ base: 2, md: 4 }}
                            pr={{ base: 3, lg: 6 }}
                            sx={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(12, 21, 49, 0.25) transparent',
                                '&::-webkit-scrollbar': { width: '10px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(12, 21, 49, 0.25)',
                                    borderRadius: '999px',
                                    border: '3px solid transparent',
                                    backgroundClip: 'content-box',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: 'rgba(12, 21, 49, 0.4)',
                                    backgroundClip: 'content-box',
                                },
                                '.chakra-ui-dark &': {
                                    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: 'rgba(255, 255, 255, 0.35)',
                                    },
                                },
                            }}
                        >
                            {(remainingGames.length > 0 ? remainingGames : games).map((game) => (
                                <PublicGameCard key={game.name} game={game} variant="compact" />
                            ))}
                        </VStack>
                    </Box>

                    {hasMore && (
                        <Flex
                            align="center"
                            justify="center"
                            px={{ base: 4, md: 6 }}
                            py={{ base: 3, md: 4 }}
                            bgGradient="linear(to-t, rgba(12, 21, 49, 0.04), transparent)"
                            _dark={{
                                bgGradient: 'linear(to-t, rgba(0, 0, 0, 0.15), transparent)',
                            }}
                        >
                            <Button
                                size="md"
                                borderRadius="12px"
                                bg="card.lightGray"
                                color="text.primary"
                                fontWeight="semibold"
                                textTransform="none"
                                boxShadow="btn-premium"
                                isLoading={isLoadingMore}
                                loadingText="Loading..."
                                onClick={onLoadMore}
                                _hover={{
                                    boxShadow: 'btn-premium-hover',
                                    transform: 'translateY(-1px)',
                                }}
                                _dark={{
                                    bg: 'legacy.grayDark',
                                    color: 'text.white',
                                    _hover: {
                                        bg: 'rgba(255, 255, 255, 0.08)',
                                        boxShadow: 'btn-premium-hover',
                                    },
                                }}
                                transition={TRANSITION}
                            >
                                Load more tables
                            </Button>
                        </Flex>
                    )}
                </Box>
            </VStack>
        </VStack>
    );
}
