'use client';

import { useMemo } from 'react';
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
    FiArrowDownLeft,
    FiArrowUpRight,
    FiCheckCircle,
    FiDollarSign,
    FiFlag,
    FiLogIn,
    FiLogOut,
    FiPercent,
    FiZap,
} from 'react-icons/fi';
import type { IconType } from 'react-icons/lib/iconBase';
import SectionCard from './SectionCard';
import ExternalLink from '@/app/components/ExternalLink';
import {
    formatRelativeTime,
    formatUsdc,
    truncateAddress,
    truncateHash,
} from './formatters';
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
    blockTimes: Map<string, number>;
}

const EVENT_META: Record<
    OnchainEventName,
    { icon: IconType; color: string; label: string }
> = {
    PlayerDeposited: {
        icon: FiArrowDownLeft,
        color: 'brand.green',
        label: 'Deposit',
    },
    PlayerWithdrew: {
        icon: FiArrowUpRight,
        color: 'brand.navy',
        label: 'Withdraw',
    },
    PlayerSeated: { icon: FiLogIn, color: 'brand.green', label: 'Seated' },
    PlayerLeft: { icon: FiLogOut, color: 'text.muted', label: 'Left seat' },
    ChipsSettled: {
        icon: FiCheckCircle,
        color: 'brand.green',
        label: 'Hand settled',
    },
    RakeDistributed: {
        icon: FiPercent,
        color: 'brand.yellow',
        label: 'Rake split',
    },
    HostRakeWithdrawn: {
        icon: FiDollarSign,
        color: 'brand.yellow',
        label: 'Host collected rake',
    },
    EmergencyWithdrawal: {
        icon: FiZap,
        color: 'brand.pink',
        label: 'Emergency withdraw',
    },
    EmergencyWithdrawAll: {
        icon: FiZap,
        color: 'brand.pink',
        label: 'Emergency withdraw all',
    },
    BlindsUpdated: {
        icon: FiFlag,
        color: 'brand.navy',
        label: 'Blinds updated',
    },
    TableClosed: { icon: FiFlag, color: 'text.muted', label: 'Table closed' },
};

function describeEvent(ev: OnchainEventRow): string {
    const a = ev.args;
    switch (ev.eventName) {
        case 'PlayerDeposited': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} deposited $${formatUsdc(usdc ?? null)} USDC`;
        }
        case 'PlayerWithdrew': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} withdrew $${formatUsdc(usdc ?? null)} USDC`;
        }
        case 'PlayerSeated':
            return `${truncateAddress(a.player as string)} took a seat`;
        case 'PlayerLeft':
            return `${truncateAddress(a.player as string)} left the table`;
        case 'ChipsSettled': {
            const handId = a.handId as bigint | undefined;
            const players = (a.players as string[] | undefined) ?? [];
            return `Hand #${handId?.toString() ?? '?'} settled · ${players.length} players`;
        }
        case 'RakeDistributed': {
            const handId = a.handId as bigint | undefined;
            const total = a.totalRake as bigint | undefined;
            const host = a.hostRake as bigint | undefined;
            return `Hand #${handId?.toString() ?? '?'} · $${formatUsdc(total ?? null)} rake ($${formatUsdc(host ?? null)} to host)`;
        }
        case 'HostRakeWithdrawn': {
            const amount = a.amount as bigint | undefined;
            return `Host collected $${formatUsdc(amount ?? null)} USDC`;
        }
        case 'EmergencyWithdrawal': {
            const player = a.player as string | undefined;
            const usdc = a.usdcAmount as bigint | undefined;
            return `${truncateAddress(player)} self-withdrew $${formatUsdc(usdc ?? null)} USDC`;
        }
        case 'EmergencyWithdrawAll': {
            const total = a.totalWithdrownUSDC as bigint | undefined;
            return `Emergency drain · $${formatUsdc(total ?? null)} USDC returned to players`;
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
    blockTimes,
}: TransactionHistoryListProps) => {
    const groups = useMemo(() => events, [events]);

    return (
        <SectionCard
            title="Onchain activity"
            subtitle="Every deposit, settlement, rake split, and withdrawal — straight from the chain."
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
                <Text fontSize="xs" color="red.500">
                    {error}
                </Text>
            ) : events.length === 0 ? (
                <Text fontSize="xs" color="text.muted">
                    No onchain activity yet. The first deposit will appear here.
                </Text>
            ) : (
                <Flex direction="column" gap={1.5}>
                    {groups.map((ev) => {
                        const meta = EVENT_META[ev.eventName];
                        const tsMs = blockTimes.get(ev.blockNumber.toString());
                        const txUrl = explorerForTx(ev.txHash);
                        return (
                            <Flex
                                key={`${ev.txHash}-${ev.logIndex}`}
                                align="center"
                                gap={3}
                                px={{ base: 2, md: 2.5 }}
                                py={{ base: 2, md: 2.5 }}
                                borderRadius="10px"
                                _hover={{ bg: 'card.lightGray' }}
                                transition="background-color 80ms ease"
                            >
                                <Icon
                                    as={meta.icon}
                                    color={meta.color}
                                    boxSize={4}
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
                                        {describeEvent(ev)}
                                    </Text>
                                    <HStack
                                        spacing={1.5}
                                        fontSize="2xs"
                                        color="text.muted"
                                        mt={0.5}
                                    >
                                        <Text>{meta.label}</Text>
                                        {tsMs ? (
                                            <>
                                                <Text opacity={0.4}>·</Text>
                                                <Text>
                                                    {formatRelativeTime(tsMs)}
                                                </Text>
                                            </>
                                        ) : null}
                                        <Text opacity={0.4}>·</Text>
                                        <Text>
                                            block {ev.blockNumber.toString()}
                                        </Text>
                                    </HStack>
                                </Box>
                                {txUrl ? (
                                    <ExternalLink
                                        href={txUrl}
                                        fontSize="2xs"
                                        iconSize="10px"
                                        fontFamily="mono"
                                    >
                                        {truncateHash(ev.txHash)}
                                    </ExternalLink>
                                ) : (
                                    <Text
                                        fontSize="2xs"
                                        fontFamily="mono"
                                        color="text.muted"
                                    >
                                        {truncateHash(ev.txHash)}
                                    </Text>
                                )}
                            </Flex>
                        );
                    })}
                </Flex>
            )}
            {(hasMore || loading) && events.length > 0 && (
                <Flex justify="center" pt={3}>
                    <Button
                        size="sm"
                        variant="ghost"
                        color="text.secondary"
                        fontSize="xs"
                        fontWeight="semibold"
                        isLoading={loading}
                        loadingText="Scanning…"
                        onClick={onLoadMore}
                        isDisabled={!hasMore || loading}
                    >
                        {hasMore ? 'Load older activity' : 'Reached contract birth'}
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

export default TransactionHistoryList;
