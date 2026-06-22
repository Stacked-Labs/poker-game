'use client';

import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import type { PublicGame, SortKey, SortConfig } from './types';
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

// The list body of the lobby panel: the desktop column header, the rows, and a
// Load-More footer. The enclosing panel (page.tsx) owns the card chrome + the
// docked filter rail, so this renders flush inside it.
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
        <Box w="full">
            <SortHeader sortConfig={sortConfig} onSortChange={onSortChange} ruleColor={ruleColor} />
            {games.map((g, i) => (
                <PublicGameCard
                    key={g.name}
                    game={g}
                    ruleColor={ruleColor}
                    isLast={i === games.length - 1}
                />
            ))}

            {hasMore && (
                <Box borderTop="1px solid" borderColor={ruleColor}>
                    <Button
                        variant="unstyled"
                        onClick={onLoadMore}
                        isLoading={isLoadingMore}
                        loadingText="Loading…"
                        w="full"
                        h="48px"
                        borderRadius={0}
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color="text.secondary"
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="background-color 120ms ease, color 120ms ease"
                        _hover={{ color: 'brand.green', bg: 'bg.greenSubtle' }}
                        _active={{ color: 'brand.greenDark', bg: 'bg.greenTint' }}
                        _focusVisible={{ boxShadow: 'focus.ring' }}
                    >
                        Load more tables
                    </Button>
                </Box>
            )}
        </Box>
    );
}
