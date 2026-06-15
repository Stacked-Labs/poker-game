'use client';

import React, {
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
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
import { AppContext } from '@/app/contexts/AppStoreProvider';
import PlayerAvatar from '../PlayerAvatar';
import PlayerNameLink from '../PlayerNameLink';
import ExternalLink from '../ExternalLink';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    explorerBase,
    formatUsdc,
    formatUsdcAuto,
    ordinal,
} from '../PublicGames/tournamentFormat';
import {
    distanceToMoney,
    isInTheMoney,
    nextPayJump,
    payoutForPosition,
    percentForPosition,
    placesPaid,
} from '../PublicGames/payouts';
import { useLevelCountdown } from '../../hooks/useLevelCountdown';
import type { LeaderboardPlayer, TournamentClock } from '@/app/interfaces';
import PayoutLadder from './PayoutLadder';
import StructureSheet from './StructureSheet';

function shortAddr(a: string): string {
    return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

// Stable empty-array reference for the no-feed case so the derived-data memos keep
// a constant `leaderboard` dependency until a real feed arrives.
const EMPTY_LEADERBOARD: LeaderboardPlayer[] = [];

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
    const clientID = appState.clientID;
    // The isMe check closes over BOTH the wallet and the client id, so the memo
    // deps below must include both — a wallet-less observer still matches by uuid.
    const isMe = useMemo(
        () => (p: LeaderboardPlayer) =>
            (!!myWallet && p.wallet?.toLowerCase() === myWallet) ||
            p.uuid === clientID,
        [myWallet, clientID]
    );

    // Stable empty fallback so an absent feed doesn't hand the memos a fresh []
    // reference each render (which would defeat their memoization).
    const leaderboard = useMemo(
        () => live?.leaderboard ?? EMPTY_LEADERBOARD,
        [live?.leaderboard]
    );
    // Big-blind size drives the BB conversions below; pulled out as a primitive so
    // the memos depend on it (not the whole clock object) and skip the local
    // countdown tick, which now lives in LevelClockLine.
    const clockBb = clock?.bb ?? 0;
    const playersActive = live?.playersActive;
    // Meta money/field primitives feed the tier memo; pulled out so the memo deps
    // are concrete values rather than the whole (stable but opaque) meta object.
    const registeredCount = meta?.registeredCount;
    const prizePoolUsdc = meta?.prizePoolUsdc;
    const guaranteeUsdc = meta?.guaranteeUsdc;
    const maxEntries = meta?.maxEntries;

    // Leaderboard-derived data — sorted standings, the bust-feed name map, the
    // survivor aggregates. Recomputed only when the feed (leaderboard /
    // playersActive) or the blind size moves, not on every WS push that leaves
    // these unchanged.
    const { sorted, nameByUuid, aliveRows, aliveCount, avgStack, avgBB } =
        useMemo(() => {
            const sorted = [...leaderboard].sort((a, b) => {
                if (a.finish_pos === 0 && b.finish_pos === 0)
                    return b.stack - a.stack;
                if (a.finish_pos === 0) return -1;
                if (b.finish_pos === 0) return 1;
                return a.finish_pos - b.finish_pos;
            });
            const aliveRows = sorted.filter((p) => p.finish_pos === 0);
            const aliveCount = playersActive ?? aliveRows.length;
            const nameByUuid = new Map(
                leaderboard.map((p) => [
                    p.uuid,
                    p.xUsername ? `@${p.xUsername}` : shortAddr(p.wallet),
                ])
            );
            const aliveDenom = aliveRows.length || aliveCount || 1;
            const avgStack = aliveRows.length
                ? Math.round(
                      aliveRows.reduce((s, p) => s + p.stack, 0) / aliveDenom
                  )
                : 0;
            const avgBB =
                clockBb > 0 ? Math.floor(avgStack / clockBb) : null;
            return { sorted, nameByUuid, aliveRows, aliveCount, avgStack, avgBB };
        }, [leaderboard, playersActive, clockBb]);

    const {
        tierEntrants,
        paid,
        fromMoney,
        poolForLadder,
        overlay,
        topPrize,
        uniqueEntrants,
        totalBullets,
        reentries,
        fieldFull,
    } = useMemo(() => {
        // The payout TIER (places paid / percentages) is keyed on UNIQUE players,
        // like the backend's DefaultPayouts(len(players)) — one leaderboard row per
        // player, re-entries don't add rows. registered_count counts bullet entries
        // (the prize POOL basis), which can cross a tier boundary in re-entry-heavy
        // fields.
        const tierEntrants = leaderboard.length || registeredCount || 0;
        const paid = placesPaid(tierEntrants);
        const fromMoney = distanceToMoney(aliveCount, tierEntrants);
        const poolForLadder = Math.max(prizePoolUsdc ?? 0, guaranteeUsdc ?? 0);
        const overlay = Math.max(
            0,
            (guaranteeUsdc ?? 0) - (prizePoolUsdc ?? 0)
        );
        const topPrize = payoutForPosition(1, tierEntrants, poolForLadder);
        // Field / entries: unique players vs total bullets vs how full the field is.
        const uniqueEntrants = leaderboard.length;
        const totalBullets = registeredCount ?? uniqueEntrants;
        const reentries = Math.max(0, totalBullets - uniqueEntrants);
        const fieldFull =
            maxEntries && maxEntries > 0
                ? Math.round((totalBullets / maxEntries) * 100)
                : null;
        return {
            tierEntrants,
            paid,
            fromMoney,
            poolForLadder,
            overlay,
            topPrize,
            uniqueEntrants,
            totalBullets,
            reentries,
            fieldFull,
        };
    }, [
        leaderboard.length,
        aliveCount,
        registeredCount,
        prizePoolUsdc,
        guaranteeUsdc,
        maxEntries,
    ]);

    // "You" facts for the personal strip. isMe closes over both myWallet and the
    // client id (see the memoized isMe above), so both flow in via that dep.
    const {
        myP,
        myOut,
        myRank,
        myStack,
        myBB,
        myPrize,
        myInMoney,
        myJump,
        onBubble,
        chipLead,
    } = useMemo(() => {
        const myIdx = sorted.findIndex(isMe);
        const myP = myIdx >= 0 ? sorted[myIdx] : null;
        const myOut = myP ? myP.finish_pos > 0 : false;
        const myRank = myP ? (myOut ? myP.finish_pos : myIdx + 1) : 0;
        const myStack = myP?.stack ?? 0;
        const myBB =
            myP && clockBb > 0 && !myOut
                ? Math.floor(myStack / clockBb)
                : null;
        const myPrize = myP?.prize_usdc ?? 0;
        const myInMoney = !!myP && !myOut && isInTheMoney(myRank, tierEntrants);
        const myJump =
            myP && !myOut
                ? nextPayJump(myRank, tierEntrants, poolForLadder)
                : null;
        const onBubble =
            !!myP && !myOut && !myInMoney && fromMoney > 0 && fromMoney <= 2;
        const chipLead = !!myP && !myOut && myRank === 1;
        return {
            myP,
            myOut,
            myRank,
            myStack,
            myBB,
            myPrize,
            myInMoney,
            myJump,
            onBubble,
            chipLead,
        };
    }, [sorted, isMe, clockBb, tierEntrants, poolForLadder, fromMoney]);

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
            <Sheet>
                <Box py={4} textAlign="center">
                    <Text color="text.muted" fontSize="sm">
                        Tournament details will appear here once the live feed
                        connects.
                    </Text>
                </Box>
            </Sheet>
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

    // Always-on tile detail.
    const minCashAmt = payoutForPosition(paid, tierEntrants, poolForLadder);
    const bustedSoFar = Math.max(0, tierEntrants - aliveCount);
    const bubbleProgress =
        tierEntrants > paid
            ? Math.min(1, bustedSoFar / (tierEntrants - paid))
            : 1;
    const topStack = aliveRows[0]?.stack ?? 0;
    const refIsMe = !!myP && !myOut;
    const refStack = refIsMe ? myStack : topStack;
    const avgRatio = avgStack > 0 ? refStack / avgStack : 0;
    // You/leader sit relative to the average: 50% fill == exactly average.
    const avgFrac = avgStack > 0 ? refStack / (refStack + avgStack) : 0;
    const split = [
        { frac: percentForPosition(1, tierEntrants) / 100, color: '#F4B400' },
        { frac: percentForPosition(2, tierEntrants) / 100, color: '#AEB6C6' },
        { frac: percentForPosition(3, tierEntrants) / 100, color: '#C4824A' },
    ];

    return (
        <Sheet>
            <VStack align="stretch" spacing={4}>
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
                    <LevelClockLine clock={clock} greenFg={greenFg} />
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

            {/* Scoreboard — uniform stat tiles, each with an at-a-glance bar */}
            <SimpleGrid columns={2} spacing={2}>
                <StatTile
                    label="Prize pool"
                    value={
                        meta.isFreePlay ? (
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="text.primary"
                            >
                                Free play
                            </Text>
                        ) : (
                            <HStack spacing={1.5} align="center" minW={0}>
                                <Image src={USDC_LOGO} alt="" boxSize="16px" />
                                <Text
                                    fontWeight="bold"
                                    fontSize="lg"
                                    color={USDC_BLUE}
                                    noOfLines={1}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    ${formatUsdcAuto(poolForLadder)}
                                </Text>
                            </HStack>
                        )
                    }
                    sub={
                        meta.isFreePlay ? (
                            <Text fontSize="2xs" color="text.muted">
                                Notional chips
                            </Text>
                        ) : (
                            <Text
                                fontSize="2xs"
                                color={overlay > 0 ? greenFg : 'text.muted'}
                                fontWeight={overlay > 0 ? 'semibold' : 'normal'}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                                noOfLines={1}
                            >
                                {overlay > 0
                                    ? `+$${formatUsdc(overlay)} overlay`
                                    : `Top $${formatUsdcAuto(topPrize)} · min $${formatUsdcAuto(minCashAmt)}`}
                            </Text>
                        )
                    }
                    bar={<SplitBar segs={split} track={border} />}
                />

                <StatTile
                    label="Players left"
                    value={
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
                    }
                    sub={
                        <Text
                            fontSize="2xs"
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
                    }
                    bar={
                        <Meter
                            frac={bubbleProgress}
                            fill={fromMoney === 0 ? 'brand.green' : 'brand.yellow'}
                            track={border}
                        />
                    }
                />

                <StatTile
                    label="Avg stack"
                    value={
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {avgStack ? avgStack.toLocaleString('en-US') : '—'}
                        </Text>
                    }
                    sub={
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                            noOfLines={1}
                        >
                            {avgBB != null ? `${avgBB} BB avg` : 'across survivors'}
                            {avgStack > 0 && refIsMe
                                ? ` · you ${avgRatio >= 1 ? `${avgRatio.toFixed(1)}×` : `${Math.round(avgRatio * 100)}%`}`
                                : ''}
                        </Text>
                    }
                    bar={
                        avgStack > 0 ? (
                            <Meter
                                frac={avgFrac}
                                fill={greenFg}
                                track={border}
                                center
                            />
                        ) : (
                            <Meter frac={0} fill={greenFg} track={border} />
                        )
                    }
                />

                <StatTile
                    label="Entries"
                    value={
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {uniqueEntrants}
                            {reentries > 0 && (
                                <Text as="span" fontSize="sm" color="text.muted">
                                    {' '}
                                    +{reentries} re
                                </Text>
                            )}
                        </Text>
                    }
                    sub={
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {fieldFull != null
                                ? `${fieldFull}% full`
                                : `${totalBullets} ${totalBullets === 1 ? 'entry' : 'entries'}`}
                        </Text>
                    }
                    bar={
                        <Meter
                            frac={fieldFull != null ? fieldFull / 100 : 0}
                            fill="brand.green"
                            track={border}
                        />
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
                                const bb =
                                    clock && clock.bb > 0 && !out
                                        ? Math.floor(p.stack / clock.bb)
                                        : null;
                                return (
                                    <StandingsRow
                                        key={p.uuid}
                                        p={p}
                                        rank={rank}
                                        out={out}
                                        bb={bb}
                                        even={i % 2 === 0}
                                        isMe={isMe(p)}
                                        showBullet={meta.reentryAllowed}
                                        chain={meta.chain}
                                        tournamentId={live.tournamentId}
                                        prefersReducedMotion={
                                            !!prefersReducedMotion
                                        }
                                        meHighlight={meHighlight}
                                        topSpot={topSpot}
                                        zebra={zebra}
                                        rowHover={rowHover}
                                        goldRank={goldRank}
                                        greenFg={greenFg}
                                    />
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
                onBreak={clock?.onBreak ?? false}
                defaultOpen={false}
                bare
            />
            </VStack>
        </Sheet>
    );
}

// The level/break sub-line owns its own 1-second countdown. Isolating the tick
// here means the panel's per-second re-render is scoped to this one line of text
// instead of the whole ~900-line panel.
function LevelClockLine({
    clock,
    greenFg,
}: {
    clock: TournamentClock;
    greenFg: string;
}) {
    const countdown = useLevelCountdown(clock);
    return (
        <Text
            fontSize="sm"
            color={countdown.onBreak ? greenFg : 'text.secondary'}
            fontWeight={countdown.onBreak ? 'semibold' : undefined}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {countdown.onBreak ? (
                <>
                    On break · {countdown.label} · Level {clock.levelNumber + 1}{' '}
                    next
                </>
            ) : (
                <>
                    Level {clock.levelNumber} ·{' '}
                    {clock.sb.toLocaleString('en-US')}/
                    {clock.bb.toLocaleString('en-US')}
                    {clock.ante > 0
                        ? ` (${clock.ante.toLocaleString('en-US')}a)`
                        : ''}{' '}
                    · {countdown.label} to next
                </>
            )}
        </Text>
    );
}

// One standings row. Memoized on stable/primitive props so a WS push that leaves
// a player's row unchanged skips its re-render — only the rows whose stack/rank/
// table actually moved repaint. The color tokens and prefersReducedMotion arrive
// as props so the row never reads context and stays cheap to compare.
const StandingsRow = React.memo(function StandingsRow({
    p,
    rank,
    out,
    bb,
    even,
    isMe,
    showBullet,
    chain,
    tournamentId,
    prefersReducedMotion,
    meHighlight,
    topSpot,
    zebra,
    rowHover,
    goldRank,
    greenFg,
}: {
    p: LeaderboardPlayer;
    rank: number;
    out: boolean;
    bb: number | null;
    even: boolean;
    isMe: boolean;
    showBullet: boolean;
    chain?: string;
    tournamentId: number;
    prefersReducedMotion: boolean;
    meHighlight: string;
    topSpot: string;
    zebra: string;
    rowHover: string;
    goldRank: string;
    greenFg: string;
}) {
    const topAlive = rank === 1 && !out;
    return (
        <Tr
            bg={
                isMe
                    ? meHighlight
                    : rank === 1 && !out
                      ? topSpot
                      : !even
                        ? zebra
                        : undefined
            }
            _hover={{ bg: isMe ? meHighlight : rowHover }}
            opacity={out ? 0.55 : 1}
        >
            <Td
                fontWeight="bold"
                color={rank === 1 ? goldRank : 'text.primary'}
            >
                {rank}
            </Td>
            <Td>
                <HStack spacing={2.5} minW={0}>
                    <Box position="relative" boxSize="30px" flexShrink={0}>
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
                            profileImageUrl={p.xProfileImageUrl}
                            address={p.wallet}
                            username={
                                p.xUsername
                                    ? `@${p.xUsername}`
                                    : p.wallet || p.uuid
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
                                chain
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
                    {isMe && (
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
            {showBullet && (
                <Td isNumeric>
                    <Text fontSize="xs" color="text.muted">
                        {p.bullet_number ?? 1}
                    </Text>
                </Td>
            )}
            <Td isNumeric sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {out ? (
                    <Text fontSize="xs" color="text.muted">
                        —
                    </Text>
                ) : (
                    <VStack spacing={0} align="flex-end">
                        <Text fontSize="xs" color="text.primary">
                            {p.stack.toLocaleString('en-US')}
                        </Text>
                        {bb != null && (
                            <Text fontSize="2xs" color="text.muted">
                                {bb} BB
                            </Text>
                        )}
                    </VStack>
                )}
            </Td>
            <Td isNumeric>
                {out || p.table_index < 0 ? (
                    <Text fontSize="xs" color="text.muted">
                        —
                    </Text>
                ) : (
                    <ExternalLink
                        href={`/table/tournament-${tournamentId}-table-${
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
});

// Opaque surface the whole panel floats on. The settings modal is frosted glass
// over the live table (transparent ModalContent + backdrop blur), so without a
// solid base the translucent row tints, dividers and standings read straight
// through to the felt and become illegible. This gives the panel its own opaque
// surface — the same move every sibling settings tab (PlayerList, Ledger) makes —
// so every section sits on a legible base in both light and dark mode. The inner
// StatTiles stay `card.white`, lifting off this lighter-gray sheet.
function Sheet({ children }: { children: ReactNode }) {
    return (
        <Box
            bg="card.lightGray"
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius={{ base: '16px', md: '18px' }}
            boxShadow="card.lift"
            px={{ base: 2.5, md: 3.5 }}
            py={{ base: 3, md: 3.5 }}
        >
            {children}
        </Box>
    );
}

// A uniform scoreboard tile: label, headline value, a sub line, and a bottom-
// anchored mini-bar. No interaction — all four tiles read at a glance and, with
// the grid stretching them, stay exactly the same height with bars aligned.
function StatTile({
    label,
    value,
    sub,
    bar,
}: {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    bar?: ReactNode;
}) {
    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="12px"
            px={3}
            py={2.5}
            boxShadow="card.lift"
            minW={0}
            display="flex"
            flexDirection="column"
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
            <Box mt={1}>{value}</Box>
            {sub && <Box mt={0.5}>{sub}</Box>}
            {bar && (
                <Box mt="auto" pt={2.5}>
                    {bar}
                </Box>
            )}
        </Box>
    );
}

// Single-track progress bar; `center` draws a tick at the midpoint (used for the
// you-vs-average tile, where 50% fill == exactly average).
function Meter({
    frac,
    fill,
    track,
    center = false,
}: {
    frac: number;
    fill: string;
    track: string;
    center?: boolean;
}) {
    const pct =
        frac <= 0 ? 0 : Math.max(3, Math.min(100, Math.round(frac * 100)));
    return (
        <Box position="relative" h="5px" borderRadius="full" bg={track}>
            <Box
                h="100%"
                w={`${pct}%`}
                borderRadius="full"
                bg={fill}
                transition="width 0.4s ease"
            />
            {center && (
                <Box
                    position="absolute"
                    top="-1px"
                    bottom="-1px"
                    left="50%"
                    w="1.5px"
                    borderRadius="full"
                    bg="rgba(127, 127, 127, 0.55)"
                />
            )}
        </Box>
    );
}

// Segmented bar showing the top-3 prize shares (gold / silver / bronze) against
// the rest of the pool (the track) — a glanceable read of how top-heavy payouts are.
function SplitBar({
    segs,
    track,
}: {
    segs: { frac: number; color: string }[];
    track: string;
}) {
    return (
        <Flex h="5px" borderRadius="full" bg={track} overflow="hidden" gap="1.5px">
            {segs.map((s, i) => (
                <Box
                    key={i}
                    h="100%"
                    w={`${Math.max(0, Math.min(100, Math.round(s.frac * 100)))}%`}
                    bg={s.color}
                />
            ))}
        </Flex>
    );
}
