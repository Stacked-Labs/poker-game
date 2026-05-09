'use client';

import {
    Text,
    Flex,
    Box,
    Tooltip,
    HStack,
    VStack,
    Grid,
} from '@chakra-ui/react';
import ExternalLink from '../ExternalLink';
import { Card, ChainSelector, ServiceCard, StatusDot, stateOk } from './Primitives';
import { SettlementSection } from './SettlementSection';
import type {
    AdminHealthResponse,
    SettlementHealthResponse,
    IndexerHealthData,
} from '../../stats/types';

interface HealthTabProps {
    health: AdminHealthResponse | null;
    settle: SettlementHealthResponse | null;
    indexer: IndexerHealthData | null;
    settlementChain: 'base-sepolia' | 'base';
    setSettlementChain: (v: 'base' | 'base-sepolia') => void;
    indexerChain: 'base-sepolia' | 'base';
    setIndexerChain: (v: 'base' | 'base-sepolia') => void;
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

const cardBorder = {
    borderColor: 'card.lightGray',
    _dark: { borderColor: 'whiteAlpha.200' },
};

const cardShadow = {
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    _dark: { boxShadow: '0 2px 12px rgba(0,0,0,0.45)' },
};

const alertBorder = {
    borderColor: 'brand.pink',
};

const alertShadow = {
    boxShadow: '0 2px 12px rgba(235,11,92,0.12)',
    _dark: { boxShadow: '0 2px 16px rgba(235,11,92,0.28)' },
};

const mutedColor = { color: 'gray.500', _dark: { color: 'whiteAlpha.500' } } as const;
const warnColor  = { color: 'brand.yellow', _dark: { color: 'brand.yellow' } } as const;

const stateTone = (state: string) => {
    switch (state) {
        case 'operational': return { color: 'brand.green' as const };
        case 'degraded':    return warnColor;
        case 'downtime':    return { color: 'brand.pink' as const };
        default:            return mutedColor;
    }
};

export const HealthTab = ({
    health,
    settle,
    indexer,
    settlementChain,
    setSettlementChain,
    indexerChain,
    setIndexerChain,
}: HealthTabProps) => {
    const pg  = health?.postgres;
    const rd  = health?.redis;
    const tw  = health?.thirdweb;
    const hub = health?.hub;

    const engineStatus = health?.engine.status;
    const engineOk = engineStatus === 'configured';

    return (
        <VStack align="stretch" gap={8}>

            <Box>
                <Text {...eyebrowProps}>Services</Text>
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
                            {...(ok ? cardBorder : alertBorder)}
                            {...(ok ? cardShadow : alertShadow)}
                        >
                            <HStack gap={2} mb={2}>
                                <StatusDot ok={ok} />
                                <Text fontSize="sm" fontWeight="extrabold" color="text.primary">{name}</Text>
                            </HStack>
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                _dark={{ color: 'whiteAlpha.700' }}
                                sx={tabular}
                            >
                                {detail}
                            </Text>
                        </Box>
                    ))}
                </Grid>
            </Box>

            <Box>
                <Text {...eyebrowProps}>Settlement</Text>
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
            </Box>

            <Box>
                <Text {...eyebrowProps}>Service Detail</Text>
                <VStack align="stretch" gap={5}>
                    <Flex gap={5} direction={{ base: 'column', md: 'row' }}>
                        <ServiceCard
                            name="PostgreSQL"
                            ok={pg?.status === 'connected'}
                            rows={[
                                { label: 'Status',      value: <Text fontWeight="bold" color={pg?.status === 'connected' ? 'brand.green' : 'brand.pink'} textTransform="capitalize">{pg?.status ?? '—'}</Text> },
                                { label: 'Latency',     value: pg ? `${pg.latency_ms} ms` : '—', mono: true },
                                { label: 'Pool Idle',   value: pg?.pool_idle   ?? '—', mono: true },
                                { label: 'Pool Active', value: pg?.pool_active ?? '—', mono: true },
                            ]}
                        />
                        <ServiceCard
                            name="Redis"
                            ok={rd?.status === 'connected'}
                            rows={[
                                { label: 'Status',      value: <Text fontWeight="bold" color={rd?.status === 'connected' ? 'brand.green' : 'brand.pink'} textTransform="capitalize">{rd?.status ?? '—'}</Text> },
                                { label: 'Latency',     value: rd ? `${rd.latency_ms} ms` : '—', mono: true },
                                { label: 'Memory Used', value: rd?.memory_used || '—', mono: true },
                                { label: 'Connections', value: rd?.connected_clients != null && rd?.max_clients
                                    ? <Text fontWeight="bold" color={rd.connected_clients / rd.max_clients >= 0.8 ? 'brand.pink' : 'text.primary'} sx={tabular}>{rd.connected_clients} / {rd.max_clients} ({Math.round(rd.connected_clients / rd.max_clients * 100)}%)</Text>
                                    : '—', mono: true },
                            ]}
                        >
                            {rd?.streams && Object.keys(rd.streams).length > 0 && (
                                <Box mt={4}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="extrabold"
                                        color="text.secondary"
                                        _dark={{ color: 'whiteAlpha.700' }}
                                        textTransform="uppercase"
                                        letterSpacing="0.08em"
                                        mb={2}
                                    >
                                        Redis Streams
                                    </Text>
                                    <VStack align="stretch" gap={2}>
                                        {Object.entries(rd.streams).map(([stream, count]) => (
                                            <Flex
                                                key={stream}
                                                justify="space-between"
                                                align="center"
                                                py={2}
                                                px={3}
                                                bg="card.lightGray"
                                                borderRadius="8px"
                                            >
                                                <Tooltip label={stream} hasArrow>
                                                    <Text fontSize="sm" color="text.secondary" fontFamily="mono" noOfLines={1}>
                                                        {stream.replace('poker:', '')}
                                                    </Text>
                                                </Tooltip>
                                                <Text fontSize="sm" fontWeight="semibold" color="text.primary" fontFamily="mono" sx={tabular}>{count}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                            )}
                        </ServiceCard>
                    </Flex>

                    <Flex gap={5} direction={{ base: 'column', md: 'row' }}>
                        <ServiceCard
                            name="Game Hub"
                            ok={true}
                            rows={[
                                { label: 'Tables in Memory', value: hub?.tables_in_memory ?? '—', mono: true },
                                { label: 'WS Connections',   value: hub?.ws_connections   ?? '—', mono: true },
                                { label: 'Engine',           value: <Text fontWeight="bold" {...(engineStatus ? (engineOk ? { color: 'brand.green' } : mutedColor) : mutedColor)} textTransform="capitalize">{engineStatus ?? '—'}</Text> },
                            ]}
                        />
                        <ServiceCard
                            name="thirdweb"
                            ok={stateOk(tw?.aggregate_state ?? 'unknown')}
                            rows={[
                                {
                                    label: 'Status',
                                    value: (
                                        <Text
                                            fontWeight="bold"
                                            {...stateTone(tw?.aggregate_state ?? 'unknown')}
                                            textTransform="capitalize"
                                        >
                                            {tw?.aggregate_state ?? '—'}
                                        </Text>
                                    ),
                                },
                            ]}
                        >
                            {tw?.url && (
                                <Box mt={3} px={3} py={2} bg="card.lightGray" borderRadius="8px" _dark={{ bg: 'whiteAlpha.50' }}>
                                    <ExternalLink href={tw.url} fontSize="sm" fontFamily="mono" iconSize="12px">
                                        {tw.url.replace('https://', '')}
                                    </ExternalLink>
                                </Box>
                            )}
                            {(tw?.degraded_services ?? []).length > 0 && (
                                <Box mt={4}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="extrabold"
                                        color="brand.pink"
                                        textTransform="uppercase"
                                        letterSpacing="0.08em"
                                        mb={2}
                                    >
                                        Affected Services
                                    </Text>
                                    <VStack align="stretch" gap={2}>
                                        {(tw?.degraded_services ?? []).map((svc, i) => (
                                            <Flex
                                                key={i}
                                                align="center"
                                                gap={2}
                                                py={2}
                                                px={3}
                                                bg="card.lightGray"
                                                borderRadius="8px"
                                            >
                                                <StatusDot ok={false} />
                                                <Text fontSize="sm" color="text.primary">{svc}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                            )}
                        </ServiceCard>
                    </Flex>
                </VStack>
            </Box>

            <Box>
                <Text {...eyebrowProps}>Indexer</Text>
                <Box
                    bg="card.white"
                    borderRadius="16px"
                    p={6}
                    border="1px solid"
                    {...(indexer?.healthy ?? true ? cardBorder : alertBorder)}
                    {...(indexer?.healthy ?? true ? cardShadow : alertShadow)}
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
                            {
                                label: 'Status',
                                value: indexer === null
                                    ? <Text fontWeight="bold" {...mutedColor}>—</Text>
                                    : <Text fontWeight="bold" color={indexer.healthy ? 'brand.green' : 'brand.pink'}>{indexer.healthy ? 'In sync' : 'Lagging'}</Text>,
                            },
                            { label: 'Indexed Block', value: indexer?.height?.toLocaleString() ?? '—',  mono: true },
                            { label: 'Chain Tip',     value: indexer?.chainTip?.toLocaleString() ?? '—', mono: true },
                            { label: 'Lag (blocks)',  value: indexer?.lag !== null && indexer?.lag !== undefined ? String(indexer.lag) : '—', mono: true },
                            { label: 'Hands Indexed', value: indexer?.totalHands?.toLocaleString() ?? '—', mono: true },
                            { label: 'Total Rake',    value: indexer ? `$${indexer.rakeAllTimeUsdc} USDC` : '—', mono: true },
                        ].map(({ label, value, mono }) => (
                            <Flex
                                key={label}
                                justify="space-between"
                                align="center"
                                py={2}
                                px={3}
                                bg="card.lightGray"
                                borderRadius="8px"
                            >
                                <Text fontSize="sm" color="text.secondary">{label}</Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="text.primary"
                                    fontFamily={mono ? 'mono' : undefined}
                                    sx={mono ? tabular : undefined}
                                >
                                    {value}
                                </Text>
                            </Flex>
                        ))}
                    </VStack>
                </Box>
            </Box>

        </VStack>
    );
};
