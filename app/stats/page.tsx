'use client';

import {
    Box,
    Text,
    Flex,
    Tooltip,
    VStack,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Spinner,
    IconButton,
} from '@chakra-ui/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
    verifyAdmin,
    getAdminStats,
    getAdminLiveStats,
    getAdminTables,
    getAdminHealth,
    getAdminSettlementHealth,
    getIndexerHealth,
    getAdminSBTWhitelist,
    type SBTWhitelistEntry,
} from '../hooks/server_actions';
import type {
    AdminStatsResponse,
    AdminLiveStatsResponse,
    AdminTablesResponse,
    AdminHealthResponse,
    SettlementHealthResponse,
    IndexerHealthData,
} from './types';
import { RefreshIcon } from '../components/Stats/Primitives';
import { StatsTab } from '../components/Stats/StatsTab';
import { TablesTab } from '../components/Stats/TablesTab';
import { HealthTab } from '../components/Stats/HealthTab';
import { WhitelistTab } from '../components/Stats/WhitelistTab';

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminStatsPage() {
    const now = new Date().toISOString();
    const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
    const [stats, setStats]       = useState<AdminStatsResponse | null>(null);
    const [totals, setTotals]     = useState<AdminStatsResponse | null>(null);
    const [live, setLive]         = useState<AdminLiveStatsResponse | null>(null);
    const [tables, setTables]     = useState<AdminTablesResponse | null>(null);
    const [health, setHealth]     = useState<AdminHealthResponse | null>(null);
    const [settle, setSettle]     = useState<SettlementHealthResponse | null>(null);
    const [indexer, setIndexer]         = useState<IndexerHealthData | null>(null);
    const [activityRake, setActivityRake] = useState<IndexerHealthData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch]         = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'crypto' | 'free'>('all');
    // Per-section chain filters
    const [activityChain, setActivityChain]       = useState<'base-sepolia' | 'base'>('base');
    const [handsChain, setHandsChain]             = useState<'base-sepolia' | 'base'>('base');
    const [indexerChain, setIndexerChain]         = useState<'base-sepolia' | 'base'>('base');
    const [settlementChain, setSettlementChain]   = useState<'base-sepolia' | 'base'>('base');
    const [tablesChain, setTablesChain]           = useState<'base-sepolia' | 'base' | 'all'>('all');

    // Whitelist tab state
    const [whitelist, setWhitelist]           = useState<SBTWhitelistEntry[]>([]);
    const [wlLoading, setWlLoading]           = useState(false);
    const [wlSearch, setWlSearch]             = useState('');
    const [wlTotal, setWlTotal]               = useState(0);
    const [wlTotalClaimed, setWlTotalClaimed] = useState(0);
    const [wlInputMode, setWlInputMode]       = useState<'paste' | 'csv'>('paste');
    const [wlPasteText, setWlPasteText]       = useState('');
    const [wlAdding, setWlAdding]             = useState(false);

    const activityChainRef   = useRef(activityChain);
    const handsChainRef      = useRef(handsChain);
    const indexerChainRef    = useRef(indexerChain);
    const settlementChainRef = useRef(settlementChain);
    const tablesChainRef     = useRef(tablesChain);
    useEffect(() => { activityChainRef.current   = activityChain;   }, [activityChain]);
    useEffect(() => { handsChainRef.current      = handsChain;      }, [handsChain]);
    useEffect(() => { indexerChainRef.current    = indexerChain;    }, [indexerChain]);
    useEffect(() => { settlementChainRef.current = settlementChain; }, [settlementChain]);
    useEffect(() => { tablesChainRef.current     = tablesChain;     }, [tablesChain]);

    const loadActivityData = useCallback(async (chain: 'base-sepolia' | 'base') => {
        const [statsResult, rakeResult] = await Promise.allSettled([
            getAdminStats(chain),
            getIndexerHealth(chain),
        ]);
        if (statsResult.status === 'fulfilled') setStats(statsResult.value);
        if (rakeResult.status === 'fulfilled') setActivityRake(rakeResult.value);
        return statsResult.status === 'fulfilled' ? statsResult.value : null;
    }, []);

    const loadHandsData = useCallback(async (chain: 'base-sepolia' | 'base') => {
        const result = await Promise.allSettled([getAdminStats(chain)]);
        if (result[0].status === 'fulfilled') setTotals(result[0].value);
    }, []);

    const loadIndexerData = useCallback(async (chain: 'base-sepolia' | 'base') => {
        const result = await Promise.allSettled([getIndexerHealth(chain)]);
        if (result[0].status === 'fulfilled') setIndexer(result[0].value);
    }, []);

    const loadSettlementData = useCallback(async (chain: 'base-sepolia' | 'base') => {
        const result = await Promise.allSettled([getAdminSettlementHealth(chain)]);
        if (result[0].status === 'fulfilled') setSettle(result[0].value);
    }, []);

    const loadTablesData = useCallback(async (chain: 'base-sepolia' | 'base' | 'all') => {
        const result = await Promise.allSettled([getAdminTables({ chain })]);
        if (result[0].status === 'fulfilled') setTables(result[0].value);
    }, []);

    const loadWhitelist = useCallback(async (search = '') => {
        setWlLoading(true);
        try {
            const data = await getAdminSBTWhitelist({ search });
            setWhitelist(data.entries);
            setWlTotal(data.total);
            setWlTotalClaimed(data.claimed);
        } finally {
            setWlLoading(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        const chainsMatch = handsChainRef.current === activityChainRef.current;
        await Promise.all([
            loadActivityData(activityChainRef.current).then((v) => {
                // Reuse the activity result for totals when both chain selectors agree,
                // avoiding a duplicate getAdminStats call on initial load.
                if (chainsMatch && v) setTotals(v);
            }),
            chainsMatch ? Promise.resolve() : loadHandsData(handsChainRef.current),
            loadIndexerData(indexerChainRef.current),
            loadSettlementData(settlementChainRef.current),
            loadTablesData(tablesChainRef.current),
            getAdminHealth().then((v) => setHealth(v)).catch(() => {}),
            getAdminLiveStats().then((v) => setLive(v)).catch(() => {}),
        ]);
        setRefreshing(false);
    }, [loadActivityData, loadHandsData, loadIndexerData, loadSettlementData, loadTablesData]);

    // Auth check on mount only.
    useEffect(() => {
        verifyAdmin().then((r) => {
            if (r.isAdmin) { setAuthState('authorized'); loadData(); loadWhitelist(); }
            else setAuthState('unauthorized');
        });
    }, [loadData, loadWhitelist]);

    useEffect(() => { if (authState === 'authorized') loadActivityData(activityChain); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityChain, loadActivityData]);
    useEffect(() => { if (authState === 'authorized') loadHandsData(handsChain); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handsChain, loadHandsData]);
    useEffect(() => { if (authState === 'authorized') loadIndexerData(indexerChain); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexerChain, loadIndexerData]);
    useEffect(() => { if (authState === 'authorized') loadSettlementData(settlementChain); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settlementChain, loadSettlementData]);
    useEffect(() => { if (authState === 'authorized') loadTablesData(tablesChain); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tablesChain, loadTablesData]);

    // Debounced whitelist search
    useEffect(() => {
        if (authState !== 'authorized') return;
        const t = setTimeout(() => loadWhitelist(wlSearch), 300);
        return () => clearTimeout(t);
    }, [wlSearch, authState]); // eslint-disable-line react-hooks/exhaustive-deps

    if (authState === 'loading') {
        return (
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="card.lightGray"
                _dark={{ bg: 'bg.charcoal' }}
            >
                <Spinner size="xl" color="brand.green" thickness="3px" speed="0.7s" />
            </Flex>
        );
    }

    if (authState === 'unauthorized') {
        return (
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="card.lightGray"
                _dark={{ bg: 'bg.charcoal' }}
                px={4}
            >
                <VStack
                    bg="card.white"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                    boxShadow="card.lift"
                    maxW="420px"
                    w="full"
                    px={8}
                    py={10}
                    gap={3}
                    textAlign="center"
                    position="relative"
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="3px"
                        bg="brand.pink"
                    />
                    <Text fontSize="xs" fontWeight="bold" letterSpacing="0.12em" textTransform="uppercase" color="brand.pink">
                        Restricted
                    </Text>
                    <Text fontSize="xl" fontWeight="extrabold" color="text.primary">
                        Admin only
                    </Text>
                    <Text fontSize="sm" color="text.secondary" _dark={{ color: 'whiteAlpha.700' }}>
                        This page is restricted to admin wallets. Connect an authorized wallet and try again.
                    </Text>
                </VStack>
            </Flex>
        );
    }

    const statsTs  = stats?.timestamp  ?? now;
    const tablesTs = tables?.timestamp ?? now;

    const filteredTables = (tables?.tables ?? []).filter((t) => {
        if (search) {
            const q = search.toLowerCase();
            const nameMatch   = t.name.toLowerCase().includes(q);
            const walletMatch = t.owner_wallet?.toLowerCase().includes(q);
            if (!nameMatch && !walletMatch) return false;
        }
        if (typeFilter === 'crypto' && !t.is_crypto) return false;
        if (typeFilter === 'free'   &&  t.is_crypto) return false;
        return true;
    });

    return (
        <Flex
            direction="column"
            bg="card.lightGray"
            _dark={{ bg: 'bg.charcoal' }}
            pt={{ base: 20, md: 24 }}
            pb={12}
            minH="100vh"
            align="center"
            w="100%"
            px={{ base: 4, md: 8, lg: 16 }}
        >
            {/* Header */}
            <Flex width="full" maxW="1200px" align="center" justify="space-between" mb={6}>
                <VStack align="start" gap={1}>
                    <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="extrabold" color="text.primary">
                        Admin Dashboard
                    </Text>
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        _dark={{ color: 'whiteAlpha.600' }}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        Last updated: {new Date(statsTs).toLocaleString()}
                    </Text>
                </VStack>
                <Tooltip label="Refresh all data" hasArrow>
                    <IconButton
                        aria-label="Refresh"
                        icon={<RefreshIcon />}
                        size="md"
                        variant="ghost"
                        isLoading={refreshing}
                        onClick={loadData}
                        color="text.secondary"
                        borderRadius="10px"
                        bg="card.white"
                        border="1px solid"
                        borderColor="border.lightGray"
                        boxShadow="card.lift"
                        _dark={{
                            borderColor: 'whiteAlpha.100',
                            _hover: { bg: 'whiteAlpha.100', color: 'white' },
                            _active: { bg: 'whiteAlpha.100', transform: 'translateY(1px)' },
                        }}
                        _hover={{ bg: 'btn.lightGray', color: 'text.primary' }}
                        _active={{ bg: 'btn.lightGray', transform: 'translateY(1px)' }}
                        _focusVisible={{ boxShadow: '0 0 0 3px rgba(54, 163, 123, 0.45)' }}
                    />
                </Tooltip>
            </Flex>

            <Tabs
                defaultIndex={0}
                width="full"
                maxW="1200px"
                size="md"
                variant="unstyled"
            >
                <TabList
                    bg="card.white"
                    borderRadius="12px"
                    p="6px"
                    mb={6}
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                    boxShadow="card.lift"
                    display="inline-flex"
                    gap={1}
                >
                    {[
                        { label: 'Stats',     accent: 'brand.green',   edge: '#22674E' },
                        { label: 'Tables',    accent: 'brand.pink',    edge: '#950839' },
                        { label: 'Health',    accent: 'brand.navy',    edge: '#1B2754' },
                        { label: 'Whitelist', accent: 'brand.yellow',  edge: '#B78900' },
                    ].map(({ label, accent, edge }) => (
                        <Tab
                            key={label}
                            fontSize="sm"
                            py={2}
                            px={6}
                            fontWeight={700}
                            letterSpacing="0.02em"
                            color="text.secondary"
                            borderRadius="8px"
                            transition="background-color 80ms ease, color 80ms ease, box-shadow 80ms ease, transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1)"
                            _hover={{ bg: 'rgba(0,0,0,0.04)', color: 'text.primary' }}
                            _dark={{ _hover: { bg: 'whiteAlpha.100', color: 'white' } }}
                            _selected={{
                                color: 'white',
                                bg: accent,
                                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 ${edge}`,
                            }}
                            _focusVisible={{ boxShadow: '0 0 0 3px rgba(54, 163, 123, 0.45)' }}
                            _active={{ transform: 'translateY(1px)' }}
                        >
                            {label}
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>

                    {/* ── Stats tab ── */}
                    <TabPanel px={0} py={0}>
                        <StatsTab
                            stats={stats}
                            totals={totals}
                            live={live}
                            activityRake={activityRake}
                            activityChain={activityChain}
                            setActivityChain={setActivityChain}
                            handsChain={handsChain}
                            setHandsChain={setHandsChain}
                        />
                    </TabPanel>

                    {/* ── Tables tab ── */}
                    <TabPanel px={0} py={0}>
                        <TablesTab
                            tables={tables}
                            tablesTs={tablesTs}
                            filteredTables={filteredTables}
                            search={search}
                            setSearch={setSearch}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            tablesChain={tablesChain}
                            setTablesChain={setTablesChain}
                        />
                    </TabPanel>

                    {/* ── Health tab ── */}
                    <TabPanel px={0} py={0}>
                        <HealthTab
                            health={health}
                            settle={settle}
                            indexer={indexer}
                            settlementChain={settlementChain}
                            setSettlementChain={setSettlementChain}
                            indexerChain={indexerChain}
                            setIndexerChain={setIndexerChain}
                        />
                    </TabPanel>

                    {/* ── Whitelist tab ── */}
                    <TabPanel px={0} py={0}>
                        <WhitelistTab
                            whitelist={whitelist}
                            wlLoading={wlLoading}
                            wlSearch={wlSearch}
                            setWlSearch={setWlSearch}
                            wlTotal={wlTotal}
                            wlTotalClaimed={wlTotalClaimed}
                            wlInputMode={wlInputMode}
                            setWlInputMode={setWlInputMode}
                            wlPasteText={wlPasteText}
                            setWlPasteText={setWlPasteText}
                            wlAdding={wlAdding}
                            setWlAdding={setWlAdding}
                            loadWhitelist={loadWhitelist}
                        />
                    </TabPanel>

                </TabPanels>
            </Tabs>
        </Flex>
    );
}
