'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    SimpleGrid,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import type { Tournament } from '../../hooks/server_actions';
import { USDC_BLUE, USDC_LOGO } from './types';
import {
    formatTournamentStart,
    formatUsdc,
    isFreePlay as getIsFreePlay,
    useCountdown,
} from './tournamentFormat';
import { TournamentDefaultAvatar } from './tournamentDefaults';

interface TournamentHeroBandProps {
    tournaments: Tournament[];
    /** Jump to the Tournaments tab for the full list. */
    onSeeAll: () => void;
}

function lateRegClose(t: Tournament): number {
    return new Date(t.late_reg_close_at).getTime();
}

function isLateRegOpen(t: Tournament, now: number): boolean {
    if (t.status !== 'running' || (t.late_reg_levels ?? 0) <= 0) return false;
    const close = lateRegClose(t);
    return Number.isNaN(close) || now < close;
}

// A tournament a player can still get into right now: open for registration, or
// live with late registration still open. Everything else (pending/completed/
// cancelled/refunding) stays out of the band so it never headlines a dead event.
function isFillable(t: Tournament, now: number): boolean {
    return t.status === 'registration' || isLateRegOpen(t, now);
}

function startMs(t: Tournament): number {
    const ms = new Date(t.scheduled_start_at).getTime();
    return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
}

// Closeness to firing — a registration tournament at/over its min field is the
// safest to headline; under min still ranks by how close it is.
function fillRatio(t: Tournament): number {
    const min = t.min_entries ?? 0;
    const reg = t.registered_count ?? 0;
    if (min > 0) return reg / min;
    return reg > 0 ? 1 : 0;
}

// Lead with live (late-reg) events — they're already firing, so they can't
// cancel — then registration events likeliest to hit their minimum, soonest
// first. Never rank by soonest-start alone, or we'd headline events that fold.
function rankCandidates(tournaments: Tournament[], now: number): Tournament[] {
    return tournaments
        .filter((t) => isFillable(t, now))
        .sort((a, b) => {
            const la = isLateRegOpen(a, now) ? 0 : 1;
            const lb = isLateRegOpen(b, now) ? 0 : 1;
            if (la !== lb) return la - lb;
            const fa = fillRatio(a);
            const fb = fillRatio(b);
            if (fb !== fa) return fb - fa;
            return startMs(a) - startMs(b);
        });
}

// Surfaces the most fillable tournaments above the cash lobby — the growth bet,
// visible on the default view. Renders NOTHING when nothing is fillable (the
// pipeline is thin; a dead "no events" slab would read as abandoned). The cards
// route to the tournament page, where the full register flow lives; Free-Play
// events stay clearly tagged and carry no dollar framing.
export default function TournamentHeroBand({
    tournaments,
    onSeeAll,
}: TournamentHeroBandProps) {
    const candidates = rankCandidates(tournaments, Date.now()).slice(0, 3);
    if (candidates.length === 0) return null;

    return (
        <Box as="section" aria-label="Tournaments open now" w="full">
            <Flex align="center" justify="space-between" mb={3} px={1}>
                <HStack spacing={2} minW={0}>
                    <Box
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg="brand.green"
                        flexShrink={0}
                        aria-hidden
                    />
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color="text.secondary"
                        noOfLines={1}
                    >
                        Tournaments open now
                    </Text>
                </HStack>
                <Box
                    as="button"
                    type="button"
                    onClick={onSeeAll}
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                    flexShrink={0}
                    bg="transparent"
                    px={1}
                    py={0.5}
                    borderRadius="6px"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="text.secondary"
                    transition="color 140ms ease"
                    _hover={{ color: 'brand.green' }}
                    _focusVisible={{ boxShadow: 'focus.ring', outline: 'none' }}
                >
                    See all
                    <Icon as={FiArrowRight} boxSize="14px" />
                </Box>
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                {candidates.map((t, i) => (
                    <Box
                        key={t.id}
                        // Cap the band: 1 card on mobile, 2 on small, 3 on desktop —
                        // so it never pushes the cash sit-now list below the fold.
                        display={
                            i === 0
                                ? 'block'
                                : i === 1
                                  ? { base: 'none', sm: 'block' }
                                  : { base: 'none', lg: 'block' }
                        }
                    >
                        <BandCard tournament={t} />
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
}

function BandCard({ tournament: t }: { tournament: Tournament }) {
    const router = useRouter();
    const now = Date.now();
    const freePlay = getIsFreePlay(t);
    const live = isLateRegOpen(t, now);
    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';
    const countdown = useCountdown(t.scheduled_start_at);

    const money = freePlay
        ? { value: 'Free', usdc: false, suffix: undefined as string | undefined, label: 'Entry' }
        : t.guarantee_usdc > 0
          ? {
                value: `$${formatUsdc(t.guarantee_usdc, { decimals: t.guarantee_usdc < 5_000_000 ? 2 : 0 })}`,
                usdc: true,
                suffix: 'GTD',
                label: 'Guaranteed',
            }
          : t.prize_pool_usdc > 0
            ? {
                  value: `$${formatUsdc(t.prize_pool_usdc, { decimals: t.prize_pool_usdc < 5_000_000 ? 2 : 0 })}`,
                  usdc: true,
                  suffix: undefined,
                  label: 'Prize pool',
              }
            : {
                  value: `$${formatUsdc(t.buy_in_usdc)}`,
                  usdc: true,
                  suffix: undefined,
                  label: 'Buy-in',
              };

    const reg = t.registered_count ?? 0;
    const max = t.max_entries ?? 0;
    const min = t.min_entries ?? 0;
    const ratio = max > 0 ? Math.min(1, reg / max) : 0;

    const timeLabel = live
        ? 'Late reg open'
        : countdown.ready
          ? countdown.isPast
              ? 'Starting now'
              : `Starts in ${countdown.label}`
          : `Starts ${formatTournamentStart(t.scheduled_start_at)}`;

    const cta = freePlay ? 'Join' : live ? 'Late register' : 'Register';
    const go = () => router.push(`/tournament/${t.id}`);

    return (
        <Box
            bg="card.white"
            _dark={{ bg: 'card.darkNavy' }}
            borderWidth="1px"
            borderColor="border.pillNeutral"
            borderRadius="14px"
            boxShadow="card.lift"
            p={4}
            cursor="pointer"
            onClick={go}
            transition="border-color 150ms ease"
            _hover={{ borderColor: 'brand.green' }}
            _focusWithin={{ borderColor: 'brand.green' }}
            display="flex"
            flexDirection="column"
            gap={3}
        >
            <HStack spacing={3} align="center" minW={0}>
                <Box
                    boxSize="40px"
                    borderRadius="12px"
                    overflow="hidden"
                    flexShrink={0}
                    boxShadow="inset 0 0 0 1px rgba(11, 20, 48, 0.08)"
                    _dark={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10)' }}
                >
                    {t.logo_url ? (
                        <Image src={t.logo_url} alt="" w="full" h="full" objectFit="cover" />
                    ) : (
                        <TournamentDefaultAvatar type={blindLabel} size={40} />
                    )}
                </Box>
                <VStack align="start" spacing={0.5} minW={0} flex={1}>
                    <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        noOfLines={1}
                        minW={0}
                    >
                        {t.name ||
                            (freePlay ? 'Free-play tournament' : 'No-limit Hold’em')}
                    </Text>
                    <HStack spacing={1.5} minW={0}>
                        <Icon as={FiClock} boxSize="11px" color="text.muted" flexShrink={0} />
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            fontWeight="semibold"
                            noOfLines={1}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {timeLabel}
                        </Text>
                    </HStack>
                </VStack>
                {freePlay ? (
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
                ) : (
                    <Image src={USDC_LOGO} alt="" boxSize="18px" flexShrink={0} />
                )}
            </HStack>

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
                    <HStack spacing={1} align="baseline" minW={0}>
                        <Text
                            fontWeight="extrabold"
                            fontSize="xl"
                            lineHeight="1.1"
                            color={money.usdc ? USDC_BLUE : 'text.primary'}
                            letterSpacing="-0.02em"
                            noOfLines={1}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {money.value}
                        </Text>
                        {money.suffix && (
                            <Text
                                fontSize="2xs"
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
                <Button
                    size="sm"
                    variant="tactilePrimary"
                    minH="40px"
                    px={5}
                    flexShrink={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        go();
                    }}
                >
                    {cta}
                </Button>
            </Flex>

            <VStack align="stretch" spacing={1}>
                <Flex justify="space-between" align="center" gap={2}>
                    <Box
                        position="relative"
                        flex={1}
                        h="4px"
                        borderRadius="full"
                        bg="border.pillNeutral"
                    >
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            h="4px"
                            w={`${ratio * 100}%`}
                            minW={reg > 0 ? '4px' : '0'}
                            borderRadius="full"
                            bg={freePlay ? 'brand.green' : USDC_BLUE}
                            opacity={0.9}
                            transition="width 0.3s ease"
                        />
                    </Box>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        fontWeight="semibold"
                        whiteSpace="nowrap"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {reg}
                        {max > 0 ? `/${max}` : ''} in
                    </Text>
                </Flex>
                {!live && min > 0 && reg < min && (
                    <Text fontSize="2xs" color="text.muted">
                        Needs {min} players to run
                    </Text>
                )}
            </VStack>
        </Box>
    );
}
