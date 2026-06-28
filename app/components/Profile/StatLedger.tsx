'use client';

import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import TooltipOrPopover from '../TooltipOrPopover';

export interface StatItem {
    key: string;
    label: string;
    value: string;
    icon: IconType;
    tooltip: string;
    /** Podium finish (1st–3rd) — the one warm focal accent. */
    podium?: boolean;
    /** Headline stat — rendered larger for intra-ledger hierarchy. */
    headline?: boolean;
}

export interface StatLedgerProps {
    stats: StatItem[];
    title?: string;
}

function StatCell({ s }: { s: StatItem }) {
    return (
        <TooltipOrPopover label={s.tooltip} aria-label={s.label}>
            <VStack
                align="start"
                spacing={0.5}
                p={2.5}
                w="full"
                borderRadius="12px"
                bg={s.podium ? 'bg.yellowTint' : 'transparent'}
                border="1px solid"
                borderColor={s.podium ? 'border.yellowSubtle' : 'transparent'}
                transition="background-color 0.15s ease"
                _hover={{ bg: s.podium ? 'bg.yellowTint' : 'bg.pillNeutral' }}
            >
                <HStack spacing={1.5} align="center">
                    <Box
                        as={s.icon}
                        color={s.podium ? 'brand.yellowDark' : 'text.muted'}
                        _dark={s.podium ? { color: 'brand.yellow' } : undefined}
                        boxSize="13px"
                        flexShrink={0}
                        aria-hidden
                    />
                    <Text
                        fontSize={s.headline ? { base: 'xl', md: '2xl' } : 'lg'}
                        fontWeight={800}
                        lineHeight={1.1}
                        color={s.podium ? 'brand.yellowDark' : 'text.primary'}
                        _dark={s.podium ? { color: 'brand.yellow' } : undefined}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {s.value}
                    </Text>
                </HStack>
                <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    color="text.muted"
                >
                    {s.label}
                </Text>
            </VStack>
        </TooltipOrPopover>
    );
}

// The play record: an iconified, tooltipped, hierarchical stat ledger (not a flat fintech
// wall). Headline stats render larger; podium best-finish carries the one warm focal accent.
// Tonal/hairline panel (border.felt, no shadow) so the hero stays the one elevated object.
export default function StatLedger({ stats, title = 'Play record' }: StatLedgerProps) {
    if (stats.length === 0) return null;

    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
            h="full"
        >
            <Text
                as="h2"
                fontSize="xs"
                fontWeight={700}
                letterSpacing="0.04em"
                textTransform="uppercase"
                color="text.muted"
                mb={3}
            >
                {title}
            </Text>
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacingX={3} spacingY={1}>
                {stats.map((s) => (
                    <StatCell key={s.key} s={s} />
                ))}
            </SimpleGrid>
        </Box>
    );
}
