'use client';

import {
    Text,
    Flex,
    Box,
    Tooltip,
    Badge,
    HStack,
    VStack,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Grid,
    Divider,
    Input,
    IconButton,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Button,
    Textarea,
} from '@chakra-ui/react';
import Link from 'next/link';
import EmergencyWithdrawAllButton from '../components/EmergencyWithdrawAllButton';
import { CHAIN_CONFIG, defaultChain } from '../thirdwebclient';
import { useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
    verifyAdmin,
    getAdminStats,
    getAdminLiveStats,
    getAdminTables,
    getAdminHealth,
    getAdminSettlementHealth,
    getIndexerHealth,
    getAdminSBTWhitelist,
    addToSBTWhitelist,
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

// ── Icons ──────────────────────────────────────────────────────────────────────

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const StatusDot = ({ ok }: { ok: boolean }) => (
    <Box
        display="inline-block"
        w="10px"
        h="10px"
        borderRadius="full"
        flexShrink={0}
        bg={ok ? 'brand.green' : 'brand.pink'}
        boxShadow={ok ? '0 0 8px rgba(54,163,123,0.7)' : '0 0 8px rgba(235,11,92,0.7)'}
    />
);

const ChainSelector = ({
    value,
    onChange,
}: {
    value: 'base' | 'base-sepolia';
    onChange: (v: 'base' | 'base-sepolia') => void;
}) => (
    <HStack gap={2}>
        {([
            { key: 'base' as const,         label: 'Base',         badge: 'Mainnet' },
            { key: 'base-sepolia' as const, label: 'Base Sepolia', badge: 'Testnet' },
        ] as const).map(({ key, label, badge }) => (
            <Box
                key={key}
                as="button"
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                cursor="pointer"
                transition="all 0.15s"
                bg={value === key ? 'brand.green' : 'card.white'}
                color={value === key ? 'white' : 'text.secondary'}
                boxShadow="0 1px 4px rgba(0,0,0,0.08)"
                onClick={() => onChange(key)}
                _hover={{ opacity: 0.85 }}
                display="flex"
                alignItems="center"
                gap={1.5}
            >
                {label}
                <Badge
                    fontSize="2xs"
                    px={1.5}
                    py={0.5}
                    borderRadius="full"
                    bg={value === key ? 'whiteAlpha.300' : 'card.lightGray'}
                    color={value === key ? 'white' : 'text.secondary'}
                >
                    {badge}
                </Badge>
            </Box>
        ))}
    </HStack>
);

const stateColor = (state: string) => {
    switch (state) {
        case 'operational': return 'brand.green';
        case 'degraded':    return 'yellow.400';
        case 'downtime':    return 'brand.pink';
        default:            return 'gray.400';
    }
};

const stateOk = (state: string) => state === 'operational';

const fmt = (n: number | undefined) => (n === undefined || n === null ? '—' : n.toLocaleString());

// ── Card wrapper ───────────────────────────────────────────────────────────────

const Card = ({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={6}
        border="1px solid"
        borderColor="card.lightGray"
        boxShadow="0 2px 12px rgba(0,0,0,0.06)"
    >
        <Flex align="center" justify="space-between" mb={4}>
            <Text fontSize="md" fontWeight="extrabold" color="text.primary">{title}</Text>
            {subtitle && <Text fontSize="xs" color="text.secondary">{subtitle}</Text>}
        </Flex>
        {children}
    </Box>
);

// ── Big stat card ──────────────────────────────────────────────────────────────

const StatCard = ({
    label,
    value,
    helpText,
    accent,
}: {
    label: string;
    value: number | string | undefined;
    helpText?: string;
    accent?: string;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={5}
        border="1px solid"
        borderColor="card.lightGray"
        boxShadow="0 2px 12px rgba(0,0,0,0.06)"
    >
        <Stat>
            <StatLabel fontSize="sm" color="text.secondary" fontWeight="medium">{label}</StatLabel>
            <StatNumber
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="extrabold"
                color={accent ?? 'text.primary'}
                lineHeight={1.1}
                mt={1}
            >
                {value === undefined || value === null ? '—' : typeof value === 'number' ? value.toLocaleString() : value}
            </StatNumber>
            {helpText && <StatHelpText fontSize="xs" color="text.secondary" mt={1}>{helpText}</StatHelpText>}
        </Stat>
    </Box>
);

// ── Health service card ────────────────────────────────────────────────────────

const ServiceCard = ({
    name,
    ok,
    rows,
    children,
}: {
    name: string;
    ok: boolean;
    rows?: { label: string; value: ReactNode; mono?: boolean }[];
    children?: ReactNode;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={6}
        border="1px solid"
        borderColor={ok ? 'card.lightGray' : 'brand.pink'}
        boxShadow={ok ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(235,11,92,0.12)'}
        flex={1}
    >
        <HStack mb={4} gap={2.5}>
            <StatusDot ok={ok} />
            <Text fontSize="md" fontWeight="extrabold" color="text.primary">{name}</Text>
        </HStack>
        {rows && (
            <VStack align="stretch" gap={2}>
                {rows.map(({ label, value, mono }) => (
                    <Flex key={label} justify="space-between" align="center" py={2} px={3} bg="card.lightGray" borderRadius="8px">
                        <Text fontSize="sm" color="text.secondary">{label}</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="text.primary" fontFamily={mono ? 'monospace' : undefined}>
                            {value}
                        </Text>
                    </Flex>
                ))}
            </VStack>
        )}
        {children}
    </Box>
);

// ── Settlement Health ──────────────────────────────────────────────────────────

const SettlementSection = ({ data }: { data: SettlementHealthResponse | null }) => {
    const ok = !data || data.pending_count === 0;
    return (
        <>
            <Flex align="center" gap={3} mb={data && data.pending_count > 0 ? 4 : 0}>
                <StatusDot ok={ok} />
                <Text fontSize="2xl" fontWeight="extrabold" color={ok ? 'brand.green' : 'brand.pink'}>
                    {data?.pending_count ?? 0}
                </Text>
                <Text fontSize="sm" color="text.secondary">stuck settlements</Text>
                {ok && (
                    <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">All Clear</Badge>
                )}
                {data?.timestamp && (
                    <Text fontSize="xs" color="text.secondary" ml="auto">{new Date(data.timestamp).toLocaleString()}</Text>
                )}
            </Flex>

            {data && data.pending_count > 0 && (
                <VStack align="stretch" gap={3} mt={2}>
                    {data.pending_settlements.map((ps, i) => (
                        <Box
                            key={i}
                            bg="card.lightGray"
                            borderRadius="10px"
                            p={4}
                            border="1px solid"
                            borderColor="brand.pink"
                        >
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontSize="sm" fontFamily="monospace" color="text.secondary" noOfLines={1}>
                                    {ps.table}
                                </Text>
                                <Badge
                                    colorScheme={ps.thirdweb_status === 'mined' ? 'green' : ps.thirdweb_status === 'errored' ? 'red' : 'orange'}
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                >
                                    {ps.thirdweb_status ?? 'unknown'}
                                </Badge>
                            </Flex>
                            <HStack gap={4} fontSize="sm" color="text.secondary">
                                <Text>Hand #{ps.hand_id}</Text>
                                <Text>{ps.player_count} players</Text>
                            </HStack>
                            {ps.thirdweb_error && (
                                <Text fontSize="xs" color="brand.pink" mt={2}>{ps.thirdweb_error}</Text>
                            )}
                        </Box>
                    ))}
                </VStack>
            )}
        </>
    );
};

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
    const [wlPage, setWlPage]                 = useState(1);
    const [wlTotal, setWlTotal]               = useState(0);
    const [wlTotalClaimed, setWlTotalClaimed] = useState(0);
    const [wlPages, setWlPages]               = useState(1);
    const [wlInputMode, setWlInputMode]       = useState<'paste' | 'csv'>('paste');
    const [wlPasteText, setWlPasteText]       = useState('');
    const [wlAdding, setWlAdding]             = useState(false);
    const WL_PAGE_SIZE = 50;

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

    const loadWhitelist = useCallback(async (search = '', page = 1) => {
        setWlLoading(true);
        try {
            const data = await getAdminSBTWhitelist({ search, page, pageSize: WL_PAGE_SIZE });
            setWhitelist(data.entries);
            setWlTotal(data.total);
            setWlTotalClaimed(data.claimed);
            setWlPages(data.pages);
        } finally {
            setWlLoading(false);
        }
    }, [WL_PAGE_SIZE]);

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
            if (r.isAdmin) { setAuthState('authorized'); loadData(); }
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

    // Debounced whitelist search — resets to page 1 on new query
    useEffect(() => {
        if (authState !== 'authorized') return;
        const t = setTimeout(() => { setWlPage(1); loadWhitelist(wlSearch, 1); }, 300);
        return () => clearTimeout(t);
    }, [wlSearch, authState]); // eslint-disable-line react-hooks/exhaustive-deps

    // Page change (only when page changes without a concurrent search change)
    useEffect(() => {
        if (authState !== 'authorized') return;
        loadWhitelist(wlSearch, wlPage);
    }, [wlPage, authState]); // eslint-disable-line react-hooks/exhaustive-deps

    if (authState === 'loading') {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="card.lightGray">
                <Spinner size="xl" color="brand.green" />
            </Flex>
        );
    }

    if (authState === 'unauthorized') {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="card.lightGray" px={4}>
                <Alert status="error" borderRadius="16px" maxW="420px" flexDir="column" textAlign="center" py={10} gap={4}>
                    <AlertIcon boxSize="40px" />
                    <AlertTitle fontSize="lg">Unauthorized</AlertTitle>
                    <AlertDescription fontSize="sm">
                        This page is restricted to admin wallets. Connect an authorized wallet and try again.
                    </AlertDescription>
                </Alert>
            </Flex>
        );
    }

    const statsTs  = stats?.timestamp  ?? now;
    const tablesTs = tables?.timestamp ?? now;

    const d   = stats?.data;
    const dt  = totals?.data;
    const lv  = live?.data;
    const pg  = health?.postgres;
    const rd  = health?.redis;
    const tw  = health?.thirdweb;
    const hub = health?.hub;

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

    // Inline chain selector label helper
    const chainLabel = (chain: 'base' | 'base-sepolia') => chain === 'base' ? 'Base' : 'Base Sepolia';

    return (
        <Flex
            direction="column"
            bg="card.lightGray"
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
                    <Text fontSize="sm" color="text.secondary">
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
                        boxShadow="0 1px 4px rgba(0,0,0,0.08)"
                        _hover={{ bg: 'btn.lightGray', color: 'text.primary' }}
                        _active={{ bg: 'btn.lightGray', transform: 'scale(0.95)' }}
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
                    boxShadow="0 2px 8px rgba(0,0,0,0.07)"
                    display="inline-flex"
                    gap={1}
                >
                    {[
                        { label: 'Stats',     accent: 'brand.green' },
                        { label: 'Tables',    accent: 'brand.pink' },
                        { label: 'Health',    accent: 'yellow.400' },
                        { label: 'Whitelist', accent: 'brand.yellow' },
                    ].map(({ label, accent }) => (
                        <Tab
                            key={label}
                            fontSize="sm"
                            py={2}
                            px={6}
                            fontWeight="bold"
                            color="text.secondary"
                            borderRadius="8px"
                            _selected={{ color: 'white', bg: accent }}
                            transition="all 0.15s"
                        >
                            {label}
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>

                    {/* ── Stats tab ── */}
                    <TabPanel px={0} py={0}>
                        <VStack align="stretch" gap={6}>

                            {/* Live now */}
                            <Box>
                                <Text fontSize="xs" fontWeight="extrabold" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" mb={3}>
                                    Live Now
                                </Text>
                                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                                    <StatCard label="WS Connections"    value={lv?.active_connections}  accent="brand.green" />
                                    <StatCard label="Tables in Memory"  value={lv?.hub_tables_in_memory} />
                                    <StatCard label="Tables with Players" value={lv?.tables_with_players} />
                                    <StatCard label="Active Players"    value={d?.active_players_count} />
                                </Grid>
                            </Box>

                            {/* Waitlist */}
                            <Box>
                                <Text fontSize="xs" fontWeight="extrabold" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" mb={3}>
                                    Waitlist
                                </Text>
                                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                                    <StatCard label="Email Subscribers" value={d?.waitlist_count} accent="brand.green" />
                                </Grid>
                            </Box>

                            {/* Activity over time — chain-filtered */}
                            <Card
                                title="Activity"
                                subtitle={
                                    <Flex align="center" gap={2}>
                                        <ChainSelector value={activityChain} onChange={setActivityChain} />
                                    </Flex>
                                }
                            >
                                <TableContainer>
                                    <Table variant="simple" size="md">
                                        <Thead>
                                            <Tr>
                                                <Th color="text.secondary" fontSize="xs" borderColor="card.lightGray" pl={0} minW="160px"></Th>
                                                <Th color="text.secondary" fontSize="xs" borderColor="card.lightGray" isNumeric>24h</Th>
                                                <Th color="text.secondary" fontSize="xs" borderColor="card.lightGray" isNumeric>7d</Th>
                                                <Th color="text.secondary" fontSize="xs" borderColor="card.lightGray" isNumeric>30d</Th>
                                                <Th color="text.secondary" fontSize="xs" borderColor="card.lightGray" isNumeric>All Time</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {/* Crypto rows */}
                                            <Tr bg="rgba(54,163,123,0.04)">
                                                <Td fontSize="sm" fontWeight="semibold" borderColor="card.lightGray" pl={0}>
                                                    <HStack gap={1.5}>
                                                        <Badge bg="brand.green" color="white" fontSize="xs" px={1.5} borderRadius="full">Crypto</Badge>
                                                        <Text>Tables Created</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_tables_24h)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_tables_7d)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_tables_30d)}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" color="brand.green" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_tables_total)}</Td>
                                            </Tr>
                                            <Tr bg="rgba(54,163,123,0.04)">
                                                <Td fontSize="sm" fontWeight="semibold" borderColor="card.lightGray" pl={0}>
                                                    <HStack gap={1.5}>
                                                        <Badge bg="brand.green" color="white" fontSize="xs" px={1.5} borderRadius="full">Crypto</Badge>
                                                        <Text>Hands Played</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_hands_24h)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_hands_7d)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_hands_30d)}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" color="brand.green" borderColor="card.lightGray" isNumeric>{fmt(d?.crypto_hands_total)}</Td>
                                            </Tr>
                                            {/* Free rows */}
                                            <Tr>
                                                <Td fontSize="sm" fontWeight="semibold" borderColor="card.lightGray" pl={0}>
                                                    <HStack gap={1.5}>
                                                        <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={1.5} borderRadius="full">Free</Badge>
                                                        <Text>Tables Created</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_tables_24h)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_tables_7d)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_tables_30d)}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_tables_total)}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td fontSize="sm" fontWeight="semibold" borderColor="card.lightGray" pl={0}>
                                                    <HStack gap={1.5}>
                                                        <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={1.5} borderRadius="full">Free</Badge>
                                                        <Text>Hands Played</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_hands_24h)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_hands_7d)}</Td>
                                                <Td fontSize="sm" fontWeight="bold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_hands_30d)}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" borderColor="card.lightGray" isNumeric>{fmt(d?.free_hands_total)}</Td>
                                            </Tr>
                                            {/* Rake row — sourced from indexer GraphQL */}
                                            <Tr bg="rgba(235,11,92,0.04)">
                                                <Td fontSize="sm" fontWeight="semibold" border="none" pl={0}>
                                                    <HStack gap={1.5}>
                                                        <Badge bg="brand.pink" color="white" fontSize="xs" px={1.5} borderRadius="full">Rake</Badge>
                                                        <Text>Platform Rake (USDC)</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{activityRake ? `$${activityRake.rake24hUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{activityRake ? `$${activityRake.rake7dUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{activityRake ? `$${activityRake.rake30dUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" border="none" isNumeric color="brand.pink">{activityRake ? `$${activityRake.rakeAllTimeUsdc}` : '—'}</Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Card>

                            {/* Unique Players + Total Hands — chain-filtered */}
                            <Box
                                bg="card.white"
                                borderRadius="16px"
                                p={5}
                                border="1px solid"
                                borderColor="card.lightGray"
                                boxShadow="0 2px 12px rgba(0,0,0,0.06)"
                            >
                                <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                                    <Text fontSize="sm" fontWeight="extrabold" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">
                                        All-time Totals
                                    </Text>
                                    <ChainSelector value={handsChain} onChange={setHandsChain} />
                                </Flex>
                                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                                    <Box>
                                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1}>Unique Wallets</Text>
                                        <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1}>{fmt(dt?.unique_wallets)}</Text>
                                        <Text fontSize="xs" color="text.secondary" mt={1}>{chainLabel(handsChain)}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1}>Total Hands Played</Text>
                                        <Text fontSize="3xl" fontWeight="extrabold" color="brand.green" lineHeight={1}>{fmt(dt?.total_hands_played)}</Text>
                                        <Text fontSize="xs" color="text.secondary" mt={1}>{chainLabel(handsChain)}</Text>
                                    </Box>
                                </Grid>
                            </Box>


                        </VStack>
                    </TabPanel>

                    {/* ── Tables tab ── */}
                    <TabPanel px={0} py={0}>
                        <Card
                            title="Tables"
                            subtitle={new Date(tablesTs).toLocaleString()}
                        >
                            {/* Summary */}
                            <HStack gap={6} mb={5} flexWrap="wrap">
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary">{tables?.total_count ?? 0}</Text>
                                    <Text fontSize="xs" color="text.secondary">Total</Text>
                                </VStack>
                                <Divider orientation="vertical" h="40px" borderColor="card.lightGray" />
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="extrabold" color="brand.green">{tables?.tables.filter((t) => t.is_active).length ?? 0}</Text>
                                    <Text fontSize="xs" color="text.secondary">Active</Text>
                                </VStack>
                                <Divider orientation="vertical" h="40px" borderColor="card.lightGray" />
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary">{tables?.tables.filter((t) => t.in_memory).length ?? 0}</Text>
                                    <Text fontSize="xs" color="text.secondary">In Memory</Text>
                                </VStack>
                                <Divider orientation="vertical" h="40px" borderColor="card.lightGray" />
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary">{tables?.tables.filter((t) => t.is_crypto).length ?? 0}</Text>
                                    <Text fontSize="xs" color="text.secondary">Crypto</Text>
                                </VStack>
                            </HStack>

                            {/* Filter + search */}
                            <Flex justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
                                <HStack gap={2} flexWrap="wrap">
                                    {/* Type filter */}
                                    {([
                                        { key: 'all',    label: 'All' },
                                        { key: 'crypto', label: 'Crypto' },
                                        { key: 'free',   label: 'Free' },
                                    ] as const).map(({ key, label }) => (
                                        <Box
                                            key={key}
                                            as="button"
                                            px={3}
                                            py={1.5}
                                            borderRadius="full"
                                            fontSize="sm"
                                            fontWeight="bold"
                                            cursor="pointer"
                                            transition="all 0.15s"
                                            bg={typeFilter === key ? 'brand.pink' : 'card.lightGray'}
                                            color={typeFilter === key ? 'white' : 'text.secondary'}
                                            onClick={() => setTypeFilter(key)}
                                            _hover={{ opacity: 0.85 }}
                                        >
                                            {label}
                                        </Box>
                                    ))}
                                    {typeFilter !== 'free' && <Box w="1px" h="20px" bg="card.lightGray" mx={1} />}
                                    {/* Chain filter — only relevant for crypto/all tables */}
                                    {typeFilter !== 'free' && (
                                        <>
                                            {([
                                                { key: 'all' as const,          label: 'All Networks' },
                                                { key: 'base' as const,         label: 'Mainnet' },
                                                { key: 'base-sepolia' as const, label: 'Testnet' },
                                            ]).map(({ key, label }) => (
                                                <Box
                                                    key={key}
                                                    as="button"
                                                    px={3}
                                                    py={1.5}
                                                    borderRadius="full"
                                                    fontSize="sm"
                                                    fontWeight="bold"
                                                    cursor="pointer"
                                                    transition="all 0.15s"
                                                    bg={tablesChain === key ? 'brand.green' : 'card.lightGray'}
                                                    color={tablesChain === key ? 'white' : 'text.secondary'}
                                                    onClick={() => setTablesChain(key)}
                                                    _hover={{ opacity: 0.85 }}
                                                >
                                                    {label}
                                                </Box>
                                            ))}
                                        </>
                                    )}
                                </HStack>
                                <Input
                                    placeholder="Search by name or wallet address…"
                                    size="sm"
                                    maxW="280px"
                                    borderRadius="8px"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    bg="card.lightGray"
                                    border="none"
                                    _focus={{ boxShadow: 'none', bg: 'card.lighterGray' }}
                                />
                            </Flex>

                            {/* Table */}
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th color="text.secondary" borderColor="card.lightGray" pl={0}>Status</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Name</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Type</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Network</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>Blinds</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>Players</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>WS</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Created</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTables.length > 0 ? (
                                            filteredTables.map((t) => (
                                                <Tr key={t.name} _hover={{ bg: 'card.lightGray' }} transition="background 0.15s">
                                                    <Td borderColor="card.lightGray" pl={0}>
                                                        <Tooltip label={t.is_active ? 'Active' : 'Inactive'} hasArrow>
                                                            <Box display="inline-block">
                                                                <StatusDot ok={t.is_active} />
                                                            </Box>
                                                        </Tooltip>
                                                    </Td>
                                                    <Td borderColor="card.lightGray" maxW="220px">
                                                        <Tooltip label={t.name} hasArrow placement="top">
                                                            <Link href={`/table/${t.name}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                                <Text
                                                                    fontSize="xs"
                                                                    fontFamily="monospace"
                                                                    color="text.secondary"
                                                                    noOfLines={1}
                                                                    _hover={{ color: 'brand.pink' }}
                                                                    transition="color 0.15s"
                                                                >
                                                                    {t.name.length > 22 ? `${t.name.slice(0, 10)}…${t.name.slice(-8)}` : t.name}
                                                                </Text>
                                                            </Link>
                                                        </Tooltip>
                                                        {t.is_crypto && t.owner_wallet && (
                                                            <Tooltip label={t.owner_wallet} hasArrow placement="top">
                                                                <Text fontSize="2xs" fontFamily="monospace" color="brand.green" opacity={0.7} noOfLines={1} mt={0.5}>
                                                                    {`${t.owner_wallet.slice(0, 6)}…${t.owner_wallet.slice(-4)}`}
                                                                </Text>
                                                            </Tooltip>
                                                        )}
                                                    </Td>
                                                    <Td borderColor="card.lightGray">
                                                        <HStack gap={1}>
                                                            {t.is_crypto && (
                                                                <Badge bg="brand.green" color="white" fontSize="xs" px={2} borderRadius="full">Crypto</Badge>
                                                            )}
                                                            {t.in_memory && (
                                                                <Badge bg="yellow.400" color="gray.800" fontSize="xs" px={2} borderRadius="full">Memory</Badge>
                                                            )}
                                                            {!t.is_crypto && (
                                                                <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={2} borderRadius="full">Free</Badge>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                    <Td borderColor="card.lightGray">
                                                        {t.chain ? (
                                                            <Badge
                                                                bg={t.chain === 'base' ? 'brand.green' : 'card.lightGray'}
                                                                color={t.chain === 'base' ? 'white' : 'text.secondary'}
                                                                fontSize="xs" px={2} borderRadius="full"
                                                            >
                                                                {t.chain === 'base' ? 'Mainnet' : 'Testnet'}
                                                            </Badge>
                                                        ) : (
                                                            <Text fontSize="xs" color="text.secondary">—</Text>
                                                        )}
                                                    </Td>
                                                    <Td borderColor="card.lightGray" isNumeric>
                                                        <Text fontSize="xs" fontFamily="monospace" color="text.secondary">
                                                            {t.blinds.sb ?? '?'}/{t.blinds.bb ?? '?'}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="card.lightGray" isNumeric>
                                                        <Text fontSize="sm" fontWeight="bold" color={t.player_count > 0 ? 'brand.green' : 'text.secondary'}>
                                                            {t.player_count}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="card.lightGray" isNumeric>
                                                        <Text fontSize="sm" color="text.secondary">{t.ws_connections}</Text>
                                                    </Td>
                                                    <Td borderColor="card.lightGray">
                                                        <Text fontSize="xs" color="text.secondary">
                                                            {new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="card.lightGray">
                                                        {t.is_crypto && t.is_active && (
                                                            <EmergencyWithdrawAllButton contractAddress={t.name} chain={CHAIN_CONFIG[t.chain ?? '']?.chain ?? defaultChain} />
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={9} textAlign="center" py={10} borderColor="card.lightGray">
                                                    <Text color="text.secondary">No tables found</Text>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </TabPanel>

                    {/* ── Health tab ── */}
                    <TabPanel px={0} py={0}>
                        <VStack align="stretch" gap={6}>

                            {/* Service overview */}
                            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                                {[
                                    { name: 'PostgreSQL', ok: pg?.status === 'connected',          detail: pg ? `${pg.latency_ms} ms` : 'No data' },
                                    { name: 'Redis',      ok: rd?.status === 'connected',          detail: rd ? `${rd.latency_ms} ms · ${rd.memory_used || '?'} · ${rd.connected_clients ?? '?'}/${rd.max_clients ?? '?'} conns` : 'No data' },
                                    { name: 'Game Hub',   ok: true,                                detail: hub ? `${hub.tables_in_memory} tables · ${hub.ws_connections} WS` : 'No data' },
                                    { name: 'thirdweb',   ok: stateOk(tw?.aggregate_state ?? 'unknown'), detail: tw?.aggregate_state ?? 'unknown' },
                                ].map(({ name, ok, detail }) => (
                                    <Box
                                        key={name}
                                        bg="card.white"
                                        borderRadius="16px"
                                        p={5}
                                        border="1px solid"
                                        borderColor={ok ? 'card.lightGray' : 'brand.pink'}
                                        boxShadow={ok ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(235,11,92,0.12)'}
                                    >
                                        <HStack gap={2} mb={2}>
                                            <StatusDot ok={ok} />
                                            <Text fontSize="sm" fontWeight="extrabold" color="text.primary">{name}</Text>
                                        </HStack>
                                        <Text fontSize="sm" color="text.secondary">{detail}</Text>
                                    </Box>
                                ))}
                            </Grid>

                            {/* Settlement health — chain-filtered */}
                            <Card
                                title="Settlement Health"
                                subtitle={
                                    <Flex align="center" gap={2}>
                                        <ChainSelector value={settlementChain} onChange={setSettlementChain} />
                                    </Flex>
                                }
                            >
                                <SettlementSection data={settle} />
                            </Card>

                            {/* Detail row 1: PG + Redis */}
                            <Flex gap={5} direction={{ base: 'column', md: 'row' }}>
                                <ServiceCard
                                    name="PostgreSQL"
                                    ok={pg?.status === 'connected'}
                                    rows={[
                                        { label: 'Status',      value: <Text fontWeight="bold" color={pg?.status === 'connected' ? 'brand.green' : 'brand.pink'} textTransform="capitalize">{pg?.status ?? '—'}</Text> },
                                        { label: 'Latency',     value: pg ? `${pg.latency_ms} ms` : '—' },
                                        { label: 'Pool Idle',   value: pg?.pool_idle   ?? '—' },
                                        { label: 'Pool Active', value: pg?.pool_active ?? '—' },
                                    ]}
                                />
                                <ServiceCard
                                    name="Redis"
                                    ok={rd?.status === 'connected'}
                                    rows={[
                                        { label: 'Status',      value: <Text fontWeight="bold" color={rd?.status === 'connected' ? 'brand.green' : 'brand.pink'} textTransform="capitalize">{rd?.status ?? '—'}</Text> },
                                        { label: 'Latency',     value: rd ? `${rd.latency_ms} ms` : '—' },
                                        { label: 'Memory Used', value: rd?.memory_used || '—' },
                                        { label: 'Connections', value: rd?.connected_clients != null && rd?.max_clients
                                            ? <Text fontWeight="bold" color={rd.connected_clients / rd.max_clients >= 0.8 ? 'brand.pink' : 'text.primary'}>{rd.connected_clients} / {rd.max_clients} ({Math.round(rd.connected_clients / rd.max_clients * 100)}%)</Text>
                                            : '—' },
                                    ]}
                                >
                                    {rd?.streams && Object.keys(rd.streams).length > 0 && (
                                        <Box mt={4}>
                                            <Text fontSize="xs" fontWeight="extrabold" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" mb={2}>
                                                Redis Streams
                                            </Text>
                                            <VStack align="stretch" gap={2}>
                                                {Object.entries(rd.streams).map(([stream, count]) => (
                                                    <Flex key={stream} justify="space-between" align="center" py={2} px={3} bg="card.lightGray" borderRadius="8px">
                                                        <Tooltip label={stream} hasArrow>
                                                            <Text fontSize="sm" color="text.secondary" fontFamily="monospace">
                                                                {stream.replace('poker:', '')}
                                                            </Text>
                                                        </Tooltip>
                                                        <Text fontSize="sm" fontWeight="semibold" color="text.primary" fontFamily="monospace">{count}</Text>
                                                    </Flex>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}
                                </ServiceCard>
                            </Flex>

                            {/* Detail row 2: Hub + thirdweb */}
                            <Flex gap={5} direction={{ base: 'column', md: 'row' }}>
                                <ServiceCard
                                    name="Game Hub"
                                    ok={true}
                                    rows={[
                                        { label: 'Tables in Memory', value: hub?.tables_in_memory ?? '—' },
                                        { label: 'WS Connections',   value: hub?.ws_connections   ?? '—' },
                                        { label: 'Engine',           value: <Text fontWeight="bold" color={health?.engine.status === 'configured' ? 'brand.green' : 'gray.400'} textTransform="capitalize">{health?.engine.status ?? '—'}</Text> },
                                    ]}
                                />
                                <ServiceCard
                                    name="thirdweb"
                                    ok={stateOk(tw?.aggregate_state ?? 'unknown')}
                                    rows={[
                                        {
                                            label: 'Status',
                                            value: (
                                                <Text fontWeight="bold" color={stateColor(tw?.aggregate_state ?? 'unknown')} textTransform="capitalize">
                                                    {tw?.aggregate_state ?? '—'}
                                                </Text>
                                            ),
                                        },
                                    ]}
                                >
                                    {tw?.url && (
                                        <Box mt={3} px={3} py={2} bg="card.lightGray" borderRadius="8px">
                                            <Link href={tw.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Text fontSize="sm" color="brand.green" _hover={{ textDecoration: 'underline' }}>
                                                    {tw.url.replace('https://', '')}
                                                </Text>
                                            </Link>
                                        </Box>
                                    )}
                                    {(tw?.degraded_services ?? []).length > 0 && (
                                        <Box mt={4}>
                                            <Text fontSize="xs" fontWeight="extrabold" color="brand.pink" textTransform="uppercase" letterSpacing="0.06em" mb={2}>
                                                Affected Services
                                            </Text>
                                            <VStack align="stretch" gap={2}>
                                                {(tw?.degraded_services ?? []).map((svc, i) => (
                                                    <Flex key={i} align="center" gap={2} py={2} px={3} bg="card.lightGray" borderRadius="8px">
                                                        <StatusDot ok={false} />
                                                        <Text fontSize="sm" color="text.primary">{svc}</Text>
                                                    </Flex>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}
                                </ServiceCard>
                            </Flex>

                            {/* Chain Indexer — chain-filtered */}
                            <Box
                                bg="card.white"
                                borderRadius="16px"
                                p={6}
                                border="1px solid"
                                borderColor={indexer?.healthy ? 'card.lightGray' : 'brand.pink'}
                                boxShadow={indexer?.healthy ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(235,11,92,0.12)'}
                            >
                                <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                                    <HStack gap={2.5}>
                                        <StatusDot ok={indexer?.healthy ?? false} />
                                        <Text fontSize="md" fontWeight="extrabold" color="text.primary">Chain Indexer</Text>
                                    </HStack>
                                    <ChainSelector value={indexerChain} onChange={setIndexerChain} />
                                </Flex>
                                <VStack align="stretch" gap={2}>
                                    {[
                                        { label: 'Status',        value: <Text fontWeight="bold" color={indexer?.healthy ? 'brand.green' : indexer === null ? 'gray.400' : 'brand.pink'}>{indexer === null ? '—' : indexer.healthy ? 'In sync' : 'Lagging'}</Text> },
                                        { label: 'Indexed Block', value: indexer?.height?.toLocaleString() ?? '—',  mono: true },
                                        { label: 'Chain Tip',     value: indexer?.chainTip?.toLocaleString() ?? '—', mono: true },
                                        { label: 'Lag (blocks)',  value: indexer?.lag !== null && indexer?.lag !== undefined ? String(indexer.lag) : '—', mono: true },
                                        { label: 'Hands Indexed', value: indexer?.totalHands?.toLocaleString() ?? '—' },
                                        { label: 'Total Rake',    value: indexer ? `$${indexer.rakeAllTimeUsdc} USDC` : '—' },
                                    ].map(({ label, value, mono }) => (
                                        <Flex key={label} justify="space-between" align="center" py={2} px={3} bg="card.lightGray" borderRadius="8px">
                                            <Text fontSize="sm" color="text.secondary">{label}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="text.primary" fontFamily={mono ? 'monospace' : undefined}>{value}</Text>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>

                        </VStack>
                    </TabPanel>

                    {/* ── Whitelist tab ── */}
                    <TabPanel px={0} py={0}>
                        <VStack align="stretch" gap={6}>

                            {/* Whitelist table */}
                            <Box bg="card.white" borderRadius="16px" p={6} border="1px solid" borderColor="card.lightGray" boxShadow="0 2px 12px rgba(0,0,0,0.06)">
                                <Flex justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="md" fontWeight="extrabold" color="text.primary">NFT Whitelist</Text>
                                        <Text fontSize="xs" color="text.secondary">
                                            {wlTotal.toLocaleString()} addresses · {wlTotalClaimed.toLocaleString()} claimed
                                            {wlSearch && ` · filtered`}
                                        </Text>
                                    </VStack>
                                    <HStack gap={2}>
                                        <Input
                                            placeholder="Search address…"
                                            size="sm"
                                            maxW="220px"
                                            borderRadius="8px"
                                            value={wlSearch}
                                            onChange={(e) => setWlSearch(e.target.value)}
                                            bg="card.lightGray"
                                            border="none"
                                            fontFamily="monospace"
                                            fontSize="xs"
                                            _focus={{ boxShadow: 'none', bg: 'card.lighterGray' }}
                                        />
                                        <Box
                                            as="button"
                                            px={3} py={1.5}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            cursor="pointer"
                                            bg="card.lightGray"
                                            color="text.secondary"
                                            _hover={{ opacity: 0.8 }}
                                            onClick={() => loadWhitelist(wlSearch, wlPage)}
                                        >
                                            Refresh
                                        </Box>
                                    </HStack>
                                </Flex>
                                {wlLoading ? (
                                    <Flex justify="center" py={8}><Spinner size="md" color="brand.yellow" /></Flex>
                                ) : whitelist.length === 0 ? (
                                    <Text fontSize="sm" color="text.secondary" textAlign="center" py={6}>
                                        {wlSearch ? 'No addresses match your search.' : 'No addresses yet.'}
                                    </Text>
                                ) : (
                                    <>
                                        <TableContainer>
                                            <Table size="sm" variant="unstyled">
                                                <Thead>
                                                    <Tr>
                                                        <Th fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" pb={3}>Address</Th>
                                                        <Th fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" pb={3}>Added</Th>
                                                        <Th fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" pb={3} isNumeric>Claimed</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {whitelist.map((entry) => (
                                                        <Tr key={entry.address} _hover={{ bg: 'card.lightGray' }} borderRadius="8px">
                                                            <Td py={2.5}>
                                                                <HStack gap={2}>
                                                                    <Text fontSize="xs" fontFamily="monospace" color="text.primary">
                                                                        {entry.address.slice(0, 6)}…{entry.address.slice(-4)}
                                                                    </Text>
                                                                    <Box
                                                                        as="button"
                                                                        fontSize="2xs"
                                                                        color="text.secondary"
                                                                        cursor="pointer"
                                                                        _hover={{ color: 'text.primary' }}
                                                                        onClick={() => navigator.clipboard.writeText(entry.address)}
                                                                    >
                                                                        Copy
                                                                    </Box>
                                                                </HStack>
                                                            </Td>
                                                            <Td py={2.5}>
                                                                <Text fontSize="xs" color="text.secondary">
                                                                    {new Date(entry.addedAt).toLocaleDateString()}
                                                                </Text>
                                                            </Td>
                                                            <Td py={2.5} isNumeric>
                                                                <Text fontSize="xs" color={entry.claimed ? 'brand.green' : 'text.secondary'} fontWeight={entry.claimed ? 700 : 400}>
                                                                    {entry.claimed ? '✓' : '—'}
                                                                </Text>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>

                                        {/* Pagination */}
                                        {wlPages > 1 && (
                                            <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px solid" borderColor="card.lightGray">
                                                <Text fontSize="xs" color="text.secondary">
                                                    Page {wlPage} of {wlPages} · {wlTotal.toLocaleString()} total
                                                </Text>
                                                <HStack gap={1}>
                                                    <Box
                                                        as="button"
                                                        px={3} py={1.5}
                                                        borderRadius="8px"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        cursor={wlPage <= 1 ? 'default' : 'pointer'}
                                                        bg="card.lightGray"
                                                        color={wlPage <= 1 ? 'text.secondary' : 'text.primary'}
                                                        opacity={wlPage <= 1 ? 0.4 : 1}
                                                        onClick={() => wlPage > 1 && setWlPage(wlPage - 1)}
                                                    >
                                                        ← Prev
                                                    </Box>
                                                    {/* Up to 5 page buttons */}
                                                    {Array.from({ length: Math.min(5, wlPages) }, (_, i) => {
                                                        const mid = Math.min(Math.max(wlPage, 3), wlPages - 2);
                                                        const p = wlPages <= 5 ? i + 1 : mid - 2 + i;
                                                        return (
                                                            <Box
                                                                key={p}
                                                                as="button"
                                                                px={3} py={1.5}
                                                                borderRadius="8px"
                                                                fontSize="xs"
                                                                fontWeight="bold"
                                                                cursor="pointer"
                                                                bg={wlPage === p ? 'brand.yellow' : 'card.lightGray'}
                                                                color={wlPage === p ? 'white' : 'text.secondary'}
                                                                onClick={() => setWlPage(p)}
                                                            >
                                                                {p}
                                                            </Box>
                                                        );
                                                    })}
                                                    <Box
                                                        as="button"
                                                        px={3} py={1.5}
                                                        borderRadius="8px"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        cursor={wlPage >= wlPages ? 'default' : 'pointer'}
                                                        bg="card.lightGray"
                                                        color={wlPage >= wlPages ? 'text.secondary' : 'text.primary'}
                                                        opacity={wlPage >= wlPages ? 0.4 : 1}
                                                        onClick={() => wlPage < wlPages && setWlPage(wlPage + 1)}
                                                    >
                                                        Next →
                                                    </Box>
                                                </HStack>
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Box>

                            {/* Add addresses */}
                            <Box bg="card.white" borderRadius="16px" p={6} border="1px solid" borderColor="card.lightGray" boxShadow="0 2px 12px rgba(0,0,0,0.06)">
                                <Text fontSize="md" fontWeight="extrabold" color="text.primary" mb={4}>Add Addresses</Text>

                                {/* Mode toggle */}
                                <HStack gap={2} mb={4}>
                                    {(['paste', 'csv'] as const).map((mode) => (
                                        <Box
                                            key={mode}
                                            as="button"
                                            px={3} py={1.5}
                                            borderRadius="full"
                                            fontSize="sm"
                                            fontWeight="bold"
                                            cursor="pointer"
                                            transition="all 0.15s"
                                            bg={wlInputMode === mode ? 'brand.yellow' : 'card.lightGray'}
                                            color={wlInputMode === mode ? 'white' : 'text.secondary'}
                                            onClick={() => setWlInputMode(mode)}
                                            _hover={{ opacity: 0.85 }}
                                            textTransform="capitalize"
                                        >
                                            {mode === 'paste' ? 'Paste' : 'CSV File'}
                                        </Box>
                                    ))}
                                </HStack>

                                {wlInputMode === 'paste' ? (
                                    <Textarea
                                        value={wlPasteText}
                                        onChange={(e) => setWlPasteText(e.target.value)}
                                        placeholder={"0x1234…\n0xabcd…"}
                                        rows={6}
                                        fontSize="xs"
                                        fontFamily="monospace"
                                        borderRadius="10px"
                                        resize="vertical"
                                        mb={3}
                                    />
                                ) : (
                                    <Box mb={3}>
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            fontSize="xs"
                                            borderRadius="10px"
                                            py={1.5}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const text = ev.target?.result as string;
                                                    const addresses = text
                                                        .split('\n')
                                                        .map((line) => line.split(',')[0].trim())
                                                        .filter((a) => /^0x/i.test(a));
                                                    setWlPasteText(addresses.join('\n'));
                                                    setWlInputMode('paste');
                                                };
                                                reader.readAsText(file);
                                            }}
                                        />
                                        <Text fontSize="xs" color="text.secondary" mt={1}>First column used. Parsed addresses will appear in Paste mode.</Text>
                                    </Box>
                                )}

                                {/* Preview */}
                                {wlPasteText.trim() && (() => {
                                    const addrs = wlPasteText
                                        .split(/[\n,]+/)
                                        .map((a) => a.trim())
                                        .filter((a) => /^0x/i.test(a));
                                    return (
                                        <Box mb={3} p={3} bg="card.lightGray" borderRadius="8px">
                                            <Text fontSize="xs" color="text.secondary" mb={1}>{addrs.length} address{addrs.length !== 1 ? 'es' : ''} detected</Text>
                                            {addrs.slice(0, 5).map((a) => (
                                                <Text key={a} fontSize="xs" fontFamily="monospace" color="text.primary">{a}</Text>
                                            ))}
                                            {addrs.length > 5 && <Text fontSize="xs" color="text.secondary">…and {addrs.length - 5} more</Text>}
                                        </Box>
                                    );
                                })()}

                                <Button
                                    bg="brand.yellow"
                                    color="white"
                                    fontWeight={800}
                                    borderRadius="10px"
                                    size="sm"
                                    isLoading={wlAdding}
                                    loadingText="Adding…"
                                    isDisabled={!wlPasteText.trim()}
                                    _hover={{ opacity: 0.9 }}
                                    onClick={async () => {
                                        const addrs = wlPasteText
                                            .split(/[\n,]+/)
                                            .map((a) => a.trim())
                                            .filter((a) => /^0x/i.test(a));
                                        if (!addrs.length) return;
                                        setWlAdding(true);
                                        try {
                                            const result = await addToSBTWhitelist(addrs);
                                            if (result.success) {
                                                setWlPasteText('');
                                                await loadWhitelist(wlSearch, wlPage);
                                            }
                                        } finally {
                                            setWlAdding(false);
                                        }
                                    }}
                                >
                                    Add to Whitelist
                                </Button>
                            </Box>

                        </VStack>
                    </TabPanel>

                </TabPanels>
            </Tabs>
        </Flex>
    );
}
