'use client';
import React, { useMemo } from 'react';
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { breakdownChips, ChipColumn } from '@/app/lib/takeSeat/chipBreakdown';

interface ChipStackVisualizerProps {
    chips: number;
    bb: number;
    isInsufficient?: boolean;
    orientation?: 'vertical' | 'horizontal';
}

const CHIP_FILL: Record<ChipColumn['color'], string> = {
    white: 'white',
    red: '#D84A4A',
    green: 'brand.green',
    black: 'brand.darkNavy',
    purple: '#7C5BD1',
};

const chipIn = keyframes`
    from { transform: scaleX(0.55) translateY(-4px); opacity: 0; }
    to   { transform: scaleX(1) translateY(0); opacity: 1; }
`;

const ChipDisc: React.FC<{
    color: ChipColumn['color'];
    stripe: string;
    index: number;
}> = ({ color, stripe, index }) => (
    <Box
        w="38px"
        h="8px"
        borderRadius="full"
        bg={CHIP_FILL[color]}
        border="1.5px dashed"
        borderColor={stripe}
        boxShadow="0 1px 1px rgba(0,0,0,0.25)"
        mt="-2.5px"
        _first={{ mt: 0 }}
        animation={`${chipIn} 0.2s ease-out both`}
        style={{ animationDelay: `${index * 15}ms` }}
    />
);

const EmptyStack = () => (
    <Flex
        minH="64px"
        align="center"
        justify="center"
        w="100%"
        opacity={0.3}
    >
        <VStack spacing={0} align="center">
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    w="38px"
                    h="8px"
                    borderRadius="full"
                    bg="transparent"
                    border="1.5px dashed"
                    borderColor="text.muted"
                    mt={i === 0 ? 0 : '-2.5px'}
                />
            ))}
        </VStack>
    </Flex>
);

const ChipStackVisualizer: React.FC<ChipStackVisualizerProps> = ({
    chips,
    bb,
    isInsufficient = false,
    orientation = 'horizontal',
}) => {
    const columns = useMemo(() => breakdownChips(chips, bb), [chips, bb]);

    if (columns.length === 0) {
        return <EmptyStack />;
    }

    return (
        <Box
            w="100%"
            filter={isInsufficient ? 'grayscale(1)' : 'none'}
            opacity={isInsufficient ? 0.55 : 1}
            transition="filter 0.2s ease, opacity 0.2s ease"
        >
            <HStack
                spacing={orientation === 'horizontal' ? 2.5 : 3}
                align="flex-end"
                justify="center"
                minH="64px"
            >
                {columns.map((col) => (
                    <VStack key={col.denom} spacing={0} align="center">
                        {col.count > col.visible && (
                            <Text
                                fontSize="9px"
                                fontWeight="bold"
                                color="text.muted"
                                mb="2px"
                                letterSpacing="0.04em"
                            >
                                ×{col.count.toLocaleString('en-US')}
                            </Text>
                        )}
                        <VStack
                            spacing={0}
                            align="center"
                            sx={{ transformOrigin: 'bottom center' }}
                        >
                            {Array.from({ length: col.visible })
                                .map((_, i) => col.visible - 1 - i)
                                .map((i) => (
                                    <ChipDisc
                                        key={`${col.denom}-${i}-${col.count}`}
                                        color={col.color}
                                        stripe={col.stripe}
                                        index={i}
                                    />
                                ))}
                        </VStack>
                    </VStack>
                ))}
            </HStack>
        </Box>
    );
};

export default ChipStackVisualizer;
