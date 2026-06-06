import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import GameConfigWatermark from './GameConfigWatermark';
import type { Game } from '@/app/interfaces';
import {
    MockAppStateProvider,
    makeTournamentLive,
    makeTournamentMeta,
    mockAppState,
} from '../Tournament/tournamentMocks';

// The watermark is absolutely positioned just above its parent's top edge, so we
// give it a tall letterbox-colored stage (matching where it sits at the table).
function Stage({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="bg.letterbox" minH="320px" p={6}>
            <Box
                position="relative"
                mt="200px"
                mx="auto"
                maxW="640px"
                h="56px"
            >
                {children}
            </Box>
        </Box>
    );
}

const meta = {
    title: 'Tournament/InTable/GameConfigWatermark',
    component: GameConfigWatermark,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GameConfigWatermark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RealMoneyTournament: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState()}>
            <Stage>
                <GameConfigWatermark />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const FreePlayTournament: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    meta: makeTournamentMeta({
                        name: 'Free Play Warmup',
                        isFreePlay: true,
                        chain: undefined,
                        contractAddress: undefined,
                        buyInUsdc: 0,
                    }),
                }),
            })}
        >
            <Stage>
                <GameConfigWatermark />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const EarlyLevelNoAnte: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    clock: {
                        level: 1,
                        levelNumber: 1,
                        sb: 25,
                        bb: 50,
                        ante: 0,
                        remainingMs: 9 * 60_000,
                        totalMs: 10 * 60_000,
                        receivedAt: 0,
                    },
                    playersActive: 118,
                }),
            })}
        >
            <Stage>
                <GameConfigWatermark />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Regression: cash tables must keep the original "NLH - sb/bb · Max Buy-In" line.
export const CashTable: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                table: 'abc',
                game: {
                    config: {
                        sb: 1,
                        bb: 2,
                        maxBuyIn: 200,
                        crypto: true,
                        chain: 'base',
                        ownerAddress:
                            '0x1234567890abcdef1234567890abcdef12345678',
                    },
                } as unknown as Game,
            })}
        >
            <Stage>
                <GameConfigWatermark />
            </Stage>
        </MockAppStateProvider>
    ),
};
