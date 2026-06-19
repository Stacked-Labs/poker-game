import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import DualBoardCommunityCards from './DualBoardCommunityCards';
import { SoundContext } from '@/app/contexts/SoundProvider';
import type { Game } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from '../Tournament/tournamentMocks';

// Card encoding mirrors the server (eval.Card): rank index in bits 8–11, suit flag in
// bits 12–15. This is the same decode the Card component uses.
const RANKS = '23456789TJQKA';
const SUITS: Record<string, number> = {
    c: 0x8000,
    d: 0x4000,
    h: 0x2000,
    s: 0x1000,
};
const card = (s: string): number => SUITS[s[1]] | (RANKS.indexOf(s[0]) << 8);
const cards = (...cs: string[]) => cs.map(card);

function makeGame(over: Partial<Game>): Game {
    return {
        running: true,
        stage: 5,
        config: { sb: 25, bb: 50, maxBuyIn: 0 },
        players: [],
        ...over,
    } as unknown as Game;
}

const noopSound = {
    play: () => undefined,
    stop: () => undefined,
    isReady: () => true,
};

function Felt({ children }: { children: React.ReactNode }) {
    return (
        <SoundContext.Provider value={noopSound}>
            <Box bg="#16321f" minH="320px" p={10} display="grid" placeItems="center">
                {children}
            </Box>
        </SoundContext.Provider>
    );
}

const meta = {
    title: 'Felt/RunItTwice/DualBoardCommunityCards',
    component: DualBoardCommunityCards,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DualBoardCommunityCards>;

export default meta;
type Story = StoryObj<typeof meta>;

// Pre-flop all-in: both boards are five fresh cards, nothing shared.
export const PreflopAllInBothBoards: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritBoard1Cards: cards('Ac', '7h', '2d', '5s', '9c'),
                    ritBoard2Cards: cards('Kc', '8h', '3d', '6s', 'Tc'),
                    ritPreExistingCards: [0, 0, 0, 0, 0],
                }),
            })}
        >
            <Felt>
                <DualBoardCommunityCards activePotIndex={null} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Flop all-in: the flop (first three) is shared across both runs; only turn+river differ.
export const FlopAllInSharedFlop: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritBoard1Cards: cards('Ah', 'Kd', '2s', '5c', '9d'),
                    ritBoard2Cards: cards('Ah', 'Kd', '2s', '7h', 'Th'),
                    ritPreExistingCards: cards('Ah', 'Kd', '2s').concat([0, 0]),
                }),
            })}
        >
            <Felt>
                <DualBoardCommunityCards activePotIndex={null} />
            </Felt>
        </MockAppStateProvider>
    ),
};
