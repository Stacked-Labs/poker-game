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
// `width` mirrors the footer-wrapper it anchors to — pass a phone width to see the
// compact (base-breakpoint) copy. NOTE: the compact/full switch is driven by
// useBreakpointValue, which reads the actual iframe width — narrow the Storybook
// viewport (or the PortraitMobile story) to exercise it, not just this box.
function Stage({
    children,
    width = '640px',
}: {
    children: React.ReactNode;
    width?: string;
}) {
    return (
        <Box bg="bg.letterbox" minH="320px" p={6}>
            <Box position="relative" mt="200px" mx="auto" maxW={width} h="56px">
                {children}
            </Box>
        </Box>
    );
}

// 390px ≈ iPhone 14 portrait — the screen the watermark was crowding.
const portraitMobile = {
    name: 'Portrait phone',
    styles: { width: '390px', height: '844px' },
    type: 'mobile' as const,
};

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

// The crowded-on-mobile case the redesign targets: deep blinds + ante on a
// portrait phone. Renders the compact copy ("NLH · L12 · 3K/6K (6KA)",
// "7/34 LEFT", "FREE PLAY") so it stays one tight column clear of the seat HUD.
export const PortraitMobile: Story = {
    parameters: {
        viewport: {
            options: { portraitMobile },
        },
    },
    globals: {
        viewport: { value: 'portraitMobile', isRotated: false },
    },
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
                        registeredCount: 34,
                    }),
                    clock: {
                        level: 12,
                        levelNumber: 12,
                        sb: 3_000,
                        bb: 6_000,
                        ante: 6_000,
                        remainingMs: 7 * 60_000,
                        totalMs: 10 * 60_000,
                        receivedAt: 0,
                    },
                    playersActive: 7,
                }),
            })}
        >
            <Stage width="390px">
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
