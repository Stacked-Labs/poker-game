'use client';

import {
    Box,
    Button,
    Flex,
    useColorModeValue,
} from '@chakra-ui/react';
import type {
    PublicGame,
    SortKey,
    SortConfig,
} from './types';
import PublicGameCard from './PublicGameCard';
import SortHeader from './SortHeader';

interface PublicGamesGridProps {
    games: PublicGame[];
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export default function PublicGamesGrid({
    games,
    sortConfig,
    onSortChange,
    hasMore,
    isLoadingMore,
    onLoadMore,
}: PublicGamesGridProps) {
    const ruleColor = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.06)');

    return (
        <Flex direction="column" w="full" gap={{ base: 5, md: 6 }}>
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
                        variant="unstyled"
                        onClick={onLoadMore}
                        isLoading={isLoadingMore}
                        loadingText="Loading…"
                        bg="card.white"
                        color="text.primary"
                        boxShadow="card.lift"
                        borderRadius="full"
                        h="36px"
                        px={6}
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease"
                        _hover={{
                            color: 'brand.green',
                            bg: 'bg.greenSubtle',
                        }}
                        _active={{
                            color: 'brand.greenDark',
                            bg: 'bg.greenTint',
                            transform: 'translateY(1px)',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)',
                        }}
                        _focusVisible={{ boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)' }}
                    >
                        Load more tables
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
