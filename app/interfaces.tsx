export type Card = string | number;

export type Message = {
    name: string;
    message: string;
    timestamp: string;
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
};

export type Player = {
    username: string;
    uuid: string;
    address: string; //Ethereum address which acts as uuid
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
    /**
     * Unix epoch in milliseconds indicating when the current player's action window ends.
     * A value of 0 means no active timer.
     */
    actionDeadline: number;
    owesSB?: boolean[];
    owesBB?: boolean[];
    waitingForBB?: boolean[];
};

export type BlindObligationOptions = 'post_now' | 'wait_bb' | 'sit_out';

export type BlindObligation = {
    seatID: number;
    owesSB: boolean;
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
