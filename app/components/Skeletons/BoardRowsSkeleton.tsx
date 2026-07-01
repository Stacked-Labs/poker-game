'use client';

import { Box, Flex, Skeleton, Spacer, VStack } from '@chakra-ui/react';
import { useWarmSkeleton } from './useWarmSkeleton';

// Row-silhouette loader for the Stats Hub boards. Mirrors BoardRow's rhythm
// (rank · avatar · name · stat) at the same padding/height so real rows drop in
// without a layout jump (CLS-safe), replacing the bare centered spinner.
const NAME_WIDTHS = ['58%', '44%', '66%', '38%', '52%', '48%', '60%', '42%'];

export default function BoardRowsSkeleton({ rows = 6 }: { rows?: number }) {
    const sk = useWarmSkeleton();
    return (
        <VStack
            spacing={1}
            align="stretch"
            aria-busy="true"
            aria-label="Loading board"
        >
            {Array.from({ length: rows }).map((_, i) => (
                <Flex
                    key={i}
                    align="center"
                    py={{ base: 2.5, md: 3 }}
                    px={{ base: 3, md: 4 }}
                >
                    {/* Fixed 44px slot pins the avatar's left edge exactly where
                        BoardRow's w="44px" rank puts it — no horizontal nudge on load. */}
                    <Box w="44px" flexShrink={0}>
                        <Skeleton h="14px" w="22px" borderRadius="md" {...sk} />
                    </Box>
                    <Skeleton
                        boxSize={{ base: '28px', md: '32px' }}
                        borderRadius="full"
                        flexShrink={0}
                        {...sk}
                    />
                    <Skeleton
                        h="12px"
                        w={NAME_WIDTHS[i % NAME_WIDTHS.length]}
                        maxW="220px"
                        borderRadius="md"
                        ml={{ base: 2, md: 3 }}
                        {...sk}
                    />
                    <Spacer />
                    <Skeleton
                        h="14px"
                        w={{ base: '44px', md: '56px' }}
                        borderRadius="md"
                        flexShrink={0}
                        {...sk}
                    />
                </Flex>
            ))}
        </VStack>
    );
}
