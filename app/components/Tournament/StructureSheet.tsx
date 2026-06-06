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
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import {
    BLINDS_KEEP_RISING_NOTE,
    bbAtLateRegClose,
    getStructure,
    levelDurationMin,
    startingBigBlinds,
    templateLabel,
} from '../PublicGames/blindStructures';

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
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const currentBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.16)'
    );
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.025)'
    );
    const gold = useColorModeValue('brand.yellowDark', 'brand.yellow');

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
                <Box overflowX="auto" px={bare ? 0 : { base: 1, md: 2 }} pb={3}>
                    <Table
                        size="sm"
                        variant="simple"
                        sx={{ 'th, td': { borderColor: border } }}
                    >
                        <Thead>
                            <Tr>
                                <Th w="56px">Level</Th>
                                <Th isNumeric>Blinds</Th>
                                <Th isNumeric>Ante</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {levels.map((l, i) => {
                                const isCurrent = currentLevel === l.level;
                                const isLateClose =
                                    lateRegValid && l.level === lateRegLevels;
                                return (
                                    <Tr
                                        key={l.level}
                                        bg={
                                            isCurrent
                                                ? currentBg
                                                : i % 2 === 1
                                                  ? zebra
                                                  : undefined
                                        }
                                    >
                                        <Td
                                            fontWeight={
                                                isCurrent ? 'bold' : 'normal'
                                            }
                                            color="text.primary"
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
                                            {l.sb.toLocaleString('en-US')}/
                                            {l.bb.toLocaleString('en-US')}
                                            {isLateClose && (
                                                <Text
                                                    as="span"
                                                    ml={2}
                                                    fontSize="2xs"
                                                    fontWeight="bold"
                                                    color={gold}
                                                    textTransform="uppercase"
                                                    letterSpacing="0.05em"
                                                >
                                                    late reg ends
                                                </Text>
                                            )}
                                        </Td>
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
                                                : l.ante.toLocaleString('en-US')}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
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
