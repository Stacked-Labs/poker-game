'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    HStack,
    Icon,
    Image,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Table,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    usePrefersReducedMotion,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
    FiArrowLeft,
    FiCheck,
    FiClock,
    FiExternalLink,
    FiShield,
} from 'react-icons/fi';
import type { Tournament } from '../../hooks/server_actions';
import type { LeaderboardPlayer } from '../../interfaces';
import ChainBadge from '../ChainBadge';
import PlayerAvatar from '../PlayerAvatar';
import PlayerNameLink from '../PlayerNameLink';
import ExternalLink from '../ExternalLink';
import StructureSheet from './StructureSheet';
import PayoutLadder from './PayoutLadder';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatTournamentStart,
    formatUsdc,
    getStatusDescriptor,
    HIDE_X_SCROLLBAR_SX,
    isFreePlay as getIsFreePlay,
    useCountdown,
} from '../PublicGames/tournamentFormat';

// LeaderboardPlayer now lives in app/interfaces (shared with the live-tournament
// state slice). Re-exported here so existing `from './TournamentDetail'` imports
// (page.tsx, stories) keep working.
export type { LeaderboardPlayer };

export interface RefundState {
    loading?: boolean;
    alreadyClaimed?: boolean;
    eligible?: boolean;
    estimatedUsdc?: number | null;
    claiming?: boolean;
}

export interface EmergencyState {
    opened?: boolean;
    available?: boolean;
    opening?: boolean;
    msUntilAvailable?: number;
}

export interface TournamentDetailProps {
    tournament: Tournament;
    players: LeaderboardPlayer[];
    myWallet?: string;
    isRegistered?: boolean;
    blindLevel?: number | null;
    actionLoading?: boolean;
    actionLabel?: string;
    goToTableLoading?: boolean;
    /** Host-only: claimable rake in micro-USDC (null = loading). */
    hostRakeUsdc?: number | null;
    rakeClaiming?: boolean;
    refund?: RefundState;
    emergency?: EmergencyState;
    onRegister?: (isReentry?: boolean) => void;
    onUnregister?: () => void;
    onGoToTable?: () => void;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
    onClaimRefund?: () => void;
    onEnableEmergencyRefund?: () => void;
    onBack?: () => void;
}

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5); }
    50%      { box-shadow: 0 0 0 5px rgba(54, 163, 123, 0); }
`;

function formatDuration(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    if (h > 0) return `${h}h ${m}m`;
    const s = Math.floor((ms % 60_000) / 1_000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function explorerBase(chain?: string): string {
    return chain === 'base'
        ? 'https://basescan.org'
        : 'https://sepolia.basescan.org';
}

function shortAddr(a: string): string {
    return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export default function TournamentDetail({
    tournament: t,
    players,
    myWallet,
    isRegistered = false,
    blindLevel = null,
    actionLoading = false,
    actionLabel,
    goToTableLoading = false,
    hostRakeUsdc,
    rakeClaiming = false,
    refund,
    emergency,
    onRegister,
    onUnregister,
    onGoToTable,
    onFundAndOpen,
    onClaimRake,
    onClaimRefund,
    onEnableEmergencyRefund,
    onBack,
}: TournamentDetailProps) {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const rowHover = useColorModeValue(
        'rgba(11, 20, 48, 0.04)',
        'rgba(255, 255, 255, 0.05)'
    );
    const meHighlight = useColorModeValue(
        'rgba(54, 163, 123, 0.08)',
        'rgba(54, 163, 123, 0.16)'
    );
    const yellowText = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const linkColor = useColorModeValue('brand.navy', 'brand.lightGray');

    const freePlay = getIsFreePlay(t);
    const tableSize = t.table_size || 9;
    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';

    const now = new Date();
    const lateRegCloseAt = new Date(t.late_reg_close_at);
    const scheduledStartAt = new Date(t.scheduled_start_at);
    const fiveMinBefore = new Date(scheduledStartAt.getTime() - 5 * 60 * 1000);
    const isLateRegOpen =
        t.status === 'running' &&
        (t.late_reg_levels ?? 0) > 0 &&
        now < lateRegCloseAt;
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateReg = isLateRegOpen && !isRegistered;
    const canUnregister =
        t.status === 'registration' &&
        isRegistered &&
        (freePlay || now < fiveMinBefore);

    const isHost =
        !!myWallet && t.host_wallet?.toLowerCase() === myWallet.toLowerCase();

    const myPlayer = myWallet
        ? players.find((p) => p.wallet.toLowerCase() === myWallet.toLowerCase())
        : undefined;
    const isEliminated = myPlayer ? myPlayer.finish_pos > 0 : false;
    const bulletsUsed = myPlayer?.bullet_number ?? 1;
    const canReenter =
        isLateRegOpen &&
        isRegistered &&
        isEliminated &&
        t.reentry_allowed &&
        bulletsUsed <= t.reentry_max;

    const playersLeft = players.filter((p) => p.finish_pos === 0).length;
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finish_pos === 0 && b.finish_pos === 0) return b.stack - a.stack;
        if (a.finish_pos === 0) return -1;
        if (b.finish_pos === 0) return 1;
        return a.finish_pos - b.finish_pos;
    });
    const winner =
        t.status === 'completed'
            ? sortedPlayers.find((p) => p.finish_pos === 1)
            : undefined;

    const registeredCount = t.registered_count ?? players.length;

    // The three movable sections: two columns on desktop, three switchable tabs
    // on mobile. Defined once as elements, then rendered in both layouts (the
    // off-breakpoint copy is display:none — mounted but not painted).
    const standingsEl =
        sortedPlayers.length > 0 ? (
            <Standings
                tournament={t}
                freePlay={freePlay}
                players={sortedPlayers}
                myWallet={myWallet}
                cardBg={cardBg}
                border={border}
                rowHover={rowHover}
                meHighlight={meHighlight}
            />
        ) : t.status === 'registration' ? (
            <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={border}
                borderRadius="14px"
                p={6}
                textAlign="center"
            >
                <Text color="text.muted" fontSize="sm">
                    {registeredCount > 0
                        ? `${registeredCount} player${registeredCount !== 1 ? 's' : ''} registered, standings appear once the tournament starts.`
                        : 'No players registered yet. Be the first.'}
                </Text>
            </Box>
        ) : null;

    const showPayouts =
        t.status === 'registration' ||
        t.status === 'pending' ||
        t.status === 'running' ||
        t.status === 'completed';
    const payoutsEl = showPayouts ? (
        <PayoutLadder
            entrants={
                /* Tiers key on unique players (one row each), matching the
                   backend; registeredCount counts bullet entries. */
                players.length || registeredCount
            }
            prizePoolUsdc={Math.max(
                t.prize_pool_usdc ?? 0,
                t.guarantee_usdc ?? 0
            )}
            isFreePlay={freePlay}
            status={t.status}
        />
    ) : null;

    const structureEl = (
        <StructureSheet
            blindStructure={blindLabel}
            startingStack={t.starting_stack}
            lateRegLevels={t.late_reg_levels}
            currentLevel={blindLevel}
        />
    );

    return (
        <Box minH="100vh" bg="card.lightGray" pt={{ base: 20, md: 24 }} pb={16}>
            <Container maxW="container.lg" px={{ base: 3, md: 6 }}>
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <Button
                        variant="tactileGhost"
                        size="sm"
                        alignSelf="flex-start"
                        leftIcon={<Icon as={FiArrowLeft} />}
                        onClick={onBack}
                    >
                        All tournaments
                    </Button>

                    {/* Primary panel */}
                    <Box
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={border}
                        borderRadius="16px"
                        boxShadow="card.lift"
                        p={{ base: 4, md: 6 }}
                    >
                        <VStack align="stretch" spacing={5}>
                            {/* Title + status */}
                            <Flex
                                justify="space-between"
                                align="flex-start"
                                gap={3}
                            >
                                <VStack align="start" spacing={2} minW={0}>
                                    <Text
                                        as="h1"
                                        fontWeight="bold"
                                        fontSize={{ base: 'xl', md: '2xl' }}
                                        letterSpacing="-0.02em"
                                        color="text.primary"
                                        noOfLines={2}
                                    >
                                        {t.name ||
                                            (freePlay
                                                ? 'Free-play tournament'
                                                : 'No-limit Hold’em')}
                                    </Text>
                                    <Text
                                        fontSize="2xs"
                                        color="text.muted"
                                        textTransform="uppercase"
                                        letterSpacing="0.08em"
                                        fontWeight="semibold"
                                    >
                                        {blindLabel} · NLH · {tableSize}-max
                                    </Text>
                                    {!freePlay && t.chain && (
                                        <ChainBadge chain={t.chain} size="sm" />
                                    )}
                                </VStack>
                                <StatusPill status={t.status} />
                            </Flex>

                            {/* Hero: money + timing */}
                            <Flex
                                gap={{ base: 4, md: 8 }}
                                flexWrap="wrap"
                                align="flex-end"
                            >
                                <MoneyHero
                                    tournament={t}
                                    freePlay={freePlay}
                                    winnerPrizeUsdc={winner?.prize_usdc}
                                />
                                <TimingHero
                                    status={t.status}
                                    startIso={t.scheduled_start_at}
                                    endIso={t.ended_at}
                                    blindLevel={blindLevel}
                                    playersLeft={playersLeft}
                                />
                                {!freePlay && (
                                    <Stat label="Buy-in">
                                        <HStack spacing={1}>
                                            <Image
                                                src={USDC_LOGO}
                                                alt=""
                                                boxSize="14px"
                                                flexShrink={0}
                                            />
                                            <Text
                                                fontWeight="bold"
                                                color={USDC_BLUE}
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                ${formatUsdc(t.buy_in_usdc)}
                                            </Text>
                                        </HStack>
                                    </Stat>
                                )}
                                {t.reentry_allowed && (
                                    <Stat label="Re-entry">
                                        <Text
                                            fontWeight="semibold"
                                            color="text.primary"
                                        >
                                            up to {t.reentry_max}×
                                        </Text>
                                    </Stat>
                                )}
                            </Flex>

                            {/* Players fill */}
                            <PlayersBar
                                registered={registeredCount}
                                max={t.max_entries}
                                min={t.min_entries}
                                status={t.status}
                                playersLeft={playersLeft}
                                isUsdc={!freePlay}
                            />

                            {isLateRegOpen && (
                                <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={yellowText}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    Late registration closes{' '}
                                    {formatTournamentStart(t.late_reg_close_at)}
                                </Text>
                            )}

                            {/* Footer: contract details (left), action (right) */}
                            <Flex
                                justify="space-between"
                                align="center"
                                gap={3}
                                flexWrap="wrap"
                            >
                                {!freePlay && t.contract_address && t.chain ? (
                                    <HStack
                                        spacing={2}
                                        fontSize="xs"
                                        color="text.muted"
                                        minW={0}
                                    >
                                        <Icon
                                            as={FiShield}
                                            boxSize="12px"
                                            flexShrink={0}
                                        />
                                        <Text
                                            color="text.muted"
                                            whiteSpace="nowrap"
                                        >
                                            Held by the table contract
                                        </Text>
                                        <Box
                                            as="a"
                                            href={`${explorerBase(t.chain)}/address/${t.contract_address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            fontFamily="mono"
                                            display="inline-flex"
                                            alignItems="center"
                                            gap="3px"
                                            color={linkColor}
                                            _hover={{
                                                color: 'brand.green',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            {shortAddr(t.contract_address)}
                                            <Icon
                                                as={FiExternalLink}
                                                boxSize="10px"
                                            />
                                        </Box>
                                    </HStack>
                                ) : (
                                    <Box />
                                )}
                                <PrimaryActions
                                    status={t.status}
                                    isRegistered={isRegistered}
                                    isEliminated={isEliminated}
                                    canRegister={canRegister}
                                    canLateReg={canLateReg}
                                    canUnregister={canUnregister}
                                    canReenter={canReenter}
                                    freePlay={freePlay}
                                    myWallet={myWallet}
                                    actionLoading={actionLoading}
                                    actionLabel={actionLabel}
                                    goToTableLoading={goToTableLoading}
                                    bulletsUsed={bulletsUsed}
                                    reentryMax={t.reentry_max}
                                    buyInUsdc={t.buy_in_usdc}
                                    onRegister={onRegister}
                                    onUnregister={onUnregister}
                                    onGoToTable={onGoToTable}
                                />
                            </Flex>
                        </VStack>
                    </Box>

                    {/* Host panel */}
                    {isHost && (
                        <HostPanel
                            tournament={t}
                            freePlay={freePlay}
                            registeredCount={registeredCount}
                            hostRakeUsdc={hostRakeUsdc}
                            rakeClaiming={rakeClaiming}
                            actionLoading={actionLoading}
                            onFundAndOpen={onFundAndOpen}
                            onClaimRake={onClaimRake}
                            cardBg={cardBg}
                            border={border}
                        />
                    )}

                    {/* Desktop (lg+): two columns — standings (left) · payouts
                        over structure (right). */}
                    <Flex
                        display={{ base: 'none', lg: 'flex' }}
                        direction="row"
                        align="flex-start"
                        gap={6}
                    >
                        {standingsEl && (
                            <Box flex="1 1 0" minW={0}>
                                {standingsEl}
                            </Box>
                        )}
                        {/* Fixed 360px beside standings; grows to fill when there
                            are no standings (e.g. cancelled with an empty field)
                            so the cards don't orphan left against an empty gutter. */}
                        <VStack
                            align="stretch"
                            spacing={6}
                            w={standingsEl ? '360px' : 'full'}
                            flexShrink={standingsEl ? 0 : 1}
                        >
                            {payoutsEl}
                            {structureEl}
                        </VStack>
                    </Flex>

                    {/* Mobile (< lg): the same three sections as switchable tabs. */}
                    <Box display={{ base: 'block', lg: 'none' }}>
                        <MobileSectionTabs
                            standings={standingsEl}
                            payouts={payoutsEl}
                            structure={structureEl}
                            cardBg={cardBg}
                            border={border}
                        />
                    </Box>

                    {/* Payouts (completed) */}
                    {t.status === 'completed' &&
                        !freePlay &&
                        t.contract_address && (
                            <PayoutsPanel
                                tournament={t}
                                cardBg={cardBg}
                                border={border}
                                linkColor={linkColor}
                            />
                        )}

                    {/* Refund (cancelled / emergency) */}
                    {(t.status === 'cancelled' ||
                        t.status === 'emergency_refund') &&
                        !freePlay &&
                        t.contract_address && (
                            <RefundPanel
                                status={t.status}
                                refund={refund}
                                myWallet={myWallet}
                                onClaimRefund={onClaimRefund}
                                cardBg={cardBg}
                                border={border}
                            />
                        )}

                    {/* Emergency safety net (running) */}
                    {t.status === 'running' &&
                        !freePlay &&
                        t.contract_address && (
                            <EmergencyPanel
                                emergency={emergency}
                                advertisedEnd={t.advertised_end_at}
                                onEnable={onEnableEmergencyRefund}
                                cardBg={cardBg}
                                border={border}
                                yellowText={yellowText}
                            />
                        )}
                </VStack>
            </Container>
        </Box>
    );
}

function MobileSectionTabs({
    standings,
    payouts,
    structure,
    cardBg,
    border,
}: {
    standings: React.ReactNode;
    payouts: React.ReactNode;
    structure: React.ReactNode;
    cardBg: string;
    border: string;
}) {
    // Recessed track + an elevated, bordered pill for the active tab so the
    // selection reads clearly in both themes (a flat card-on-card was too faint).
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(0, 0, 0, 0.28)'
    );
    const selectedBg = useColorModeValue('white', 'rgba(255, 255, 255, 0.16)');
    const selectedBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.20)'
    );
    const sections = [
        { label: 'Players', content: standings },
        { label: 'Payouts', content: payouts },
        { label: 'Blinds', content: structure },
    ];

    return (
        <Tabs variant="unstyled" isLazy isFitted>
            <TabList bg={trackBg} p="4px" borderRadius="12px" gap="4px">
                {sections.map((s) => (
                    <Tab
                        key={s.label}
                        borderRadius="8px"
                        py={2}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="text.secondary"
                        borderWidth="1px"
                        borderColor="transparent"
                        transition="background-color 120ms ease, color 120ms ease, box-shadow 120ms ease"
                        _selected={{
                            bg: selectedBg,
                            color: 'text.primary',
                            fontWeight: 'bold',
                            borderColor: selectedBorder,
                            boxShadow: 'card.lift',
                        }}
                        _focusVisible={{ boxShadow: 'outline' }}
                    >
                        {s.label}
                    </Tab>
                ))}
            </TabList>
            <TabPanels>
                {sections.map((s) => (
                    <TabPanel key={s.label} px={0} pt={4}>
                        {s.content ?? (
                            <Box
                                bg={cardBg}
                                borderWidth="1px"
                                borderColor={border}
                                borderRadius="14px"
                                p={6}
                                textAlign="center"
                            >
                                <Text color="text.muted" fontSize="sm">
                                    Nothing to show here yet.
                                </Text>
                            </Box>
                        )}
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
}

function Stat({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <VStack align="start" spacing={0.5} minW={0}>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
            >
                {label}
            </Text>
            <Box fontSize="sm">{children}</Box>
        </VStack>
    );
}

function MoneyHero({
    tournament: t,
    freePlay,
    winnerPrizeUsdc,
}: {
    tournament: Tournament;
    freePlay: boolean;
    winnerPrizeUsdc?: number;
}) {
    let label = 'Buy-in';
    let value = `$${formatUsdc(t.buy_in_usdc)}`;
    let suffix: string | undefined;
    if (freePlay) {
        label = 'Entry';
        value = 'Free';
    } else if (t.guarantee_usdc > 0) {
        label = 'Guaranteed pool';
        value = `$${formatUsdc(t.guarantee_usdc, { decimals: 0 })}`;
        suffix = 'GTD';
    } else if (t.prize_pool_usdc > 0) {
        label = 'Prize pool';
        value = `$${formatUsdc(t.prize_pool_usdc, { decimals: 0 })}`;
    }
    if (t.status === 'completed' && (winnerPrizeUsdc ?? 0) > 0) {
        label = 'Top prize';
        value = `$${formatUsdc(winnerPrizeUsdc as number, { decimals: 0 })}`;
        suffix = undefined;
    }
    const usdc = !freePlay;

    return (
        <VStack align="start" spacing={0.5} minW={0}>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
            >
                {label}
            </Text>
            <HStack spacing={2} align="center" minW={0}>
                {usdc && (
                    <Image
                        src={USDC_LOGO}
                        alt=""
                        boxSize={{ base: '22px', md: '26px' }}
                        flexShrink={0}
                    />
                )}
                <Text
                    fontWeight="bold"
                    fontSize={{ base: '3xl', md: '4xl' }}
                    lineHeight="1"
                    letterSpacing="-0.02em"
                    color={usdc ? USDC_BLUE : 'text.primary'}
                    noOfLines={1}
                    minW={0}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value}
                </Text>
                {suffix && (
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={USDC_BLUE}
                        letterSpacing="0.06em"
                        flexShrink={0}
                    >
                        {suffix}
                    </Text>
                )}
            </HStack>
        </VStack>
    );
}

function TimingHero({
    status,
    startIso,
    endIso,
    blindLevel,
    playersLeft,
}: {
    status: string;
    startIso: string;
    endIso?: string;
    blindLevel: number | null;
    playersLeft: number;
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const countdown = useCountdown(startIso);

    if (status === 'registration' || status === 'pending') {
        return (
            <Stat label={status === 'pending' ? 'Scheduled' : 'Starts in'}>
                <HStack spacing={1.5}>
                    <Icon as={FiClock} boxSize="14px" color="text.muted" />
                    <Text
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {status === 'pending'
                            ? formatTournamentStart(startIso)
                            : countdown.ready
                              ? countdown.isPast
                                  ? 'Starting now'
                                  : countdown.label
                              : formatTournamentStart(startIso)}
                    </Text>
                </HStack>
            </Stat>
        );
    }

    if (status === 'running') {
        return (
            <Stat label="Live now">
                <HStack spacing={2}>
                    <Box
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg="brand.green"
                        animation={
                            prefersReducedMotion
                                ? undefined
                                : `${dotPulse} 2s ease-in-out infinite`
                        }
                        aria-hidden
                    />
                    <Text
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {blindLevel !== null
                            ? `Level ${blindLevel}`
                            : 'In progress'}
                        {playersLeft > 0 && (
                            <Text
                                as="span"
                                color="text.muted"
                                fontWeight="normal"
                            >
                                {' '}
                                · {playersLeft} left
                            </Text>
                        )}
                    </Text>
                </HStack>
            </Stat>
        );
    }

    if (status === 'completed') {
        return (
            <Stat label="Ended">
                <Text
                    fontWeight="semibold"
                    color="text.primary"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {endIso ? formatTournamentStart(endIso) : 'Final'}
                </Text>
            </Stat>
        );
    }

    return (
        <Stat label="Status">
            <Text
                fontWeight="semibold"
                color="text.primary"
                textTransform="capitalize"
            >
                {status}
            </Text>
        </Stat>
    );
}

function PlayersBar({
    registered,
    max,
    min,
    status,
    playersLeft,
    isUsdc,
}: {
    registered: number;
    max: number;
    min: number;
    status: string;
    playersLeft: number;
    isUsdc: boolean;
}) {
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    const isRunning = status === 'running';
    const isCompleted = status === 'completed';
    // "left" is only trustworthy once the live leaderboard has loaded (>0 alive).
    // Otherwise fall back to the locked field size so a not-yet-loaded leaderboard
    // never reads as "0 of N left".
    const liveRemaining = isRunning && playersLeft > 0;
    const entriesWord = registered === 1 ? 'entry' : 'entries';

    let label: string;
    let value: React.ReactNode;
    let fillRatio = 0;
    let showBar = false;

    if (liveRemaining) {
        // Running, live: how many are still in. Bar depletes as players bust.
        label = 'Players remaining';
        value = `${playersLeft} of ${registered} left`;
        fillRatio = registered > 0 ? Math.min(1, playersLeft / registered) : 0;
        showBar = true;
    } else if (isCompleted) {
        label = 'Final field';
        value = `${registered} ${entriesWord}`;
    } else if (isRunning) {
        // Running but no live count yet — show the locked field, not "0 left".
        label = 'Field';
        value = `${registered} ${entriesWord}`;
    } else {
        // Registration / pending: filling toward the cap.
        label = 'Players registered';
        value = (
            <>
                {registered} / {max}
                <Text as="span" color="text.muted" fontWeight="normal">
                    {' '}
                    · min {min}
                </Text>
            </>
        );
        fillRatio = max > 0 ? Math.min(1, registered / max) : 0;
        showBar = true;
    }

    return (
        <VStack align="stretch" spacing={1.5}>
            <Flex justify="space-between" align="baseline" gap={2}>
                <Text
                    fontSize="xs"
                    color="text.secondary"
                    fontWeight="semibold"
                >
                    {label}
                </Text>
                <Text
                    fontSize="xs"
                    color="text.secondary"
                    fontWeight="semibold"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value}
                </Text>
            </Flex>
            {showBar && (
                <Box
                    position="relative"
                    w="full"
                    h="5px"
                    borderRadius="full"
                    bg={trackBg}
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        h="5px"
                        w={`${fillRatio * 100}%`}
                        minW={fillRatio > 0 ? '5px' : '0'}
                        borderRadius="full"
                        bg={isUsdc ? USDC_BLUE : 'brand.green'}
                        opacity={0.9}
                        transition="width 0.3s ease"
                    />
                </Box>
            )}
        </VStack>
    );
}

function PrimaryActions({
    status,
    isRegistered,
    isEliminated,
    canRegister,
    canLateReg,
    canUnregister,
    canReenter,
    freePlay,
    myWallet,
    actionLoading,
    actionLabel,
    goToTableLoading,
    bulletsUsed,
    reentryMax,
    buyInUsdc,
    onRegister,
    onUnregister,
    onGoToTable,
}: {
    status: string;
    isRegistered: boolean;
    isEliminated: boolean;
    canRegister: boolean;
    canLateReg: boolean;
    canUnregister: boolean;
    canReenter: boolean;
    freePlay: boolean;
    myWallet?: string;
    actionLoading: boolean;
    actionLabel?: string;
    goToTableLoading: boolean;
    bulletsUsed: number;
    reentryMax: number;
    buyInUsdc: number;
    onRegister?: (isReentry?: boolean) => void;
    onUnregister?: () => void;
    onGoToTable?: () => void;
}) {
    const buttons: React.ReactNode[] = [];

    if (canRegister || canLateReg) {
        buttons.push(
            <Button
                key="reg"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                loadingText={actionLabel ?? 'Joining…'}
                onClick={() => onRegister?.(false)}
            >
                {canLateReg
                    ? 'Late register'
                    : freePlay
                      ? 'Join tournament'
                      : 'Register'}
            </Button>
        );
    }
    if (status === 'running' && isRegistered && !isEliminated) {
        buttons.push(
            <Button
                key="table"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={goToTableLoading}
                loadingText="Finding table…"
                onClick={onGoToTable}
            >
                Go to my table
            </Button>
        );
    }
    if (canReenter) {
        buttons.push(
            <Button
                key="reenter"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                loadingText={actionLabel ?? 'Re-entering…'}
                onClick={() => onRegister?.(true)}
            >
                Re-enter {!freePlay && `for $${formatUsdc(buyInUsdc)}`}
            </Button>
        );
    }
    if (canUnregister) {
        buttons.push(
            <Button
                key="unreg"
                variant="tactileDestructive"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                onClick={onUnregister}
            >
                Unregister
            </Button>
        );
    }

    if (buttons.length === 0) {
        if (status === 'registration' && isRegistered) {
            return (
                <HStack spacing={2} fontWeight="semibold">
                    <Icon as={FiCheck} boxSize="18px" color="brand.green" />
                    <Text color="brand.green">
                        You’re registered, locked in for the start.
                    </Text>
                </HStack>
            );
        }
        if (
            status === 'running' &&
            isRegistered &&
            isEliminated &&
            !canReenter
        ) {
            const noBullets = bulletsUsed > reentryMax;
            return (
                <Text fontSize="sm" color="text.muted">
                    {noBullets
                        ? 'You’ve used all your bullets in this tournament.'
                        : 'You’ve been eliminated. Follow the standings below.'}
                </Text>
            );
        }
        if (status === 'registration' && !myWallet) {
            return (
                <Text fontSize="sm" color="text.muted">
                    Connect your wallet to register.
                </Text>
            );
        }
        return null;
    }

    return (
        <Flex gap={2} flexWrap="wrap" justify="flex-end">
            {buttons}
        </Flex>
    );
}

function HostPanel({
    tournament: t,
    freePlay,
    registeredCount,
    hostRakeUsdc,
    rakeClaiming,
    actionLoading,
    onFundAndOpen,
    onClaimRake,
    cardBg,
    border,
}: {
    tournament: Tournament;
    freePlay: boolean;
    registeredCount: number;
    hostRakeUsdc?: number | null;
    rakeClaiming: boolean;
    actionLoading: boolean;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
    cardBg: string;
    border: string;
}) {
    const accentBg = useColorModeValue(
        'rgba(253, 197, 29, 0.10)',
        'rgba(253, 197, 29, 0.14)'
    );
    const hostTagFg = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const needsFunding =
        t.status === 'pending' && t.guarantee_usdc > 0 && !!t.contract_address;
    // What the host still covers if buy-ins fall short of the guarantee.
    const buyInsCollected = registeredCount * t.buy_in_usdc;
    const exposure = Math.max(0, t.guarantee_usdc - buyInsCollected);

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack align="stretch" spacing={3}>
                <HStack spacing={2}>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                    >
                        Host controls
                    </Text>
                    <Box
                        bg={accentBg}
                        color={hostTagFg}
                        fontSize="2xs"
                        fontWeight="bold"
                        px={2}
                        py="1px"
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                    >
                        You host this
                    </Box>
                </HStack>

                {needsFunding && (
                    <VStack align="stretch" spacing={2}>
                        <Text
                            fontSize="sm"
                            color="text.secondary"
                            lineHeight={1.5}
                        >
                            Fund the $
                            {formatUsdc(t.guarantee_usdc, { decimals: 0 })}{' '}
                            guaranteed pool to open registration. If buy-ins
                            fall short, your deposit covers the gap, and the
                            unused portion returns to you when the tournament
                            starts.
                        </Text>
                        <Button
                            variant="tactilePrimary"
                            size="md"
                            minH="48px"
                            alignSelf="flex-start"
                            isLoading={actionLoading}
                            onClick={onFundAndOpen}
                        >
                            Fund $
                            {formatUsdc(t.guarantee_usdc, { decimals: 0 })} GTD
                            &amp; open registration
                        </Button>
                    </VStack>
                )}

                {!freePlay &&
                    t.guarantee_usdc > 0 &&
                    t.status === 'registration' && (
                        <Stat label="Your current exposure">
                            <HStack spacing={1}>
                                <Image src={USDC_LOGO} alt="" boxSize="14px" />
                                <Text
                                    fontWeight="bold"
                                    color={USDC_BLUE}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    ${formatUsdc(exposure)}
                                </Text>
                                <Text fontSize="xs" color="text.muted">
                                    covered if no one else joins
                                </Text>
                            </HStack>
                        </Stat>
                    )}

                {t.status === 'completed' && !freePlay && (
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                        <Stat label="Your rake earnings">
                            {hostRakeUsdc === null ||
                            hostRakeUsdc === undefined ? (
                                <HStack spacing={2}>
                                    <Spinner size="xs" />
                                    <Text fontSize="sm" color="text.muted">
                                        Loading…
                                    </Text>
                                </HStack>
                            ) : hostRakeUsdc > 0 ? (
                                <HStack spacing={1}>
                                    <Image
                                        src={USDC_LOGO}
                                        alt=""
                                        boxSize="14px"
                                    />
                                    <Text
                                        fontWeight="bold"
                                        color={USDC_BLUE}
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        ${formatUsdc(hostRakeUsdc)}
                                    </Text>
                                    <Text fontSize="xs" color="text.muted">
                                        claimable
                                    </Text>
                                </HStack>
                            ) : (
                                <Text fontSize="sm" color="text.muted">
                                    Nothing to claim, already withdrawn.
                                </Text>
                            )}
                        </Stat>
                        {(hostRakeUsdc ?? 0) > 0 && (
                            <Button
                                variant="tactilePrimary"
                                size="md"
                                minH="44px"
                                isLoading={rakeClaiming}
                                loadingText="Claiming…"
                                onClick={onClaimRake}
                            >
                                Claim rake
                            </Button>
                        )}
                    </HStack>
                )}
            </VStack>
        </Box>
    );
}

function Standings({
    tournament: t,
    freePlay,
    players,
    myWallet,
    cardBg,
    border,
    rowHover,
    meHighlight,
}: {
    tournament: Tournament;
    freePlay: boolean;
    players: LeaderboardPlayer[];
    myWallet?: string;
    cardBg: string;
    border: string;
    rowHover: string;
    meHighlight: string;
}) {
    const running = t.status === 'running';
    const completed = t.status === 'completed';
    const goldRank = useColorModeValue('brand.yellowDark', 'brand.yellow');
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            overflow="hidden"
        >
            <Flex
                px={{ base: 4, md: 6 }}
                pt={4}
                pb={2}
                align="baseline"
                justify="space-between"
                gap={2}
            >
                <Text fontWeight="bold" fontSize="md" color="text.primary">
                    {completed ? 'Final standings' : 'Current standings'}
                </Text>
                <Text
                    fontSize="xs"
                    color="text.muted"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {players.length} player{players.length !== 1 ? 's' : ''}
                </Text>
            </Flex>
            <Box
                overflowX="auto"
                overflowY="auto"
                maxH={{ base: '440px', lg: '600px' }}
                tabIndex={0}
                role="region"
                aria-label={completed ? 'Final standings' : 'Current standings'}
                sx={HIDE_X_SCROLLBAR_SX}
            >
                <Table
                    size="sm"
                    variant="simple"
                    sx={{
                        'th, td': { borderColor: border, px: 2 },
                        'thead th': {
                            position: 'sticky',
                            top: 0,
                            bg: cardBg,
                            zIndex: 1,
                        },
                    }}
                >
                    <Thead>
                        <Tr>
                            <Th w="48px">#</Th>
                            <Th>Player</Th>
                            {running && t.reentry_allowed && (
                                <Th isNumeric>Bullets</Th>
                            )}
                            {running && <Th isNumeric>Chips</Th>}
                            {running && <Th isNumeric>Table</Th>}
                            {completed && !freePlay && <Th isNumeric>Prize</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {players.map((p, i) => {
                            const rank =
                                p.finish_pos === 0 ? i + 1 : p.finish_pos;
                            const isOut = p.finish_pos > 0;
                            const isMe =
                                myWallet &&
                                p.wallet.toLowerCase() ===
                                    myWallet.toLowerCase();
                            return (
                                <Tr
                                    key={p.uuid}
                                    bg={isMe ? meHighlight : undefined}
                                    _hover={{
                                        bg: isMe ? meHighlight : rowHover,
                                    }}
                                    opacity={isOut && !completed ? 0.55 : 1}
                                >
                                    <Td
                                        fontWeight="bold"
                                        color={
                                            rank === 1
                                                ? goldRank
                                                : 'text.primary'
                                        }
                                    >
                                        {rank}
                                    </Td>
                                    <Td>
                                        <HStack spacing={3} minW={0}>
                                            <Box boxSize="36px" flexShrink={0}>
                                                <PlayerAvatar
                                                    profileImageUrl={
                                                        p.xProfileImageUrl
                                                    }
                                                    address={p.wallet}
                                                    username={
                                                        p.xUsername
                                                            ? `@${p.xUsername}`
                                                            : p.wallet || p.uuid
                                                    }
                                                    initialsFontSize="13px"
                                                />
                                            </Box>
                                            <VStack
                                                align="start"
                                                spacing={0}
                                                minW={0}
                                            >
                                                <HStack spacing={1.5} minW={0}>
                                                    {p.xUsername ? (
                                                        <PlayerNameLink
                                                            username={`@${p.xUsername}`}
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                            noOfLines={1}
                                                        />
                                                    ) : p.wallet ? (
                                                        <ExternalLink
                                                            href={`${explorerBase(t.chain)}/address/${p.wallet}`}
                                                            fontSize="sm"
                                                            fontFamily="mono"
                                                            color="text.primary"
                                                        >
                                                            {shortAddr(
                                                                p.wallet
                                                            )}
                                                        </ExternalLink>
                                                    ) : (
                                                        <Text
                                                            fontSize="sm"
                                                            color="text.muted"
                                                            fontFamily="mono"
                                                        >
                                                            {p.uuid.slice(0, 8)}
                                                        </Text>
                                                    )}
                                                    {isMe && (
                                                        <Text
                                                            fontSize="2xs"
                                                            fontWeight="bold"
                                                            color="brand.green"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.06em"
                                                        >
                                                            you
                                                        </Text>
                                                    )}
                                                    {isOut && running && (
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.06em"
                                                        >
                                                            out
                                                        </Text>
                                                    )}
                                                </HStack>
                                                {p.xUsername && p.wallet && (
                                                    <ExternalLink
                                                        href={`${explorerBase(t.chain)}/address/${p.wallet}`}
                                                        fontSize="2xs"
                                                        fontFamily="mono"
                                                        color="text.muted"
                                                        iconSize="9px"
                                                    >
                                                        {shortAddr(p.wallet)}
                                                    </ExternalLink>
                                                )}
                                            </VStack>
                                        </HStack>
                                    </Td>
                                    {running && t.reentry_allowed && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize="xs"
                                                color="text.muted"
                                            >
                                                {p.bullet_number ?? 1}
                                            </Text>
                                        </Td>
                                    )}
                                    {running && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize="xs"
                                                color={
                                                    isOut
                                                        ? 'text.muted'
                                                        : 'text.primary'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {isOut
                                                    ? '—'
                                                    : p.stack.toLocaleString()}
                                            </Text>
                                        </Td>
                                    )}
                                    {running && (
                                        <Td isNumeric>
                                            {isOut ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <ExternalLink
                                                    href={`/table/tournament-${t.id}-table-${p.table_index + 1}`}
                                                    fontSize="xs"
                                                    color="text.secondary"
                                                    iconSize="9px"
                                                >
                                                    T{p.table_index + 1}
                                                </ExternalLink>
                                            )}
                                        </Td>
                                    )}
                                    {completed && !freePlay && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize="xs"
                                                fontWeight={
                                                    (p.prize_usdc ?? 0) > 0
                                                        ? 'bold'
                                                        : 'normal'
                                                }
                                                color={
                                                    (p.prize_usdc ?? 0) > 0
                                                        ? USDC_BLUE
                                                        : 'text.muted'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {(p.prize_usdc ?? 0) > 0
                                                    ? `$${formatUsdc(p.prize_usdc as number)}`
                                                    : '—'}
                                            </Text>
                                        </Td>
                                    )}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
}

function PayoutsPanel({
    tournament: t,
    cardBg,
    border,
    linkColor,
}: {
    tournament: Tournament;
    cardBg: string;
    border: string;
    linkColor: string;
}) {
    const settled = !!t.settlement_tx_hash;
    const okBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const pendBg = useColorModeValue(
        'rgba(237, 137, 54, 0.12)',
        'rgba(237, 137, 54, 0.20)'
    );
    const pendFg = useColorModeValue('orange.600', 'orange.300');
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack align="stretch" spacing={2}>
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                >
                    Payouts
                </Text>
                {settled ? (
                    <HStack spacing={2} fontSize="sm" flexWrap="wrap">
                        <Box
                            bg={okBg}
                            color="brand.green"
                            fontSize="2xs"
                            fontWeight="bold"
                            px={2}
                            py="2px"
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                        >
                            Prizes distributed
                        </Box>
                        <Box
                            as="a"
                            href={`${explorerBase(t.chain)}/tx/${t.settlement_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            fontFamily="mono"
                            fontSize="xs"
                            display="inline-flex"
                            alignItems="center"
                            gap="3px"
                            color={linkColor}
                            _hover={{
                                color: 'brand.green',
                                textDecoration: 'underline',
                            }}
                        >
                            {t.settlement_tx_hash!.slice(0, 10)}…
                            {t.settlement_tx_hash!.slice(-8)}
                            <Icon as={FiExternalLink} boxSize="10px" />
                        </Box>
                    </HStack>
                ) : (
                    <HStack spacing={2} fontSize="sm" flexWrap="wrap">
                        <Box
                            bg={pendBg}
                            color={pendFg}
                            fontSize="2xs"
                            fontWeight="bold"
                            px={2}
                            py="2px"
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                        >
                            Settling
                        </Box>
                        <Text fontSize="xs" color="text.muted">
                            Prizes are being distributed on-chain, this usually
                            takes a moment.
                        </Text>
                    </HStack>
                )}
            </VStack>
        </Box>
    );
}

function RefundPanel({
    status,
    refund,
    myWallet,
    onClaimRefund,
    cardBg,
    border,
}: {
    status: string;
    refund?: RefundState;
    myWallet?: string;
    onClaimRefund?: () => void;
    cardBg: string;
    border: string;
}) {
    const r = refund ?? {};
    const tagBg = useColorModeValue(
        'rgba(237, 137, 54, 0.12)',
        'rgba(237, 137, 54, 0.20)'
    );
    const tagFg = useColorModeValue('orange.600', 'orange.300');
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack align="stretch" spacing={3}>
                <Box
                    alignSelf="flex-start"
                    bg={tagBg}
                    color={tagFg}
                    fontSize="2xs"
                    fontWeight="bold"
                    px={2}
                    py="2px"
                    borderRadius="full"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                >
                    {status === 'emergency_refund'
                        ? 'Refunds open'
                        : 'Tournament cancelled'}
                </Box>
                {!myWallet ? (
                    <Text fontSize="sm" color="text.muted">
                        Connect your wallet to check your refund.
                    </Text>
                ) : r.loading ? (
                    <HStack spacing={2}>
                        <Spinner size="xs" />
                        <Text fontSize="sm" color="text.muted">
                            Checking your refund…
                        </Text>
                    </HStack>
                ) : r.alreadyClaimed ? (
                    <Text fontSize="sm" color="text.muted">
                        Your buy-in refund has been claimed.
                    </Text>
                ) : r.eligible ? (
                    <HStack spacing={3} flexWrap="wrap">
                        <HStack spacing={1}>
                            <Image src={USDC_LOGO} alt="" boxSize="14px" />
                            <Text
                                fontWeight="bold"
                                color={USDC_BLUE}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {r.estimatedUsdc != null
                                    ? `$${formatUsdc(r.estimatedUsdc)}`
                                    : 'Pro-rata refund'}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                                {r.estimatedUsdc != null
                                    ? 'refundable'
                                    : 'available'}
                            </Text>
                        </HStack>
                        <Button
                            variant="tactilePrimary"
                            size="md"
                            minH="44px"
                            isLoading={r.claiming}
                            loadingText="Claiming…"
                            onClick={onClaimRefund}
                        >
                            Claim refund
                        </Button>
                    </HStack>
                ) : (
                    <Text fontSize="sm" color="text.muted">
                        You weren’t registered in this tournament.
                    </Text>
                )}
            </VStack>
        </Box>
    );
}

function EmergencyPanel({
    emergency,
    advertisedEnd,
    onEnable,
    cardBg,
    border,
    yellowText,
}: {
    emergency?: EmergencyState;
    advertisedEnd: string;
    onEnable?: () => void;
    cardBg: string;
    border: string;
    yellowText: string;
}) {
    const e = emergency ?? {};
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack align="stretch" spacing={2}>
                <HStack spacing={2}>
                    <Icon as={FiShield} boxSize="13px" color="text.muted" />
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                    >
                        Your safety net
                    </Text>
                </HStack>
                {e.opened ? (
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        Emergency refunds are open, any registered player can
                        recover their buy-in directly from the contract.
                    </Text>
                ) : e.available ? (
                    <VStack align="stretch" spacing={2}>
                        <Text
                            fontSize="sm"
                            color="text.secondary"
                            lineHeight={1.5}
                        >
                            This tournament has run past its advertised end
                            without settling. Any registered player can open
                            emergency refunds so everyone can recover their
                            buy-ins from the contract.
                        </Text>
                        <Button
                            variant="tactileOutline"
                            size="md"
                            minH="44px"
                            alignSelf="flex-start"
                            isLoading={e.opening}
                            loadingText="Opening…"
                            onClick={onEnable}
                        >
                            Open emergency refunds
                        </Button>
                    </VStack>
                ) : (
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        Your buy-in is safe. If prizes aren’t paid within 24
                        hours of the advertised end (
                        {formatTournamentStart(advertisedEnd)}), any player can
                        open emergency refunds to recover buy-ins from the
                        contract
                        {e.msUntilAvailable != null &&
                            e.msUntilAvailable > 0 && (
                                <Text
                                    as="span"
                                    color={yellowText}
                                    fontWeight="semibold"
                                >
                                    {' '}
                                    · available in{' '}
                                    {formatDuration(e.msUntilAvailable)}
                                </Text>
                            )}
                        .
                    </Text>
                )}
            </VStack>
        </Box>
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
            px={2.5}
            py="4px"
            borderRadius="full"
            bg={styles.bg}
            flexShrink={0}
        >
            {styles.dot && (
                <Box
                    w="7px"
                    h="7px"
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
                fontSize="xs"
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
