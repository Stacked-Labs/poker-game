'use client';

import React, { useMemo } from 'react';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Image,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { PiMedalFill, PiTrophyFill } from 'react-icons/pi';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatUsdc,
    HIDE_X_SCROLLBAR_SX,
    ordinal,
} from '../PublicGames/tournamentFormat';
import {
    calculatePayouts,
    defaultPayouts,
    placesPaid,
} from '../PublicGames/payouts';

// Podium metal for the top three: a gold trophy for the champion, silver/bronze
// medals for the runners-up. Colours read on both light and dark surfaces.
const PODIUM_METAL: Record<number, string> = {
    1: '#F4B400', // gold
    2: '#9AA3B5', // silver
    3: '#C4824A', // bronze
};

// Faint accent for the in-row "prize size" bar, widest at 1st and tapering down.
const SHARE_BAR: Record<number, string> = {
    1: 'rgba(253, 197, 29, 0.22)',
    2: 'rgba(148, 163, 184, 0.20)',
    3: 'rgba(205, 137, 78, 0.20)',
};

// The trophy/medals give a springy little pop as they land. (Rows render
// statically: a per-row opacity entrance previously left rows invisible at rest
// on first paint / SSR / screenshots, hiding the page's most important data.)
const medalPop = keyframes`
    0%   { transform: scale(0.4); opacity: 0; }
    60%  { transform: scale(1.18); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
`;

// Shared so the Final Standings podium (TournamentDetail) shows the exact same
// gold-trophy / silver- & bronze-medal marks as the payout ladder. `size` scales
// the icon; the rank is announced via aria-label since the glyph carries no numeral.
export function RankBadge({
    place,
    reduced,
    delayMs,
    size = 22,
}: {
    place: number;
    reduced: boolean;
    delayMs: number;
    size?: number;
}) {
    const color = PODIUM_METAL[place];
    if (!color) return null;
    const Glyph = place === 1 ? PiTrophyFill : PiMedalFill;
    const label =
        place === 1
            ? '1st place'
            : place === 2
              ? '2nd place'
              : '3rd place';
    return (
        <Flex
            role="img"
            aria-label={label}
            align="center"
            justify="center"
            boxSize={`${size}px`}
            flexShrink={0}
            sx={{
                animation: reduced
                    ? undefined
                    : `${medalPop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                animationDelay: reduced ? undefined : `${delayMs}ms`,
            }}
        >
            <Icon
                as={Glyph}
                boxSize={`${Math.round(size * 0.88)}px`}
                color={color}
                sx={{ filter: 'drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.3))' }}
            />
        </Flex>
    );
}

export interface PayoutLadderProps {
    entrants: number;
    prizePoolUsdc: number;
    isFreePlay: boolean;
    status: string;
    bare?: boolean;
    /** Finishing position to flag as "you" (1-based), e.g. your projected place. */
    highlightPosition?: number | null;
}

function PayoutLadder({
    entrants,
    prizePoolUsdc,
    isFreePlay,
    status,
    bare = false,
    highlightPosition = null,
}: PayoutLadderProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const tagBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    // Opaque-enough zebra for dense-row legibility; podium washes for the top three.
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.04)',
        'rgba(255, 255, 255, 0.05)'
    );
    const goldWash = useColorModeValue(
        'rgba(253, 197, 29, 0.12)',
        'rgba(253, 197, 29, 0.11)'
    );
    const silverWash = useColorModeValue(
        'rgba(148, 163, 184, 0.14)',
        'rgba(148, 163, 184, 0.16)'
    );
    const bronzeWash = useColorModeValue(
        'rgba(205, 137, 78, 0.12)',
        'rgba(205, 137, 78, 0.18)'
    );
    const youWash = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const youText = useColorModeValue('brand.greenDark', 'brand.green');

    // The tier table and per-place amounts recompute only when the field size or
    // pool moves, not on every parent render under a heavy live feed.
    const { tiers, amounts, paid } = useMemo(
        () => ({
            tiers: defaultPayouts(entrants),
            amounts: calculatePayouts(entrants, prizePoolUsdc),
            paid: placesPaid(entrants),
        }),
        [entrants, prizePoolUsdc]
    );
    const itmPct = entrants > 0 ? Math.round((paid / entrants) * 100) : 0;
    const projected = status === 'registration' || status === 'pending';
    // Real-money ladders ALWAYS show a money column so there is a concrete prize
    // to chase: an exact figure once locked, a "~$" estimate while projecting.
    const showPrize = !isFreePlay;
    // Widest prize anchors the in-row "share size" bars.
    const maxPercent = tiers.length ? tiers[0].percent : 1;

    const content = (
        <>
            <Flex
                px={bare ? 0 : { base: 4, md: 6 }}
                pt={bare ? 0 : 4}
                pb={2}
                align="baseline"
                justify="space-between"
                gap={3}
                wrap="wrap"
            >
                <Box>
                    <Text fontWeight="bold" fontSize="md" color="text.primary">
                        Payouts
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                        Top {paid} paid · ~{itmPct}% of field
                    </Text>
                </Box>
                <Box
                    bg={tagBg}
                    color="text.muted"
                    fontSize="2xs"
                    fontWeight="bold"
                    px={2}
                    py="2px"
                    borderRadius="full"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                >
                    {projected ? 'Projected' : 'Locked'}
                </Box>
            </Flex>

            <Box
                overflowX="auto"
                px={bare ? 0 : { base: 1, md: 2 }}
                pb={3}
                sx={HIDE_X_SCROLLBAR_SX}
            >
                <Table
                    size="sm"
                    variant="simple"
                    sx={{ 'th, td': { borderColor: border, px: 2 } }}
                >
                    <Thead>
                        <Tr>
                            <Th>Place</Th>
                            <Th isNumeric>Share</Th>
                            {showPrize && <Th isNumeric>Prize</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tiers.map((t, i) => {
                            const isRange = t.min !== t.max;
                            const label = isRange
                                ? `${ordinal(t.min)}–${ordinal(t.max)}`
                                : ordinal(t.min);
                            const isMinCash = i === tiers.length - 1;
                            const podium = !isRange && t.min <= 3 ? t.min : 0;
                            const isYou =
                                highlightPosition != null &&
                                highlightPosition >= t.min &&
                                highlightPosition <= t.max;
                            const amt = amounts.get(t.min) ?? 0;
                            const washColor = isYou
                                ? youWash
                                : podium === 1
                                  ? goldWash
                                  : podium === 2
                                    ? silverWash
                                    : podium === 3
                                      ? bronzeWash
                                      : i % 2 === 1
                                        ? zebra
                                        : 'transparent';
                            // Faint left-anchored bar sized to this tier's share.
                            const barCol = SHARE_BAR[podium] ?? youWash;
                            const barPct = Math.round(
                                (t.percent / maxPercent) * 100
                            );
                            return (
                                <Tr
                                    key={`${t.min}-${t.max}`}
                                    sx={{
                                        backgroundColor: washColor,
                                        backgroundImage: `linear-gradient(to right, ${barCol} ${barPct}%, transparent ${barPct}%)`,
                                        boxShadow: isYou
                                            ? `inset 3px 0 0 var(--chakra-colors-brand-green)`
                                            : undefined,
                                    }}
                                >
                                    <Td color="text.primary">
                                        <HStack spacing={2.5}>
                                            {podium > 0 && (
                                                <RankBadge
                                                    place={podium}
                                                    reduced={
                                                        !!prefersReducedMotion
                                                    }
                                                    delayMs={120 + i * 60}
                                                />
                                            )}
                                            <Text
                                                as="span"
                                                fontWeight={
                                                    podium || isYou
                                                        ? 'bold'
                                                        : 'normal'
                                                }
                                                color="text.primary"
                                            >
                                                {label}
                                            </Text>
                                            {isYou && (
                                                <Text
                                                    as="span"
                                                    fontSize="2xs"
                                                    fontWeight="bold"
                                                    color={youText}
                                                    textTransform="uppercase"
                                                    letterSpacing="0.05em"
                                                >
                                                    you
                                                </Text>
                                            )}
                                            {isMinCash && !isYou && (
                                                <Text
                                                    as="span"
                                                    fontSize="2xs"
                                                    color="text.muted"
                                                    textTransform="uppercase"
                                                    letterSpacing="0.05em"
                                                >
                                                    min-cash
                                                </Text>
                                            )}
                                        </HStack>
                                    </Td>
                                    <Td
                                        isNumeric
                                        color="text.primary"
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {t.percent}%{isRange ? ' ea' : ''}
                                    </Td>
                                    {showPrize && (
                                        <Td isNumeric>
                                            {amt > 0 ? (
                                                <HStack
                                                    justify="flex-end"
                                                    spacing={1}
                                                >
                                                    {!projected && (
                                                        <Image
                                                            src={USDC_LOGO}
                                                            alt=""
                                                            boxSize={
                                                                podium === 1
                                                                    ? '15px'
                                                                    : '13px'
                                                            }
                                                        />
                                                    )}
                                                    <Text
                                                        fontWeight={
                                                            projected
                                                                ? 'semibold'
                                                                : 'bold'
                                                        }
                                                        fontSize={
                                                            podium === 1
                                                                ? 'md'
                                                                : 'sm'
                                                        }
                                                        color={
                                                            projected
                                                                ? 'text.secondary'
                                                                : USDC_BLUE
                                                        }
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {projected ? '~' : ''}$
                                                        {formatUsdc(amt)}
                                                        {isRange ? ' ea' : ''}
                                                    </Text>
                                                </HStack>
                                            ) : (
                                                <Text color="text.muted">—</Text>
                                            )}
                                        </Td>
                                    )}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
                {isFreePlay && (
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        px={{ base: 2, md: 3 }}
                        pt={2}
                    >
                        Free Play · notional only, no real prizes.
                    </Text>
                )}
                {projected && !isFreePlay && (
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        px={{ base: 2, md: 3 }}
                        pt={2}
                    >
                        Projected from the current field. Shifts as players
                        register, then locks at start.
                    </Text>
                )}
            </Box>
        </>
    );

    if (bare) return content;

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            overflow="hidden"
        >
            {content}
        </Box>
    );
}

export default React.memo(PayoutLadder);
