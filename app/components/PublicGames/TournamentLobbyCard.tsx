'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    Spinner,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiCheck, FiClock, FiLock } from 'react-icons/fi';
import type { Tournament } from '../../hooks/server_actions';
import type { PendingTournamentTx } from '../../hooks/usePendingTournamentTxs';
import ExternalLink from '../ExternalLink';
import ChainBadge from '../ChainBadge';
import { USDC_BLUE, USDC_LOGO } from './types';
import {
    formatTournamentStart,
    formatUsdc,
    getStatusDescriptor,
    isFreePlay as getIsFreePlay,
    useCountdown,
} from './tournamentFormat';

export interface TournamentLobbyCardProps {
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
    /** Index in the grid, used to stagger the entry animation. */
    index?: number;
}

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5); }
    50%      { box-shadow: 0 0 0 4px rgba(54, 163, 123, 0); }
`;

export default function TournamentLobbyCard({
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
    index = 0,
}: TournamentLobbyCardProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const standardBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const yellowText = useColorModeValue('brand.yellowDark', 'brand.yellow');

    const now = new Date();
    const lateRegCloseAt = new Date(t.late_reg_close_at);
    const scheduledStartAt = new Date(t.scheduled_start_at);
    const fiveMinBeforeStart = new Date(
        scheduledStartAt.getTime() - 5 * 60 * 1000
    );

    const hasPendingRegister = pendingTx?.type === 'register';
    const isRegistered = registeredIds.has(t.id) || hasPendingRegister;
    const isHost =
        !!myWallet && t.host_wallet?.toLowerCase() === myWallet.toLowerCase();
    const isLateRegOpen =
        t.status === 'running' &&
        (t.late_reg_levels ?? 0) > 0 &&
        now < lateRegCloseAt;
    const freePlay = getIsFreePlay(t);
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateRegister = isLateRegOpen && !isRegistered && !pendingTx;
    const canUnregister =
        t.status === 'registration' &&
        isRegistered &&
        !hasPendingRegister &&
        (freePlay || now < fiveMinBeforeStart);
    const canFundGuarantee =
        isHost &&
        t.status === 'pending' &&
        t.guarantee_usdc > 0 &&
        !!t.contract_address;

    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';

    const showCountdown = t.status === 'registration' || t.status === 'pending';

    // Lead with the prize pool / guarantee, then the buy-in. Every amount is in
    // USDC, so real-money figures carry the USDC mark and blue; free play stays neutral.
    const money: {
        label: string;
        value: string;
        usdc: boolean;
        suffix?: string;
    } = freePlay
        ? { label: 'Entry', value: 'Free', usdc: false }
        : t.guarantee_usdc > 0
          ? {
                label: 'Guaranteed pool',
                value: `$${formatUsdc(t.guarantee_usdc, { decimals: 0 })}`,
                suffix: 'GTD',
                usdc: true,
            }
          : t.prize_pool_usdc > 0
            ? {
                  label: 'Prize pool',
                  value: `$${formatUsdc(t.prize_pool_usdc, { decimals: 0 })}`,
                  usdc: true,
              }
            : {
                  label: 'Buy-in',
                  value: `$${formatUsdc(t.buy_in_usdc)}`,
                  usdc: true,
              };

    const showBuyInSecondary = !freePlay && money.label !== 'Buy-in';

    const meta: string[] = [];
    if (t.starting_stack_bb > 0) meta.push(`${t.starting_stack_bb}BB start`);
    if (t.reentry_allowed) {
        meta.push(t.reentry_max > 1 ? `${t.reentry_max} bullets` : 'Re-entry');
    }

    return (
        <Box
            as="article"
            bg={cardBg}
            borderWidth="1px"
            borderColor={standardBorder}
            borderRadius="14px"
            boxShadow="card.lift"
            p={{ base: 4, md: 5 }}
            cursor={onCardClick ? 'pointer' : undefined}
            onClick={onCardClick ? () => onCardClick(t.id) : undefined}
            transition="border-color 150ms ease, box-shadow 150ms ease"
            _hover={{
                borderColor: 'brand.green',
                boxShadow: 'card.liftHover',
            }}
            _focusWithin={{ borderColor: 'brand.green' }}
            animation={
                prefersReducedMotion
                    ? undefined
                    : `${fadeUp} 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`
            }
            style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
            display="flex"
            flexDirection="column"
            h="full"
        >
            <VStack align="stretch" spacing={4} flex="1">
                {/* Header */}
                <HStack justify="space-between" align="flex-start" spacing={3}>
                    <VStack align="start" spacing={1.5} minW={0}>
                        <HStack spacing={2} minW={0}>
                            <Text
                                fontWeight="bold"
                                fontSize="md"
                                color="text.primary"
                                letterSpacing="-0.01em"
                                noOfLines={1}
                                minW={0}
                            >
                                {t.name ||
                                    (freePlay
                                        ? 'Free-play tournament'
                                        : 'No-limit Hold’em')}
                            </Text>
                        </HStack>
                        <HStack spacing={1.5} flexWrap="wrap">
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                                fontWeight="semibold"
                                whiteSpace="nowrap"
                            >
                                {blindLabel} · NLH
                            </Text>
                            {freePlay && <FreeTag />}
                            {t.is_private && <PrivatePill />}
                        </HStack>
                        {t.chain && <ChainBadge chain={t.chain} size="sm" />}
                    </VStack>
                    <VStack align="end" spacing={1.5} flexShrink={0}>
                        <StatusPill status={t.status} />
                        <PlayerStatePill
                            status={t.status}
                            isRegistered={isRegistered}
                            isEliminated={isEliminated}
                        />
                    </VStack>
                </HStack>

                {/* Money */}
                <Flex justify="space-between" align="flex-end" gap={3}>
                    <VStack align="start" spacing={0} minW={0}>
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            fontWeight="semibold"
                        >
                            {money.label}
                        </Text>
                        <HStack spacing={1.5} align="center" minW={0}>
                            {money.usdc && (
                                <Image
                                    src={USDC_LOGO}
                                    alt=""
                                    boxSize="18px"
                                    loading="lazy"
                                    flexShrink={0}
                                />
                            )}
                            <Text
                                fontWeight="bold"
                                fontSize={{ base: 'xl', md: '2xl' }}
                                lineHeight="1.1"
                                color={money.usdc ? USDC_BLUE : 'text.primary'}
                                letterSpacing="-0.02em"
                                noOfLines={1}
                                minW={0}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {money.value}
                            </Text>
                            {money.suffix && (
                                <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={USDC_BLUE}
                                    letterSpacing="0.06em"
                                    flexShrink={0}
                                >
                                    {money.suffix}
                                </Text>
                            )}
                        </HStack>
                    </VStack>

                    {showBuyInSecondary && (
                        <VStack align="end" spacing={0} flexShrink={0}>
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                                fontWeight="semibold"
                            >
                                Buy-in
                            </Text>
                            <HStack spacing={1}>
                                <Image
                                    src={USDC_LOGO}
                                    alt=""
                                    boxSize="14px"
                                    loading="lazy"
                                />
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    color={USDC_BLUE}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    ${formatUsdc(t.buy_in_usdc)}
                                </Text>
                            </HStack>
                        </VStack>
                    )}
                </Flex>

                {/* Timing + fill */}
                <VStack align="stretch" spacing={1.5}>
                    <Flex justify="space-between" align="center" gap={2}>
                        <Timing
                            status={t.status}
                            startIso={t.scheduled_start_at}
                            endIso={t.ended_at}
                            showCountdown={showCountdown}
                        />
                        <Text
                            fontSize="xs"
                            color="text.secondary"
                            fontWeight="semibold"
                            whiteSpace="nowrap"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {t.status === 'registration' ||
                            t.status === 'pending' ? (
                                <>
                                    {t.registered_count ?? 0} / {t.max_entries}
                                    <Text
                                        as="span"
                                        color="text.muted"
                                        fontWeight="normal"
                                    >
                                        {' '}
                                        registered
                                    </Text>
                                </>
                            ) : (
                                <>
                                    {t.registered_count ?? 0}
                                    <Text
                                        as="span"
                                        color="text.muted"
                                        fontWeight="normal"
                                    >
                                        {' '}
                                        {(t.registered_count ?? 0) === 1
                                            ? 'entry'
                                            : 'entries'}
                                    </Text>
                                </>
                            )}
                        </Text>
                    </Flex>
                    <FillBar
                        registered={t.registered_count ?? 0}
                        max={t.max_entries}
                        isUsdc={!freePlay}
                    />
                    {t.status !== 'completed' &&
                        t.status !== 'cancelled' &&
                        (t.registered_count ?? 0) < t.min_entries && (
                            <Text fontSize="2xs" color="text.muted">
                                Needs {t.min_entries} players to run
                            </Text>
                        )}
                    {isLateRegOpen && (
                        <Text
                            fontSize="2xs"
                            fontWeight="semibold"
                            color={yellowText}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            Late registration closes{' '}
                            {formatTournamentStart(t.late_reg_close_at)}
                        </Text>
                    )}
                </VStack>

                {meta.length > 0 && (
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        letterSpacing="0.02em"
                    >
                        {meta.join('  ·  ')}
                    </Text>
                )}
            </VStack>

            {/* Actions, always pinned to the bottom for a consistent baseline */}
            <HStack
                spacing={2}
                mt={4}
                flexWrap="wrap"
                onClick={(e) => e.stopPropagation()}
            >
                {canFundGuarantee && (
                    <ActionButton
                        variant="tactilePrimary"
                        isLoading={isLoading}
                        onClick={() => onFundGuarantee?.(t.id)}
                    >
                        Fund ${formatUsdc(t.guarantee_usdc, { decimals: 0 })}{' '}
                        GTD &amp; open
                    </ActionButton>
                )}
                {canRegister && (
                    <ActionButton
                        variant="tactilePrimary"
                        isLoading={isLoading}
                        onClick={() => onRegister(t.id)}
                    >
                        {freePlay ? 'Join' : 'Register'}
                    </ActionButton>
                )}
                {canLateRegister && (
                    <ActionButton
                        variant="tactilePrimary"
                        isLoading={isLoading}
                        onClick={() => onRegister(t.id)}
                    >
                        Late register
                    </ActionButton>
                )}
                {canUnregister && (
                    <ActionButton
                        variant="tactileDestructive"
                        isLoading={isLoading}
                        onClick={() => onUnregister(t.id)}
                    >
                        Unregister
                    </ActionButton>
                )}
                {pendingTx && (
                    <Tooltip
                        label="Confirmed on-chain. Waiting for the indexer to catch up…"
                        placement="top"
                        hasArrow
                        fontSize="xs"
                    >
                        <HStack
                            spacing={1.5}
                            flex={1}
                            justify="center"
                            minH="40px"
                            color={yellowText}
                            fontWeight="semibold"
                            fontSize="sm"
                            cursor="default"
                        >
                            <Spinner size="xs" speed="0.9s" />
                            {explorerUrl ? (
                                <ExternalLink
                                    href={explorerUrl(pendingTx)}
                                    fontSize="sm"
                                    color="inherit"
                                >
                                    Syncing…
                                </ExternalLink>
                            ) : (
                                <Text color={yellowText}>Syncing…</Text>
                            )}
                        </HStack>
                    </Tooltip>
                )}
                {!pendingTx &&
                    !canUnregister &&
                    t.status === 'registration' &&
                    isRegistered && (
                        <HStack
                            flex={1}
                            justify="center"
                            minH="40px"
                            spacing={1.5}
                            color="brand.green"
                            fontWeight="semibold"
                            fontSize="sm"
                        >
                            <Icon as={FiCheck} boxSize="16px" />
                            <Text color="brand.green">You’re registered</Text>
                        </HStack>
                    )}
                {t.status === 'running' && isRegistered && !isEliminated && (
                    <ActionButton
                        variant="tactilePrimary"
                        isLoading={isGoingToTable}
                        loadingText="Finding table…"
                        onClick={() => onGoToTable(t.id)}
                    >
                        My table
                    </ActionButton>
                )}
                {(t.status === 'running' || t.status === 'completed') && (
                    <ActionButton
                        variant={
                            t.status === 'completed'
                                ? 'tactilePrimary'
                                : 'tactileOutline'
                        }
                        isLoading={isLoading}
                        onClick={() => onViewOverview(t.id)}
                    >
                        {t.status === 'completed'
                            ? 'Final standings'
                            : 'Standings'}
                    </ActionButton>
                )}
            </HStack>
        </Box>
    );
}

function ActionButton({
    children,
    ...rest
}: React.ComponentProps<typeof Button>) {
    return (
        <Button
            size="sm"
            flex={1}
            minH={{ base: '44px', md: '40px' }}
            fontSize="sm"
            {...rest}
        >
            {children}
        </Button>
    );
}

function FreeTag() {
    const freeBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg={freeBg}
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.06em"
            color="text.muted"
            lineHeight="1"
            flexShrink={0}
        >
            FREE
        </Text>
    );
}

function PrivatePill() {
    const bg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    return (
        <HStack
            spacing={1}
            px={1.5}
            py="2px"
            borderRadius="full"
            bg={bg}
            flexShrink={0}
        >
            <Icon as={FiLock} boxSize="9px" color="text.muted" />
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.06em"
                color="text.muted"
                lineHeight="1"
            >
                PRIVATE
            </Text>
        </HStack>
    );
}

function StatusPill({ status }: { status: string }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const { label, tone } = getStatusDescriptor(status);

    const neutralBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    const greenBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const yellowBg = useColorModeValue(
        'rgba(253, 197, 29, 0.16)',
        'rgba(253, 197, 29, 0.22)'
    );
    const yellowFg = useColorModeValue('brand.yellowDark', 'brand.yellow');

    const styles = {
        open: {
            bg: greenBg,
            fg: 'brand.green',
            dot: 'brand.green',
            pulse: false,
        },
        live: {
            bg: neutralBg,
            fg: 'text.primary',
            dot: 'brand.green',
            pulse: true,
        },
        done: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        cancelled: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        setup: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        refund: { bg: yellowBg, fg: yellowFg, dot: yellowFg, pulse: false },
    }[tone];

    return (
        <HStack
            spacing={1.5}
            px={2}
            py="3px"
            borderRadius="full"
            bg={styles.bg}
            flexShrink={0}
        >
            {styles.dot && (
                <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={styles.dot}
                    animation={
                        styles.pulse && !prefersReducedMotion
                            ? `${dotPulse} 2s ease-in-out infinite`
                            : undefined
                    }
                    aria-hidden
                />
            )}
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color={styles.fg}
                lineHeight="1"
            >
                {label}
            </Text>
        </HStack>
    );
}

function PlayerStatePill({
    status,
    isRegistered,
    isEliminated,
}: {
    status: string;
    isRegistered: boolean;
    isEliminated: boolean;
}) {
    const greenBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const neutralBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );

    if (!isRegistered) return null;

    let content: {
        bg: string;
        fg: string;
        icon: boolean;
        label: string;
    } | null = null;
    if (status === 'registration') {
        content = {
            bg: greenBg,
            fg: 'brand.green',
            icon: true,
            label: 'Registered',
        };
    } else if (status === 'running' && !isEliminated) {
        content = {
            bg: greenBg,
            fg: 'brand.green',
            icon: true,
            label: 'You’re in',
        };
    } else if (status === 'running' && isEliminated) {
        content = {
            bg: neutralBg,
            fg: 'text.muted',
            icon: false,
            label: 'Eliminated',
        };
    }
    if (!content) return null;

    return (
        <HStack
            spacing={1}
            px={2}
            py="3px"
            borderRadius="full"
            bg={content.bg}
            flexShrink={0}
        >
            {content.icon && (
                <Icon as={FiCheck} boxSize="11px" color={content.fg} />
            )}
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color={content.fg}
                lineHeight="1"
            >
                {content.label}
            </Text>
        </HStack>
    );
}

function Timing({
    status,
    startIso,
    endIso,
    showCountdown,
}: {
    status: string;
    startIso: string;
    endIso?: string;
    showCountdown: boolean;
}) {
    const countdown = useCountdown(startIso);

    let label: string;
    if (showCountdown) {
        label = countdown.ready
            ? countdown.isPast
                ? 'Starting now'
                : `Starts in ${countdown.label}`
            : `Starts ${formatTournamentStart(startIso)}`;
    } else if (status === 'running') {
        label = 'In progress';
    } else if (status === 'completed') {
        label = endIso ? `Ended ${formatTournamentStart(endIso)}` : 'Completed';
    } else if (status === 'cancelled') {
        label = 'Cancelled';
    } else {
        label = formatTournamentStart(startIso);
    }

    return (
        <HStack spacing={1.5} color="text.secondary" minW={0}>
            <Icon
                as={FiClock}
                boxSize="13px"
                color="text.muted"
                flexShrink={0}
            />
            <Text
                fontSize="xs"
                fontWeight="semibold"
                color="text.secondary"
                noOfLines={1}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {label}
            </Text>
        </HStack>
    );
}

function FillBar({
    registered,
    max,
    isUsdc,
}: {
    registered: number;
    max: number;
    isUsdc: boolean;
}) {
    const ratio = max <= 0 ? 0 : Math.min(1, registered / max);
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    return (
        <Box
            position="relative"
            w="full"
            h="4px"
            borderRadius="full"
            bg={trackBg}
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                h="4px"
                w={`${ratio * 100}%`}
                minW={registered > 0 ? '4px' : '0'}
                borderRadius="full"
                bg={isUsdc ? USDC_BLUE : 'brand.green'}
                opacity={0.9}
                transition="width 0.3s ease"
            />
        </Box>
    );
}
