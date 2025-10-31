export type Card = string;

export type Message = {
    name: string;
    message: string;
    timestamp: string;
};

export type Log = {
    message: string;
    timestamp: string;
};

export type AppState = {
    messages: Message[];
    logs: Log[];
    username: string | null;
    address: string | null; //Eth address
    clientID: string | null; // might be same as address
    table: string | null;
    game: Game | null;
    volume: number;
    unreadMessageCount: number;
    isChatOpen: boolean; // Track if chat is currently open
    seatRequested: number | null;
    isLeaveRequested: boolean;
    pendingPlayers: PendingPlayer[]; // Added for storing pending players
    isSitOutNext: boolean;
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
    cards: string[];
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
};

export type Config = {
    maxBuyIn: number;
    bb: number;
    sb: number;
};

export type Pot = {
    topShare: number;
    amount: number;
    eligiblePlayerNums: number[];
    winningPlayerNums: number[];
    winningHand: Card[];
    winningScore: number;
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
    has_more: boolean;
};
