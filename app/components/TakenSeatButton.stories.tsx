'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TakenSeatButton from './TakenSeatButton';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { SoundContext } from '@/app/contexts/SoundProvider';
import type { AppState, Game, Player } from '@/app/interfaces';
import { useSeatReactionsStore } from '@/app/stores/seatReactions';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

// ─── Card encoding ─────────────────────────────────────────────────────────────
// Cards use the riverboat/eval 32-bit int format:
//   bits [11:8]  = rankIndex (0=2 … 12=Ace → rank 2…14)
//   bits [15:12] = suit mask (0x8000=Clubs, 0x4000=Diamonds, 0x2000=Hearts, 0x1000=Spades)
//
//   Ace♠   = (12 << 8) | 0x1000 = 7168
//   Ace♥   = (12 << 8) | 0x2000 = 11264
//   Ace♣   = (12 << 8) | 0x8000 = 35840
//   King♣  = (11 << 8) | 0x8000 = 35584
//   Queen♦ = (10 << 8) | 0x4000 = 18944
//   10♠    = ( 8 << 8) | 0x1000 = 6144
//   3♣     = ( 1 << 8) | 0x8000 = 33024
//   2♣     = ( 0 << 8) | 0x8000 = 32768
const CARD = {
    aceSpades:   7168,
    aceHearts:   11264,
    aceClubs:    35840,
    kingClubs:   35584,
    queenDiamonds: 18944,
    tenSpades:   6144,
    threeClubs:  33024,
    twoClubs:    32768,
} as const;

// ─── Static UUIDs ──────────────────────────────────────────────────────────────
const PLAYER_UUID = 'player-uuid-alice';
const VIEWER_UUID = 'viewer-uuid-spectator';

// ─── Base mock data ─────────────────────────────────────────────────────────────
const baseConfig = { maxBuyIn: 10_000, bb: 20, sb: 10 };

const baseGame: Game = {
    running: true,
    dealer: 2,
    action: 1,
    utg: 1,
    sb: 0,
    bb: 1,
    communityCards: [0, 0, 0, 0, 0],
    stage: 0,
    betting: true,
    config: baseConfig,
    players: [],
    pots: [],
    minRaise: 40,
    readyCount: 4,
    paused: false,
    actionDeadline: 0,
};

const basePlayer: Player = {
    username: 'alice.eth',
    uuid: PLAYER_UUID,
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    position: 1,
    seatID: 4,
    ready: true,
    in: true,
    called: false,
    left: false,
    totalBuyIn: 5_000,
    stack: 4_200,
    bet: 0,
    totalBet: 0,
    cards: [0, 0],
    isOnline: true,
};

const baseAppState: AppState = {
    messages: [],
    logs: [],
    username: 'viewer',
    clientID: VIEWER_UUID,
    address: '0x000000000000000000000000000000000000000A',
    table: 'storybook-table',
    game: baseGame,
    volume: 0,
    chatSoundEnabled: false,
    chatOverlayEnabled: false,
    fourColorDeckEnabled: false,
    cardBackDesign: 'classic',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: false,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: null,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

const mockSound = {
    play: () => {},
    stop: () => {},
    isReady: () => false,
};

/** Minimal mock WebSocket so canSendSeatReaction evaluates to true */
const mockSocket = {
    readyState: WebSocket.OPEN,
    send: () => {},
} as unknown as WebSocket;

// ─── Zustand store baselines (reset in beforeEach) ─────────────────────────────
const initialSeatReactions = useSeatReactionsStore.getState();
const initialPointsAnimation = usePointsAnimationStore.getState();

// ─── Provider decorator factory ────────────────────────────────────────────────
// Story-level decorators render CLOSER to the component than meta-level ones,
// so story overrides shadow the meta-level context. Each call returns a fresh
// decorator that injects the requested game / appState into all three contexts.
type DecoratorConfig = {
    appStateOverride?: Partial<AppState>;
    gameOverride?: Partial<Game>;
    /** Inject a mock WebSocket so emote picker / seat reactions are enabled */
    withSocket?: boolean;
};

const makeDecorator = ({ appStateOverride, gameOverride, withSocket }: DecoratorConfig = {}) => {
    const game: Game = { ...baseGame, ...gameOverride };
    const appState: AppState = { ...baseAppState, ...appStateOverride, game };
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <SoundContext.Provider value={mockSound}>
                <SocketContext.Provider value={withSocket ? mockSocket : null}>
                    {/* Seat slot — mirrors the approximate on-table size */}
                    <div
                        style={{
                            width: 150,
                            height: 130,
                            position: 'relative',
                            background: '#0B1430',
                            borderRadius: 8,
                            overflow: 'visible',
                        }}
                    >
                        <Story />
                    </div>
                </SocketContext.Provider>
            </SoundContext.Provider>
        </AppContext.Provider>
    );
    Wrapper.displayName = 'TakenSeatStoryWrapper';
    return Wrapper;
};

// ─── Meta ──────────────────────────────────────────────────────────────────────
const meta = {
    title: 'Components/TakenSeatButton',
    component: TakenSeatButton,
    tags: ['autodocs'],
    // Default providers — story-level decorators shadow these when present
    decorators: [makeDecorator()],
    beforeEach: () => {
        useSeatReactionsStore.setState(initialSeatReactions, true);
        usePointsAnimationStore.setState(initialPointsAnimation, true);
    },
    argTypes: {
        player: {
            control: false,
            description: 'Full Player object from the game state',
        },
        visualSeatId: {
            control: { type: 'select' },
            options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            description: 'Override visual seat position (affects chip/bet bubble placement)',
        },
        isCurrentTurn: {
            control: 'boolean',
            description: 'Whether this seat is the active actor right now',
        },
        isWinner: {
            control: 'boolean',
            description: 'Whether this player won the pot (triggers yellow winner highlight)',
        },
        isRevealed: {
            control: 'boolean',
            description: 'Whether hole cards are in showdown-reveal state',
        },
        winnings: {
            control: { type: 'number', min: 0, step: 50 },
            description: 'Chips won — non-zero turns the stack label green',
        },
        activePotIndex: {
            control: { type: 'number', min: 0 },
            description: 'Which pot index to resolve for winner logic (null = auto)',
        },
        equity: {
            control: { type: 'number', min: 0, max: 100, step: 1 },
            description: 'Hand equity % shown as a badge (null hides it)',
        },
    },
    args: {
        player: basePlayer,
        visualSeatId: 4,
        isCurrentTurn: false,
        isWinner: false,
        isRevealed: false,
        winnings: 0,
        activePotIndex: null,
        equity: null,
    },
} satisfies Meta<typeof TakenSeatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ───────────────────────────────────────────────────────────────────

/** Idle opponent: in hand, no active turn, waiting. Cards: A♠ K♣ face-up.
 *  Shows gradient background and blockie avatar badge. */
export const Default: Story = {
    args: {
        isRevealed: true,
        player: { ...basePlayer, cards: [CARD.aceSpades, CARD.kingClubs] },
    },
};

// ── Blockie avatar + vertical layout ──────────────────────────────────────────

/** Different addresses produce distinct square blockie avatars. */
export const BlockieAvatarVariants: Story = {
    name: 'Blockie Avatar — different address',
    args: {
        player: {
            ...basePlayer,
            address: '0x1111111111111111111111111111111111111111',
            username: 'vitalik.eth',
        },
    },
};

/** No address — initials avatar with chat-color background. */
export const NoAddress: Story = {
    name: 'No Address — initials fallback',
    args: {
        player: { ...basePlayer, address: '', username: 'Big Tony' },
    },
};

// ── Active turn / fuse timer border ───────────────────────────────────────────

/** Active actor with plenty of time — thick fuse border sweeps clockwise, green. */
export const ActiveTurnGreen: Story = {
    name: 'Active Turn — green fuse (>10 s)',
    decorators: [makeDecorator({ gameOverride: { actionDeadline: Date.now() + 30_000 } })],
    args: { isCurrentTurn: true },
};

/** Active actor with ~7 seconds left — fuse border turns yellow. */
export const ActiveTurnYellow: Story = {
    name: 'Active Turn — yellow fuse (5–10 s)',
    decorators: [makeDecorator({ gameOverride: { actionDeadline: Date.now() + 7_000 } })],
    args: { isCurrentTurn: true },
};

/** Active actor with under 5 seconds — fuse border turns red/pink with pulse. */
export const ActiveTurnRed: Story = {
    name: 'Active Turn — red fuse (<5 s)',
    decorators: [makeDecorator({ gameOverride: { actionDeadline: Date.now() + 3_500 } })],
    args: { isCurrentTurn: true },
};

// ── Winner ─────────────────────────────────────────────────────────────────────

/** Player won the pot — yellow border, winner glow, green stack label. */
export const IsWinner: Story = {
    args: {
        isWinner: true,
        isRevealed: true,
        winnings: 840,
    },
};

// ── Cards ──────────────────────────────────────────────────────────────────────

/** Face-down cards — typical in-hand view for an opponent. */
export const WithFaceDownCards: Story = {
    args: {
        player: { ...basePlayer, cards: [0, 0] },
    },
};

/**
 * Self-player with both hole cards revealed — shows the hand-strength label.
 * Hole: A♠ A♥ | Board: A♣ Q♦ 2♣ 3♣ 10♠ → Three of a Kind (trip aces).
 */
export const WithHandStrength: Story = {
    decorators: [
        makeDecorator({
            appStateOverride: { clientID: PLAYER_UUID },
            gameOverride: {
                communityCards: [
                    CARD.aceClubs,
                    CARD.queenDiamonds,
                    CARD.twoClubs,
                    CARD.threeClubs,
                    CARD.tenSpades,
                ],
            },
        }),
    ],
    args: {
        player: { ...basePlayer, uuid: PLAYER_UUID, cards: [CARD.aceSpades, CARD.aceHearts] },
    },
};

/**
 * Showdown reveal — opponent's hole cards are face-up so the rank + small suit
 * below the rank are visible. Useful for visual-testing card face layout.
 * Hole: K♣ Q♦
 */
export const ShowdownReveal: Story = {
    decorators: [
        makeDecorator({
            gameOverride: {
                communityCards: [
                    CARD.aceClubs,
                    CARD.aceHearts,
                    CARD.tenSpades,
                    CARD.threeClubs,
                    CARD.twoClubs,
                ],
            },
        }),
    ],
    args: {
        isRevealed: true,
        player: { ...basePlayer, cards: [CARD.kingClubs, CARD.queenDiamonds] },
    },
};

/** Player folded — cards still visible for self but dimmed. */
export const Folded: Story = {
    decorators: [makeDecorator({ appStateOverride: { clientID: PLAYER_UUID } })],
    args: {
        player: {
            ...basePlayer,
            uuid: PLAYER_UUID,
            in: false,
            cards: [CARD.aceSpades, CARD.aceHearts],
        },
    },
};

// ── Action bubbles ─────────────────────────────────────────────────────────────

/** Player bet — yellow bet-amount chip bubble above the seat. Cards: Q♦ 10♠ face-up. */
export const WithBet: Story = {
    args: {
        isRevealed: true,
        player: { ...basePlayer, bet: 120, totalBet: 120, cards: [CARD.queenDiamonds, CARD.tenSpades] },
    },
};

/** Player checked — frosted glass "Check" bubble above the seat. */
export const WithCheck: Story = {
    args: {
        player: { ...basePlayer, called: true, bet: 0 },
    },
};

// ── Dealer badge ───────────────────────────────────────────────────────────────

/** This seat is the dealer — shows the "D" button chip. */
export const IsDealer: Story = {
    decorators: [makeDecorator({ gameOverride: { dealer: basePlayer.position } })],
};

/** Dealer badge and bet bubble both visible at the same time. */
export const DealerWithBet: Story = {
    decorators: [makeDecorator({ gameOverride: { dealer: basePlayer.position } })],
    args: {
        player: { ...basePlayer, bet: 200, totalBet: 200 },
    },
};

// ── Equity badge ───────────────────────────────────────────────────────────────

/** High equity (>50 %) — badge renders green. */
export const WithEquityHigh: Story = {
    args: { equity: 72 },
};

/** Mid equity (30–50 %) — badge renders gray. */
export const WithEquityMid: Story = {
    args: { equity: 38 },
};

/** Low equity (<30 %) — badge renders red. */
export const WithEquityLow: Story = {
    args: { equity: 15 },
};

// ── Status badges ──────────────────────────────────────────────────────────────

/** Player's connection dropped — grayscale + slow pulse animation + Offline tag. */
export const Offline: Story = {
    args: {
        player: { ...basePlayer, isOnline: false },
    },
};

/** Player queued to sit out next hand — coffee-cup "Away.." badge. */
export const SittingOutNextHand: Story = {
    args: {
        player: { ...basePlayer, sitOutNextHand: true },
    },
};

/**
 * Player topped up and is waiting to re-join — person icon "Joining..." badge.
 * Condition: stack > 0 AND ready=false AND readyNextHand=true AND not offline.
 */
export const JoiningNextHand: Story = {
    args: {
        player: {
            ...basePlayer,
            ready: false,
            readyNextHand: true,
            in: false,
            stack: 1_500,
        },
    },
};

/** Player will leave after the current hand — pink "Leaving.." badge. */
export const LeavingAfterHand: Story = {
    args: {
        player: { ...basePlayer, leaveAfterHand: true, in: false },
    },
};

// ── Self Away (green glow / rejoin) ───────────────────────────────────────────

/**
 * Self-player who stepped away — stack > 0, ready=false.
 * Seat gets a green pulsing border glow and becomes clickable ("Tap to rejoin").
 */
export const SelfAway: Story = {
    name: 'Self Away — green glow (tap to rejoin)',
    decorators: [makeDecorator({ appStateOverride: { clientID: PLAYER_UUID }, withSocket: true })],
    args: {
        player: {
            ...basePlayer,
            uuid: PLAYER_UUID,
            ready: false,
            in: false,
            readyNextHand: false,
            stack: 3_500,
        },
    },
};

/**
 * Self-player who already queued to rejoin (readyNextHand=true).
 * Green border but pulse stops — seat click cancels the rejoin.
 */
export const SelfAwayRejoining: Story = {
    name: 'Self Away — rejoining next hand (cancel on click)',
    decorators: [makeDecorator({ appStateOverride: { clientID: PLAYER_UUID }, withSocket: true })],
    args: {
        player: {
            ...basePlayer,
            uuid: PLAYER_UUID,
            ready: false,
            in: false,
            readyNextHand: true,
            stack: 3_500,
        },
    },
};

// ── Self (emote UI) ────────────────────────────────────────────────────────────

/**
 * Seat belongs to the current user — emote-picker smiley icon is visible
 * next to the username (mock socket enables it).
 */
export const IsSelf: Story = {
    decorators: [makeDecorator({ appStateOverride: { clientID: PLAYER_UUID }, withSocket: true })],
    args: {
        player: { ...basePlayer, uuid: PLAYER_UUID },
    },
};

// ── Emote reaction ─────────────────────────────────────────────────────────────

/** Emote reaction bubble animating above the player info panel (5 s TTL). */
export const WithSeatReaction: Story = {
    beforeEach: () => {
        useSeatReactionsStore.setState(initialSeatReactions, true);
        useSeatReactionsStore.getState().showReaction({
            id: 'story-reaction-1',
            targetUuid: PLAYER_UUID,
            emoteId: 'kekw',
            emoteName: 'KEKW',
            emoteUrl: 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/3x.webp',
            createdAt: Date.now(),
        });
    },
    args: {
        player: { ...basePlayer, uuid: PLAYER_UUID },
    },
};

// ── Playground ─────────────────────────────────────────────────────────────────

/**
 * Kitchen-sink story — blockie avatar, gradient bg, fuse timer border,
 * and all controls active. Use the Controls panel to toggle props.
 */
export const Playground: Story = {
    name: 'Playground — all controls',
    decorators: [makeDecorator({
        appStateOverride: { clientID: PLAYER_UUID },
        gameOverride: { actionDeadline: Date.now() + 20_000 },
        withSocket: true,
    })],
    args: {
        isCurrentTurn: true,
        equity: 55,
        player: { ...basePlayer, uuid: PLAYER_UUID, bet: 80, totalBet: 80 },
    },
};
