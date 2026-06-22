import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import GameLog from './GameLog';
import { GameEventsContext } from '@/app/contexts/GameEventsProvider';
import type { GameEventRecord } from '@/app/interfaces';
import {
    MockAppStateProvider,
    mockAppState,
} from '../../Tournament/tournamentMocks';

// GameLog is the table activity feed (added in the Run It Twice PR). It renders one row
// per game event, including the RIT-specific `run_it_twice_board` row that breaks down each
// board's winners. These stories cover the populated feed plus the loading / empty /
// unauthorized states the component renders on its own.

function evt(id: number, over: Partial<GameEventRecord>): GameEventRecord {
    return {
        id,
        table_id: 1,
        hand_id: 42,
        player_uuid: '',
        player_name: '',
        event_type: 'check',
        event_category: 'action',
        amount: null,
        sequence_num: id,
        timestamp: `2026-06-19T20:${String(10 + id).padStart(2, '0')}:00Z`,
        metadata: {},
        ...over,
    };
}

const POPULATED_EVENTS: GameEventRecord[] = [
    evt(1, {
        event_type: 'player_joined',
        event_category: 'meta_event',
        player_name: 'Villain',
        metadata: { seat_id: 2, buy_in: 5000 },
    }),
    evt(2, {
        event_type: 'hand_started',
        event_category: 'game_event',
        metadata: {
            hand_number: 42,
            sb_amount: 25,
            bb_amount: 50,
            dealer: 'Stacks',
            sb_player: 'You',
            bb_player: 'Villain',
        },
    }),
    evt(3, {
        event_type: 'cards_dealt',
        event_category: 'game_event',
        metadata: { my_cards: ['Ah', 'As'] },
    }),
    evt(4, {
        event_type: 'raise',
        event_category: 'action',
        player_name: 'Villain',
        amount: 300,
    }),
    evt(5, {
        event_type: 'call',
        event_category: 'action',
        player_name: 'You',
        amount: 300,
    }),
    evt(6, {
        event_type: 'all_in',
        event_category: 'action',
        player_name: 'Villain',
        amount: 5000,
    }),
    evt(7, {
        event_type: 'all_in',
        event_category: 'action',
        player_name: 'You',
        amount: 4800,
    }),
    // The two RIT board rows — the headline reason this component matters to the PR.
    evt(8, {
        event_type: 'run_it_twice_board',
        event_category: 'game_event',
        metadata: {
            board_num: 1,
            board_cards: ['Ac', '7h', '2d', '5s', '9c'],
            pots: [
                {
                    pot_number: 0,
                    amount: 2101,
                    eligible_players: ['You', 'Villain'],
                    winners: [
                        {
                            uuid: 'me',
                            name: 'You',
                            share: 2101,
                            hole_cards: ['Ah', 'As'],
                            winning_hand: ['Ac', 'Ah', 'As', '9c', '7h'],
                        },
                    ],
                },
            ],
        },
    }),
    evt(9, {
        event_type: 'run_it_twice_board',
        event_category: 'game_event',
        metadata: {
            board_num: 2,
            board_cards: ['Kc', '8h', '3d', '6s', 'Tc'],
            pots: [
                {
                    pot_number: 0,
                    amount: 2100,
                    eligible_players: ['You', 'Villain'],
                    winners: [
                        {
                            uuid: 'opp',
                            name: 'Villain',
                            share: 2100,
                            hole_cards: ['Kh', 'Kd'],
                            winning_hand: ['Kc', 'Kh', 'Kd', 'Tc', '8h'],
                        },
                    ],
                },
            ],
        },
    }),
    evt(10, {
        event_type: 'hand_concluded',
        event_category: 'game_event',
        metadata: {
            hand_number: 42,
            community_cards: ['Ac', '7h', '2d', '5s', '9c'],
            total_pot: 4201,
            pots: [
                {
                    pot_number: 0,
                    amount: 4201,
                    eligible_players: ['You', 'Villain'],
                    winners: [
                        {
                            uuid: 'me',
                            name: 'You',
                            share: 2101,
                            hole_cards: ['Ah', 'As'],
                            winning_hand: ['Ac', 'Ah', 'As', '9c', '7h'],
                        },
                        {
                            uuid: 'opp',
                            name: 'Villain',
                            share: 2100,
                            hole_cards: ['Kh', 'Kd'],
                            winning_hand: ['Kc', 'Kh', 'Kd', 'Tc', '8h'],
                        },
                    ],
                },
            ],
            revealed_cards: {},
        },
    }),
];

type StubProps = {
    children: React.ReactNode;
    events?: GameEventRecord[];
    loading?: boolean;
    error?: string | null;
    hasMore?: boolean;
};

function GameEventsStub({
    children,
    events = [],
    loading = false,
    error = null,
    hasMore = false,
}: StubProps) {
    return (
        <GameEventsContext.Provider
            value={{
                events,
                loading,
                error,
                hasMore,
                loadMoreEvents: async () => undefined,
                refreshEvents: async () => undefined,
            }}
        >
            {children}
        </GameEventsContext.Provider>
    );
}

function Frame({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="card.lightGray" p={{ base: 3, md: 6 }} minH="360px">
            <Box maxW="620px" mx="auto">
                {children}
            </Box>
        </Box>
    );
}

function withState(stub: Omit<StubProps, 'children'>) {
    return (
        <MockAppStateProvider
            state={mockAppState({ tournamentLive: null, game: null })}
        >
            <GameEventsStub {...stub}>
                <Frame>
                    <GameLog />
                </Frame>
            </GameEventsStub>
        </MockAppStateProvider>
    );
}

const meta = {
    title: 'Table/Settings/GameLog',
    component: GameLog,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GameLog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full hand including the two Run It Twice board rows and the concluded summary.
export const PopulatedWithRunItTwice: Story = {
    render: () => withState({ events: POPULATED_EVENTS, hasMore: true }),
};

// First load — shimmering tinted skeleton rows.
export const Loading: Story = {
    render: () => withState({ loading: true }),
};

// Authenticated but nothing has happened yet.
export const Empty: Story = {
    render: () => withState({ events: [] }),
};

// Spectator / signed-out: the feed is owner-scoped, so it prompts to sign in.
export const Unauthorized: Story = {
    render: () =>
        withState({ error: 'Unauthorized: sign in to view game events' }),
};
