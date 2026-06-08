import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex } from '@chakra-ui/react';
import AnteChip from './AnteChip';
import type { Game } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from '../Tournament/tournamentMocks';

// Minimal game stub — AnteChip only reads running / stage / config.tournament.ante
// (and config.bb/crypto via useFormatAmount).
function makeGame(over: {
    running?: boolean;
    stage?: number;
    ante?: number;
    tournament?: boolean;
}): Game {
    const { running = true, stage = 2, ante = 100, tournament = true } = over;
    return {
        running,
        stage,
        config: {
            sb: 50,
            bb: 100,
            maxBuyIn: 0,
            tournament: tournament
                ? { tournamentId: 'tournament-7', ante }
                : null,
        },
    } as unknown as Game;
}

// A felt-coloured board with five faint card slots, so the chip is shown where it
// actually lands at the table — centered over the community-card row, preflop.
function Board({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="#16321f" minH="240px" p={10} display="grid" placeItems="center">
            <Flex position="relative" gap={2} align="center">
                {[0, 1, 2, 3, 4].map((i) => (
                    <Box
                        key={i}
                        w={{ base: '40px', md: '52px' }}
                        h={{ base: '56px', md: '72px' }}
                        borderRadius="6px"
                        border="1.5px dashed"
                        borderColor="whiteAlpha.300"
                        bg="whiteAlpha.50"
                    />
                ))}
                {children}
            </Flex>
        </Box>
    );
}

const meta = {
    title: 'Tournament/InTable/AnteChip',
    component: AnteChip,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AnteChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PreflopWithAnte: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState({ game: makeGame({ ante: 100 }) })}>
            <Board>
                <AnteChip />
            </Board>
        </MockAppStateProvider>
    ),
};

export const DeepLevelLargeAnte: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({ game: makeGame({ ante: 24000 }) })}
        >
            <Board>
                <AnteChip />
            </Board>
        </MockAppStateProvider>
    ),
};

// Level 1 (and DeepStack level 2) carry a 0 ante — the chip must not render.
export const EarlyLevelNoAnte: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState({ game: makeGame({ ante: 0 }) })}>
            <Board>
                <AnteChip />
            </Board>
        </MockAppStateProvider>
    ),
};

// Postflop the pot pill already includes the ante — the chip steps aside.
export const PostflopHidden: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({ game: makeGame({ stage: 3, ante: 100 }) })}
        >
            <Board>
                <AnteChip />
            </Board>
        </MockAppStateProvider>
    ),
};

// Cash tables have no tournament config — nothing renders.
export const CashTableHidden: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({ tournament: false }),
            })}
        >
            <Board>
                <AnteChip />
            </Board>
        </MockAppStateProvider>
    ),
};
