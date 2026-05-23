'use client';

import { Flex, Box, Container, VStack } from '@chakra-ui/react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Footer from '../components/HomePage/Footer';
import PublicGamesHero from '../components/PublicGames/PublicGamesHero';
import PublicGamesGrid from '../components/PublicGames/PublicGamesGrid';
import EmptyState from '../components/PublicGames/EmptyState';
import FilterRail from '../components/PublicGames/FilterRail';
import FormatTabs, { isGameFormat, type GameFormat } from '../components/PublicGames/FormatTabs';
import TournamentsPlaceholder from '../components/PublicGames/TournamentsPlaceholder';
import { getPublicGames } from '../hooks/server_actions';
import type {
    PublicGame,
    FilterValue,
    StakeFilter as StakeFilterValue,
    SortKey,
    SortConfig,
} from '../components/PublicGames/types';
import { PAGE_SIZE, sortKeyToParam, stakeTier } from '../components/PublicGames/types';

const PublicPageInner = () => {
    const [games, setGames] = useState<PublicGame[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterValue>('all');
    const [stake, setStake] = useState<StakeFilterValue>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'seats', direction: 'desc' });

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const formatParam = searchParams?.get('format');
    const format: GameFormat = isGameFormat(formatParam) ? formatParam : 'cash';

    const handleFormatChange = useCallback(
        (next: GameFormat) => {
            const params = new URLSearchParams(searchParams?.toString() ?? '');
            if (next === 'cash') params.delete('format');
            else params.set('format', next);
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [router, pathname, searchParams]
    );

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
                if (!cancelled) {
                    setIsLoading(false);
                    setHasLoadedOnce(true);
                }
            });
        return () => { cancelled = true; };
    }, [filter, sortByParam, sortConfig.direction]);

    const visibleGames = useMemo(() => {
        if (stake === 'all' || filter === 'free') return games;
        return games.filter((g) => g.is_crypto && stakeTier(g) === stake);
    }, [games, stake, filter]);

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
            // existing rows stay visible
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleRetry = () => {
        setSortConfig({ key: 'seats', direction: 'desc' });
        setFilter('all');
        setStake('all');
    };

    return (
        <Flex direction="column" minH="100vh" bg="card.lightGray">
            <Box pt={{ base: 20, md: 24 }} pb={{ base: 10, md: 16 }}>
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <VStack spacing={{ base: 6, md: 8 }} w="full" align="stretch">
                        <PublicGamesHero
                            games={visibleGames}
                            totalCount={hasLoadedOnce ? totalCount : null}
                        />

                        <FormatTabs format={format} onChange={handleFormatChange} />

                        {format === 'cash' ? (
                            <>
                                <FilterRail
                                    totalCount={hasLoadedOnce ? totalCount ?? 0 : null}
                                    filter={filter}
                                    onFilterChange={setFilter}
                                    stake={stake}
                                    onStakeChange={setStake}
                                />

                                <Box minH={{ base: '420px', md: '520px' }}>
                                    {isLoading ? (
                                        <EmptyState variant="loading" />
                                    ) : error ? (
                                        <EmptyState variant="error" onRetry={handleRetry} />
                                    ) : visibleGames.length === 0 ? (
                                        <EmptyState variant="empty" />
                                    ) : (
                                        <PublicGamesGrid
                                            games={visibleGames}
                                            sortConfig={sortConfig}
                                            onSortChange={handleSortChange}
                                            hasMore={games.length < (totalCount ?? 0)}
                                            isLoadingMore={isLoadingMore}
                                            onLoadMore={handleLoadMore}
                                        />
                                    )}
                                </Box>
                            </>
                        ) : (
                            <TournamentsPlaceholder />
                        )}
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

const PublicPage = () => (
    <Suspense fallback={<Box minH="100vh" bg="card.lightGray" />}>
        <PublicPageInner />
    </Suspense>
);

export default PublicPage;
