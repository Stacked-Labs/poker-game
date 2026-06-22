import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import RunItTwiceWaiting from './RunItTwiceWaiting';
import type { Game, Player } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from '../Tournament/tournamentMocks';

function player(uuid: string, position: number): Player {
    return {
        uuid,
        username: `P${position}`,
        address: uuid,
        position,
        seatID: position + 1,
        ready: true,
        in: true,
        called: false,
        left: false,
        totalBuyIn: 500,
        stack: 0,
        bet: 0,
        totalBet: 500,
        cards: [],
    } as unknown as Player;
}

// The viewer here is a spectator/folded player ("me" is NOT among the eligible voters),
// so they see the passive waiting banner rather than the actionable prompt.
function makeGame(over: Partial<Game>): Game {
    return {
        running: true,
        stage: 2,
        config: { sb: 25, bb: 50, maxBuyIn: 0 },
        players: [player('p0', 0), player('p1', 1)],
        ritPhase: 1,
        ritEligiblePlayers: [0, 1],
        ritVotes: { 0: true, 1: null },
        ritVoteDeadline: Date.now() + 7_000,
        ...over,
    } as unknown as Game;
}

function Felt({ children }: { children: React.ReactNode }) {
    return (
        <Box
            bg="#16321f"
            minH="220px"
            p={10}
            position="relative"
            display="grid"
            placeItems="center"
        >
            {children}
        </Box>
    );
}

const meta = {
    title: 'Felt/RunItTwice/RunItTwiceWaiting',
    component: RunItTwiceWaiting,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RunItTwiceWaiting>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpectatorWaitingOnVote: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                clientID: 'spectator', // not a seated eligible voter
                tournamentLive: null,
                game: makeGame({}),
            })}
        >
            <Felt>
                <RunItTwiceWaiting />
            </Felt>
        </MockAppStateProvider>
    ),
};
