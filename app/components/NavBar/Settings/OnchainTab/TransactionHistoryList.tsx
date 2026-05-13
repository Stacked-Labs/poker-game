'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Spinner,
    Text,
} from '@chakra-ui/react';
import {
    FiActivity,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiCheckCircle,
    FiFlag,
    FiLogIn,
    FiLogOut,
    FiZap,
} from 'react-icons/fi';
import type { IconType } from 'react-icons/lib/iconBase';
import SectionCard from './SectionCard';
import ExternalLink from '@/app/components/ExternalLink';
import { formatUsdc, truncateAddress, truncateHash } from './formatters';
import type {
    OnchainEventName,
    OnchainEventRow,
} from '@/app/hooks/useOnchainTableEvents';

interface TransactionHistoryListProps {
    events: OnchainEventRow[];
    loading: boolean;
    initialLoading: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
    explorerForTx: (hash: string) => string | null;
}

interface EventMeta {
    icon: IconType;
    color: string;
    darkColor?: string;
    label: string;
}

const EVENT_META: Record<OnchainEventName, EventMeta> = {
    PlayerDeposited: {
        icon: FiArrowDownLeft,
        color: 'brand.green',
        label: 'Deposit',
    },
    PlayerWithdrew: {
        icon: FiArrowUpRight,
        color: 'brand.navy',
        darkColor: 'brand.lightGray',
        label: 'Withdraw',
    },
    PlayerSeated: {
        icon: FiLogIn,
        color: 'brand.green',
        label: 'Seated',
    },
    PlayerLeft: {
        icon: FiLogOut,
        color: 'text.muted',
        label: 'Left',
    },
    ChipsSettled: {
        icon: FiCheckCircle,
        color: 'brand.green',
        label: 'Settled',
    },
    RakeDistributed: {
        icon: FiCheckCircle,
        color: 'brand.green',
        label: 'Settled',
    },
    HostRakeWithdrawn: {
        icon: FiArrowUpRight,
        color: 'brand.navy',
        darkColor: 'brand.lightGray',
        label: 'Host payout',
    },
    EmergencyWithdrawal: {
        icon: FiZap,
        color: 'brand.pink',
        label: 'Emergency',
    },
    EmergencyWithdrawAll: {
        icon: FiZap,
        color: 'brand.pink',
        label: 'Emergency',
    },
    BlindsUpdated: {
        icon: FiFlag,
        color: 'brand.navy',
        darkColor: 'brand.lightGray',
        label: 'Blinds',
    },
    TableClosed: {
        icon: FiFlag,
        color: 'text.muted',
        label: 'Closed',
    },
};

function describeEvent(ev: OnchainEventRow): string {
    const a = ev.args;
    switch (ev.eventName) {
        case 'PlayerDeposited': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} deposited $${formatUsdc(usdc ?? null)}`;
        }
        case 'PlayerWithdrew': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} withdrew $${formatUsdc(usdc ?? null)}`;
        }
        case 'PlayerSeated':
            return `${truncateAddress(a.player as string)} took a seat`;
        case 'PlayerLeft':
            return `${truncateAddress(a.player as string)} left the table`;
        case 'ChipsSettled': {
            const handId = a.handId as bigint | undefined;
            const players = (a.players as string[] | undefined) ?? [];
            return `Hand #${handId?.toString() ?? '?'} · ${players.length} players`;
        }
        case 'RakeDistributed': {
            const handId = a.handId as bigint | undefined;
            return `Hand #${handId?.toString() ?? '?'} settled`;
        }
        case 'HostRakeWithdrawn': {
            const amount = a.amount as bigint | undefined;
            return `Host collected $${formatUsdc(amount ?? null)}`;
        }
        case 'EmergencyWithdrawal': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} self-withdrew $${formatUsdc(usdc ?? null)}`;
        }
        case 'EmergencyWithdrawAll': {
            const total = a.totalWithdrownUSDC as bigint | undefined;
            return `Emergency drain · $${formatUsdc(total ?? null)}`;
        }
        case 'BlindsUpdated': {
            const sb = a.newSmallBlind as bigint | undefined;
            const bb = a.newBigBlind as bigint | undefined;
            return `Blinds set to ${sb?.toString() ?? '?'} / ${bb?.toString() ?? '?'}`;
        }
        case 'TableClosed':
            return 'Table closed';
        default:
            return ev.eventName;
    }
}

const TransactionHistoryList = ({
    events,
    loading,
    initialLoading,
    error,
    hasMore,
    onLoadMore,
    explorerForTx,
}: TransactionHistoryListProps) => {
    return (
        <SectionCard
            icon={FiActivity}
            title="Activity"
            subtitle="Every deposit, settlement, and withdrawal — straight from the chain."
            accent="navy"
        >
            {initialLoading && events.length === 0 ? (
                <HStack spacing={2} py={4}>
                    <Spinner size="sm" color="brand.navy" thickness="2px" />
                    <Text fontSize="xs" color="text.muted">
                        Scanning the chain…
                    </Text>
                </HStack>
            ) : error && events.length === 0 ? (
                <Text fontSize="xs" color="red.500" _dark={{ color: 'red.300' }}>
                    {error}
                </Text>
            ) : events.length === 0 ? (
                <Text fontSize="xs" color="text.muted">
                    No onchain activity yet. The first deposit will appear here.
                </Text>
            ) : (
                <Flex direction="column" gap={0.5}>
                    {events.map((ev) => (
                        <ActivityRow
                            key={`${ev.txHash}-${ev.logIndex}`}
                            event={ev}
                            explorerForTx={explorerForTx}
                        />
                    ))}
                </Flex>
            )}
            {(hasMore || loading) && events.length > 0 && (
                <Flex justify="center" pt={3}>
                    <Button
                        size="xs"
                        variant="ghost"
                        fontWeight="semibold"
                        isLoading={loading}
                        loadingText="Scanning…"
                        onClick={onLoadMore}
                        isDisabled={!hasMore || loading}
                    >
                        <Text fontSize="xs" fontWeight="semibold" color="text.secondary">
                            {hasMore ? 'Load older' : 'Reached contract birth'}
                        </Text>
                    </Button>
                </Flex>
            )}
            {!hasMore && events.length > 0 && !loading && (
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    textAlign="center"
                    pt={3}
                    opacity={0.7}
                >
                    You&apos;ve reached the contract&apos;s first block.
                </Text>
            )}
        </SectionCard>
    );
};

const ActivityRow = ({
    event,
    explorerForTx,
}: {
    event: OnchainEventRow;
    explorerForTx: (hash: string) => string | null;
}) => {
    const meta = EVENT_META[event.eventName];
    const txUrl = explorerForTx(event.txHash);
    return (
        <Flex
            align="center"
            gap={2.5}
            px={{ base: 2, md: 2.5 }}
            py={2}
            borderRadius="10px"
            _hover={{ bg: 'card.lightGray' }}
            transition="background-color 80ms ease"
        >
            <Icon
                as={meta.icon}
                boxSize={3.5}
                color={meta.color}
                _dark={meta.darkColor ? { color: meta.darkColor } : undefined}
                flexShrink={0}
            />
            <Box minW={0} flex={1}>
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="text.secondary"
                    lineHeight="1.3"
                    noOfLines={1}
                >
                    {describeEvent(event)}
                </Text>
                <HStack spacing={1.5} mt={0.5}>
                    <Text fontSize="2xs" color="text.muted">
                        {meta.label}
                    </Text>
                    <Text fontSize="2xs" color="text.muted" opacity={0.4}>
                        ·
                    </Text>
                    <Text fontSize="2xs" color="text.muted">
                        block {event.blockNumber.toString()}
                    </Text>
                </HStack>
            </Box>
            {txUrl ? (
                <ExternalLink
                    href={txUrl}
                    fontSize="2xs"
                    iconSize="9px"
                    fontFamily="mono"
                >
                    {truncateHash(event.txHash)}
                </ExternalLink>
            ) : (
                <Text fontSize="2xs" fontFamily="mono" color="text.muted">
                    {truncateHash(event.txHash)}
                </Text>
            )}
        </Flex>
    );
};

export default TransactionHistoryList;
