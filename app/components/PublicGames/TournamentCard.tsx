'use client';

import {
    Badge,
    Box,
    Button,
    Flex,
    HStack,
    Spinner,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import type { Tournament } from '../../hooks/server_actions';
import type { PendingTournamentTx } from '../../hooks/usePendingTournamentTxs';
import ExternalLink from '../ExternalLink';

interface TournamentCardProps {
    tournament: Tournament;
    myWallet?: string;
    onRegister: (id: number) => void;
    onUnregister: (id: number) => void;
    onGoToTable: (id: number) => void;
    onViewOverview: (id: number) => void;
    onFundGuarantee?: (id: number) => void;
    registeredIds: Set<number>;
    isEliminated?: boolean;
    isLoading?: boolean;
    isGoingToTable?: boolean;
    pendingTx?: PendingTournamentTx;
    explorerUrl?: (tx: PendingTournamentTx) => string;
    onCardClick?: (id: number) => void;
}

function statusColor(status: string): string {
    switch (status) {
        case 'registration': return 'green';
        case 'running': return 'blue';
        case 'completed': return 'gray';
        case 'cancelled': return 'red';
        default: return 'gray';
    }
}

function formatStartTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export default function TournamentCard({
    tournament: t,
    myWallet,
    onRegister,
    onUnregister,
    onGoToTable,
    onViewOverview,
    onFundGuarantee,
    registeredIds,
    isEliminated = false,
    isLoading,
    isGoingToTable,
    pendingTx,
    explorerUrl,
    onCardClick,
}: TournamentCardProps) {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const borderColor = useColorModeValue('rgba(11,20,48,0.08)', 'rgba(255,255,255,0.08)');
    const mutedColor = useColorModeValue('text.muted', 'text.muted');

    const now = new Date();
    const lateRegCloseAt = new Date(t.late_reg_close_at);
    const scheduledStartAt = new Date(t.scheduled_start_at);
    const fiveMinBeforeStart = new Date(scheduledStartAt.getTime() - 5 * 60 * 1000);

    const hasPendingRegister = pendingTx?.type === 'register';
    const isRegistered = registeredIds.has(t.id) || hasPendingRegister;
    const isHost = myWallet && t.host_wallet.toLowerCase() === myWallet.toLowerCase();
    // Late reg is open when the tournament is running, levels are configured, and the
    // estimated close time (scheduledStart + sum of first N level durations) hasn't passed.
    const isLateRegOpen = t.status === 'running' && (t.late_reg_levels ?? 0) > 0 && now < lateRegCloseAt;
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateRegister = isLateRegOpen && !isRegistered && !pendingTx;
    const isFreePlay = t.buy_in_usdc === 0;
    const canUnregister = t.status === 'registration' && isRegistered && !hasPendingRegister && (isFreePlay || now < fiveMinBeforeStart);
    const canFundGuarantee = isHost && t.status === 'pending' && t.guarantee_usdc > 0 && !!t.contract_address;

    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';
    const buyInLabel = isFreePlay ? 'Free play' : `${(t.buy_in_usdc / 1_000_000).toFixed(2)} USDC`;

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
            _hover={{ borderColor: 'brand.green', transition: 'border-color 150ms ease' }}
            cursor={onCardClick ? 'pointer' : undefined}
            onClick={onCardClick ? () => onCardClick(t.id) : undefined}
        >
            <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="flex-start">
                    <VStack align="start" spacing={0.5} minW={0}>
                        <Text fontWeight="bold" fontSize="md" color="text.primary" noOfLines={1}>
                            {t.name || (isFreePlay ? 'Free-Play MTT' : `MTT — ${buyInLabel}`)}
                        </Text>
                        <HStack spacing={1}>
                            <Text fontSize="xs" color={mutedColor} textTransform="capitalize">
                                {blindLabel} blinds · NLH
                            </Text>
                            {t.chain && (
                                <Badge colorScheme="purple" borderRadius="full" px={1.5} py="1px" fontSize="2xs">
                                    {t.chain === 'base' ? 'Base' : 'Sepolia'}
                                </Badge>
                            )}
                            {t.is_private && (
                                <Badge colorScheme="orange" borderRadius="full" px={1.5} py="1px" fontSize="2xs">
                                    🔒
                                </Badge>
                            )}
                        </HStack>
                    </VStack>
                    <HStack spacing={1} flexShrink={0}>
                        {isRegistered && t.status === 'registration' && (
                            <Badge colorScheme="green" borderRadius="full" px={2} py="2px" fontSize="2xs">
                                Registered
                            </Badge>
                        )}
                        {isRegistered && t.status === 'running' && !isEliminated && (
                            <Badge colorScheme="blue" borderRadius="full" px={2} py="2px" fontSize="2xs">
                                Playing
                            </Badge>
                        )}
                        {isRegistered && t.status === 'running' && isEliminated && (
                            <Badge colorScheme="gray" borderRadius="full" px={2} py="2px" fontSize="2xs">
                                Out
                            </Badge>
                        )}
                        <Badge
                            colorScheme={statusColor(t.status)}
                            borderRadius="full"
                            px={2}
                            py="2px"
                            fontSize="2xs"
                            textTransform="capitalize"
                        >
                            {t.status}
                        </Badge>
                    </HStack>
                </HStack>

                <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                    <Text>Players</Text>
                    <Text fontWeight="semibold" color="text.primary">
                        {t.registered_count ?? 0}/{t.max_entries}
                        <Text as="span" fontWeight="normal" color={mutedColor}> (min {t.min_entries})</Text>
                    </Text>
                </Flex>

                {t.starting_stack_bb > 0 && (
                    <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                        <Text>Starting chips</Text>
                        <Text fontWeight="semibold" color="text.primary">
                            {(t.starting_stack ?? 10000).toLocaleString()} / {t.starting_stack_bb}BB
                        </Text>
                    </Flex>
                )}

                {!isFreePlay && t.fee_bps > 0 && (
                    <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                        <Text>Fee</Text>
                        <Text fontWeight="semibold" color="text.primary">
                            {(t.fee_bps / 100).toFixed(0)}%
                        </Text>
                    </Flex>
                )}

                <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                    <Text>Starts</Text>
                    <Text fontWeight="semibold" color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatStartTime(t.scheduled_start_at)}
                    </Text>
                </Flex>

                {isLateRegOpen && (
                    <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                        <Text>Late reg closes</Text>
                        <Text fontWeight="semibold" color="yellow.500"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatStartTime(t.late_reg_close_at)}
                        </Text>
                    </Flex>
                )}

                {t.guarantee_usdc > 0 && (
                    <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                        <Text>Guarantee</Text>
                        <Text fontWeight="semibold" color="brand.green">
                            ${(t.guarantee_usdc / 1_000_000).toFixed(0)} GTD
                        </Text>
                    </Flex>
                )}

                <HStack spacing={2} pt={1} flexWrap="wrap" onClick={(e) => e.stopPropagation()}>
                    {canFundGuarantee && (
                        <Button
                            size="sm"
                            colorScheme="green"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onFundGuarantee?.(t.id)}
                        >
                            Fund ${(t.guarantee_usdc / 1_000_000).toFixed(0)} GTD &amp; Open
                        </Button>
                    )}
                    {canRegister && (
                        <Button
                            size="sm"
                            colorScheme="green"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onRegister(t.id)}
                        >
                            Register
                        </Button>
                    )}
                    {canLateRegister && (
                        <Button
                            size="sm"
                            colorScheme="yellow"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onRegister(t.id)}
                        >
                            Late Reg
                        </Button>
                    )}
                    {canUnregister && (
                        <Button
                            size="sm"
                            variant="outline"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onUnregister(t.id)}
                        >
                            Unregister
                        </Button>
                    )}
                    {pendingTx && (
                        <Tooltip
                            label={`Transaction confirmed on-chain. Waiting for indexer to sync…`}
                            placement="top"
                            hasArrow
                        >
                            <HStack
                                spacing={1.5}
                                fontSize="xs"
                                color="yellow.500"
                                fontWeight="semibold"
                                alignSelf="center"
                                flex={1}
                                justify="center"
                                cursor="default"
                            >
                                <Spinner size="xs" color="yellow.500" speed="0.9s" />
                                {explorerUrl ? (
                                    <ExternalLink href={explorerUrl(pendingTx)} fontSize="xs" color="yellow.500">
                                        Syncing…
                                    </ExternalLink>
                                ) : (
                                    <Text>Syncing…</Text>
                                )}
                            </HStack>
                        </Tooltip>
                    )}
                    {!pendingTx && t.status === 'registration' && isRegistered && (
                        <Text fontSize="xs" color="brand.green" fontWeight="semibold" alignSelf="center">
                            ✓ Registered
                        </Text>
                    )}
                    {(t.status === 'running' || t.status === 'completed') && (
                        <>
                            {t.status === 'running' && isRegistered && !isEliminated && (
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    flex={1}
                                    isLoading={isGoingToTable}
                                    loadingText="Finding table…"
                                    onClick={() => onGoToTable(t.id)}
                                >
                                    My table
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant={t.status === 'completed' ? 'solid' : 'outline'}
                                colorScheme={t.status === 'completed' ? 'gray' : undefined}
                                flex={1}
                                isLoading={isLoading}
                                onClick={() => onViewOverview(t.id)}
                            >
                                {t.status === 'completed' ? 'Final standings' : 'Standings'}
                            </Button>
                        </>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
}
