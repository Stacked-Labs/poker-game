import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button } from '@chakra-ui/react';
import type { LeaderboardPlayer } from '@/app/interfaces';
import TournamentTabPanel from './TournamentTabPanel';
import {
    MOCK_ME,
    MockAppStateProvider,
    makeTournamentLive,
    makeTournamentMeta,
    mockAppState,
} from './tournamentMocks';

const meta = {
    title: 'Tournament/InTable/TournamentTabPanel',
    component: TournamentTabPanel,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TournamentTabPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reproduces the real surface this panel renders on: the in-game Settings modal,
// which is a *transparent* ModalContent with a backdrop blur floating over the live
// poker table. The panel must stay legible against that frosted felt — the whole
// point of the panel's own opaque sheet. The scrim/wash values below mirror
// SettingsModal.tsx (ModalOverlay + ModalContent + TabPanels) exactly so the story
// shows what players actually see. Toggle the toolbar light/dark switch to verify both.
function Stage({ children }: { children: React.ReactNode }) {
    return (
        <Box position="relative" minH="100vh" overflow="hidden">
            {/* The live poker table the modal floats over (gets frosted by the blur) */}
            <Box
                position="absolute"
                inset={0}
                bgGradient="radial(brand.green 0%, brand.greenDark 55%, brand.darkNavy 100%)"
            />
            {/* Faux felt oval + rail so the blurred backdrop reads as a real table */}
            <Box
                position="absolute"
                top="16%"
                left="50%"
                transform="translateX(-50%)"
                w={{ base: '90%', md: '62%' }}
                h="48%"
                borderRadius="9999px"
                border="16px solid"
                borderColor="brand.darkNavy"
                bgGradient="radial(brand.green, brand.greenDark)"
                boxShadow="inset 0 0 80px rgba(0,0,0,0.45)"
            />

            {/* ModalOverlay: navy scrim + blur (mirrors SettingsModal) */}
            <Box
                position="absolute"
                inset={0}
                bg="rgba(11, 20, 48, 0.5)"
                backdropFilter="blur(6px)"
            />

            {/* ModalContent (transparent + blur) → TabPanels wash → TabPanel padding */}
            <Box
                position="relative"
                minH="100vh"
                backdropFilter="blur(8px)"
                p={{ base: 4, md: 8 }}
            >
                <Box
                    maxW="720px"
                    mx="auto"
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="20px"
                    p={{ base: 1, md: 2 }}
                >
                    <Box
                        px={{ base: 0, sm: 1, md: 2 }}
                        py={{ base: 1, md: 2 }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

const addr = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;

// Builds a 120-entrant field with `aliveCount` survivors, placing "me" at a chosen
// alive rank (by stack) or at a busted finishing position. Lets each story land on
// a specific You-strip state (ITM / bubble / busted / cashed) deterministically.
function bigField(opts: {
    entrants?: number;
    aliveCount: number;
    me: {
        rank?: number;
        out?: boolean;
        finish?: number;
        stack?: number;
        prize?: number;
        bullet?: number;
    };
}): LeaderboardPlayer[] {
    const entrants = opts.entrants ?? 120;
    const rows: LeaderboardPlayer[] = [];
    for (let i = 0; i < opts.aliveCount; i++) {
        const rank = i + 1;
        const isMe = !opts.me.out && rank === opts.me.rank;
        rows.push({
            uuid: isMe ? 'me' : 'al' + i,
            wallet: isMe ? MOCK_ME : addr(0x300 + i),
            stack:
                isMe && opts.me.stack != null
                    ? opts.me.stack
                    : Math.max(3_000, 240_000 - i * 9_500),
            finish_pos: 0,
            table_index: i % 6,
            bullet_number: isMe ? (opts.me.bullet ?? 1) : 1,
            xUsername: i === 0 ? 'phil_h' : undefined,
        });
    }
    for (let pos = opts.aliveCount + 1; pos <= entrants; pos++) {
        const isMe = !!opts.me.out && pos === opts.me.finish;
        rows.push({
            uuid: isMe ? 'me' : 'out' + pos,
            wallet: isMe ? MOCK_ME : addr(0x600 + pos),
            stack: 0,
            finish_pos: pos,
            table_index: -1,
            bullet_number: 1,
            prize_usdc: isMe ? opts.me.prize : undefined,
        });
    }
    return rows;
}

// Default running field: re-entries + a not-quite-full field so the Entries and
// Prize-pool tiles show their richer state. "Me" is alive and deep in the money.
export const Running: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    meta: makeTournamentMeta({
                        registeredCount: 150,
                        maxEntries: 180,
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Chip leader: you're 1st of the field. Crown on your strip and on the top
// standings row; status reads "Chip lead · in the money".
export const ChipLeader: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    playersActive: 30,
                    leaderboard: bigField({
                        aliveCount: 30,
                        me: { rank: 1, stack: 410_000 },
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Sitting on the bubble: 20 left, 18 paid → 2 from the money. The You strip and
// the Players-left tile both warm to amber; with motion enabled the strip pulses.
export const OnBubble: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    playersActive: 20,
                    leaderboard: bigField({
                        aliveCount: 20,
                        me: { rank: 20, stack: 9_000 },
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Cashed and out: finished 12th for a real-money prize.
export const Cashed: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    playersActive: 11,
                    leaderboard: bigField({
                        aliveCount: 11,
                        me: { out: true, finish: 12, prize: 184_000_000 },
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Busted out of the money: finished 25th, no cash. Strip goes neutral/muted.
export const Busted: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    playersActive: 24,
                    leaderboard: bigField({
                        aliveCount: 24,
                        me: { out: true, finish: 25 },
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const FreePlay: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    meta: makeTournamentMeta({
                        name: 'Free Play Warmup',
                        isFreePlay: true,
                        chain: undefined,
                        contractAddress: undefined,
                        guaranteeUsdc: 0,
                        prizePoolUsdc: 0,
                        buyInUsdc: 0,
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const NotConnected: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState({ tournamentLive: null })}>
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

// Interactive: toggle between sitting on the bubble (rank 20 of 20) and climbing
// into the money (rank 8). The flip false→true fires the one-time green flourish.
// (Disable "Reduce motion" in your OS to see the animations.)
function CrossingDemo() {
    const [inMoney, setInMoney] = useState(false);
    const state = mockAppState({
        tournamentLive: makeTournamentLive({
            playersActive: 20,
            leaderboard: bigField({
                aliveCount: 20,
                me: {
                    rank: inMoney ? 8 : 20,
                    stack: inMoney ? 96_000 : 9_000,
                },
            }),
        }),
    });
    return (
        <MockAppStateProvider state={state}>
            <Stage>
                <Button
                    onClick={() => setInMoney((v) => !v)}
                    colorScheme="green"
                    mb={3}
                >
                    {inMoney ? 'Reset to bubble' : 'Advance into the money'}
                </Button>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    );
}

export const ItmCrossing: Story = {
    render: () => <CrossingDemo />,
};
