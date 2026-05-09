import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    HStack,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';

/**
 * Design spike — alternative treatments for the taken-seats indicator
 * currently rendered by `SeatDots` in `PublicGames/PublicGameCard.tsx`.
 *
 * Purpose: pick the most readable, most "poker" direction. NOT production.
 */

type Size = 6 | 9;

interface SeatProps {
    taken: number;
    total: Size;
}

// ---------- shared row scaffold (mimics the public-game-row backdrop) ----------

function RowBackdrop({ children }: { children: React.ReactNode }) {
    const rowHover = useColorModeValue('rgba(11, 20, 48, 0.025)', 'rgba(255, 255, 255, 0.03)');
    return (
        <HStack
            bg="bg.surface"
            _hover={{ bg: rowHover }}
            px={6}
            py={3.5}
            spacing={4}
            borderBottom="1px solid"
            borderColor={useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.06)')}
            justify="flex-start"
            minH="56px"
        >
            {children}
        </HStack>
    );
}

function StateLabel({ children }: { children: React.ReactNode }) {
    return (
        <Text
            w="64px"
            fontSize="2xs"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.08em"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {children}
        </Text>
    );
}

function DirectionSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            mb={8}
            border="1px solid"
            borderColor={useColorModeValue('rgba(11, 20, 48, 0.08)', 'rgba(255, 255, 255, 0.08)')}
            borderRadius="12px"
            overflow="hidden"
            bg="bg.surface"
        >
            <Box px={6} py={3} bg={useColorModeValue('rgba(11, 20, 48, 0.03)', 'rgba(255, 255, 255, 0.04)')}>
                <Text fontWeight="bold" color="text.primary" fontSize="sm">
                    {title}
                </Text>
                <Text color="text.muted" fontSize="xs" mt={0.5}>
                    {description}
                </Text>
            </Box>
            {children}
        </Box>
    );
}

// ---------- helper: fill ratio → state color ----------

function useFillTone(taken: number, total: number) {
    const ratio = total === 0 ? 0 : taken / total;
    // Felt Green (open) → Chip Yellow (filling) → Neon Stake (near full)
    if (taken >= total) return { fg: 'brand.pink', label: 'FULL' as const };
    if (ratio >= 0.75) return { fg: 'brand.pink', label: 'HOT' as const };
    if (ratio >= 0.4) return { fg: 'brand.yellow', label: 'FILLING' as const };
    if (ratio > 0) return { fg: 'brand.green', label: 'OPEN' as const };
    return { fg: 'brand.green', label: 'EMPTY' as const };
}

// ============================================================
// QUIETER DIRECTIONS — type-forward, monochrome, single-accent
// ============================================================

// E — Numeric only (typographic)
function NumericOnly({ taken, total }: SeatProps) {
    const isFull = taken >= total;
    return (
        <HStack spacing={1.5} align="baseline">
            <Text
                fontWeight="bold"
                fontSize="md"
                color={isFull ? 'text.muted' : 'text.primary'}
                lineHeight="1"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}
            </Text>
            <Text
                fontSize="sm"
                color="text.muted"
                fontWeight="medium"
                lineHeight="1"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                /{total}
            </Text>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.10em"
                fontWeight="semibold"
                ml={1}
            >
                {isFull ? 'full' : 'seats'}
            </Text>
        </HStack>
    );
}

// F — Numeric + hairline progress (single-accent)
function NumericHairline({ taken, total }: SeatProps) {
    const ratio = Math.min(1, taken / total);
    const isFull = taken >= total;
    const trackBg = useColorModeValue('rgba(11, 20, 48, 0.10)', 'rgba(255, 255, 255, 0.10)');
    const fillFg = isFull ? 'brand.pink' : 'text.secondary';

    return (
        <VStack spacing={1.5} align="flex-start" minW="80px">
            <HStack spacing={1} align="baseline">
                <Text
                    fontWeight="bold"
                    fontSize="sm"
                    color="text.primary"
                    lineHeight="1"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {taken}/{total}
                </Text>
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.10em"
                    fontWeight="semibold"
                    ml={1}
                >
                    seats
                </Text>
            </HStack>
            <Box position="relative" w="80px" h="2px" borderRadius="full" bg={trackBg}>
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    h="2px"
                    w={`${ratio * 100}%`}
                    borderRadius="full"
                    bg={fillFg}
                    opacity={0.8}
                    transition="width 0.2s ease"
                />
            </Box>
        </VStack>
    );
}

// G — Mono dots (weight, not color)
function MonoDots({ taken, total }: SeatProps) {
    const filledDot = useColorModeValue('text.primary', 'text.primary');
    const emptyDot = useColorModeValue('rgba(11, 20, 48, 0.18)', 'rgba(255, 255, 255, 0.20)');
    return (
        <HStack spacing={2}>
            <HStack spacing="5px">
                {Array.from({ length: total }).map((_, i) => (
                    <Box
                        key={i}
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg={i < taken ? filledDot : emptyDot}
                    />
                ))}
            </HStack>
            <Text
                fontWeight="bold"
                fontSize="xs"
                color="text.primary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}/{total}
            </Text>
        </HStack>
    );
}

// H — Numeric + state word (mono, single accent at FULL only)
function NumericStateWord({ taken, total }: SeatProps) {
    const ratio = total === 0 ? 0 : taken / total;
    const isFull = taken >= total;
    const word = isFull
        ? 'full'
        : ratio >= 0.75
          ? 'almost'
          : ratio >= 0.4
            ? 'open'
            : taken === 0
              ? 'empty'
              : 'open';
    return (
        <HStack spacing={2.5} align="baseline">
            <Text
                fontWeight="bold"
                fontSize="sm"
                color="text.primary"
                lineHeight="1"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}/{total}
            </Text>
            <Text
                fontSize="2xs"
                color={isFull ? 'brand.pink' : 'text.muted'}
                textTransform="uppercase"
                letterSpacing="0.10em"
                fontWeight="bold"
                opacity={isFull ? 1 : 0.8}
            >
                {word}
            </Text>
        </HStack>
    );
}

// ============================================================
// LOUDER DIRECTIONS (for comparison only — feedback was "too colorful")
// ============================================================

// Direction A — Filled-bar pill

function FilledBarPill({ taken, total }: SeatProps) {
    const { fg, label } = useFillTone(taken, total);
    const ratio = Math.min(1, taken / total);
    const trackBg = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.07)');
    const ringColor = useColorModeValue('rgba(11, 20, 48, 0.1)', 'rgba(255, 255, 255, 0.12)');
    const isFull = taken >= total;

    return (
        <HStack spacing={2}>
            <Box
                position="relative"
                w="92px"
                h="22px"
                borderRadius="full"
                bg={trackBg}
                border="1px solid"
                borderColor={ringColor}
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    inset={0}
                    w={`${ratio * 100}%`}
                    bg={fg}
                    opacity={isFull ? 0.95 : 0.85}
                    transition="width 0.2s ease"
                />
                <HStack
                    position="relative"
                    h="full"
                    justify="center"
                    align="center"
                    spacing={1}
                >
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        color={ratio >= 0.5 ? 'white' : 'text.primary'}
                        sx={{ fontVariantNumeric: 'tabular-nums', mixBlendMode: 'normal' }}
                    >
                        {taken}/{total}
                    </Text>
                </HStack>
            </Box>
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.08em"
                color={fg}
            >
                {label}
            </Text>
        </HStack>
    );
}

// ============================================================
// Direction B — Avatar-cluster + count
// ============================================================

function AvatarCluster({ taken, total }: SeatProps) {
    const visible = Math.min(taken, 4);
    const overflow = taken - visible;
    const seatBg = useColorModeValue('brand.navy', 'brand.lightGray');
    const seatFg = useColorModeValue('brand.lightGray', 'brand.darkNavy');
    const emptyBorder = useColorModeValue('rgba(11, 20, 48, 0.22)', 'rgba(255, 255, 255, 0.28)');
    const overflowBg = useColorModeValue('rgba(11, 20, 48, 0.08)', 'rgba(255, 255, 255, 0.12)');

    return (
        <HStack spacing={2}>
            {taken === 0 ? (
                <HStack spacing={-2} sx={{ '& > *:not(:first-of-type)': { ml: '-6px' } }}>
                    {[0, 1, 2].map((i) => (
                        <Box
                            key={i}
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            border="1.5px dashed"
                            borderColor={emptyBorder}
                            bg="transparent"
                            boxShadow={`0 0 0 2px var(--chakra-colors-bg-surface)`}
                        />
                    ))}
                </HStack>
            ) : (
                <HStack spacing={0} sx={{ '& > *:not(:first-of-type)': { ml: '-6px' } }}>
                    {Array.from({ length: visible }).map((_, i) => (
                        <Box
                            key={i}
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            bg={seatBg}
                            color={seatFg}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="2xs"
                            fontWeight="bold"
                            boxShadow={`0 0 0 2px var(--chakra-colors-bg-surface)`}
                        >
                            {String.fromCharCode(65 + i)}
                        </Box>
                    ))}
                    {overflow > 0 && (
                        <Box
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            bg={overflowBg}
                            color="text.primary"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="2xs"
                            fontWeight="bold"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                            boxShadow={`0 0 0 2px var(--chakra-colors-bg-surface)`}
                        >
                            +{overflow}
                        </Box>
                    )}
                </HStack>
            )}
            <Text
                fontWeight="bold"
                fontSize="xs"
                color="text.primary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}/{total}
            </Text>
        </HStack>
    );
}

// ============================================================
// Direction C — Stack-of-chips
// ============================================================

function ChipStack({ taken, total }: SeatProps) {
    const { fg } = useFillTone(taken, total);
    const chipEdge = useColorModeValue('rgba(11, 20, 48, 0.55)', 'rgba(0, 0, 0, 0.6)');
    const emptyBg = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.06)');
    const emptyEdge = useColorModeValue('rgba(11, 20, 48, 0.18)', 'rgba(255, 255, 255, 0.2)');

    return (
        <HStack spacing={2} align="center">
            <Box position="relative" h="22px" w={`${total * 5 + 8}px`}>
                {Array.from({ length: total }).map((_, i) => {
                    const filled = i < taken;
                    return (
                        <Box
                            key={i}
                            position="absolute"
                            left={`${i * 5}px`}
                            bottom={0}
                            w="14px"
                            h="6px"
                            borderRadius="2px"
                            bg={filled ? fg : emptyBg}
                            boxShadow={
                                filled
                                    ? `inset 0 -1px 0 ${chipEdge}, inset 0 1px 0 rgba(255,255,255,0.25)`
                                    : `inset 0 0 0 1px ${emptyEdge}`
                            }
                            sx={{ transform: `translateY(-${filled ? i * 2 : 0}px)` }}
                        />
                    );
                })}
            </Box>
            <Text
                fontWeight="bold"
                fontSize="xs"
                color="text.primary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}/{total}
            </Text>
        </HStack>
    );
}

// ============================================================
// Direction D — Bigger dots inside a soft pill, ringed by fill state
// ============================================================

function DottedPill({ taken, total }: SeatProps) {
    const { fg } = useFillTone(taken, total);
    const pillBg = useColorModeValue('rgba(11, 20, 48, 0.04)', 'rgba(255, 255, 255, 0.05)');
    const emptyDot = useColorModeValue('rgba(11, 20, 48, 0.22)', 'rgba(255, 255, 255, 0.25)');

    return (
        <HStack spacing={2}>
            <HStack
                spacing="4px"
                px={2.5}
                py={1.5}
                borderRadius="full"
                bg={pillBg}
                border="1.5px solid"
                borderColor={fg}
            >
                {Array.from({ length: total }).map((_, i) => (
                    <Box
                        key={i}
                        w="9px"
                        h="9px"
                        borderRadius="full"
                        bg={i < taken ? fg : 'transparent'}
                        border={i < taken ? 'none' : '1.5px solid'}
                        borderColor={emptyDot}
                    />
                ))}
            </HStack>
            <Text
                fontWeight="bold"
                fontSize="xs"
                color="text.primary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {taken}/{total}
            </Text>
        </HStack>
    );
}

// ============================================================
// Spike layout
// ============================================================

function StatesRow({
    Component,
    total,
}: {
    Component: React.ComponentType<SeatProps>;
    total: Size;
}) {
    const states: number[] =
        total === 9 ? [0, 4, 7, 9] : [0, 3, 5, 6];
    const labels = ['EMPTY', 'HALF', 'NEAR', 'FULL'];

    return (
        <Box>
            {states.map((taken, idx) => (
                <RowBackdrop key={`${total}-${taken}`}>
                    <StateLabel>{`${total}-max · ${labels[idx]}`}</StateLabel>
                    <Component taken={taken} total={total} />
                </RowBackdrop>
            ))}
        </Box>
    );
}

function Spike() {
    return (
        <Box bg="bg.default" minH="100vh" py={8} px={{ base: 4, md: 8 }}>
            <VStack align="stretch" spacing={6} maxW="900px" mx="auto">
                <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                        Seat-count indicator — design spike
                    </Text>
                    <Text color="text.muted" fontSize="sm" mt={1}>
                        Quieter directions first. Toggle the Storybook theme to compare modes.
                    </Text>
                </Box>

                <DirectionSection
                    title="E — Numeric only (typographic)"
                    description="Disciplined and confident. Type and scale carry everything; pink only at FULL. Closest to a Friday-night penthouse voice."
                >
                    <StatesRow Component={NumericOnly} total={9} />
                    <StatesRow Component={NumericOnly} total={6} />
                </DirectionSection>

                <DirectionSection
                    title="F — Numeric + hairline progress"
                    description="Number first, a 2px monochrome bar below quietly encodes %. Pink only at FULL. Spatial cue without the heat-map."
                >
                    <StatesRow Component={NumericHairline} total={9} />
                    <StatesRow Component={NumericHairline} total={6} />
                </DirectionSection>

                <DirectionSection
                    title="G — Mono dots"
                    description="Same dots-metaphor as today, but monochrome — filled vs faded, no color shift. Lowest-risk evolution of the existing SeatDots."
                >
                    <StatesRow Component={MonoDots} total={9} />
                    <StatesRow Component={MonoDots} total={6} />
                </DirectionSection>

                <DirectionSection
                    title="H — Numeric + state word"
                    description="Number plus a single uppercase keyword (open / almost / full). Word stays muted until the table is full, when it shifts pink."
                >
                    <StatesRow Component={NumericStateWord} total={9} />
                    <StatesRow Component={NumericStateWord} total={6} />
                </DirectionSection>

                <Box pt={4}>
                    <Text
                        fontSize="xs"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.10em"
                        fontWeight="semibold"
                        mb={3}
                    >
                        For comparison — earlier louder directions (rejected as too colorful)
                    </Text>
                </Box>

                <DirectionSection
                    title="A — Filled-bar pill (heat-mapped)"
                    description="Rejected: green → yellow → pink heat shift reads as casino-floor."
                >
                    <StatesRow Component={FilledBarPill} total={9} />
                </DirectionSection>

                <DirectionSection
                    title="B — Avatar cluster (overlapping seats)"
                    description="Rejected: visual-noise heavy at row scale."
                >
                    <StatesRow Component={AvatarCluster} total={9} />
                </DirectionSection>

                <DirectionSection
                    title="C — Stack of chips (heat-mapped)"
                    description="Rejected: tone shifts feel busy in a long list."
                >
                    <StatesRow Component={ChipStack} total={9} />
                </DirectionSection>

                <DirectionSection
                    title="D — Dotted pill (heat-ringed)"
                    description="Rejected: outer ring color shift carries the heat-map debt."
                >
                    <StatesRow Component={DottedPill} total={9} />
                </DirectionSection>
            </VStack>
        </Box>
    );
}

const meta: Meta<typeof Spike> = {
    title: 'Design Spikes / PublicGames — Seat Count',
    component: Spike,
    parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Spike>;

export const AllDirections: Story = {};
