'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Box,
    Text,
    HStack,
    Icon,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
} from '@chakra-ui/react';
import BoardTable from './BoardTable';
import TopHostsBoard from './TopHostsBoard';
import { BOARD_ICON } from './boardIcons';
import {
    getBoards,
    getBoard,
    type BoardMeta,
    type BoardId,
    type BoardResponse,
} from '@/app/hooks/server_actions';

const PAGE_SIZE = 50;

// Static fallback so the hub still renders if the metadata endpoint is unreachable. Mirrors the
// poker-server board registry (order + icons).
const FALLBACK_BOARDS: BoardMeta[] = [
    { id: 'points', title: 'Points', icon: '🏆', value_kind: 'points', real_money: false, available: true },
    { id: 'hands', title: 'Most Hands', icon: '♠', value_kind: 'count', real_money: false, available: true },
    { id: 'tournaments_won', title: 'Tournaments Won', icon: '🥇', value_kind: 'count', real_money: false, available: true },
    { id: 'top_hosts', title: 'Top Hosts', icon: '🎟', value_kind: 'usdc', real_money: true, available: true },
    { id: 'referrals', title: 'Most Referrals', icon: '🤝', value_kind: 'count', real_money: false, available: false },
];

export interface StatsHubProps {
    currentAddress?: string;
}

// The Stats Hub (Viral §2 / #350): one page, several filterable boards, absorbing today's
// /leaderboard. Each board is ranked + paginated with the signed-in player's position pinned, and
// every row links to the player's public profile (Section 1). The Top Hosts tab embeds the
// reusable billboard (#351).
const StatsHub: React.FC<StatsHubProps> = ({ currentAddress }) => {
    const [boards, setBoards] = useState<BoardMeta[]>(FALLBACK_BOARDS);
    const [activeIndex, setActiveIndex] = useState(0);

    // Per-board fetched state, keyed by board id.
    const [data, setData] = useState<Record<string, BoardResponse | null>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let cancelled = false;
        getBoards().then((list) => {
            if (!cancelled && list.length > 0) setBoards(list);
        });
        return () => { cancelled = true; };
    }, []);

    // Deep link: /leaderboard?board=referrals selects that tab once it's known (boards resolve
    // async, so reapply when the list updates). Only honored on first load — never overrides clicks.
    const deepLinkApplied = useRef(false);
    useEffect(() => {
        if (deepLinkApplied.current) return;
        const want = new URLSearchParams(window.location.search).get('board');
        if (!want) {
            deepLinkApplied.current = true;
            return;
        }
        const idx = boards.findIndex((b) => b.id === want);
        if (idx >= 0) {
            setActiveIndex(idx);
            deepLinkApplied.current = true;
        }
    }, [boards]);

    const loadBoard = useCallback(
        async (board: BoardId) => {
            setLoading((s) => ({ ...s, [board]: true }));
            const res = await getBoard(board, { page: 1, limit: PAGE_SIZE, address: currentAddress });
            setData((s) => ({ ...s, [board]: res }));
            setLoading((s) => ({ ...s, [board]: false }));
        },
        [currentAddress]
    );

    const loadMore = useCallback(
        async (board: BoardId) => {
            const current = data[board];
            if (!current) return;
            setLoadingMore((s) => ({ ...s, [board]: true }));
            const next = await getBoard(board, {
                page: current.page + 1,
                limit: PAGE_SIZE,
                address: currentAddress,
            });
            setData((s) => ({
                ...s,
                [board]: { ...next, rows: [...current.rows, ...next.rows] },
            }));
            setLoadingMore((s) => ({ ...s, [board]: false }));
        },
        [data, currentAddress]
    );

    // Load the active board, and refetch it when the signed-in wallet changes.
    // One effect (not two) so the visible board is always (re)loaded after a wallet
    // change: the previous split cleared `data` on address change but only reloaded on
    // `activeBoard` change, so the default tab stayed empty on first load until the user
    // switched tabs (the address resolves from undefined → wallet AFTER the first fetch).
    const activeBoard = boards[activeIndex]?.id;
    const loadedAddrRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!activeBoard) return;
        const walletChanged = loadedAddrRef.current !== currentAddress;
        if (walletChanged) {
            loadedAddrRef.current = currentAddress;
            setData({}); // every board's pinned "your position" is now stale
            loadBoard(activeBoard); // refetch the visible board with the new wallet
        } else if (data[activeBoard] === undefined) {
            loadBoard(activeBoard); // first visit to this tab (cache miss)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeBoard, currentAddress]);

    return (
        <Box width="100%">
            <Tabs
                index={activeIndex}
                onChange={setActiveIndex}
                variant="unstyled"
                isLazy
                lazyBehavior="keepMounted"
            >
                <TabList
                    bg="card.white"
                    borderRadius="14px"
                    p="6px"
                    mb={5}
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                    boxShadow="card.lift"
                    gap={1}
                    overflowX="auto"
                    sx={{
                        scrollbarWidth: 'none',
                        '::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {boards.map((b) => (
                        <Tab
                            key={b.id}
                            flexShrink={0}
                            fontSize={{ base: 'xs', md: 'sm' }}
                            py={2}
                            px={{ base: 3, md: 5 }}
                            fontWeight={700}
                            letterSpacing="0.02em"
                            color="text.secondary"
                            borderRadius="10px"
                            whiteSpace="nowrap"
                            transition="background-color 80ms ease, color 80ms ease, transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1)"
                            _hover={{ bg: 'bg.navyTint', color: 'text.primary' }}
                            _selected={{
                                color: 'white',
                                bg: 'brand.green',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #22674E',
                            }}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                            _active={{ transform: 'translateY(1px)' }}
                        >
                            <HStack spacing={1.5}>
                                {BOARD_ICON[b.id] ? (
                                    <Icon as={BOARD_ICON[b.id]} boxSize="13px" aria-hidden />
                                ) : (
                                    <Text as="span" aria-hidden>
                                        {b.icon}
                                    </Text>
                                )}
                                <Text as="span" color="inherit">{b.title}</Text>
                            </HStack>
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>
                    {boards.map((b) => (
                        <TabPanel key={b.id} px={0} py={0}>
                            {b.id === 'top_hosts' ? (
                                <TopHostsBoard
                                    data={data[b.id] ?? null}
                                    loading={!!loading[b.id]}
                                    currentAddress={currentAddress}
                                    onLoadMore={() => loadMore(b.id)}
                                    loadingMore={!!loadingMore[b.id]}
                                />
                            ) : (
                                <>
                                    <BoardTable
                                        data={data[b.id] ?? null}
                                        loading={!!loading[b.id]}
                                        currentAddress={currentAddress}
                                        onLoadMore={() => loadMore(b.id)}
                                        loadingMore={!!loadingMore[b.id]}
                                    />
                                    {data[b.id]?.note && (data[b.id]?.rows.length ?? 0) > 0 && (
                                        <Text fontSize="2xs" color="text.secondary" textAlign="center" pt={3} opacity={0.7}>
                                            {data[b.id]?.note}
                                        </Text>
                                    )}
                                </>
                            )}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default StatsHub;
