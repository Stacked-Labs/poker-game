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
} from '@chakra-ui/react';
import { Card, ChainSelector, StatCard, fmt } from './Primitives';
import type {
    AdminStatsResponse,
    AdminLiveStatsResponse,
    IndexerHealthData,
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

export const StatsTab = ({
    stats,
    totals,
    live,
    activityRake,
    activityChain,
    setActivityChain,
    handsChain,
    setHandsChain,
}: StatsTabProps) => {
    const d   = stats?.data;
    const dt  = totals?.data;
    const lv  = live?.data;

    const chainLabel = (chain: 'base' | 'base-sepolia') => chain === 'base' ? 'Base' : 'Base Sepolia';

    return (
        <VStack align="stretch" gap={6}>

            {/* Live now */}
            <Box>
                <Text {...eyebrowProps}>
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
                <Text {...eyebrowProps}>
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

            {/* Unique Players + Total Hands — chain-filtered */}
            <Card
                title="All-time Totals"
                subtitle={<ChainSelector value={handsChain} onChange={setHandsChain} />}
            >
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Unique Wallets</Text>
                        <Text fontSize="3xl" fontWeight="extrabold" color="text.primary" lineHeight={1} sx={tabular}>{fmt(dt?.unique_wallets)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>{chainLabel(handsChain)}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" mb={1} _dark={{ color: 'whiteAlpha.700' }}>Total Hands Played</Text>
                        <Text fontSize="3xl" fontWeight="extrabold" color="brand.green" lineHeight={1} sx={tabular}>{fmt(dt?.total_hands_played)}</Text>
                        <Text fontSize="xs" color="text.secondary" mt={1} _dark={{ color: 'whiteAlpha.600' }}>{chainLabel(handsChain)}</Text>
                    </Box>
                </Grid>
            </Card>


        </VStack>
    );
};
