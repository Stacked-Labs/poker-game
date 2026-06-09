export type DisplayMode = 'chips' | 'bb' | 'usdc';

export type CardBackVariant =
    // Classic poker-room decks: solid color + diamond/dot lattice + double hairline border
    | 'classic-red'
    | 'classic-blue'
    | 'classic-green'
    | 'classic-black'
    | 'classic-burgundy'
    | 'classic-teal'
    | 'classic-purple'
    // Crypto network decks: solid network color + centered logo + quiet texture
    | 'bitcoin'
    | 'ethereum'
    | 'base'
    | 'usdc'
    // Crypto-culture decks: illustrated centerpieces
    | 'pepe'
    | 'moon'
    | 'rekt';

export type Card = string | number;

export type Message = {
    name: string;
    message: string;
    timestamp: string;
    isSeated: boolean;
};

export type Log = {
    message: string;
    timestamp: string;
};

export type SeatAccepted = {
    seatId: number;
    buyIn: number;
    queued: boolean;
    message: string;
};

export type SettlementStatus = 'pending' | 'success' | 'failed' | null;

export type AppState = {
    messages: Message[];
    logs: Log[];
    username: string | null;
    address: string | null; //Eth address
    clientID: string | null; // might be same as address
    table: string | null;
    game: Game | null;
    volume: number;
    chatSoundEnabled: boolean;
    chatOverlayEnabled: boolean;
    fourColorDeckEnabled: boolean;
    cardBackDesign: CardBackVariant;
    unreadMessageCount: number;
    isChatOpen: boolean; // Track if chat is currently open
    seatRequested: number | null;
    seatAccepted: SeatAccepted | null; // Accepted seat request (waiting to join)
    pendingPlayers: PendingPlayer[]; // Added for storing pending players
    showSeatRequestPopups: boolean;
    isSettingsOpen: boolean;
    blindObligation: BlindObligation | null;
    isTableOwner: boolean | null;
    settlementStatus: SettlementStatus;
    displayMode: DisplayMode;
    displayModeExplicit: boolean;
    tableClosed: { reason: string; message: string } | null;
    /** Live tournament context when seated at a tournament table (null otherwise). */
    tournamentLive: TournamentLive | null;
};

// --- Live tournament state (in-table HUD) ---
// Fed by the backend WS pushes (tournament-clock / -player-count / -elimination /
// -complete) plus a one-shot REST seed. See the "Build Spec — Live Tournament
// Cluster" section of poker-game/docs/tournament-grinder-ui-gaps.md.

export interface LeaderboardPlayer {
    uuid: string;
    wallet: string;
    stack: number;
    finish_pos: number;
    table_index: number;
    bullet_number?: number;
    prize_usdc?: number;
    // X identity from the tournament leaderboard payload (xUsername / xProfileImageUrl),
    // matching the global leaderboard convention. Optional — absent for players who
    // have not linked an X account.
    xUsername?: string | null;
    xProfileImageUrl?: string | null;
}

export interface TournamentClock {
    level: number;
    levelNumber: number; // 1-based, for display
    sb: number;
    bb: number;
    ante: number;
    remainingMs: number;
    totalMs: number;
    receivedAt: number; // Date.now() when applied — lets the UI tick locally
}

export interface TournamentElim {
    playerUuid: string;
    position: number;
    remaining: number;
}

export interface TournamentMeta {
    name: string;
    status: string;
    registeredCount: number;
    maxEntries: number;
    minEntries: number;
    prizePoolUsdc: number;
    guaranteeUsdc: number;
    buyInUsdc: number;
    feeBps: number;
    startingStack: number;
    blindStructure: string;
    lateRegLevels: number;
    lateRegCloseAt: string;
    reentryAllowed: boolean;
    reentryMax: number;
    chain?: string;
    contractAddress?: string;
    isFreePlay: boolean;
    hostWallet: string;
    settlementTxHash?: string;
}

export type TournamentMyResult =
    | { kind: 'bust'; position: number }
    | { kind: 'win' };

export interface TournamentLive {
    tournamentId: number;
    meta: TournamentMeta | null;
    clock: TournamentClock | null;
    playersActive: number | null;
    feed: TournamentElim[]; // newest first, capped
    leaderboard: LeaderboardPlayer[];
    completed: { winnerUuid: string } | null;
    myResult: TournamentMyResult | null;
    status: 'connecting' | 'live' | 'stale';
}

export type Player = {
    username: string;
    uuid: string;
    address: string; //Ethereum address which acts as uuid
    profileImageUrl?: string; // X (Twitter) profile image URL
    position: number;
    seatID: number;
    ready: boolean;
    in: boolean;
    called: boolean;
    left: boolean;
    totalBuyIn: number;
    stack: number;
    bet: number;
    totalBet: number;
    cards: Card[];
    hasRevealed?: boolean;
    readyNextHand?: boolean;
    sitOutNextHand?: boolean;
    leaveAfterHand?: boolean;
    isOnline?: boolean; // Whether player has active WebSocket connection
};

export type Game = {
    running: boolean;
    dealer: number;
    action: number;
    utg: number;
    sb: number;
    bb: number;
    communityCards: Card[];
    stage: number;
    betting: boolean;
    config: Config;
    players: Player[];
    pots: Pot[];
    minRaise: number;
    readyCount: number;
    paused: boolean; // Whether the game is currently paused
    pendingPause?: boolean; // Crypto tables: pause deferred until current hand ends
    /**
     * Unix epoch in milliseconds indicating when the current player's action window ends.
     * A value of 0 means no active timer.
     */
    actionDeadline: number;
    pendingBlinds?: { sb: number; bb: number };
    owesBB?: boolean[];
    waitingForBB?: boolean[];
    /** Community cards that would have been dealt — populated after a concession when rabbit hunt is enabled. */
    rabbitCards?: Card[];
    /** True while an on-chain settlement transaction timed out or failed and needs recovery. Used for admin alerts. */
    settlementStuck?: boolean;
    /** True whenever any settlement is blocking — either actively in-flight or stuck pending recovery. Frontend should disable the leave button when true. */
    settlementInProgress?: boolean;
};

export type BlindObligationOptions = 'post_now' | 'wait_bb' | 'sit_out';

export type BlindObligation = {
    seatID: number;
    owesBB: boolean;
    waitingForBB?: boolean;
    options: BlindObligationOptions[];
};

export type Config = {
    maxBuyIn: number;
    bb: number;
    sb: number;
    crypto?: boolean;
    chain?: string;
    contractAddress?: string;
    ownerAddress?: string;
    ownerSessionUUID?: string;
    rabbitHuntEnabled?: boolean;
    autoAccept?: boolean;
    tournament?: { tournamentId: string; ante?: number } | null;
};

export type Pot = {
    topShare: number;
    amount: number;
    eligiblePlayerNums: number[];
    winningPlayerNums: number[];
    winningScore: number;
    winners?: Array<{
        playerNum: number;
        uuid: string;
        share: number;
        winningHand?: Card[];
    }>;
};

export type FAQ = {
    question: string;
    answer: string;
};

export type PendingPlayer = {
    uuid: string;
    username: string;
    seatId: number;
    buyIn: number;
    profileImageUrl?: string; // X (Twitter) profile image URL
    address?: string; // Ethereum address for BaseScan linking
};

// Event History Types
export type EventType =
    // Player management
    | 'player_joined'
    | 'player_left'
    | 'player_kicked'
    | 'player_accepted'
    | 'player_denied'
    | 'player_set_ready'
    | 'player_set_away'
    | 'player_eliminated'
    | 'player_revealed_cards'
    // Game events
    | 'hand_started'
    | 'cards_dealt'
    | 'flop_dealt'
    | 'turn_dealt'
    | 'river_dealt'
    | 'hand_concluded'
    | 'pot_awarded'
    // Player actions
    | 'fold'
    | 'check'
    | 'call'
    | 'bet'
    | 'raise'
    | 'all_in'
    // Meta events
    | 'game_paused'
    | 'game_resumed';

export type GameEventRecord = {
    id: number;
    table_id: number;
    hand_id?: number | null;
    player_uuid: string;
    player_name: string; // NEW: Top-level player name (indexed)
    event_type: string;
    event_category: 'action' | 'game_event' | 'meta_event';
    amount?: number | null;
    stage?: string; // Optional - omitted for meta events
    sequence_num: number;
    timestamp: string;
    metadata: Record<string, unknown>;
};

export type EventsResponse = {
    success: boolean;
    events: GameEventRecord[];
    table_name: string;
    limit: number;
    offset: number;
    event_types: EventType[]; // NEW: Event type filters applied
    has_more: boolean;
};

// Predefined event type filters for common use cases
export const FINANCIAL_EVENT_TYPES: EventType[] = [
    'player_joined',
    'player_accepted',
    'player_left',
    'player_kicked',
];

// Ledger Types
export type LedgerEntryType = 'buy_in' | 'cash_out' | 'forced_out';

export type LedgerEntry = {
    event_id: number;
    sequence_num: number;
    entry_type: LedgerEntryType;
    player_uuid: string;
    player_name: string;
    seat_id: number | null;
    amount: string | null; // decimal encoded
    final_stack: string | null; // decimal encoded
    reason: string | null;
    timestamp: string; // ISO8601 string
};

export type LedgerTotals = {
    buy_in: string; // decimal
    cash_out: string; // decimal
    net: string; // cash_out - buy_in
    per_player: Array<{
        player_uuid: string;
        player_name: string;
        buy_in: string;
        cash_out: string;
    }>;
};

export type LedgerResponse = {
    success: boolean;
    table_name: string;
    entries: LedgerEntry[];
    totals: LedgerTotals;
};
