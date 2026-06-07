'use client';

import {
    Box,
    Collapse,
    Flex,
    HStack,
    Icon,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiChevronDown } from 'react-icons/fi';
import {
    BLINDS_KEEP_RISING_NOTE,
    bbAtLateRegClose,
    getStructure,
    levelDurationMin,
    startingBigBlinds,
    templateLabel,
} from '../PublicGames/blindStructures';
import { HIDE_X_SCROLLBAR_SX } from '../PublicGames/tournamentFormat';

// Seamless right-to-left ticker: the label is rendered twice and the track is
// shifted by half its width, so copy #2 lands exactly where copy #1 began.
const tickerScroll = keyframes`
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
`;

export interface StructureSheetProps {
    blindStructure: string;
    startingStack: number;
    lateRegLevels: number;
    /** Live level to highlight (1-based), if running. */
    currentLevel?: number | null;
    defaultOpen?: boolean;
    /** Render without the card chrome (when embedded in another card/panel). */
    bare?: boolean;
}

export default function StructureSheet({
    blindStructure,
    startingStack,
    lateRegLevels,
    currentLevel = null,
    defaultOpen = true,
    bare = false,
}: StructureSheetProps) {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: defaultOpen });
    const prefersReducedMotion = usePrefersReducedMotion();
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const currentBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.16)'
    );
    // Late-reg-close level gets its own colored role (chip-yellow wash), distinct
    // from the green live-level wash.
    const lateBg = useColorModeValue(
        'rgba(253, 197, 29, 0.12)',
        'rgba(253, 197, 29, 0.14)'
    );
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.025)'
    );
    // brand.yellowDark fails AA as small text on the yellow row tint in light mode;
    // yellowEdge clears 4.5:1. Dark mode keeps the brighter yellow.
    const lateText = useColorModeValue('brand.yellowEdge', 'brand.yellow');

    const levels = getStructure(blindStructure);
    const startBB = startingBigBlinds(startingStack, blindStructure);
    const lateRegValid = lateRegLevels > 0 && lateRegLevels <= levels.length;
    const closeBB = bbAtLateRegClose(
        startingStack,
        blindStructure,
        lateRegLevels
    );

    const content = (
        <>
            <Flex
                as="button"
                type="button"
                onClick={onToggle}
                w="full"
                align="center"
                justify="space-between"
                gap={3}
                px={bare ? 0 : { base: 4, md: 6 }}
                pt={bare ? 0 : 4}
                pb={2}
                textAlign="left"
            >
                <Box minW={0}>
                    <Text fontWeight="bold" fontSize="md" color="text.primary">
                        Blind structure
                    </Text>
                    <Text fontSize="xs" color="text.muted" noOfLines={1}>
                        {templateLabel(blindStructure)} ·{' '}
                        {levelDurationMin(blindStructure)}-min levels · start{' '}
                        {startingStack.toLocaleString('en-US')} ({startBB} BB)
                        {lateRegValid
                            ? ` · late reg ends L${lateRegLevels} (~${closeBB} BB)`
                            : ''}
                    </Text>
                </Box>
                <Icon
                    as={FiChevronDown}
                    boxSize="18px"
                    color="text.muted"
                    transform={isOpen ? 'rotate(180deg)' : undefined}
                    transition="transform 150ms ease"
                    flexShrink={0}
                />
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <Box px={bare ? 0 : { base: 1, md: 2 }} pb={3}>
                    <Box
                        overflowX="auto"
                        overflowY={bare ? 'visible' : 'auto'}
                        maxH={bare ? undefined : { base: '320px', lg: '440px' }}
                        tabIndex={bare ? undefined : 0}
                        role={bare ? undefined : 'region'}
                        aria-label={
                            bare ? undefined : 'Blind structure levels'
                        }
                        sx={HIDE_X_SCROLLBAR_SX}
                    >
                        <Table
                            size="sm"
                            variant="simple"
                            width="100%"
                            sx={{
                                // Fixed layout pins the numeric columns and gives
                                // the Level column the remainder, so the late-reg
                                // ticker flex-fills it edge-to-edge (no gap) without
                                // the column growing greedily from the ticker's
                                // off-screen content width.
                                tableLayout: 'fixed',
                                'th, td': { borderColor: border, px: 2 },
                                // Sticky header only when this component owns a
                                // bounded scroll box; in bare mode it would stick
                                // to the parent (modal) scroll and overlap content.
                                ...(bare
                                    ? {}
                                    : {
                                          'thead th': {
                                              position: 'sticky',
                                              top: 0,
                                              bg: cardBg,
                                              zIndex: 1,
                                          },
                                      }),
                            }}
                        >
                            <Thead>
                                <Tr>
                                    <Th>Level</Th>
                                    <Th isNumeric w="118px">
                                        Blinds
                                    </Th>
                                    <Th isNumeric w="66px">
                                        Ante
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {levels.map((l, i) => {
                                    const isCurrent = currentLevel === l.level;
                                    const isLateClose =
                                        lateRegValid &&
                                        l.level === lateRegLevels;
                                    const blinds = `${l.sb.toLocaleString(
                                        'en-US'
                                    )}/${l.bb.toLocaleString('en-US')}`;
                                    return (
                                        <Tr
                                            key={l.level}
                                            bg={
                                                isCurrent
                                                    ? currentBg
                                                    : isLateClose
                                                      ? lateBg
                                                      : i % 2 === 1
                                                        ? zebra
                                                        : undefined
                                            }
                                        >
                                            {isLateClose ? (
                                                // Merge Level + Blinds so the ticker
                                                // flex-fills the row up to the blinds
                                                // value, which still right-aligns to
                                                // the Blinds column edge.
                                                <Td
                                                    colSpan={2}
                                                    fontWeight={
                                                        isCurrent
                                                            ? 'bold'
                                                            : 'normal'
                                                    }
                                                >
                                                    <Flex
                                                        align="center"
                                                        gap={2}
                                                        minW={0}
                                                        w="full"
                                                    >
                                                        <Text
                                                            as="span"
                                                            color="text.primary"
                                                            flexShrink={0}
                                                            sx={{
                                                                fontVariantNumeric:
                                                                    'tabular-nums',
                                                            }}
                                                        >
                                                            {l.level}
                                                        </Text>
                                                        {isCurrent && (
                                                            <Box
                                                                w="6px"
                                                                h="6px"
                                                                borderRadius="full"
                                                                bg="brand.green"
                                                                flexShrink={0}
                                                                aria-label="current level"
                                                            />
                                                        )}
                                                        <LateRegTicker
                                                            label={`Late registration closes · ~${closeBB} BB`}
                                                            color={lateText}
                                                            reduced={
                                                                prefersReducedMotion
                                                            }
                                                        />
                                                        <Text
                                                            as="span"
                                                            color="text.primary"
                                                            flexShrink={0}
                                                            sx={{
                                                                fontVariantNumeric:
                                                                    'tabular-nums',
                                                            }}
                                                        >
                                                            {blinds}
                                                        </Text>
                                                    </Flex>
                                                </Td>
                                            ) : (
                                                <>
                                                    <Td
                                                        fontWeight={
                                                            isCurrent
                                                                ? 'bold'
                                                                : 'normal'
                                                        }
                                                    >
                                                        <HStack spacing={1.5}>
                                                            <Text
                                                                as="span"
                                                                color="text.primary"
                                                                sx={{
                                                                    fontVariantNumeric:
                                                                        'tabular-nums',
                                                                }}
                                                            >
                                                                {l.level}
                                                            </Text>
                                                            {isCurrent && (
                                                                <Box
                                                                    w="6px"
                                                                    h="6px"
                                                                    borderRadius="full"
                                                                    bg="brand.green"
                                                                    aria-label="current level"
                                                                />
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                    <Td
                                                        isNumeric
                                                        color="text.primary"
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {blinds}
                                                    </Td>
                                                </>
                                            )}
                                            <Td
                                                isNumeric
                                                color="text.muted"
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {l.ante === 0
                                                    ? '—'
                                                    : l.ante.toLocaleString(
                                                          'en-US'
                                                      )}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        px={{ base: 2, md: 3 }}
                        pt={2}
                    >
                        {BLINDS_KEEP_RISING_NOTE}
                    </Text>
                </Box>
            </Collapse>
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

/**
 * Compact late-registration marker that sits to the right of the level number.
 * Scrolls right-to-left on a loop so the full phrase fits in a narrow cell;
 * pauses on hover and collapses to a static, truncated label under
 * prefers-reduced-motion. The numeric columns are never disturbed.
 */
function LateRegTicker({
    label,
    color,
    reduced,
}: {
    label: string;
    color: string;
    reduced: boolean;
}) {
    if (reduced) {
        return (
            <Text
                as="span"
                fontSize="2xs"
                fontWeight="bold"
                color={color}
                textTransform="uppercase"
                letterSpacing="0.06em"
                whiteSpace="nowrap"
                noOfLines={1}
                flex="1"
                minW={0}
                title={label}
            >
                {label}
            </Text>
        );
    }
    return (
        <Box
            overflow="hidden"
            flex="1"
            minW={0}
            sx={{
                maskImage:
                    'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
                WebkitMaskImage:
                    'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
            }}
        >
            <Flex
                as="span"
                w="max-content"
                animation={`${tickerScroll} 9s linear infinite`}
                _hover={{ animationPlayState: 'paused' }}
            >
                {[0, 1].map((copy) => (
                    <Text
                        key={copy}
                        as="span"
                        fontSize="2xs"
                        fontWeight="bold"
                        color={color}
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        whiteSpace="nowrap"
                        pr={6}
                        aria-hidden={copy === 1 ? 'true' : undefined}
                    >
                        {label}
                    </Text>
                ))}
            </Flex>
        </Box>
    );
}
