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
} from '@chakra-ui/react';
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

// Podium medal chips — filled brights with dark numerals. Static across themes:
// they pop on either card surface (discRing supplies the light-mode edge).
const MEDALS: Record<number, { bg: string; fg: string }> = {
    1: { bg: '#FDC51D', fg: '#2A1E00' },
    2: { bg: '#C3CAD9', fg: '#1C2436' },
    3: { bg: '#CE8E54', fg: '#2A1605' },
};

export interface PayoutLadderProps {
    entrants: number;
    prizePoolUsdc: number;
    isFreePlay: boolean;
    status: string;
    bare?: boolean;
}

export default function PayoutLadder({
    entrants,
    prizePoolUsdc,
    isFreePlay,
    status,
    bare = false,
}: PayoutLadderProps) {
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

    const tiers = defaultPayouts(entrants);
    const amounts = calculatePayouts(entrants, prizePoolUsdc);
    const paid = placesPaid(entrants);
    const itmPct = entrants > 0 ? Math.round((paid / entrants) * 100) : 0;
    const projected = status === 'registration' || status === 'pending';

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
                            const medal = podium ? MEDALS[podium] : null;
                            return (
                                <Tr
                                    key={`${t.min}-${t.max}`}
                                    bg={
                                        podium === 1
                                            ? goldWash
                                            : podium === 2
                                              ? silverWash
                                              : podium === 3
                                                ? bronzeWash
                                                : i % 2 === 1
                                                  ? zebra
                                                  : undefined
                                    }
                                >
                                    <Td color="text.primary">
                                        <HStack spacing={2.5}>
                                            {medal && (
                                                <Flex
                                                    align="center"
                                                    justify="center"
                                                    boxSize="22px"
                                                    borderRadius="full"
                                                    bg={medal.bg}
                                                    boxShadow={discRing}
                                                    flexShrink={0}
                                                    aria-hidden
                                                >
                                                    <Text
                                                        as="span"
                                                        fontSize="2xs"
                                                        fontWeight="bold"
                                                        color={medal.fg}
                                                        lineHeight="1"
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {t.min}
                                                    </Text>
                                                </Flex>
                                            )}
                                            <Text
                                                as="span"
                                                fontWeight={
                                                    medal ? 'bold' : 'normal'
                                                }
                                                color="text.primary"
                                            >
                                                {label}
                                            </Text>
                                            {isMinCash && (
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
