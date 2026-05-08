'use client';

import { Box, HStack } from '@chakra-ui/react';
import type { StakeFilter as StakeFilterValue } from './types';

const stakeOptions: { value: StakeFilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'micro', label: 'Micro' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
];

interface StakeFilterProps {
    stake: StakeFilterValue;
    onStakeChange: (s: StakeFilterValue) => void;
    disabled?: boolean;
}

export default function StakeFilter({ stake, onStakeChange, disabled = false }: StakeFilterProps) {
    return (
        <HStack
            spacing={1}
            bg="card.white"
            borderRadius="full"
            p={1}
            boxShadow="card.lift"
            opacity={disabled ? 0.4 : 1}
            pointerEvents={disabled ? 'none' : 'auto'}
            aria-disabled={disabled}
        >
            {stakeOptions.map((option) => {
                const active = stake === option.value;
                return (
                    <Box
                        key={option.value}
                        as="button"
                        onClick={() => onStakeChange(option.value)}
                        aria-pressed={active}
                        px={4}
                        h="32px"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        bg={active ? 'card.lightGray' : 'transparent'}
                        color={active ? 'text.primary' : 'text.secondary'}
                        _hover={{ color: 'text.primary' }}
                        _focusVisible={{ boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)' }}
                        transition="all 0.15s ease"
                    >
                        {option.label}
                    </Box>
                );
            })}
        </HStack>
    );
}
