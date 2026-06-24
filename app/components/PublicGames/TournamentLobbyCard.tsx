'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    SimpleGrid,
    Spinner,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiCheck, FiClock, FiGlobe, FiLock } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaChartLine, FaDiscord, FaTelegram } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { Tournament } from '../../hooks/server_actions';
import type { PendingTournamentTx } from '../../hooks/usePendingTournamentTxs';
import ExternalLink from '../ExternalLink';
import ChainBadge from '../ChainBadge';
import PlayerAvatar from '../PlayerAvatar';
import type { SocialTone } from '../SocialIconButton';
import { USDC_BLUE, USDC_LOGO, truncateAddress } from './types';
import {
    formatUsdc,
    getStatusDescriptor,
    getTournamentMoney,
    isFreePlay as getIsFreePlay,
    useCountdown,
} from './tournamentFormat';
import { levelDurationMin, templateLabel } from './blindStructures';
import {
    placesPaid,
    projectedPrizePoolUsdc,
    payoutForPosition,
} from './payouts';
import {
    accentFor,
    identityFor,
    TournamentDefaultAvatar,
    TournamentDefaultCover,
} from './tournamentDefaults';

export interface TournamentLobbyCardProps {
    tournament: Tournament;
    myWallet?: string;
    /** Whether the viewer has a verified (SIWE) session. When false, the
     * register CTA becomes a "Sign in to register" prompt. */
    isSignedIn?: boolean;
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

// The banner is a card's hero image; eager-load the first couple of rows so the
// above-the-fold banners count toward LCP instead of waiting on the observer.
const EAGER_BANNER_COUNT = 6;

// On-system arrival: settle curve (ease-out-expo, no overshoot), no lift on hover.
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

// A field at/over this fraction of the cap reads as "Almost full" — count info, a
// calm tone shift, never a "hurry!" device.
const ALMOST_FULL = 0.8;

export default function TournamentLobbyCard({
    tournament: t,
    myWallet,
    isSignedIn = true,
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

    // Color-mode pairs expressed as CSS (`_dark`) rather than the useColorModeValue
    // JS hook, so they switch with the `.chakra-ui-dark` class without a context
    // round-trip — correct in SSR, on first paint, and in the screenshot harness.
    const cardSurface = { bg: 'white', _dark: { bg: 'card.darkNavy' } } as const;
    const yellowText = {
        color: 'brand.yellowDark',
        _dark: { color: 'brand.yellow' },
    } as const;
    // The faint "felt" wash under the board strip — warmth specced, not hoped.
    const stripWash = {
        bg: 'rgba(54, 163, 123, 0.08)',
        _dark: { bg: 'rgba(54, 163, 123, 0.11)' },
    } as const;

    const now = new Date();
    const lateRegCloseMs = new Date(t.late_reg_close_at).getTime();
    const lateRegCloseKnown = !Number.isNaN(lateRegCloseMs);
    const scheduledStartMs = new Date(t.scheduled_start_at).getTime();
    const scheduledStartKnown = !Number.isNaN(scheduledStartMs);
    const fiveMinBeforeStart = scheduledStartMs - 5 * 60 * 1000;

    const hasPendingRegister = pendingTx?.type === 'register';
    const isRegistered = registeredIds.has(t.id) || hasPendingRegister;
    const isHost =
        !!myWallet && t.host_wallet?.toLowerCase() === myWallet.toLowerCase();
    // While the tournament is running with late-reg levels, treat an unknown
    // close time as still-open rather than silently suppressing the CTA — the
    // backend owns the hard cutoff, so a missing timestamp shouldn't lock players out.
    const isLateRegOpen =
        t.status === 'running' &&
        (t.late_reg_levels ?? 0) > 0 &&
        (!lateRegCloseKnown || now.getTime() < lateRegCloseMs);
    const freePlay = getIsFreePlay(t);
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateRegister = isLateRegOpen && !isRegistered && !pendingTx;
    const canUnregister =
        t.status === 'registration' &&
        isRegistered &&
        !hasPendingRegister &&
        (freePlay ||
            !scheduledStartKnown ||
            now.getTime() < fiveMinBeforeStart);
    const canFundGuarantee =
        isHost &&
        t.status === 'pending' &&
        t.guarantee_usdc > 0 &&
        !!t.contract_address;

    const filling = t.status === 'registration' || t.status === 'pending';
    const reg = t.registered_count ?? 0;
    const almostFull =
        filling && t.max_entries > 0 && reg / t.max_entries >= ALMOST_FULL;
    // One state pill in the header: your own status when you're in it, else the
    // tournament's lifecycle — keeps the title roomy and the header short.
    const showPlayerState =
        isRegistered && (t.status === 'registration' || t.status === 'running');

    const ident = identityFor(t.metadata?.blind_structure as string | undefined);
    const accent = accentFor(t.metadata?.blind_structure as string | undefined);
    // Suit-mark ink, AA-tuned per mode (tournamentDefaults), applied as CSS pairs.
    const suitInk = {
        color: accent.inkLight,
        _dark: { color: accent.inkDark },
    } as const;

    const money = getTournamentMoney(t);
    const stack = t.starting_stack_bb > 0 ? `${t.starting_stack_bb} BB` : '—';
    const levelLen = levelDurationMin(
        t.metadata?.blind_structure as string | undefined
    );
    // Re-entry only when it's actually allowed — surfaced as a meta pill, not a
    // "Single shot" negative buried in the payout line.
    const reEntry = t.reentry_allowed
        ? t.reentry_max > 1
            ? `${t.reentry_max} bullets`
            : 'Re-entry'
        : null;

    const socials = hostSocials(t);

    return (
        <Box
            as="article"
            {...cardSurface}
            borderWidth="1px"
            borderColor="border.pillNeutral"
            borderRadius="16px"
            boxShadow="card.lift"
            overflow="hidden"
            cursor={onCardClick ? 'pointer' : undefined}
            onClick={onCardClick ? () => onCardClick(t.id) : undefined}
            transition="border-color var(--chakra-transition-duration-settle, 220ms) var(--chakra-transition-easing-settle, ease-out)"
            _hover={{ borderColor: 'brand.green' }}
            _focusWithin={{ borderColor: 'brand.green' }}
            animation={
                prefersReducedMotion
                    ? undefined
                    : `${fadeUp} var(--chakra-transition-duration-settle, 220ms) var(--chakra-transition-easing-settle, cubic-bezier(0.16, 1, 0.3, 1)) both`
            }
            style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
            display="flex"
            flexDirection="column"
            h="full"
        >
            {/* ── Brand marquee: banner art or the generated suit cover ── */}
            <Box h="74px" overflow="hidden" position="relative">
                {t.banner_url ? (
                    <Image
                        src={t.banner_url}
                        alt=""
                        w="full"
                        h="full"
                        objectFit="cover"
                        loading={index < EAGER_BANNER_COUNT ? 'eager' : 'lazy'}
                    />
                ) : (
                    <TournamentDefaultCover
                        type={t.metadata?.blind_structure as string | undefined}
                    />
                )}
            </Box>

            {/* ── Header: the mark sits INLINE, vertically centered with the title
                (it straddles up into the banner via a negative margin); state pills
                live on the opaque surface so they read on any banner. ── */}
            <Flex px={4} pt={1.5} pb={2} gap={3} align="center" minH="40px">
                <Box
                    mt="-30px"
                    boxSize="64px"
                    borderRadius="16px"
                    borderWidth="3px"
                    borderColor="white"
                    bg="white"
                    _dark={{ borderColor: 'card.darkNavy', bg: 'card.darkNavy' }}
                    overflow="hidden"
                    boxShadow="card.lift"
                    flexShrink={0}
                    zIndex={1}
                >
                    {t.logo_url ? (
                        <Image src={t.logo_url} alt="" w="full" h="full" objectFit="cover" />
                    ) : (
                        <TournamentDefaultAvatar
                            type={t.metadata?.blind_structure as string | undefined}
                            size={60}
                        />
                    )}
                </Box>
                <VStack align="start" spacing={1} minW={0} flex={1}>
                    <Text
                        fontWeight="bold"
                        fontSize="md"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        lineHeight="1.2"
                        noOfLines={1}
                    >
                        {t.name ||
                            (freePlay ? 'Free-play tournament' : 'No-limit Hold’em')}
                    </Text>
                    <HStack spacing={1.5} flexWrap="wrap">
                        <HStack spacing={1}>
                            <Text as="span" fontSize="sm" lineHeight="1" {...suitInk}>
                                {ident.suit}
                            </Text>
                            <Text
                                as="span"
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="0.04em"
                                textTransform="uppercase"
                                {...suitInk}
                            >
                                {templateLabel(
                                    t.metadata?.blind_structure as string | undefined
                                )}
                            </Text>
                        </HStack>
                        {freePlay && <FreeTag />}
                        {t.is_private && <PrivatePill />}
                        {reEntry && (
                            <Text
                                px={1.5}
                                py="2px"
                                borderRadius="full"
                                bg="bg.pillNeutral"
                                fontSize="2xs"
                                fontWeight="bold"
                                color="text.muted"
                                lineHeight="1"
                                flexShrink={0}
                            >
                                {reEntry}
                            </Text>
                        )}
                    </HStack>
                </VStack>
                <Box flexShrink={0}>
                    {showPlayerState ? (
                        <PlayerStatePill
                            status={t.status}
                            isRegistered={isRegistered}
                            isEliminated={isEliminated}
                        />
                    ) : (
                        <StatusPill status={t.status} />
                    )}
                </Box>
            </Flex>

            {/* ── Board strip: GTD hero anchoring an aligned comparison grid ── */}
            <Box flex="1" display="flex" flexDirection="column">
                <Box
                    {...stripWash}
                    borderTopWidth="1px"
                    borderColor="border.pillNeutral"
                    position="relative"
                    px={4}
                    py={3}
                    flex="1"
                >
                    {/* Chain lockup by the prize pool — multichain-ready, and the
                        one blue (USDC) on the card stays the money figure. */}
                    {t.chain && (
                        <Box position="absolute" top="12px" right="14px">
                            <ChainBadge chain={t.chain} size="sm" variant="lockup" />
                        </Box>
                    )}
                    <MoneyHero money={money} />

                    <SimpleGrid columns={2} spacingX={3} spacingY={2} mt={2.5}>
                        <Cell label="Levels">
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="text.primary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {levelLen} min
                            </Text>
                        </Cell>
                        <Cell label="Stack">
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="text.primary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {stack}
                            </Text>
                        </Cell>
                        <Cell label="Starts">
                            <StartValue
                                status={t.status}
                                startIso={t.scheduled_start_at}
                                showCountdown={filling}
                            />
                        </Cell>
                        <Cell label="Field">
                            <FieldValue t={t} filling={filling} almostFull={almostFull} />
                        </Cell>
                    </SimpleGrid>

                    {filling && (
                        <VStack align="stretch" spacing={1} mt={2.5}>
                            {/* No cap → no fill bar (it would never fill); show the
                                field as a plain count instead. */}
                            {t.max_entries > 0 && (
                                <FillBar
                                    registered={reg}
                                    max={t.max_entries}
                                    almostFull={almostFull}
                                />
                            )}
                            {reg < t.min_entries ? (
                                <Text fontSize="2xs" color="text.muted">
                                    Needs {t.min_entries} players to run
                                </Text>
                            ) : t.max_entries > 0 && almostFull ? (
                                <Text fontSize="2xs" fontWeight="semibold" {...yellowText}>
                                    Almost full
                                </Text>
                            ) : t.max_entries <= 0 ? (
                                <Text fontSize="2xs" color="text.muted">
                                    Open field — no cap
                                </Text>
                            ) : null}
                        </VStack>
                    )}
                    {isLateRegOpen && <LateRegNotice closeIso={t.late_reg_close_at} />}

                    <Flex
                        align="center"
                        gap={1.5}
                        mt={2.5}
                        fontSize="2xs"
                        fontWeight="semibold"
                    >
                        <Text as="span" color="text.muted">
                            NLH
                        </Text>
                        <Box as="span" color="border.pillNeutral">
                            ·
                        </Box>
                        <PayoutLine t={t} freePlay={freePlay} />
                    </Flex>
                </Box>

                {/* ── Host billboard: the co-branded credit + community links ── */}
                <Flex
                    align="center"
                    gap={2}
                    px={4}
                    py={2}
                    borderTopWidth="1px"
                    borderColor="border.pillNeutral"
                >
                    <Box position="relative" boxSize="28px" flexShrink={0}>
                        <Box
                            position="absolute"
                            inset={0}
                            borderRadius="full"
                            overflow="hidden"
                        >
                            <PlayerAvatar
                                address={t.host_wallet}
                                username={truncateAddress(t.host_wallet)}
                                initialsFontSize="10px"
                            />
                        </Box>
                        <Box
                            position="absolute"
                            inset={0}
                            borderRadius="full"
                            pointerEvents="none"
                            boxShadow="inset 0 0 0 1px rgba(11, 20, 48, 0.08)"
                            _dark={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10)' }}
                        />
                    </Box>
                    <Text fontSize="xs" color="text.muted" noOfLines={1} minW={0}>
                        Hosted by{' '}
                        <Text as="span" color="text.secondary" fontWeight="semibold">
                            {truncateAddress(t.host_wallet)}
                        </Text>
                    </Text>
                    {socials.length > 0 && (
                        <HStack spacing={1} ml="auto" flexShrink={0}>
                            {socials.map((s) => (
                                <SocialChip key={s.tone} tone={s.tone} url={s.url} />
                            ))}
                        </HStack>
                    )}
                </Flex>

                {/* ── Actions, pinned to the bottom for a consistent baseline ── */}
                <HStack
                    spacing={2}
                    px={4}
                    pb={3.5}
                    pt={1}
                    flexWrap="wrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    {canFundGuarantee && (
                        <ActionButton
                            variant="tactileGold"
                            isLoading={isLoading}
                            onClick={() => onFundGuarantee?.(t.id)}
                        >
                            Fund $
                            {formatUsdc(t.guarantee_usdc, {
                                decimals: t.guarantee_usdc < 5_000_000 ? 2 : 0,
                            })}{' '}
                            GTD &amp; open
                        </ActionButton>
                    )}
                    {canRegister && (
                        <ActionButton
                            variant={freePlay ? 'tactilePrimary' : 'tactileGold'}
                            isLoading={isLoading}
                            onClick={() => onRegister(t.id)}
                        >
                            {!isSignedIn
                                ? 'Sign in to register'
                                : freePlay
                                  ? 'Join'
                                  : 'Register'}
                        </ActionButton>
                    )}
                    {canLateRegister && (
                        <ActionButton
                            variant={freePlay ? 'tactilePrimary' : 'tactileGold'}
                            isLoading={isLoading}
                            onClick={() => onRegister(t.id)}
                        >
                            {!isSignedIn ? 'Sign in to register' : 'Late register'}
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
                                {...yellowText}
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
                                    <Text {...yellowText}>Syncing…</Text>
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
                                    ? 'tactileNeutral'
                                    : 'tactileOutline'
                            }
                            isLoading={isLoading}
                            onClick={() => onViewOverview(t.id)}
                        >
                            {t.status === 'completed' ? 'Final standings' : 'Standings'}
                        </ActionButton>
                    )}
                </HStack>
            </Box>
        </Box>
    );
}

// A compact tactile community-link chip — a real anchor (a11y), tones mirrored
// from SocialIconButton so the Host's links read the same everywhere.
const SOCIAL_META: Record<SocialTone, { bg: string; icon: IconType; label: string }> = {
    x: { bg: '#0F1419', icon: RiTwitterXLine, label: 'X' },
    discord: { bg: '#5865F2', icon: FaDiscord, label: 'Discord' },
    telegram: { bg: '#0088CC', icon: FaTelegram, label: 'Telegram' },
    website: { bg: '#475569', icon: FiGlobe, label: 'Website' },
    chart: { bg: '#36A37B', icon: FaChartLine, label: 'Chart' },
};

function SocialChip({ tone, url }: { tone: SocialTone; url: string }) {
    const m = SOCIAL_META[tone];
    return (
        <Box
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Host ${m.label}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="26px"
            borderRadius="8px"
            bg={m.bg}
            color="white"
            flexShrink={0}
            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.12)`}
            transition="transform 80ms cubic-bezier(0.4, 0, 0.2, 1)"
            _active={{ transform: 'translateY(1px)' }}
        >
            <Icon as={m.icon} boxSize="13px" />
        </Box>
    );
}

// The host's community links, in a stable order, only the ones that exist.
function hostSocials(t: Tournament): { tone: SocialTone; url: string }[] {
    const out: { tone: SocialTone; url: string }[] = [];
    if (t.x_url) out.push({ tone: 'x', url: t.x_url });
    if (t.discord_url) out.push({ tone: 'discord', url: t.discord_url });
    if (t.telegram_url) out.push({ tone: 'telegram', url: t.telegram_url });
    if (t.website_url) out.push({ tone: 'website', url: t.website_url });
    if (t.chart_url) out.push({ tone: 'chart', url: t.chart_url });
    return out.slice(0, 4);
}

// The value hero: the prize pool / guarantee leads, in USDC blue with the mark.
// Free Play stays neutral, never dressed as money.
function MoneyHero({
    money,
}: {
    money: ReturnType<typeof getTournamentMoney>;
}) {
    return (
        <VStack align="start" spacing={0}>
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
                    <Image src={USDC_LOGO} alt="" boxSize="20px" loading="lazy" flexShrink={0} />
                )}
                <Text
                    fontWeight="extrabold"
                    fontSize="2xl"
                    lineHeight="1.05"
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
            {money.buyIn && (
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    fontWeight="semibold"
                    mt="3px"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {money.buyIn} buy-in
                </Text>
            )}
        </VStack>
    );
}

// One aligned column cell in the comparison grid. The labels line up across
// stacked cards so a player can scan down a column.
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <VStack align="start" spacing={0.5} minW={0}>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.07em"
                fontWeight="semibold"
            >
                {label}
            </Text>
            {children}
        </VStack>
    );
}

function StartValue({
    status,
    startIso,
    showCountdown,
}: {
    status: string;
    startIso: string;
    showCountdown: boolean;
}) {
    const countdown = useCountdown(startIso);
    let label: string;
    if (showCountdown) {
        label = countdown.ready
            ? countdown.isPast
                ? 'Now'
                : countdown.label
            : 'Soon';
    } else if (status === 'running') {
        label = 'Live';
    } else if (status === 'completed') {
        label = 'Final';
    } else if (status === 'cancelled') {
        label = '—';
    } else {
        label = 'Soon';
    }
    return (
        <HStack spacing={1} minW={0}>
            <Icon as={FiClock} boxSize="12px" color="text.muted" flexShrink={0} />
            <Text
                fontSize="sm"
                fontWeight="bold"
                color="text.primary"
                noOfLines={1}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {label}
            </Text>
        </HStack>
    );
}

function FieldValue({
    t,
    filling,
    almostFull,
}: {
    t: Tournament;
    filling: boolean;
    almostFull: boolean;
}) {
    const reg = t.registered_count ?? 0;
    if (filling) {
        return (
            <Text
                fontSize="sm"
                fontWeight="bold"
                color={almostFull ? 'brand.yellowDark' : 'text.primary'}
                _dark={almostFull ? { color: 'brand.yellow' } : undefined}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {t.max_entries > 0 ? `${reg}/${t.max_entries}` : reg}
            </Text>
        );
    }
    return (
        <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.primary"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {reg} {reg === 1 ? 'entry' : 'entries'}
        </Text>
    );
}

// "Pays top N · ~$X to 1st" — structure (places paid) plus the projected top
// prize, computed from the field with the same math the contract settles by.
function PayoutLine({ t, freePlay }: { t: Tournament; freePlay: boolean }) {
    const field = Math.max(t.registered_count ?? 0, t.min_entries || 2);
    const paid = placesPaid(field);
    if (freePlay) {
        return (
            <Text as="span" color="text.secondary" whiteSpace="nowrap">
                Pays top {paid}
            </Text>
        );
    }
    const pool =
        t.prize_pool_usdc > 0
            ? t.prize_pool_usdc
            : projectedPrizePoolUsdc(
                  field,
                  t.buy_in_usdc,
                  t.fee_bps ?? 0,
                  t.guarantee_usdc ?? 0
              );
    const first = payoutForPosition(1, field, pool);
    return (
        <Text as="span" color="text.secondary" whiteSpace="nowrap">
            Pays top {paid}
            {first > 0 && (
                <>
                    {' · ~$'}
                    {formatUsdc(first, { decimals: first < 5_000_000 ? 2 : 0 })} to
                    1st
                </>
            )}
        </Text>
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
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg="bg.pillNeutral"
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
    return (
        <HStack
            spacing={1}
            px={1.5}
            py="2px"
            borderRadius="full"
            bg="bg.pillNeutral"
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
    const { label, tone } = getStatusDescriptor(status);

    const yellowFg = useColorModeValue('brand.yellowDark', 'brand.yellow');

    const styles = {
        open: { bg: 'bg.greenTint', fg: 'brand.green', dot: 'brand.green' },
        live: { bg: 'bg.pillNeutral', fg: 'text.primary', dot: 'brand.green' },
        done: { bg: 'bg.pillNeutral', fg: 'text.muted', dot: null },
        cancelled: { bg: 'bg.pillNeutral', fg: 'text.muted', dot: null },
        setup: { bg: 'bg.pillNeutral', fg: 'text.muted', dot: null },
        refund: { bg: 'bg.yellowTint', fg: yellowFg, dot: yellowFg },
    }[tone];

    return (
        <HStack
            spacing={1.5}
            px={2.5}
            py={1}
            borderRadius="full"
            bg={styles.bg}
            flexShrink={0}
        >
            {styles.dot && (
                <Box w="6px" h="6px" borderRadius="full" bg={styles.dot} aria-hidden />
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
    if (!isRegistered) return null;

    let content: { bg: string; fg: string; icon: boolean; label: string } | null =
        null;
    if (status === 'registration') {
        content = { bg: 'bg.greenTint', fg: 'brand.green', icon: true, label: 'Registered' };
    } else if (status === 'running' && !isEliminated) {
        content = { bg: 'bg.greenTint', fg: 'brand.green', icon: true, label: 'You’re in' };
    } else if (status === 'running' && isEliminated) {
        content = { bg: 'bg.pillNeutral', fg: 'text.muted', icon: false, label: 'Eliminated' };
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
            {content.icon && <Icon as={FiCheck} boxSize="11px" color={content.fg} />}
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

function LateRegNotice({ closeIso }: { closeIso: string }) {
    const countdown = useCountdown(closeIso);

    let label: string;
    if (!countdown.ready) {
        label = 'Late registration open';
    } else if (countdown.isPast) {
        label = 'Late registration closing now';
    } else {
        label = `Late registration closes in ${countdown.label}`;
    }

    return (
        <Text
            fontSize="2xs"
            fontWeight="semibold"
            color="brand.yellowDark"
            _dark={{ color: 'brand.yellow' }}
            mt={2}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {label}
        </Text>
    );
}

function FillBar({
    registered,
    max,
    almostFull,
}: {
    registered: number;
    max: number;
    almostFull: boolean;
}) {
    const ratio = max <= 0 ? 0 : Math.min(1, registered / max);
    return (
        <Box
            position="relative"
            w="full"
            h="5px"
            borderRadius="full"
            bg="rgba(11, 20, 48, 0.10)"
            _dark={{ bg: 'rgba(255, 255, 255, 0.12)' }}
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                h="5px"
                w={`${ratio * 100}%`}
                minW={registered > 0 ? '5px' : '0'}
                borderRadius="full"
                bg={almostFull ? 'brand.yellow' : 'brand.green'}
                transition="width var(--chakra-transition-duration-settle, 220ms) var(--chakra-transition-easing-settle, ease-out)"
            />
        </Box>
    );
}
