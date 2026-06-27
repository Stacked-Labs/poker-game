import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import Pot from './Pot';
import type { Game, Pot as PotType } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from '../Tournament/tournamentMocks';

// The pot bubble docks to the top-center of the felt. During a Run It Twice runout
// (ritPhase >= 2) it surfaces the per-board split (1/2 of the pot to each board, odd
// chip to board 1) plus a "Board 1 / Board 2 / Final" label tracking which board is
// currently being evaluated. These stories pin every one of those states.

function pot(over: Partial<PotType> = {}): PotType {
    return {
        topShare: 0,
        amount: 0,
        eligiblePlayerNums: [0, 1],
        winningPlayerNums: [],
        winningScore: 0,
        ...over,
    };
}

// stage 5 = past the river (where an all-in runout concludes); stage 2 is special-cased
// inside Pot to force a zero pot, so we stay clear of it.
function makeGame(over: Partial<Game>): Game {
    return {
        running: true,
        stage: 5,
        config: { sb: 25, bb: 50, maxBuyIn: 0 },
        players: [],
        ritPhase: 0,
        ...over,
    } as unknown as Game;
}

// The pot is absolutely positioned against the nearest positioned ancestor, so the inner
// box stands in for the table felt it normally lives on.
function Felt({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="#16321f" minH="220px" p={12} display="grid" placeItems="center">
            <Box
                position="relative"
                width={{ base: '280px', md: '420px' }}
                height={{ base: '150px', md: '200px' }}
                bg="rgba(0,0,0,0.25)"
                borderRadius="120px"
                border="1px solid rgba(255,255,255,0.08)"
                // The pot sizes itself in `cqw`; mirror the felt query container
                // so the isolated story renders it at a realistic size.
                sx={{ containerType: 'inline-size' }}
            >
                {children}
            </Box>
        </Box>
    );
}

const meta = {
    title: 'Felt/RunItTwice/Pot',
    component: Pot,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Pot>;

export default meta;
type Story = StoryObj<typeof meta>;

// Baseline: a normal cash pot before any runout — no split, no board label.
export const CashPotNoRunItTwice: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({ pots: [pot({ amount: 4200 })] }),
            })}
        >
            <Felt>
                <Pot activePotIndex={0} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Board 1 is being evaluated: green "Board 1" label + the per-board split. The pot is
// odd (4201) so board 1 takes the extra chip — 1/2: 2101, 2/2: 2100.
export const RunItTwiceBoard1: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritPhase: 2,
                    pots: [pot({ amount: 4201 })],
                }),
            })}
        >
            <Felt>
                <Pot activePotIndex={0} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Board 2 is being evaluated: the label flips to a blue "Board 2".
export const RunItTwiceBoard2: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritPhase: 3,
                    pots: [pot({ amount: 4201 })],
                }),
            })}
        >
            <Felt>
                <Pot activePotIndex={0} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Both boards scored: yellow "Final" label while the combined result settles.
export const RunItTwiceFinal: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritPhase: 4,
                    pots: [pot({ amount: 4201 })],
                }),
            })}
        >
            <Felt>
                <Pot activePotIndex={null} />
            </Felt>
        </MockAppStateProvider>
    ),
};

// Multiway all-in with a side pot: the main pot and SP1 chip both show their halved
// (split) amounts during the runout.
export const RunItTwiceWithSidePot: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: null,
                game: makeGame({
                    ritPhase: 2,
                    pots: [
                        pot({ amount: 6000, eligiblePlayerNums: [0, 1, 2] }),
                        pot({ amount: 2500, eligiblePlayerNums: [0, 1] }),
                    ],
                }),
            })}
        >
            <Felt>
                <Pot activePotIndex={0} />
            </Felt>
        </MockAppStateProvider>
    ),
};
