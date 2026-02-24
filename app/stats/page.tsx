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
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState, useCallback, ReactNode } from 'react';
import {
    verifyAdmin,
    getAdminStats,
    getAdminLiveStats,
    getAdminTables,
    getAdminHealth,
    getAdminSettlementHealth,
    getIndexerHealth,
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
    subtitle?: string;
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
        <Card title="Settlement Health" subtitle={data?.timestamp ? new Date(data.timestamp).toLocaleString() : undefined}>
            <Flex align="center" gap={3} mb={4}>
                <StatusDot ok={ok} />
                <Text fontSize="2xl" fontWeight="extrabold" color={ok ? 'brand.green' : 'brand.pink'}>
                    {data?.pending_count ?? 0}
                </Text>
                <Text fontSize="sm" color="text.secondary">stuck settlements</Text>
                {ok && (
                    <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">All Clear</Badge>
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
        </Card>
    );
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminStatsPage() {
    const now = new Date().toISOString();
    const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
    const [stats, setStats]       = useState<AdminStatsResponse | null>(null);
    const [live, setLive]         = useState<AdminLiveStatsResponse | null>(null);
    const [tables, setTables]     = useState<AdminTablesResponse | null>(null);
    const [health, setHealth]     = useState<AdminHealthResponse | null>(null);
    const [settle, setSettle]     = useState<SettlementHealthResponse | null>(null);
    const [indexer, setIndexer]   = useState<IndexerHealthData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch]         = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'crypto' | 'free'>('all');

    const loadData = useCallback(async () => {
        setRefreshing(true);
        const [s, l, t, h, sh, ix] = await Promise.allSettled([
            getAdminStats(),
            getAdminLiveStats(),
            getAdminTables(),
            getAdminHealth(),
            getAdminSettlementHealth(),
            getIndexerHealth(),
        ]);
        if (s.status  === 'fulfilled') setStats(s.value);
        if (l.status  === 'fulfilled') setLive(l.value);
        if (t.status  === 'fulfilled') setTables(t.value);
        if (h.status  === 'fulfilled') setHealth(h.value);
        if (sh.status === 'fulfilled') setSettle(sh.value);
        if (ix.status === 'fulfilled') setIndexer(ix.value);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        verifyAdmin().then((r) => {
            if (r.isAdmin) { setAuthState('authorized'); loadData(); }
            else setAuthState('unauthorized');
        });
    }, [loadData]);

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
                        { label: 'Stats',  accent: 'brand.green' },
                        { label: 'Tables', accent: 'brand.pink' },
                        { label: 'Health', accent: 'yellow.400' },
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

                            {/* Activity over time */}
                            <Card title="Activity" subtitle={new Date(statsTs).toLocaleString()}>
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
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{indexer ? `$${indexer.rake24hUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{indexer ? `$${indexer.rake7dUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink">{indexer ? `$${indexer.rake30dUsdc}` : '—'}</Td>
                                                <Td fontSize="sm" fontWeight="extrabold" border="none" isNumeric color="brand.pink">{indexer ? `$${indexer.rakeAllTimeUsdc}` : '—'}</Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Card>

                            {/* Players */}
                            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                                <StatCard label="Unique Players" value={d?.total_unique_players} helpText="All time across all table types" />
                                <StatCard label="Total Hands Played" value={d?.total_hands_played} helpText="All time" accent="brand.green" />
                            </Grid>

                            {/* Crypto vs Free split */}
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
                                {/* Crypto */}
                                <Box
                                    bg="card.white"
                                    borderRadius="16px"
                                    border="2px solid"
                                    borderColor="brand.green"
                                    p={6}
                                    boxShadow="0 4px 20px rgba(54,163,123,0.12)"
                                >
                                    <HStack mb={5} gap={2.5}>
                                        <Box w="10px" h="10px" borderRadius="full" bg="brand.green" boxShadow="0 0 8px rgba(54,163,123,0.7)" flexShrink={0} />
                                        <Text fontSize="md" fontWeight="extrabold" color="brand.green">Crypto Tables</Text>
                                        <Badge bg="brand.green" color="white" fontSize="xs" px={2} borderRadius="full" ml="auto">On-chain</Badge>
                                    </HStack>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        <Box>
                                            <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1}>{fmt(d?.crypto_tables_total)}</Text>
                                            <Text fontSize="xs" color="text.secondary" mt={1}>Total Created</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1}>{fmt(d?.unique_wallets)}</Text>
                                            <Text fontSize="xs" color="text.secondary" mt={1}>Unique Wallets</Text>
                                        </Box>
                                    </Grid>
                                </Box>

                                {/* Free */}
                                <Box
                                    bg="card.white"
                                    borderRadius="16px"
                                    border="1px solid"
                                    borderColor="card.lightGray"
                                    p={6}
                                    boxShadow="0 2px 12px rgba(0,0,0,0.06)"
                                >
                                    <HStack mb={5} gap={2.5}>
                                        <Box w="10px" h="10px" borderRadius="full" bg="gray.400" flexShrink={0} />
                                        <Text fontSize="md" fontWeight="extrabold" color="text.secondary">Free Tables</Text>
                                        <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={2} borderRadius="full" ml="auto">Play Money</Badge>
                                    </HStack>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        <Box>
                                            <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1}>{fmt(d?.free_tables_total)}</Text>
                                            <Text fontSize="xs" color="text.secondary" mt={1}>Total Created</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1}>{fmt(d?.total_unique_players)}</Text>
                                            <Text fontSize="xs" color="text.secondary" mt={1}>Unique Players</Text>
                                        </Box>
                                    </Grid>
                                </Box>
                            </Grid>

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
                                {/* Type filter buttons */}
                                <HStack gap={2}>
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
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>Blinds</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>Players</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray" isNumeric>WS</Th>
                                            <Th color="text.secondary" borderColor="card.lightGray">Created</Th>
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
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={7} textAlign="center" py={10} borderColor="card.lightGray">
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
                                    { name: 'Redis',      ok: rd?.status === 'connected',          detail: rd ? `${rd.latency_ms} ms · ${rd.memory_used || '?'}` : 'No data' },
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

                            {/* Settlement health – second priority after the overview strip */}
                            <SettlementSection data={settle} />

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

                            {/* Indexer health */}
                            <ServiceCard
                                name="Chain Indexer"
                                ok={indexer?.healthy ?? false}
                                rows={[
                                    {
                                        label: 'Status',
                                        value: (
                                            <Text fontWeight="bold" color={indexer?.healthy ? 'brand.green' : indexer === null ? 'gray.400' : 'brand.pink'}>
                                                {indexer === null ? '—' : indexer.healthy ? 'In sync' : 'Lagging'}
                                            </Text>
                                        ),
                                    },
                                    { label: 'Indexed Block', value: indexer?.height?.toLocaleString() ?? '—', mono: true },
                                    { label: 'Chain Tip',     value: indexer?.chainTip?.toLocaleString() ?? '—', mono: true },
                                    { label: 'Lag (blocks)',  value: indexer?.lag !== null && indexer?.lag !== undefined ? String(indexer.lag) : '—', mono: true },
                                    { label: 'Hands Indexed', value: indexer?.totalHands?.toLocaleString() ?? '—' },
                                    { label: 'Total Rake',    value: indexer ? `$${indexer.rakeAllTimeUsdc} USDC` : '—' },
                                ]}
                            />

                        </VStack>
                    </TabPanel>

                </TabPanels>
            </Tabs>
        </Flex>
    );
}
