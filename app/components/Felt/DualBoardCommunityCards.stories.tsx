import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import DualBoardCommunityCards from './DualBoardCommunityCards';
import { SoundContext } from '@/app/contexts/SoundProvider';
import type { Game, Pot } from '@/app/interfaces';
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

// A pot whose single winner's best five cards are `winningHand` — DualBoard reads this
// to highlight the matching board cards.
function potWithWinningHand(hand: number[]): Pot {
    return {
        topShare: 0,
        amount: 200,
        eligiblePlayerNums: [0, 1],
        winningPlayerNums: [0],
        winningScore: 0,
        winners: [{ playerNum: 0, uuid: 'w', share: 200, winningHand: hand }],
    };
}

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

// `dims` lets each story pin a realistic felt envelope. The center community strip is
// short, so the two stacked boards must fit a constrained height — these frames expose
// whether they do.
function Felt({
    children,
    w = '520px',
    h = '320px',
}: {
    children: React.ReactNode;
    w?: string;
    h?: string;
}) {
    return (
        <SoundContext.Provider value={noopSound}>
            <Box
                bg="#16321f"
                minH="100vh"
                p={4}
                display="grid"
                placeItems="center"
            >
                <Box
                    width={w}
                    maxW="100%"
                    height={h}
                    bg="rgba(0,0,0,0.18)"
                    borderRadius="24px"
                    border="1px solid rgba(255,255,255,0.08)"
                    display="grid"
                    placeItems="center"
                    overflow="visible"
                >
                    {children}
                </Box>
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

// Showdown: each board's winning five are highlighted — the split outcome at a glance.
export const WinnerHighlightBothBoards: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritBoard1Cards: cards('Ac', '7h', '2d', '5s', '9c'),
                    ritBoard2Cards: cards('Kc', '8h', '3d', '6s', 'Tc'),
                    ritPreExistingCards: [0, 0, 0, 0, 0],
                    ritBoard1Pots: [
                        potWithWinningHand(cards('Ac', 'As', 'Ad', '9c', '7h')),
                    ],
                    ritBoard2Pots: [
                        potWithWinningHand(cards('Kc', 'Kh', 'Kd', 'Tc', '8h')),
                    ],
                }),
            })}
        >
            <Felt>
                <DualBoardCommunityCards activePotIndex={0} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Phone-width, short felt: the tightest space — the overlapped pair must stay readable.
export const TightPortraitFelt: Story = {
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
            <Felt w="340px" h="190px">
                <DualBoardCommunityCards activePotIndex={null} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Wide but vertically tight (landscape phone / short desktop felt band).
export const ShortLandscapeFelt: Story = {
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
            <Felt w="720px" h="150px">
                <DualBoardCommunityCards activePotIndex={null} />
            </Felt>
        </MockAppStateProvider>
    ),
};
