'use client';

import { Flex, Box, Container, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Footer from '../components/HomePage/Footer';
import PublicGamesHero from '../components/PublicGames/PublicGamesHero';
import PublicGamesGrid from '../components/PublicGames/PublicGamesGrid';
import EmptyState from '../components/PublicGames/EmptyState';
import { getPublicGames } from '../hooks/server_actions';
import type { PublicGame, FilterValue, SortKey, SortConfig } from '../components/PublicGames/types';
import { PAGE_SIZE, sortKeyToParam } from '../components/PublicGames/types';

const PublicPage = () => {
    const [games, setGames] = useState<PublicGame[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterValue>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const sortByParam = sortKeyToParam(sortConfig.key);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        getPublicGames({
            sortBy: sortByParam,
            order: sortConfig.direction,
            filter,
            limit: PAGE_SIZE,
            offset: 0,
        })
            .then((data) => {
                if (cancelled) return;
                if (data?.success && Array.isArray(data.games)) {
                    setGames(data.games);
                    setTotalCount(data.total_count ?? data.games.length);
                } else {
                    setError('Unable to load games. Please try again.');
                }
            })
            .catch(() => {
                if (!cancelled) setError('Unable to load games. Please try again.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, [filter, sortByParam, sortConfig.direction]);

    const handleSortChange = (key: SortKey) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            const data = await getPublicGames({
                sortBy: sortByParam,
                order: sortConfig.direction,
                filter,
                limit: PAGE_SIZE,
                offset: games.length,
            });
            if (data?.success && Array.isArray(data.games)) {
                setGames((prev) => [...prev, ...data.games]);
            }
        } catch {
            // silent — existing rows stay visible
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleRetry = () => {
        setSortConfig({ key: null, direction: 'asc' });
        setFilter('all');
    };

    return (
        <Flex direction="column" minH="100vh" bg="card.lightGray" position="relative" overflow="hidden">
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '120px', md: '160px' }}
                right={{ base: '-120px', md: '-80px' }}
                w={{ base: '240px', md: '320px' }}
                h={{ base: '240px', md: '320px' }}
                bg="brand.green"
                opacity={0.06}
                _dark={{ opacity: 0.14 }}
                borderRadius="full"
                filter="blur(40px)"
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '240px', md: '200px' }}
                left={{ base: '-120px', md: '-80px' }}
                w={{ base: '240px', md: '300px' }}
                h={{ base: '240px', md: '300px' }}
                bg="brand.pink"
                opacity={0.06}
                _dark={{ opacity: 0.14 }}
                borderRadius="40px"
                transform="rotate(12deg)"
                filter="blur(40px)"
            />

            <Box pt={{ base: 20, md: 24 }} pb={{ base: 10, md: 16 }} position="relative" zIndex={1}>
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <VStack spacing={{ base: 6, md: 8 }} w="full">
                        <PublicGamesHero />

                        {isLoading ? (
                            <EmptyState variant="loading" />
                        ) : error ? (
                            <EmptyState variant="error" onRetry={handleRetry} />
                        ) : games.length === 0 ? (
                            <EmptyState variant="empty" />
                        ) : (
                            <PublicGamesGrid
                                games={games}
                                totalCount={totalCount}
                                filter={filter}
                                onFilterChange={setFilter}
                                sortConfig={sortConfig}
                                onSortChange={handleSortChange}
                                hasMore={games.length < totalCount}
                                isLoadingMore={isLoadingMore}
                                onLoadMore={handleLoadMore}
                            />
                        )}
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

export default PublicPage;
