'use client';

import {
    Box,
    Flex,
    HStack,
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

// Podium chips, styled as poker chips: a base colour, rim "edge spots", and a
// glossed inner face with a dark numeral. Static across themes (discRing supplies
// the light-mode edge); the gold chip gets a slow glint.
const CHIP: Record<
    number,
    { base: string; spot: string; faceTop: string; faceBot: string; fg: string }
> = {
    1: {
        base: '#F4B400',
        spot: 'rgba(255, 255, 255, 0.92)',
        faceTop: '#FFE079',
        faceBot: '#F2B100',
        fg: '#2A1E00',
    },
    2: {
        base: '#AEB6C6',
        spot: 'rgba(255, 255, 255, 0.96)',
        faceTop: '#E9EDF4',
        faceBot: '#B4BCCC',
        fg: '#1C2436',
    },
    3: {
        base: '#C4824A',
        spot: 'rgba(255, 240, 222, 0.92)',
        faceTop: '#E4A972',
        faceBot: '#BB7B42',
        fg: '#2A1605',
    },
};

// Faint accent for the in-row "prize size" bar, widest at 1st and tapering down.
const SHARE_BAR: Record<number, string> = {
    1: 'rgba(253, 197, 29, 0.22)',
    2: 'rgba(148, 163, 184, 0.20)',
    3: 'rgba(205, 137, 78, 0.20)',
};

// Rows fade up in sequence; chips give a springy little pop as they land.
const rowFade = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
`;
const medalPop = keyframes`
    0%   { transform: scale(0.4); opacity: 0; }
    60%  { transform: scale(1.18); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
`;
// Occasional light streak that sweeps across the gold chip's face.
const chipShine = keyframes`
    0%        { transform: translateX(-140%) rotate(12deg); opacity: 0; }
    14%       { opacity: 0.85; }
    34%, 100% { transform: translateX(180%) rotate(12deg); opacity: 0; }
`;

function ChipMedal({
    place,
    ring,
    reduced,
    delayMs,
}: {
    place: number;
    ring: string;
    reduced: boolean;
    delayMs: number;
}) {
    const c = CHIP[place];
    if (!c) return null;
    return (
        <Box
            position="relative"
            boxSize="22px"
            borderRadius="full"
            flexShrink={0}
            aria-hidden
            sx={{
                backgroundColor: c.base,
                // 6 evenly spaced rim spots — the classic chip edge.
                backgroundImage: `repeating-conic-gradient(from 0deg, ${c.spot} 0deg 22deg, transparent 22deg 60deg)`,
                boxShadow: `${ring}, 0 1px 2px rgba(0, 0, 0, 0.28)`,
                animation: reduced
                    ? undefined
                    : `${medalPop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                animationDelay: reduced ? undefined : `${delayMs}ms`,
            }}
        >
            <Flex
                position="absolute"
                inset="3px"
                borderRadius="full"
                align="center"
                justify="center"
                overflow="hidden"
                sx={{
                    background: `radial-gradient(circle at 34% 28%, ${c.faceTop}, ${c.faceBot})`,
                    boxShadow:
                        'inset 0 0 0 1px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.55)',
                }}
            >
                <Text
                    as="span"
                    fontSize="2xs"
                    fontWeight="bold"
                    color={c.fg}
                    lineHeight="1"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {place}
                </Text>
                {place === 1 && !reduced && (
                    <Box
                        position="absolute"
                        top="-30%"
                        left="-30%"
                        w="45%"
                        h="160%"
                        sx={{
                            background:
                                'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                            animation: `${chipShine} 4.5s ease-in-out 1s infinite`,
                        }}
                    />
                )}
            </Flex>
        </Box>
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

export default function PayoutLadder({
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
    // Subtle zebra for dense-row legibility; podium washes for the top three.
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.025)'
    );
    const goldWash = useColorModeValue(
        'rgba(253, 197, 29, 0.12)',
        'rgba(253, 197, 29, 0.14)'
    );
    const silverWash = useColorModeValue(
        'rgba(148, 163, 184, 0.14)',
        'rgba(148, 163, 184, 0.16)'
    );
    const bronzeWash = useColorModeValue(
        'rgba(205, 137, 78, 0.12)',
        'rgba(205, 137, 78, 0.18)'
    );
    // Edge for the medal disc so the lighter (silver) chip reads on a white card.
    const discRing = useColorModeValue(
        'inset 0 0 0 1px rgba(11, 20, 48, 0.10)',
        'inset 0 0 0 1px rgba(0, 0, 0, 0.25)'
    );

    const youWash = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const youText = useColorModeValue('brand.greenDark', 'brand.green');

    const tiers = defaultPayouts(entrants);
    const amounts = calculatePayouts(entrants, prizePoolUsdc);
    const paid = placesPaid(entrants);
    const itmPct = entrants > 0 ? Math.round((paid / entrants) * 100) : 0;
    const projected = status === 'registration' || status === 'pending';
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
                            {!isFreePlay && <Th isNumeric>Prize</Th>}
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
                                        animation: prefersReducedMotion
                                            ? undefined
                                            : `${rowFade} 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                                        animationDelay: prefersReducedMotion
                                            ? undefined
                                            : `${i * 40}ms`,
                                    }}
                                >
                                    <Td color="text.primary">
                                        <HStack spacing={2.5}>
                                            {podium > 0 && (
                                                <ChipMedal
                                                    place={podium}
                                                    ring={discRing}
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
                                        color="text.secondary"
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {t.percent}%{isRange ? ' ea' : ''}
                                    </Td>
                                    {!isFreePlay && (
                                        <Td isNumeric>
                                            <HStack
                                                justify="flex-end"
                                                spacing={1}
                                            >
                                                <Image
                                                    src={USDC_LOGO}
                                                    alt=""
                                                    boxSize={
                                                        podium === 1
                                                            ? '15px'
                                                            : '13px'
                                                    }
                                                />
                                                <Text
                                                    fontWeight="bold"
                                                    fontSize={
                                                        podium === 1
                                                            ? 'md'
                                                            : 'sm'
                                                    }
                                                    color={USDC_BLUE}
                                                    sx={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                >
                                                    {formatUsdc(
                                                        amounts.get(t.min) ?? 0
                                                    )}
                                                    {isRange ? ' ea' : ''}
                                                </Text>
                                            </HStack>
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
