'use client';

import { Flex, Box, Container, VStack } from '@chakra-ui/react';
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Footer from '../components/HomePage/Footer';
import PublicGamesHero from '../components/PublicGames/PublicGamesHero';
import PublicGamesGrid from '../components/PublicGames/PublicGamesGrid';
import EmptyState from '../components/PublicGames/EmptyState';
import FilterRail from '../components/PublicGames/FilterRail';
import FormatTabs, {
    isGameFormat,
    type GameFormat,
} from '../components/PublicGames/FormatTabs';
import TournamentsList from '../components/PublicGames/TournamentsList';
import { getPublicGames, listTournaments } from '../hooks/server_actions';
import type {
    PublicGame,
    FilterValue,
    StakeFilter as StakeFilterValue,
    SortKey,
    SortConfig,
} from '../components/PublicGames/types';
import {
    PAGE_SIZE,
    isTournamentTable,
    sortKeyToParam,
    stakeTier,
} from '../components/PublicGames/types';

const PublicPageInner = () => {
    const [games, setGames] = useState<PublicGame[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterValue>('all');
    const [stake, setStake] = useState<StakeFilterValue>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'seats',
        direction: 'desc',
    });
    const [tournamentCount, setTournamentCount] = useState<number | undefined>(
        undefined
    );
    const autoLoadedFrom = useRef(-1);

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
            router.replace(qs ? `${pathname}?${qs}` : pathname, {
                scroll: false,
            });
        },
        [router, pathname, searchParams]
    );

    const sortByParam = sortKeyToParam(sortConfig.key);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        autoLoadedFrom.current = -1;
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
                if (!cancelled)
                    setError('Unable to load games. Please try again.');
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                    setHasLoadedOnce(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [filter, sortByParam, sortConfig.direction]);

    // Count of open + live tournaments, for the Tournaments tab badge.
    useEffect(() => {
        let cancelled = false;
        listTournaments()
            .then((data) => {
                if (cancelled) return;
                const open = (data?.tournaments ?? []).filter(
                    (t) => t.status !== 'completed' && t.status !== 'cancelled'
                ).length;
                setTournamentCount(open);
            })
            .catch(() => {
                /* leave the badge hidden on failure */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Tournament tables live under the Tournaments tab — keep them out of the
    // cash list, where they'd show as un-joinable mid-tournament rows.
    const cashGames = useMemo(
        () => games.filter((g) => !isTournamentTable(g.name)),
        [games]
    );

    const visibleGames = useMemo(() => {
        if (stake === 'all' || filter === 'free') return cashGames;
        return cashGames.filter((g) => g.is_crypto && stakeTier(g) === stake);
    }, [cashGames, stake, filter]);

    // Discount tournament tables we've filtered from the loaded page so the
    // "N tables live" count and the load-more gate track the cash list.
    const filteredOut = games.length - cashGames.length;
    const cashTotalCount =
        totalCount === null ? null : Math.max(0, totalCount - filteredOut);
    const hasMore = games.length < (totalCount ?? 0);

    const handleSortChange = (key: SortKey) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
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

    // A full page of /api/public-games can be entirely tournament tables (they
    // sort high while a multi-table tournament runs), leaving the cash list
    // empty with cash games still waiting on later pages. Pull the next page so
    // the empty state never traps the user with no Load More affordance.
    // autoLoadedFrom guards against looping if a page returns no new rows while
    // the server still reports more (e.g. a table closed mid-pagination).
    useEffect(() => {
        if (isLoading || isLoadingMore) return;
        if (visibleGames.length > 0 || !hasMore) return;
        if (autoLoadedFrom.current === games.length) return;
        autoLoadedFrom.current = games.length;
        handleLoadMore();
        // handleLoadMore is stable enough here — it only reads the values in deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, isLoadingMore, visibleGames.length, hasMore, games.length]);

    const handleRetry = () => {
        setSortConfig({ key: 'seats', direction: 'desc' });
        setFilter('all');
        setStake('all');
    };

    return (
        <Flex direction="column" minH="100vh" bg="card.lightGray">
            <Box pt={{ base: 20, md: 24 }} pb={{ base: 10, md: 16 }}>
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <VStack
                        spacing={{ base: 6, md: 8 }}
                        w="full"
                        align="stretch"
                    >
                        <PublicGamesHero />

                        <FormatTabs
                            format={format}
                            onChange={handleFormatChange}
                            tournamentCount={tournamentCount}
                        />

                        {format === 'cash' ? (
                            <>
                                <FilterRail
                                    totalCount={
                                        hasLoadedOnce
                                            ? (cashTotalCount ?? 0)
                                            : null
                                    }
                                    filter={filter}
                                    onFilterChange={setFilter}
                                    stake={stake}
                                    onStakeChange={setStake}
                                />

                                <Box minH={{ base: '420px', md: '520px' }}>
                                    {isLoading ? (
                                        <EmptyState variant="loading" />
                                    ) : error ? (
                                        <EmptyState
                                            variant="error"
                                            onRetry={handleRetry}
                                        />
                                    ) : visibleGames.length === 0 ? (
                                        // No visible cash games yet — but if more
                                        // pages are pending (e.g. this page was all
                                        // tournament tables) the auto-loader is
                                        // fetching them, so show loading, not empty.
                                        hasMore || isLoadingMore ? (
                                            <EmptyState variant="loading" />
                                        ) : (
                                            <EmptyState variant="empty" />
                                        )
                                    ) : (
                                        <PublicGamesGrid
                                            games={visibleGames}
                                            sortConfig={sortConfig}
                                            onSortChange={handleSortChange}
                                            hasMore={hasMore}
                                            isLoadingMore={isLoadingMore}
                                            onLoadMore={handleLoadMore}
                                        />
                                    )}
                                </Box>
                            </>
                        ) : (
                            <TournamentsList />
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
