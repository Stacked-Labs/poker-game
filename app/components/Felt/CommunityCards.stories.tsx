'use client';

import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text, VStack } from '@chakra-ui/react';
import CommunityCards from './CommunityCards';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SoundContext } from '@/app/contexts/SoundProvider';
import type { AppState, Card as CardType, Game } from '@/app/interfaces';

// ─── Card encoding helper ───────────────────────────────────────────────────
// Cards are encoded as (rank << 8) | suit, where:
//   rank: 0..12 maps to '2'..'A'
//   suit: 0x8000 = Clubs, 0x4000 = Diamonds, 0x2000 = Hearts, 0x1000 = Spades
const C = 0x8000;
const D = 0x4000;
const H = 0x2000;
const S = 0x1000;
const card = (rank: number, suit: number): CardType =>
    ((rank << 8) | suit) as unknown as CardType;

// Sample cards used across stories
const AS = card(12, S); // Ace of Spades
const KH = card(11, H); // King of Hearts
const QD = card(10, D); // Queen of Diamonds
const JC = card(9, C);  // Jack of Clubs
const TS = card(8, S);  // 10 of Spades
const NINE_H = card(7, H); // 9 of Hearts
const SEVEN_D = card(5, D); // 7 of Diamonds

// ─── Mock AppState fixture ──────────────────────────────────────────────────
const makeGame = (overrides: Partial<Game> = {}): Game => ({
    running: true,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 1,
    communityCards: [0 as unknown as CardType, 0 as unknown as CardType, 0 as unknown as CardType, 0 as unknown as CardType, 0 as unknown as CardType],
    stage: 0,
    betting: true,
    config: { maxBuyIn: 10_000, bb: 20, sb: 10, rabbitHuntEnabled: true },
    players: [],
    pots: [],
    minRaise: 40,
    readyCount: 0,
    paused: false,
    actionDeadline: 0,
    ...overrides,
});

const makeAppState = (gameOverrides: Partial<Game> = {}): AppState => ({
    messages: [],
    logs: [],
    username: 'storybook.eth',
    clientID: 'sb-uuid',
    address: '0xSTORYBOOK',
    table: 'storybook-table',
    game: makeGame(gameOverrides),
    volume: 0,
    chatSoundEnabled: false,
    chatOverlayEnabled: false,
    fourColorDeckEnabled: false,
    cardBackDesign: 'classic-blue',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: false,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: false,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
});

// ─── Sound mock — silent stub, prevents useSound() throw ────────────────────
const silentSound = {
    play: () => {},
    stop: () => {},
    isReady: () => true,
};

// ─── Layout decorator — felt-like container holding 5 card slots ────────────
const FeltStage: React.FC<{ children: React.ReactNode; label?: string }> = ({
    children,
    label,
}) => (
    <VStack spacing={3} align="stretch">
        {label && (
            <Text color="gray.300" fontSize="sm" fontWeight="500">
                {label}
            </Text>
        )}
        <Box
            bg="#1B5E3F"
            bgGradient="radial(#2A7A52, #134029)"
            p="32px 40px"
            borderRadius="140px"
            display="grid"
            gridTemplateColumns="repeat(5, 72px)"
            gap="10px"
            justifyContent="center"
            alignItems="center"
            boxShadow="inset 0 0 40px rgba(0,0,0,0.45)"
        >
            {children}
        </Box>
    </VStack>
);

// Auto-click on mount — used by the "revealed" story to trigger the
// component's real reveal logic without a separate code path.
const AutoReveal: React.FC = () => {
    useEffect(() => {
        const id = window.setTimeout(() => {
            const el = document.querySelector<HTMLDivElement>(
                '[data-testid="rabbit-card-placeholder"]'
            );
            el?.click();
        }, 50);
        return () => window.clearTimeout(id);
    }, []);
    return null;
};

type StoryArgs = {
    gameOverrides: Partial<Game>;
    label?: string;
    autoReveal?: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Felt/CommunityCards',
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'table',
            values: [{ name: 'table', value: '#0a1f14' }],
        },
    },
    render: ({ gameOverrides, label, autoReveal }) => {
        const appState = makeAppState(gameOverrides);
        return (
            <AppContext.Provider value={{ appState, dispatch: () => null }}>
                <SoundContext.Provider value={silentSound}>
                    <FeltStage label={label}>
                        <CommunityCards activePotIndex={null} />
                    </FeltStage>
                    {autoReveal && <AutoReveal />}
                </SoundContext.Provider>
            </AppContext.Provider>
        );
    },
};

export default meta;
type Story = StoryObj<StoryArgs>;

// ─── 1. Baseline states (no rabbit hunt) ────────────────────────────────────

export const PreflopPlaceholders: Story = {
    args: {
        label: 'Preflop — all five slots empty',
        gameOverrides: {
            communityCards: [0, 0, 0, 0, 0] as unknown as CardType[],
        },
    },
};

export const FlopDealt: Story = {
    args: {
        label: 'Flop dealt — 3 real cards, 2 empty placeholders',
        gameOverrides: {
            communityCards: [AS, KH, QD, 0 as unknown as CardType, 0 as unknown as CardType],
        },
    },
};

export const FullBoard: Story = {
    args: {
        label: 'Full board — river dealt',
        gameOverrides: {
            communityCards: [AS, KH, QD, JC, TS],
        },
    },
};

// ─── 2. Rabbit hunt — unrevealed placeholder states ─────────────────────────

export const RabbitHuntPreflop: Story = {
    args: {
        label: 'Rabbit hunt — folded preflop, 5 rabbit placeholders (hover or click to peek/reveal)',
        gameOverrides: {
            communityCards: [0, 0, 0, 0, 0] as unknown as CardType[],
            rabbitCards: [AS, KH, QD, JC, TS],
        },
    },
};

export const RabbitHuntFlopFolded: Story = {
    args: {
        label: 'Rabbit hunt — folded on flop, 2 rabbit placeholders (turn + river)',
        gameOverrides: {
            communityCards: [AS, KH, QD, 0 as unknown as CardType, 0 as unknown as CardType],
            rabbitCards: [JC, TS],
        },
    },
};

export const RabbitHuntTurnFolded: Story = {
    args: {
        label: 'Rabbit hunt — folded on turn, 1 rabbit placeholder (river)',
        gameOverrides: {
            communityCards: [AS, KH, QD, JC, 0 as unknown as CardType],
            rabbitCards: [TS],
        },
    },
};

// ─── 3. Rabbit hunt — revealed state ────────────────────────────────────────

export const RabbitHuntRevealed: Story = {
    args: {
        label: 'Rabbit hunt — revealed (auto-clicked on mount to showcase production reveal animation)',
        autoReveal: true,
        gameOverrides: {
            communityCards: [0, 0, 0, 0, 0] as unknown as CardType[],
            rabbitCards: [AS, KH, QD, JC, TS],
        },
    },
};

export const RabbitHuntMixedRevealed: Story = {
    args: {
        label: 'Rabbit hunt — flop dealt, revealed rabbit turn + river',
        autoReveal: true,
        gameOverrides: {
            communityCards: [AS, KH, QD, 0 as unknown as CardType, 0 as unknown as CardType],
            rabbitCards: [NINE_H, SEVEN_D],
        },
    },
};

// ─── 4. Accessibility — reduced motion ──────────────────────────────────────
// `useReducedMotion()` reads the OS-level `prefers-reduced-motion` media query,
// so to verify the graceful-degradation path enable reduced motion in your OS
// (macOS: System Settings → Accessibility → Display → Reduce motion) and
// revisit this story — hover slide and stagger fade should be suppressed.

export const RabbitHuntReducedMotionNote: Story = {
    args: {
        label: 'Rabbit hunt — reduced motion (toggle OS setting to verify)',
        gameOverrides: {
            communityCards: [0, 0, 0, 0, 0] as unknown as CardType[],
            rabbitCards: [AS, KH, QD, JC, TS],
        },
    },
};
