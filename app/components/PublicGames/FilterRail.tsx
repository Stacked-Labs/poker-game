'use client';

import { Box, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import FilterBar from './FilterBar';
import StakeFilter from './StakeFilter';
import type { FilterValue, StakeFilter as StakeFilterValue } from './types';

interface FilterRailProps {
    totalCount: number | null;
    filter: FilterValue;
    onFilterChange: (f: FilterValue) => void;
    stake: StakeFilterValue;
    onStakeChange: (s: StakeFilterValue) => void;
}

export default function FilterRail({
    totalCount,
    filter,
    onFilterChange,
    stake,
    onStakeChange,
}: FilterRailProps) {
    const dividerColor = useColorModeValue('rgba(11, 20, 48, 0.12)', 'rgba(255, 255, 255, 0.12)');
    const stakeDisabled = filter === 'free';

    const countLabel =
        totalCount === null
            ? 'Loading tables…'
            : `${totalCount} ${totalCount === 1 ? 'table' : 'tables'} live`;

    return (
        <Flex
            w="full"
            gap={3}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            wrap="wrap"
            minH="44px"
        >
            <Text fontSize="sm" color="text.secondary">
                {countLabel}
            </Text>
            <HStack spacing={3} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
                <FilterBar filter={filter} onFilterChange={onFilterChange} />
                <Box w="1px" h="20px" bg={dividerColor} display={{ base: 'none', md: 'block' }} />
                <StakeFilter stake={stake} onStakeChange={onStakeChange} disabled={stakeDisabled} />
            </HStack>
        </Flex>
    );
}
