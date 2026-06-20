import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import RunItTwicePrompt from './RunItTwicePrompt';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { Game, Player } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from './Tournament/tournamentMocks';

function player(uuid: string, position: number, username: string): Player {
    return {
        uuid,
        username,
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

function makeVotingGame(over: Partial<Game>): Game {
    return {
        running: true,
        stage: 2,
        config: { sb: 25, bb: 50, maxBuyIn: 0 },
        players: [player('me', 0, 'You'), player('opp', 1, 'Villain')],
        ritPhase: 1,
        ritEligiblePlayers: [0, 1],
        ritVotes: { 0: null, 1: null },
        ritVoteDeadline: Date.now() + 8_000,
        ...over,
    } as unknown as Game;
}

// A truthy socket stub keeps the buttons enabled; clicks are no-ops in the story.
const socketStub = { readyState: 1, send: () => undefined } as unknown as WebSocket;

// Mimics the real footer slot: felt above, a transparent bottom action bar that is the
// container-query context the ActionButtons size against, content right-aligned.
function Frame({ children }: { children: React.ReactNode }) {
    return (
        <SocketContext.Provider value={socketStub}>
            <Box position="relative" minH="320px" bg="#1c4a33" overflow="hidden">
                <Box
                    position="absolute"
                    bottom="10px"
                    left={0}
                    right={0}
                    h="78px"
                    px={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    bg="rgba(8,14,30,0.55)"
                    sx={{ containerType: 'inline-size' }}
                >
                    {children}
                </Box>
            </Box>
        </SocketContext.Provider>
    );
}

const meta = {
    title: 'Felt/RunItTwice/RunItTwicePrompt',
    component: RunItTwicePrompt,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RunItTwicePrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

// Fresh vote: neither player has chosen yet.
export const NobodyVotedYet: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({ tournamentLive: null, game: makeVotingGame({}) })}
        >
            <Frame>
                <RunItTwicePrompt />
            </Frame>
        </MockAppStateProvider>
    ),
};

// Local player has voted; we're waiting on the villain (buttons disabled, status shown).
export const WaitingOnOpponent: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeVotingGame({ ritVotes: { 0: true, 1: null } }),
            })}
        >
            <Frame>
                <RunItTwicePrompt />
            </Frame>
        </MockAppStateProvider>
    ),
};
