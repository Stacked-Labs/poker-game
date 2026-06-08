'use client';

import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    Image,
    SimpleGrid,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { PiCrownFill } from 'react-icons/pi';
import { FiRotateCw } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import PlayerAvatar from '../PlayerAvatar';
import PlayerNameLink from '../PlayerNameLink';
import ExternalLink from '../ExternalLink';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    explorerBase,
    formatUsdc,
    ordinal,
} from '../PublicGames/tournamentFormat';
import {
    distanceToMoney,
    isInTheMoney,
    nextPayJump,
    payoutForPosition,
    placesPaid,
} from '../PublicGames/payouts';
import { useLevelCountdown } from '../../hooks/useLevelCountdown';
import type { LeaderboardPlayer } from '@/app/interfaces';
import PayoutLadder from './PayoutLadder';
import StructureSheet from './StructureSheet';

function shortAddr(a: string): string {
    return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

// The one approved warm accent: a single green flourish each time you cross into
// the money, plus a slow amber pulse while you sit on the bubble. Both honour
// prefers-reduced-motion at the call site.
const itmFlourish = keyframes`
    0%   { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0); transform: scale(1); }
    28%  { box-shadow: 0 0 0 5px rgba(54, 163, 123, 0.38); transform: scale(1.015); }
    100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0); transform: scale(1); }
`;
const bubblePulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(253, 197, 29, 0); }
    50%      { box-shadow: 0 0 0 4px rgba(253, 197, 29, 0.32); }
`;
// Crown sits on the chip leader and gives a slow, gentle royal sway.
const crownBob = keyframes`
    0%, 100% { transform: translateX(-50%) translateY(0) rotate(-7deg); }
    50%      { transform: translateX(-50%) translateY(-2px) rotate(7deg); }
`;
const crownBobInline = keyframes`
    0%, 100% { transform: translateY(0) rotate(-7deg); }
    50%      { transform: translateY(-2px) rotate(7deg); }
`;
// A single coin tumbling down over the strip when you reach the money.
const coinFall = keyframes`
    0%   { opacity: 0; transform: translateY(-16px) scale(0.5) rotate(0deg); }
    18%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(58px) scale(1) rotate(240deg); }
`;
// Springy pop for rank-change arrows and small badges.
const popIn = keyframes`
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.3); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
`;

// True for ~1.3s on the render where `inMoney` flips false→true, so the strip
// can fire the flourish once on the crossing rather than on every render.
function useItmCrossing(inMoney: boolean): boolean {
    const prev = useRef(inMoney);
    const [crossed, setCrossed] = useState(false);
    useEffect(() => {
        if (inMoney && !prev.current) {
            setCrossed(true);
            const id = setTimeout(() => setCrossed(false), 1300);
            prev.current = inMoney;
            return () => clearTimeout(id);
        }
        prev.current = inMoney;
    }, [inMoney]);
    return crossed;
}

// Brief 'up'/'down' pulse when your live rank changes between feed updates, so
// the strip can flash a ▲/▼ as you climb or slip.
function useRankDelta(rank: number): 'up' | 'down' | null {
    const prev = useRef(rank);
    const [delta, setDelta] = useState<'up' | 'down' | null>(null);
    useEffect(() => {
        if (rank > 0 && prev.current > 0 && rank !== prev.current) {
            setDelta(rank < prev.current ? 'up' : 'down');
            const id = setTimeout(() => setDelta(null), 1600);
            prev.current = rank;
            return () => clearTimeout(id);
        }
        prev.current = rank;
    }, [rank]);
    return delta;
}

// Deterministic confetti of coins — fixed offsets so SSR and client agree (no
// Math.random). USDC discs for real money, chip discs for Free Play.
const COIN_DROPS = [
    { left: '6%', delay: '0s', dur: '0.95s' },
    { left: '17%', delay: '0.14s', dur: '1.1s' },
    { left: '28%', delay: '0.05s', dur: '0.85s' },
    { left: '39%', delay: '0.22s', dur: '1.05s' },
    { left: '50%', delay: '0.10s', dur: '0.9s' },
    { left: '61%', delay: '0.28s', dur: '1.12s' },
    { left: '72%', delay: '0.06s', dur: '0.88s' },
    { left: '83%', delay: '0.18s', dur: '1.0s' },
    { left: '93%', delay: '0.02s', dur: '0.96s' },
];

function CoinRain({ isFreePlay }: { isFreePlay: boolean }) {
    return (
        <Box
            position="absolute"
            inset={0}
            overflow="hidden"
            pointerEvents="none"
            borderRadius="14px"
            zIndex={2}
            aria-hidden
        >
            {COIN_DROPS.map((c, i) => (
                <Box
                    key={i}
                    position="absolute"
                    top="-12px"
                    left={c.left}
                    animation={`${coinFall} ${c.dur} cubic-bezier(0.34, 1.56, 0.64, 1) ${c.delay} both`}
                >
                    {isFreePlay ? (
                        <Box
                            boxSize="14px"
                            borderRadius="full"
                            bg="brand.yellow"
                            border="2px dashed"
                            borderColor="brand.yellowDark"
                            boxShadow="0 1px 2px rgba(0,0,0,0.3)"
                        />
                    ) : (
                        <Image src={USDC_LOGO} alt="" boxSize="16px" />
                    )}
                </Box>
            ))}
        </Box>
    );
}

export default function TournamentTabPanel() {
    const { appState } = useContext(AppContext);
    const live = appState.tournamentLive;
    const meta = live?.meta ?? null;
    const clock = live?.clock ?? null;
    const countdown = useLevelCountdown(clock);
    const prefersReducedMotion = usePrefersReducedMotion();

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
    const goldRank = useColorModeValue('brand.yellowDark', 'brand.yellow');
    // brand.green fails AA as small text on the light card; darken it in light mode
    // (the green tint backgrounds stay as-is).
    const greenFg = useColorModeValue('brand.greenDark', 'brand.green');
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.025)'
    );
    const topSpot = useColorModeValue(
        'rgba(253, 197, 29, 0.10)',
        'rgba(253, 197, 29, 0.12)'
    );
    const greenBorder = useColorModeValue(
        'rgba(54, 163, 123, 0.40)',
        'rgba(54, 163, 123, 0.50)'
    );
    const bubbleTint = useColorModeValue(
        'rgba(253, 197, 29, 0.12)',
        'rgba(253, 197, 29, 0.16)'
    );
    const bubbleBorder = useColorModeValue(
        'rgba(253, 197, 29, 0.55)',
        'rgba(253, 197, 29, 0.60)'
    );
    const mutedStrip = useColorModeValue(
        'rgba(11, 20, 48, 0.04)',
        'rgba(255, 255, 255, 0.05)'
    );
    const shortStackFg = useColorModeValue('brand.pinkDark', 'brand.pink');

    // Everything below is null-safe so the hooks above (and useItmCrossing below)
    // always run before the not-connected guard — Rules of Hooks.
    const myWallet = appState.address?.toLowerCase();
    const isMe = (p: LeaderboardPlayer) =>
        (!!myWallet && p.wallet?.toLowerCase() === myWallet) ||
        p.uuid === appState.clientID;

    const leaderboard = live?.leaderboard ?? [];
    const sorted = [...leaderboard].sort((a, b) => {
        if (a.finish_pos === 0 && b.finish_pos === 0) return b.stack - a.stack;
        if (a.finish_pos === 0) return -1;
        if (b.finish_pos === 0) return 1;
        return a.finish_pos - b.finish_pos;
    });
    const aliveRows = sorted.filter((p) => p.finish_pos === 0);
    const aliveCount = live?.playersActive ?? aliveRows.length;
    // The payout TIER (places paid / percentages) is keyed on UNIQUE players, like
    // the backend's DefaultPayouts(len(players)) — one leaderboard row per player,
    // re-entries don't add rows. registered_count counts bullet entries (the prize
    // POOL basis), which can cross a tier boundary in re-entry-heavy fields.
    const tierEntrants = leaderboard.length || meta?.registeredCount || 0;
    const paid = placesPaid(tierEntrants);
    const fromMoney = distanceToMoney(aliveCount, tierEntrants);

    const poolForLadder = Math.max(
        meta?.prizePoolUsdc ?? 0,
        meta?.guaranteeUsdc ?? 0
    );
    const overlay = Math.max(
        0,
        (meta?.guaranteeUsdc ?? 0) - (meta?.prizePoolUsdc ?? 0)
    );
    const topPrize = payoutForPosition(1, tierEntrants, poolForLadder);
    const nameByUuid = new Map(
        leaderboard.map((p) => [
            p.uuid,
            p.xUsername ? `@${p.xUsername}` : shortAddr(p.wallet),
        ])
    );

    // Field / entries: unique players vs total bullets vs how full the field is.
    const uniqueEntrants = leaderboard.length;
    const totalBullets = meta?.registeredCount ?? uniqueEntrants;
    const reentries = Math.max(0, totalBullets - uniqueEntrants);
    const fieldFull =
        meta && meta.maxEntries > 0
            ? Math.round((totalBullets / meta.maxEntries) * 100)
            : null;

    // Average stack across survivors (in chips and BB).
    const aliveDenom = aliveRows.length || aliveCount || 1;
    const avgStack = aliveRows.length
        ? Math.round(
              aliveRows.reduce((s, p) => s + p.stack, 0) / aliveDenom
          )
        : 0;
    const avgBB = clock && clock.bb > 0 ? Math.floor(avgStack / clock.bb) : null;

    // "You" facts for the personal strip.
    const myIdx = sorted.findIndex(isMe);
    const myP = myIdx >= 0 ? sorted[myIdx] : null;
    const myOut = myP ? myP.finish_pos > 0 : false;
    const myRank = myP ? (myOut ? myP.finish_pos : myIdx + 1) : 0;
    const myStack = myP?.stack ?? 0;
    const myBB =
        myP && clock && clock.bb > 0 && !myOut
            ? Math.floor(myStack / clock.bb)
            : null;
    const myPrize = myP?.prize_usdc ?? 0;
    const myInMoney = !!myP && !myOut && isInTheMoney(myRank, tierEntrants);
    const myJump =
        myP && !myOut ? nextPayJump(myRank, tierEntrants, poolForLadder) : null;
    const onBubble = !!myP && !myOut && !myInMoney && fromMoney > 0 && fromMoney <= 2;
    const chipLead = !!myP && !myOut && myRank === 1;

    const itmCrossed = useItmCrossing(myInMoney);
    const rankDelta = useRankDelta(myOut ? 0 : myRank);
    const stripAnimation = prefersReducedMotion
        ? undefined
        : itmCrossed
          ? `${itmFlourish} 1.3s ease-out`
          : onBubble
            ? `${bubblePulse} 2.4s ease-in-out infinite`
            : undefined;

    if (!live || !meta) {
        return (
            <Box p={6} textAlign="center">
                <Text color="text.muted" fontSize="sm">
                    Tournament details will appear here once the live feed
                    connects.
                </Text>
            </Box>
        );
    }

    const isUsdc = !meta.isFreePlay;
    const fieldBubble = fromMoney > 0 && fromMoney <= 2;

    let youStatus = '';
    if (myP) {
        if (myOut) {
            youStatus =
                isUsdc && myPrize > 0
                    ? `Cashed for $${formatUsdc(myPrize)}`
                    : 'No cash this time';
        } else if (chipLead) {
            youStatus = myInMoney
                ? 'Chip lead · in the money'
                : 'Chip lead · running it';
        } else if (myInMoney) {
            if (myJump && isUsdc && myJump.gainMicro > 0) {
                youStatus = `In the money · +$${formatUsdc(
                    myJump.gainMicro
                )} at ${ordinal(myJump.targetPos)}`;
            } else {
                youStatus = 'In the money';
            }
        } else {
            youStatus =
                fromMoney === 1
                    ? 'On the bubble · 1 from the money'
                    : `${fromMoney} from the money`;
        }
    }

    // Flip-tile back faces.
    const secondPrize = payoutForPosition(2, tierEntrants, poolForLadder);
    const minCashAmt = payoutForPosition(paid, tierEntrants, poolForLadder);
    const bustedSoFar = Math.max(0, tierEntrants - aliveCount);
    const bubbleProgress =
        tierEntrants > paid
            ? Math.min(1, bustedSoFar / (tierEntrants - paid))
            : 1;
    const topStack = aliveRows[0]?.stack ?? 0;
    const refIsMe = !!myP && !myOut;
    const refStack = refIsMe ? myStack : topStack;
    const refLabel = refIsMe ? 'You' : 'Leader';
    const refBB = refIsMe ? myBB : clock && clock.bb > 0 ? Math.floor(topStack / clock.bb) : null;
    const maxStack = Math.max(refStack, avgStack, 1);
    const avgRatio = avgStack > 0 ? refStack / avgStack : 0;

    return (
        <VStack align="stretch" spacing={4} px={{ base: 1, md: 2 }} py={2}>
            {/* Header */}
            <Box>
                <Flex justify="space-between" align="baseline" gap={3} wrap="wrap">
                    <Text
                        fontWeight="bold"
                        fontSize="lg"
                        color="text.primary"
                        noOfLines={1}
                    >
                        {meta.name}
                    </Text>
                    {meta.isFreePlay && (
                        <Box
                            bg="rgba(54, 163, 123, 0.12)"
                            color={greenFg}
                            fontSize="2xs"
                            fontWeight="bold"
                            px={2}
                            py="2px"
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            flexShrink={0}
                        >
                            Free Play · no real value
                        </Box>
                    )}
                </Flex>
                {clock && (
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        Level {clock.levelNumber} ·{' '}
                        {clock.sb.toLocaleString('en-US')}/
                        {clock.bb.toLocaleString('en-US')}
                        {clock.ante > 0
                            ? ` (${clock.ante.toLocaleString('en-US')}a)`
                            : ''}{' '}
                        · {countdown.label} to next
                    </Text>
                )}
            </Box>

            {/* You — the seated player's own situation, lead of the panel */}
            {myP && (
                <Box
                    position="relative"
                    overflow="hidden"
                    borderRadius="14px"
                    px={3.5}
                    py={3}
                    bg={myOut ? mutedStrip : onBubble ? bubbleTint : meHighlight}
                    border="1px solid"
                    borderColor={
                        myOut ? border : onBubble ? bubbleBorder : greenBorder
                    }
                    sx={stripAnimation ? { animation: stripAnimation } : undefined}
                >
                    {itmCrossed && !prefersReducedMotion && (
                        <CoinRain isFreePlay={meta.isFreePlay} />
                    )}
                    <Flex
                        justify="space-between"
                        align="center"
                        gap={3}
                        position="relative"
                        zIndex={1}
                    >
                        <HStack spacing={2.5} minW={0}>
                            <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="0.10em"
                                textTransform="uppercase"
                                color={myOut ? 'text.muted' : greenFg}
                                px={1.5}
                                py="2px"
                                borderRadius="full"
                                bg={
                                    myOut
                                        ? 'transparent'
                                        : 'rgba(54, 163, 123, 0.14)'
                                }
                                flexShrink={0}
                            >
                                You
                            </Text>
                            {chipLead && (
                                <Icon
                                    as={PiCrownFill}
                                    color="brand.yellow"
                                    boxSize="17px"
                                    flexShrink={0}
                                    sx={{
                                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
                                    }}
                                    animation={
                                        prefersReducedMotion
                                            ? undefined
                                            : `${crownBobInline} 2.4s ease-in-out infinite`
                                    }
                                    aria-label="Chip leader"
                                />
                            )}
                            <Text
                                fontWeight="bold"
                                fontSize="md"
                                color="text.primary"
                                noOfLines={1}
                            >
                                {myOut ? `Finished ${ordinal(myRank)}` : ordinal(myRank)}
                                {!myOut && (
                                    <Text
                                        as="span"
                                        fontWeight="medium"
                                        color="text.muted"
                                        fontSize="sm"
                                    >
                                        {' '}
                                        of {aliveCount}
                                    </Text>
                                )}
                            </Text>
                            {rankDelta && !myOut && (
                                <Text
                                    as="span"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    lineHeight="1"
                                    color={
                                        rankDelta === 'up' ? greenFg : shortStackFg
                                    }
                                    animation={
                                        prefersReducedMotion
                                            ? undefined
                                            : `${popIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`
                                    }
                                    aria-label={
                                        rankDelta === 'up'
                                            ? 'moved up'
                                            : 'moved down'
                                    }
                                >
                                    {rankDelta === 'up' ? '▲' : '▼'}
                                </Text>
                            )}
                        </HStack>
                        <Box
                            textAlign="right"
                            flexShrink={0}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {myOut ? (
                                isUsdc && myPrize > 0 ? (
                                    <Text fontWeight="bold" color={greenFg}>
                                        +${formatUsdc(myPrize)}
                                    </Text>
                                ) : (
                                    <Text color="text.muted">—</Text>
                                )
                            ) : (
                                <>
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        color="text.primary"
                                        lineHeight="1.1"
                                    >
                                        {myStack.toLocaleString('en-US')}
                                    </Text>
                                    {myBB != null && (
                                        <Text
                                            fontSize="2xs"
                                            fontWeight="semibold"
                                            color={
                                                myBB < 10
                                                    ? shortStackFg
                                                    : 'text.muted'
                                            }
                                        >
                                            {myBB} BB
                                        </Text>
                                    )}
                                </>
                            )}
                        </Box>
                    </Flex>
                    <Text
                        fontSize="xs"
                        mt={1.5}
                        color={
                            onBubble
                                ? goldRank
                                : myInMoney
                                  ? greenFg
                                  : 'text.secondary'
                        }
                        fontWeight={onBubble || myInMoney ? 'semibold' : 'normal'}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {youStatus}
                    </Text>
                </Box>
            )}

            {/* Scoreboard — field stats at a glance, tap any tile for detail */}
            <SimpleGrid columns={2} spacing={2}>
                <FlipTile
                    label="Prize pool"
                    backLabel="Payout split"
                    reduceMotion={!!prefersReducedMotion}
                    front={
                        meta.isFreePlay ? (
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="text.primary"
                            >
                                Free play
                            </Text>
                        ) : (
                            <>
                                <HStack spacing={1.5} align="center" minW={0}>
                                    <Image
                                        src={USDC_LOGO}
                                        alt=""
                                        boxSize="16px"
                                    />
                                    <Text
                                        fontWeight="bold"
                                        fontSize="lg"
                                        color={USDC_BLUE}
                                        noOfLines={1}
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        $
                                        {formatUsdc(poolForLadder, {
                                            decimals: 0,
                                        })}
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="2xs"
                                    color={overlay > 0 ? greenFg : 'text.muted'}
                                    mt={0.5}
                                    fontWeight={
                                        overlay > 0 ? 'semibold' : 'normal'
                                    }
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {overlay > 0
                                        ? `+$${formatUsdc(overlay)} overlay`
                                        : `Top $${formatUsdc(topPrize, { decimals: 0 })}`}
                                </Text>
                            </>
                        )
                    }
                    back={
                        meta.isFreePlay ? (
                            <Text fontSize="xs" color="text.muted">
                                No real-money prizes in Free Play — play for the
                                glory.
                            </Text>
                        ) : (
                            <VStack align="stretch" spacing={0.5}>
                                <BackRow
                                    k="1st"
                                    v={`$${formatUsdc(topPrize, { decimals: 0 })}`}
                                />
                                <BackRow
                                    k="2nd"
                                    v={`$${formatUsdc(secondPrize, { decimals: 0 })}`}
                                />
                                <BackRow
                                    k="Min-cash"
                                    v={`$${formatUsdc(minCashAmt, { decimals: 0 })}`}
                                />
                            </VStack>
                        )
                    }
                />

                <FlipTile
                    label="Players left"
                    backLabel="Bubble"
                    reduceMotion={!!prefersReducedMotion}
                    front={
                        <>
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="text.primary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {aliveCount}
                                <Text as="span" fontSize="sm" color="text.muted">
                                    {' '}
                                    / {tierEntrants}
                                </Text>
                            </Text>
                            <Text
                                fontSize="2xs"
                                mt={0.5}
                                color={
                                    fromMoney === 0
                                        ? greenFg
                                        : fieldBubble
                                          ? goldRank
                                          : 'text.muted'
                                }
                                fontWeight={
                                    fromMoney === 0 || fieldBubble
                                        ? 'semibold'
                                        : 'normal'
                                }
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {paid} paid ·{' '}
                                {fromMoney === 0
                                    ? 'in the money'
                                    : `${fromMoney} from money`}
                            </Text>
                        </>
                    }
                    back={
                        <VStack align="stretch" spacing={1.5}>
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={fromMoney === 0 ? greenFg : goldRank}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {fromMoney === 0
                                    ? 'Bubble burst — all paid'
                                    : `${fromMoney} to burst the bubble`}
                            </Text>
                            <Box
                                h="6px"
                                borderRadius="full"
                                bg={border}
                                overflow="hidden"
                            >
                                <Box
                                    h="100%"
                                    w={`${Math.round(bubbleProgress * 100)}%`}
                                    borderRadius="full"
                                    bg={
                                        fromMoney === 0
                                            ? 'brand.green'
                                            : 'brand.yellow'
                                    }
                                    transition="width 0.4s ease"
                                />
                            </Box>
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {paid} of {tierEntrants} make the money
                            </Text>
                        </VStack>
                    }
                />

                <FlipTile
                    label="Avg stack"
                    backLabel={`${refLabel} vs avg`}
                    reduceMotion={!!prefersReducedMotion}
                    front={
                        <>
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="text.primary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {avgStack
                                    ? avgStack.toLocaleString('en-US')
                                    : '—'}
                            </Text>
                            <Text fontSize="2xs" mt={0.5} color="text.muted">
                                {avgBB != null
                                    ? `${avgBB} BB avg`
                                    : 'across survivors'}
                            </Text>
                        </>
                    }
                    back={
                        avgStack > 0 ? (
                            <VStack align="stretch" spacing={1.5}>
                                <MiniBar
                                    label={refLabel}
                                    valueLabel={
                                        refBB != null
                                            ? `${refBB} BB`
                                            : refStack.toLocaleString('en-US')
                                    }
                                    frac={refStack / maxStack}
                                    fill={greenFg}
                                    track={border}
                                />
                                <MiniBar
                                    label="Avg"
                                    valueLabel={
                                        avgBB != null
                                            ? `${avgBB} BB`
                                            : avgStack.toLocaleString('en-US')
                                    }
                                    frac={avgStack / maxStack}
                                    fill="text.muted"
                                    track={border}
                                />
                                <Text fontSize="2xs" color="text.muted">
                                    {avgRatio >= 1
                                        ? `${refLabel === 'You' ? "You're" : 'Leader is'} ${avgRatio.toFixed(1)}× the average`
                                        : `${refLabel === 'You' ? "You're" : 'Leader is'} at ${Math.round(avgRatio * 100)}% of average`}
                                </Text>
                            </VStack>
                        ) : (
                            <Text fontSize="xs" color="text.muted">
                                Stacks appear once the clock starts.
                            </Text>
                        )
                    }
                />

                <FlipTile
                    label="Entries"
                    backLabel="Field"
                    reduceMotion={!!prefersReducedMotion}
                    front={
                        <>
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="text.primary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {uniqueEntrants}
                                {reentries > 0 && (
                                    <Text
                                        as="span"
                                        fontSize="sm"
                                        color="text.muted"
                                    >
                                        {' '}
                                        +{reentries} re
                                    </Text>
                                )}
                            </Text>
                            <Text
                                fontSize="2xs"
                                mt={0.5}
                                color="text.muted"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {fieldFull != null
                                    ? `${fieldFull}% full`
                                    : `${totalBullets} ${totalBullets === 1 ? 'entry' : 'entries'}`}
                            </Text>
                        </>
                    }
                    back={
                        <VStack align="stretch" spacing={0.5}>
                            <BackRow k="Unique players" v={`${uniqueEntrants}`} />
                            <BackRow k="Re-entries" v={`${reentries}`} />
                            <BackRow
                                k={meta.maxEntries > 0 ? 'Capacity' : 'Bullets'}
                                v={
                                    meta.maxEntries > 0
                                        ? `${totalBullets} / ${meta.maxEntries}`
                                        : `${totalBullets}`
                                }
                            />
                        </VStack>
                    }
                />
            </SimpleGrid>

            <PayoutLadder
                entrants={tierEntrants}
                prizePoolUsdc={poolForLadder}
                isFreePlay={meta.isFreePlay}
                status={meta.status}
                highlightPosition={myP && !myOut ? myRank : null}
                bare
            />

            <Divider borderColor={border} />

            {/* Standings */}
            <Box>
                <Text
                    fontWeight="bold"
                    fontSize="md"
                    color="text.primary"
                    mb={2}
                >
                    Standings
                </Text>
                <Box overflowX="auto">
                    <Table
                        size="sm"
                        variant="simple"
                        sx={{ 'th, td': { borderColor: border } }}
                    >
                        <Thead>
                            <Tr>
                                <Th w="44px">#</Th>
                                <Th>Player</Th>
                                {meta.reentryAllowed && <Th isNumeric>Bul.</Th>}
                                <Th isNumeric>Chips</Th>
                                <Th isNumeric>Table</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sorted.map((p, i) => {
                                const rank =
                                    p.finish_pos === 0 ? i + 1 : p.finish_pos;
                                const out = p.finish_pos > 0;
                                const me = isMe(p);
                                const topAlive = rank === 1 && !out;
                                const bb =
                                    clock && clock.bb > 0 && !out
                                        ? Math.floor(p.stack / clock.bb)
                                        : null;
                                return (
                                    <Tr
                                        key={p.uuid}
                                        bg={
                                            me
                                                ? meHighlight
                                                : rank === 1 && !out
                                                  ? topSpot
                                                  : i % 2 === 1
                                                    ? zebra
                                                    : undefined
                                        }
                                        _hover={{ bg: me ? meHighlight : rowHover }}
                                        opacity={out ? 0.55 : 1}
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
                                            <HStack spacing={2.5} minW={0}>
                                                <Box
                                                    position="relative"
                                                    boxSize="30px"
                                                    flexShrink={0}
                                                >
                                                    {topAlive && (
                                                        <Icon
                                                            as={PiCrownFill}
                                                            position="absolute"
                                                            top="-9px"
                                                            left="50%"
                                                            zIndex={1}
                                                            color="brand.yellow"
                                                            boxSize="14px"
                                                            transform="translateX(-50%) rotate(-6deg)"
                                                            sx={{
                                                                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                                            }}
                                                            animation={
                                                                prefersReducedMotion
                                                                    ? undefined
                                                                    : `${crownBob} 2.4s ease-in-out infinite`
                                                            }
                                                            aria-label="Chip leader"
                                                        />
                                                    )}
                                                    <PlayerAvatar
                                                        profileImageUrl={
                                                            p.xProfileImageUrl
                                                        }
                                                        address={p.wallet}
                                                        username={
                                                            p.xUsername
                                                                ? `@${p.xUsername}`
                                                                : p.wallet ||
                                                                  p.uuid
                                                        }
                                                        initialsFontSize="11px"
                                                    />
                                                </Box>
                                                {p.xUsername ? (
                                                    <PlayerNameLink
                                                        username={`@${p.xUsername}`}
                                                        fontSize="sm"
                                                        fontWeight="semibold"
                                                        noOfLines={1}
                                                    />
                                                ) : p.wallet ? (
                                                    <ExternalLink
                                                        href={`${explorerBase(
                                                            meta.chain
                                                        )}/address/${p.wallet}`}
                                                        fontSize="sm"
                                                        fontFamily="mono"
                                                        color="text.primary"
                                                    >
                                                        {shortAddr(p.wallet)}
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
                                                {me && (
                                                    <Text
                                                        fontSize="2xs"
                                                        fontWeight="bold"
                                                        color={greenFg}
                                                        textTransform="uppercase"
                                                    >
                                                        you
                                                    </Text>
                                                )}
                                            </HStack>
                                        </Td>
                                        {meta.reentryAllowed && (
                                            <Td isNumeric>
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    {p.bullet_number ?? 1}
                                                </Text>
                                            </Td>
                                        )}
                                        <Td
                                            isNumeric
                                            sx={{
                                                fontVariantNumeric:
                                                    'tabular-nums',
                                            }}
                                        >
                                            {out ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <VStack
                                                    spacing={0}
                                                    align="flex-end"
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.primary"
                                                    >
                                                        {p.stack.toLocaleString(
                                                            'en-US'
                                                        )}
                                                    </Text>
                                                    {bb != null && (
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                        >
                                                            {bb} BB
                                                        </Text>
                                                    )}
                                                </VStack>
                                            )}
                                        </Td>
                                        <Td isNumeric>
                                            {out || p.table_index < 0 ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <ExternalLink
                                                    href={`/table/tournament-${live.tournamentId}-table-${
                                                        p.table_index + 1
                                                    }`}
                                                    fontSize="xs"
                                                    color="text.secondary"
                                                    iconSize="9px"
                                                >
                                                    T{p.table_index + 1}
                                                </ExternalLink>
                                            )}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Box>

            {/* Recent busts */}
            {live.feed.length > 0 && (
                <Box>
                    <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color="text.primary"
                        mb={1}
                    >
                        Recent busts
                    </Text>
                    <VStack align="stretch" spacing={0.5}>
                        {live.feed.slice(0, 8).map((e, i) => (
                            <Text
                                key={`${e.playerUuid}-${e.position}-${i}`}
                                fontSize="xs"
                                color="text.muted"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {nameByUuid.get(e.playerUuid) ?? 'A player'}{' '}
                                busted {ordinal(e.position)} · {e.remaining} left
                            </Text>
                        ))}
                    </VStack>
                </Box>
            )}

            <Divider borderColor={border} />

            <StructureSheet
                blindStructure={meta.blindStructure}
                startingStack={meta.startingStack}
                lateRegLevels={meta.lateRegLevels}
                currentLevel={clock?.levelNumber ?? null}
                defaultOpen={false}
                bare
            />
        </VStack>
    );
}

// A scoreboard tile that flips on tap/Enter to reveal a detail face. The spring
// easing gives the flip a playful bounce; reduced-motion swaps faces instantly.
function FlipTile({
    label,
    backLabel,
    front,
    back,
    reduceMotion,
}: {
    label: string;
    backLabel: string;
    front: ReactNode;
    back: ReactNode;
    reduceMotion: boolean;
}) {
    const [flipped, setFlipped] = useState(false);
    const face = {
        position: 'absolute' as const,
        inset: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center' as const,
        backfaceVisibility: 'hidden' as const,
        WebkitBackfaceVisibility: 'hidden' as const,
    };
    return (
        <Box sx={{ perspective: '900px' }} h="96px">
            <Box
                role="button"
                tabIndex={0}
                aria-label={`${label}. Tap for ${backLabel}.`}
                aria-pressed={flipped}
                cursor="pointer"
                position="relative"
                w="100%"
                h="100%"
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFlipped((f) => !f);
                    }
                }}
                transform={flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}
                transition={
                    reduceMotion
                        ? undefined
                        : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }
                sx={{ transformStyle: 'preserve-3d' }}
                _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'brand.green',
                    outlineOffset: '2px',
                    borderRadius: '12px',
                }}
            >
                <Box
                    sx={face}
                    bg="card.white"
                    border="1px solid"
                    borderColor="border.lightGray"
                    borderRadius="12px"
                    px={3}
                    boxShadow="card.lift"
                    _hover={{ boxShadow: 'card.liftHover' }}
                >
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        fontWeight="semibold"
                    >
                        {label}
                    </Text>
                    <Box mt={1}>{front}</Box>
                    <Icon
                        as={FiRotateCw}
                        position="absolute"
                        top="9px"
                        right="9px"
                        boxSize="11px"
                        color="text.muted"
                        opacity={0.45}
                        aria-hidden
                    />
                </Box>
                <Box
                    sx={{ ...face, transform: 'rotateY(180deg)' }}
                    bg="card.white"
                    border="1px solid"
                    borderColor="brand.green"
                    borderRadius="12px"
                    px={3}
                    boxShadow="card.lift"
                >
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        fontWeight="semibold"
                        mb={1.5}
                    >
                        {backLabel}
                    </Text>
                    {back}
                </Box>
            </Box>
        </Box>
    );
}

function BackRow({ k, v }: { k: string; v: string }) {
    return (
        <Flex justify="space-between" align="baseline" gap={2}>
            <Text fontSize="2xs" color="text.muted">
                {k}
            </Text>
            <Text
                fontSize="xs"
                fontWeight="semibold"
                color="text.primary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {v}
            </Text>
        </Flex>
    );
}

function MiniBar({
    label,
    valueLabel,
    frac,
    fill,
    track,
}: {
    label: string;
    valueLabel: string;
    frac: number;
    fill: string;
    track: string;
}) {
    return (
        <Box>
            <Flex justify="space-between" align="baseline" mb="3px">
                <Text fontSize="2xs" color="text.muted">
                    {label}
                </Text>
                <Text
                    fontSize="2xs"
                    fontWeight="semibold"
                    color="text.primary"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {valueLabel}
                </Text>
            </Flex>
            <Box h="5px" borderRadius="full" bg={track} overflow="hidden">
                <Box
                    h="100%"
                    w={`${Math.max(4, Math.min(100, Math.round(frac * 100)))}%`}
                    borderRadius="full"
                    bg={fill}
                />
            </Box>
        </Box>
    );
}
