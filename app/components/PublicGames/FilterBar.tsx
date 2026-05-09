'use client';

import { Box, HStack } from '@chakra-ui/react';
import type { FilterValue } from './types';

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
            bg="card.white"
            borderRadius="full"
            p={1}
            boxShadow="card.lift"
        >
            {filterOptions.map((option) => {
                const active = filter === option.value;
                return (
                    <Box
                        key={option.value}
                        as="button"
                        onClick={() => onFilterChange(option.value)}
                        aria-pressed={active}
                        px={{ base: 3.5, md: 4 }}
                        h={{ base: '36px', md: '32px' }}
                        minW={{ base: '52px', md: 'auto' }}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        bg={active ? 'card.lightGray' : 'transparent'}
                        color={active ? 'text.primary' : 'text.secondary'}
                        boxShadow={
                            active
                                ? 'inset 0 1px 0 rgba(255,255,255,0.50)'
                                : 'none'
                        }
                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease"
                        _hover={{
                            bg: active ? 'card.lightGray' : 'rgba(0,0,0,0.04)',
                            color: 'text.primary',
                        }}
                        _active={{
                            bg: active ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.06)',
                            transform: 'translateY(1px)',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)',
                        }}
                        _focusVisible={{ boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)' }}
                        _dark={{
                            _hover: {
                                bg: active
                                    ? 'card.lightGray'
                                    : 'rgba(255,255,255,0.06)',
                                color: 'white',
                            },
                            _active: {
                                bg: active
                                    ? 'rgba(0,0,0,0.20)'
                                    : 'rgba(0,0,0,0.16)',
                                transform: 'translateY(1px)',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.20)',
                            },
                        }}
                    >
                        {option.label}
                    </Box>
                );
            })}
        </HStack>
    );
}
