'use client';

import { Box, HStack, Text } from '@chakra-ui/react';

// Table state as a real pill: color + dot-shape + text. Replaces the old
// color-only status dot and carries the accessible "LIVE"/"OPEN" name now that
// the row meta line no longer spells the state out.
export default function StatePill({ active }: { active: boolean }) {
    if (active) {
        return (
            <HStack
                as="span"
                spacing={1}
                pl={1.5}
                pr={2}
                h="20px"
                minW="50px"
                borderRadius="full"
                bg="bg.greenTint"
                flexShrink={0}
            >
                <Box w="6px" h="6px" borderRadius="full" bg="brand.green" aria-hidden />
                <Text
                    as="span"
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.06em"
                    lineHeight="1"
                    color="brand.greenEdge"
                    _dark={{ color: '#5CCBA0' }}
                >
                    LIVE
                </Text>
            </HStack>
        );
    }
    return (
        <HStack
            as="span"
            spacing={1}
            pl={1.5}
            pr={2}
            h="20px"
            minW="50px"
            borderRadius="full"
            bg="bg.yellowTint"
            flexShrink={0}
        >
            <Box
                w="7px"
                h="7px"
                borderRadius="full"
                border="2px solid"
                borderColor="brand.yellow"
                aria-hidden
            />
            <Text
                as="span"
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.06em"
                lineHeight="1"
                color="brand.yellowEdge"
                _dark={{ color: 'brand.yellow' }}
            >
                OPEN
            </Text>
        </HStack>
    );
}
