'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import type {
    PublicGame,
    FilterValue,
    StakeFilter as StakeFilterValue,
    SortKey,
    SortConfig,
} from './types';
import PublicGameCard from './PublicGameCard';
import FilterBar from './FilterBar';
import StakeFilter from './StakeFilter';
import SortHeader from './SortHeader';

interface PublicGamesGridProps {
    games: PublicGame[];
    totalCount: number;
    filter: FilterValue;
    onFilterChange: (f: FilterValue) => void;
    stake: StakeFilterValue;
    onStakeChange: (s: StakeFilterValue) => void;
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export default function PublicGamesGrid({
    games,
    totalCount,
    filter,
    onFilterChange,
    stake,
    onStakeChange,
    sortConfig,
    onSortChange,
    hasMore,
    isLoadingMore,
    onLoadMore,
}: PublicGamesGridProps) {
    const ruleColor = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.06)');
    const dividerColor = useColorModeValue('rgba(11, 20, 48, 0.12)', 'rgba(255, 255, 255, 0.12)');
    const stakeDisabled = filter === 'free';

    return (
        <Flex direction="column" w="full" gap={{ base: 5, md: 6 }}>
            {/* Filter rail — count + market + stake */}
            <Flex
                w="full"
                gap={3}
                align={{ base: 'stretch', md: 'center' }}
                justify="space-between"
                wrap="wrap"
            >
                <Text fontSize="sm" color="text.secondary">
                    {totalCount} {totalCount === 1 ? 'table' : 'tables'} live
                </Text>
                <HStack spacing={3} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
                    <FilterBar filter={filter} onFilterChange={onFilterChange} />
                    <Box w="1px" h="20px" bg={dividerColor} display={{ base: 'none', md: 'block' }} />
                    <StakeFilter stake={stake} onStakeChange={onStakeChange} disabled={stakeDisabled} />
                </HStack>
            </Flex>

            {/* List panel */}
            <Box
                bg="card.white"
                borderRadius="20px"
                boxShadow="card.lift"
                overflow="hidden"
            >
                <SortHeader sortConfig={sortConfig} onSortChange={onSortChange} ruleColor={ruleColor} />
                {games.map((g, i) => (
                    <PublicGameCard
                        key={g.name}
                        game={g}
                        ruleColor={ruleColor}
                        isLast={i === games.length - 1}
                    />
                ))}
            </Box>

            {hasMore && (
                <Flex justify="center">
                    <Button
                        variant="ghost"
                        size="sm"
                        color="text.secondary"
                        isLoading={isLoadingMore}
                        loadingText="Loading…"
                        onClick={onLoadMore}
                    >
                        Load more tables
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
