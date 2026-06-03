'use client';

import {
    Text,
    Flex,
    Box,
    Badge,
    HStack,
    VStack,
    Grid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Tooltip,
} from '@chakra-ui/react';
import { Card, ChainSelector, StatCard, fmt } from './Primitives';
import ChainBadge from '../ChainBadge';
import type {
    AdminStatsResponse,
    AdminLiveStatsResponse,
    IndexerHealthData,
    ActionDistributionResponse,
} from '../../stats/types';

interface StatsTabProps {
    stats: AdminStatsResponse | null;
    totals: AdminStatsResponse | null;
    live: AdminLiveStatsResponse | null;
    activityRake: IndexerHealthData | null;
    activityChain: 'base-sepolia' | 'base';
    setActivityChain: (v: 'base' | 'base-sepolia') => void;
    handsChain: 'base-sepolia' | 'base';
    setHandsChain: (v: 'base' | 'base-sepolia') => void;
    actionDist: ActionDistributionResponse | null;
}

const tabular = { fontVariantNumeric: 'tabular-nums' as const };

const eyebrowProps = {
    fontSize: 'xs' as const,
    fontWeight: 'extrabold' as const,
    color: 'text.secondary',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    mb: 3,
    _dark: { color: 'whiteAlpha.700' },
};

const thProps = {
    color: 'text.secondary',
    fontSize: 'xs' as const,
    borderColor: 'card.lightGray',
    _dark: { borderColor: 'whiteAlpha.200', color: 'whiteAlpha.700' },
};

const tdBorder = {
    borderColor: 'card.lightGray',
    _dark: { borderColor: 'whiteAlpha.100' },
};

const cryptoRowBg = {
    bg: 'rgba(54,163,123,0.04)',
    _dark: { bg: 'rgba(54,163,123,0.10)' },
};

const rakeRowBg = {
    bg: 'rgba(235,11,92,0.04)',
    _dark: { bg: 'rgba(235,11,92,0.10)' },
};

function fmtPot(v: number | undefined): string {
    if (v === undefined || v === null) return '—';
    if (v === 0) return '—';
    return v.toFixed(2);
}

function fmtPct(part: number, total: number): string {
    if (!total) return '0%';
    return `${((part / total) * 100).toFixed(1)}%`;
}

export const StatsTab = ({
    stats,
    totals,
    live,
    activityRake,
    activityChain,
    setActivityChain,
    handsChain,
    setHandsChain,
    actionDist,
}: StatsTabProps) => {
    const d   = stats?.data;
    const dt  = totals?.data;
    const lv  = live?.data;

    const chainLabel = (chain: 'base' | 'base-sepolia') => chain === 'base' ? 'Base' : 'Base Sepolia';

    const totalActions = actionDist
        ? Object.values(actionDist.distribution).reduce((a, b) => a + b, 0)
        : 0;

    const actionColors: Record<string, string> = {
        fold: 'brand.pink',
        check: 'brand.navy',
        call: 'brand.green',
        bet: 'brand.yellow',
        raise: 'orange.400',
        all_in: 'purple.400',
    };

    return (
        <VStack align="stretch" gap={6}>

            {/* Live now */}
            <Box>
                <Text {...eyebrowProps}>Live Now</Text>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                    <StatCard label="WS Connections"      value={lv?.active_connections}  accent="brand.green" />
                    <StatCard label="Tables in Memory"    value={lv?.hub_tables_in_memory} />
                    <StatCard label="Tables with Players" value={lv?.tables_with_players} />
                    <StatCard label="Active Players"      value={d?.active_players_count} />
                </Grid>
            </Box>

            {/* Waitlist */}
            <Box>
                <Text {...eyebrowProps}>Waitlist</Text>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                    <StatCard label="Email Subscribers" value={d?.waitlist_count} accent="brand.green" />
                    <StatCard
                        label="Dead Tables"
                        value={d?.dead_tables}
                        accent={d?.dead_tables ? 'brand.pink' : undefined}
                        helpText="Created in last 7d, never played — create→abandon friction"
                    />
                </Grid>
            </Box>

            {/* DAU / WAU / MAU — crypto only */}
            <Card title="Player Activity" subtitle={<Text fontSize="xs" color="text.secondary" _dark={{ color: 'whiteAlpha.600' }}>Crypto hands only · unique wallets</Text>}>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4} mb={4}>
                    <StatCard label="DAU (24 h)"  value={d?.dau}  accent="brand.green" />
                    <StatCard label="WAU (7 d)"   value={d?.wau} />
                    <StatCard label="MAU (30 d)"  value={d?.mau} />
                </Grid>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Box
                        bg="rgba(54,163,123,0.06)"
                        borderRadius="10px"
                        p={4}
                        border="1px solid"
                        borderColor="rgba(54,163,123,0.15)"
                        _dark={{ bg: 'rgba(54,163,123,0.10)', borderColor: 'rgba(54,163,123,0.25)' }}
                    >
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>New Players (24 h)</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color="brand.green" sx={tabular}>{fmt(d?.new_players_24h)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>first-ever crypto hand</Text>
                    </Box>
                    <Box
                        bg="rgba(235,11,92,0.04)"
                        borderRadius="10px"
                        p={4}
                        border="1px solid"
                        borderColor="rgba(235,11,92,0.12)"
                        _dark={{ bg: 'rgba(235,11,92,0.08)', borderColor: 'rgba(235,11,92,0.20)' }}
                    >
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Returning Players (24 h)</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color="brand.pink" sx={tabular}>{fmt(d?.returning_players_24h)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>played before today</Text>
                    </Box>
                </Grid>
            </Card>

            {/* Game Quality */}
            <Card title="Game Quality" subtitle={<Text fontSize="xs" color="text.secondary" _dark={{ color: 'whiteAlpha.600' }}>{chainLabel(activityChain)} · last 30 days</Text>}>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Avg Crypto Pot</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color="brand.green" sx={tabular}>{fmtPot(d?.avg_crypto_pot_30d)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>chips · 30 d</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Avg Rake / Hand</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color="brand.pink" sx={tabular}>{fmtPot(d?.avg_rake_per_hand_30d)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>chips · 30 d</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Median Rake / Hand</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color="brand.pink" sx={tabular}>{fmtPot(d?.median_rake_30d)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>chips · 30 d</Text>
                    </Box>
                </Grid>
            </Card>

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
                                <Th {...thProps} pl={0} minW="160px"></Th>
                                <Th {...thProps} isNumeric>24h</Th>
                                <Th {...thProps} isNumeric>7d</Th>
                                <Th {...thProps} isNumeric>30d</Th>
                                <Th {...thProps} isNumeric>All Time</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {/* Crypto rows */}
                            <Tr {...cryptoRowBg}>
                                <Td fontSize="sm" fontWeight="semibold" {...tdBorder} pl={0}>
                                    <HStack gap={1.5}>
                                        <Badge bg="brand.green" color="white" fontSize="xs" px={1.5} borderRadius="full">Crypto</Badge>
                                        <Text color="text.primary">Tables Created</Text>
                                    </HStack>
                                </Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_tables_24h)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_tables_7d)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_tables_30d)}</Td>
                                <Td fontSize="sm" fontWeight="extrabold" color="brand.green" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_tables_total)}</Td>
                            </Tr>
                            <Tr {...cryptoRowBg}>
                                <Td fontSize="sm" fontWeight="semibold" {...tdBorder} pl={0}>
                                    <HStack gap={1.5}>
                                        <Badge bg="brand.green" color="white" fontSize="xs" px={1.5} borderRadius="full">Crypto</Badge>
                                        <Text color="text.primary">Hands Played</Text>
                                    </HStack>
                                </Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_hands_24h)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_hands_7d)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_hands_30d)}</Td>
                                <Td fontSize="sm" fontWeight="extrabold" color="brand.green" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.crypto_hands_total)}</Td>
                            </Tr>
                            {/* Free rows */}
                            <Tr>
                                <Td fontSize="sm" fontWeight="semibold" {...tdBorder} pl={0}>
                                    <HStack gap={1.5}>
                                        <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={1.5} borderRadius="full" _dark={{ bg: 'whiteAlpha.200', color: 'whiteAlpha.800' }}>Free</Badge>
                                        <Text color="text.primary">Tables Created</Text>
                                    </HStack>
                                </Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_tables_24h)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_tables_7d)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_tables_30d)}</Td>
                                <Td fontSize="sm" fontWeight="extrabold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_tables_total)}</Td>
                            </Tr>
                            <Tr>
                                <Td fontSize="sm" fontWeight="semibold" {...tdBorder} pl={0}>
                                    <HStack gap={1.5}>
                                        <Badge bg="card.lightGray" color="text.secondary" fontSize="xs" px={1.5} borderRadius="full" _dark={{ bg: 'whiteAlpha.200', color: 'whiteAlpha.800' }}>Free</Badge>
                                        <Text color="text.primary">Hands Played</Text>
                                    </HStack>
                                </Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_hands_24h)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_hands_7d)}</Td>
                                <Td fontSize="sm" fontWeight="bold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_hands_30d)}</Td>
                                <Td fontSize="sm" fontWeight="extrabold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>{fmt(d?.free_hands_total)}</Td>
                            </Tr>
                            {/* Rake row — sourced from indexer GraphQL */}
                            <Tr {...rakeRowBg}>
                                <Td fontSize="sm" fontWeight="semibold" border="none" pl={0}>
                                    <HStack gap={1.5}>
                                        <Badge bg="brand.pink" color="white" fontSize="xs" px={1.5} borderRadius="full">Rake</Badge>
                                        <Text color="text.primary">Platform Rake (USDC)</Text>
                                    </HStack>
                                </Td>
                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink" sx={tabular}>{activityRake ? `$${activityRake.rake24hUsdc}` : '—'}</Td>
                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink" sx={tabular}>{activityRake ? `$${activityRake.rake7dUsdc}` : '—'}</Td>
                                <Td fontSize="sm" fontWeight="bold" border="none" isNumeric color="brand.pink" sx={tabular}>{activityRake ? `$${activityRake.rake30dUsdc}` : '—'}</Td>
                                <Td fontSize="sm" fontWeight="extrabold" border="none" isNumeric color="brand.pink" sx={tabular}>{activityRake ? `$${activityRake.rakeAllTimeUsdc}` : '—'}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Action Distribution */}
            {actionDist && totalActions > 0 && (
                <Card title="Action Distribution" subtitle={<Text fontSize="xs" color="text.secondary" _dark={{ color: 'whiteAlpha.600' }}>Player actions · last 7 days · {fmt(totalActions)} total</Text>}>
                    <Text fontSize="xs" color="text.secondary" mb={3} _dark={{ color: 'whiteAlpha.600' }}>
                        Game health signal — if fold % exceeds ~80%, stakes may be too high or players are mismatched.
                    </Text>
                    <VStack align="stretch" gap={2}>
                        {(['fold', 'check', 'call', 'bet', 'raise', 'all_in'] as const).map((action) => {
                            const count = actionDist.distribution[action] ?? 0;
                            const pct = totalActions ? (count / totalActions) * 100 : 0;
                            const color = actionColors[action] ?? 'brand.green';
                            return (
                                <Box key={action}>
                                    <Flex justify="space-between" mb={1}>
                                        <Text fontSize="xs" fontWeight="semibold" color="text.primary" textTransform="capitalize">{action.replace('_', ' ')}</Text>
                                        <HStack gap={2}>
                                            <Text fontSize="xs" color="text.secondary" sx={tabular}>{fmt(count)}</Text>
                                            <Text fontSize="xs" fontWeight="bold" color={color} sx={tabular} w="38px" textAlign="right">{fmtPct(count, totalActions)}</Text>
                                        </HStack>
                                    </Flex>
                                    <Tooltip label={`${fmtPct(count, totalActions)} of all actions`} hasArrow>
                                        <Box
                                            h="6px"
                                            borderRadius="full"
                                            bg="card.lightGray"
                                            _dark={{ bg: 'whiteAlpha.100' }}
                                            overflow="hidden"
                                        >
                                            <Box
                                                h="full"
                                                borderRadius="full"
                                                bg={color}
                                                w={`${pct}%`}
                                                transition="width 0.4s ease"
                                            />
                                        </Box>
                                    </Tooltip>
                                </Box>
                            );
                        })}
                    </VStack>
                </Card>
            )}

            {/* Unique Players + Total Hands — chain-filtered */}
            <Card
                title="All-time Totals"
                subtitle={<ChainSelector value={handsChain} onChange={setHandsChain} />}
            >
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Unique Wallets</Text>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="extrabold" color="text.primary" lineHeight={1} noOfLines={1} sx={tabular}>{fmt(dt?.unique_wallets)}</Text>
                        <Box mt={1}><ChainBadge chain={handsChain} size="sm" /></Box>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Total Hands Played</Text>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="extrabold" color="brand.green" lineHeight={1} noOfLines={1} sx={tabular}>{fmt(dt?.total_hands_played)}</Text>
                        <Box mt={1}><ChainBadge chain={handsChain} size="sm" /></Box>
                    </Box>
                </Grid>
            </Card>

        </VStack>
    );
};
