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
            gap={{ base: 2, md: 3 }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            wrap="wrap"
            minH="44px"
        >
            <Text fontSize="sm" color="text.secondary">
                {countLabel}
            </Text>
            <HStack
                spacing={{ base: 2, md: 3 }}
                wrap={{ base: 'nowrap', md: 'wrap' }}
                justify={{ base: 'flex-start', md: 'flex-end' }}
                w={{ base: 'full', md: 'auto' }}
                overflowX={{ base: 'auto', md: 'visible' }}
                sx={{
                    '::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                <FilterBar filter={filter} onFilterChange={onFilterChange} />
                <Box w="1px" h="20px" bg={dividerColor} flexShrink={0} />
                <StakeFilter stake={stake} onStakeChange={onStakeChange} disabled={stakeDisabled} />
            </HStack>
        </Flex>
    );
}
