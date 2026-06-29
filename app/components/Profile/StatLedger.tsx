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
    /** Money figure (tournament cash) — rendered in USDC blue. */
    usdc?: boolean;
}

export interface StatLedgerProps {
    stats: StatItem[];
}

// The play record as one divided row at the foot of the profile hero card: value-forward cells
// with hairline dividers on desktop, collapsing to a 3-up grid on mobile. No card of its own —
// the hero stays the single elevated object.
export default function StatLedger({ stats }: StatLedgerProps) {
    if (stats.length === 0) return null;

    return (
        <SimpleGrid
            columns={{ base: 3, md: stats.length }}
            spacingX={{ base: 3, md: 0 }}
            spacingY={4}
        >
            {stats.map((s, i) => (
                <Box
                    key={s.key}
                    minW={0}
                    pl={{ md: i === 0 ? 0 : 4 }}
                    pr={{ md: 4 }}
                    borderLeft={{ base: 'none', md: i === 0 ? 'none' : '1px solid' }}
                    borderColor="border.lightGray"
                >
                    <TooltipOrPopover label={s.tooltip} aria-label={s.label}>
                        <VStack align="start" spacing={0.5} cursor="default" minW={0}>
                            <Text
                                fontSize={{ base: 'lg', md: 'xl' }}
                                fontWeight={800}
                                lineHeight={1.1}
                                color={s.usdc ? 'text.usdc' : 'text.primary'}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                                noOfLines={1}
                                maxW="full"
                            >
                                {s.value}
                            </Text>
                            <HStack spacing={1} minW={0} maxW="full">
                                <Box
                                    as={s.icon}
                                    boxSize="10px"
                                    color="text.muted"
                                    flexShrink={0}
                                    aria-hidden
                                />
                                <Text
                                    fontSize="2xs"
                                    fontWeight={700}
                                    letterSpacing="0.04em"
                                    textTransform="uppercase"
                                    color="text.muted"
                                    noOfLines={1}
                                >
                                    {s.label}
                                </Text>
                            </HStack>
                        </VStack>
                    </TooltipOrPopover>
                </Box>
            ))}
        </SimpleGrid>
    );
}
