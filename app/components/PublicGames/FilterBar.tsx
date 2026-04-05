'use client';

import { HStack, Button } from '@chakra-ui/react';
import type { FilterValue } from './types';

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const filterOptions: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'free', label: 'Free' },
];

interface FilterBarProps {
    filter: FilterValue;
    onFilterChange: (f: FilterValue) => void;
}

export default function FilterBar({ filter, onFilterChange }: FilterBarProps) {
    return (
        <HStack
            spacing={1}
            bg="rgba(12, 21, 49, 0.04)"
            borderRadius="full"
            p={1}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(8px)"
            _dark={{
                bg: 'rgba(255, 255, 255, 0.06)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
        >
            {filterOptions.map((option) => {
                const isActive = filter === option.value;
                return (
                    <Button
                        key={option.value}
                        variant="unstyled"
                        px={3}
                        h="28px"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color={isActive ? 'text.primary' : 'text.secondary'}
                        bg={isActive ? 'card.white' : 'transparent'}
                        boxShadow={isActive ? 'glass' : 'none'}
                        _hover={{
                            bg: isActive ? 'card.white' : 'rgba(12, 21, 49, 0.06)',
                            color: 'text.primary',
                        }}
                        _focusVisible={{
                            boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.3)',
                        }}
                        _dark={{
                            color: isActive ? 'text.white' : 'text.secondary',
                            bg: isActive ? 'legacy.grayLight' : 'transparent',
                            boxShadow: isActive ? 'glass' : 'none',
                            _hover: {
                                bg: isActive ? 'legacy.grayLight' : 'rgba(255, 255, 255, 0.08)',
                                color: 'text.white',
                            },
                            _focusVisible: {
                                boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.45)',
                            },
                        }}
                        onClick={() => onFilterChange(option.value)}
                        aria-pressed={isActive}
                        transition={TRANSITION}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </HStack>
    );
}
