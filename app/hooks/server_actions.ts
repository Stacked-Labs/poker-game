const backendUrl = process.env.NEXT_PUBLIC_API_URL;

// Gates console output that would otherwise leak wallet addresses, SIWE
// payloads/signatures, and full WS message bodies into every user's browser
// console in production. Match the existing flag used in WebSocketProvider.
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_WS === 'true';

function isBackendUrlValid() {
    if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
    }
}

// Helper function to log and send WebSocket messages
function sendWebSocketMessage(socket: WebSocket, message: object) {
    const stringifiedMessage = JSON.stringify(message);

    if (DEBUG) {
        console.log('🔼 WebSocket Message Sent:', {
            timestamp: new Date().toISOString(),
            message: message,
            stringified: stringifiedMessage,
        });
    }

    socket.send(stringifiedMessage);
}

// joinTable helper is obsolete in per-table socket model; handshake happens on socket open

export function sendMessage(socket: WebSocket, message: string) {
    sendWebSocketMessage(socket, {
        action: 'send-message',
        message: message,
    });
}

export function takeSeat(
    socket: WebSocket,
    username: string,
    seatID: number,
    buyIn: number
) {
    sendWebSocketMessage(socket, {
        action: 'take-seat',
        username: username,
        seatID: seatID,
        buyIn: buyIn,
    });
}

export function acceptPlayer(socket: WebSocket, uuid: string) {
    sendWebSocketMessage(socket, {
        action: 'accept-player',
        uuid: uuid,
    });
}

export function denyPlayer(socket: WebSocket, uuid: string) {
    sendWebSocketMessage(socket, {
        action: 'deny-player',
        uuid: uuid,
    });
}

export function kickPlayer(socket: WebSocket, uuid: string) {
    sendWebSocketMessage(socket, {
        action: 'kick-player',
        uuid: uuid,
    });
}

export function startGame(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'start-game',
    });
}

export function resetGame(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'reset-game',
    });
}

export function cancelSeatRequest(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'cancel-seat-request',
    });
}

// export function dealGame(socket: WebSocket) {
//     socket.send(
//         JSON.stringify({
//             action: 'deal-game',
//         })
//     );
// }

export function newPlayer(socket: WebSocket, username: string) {
    sendWebSocketMessage(socket, {
        action: 'new-player',
        username: username,
    });
}

export function refreshXIdentity(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'refresh-x-identity',
    });
}

export function playerCall(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'player-call',
    });
}

export function playerCheck(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'player-check',
    });
}

export function playerRaise(socket: WebSocket, amount: number) {
    sendWebSocketMessage(socket, {
        action: 'player-raise',
        amount: amount,
    });
}

export function playerFold(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'player-fold',
    });
}

export function revealCards(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'reveal-cards',
    });
}

export function requestLeave(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'request-leave',
    });
}

// Sit out next hand; if mid-hand, server defers until hand ends
export function playerSitOutNext(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'player-sit-out-next',
    });
}

// Set readiness; typically used to return from away between hands
// Now works as a toggle - backend handles the state change
export function playerSetReady(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'player-set-ready',
    });
}

export function payOwedBlinds(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'pay-owed-blinds',
    });
}

export function waitForBB(socket: WebSocket) {
    sendWebSocketMessage(socket, {
        action: 'wait-for-bb',
    });
}

export function sendPauseGameCommand(socket: WebSocket) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(socket, {
            action: 'pause-game',
        });
    } else {
        console.error('Cannot send pause-game: WebSocket is not open.');
        // Optionally, notify the user or attempt to handle the error
    }
}

export function sendResumeGameCommand(socket: WebSocket) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(socket, {
            action: 'resume-game',
        });
    } else {
        console.error('Cannot send resume-game: WebSocket is not open.');
        // Optionally, notify the user or attempt to handle the error
    }
}

export function sendUpdateBlinds(socket: WebSocket, sb: number, bb: number) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(socket, {
            action: 'update-blinds',
            sb,
            bb,
        });
    } else {
        console.error('Cannot send update-blinds: WebSocket is not open.');
    }
}

export function sendToggleRabbitHunt(socket: WebSocket, enabled: boolean) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(socket, {
            action: 'toggle-rabbit-hunt',
            enabled,
        });
    } else {
        console.error('Cannot send toggle-rabbit-hunt: WebSocket is not open.');
    }
}

export function sendToggleAutoAccept(socket: WebSocket, enabled: boolean) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(socket, {
            action: 'toggle-auto-accept',
            enabled,
        });
    } else {
        console.error('Cannot send toggle-auto-accept: WebSocket is not open.');
    }
}

export function sendRITVote(socket: WebSocket, vote: boolean) {
    sendWebSocketMessage(socket, { action: 'rit-vote', vote });
}

export function sendUpdateRunItTwice(socket: WebSocket, enabled: boolean) {
    sendWebSocketMessage(socket, {
        action: 'update-run-it-twice',
        enabled,
    });
}

// Initialize/confirm an HTTP session so cookies are set before subsequent requests
export async function initSession() {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/init-session`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.ok;
    } catch (e) {
        console.error('Failed to initialize session:', e);
        return false;
    }
}

// SIWE Authentication - Step 1: Get authentication payload
export async function getAuthPayload(address: string) {
    if (DEBUG) console.log('Getting auth payload for address:', address);

    isBackendUrlValid();

    const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        throw new Error('Failed to get authentication payload');
    }

    const data = await response.json();
    if (DEBUG) console.log('Received auth payload:', data);
    return data; // Returns { payload, message }
}

// SIWE Authentication - Step 3: Verify signed payload
export async function verifySignedPayload(signedPayload: object) {
    if (DEBUG) console.log('Verifying signed payload:', signedPayload);

    isBackendUrlValid();

    const response = await fetch(`${backendUrl}/auth/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(signedPayload),
    });

    if (!response.ok) {
        throw new Error('Authentication verification failed');
    }

    const data = await response.json();
    if (DEBUG) console.log('Verification result:', data);
    return data; // Returns { success: true, address: "0x..." }
}

// Legacy function - kept for backward compatibility if needed
export async function authenticateUser(
    address: string,
    signature: string,
    message: string
) {
    if (DEBUG) {
        console.log('Authenticating user with address:', address);
        console.log('Signature:', signature);
        console.log('Message:', message);
    }

    isBackendUrlValid();

    const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, signature, message }),
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    return await response.json();
}

// Authoritative session identity from the server. `address` is the wallet the SIWE JWT cookie
// is bound to — the source of truth for "who am I authenticated as", independent of whatever
// wallet thirdweb currently has connected. Returns address: null when not authenticated.
export interface AuthStatus {
    isAuth: boolean;
    address: string | null;
    sessionType: string | null;
}

export async function getAuthStatus(): Promise<AuthStatus> {
    isBackendUrlValid();

    const response = await fetch(`${backendUrl}/isAuth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error in confirming authorization.');
    }

    const data = await response.json();

    return {
        isAuth: Boolean(data.isAuth),
        address:
            typeof data.address === 'string' && data.address
                ? data.address
                : null,
        sessionType:
            typeof data.sessionType === 'string' ? data.sessionType : null,
    };
}

export async function isAuth() {
    return (await getAuthStatus()).isAuth;
}

export async function isTableExisting(table: string) {
    isBackendUrlValid();

    if (!table) {
        throw new Error('Table is not defined');
    }

    try {
        const response = await fetch(`${backendUrl}/is-table-existing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table }),
        });

        if (!response.ok) {
            throw new Error(`Table check failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Unable to check if table exists.', error);
        throw error;
    }
}

export async function isTableOwner(table: string) {
    isBackendUrlValid();

    if (!table) {
        throw new Error('Table is not defined');
    }

    try {
        const response = await fetch(`${backendUrl}/is-table-owner`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table }),
        });

        return await response.json();
    } catch (error) {
        console.error('Unable to check if player owns table.', error);
        throw error;
    }
}

export async function getHealth() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to perform health check.', error);
        throw error;
    }
}

export async function getHealthDb() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/health/db`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`DB Health check failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to perform DB health check.', error);
        throw error;
    }
}

export async function getMetrics() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/metrics`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Metrics fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch metrics.', error);
        throw error;
    }
}

export async function getDebugTables() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/debug/tables`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(
                `Debug tables fetch failed: ${response.statusText}`
            );
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch debug tables.', error);
        throw error;
    }
}

export async function getDebugConnections() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/debug/connections`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(
                `Debug connections fetch failed: ${response.statusText}`
            );
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch debug connections.', error);
        throw error;
    }
}

export async function getStats() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/api/stats`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Stats fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch stats.', error);
        throw error;
    }
}

export async function getLiveStats() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/api/stats/live`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Live stats fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch live stats.', error);
        throw error;
    }
}

export async function getTables() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/api/stats/tables`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Tables fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch tables.', error);
        throw error;
    }
}

type LeaderboardPlayerEntry = {
    address: string;
    points: number;
    handsPlayed: number;
    rank: number;
    xUsername?: string | null;
    xDisplayName?: string | null;
    xProfileImageUrl?: string | null;
};

export async function getLeaderboard(address?: string): Promise<{
    leaderboard: LeaderboardPlayerEntry[];
    player: LeaderboardPlayerEntry | null;
    total: number;
    updatedAt: string | null;
}> {
    isBackendUrlValid();
    try {
        const url = address
            ? `${backendUrl}/api/leaderboard?address=${encodeURIComponent(address)}`
            : `${backendUrl}/api/leaderboard`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Leaderboard fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch leaderboard.', error);
        return { leaderboard: [], player: null, total: 0, updatedAt: null };
    }
}

// Multi-board leaderboards (Viral §2 / #349). One API serving the 5 Stats Hub boards. Mirrors the
// poker-server boardResponse — value labels (e.g. "$4,812", "3,420") are formatted server-side so
// the Stats Hub and the Top Hosts share card stay consistent.
export type BoardId =
    | 'points'
    | 'hands'
    | 'tournaments_won'
    | 'top_hosts'
    | 'referrals';

export type BoardValueKind = 'points' | 'count' | 'usdc';

export interface BoardMeta {
    id: BoardId;
    title: string;
    icon: string;
    value_kind: BoardValueKind;
    real_money: boolean;
    available: boolean;
    note?: string;
}

export interface BoardRow {
    rank: number;
    wallet: string;
    x_username?: string;
    x_display_name?: string;
    avatar_url?: string;
    tier: string;
    value: number;
    value_label: string;
    // Top Hosts carries { tables_hosted, tournaments_run }.
    extra?: Record<string, number>;
}

export interface BoardResponse {
    board: BoardId;
    title: string;
    icon: string;
    value_kind: BoardValueKind;
    page: number;
    page_size: number;
    total: number;
    updated_at: string | null;
    rows: BoardRow[];
    player: BoardRow | null;
    real_money: boolean;
    available: boolean;
    note?: string;
}

// getBoards returns the tab metadata for the Stats Hub tab strip.
export async function getBoards(): Promise<BoardMeta[]> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/boards`, { method: 'GET' });
        if (!response.ok) throw new Error(`Boards fetch failed: ${response.statusText}`);
        const data = await response.json();
        return (data.boards ?? []) as BoardMeta[];
    } catch (error) {
        console.error('Unable to fetch boards.', error);
        return [];
    }
}

// getBoard returns one ranked, paginated board page plus the caller's own position (when address
// is supplied). Returns an empty, flagged page on failure so the hub can render a graceful shell.
export async function getBoard(
    board: BoardId,
    opts: { page?: number; limit?: number; address?: string } = {}
): Promise<BoardResponse> {
    const empty: BoardResponse = {
        board,
        title: board,
        icon: '',
        value_kind: 'count',
        page: opts.page ?? 1,
        page_size: opts.limit ?? 50,
        total: 0,
        updated_at: null,
        rows: [],
        player: null,
        real_money: false,
        available: false,
    };
    isBackendUrlValid();
    try {
        const params = new URLSearchParams();
        if (opts.page) params.set('page', String(opts.page));
        if (opts.limit) params.set('limit', String(opts.limit));
        if (opts.address) params.set('address', opts.address);
        const qs = params.toString();
        const url = `${backendUrl}/api/boards/${board}${qs ? `?${qs}` : ''}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) throw new Error(`Board ${board} fetch failed: ${response.statusText}`);
        return (await response.json()) as BoardResponse;
    } catch (error) {
        console.error(`Unable to fetch board ${board}.`, error);
        return empty;
    }
}

// Public player profile (Viral §1 / #343). Mirrors the poker-server payload.
export interface PlayerProfileIdentity {
    wallet: string;
    has_x: boolean;
    x_username?: string;
    x_display_name?: string;
    avatar_url?: string;
}
export interface PlayerProfileStats {
    hands_played: number;
    tournaments_entered: number;
    tournaments_won: number;
    final_tables: number;
    best_finish: number;
    tournaments_hosted: number;
    tables_hosted: number;
    referrals: number;
}
export interface PlayerProfileRecentResult {
    tournament_id: number;
    name: string;
    finish_position: number;
    prize_usdc: number;
    ended_at: string | null;
}
export interface PlayerProfileHosted {
    tournament_id: number;
    name: string;
    status: string;
    entrants: number;
    ended_at: string | null;
}
export interface PlayerProfile {
    address: string;
    identity: PlayerProfileIdentity;
    rank: number;
    points: number;
    tier: string;
    referrals_count: number;
    referral_multiplier: number;
    stats: PlayerProfileStats;
    host_earnings: { usdc: number; available: boolean; note?: string };
    badges: { id?: string; label?: string; icon?: string }[];
    recent: {
        results: PlayerProfileRecentResult[];
        hosted: PlayerProfileHosted[];
    };
}

export async function getPlayerProfile(
    address: string
): Promise<PlayerProfile | null> {
    isBackendUrlValid();
    try {
        const res = await fetch(
            `${backendUrl}/api/players/${encodeURIComponent(address)}/profile`,
            { method: 'GET' }
        );
        if (!res.ok) return null;
        return (await res.json()) as PlayerProfile;
    } catch (error) {
        console.error('Unable to fetch player profile.', error);
        return null;
    }
}

// Player search (Viral §1 / #344).
export interface PlayerSearchResult {
    wallet: string;
    x_username?: string;
    x_display_name?: string;
    avatar_url?: string;
    rank: number;
    tier: string;
}
export async function searchPlayers(
    query: string
): Promise<PlayerSearchResult[]> {
    isBackendUrlValid();
    const q = query.trim();
    if (q.length < 2) return [];
    try {
        const res = await fetch(
            `${backendUrl}/api/players/search?q=${encodeURIComponent(q)}`,
            { method: 'GET' }
        );
        if (!res.ok) return [];
        const data = (await res.json()) as { results?: PlayerSearchResult[] };
        return data.results ?? [];
    } catch (error) {
        console.error('Unable to search players.', error);
        return [];
    }
}

export async function getPublicGames(params?: {
    sortBy?: string;
    order?: 'asc' | 'desc';
    filter?: 'all' | 'crypto' | 'free';
    limit?: number;
    offset?: number;
}) {
    isBackendUrlValid();

    const url = new URL(`${backendUrl}/api/public-games`);
    if (params?.sortBy) url.searchParams.set('sort_by', params.sortBy);
    if (params?.order) url.searchParams.set('order', params.order);
    if (params?.filter && params.filter !== 'all')
        url.searchParams.set('filter', params.filter);
    if (params?.limit !== undefined)
        url.searchParams.set('limit', String(params.limit));
    if (params?.offset !== undefined)
        url.searchParams.set('offset', String(params.offset));

    try {
        const response = await fetch(url.toString(), { method: 'GET' });
        if (!response.ok) {
            throw new Error(
                `Public games fetch failed: ${response.statusText}`
            );
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch public games.', error);
        throw error;
    }
}

// --- Tournament API ---

export interface Tournament {
    id: number;
    host_uuid: string;
    host_wallet: string;
    name: string;
    description: string;
    template_id: string;
    buy_in_usdc: number;
    fee_bps: number;
    min_entries: number;
    max_entries: number;
    guarantee_usdc: number;
    scheduled_start_at: string;
    late_reg_close_at: string;
    late_reg_levels: number;
    advertised_end_at: string;
    table_size: number;
    starting_stack: number;
    starting_stack_bb: number;
    status: string;
    prize_pool_usdc: number;
    metadata: Record<string, unknown>;
    created_at: string;
    contract_address?: string;
    chain?: string;
    is_private: boolean;
    registered_count?: number;
    reentry_allowed: boolean;
    reentry_max: number;
    started_at?: string;
    ended_at?: string;
    settlement_tx_hash?: string;
    settlement_status?: 'paid' | 'pending';
    // Host branding (optional). Populated once the backend stores uploaded
    // images; the UI falls back to the default look when absent.
    logo_url?: string;
    banner_url?: string;
    // Host community links (optional). Any may be empty. chart_url is
    // provider-agnostic (DexScreener, GeckoTerminal, etc.).
    x_url?: string;
    website_url?: string;
    discord_url?: string;
    telegram_url?: string;
    chart_url?: string;
}

export async function listTournaments(opts?: {
    limit?: number;
    offset?: number;
    // Server-side ISR cache window in seconds, for the homepage SSR fetch. Omit
    // to keep the default (uncached) behaviour the lobby's client calls rely on.
    revalidate?: number;
}): Promise<{ tournaments: Tournament[]; total_count: number }> {
    isBackendUrlValid();
    const params = new URLSearchParams();
    if (opts?.limit != null) params.set('limit', String(opts.limit));
    if (opts?.offset != null) params.set('offset', String(opts.offset));
    const qs = params.toString();
    const res = await fetch(
        `${backendUrl}/api/tournaments${qs ? `?${qs}` : ''}`,
        {
            method: 'GET',
            ...(opts?.revalidate != null
                ? { next: { revalidate: opts.revalidate } }
                : {}),
        }
    );
    if (!res.ok) throw new Error(`listTournaments: ${res.statusText}`);
    return res.json();
}

export async function getTournament(id: number): Promise<{ tournament: Tournament }> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}`, { method: 'GET' });
    if (!res.ok) throw new Error(`getTournament: ${res.statusText}`);
    return res.json();
}

export async function createTournament(data: {
    name?: string;
    description?: string;
    min_entries: number;
    max_entries: number;
    buy_in_usdc: number;
    guarantee_usdc?: number;
    scheduled_start_at: string;
    blind_structure?: string;
    late_reg_levels?: number;
    table_size?: number;
    reentry_allowed?: boolean;
    reentry_max?: number;
    chain?: string;
    is_private?: boolean;
    password_code_hash?: string;
}): Promise<{ tournament: Tournament }> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// Host-only partial update of a tournament's cosmetic fields (description,
// community links, branding image URLs). Only the provided fields are changed;
// an empty string clears a link/branding value. Matches PATCH /api/tournaments/:id.
export async function updateTournament(
    id: number,
    patch: {
        description?: string;
        logo_url?: string | null;
        banner_url?: string | null;
        x_url?: string | null;
        website_url?: string | null;
        discord_url?: string | null;
        telegram_url?: string | null;
        chart_url?: string | null;
    }
): Promise<{ tournament: Tournament }> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// Host-only branding image upload (logo or banner). Sends the raw file as
// multipart; the backend validates type/size, stores it, persists the resulting
// URL on the tournament, and returns the updated tournament. Matches
// POST /api/tournaments/:id/branding.
export async function uploadTournamentBranding(
    id: number,
    kind: 'logo' | 'banner',
    file: File
): Promise<{ tournament: Tournament }> {
    isBackendUrlValid();
    const form = new FormData();
    form.append(kind, file);
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/branding`, {
        method: 'POST',
        credentials: 'include',
        body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function registerForTournament(
    id: number,
    options?: { passwordCodeHash?: string },
): Promise<{ player_uuid: string }> {
    isBackendUrlValid();
    const body = options?.passwordCodeHash
        ? JSON.stringify({ password_code_hash: options.passwordCodeHash })
        : undefined;
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// getRegistrationPermit fetches a single-use operator signature for registering
// to a private CRYPTO tournament. The server verifies the access-code hash, then
// signs a permit bound to the caller's wallet and on-chain nonce. The returned
// operator_sig is passed to the contract's register()/reEnter() call.
export async function getRegistrationPermit(
    id: number,
    passwordCodeHash: string,
): Promise<{ operator_sig: string }> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/permit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password_code_hash: passwordCodeHash }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function unregisterFromTournament(id: number): Promise<void> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/register`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
}

export async function startTournament(id: number): Promise<void> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/start`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
}

// Full clock snapshot from GET /clock — matches the WS tournament-clock payload
// (poker-server/transport/http/tournament_handler.go handleGetClock).
export interface TournamentClockResponse {
    level: number;
    level_number: number;
    small: number;
    big: number;
    ante: number;
    remaining_ms: number;
    total_ms: number;
    // Rest breaks (mirror poker-server clockResponse). During a break the level
    // fields stay at N; next_break_after_level tells the client N+1 is next.
    on_break?: boolean;
    break_remaining_ms?: number;
    seconds_to_next_break?: number;
    next_break_after_level?: number;
}

export async function getTournamentClock(
    id: number
): Promise<TournamentClockResponse | null> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/clock`, { method: 'GET' });
    if (!res.ok) return null;
    return res.json();
}

export async function getMyTournamentRegistrations(): Promise<{
    tournament_ids: number[];
    finish_pos: Record<number, number>;
}> {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/registrations`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return { tournament_ids: [], finish_pos: {} };
    return res.json();
}

export async function getTournamentLeaderboard(id: number) {
    isBackendUrlValid();
    const res = await fetch(`${backendUrl}/api/tournaments/${id}/leaderboard`, { method: 'GET' });
    if (!res.ok) return null;
    return res.json();
}

export async function getTableSpectatorCount(tableName: string): Promise<number> {
    isBackendUrlValid();

    const response = await fetch(
        `${backendUrl}/api/tables/${encodeURIComponent(tableName)}/spectators`,
        { method: 'GET' }
    );
    if (!response.ok) {
        throw new Error(`Spectator count fetch failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.spectator_count ?? 0;
}

export async function fetchTableEvents(
    tableName: string,
    limit: number = 50,
    offset: number = 0,
    eventTypes?: string[]
) {
    isBackendUrlValid();

    if (!tableName) {
        throw new Error('Table name is not defined');
    }

    try {
        const searchParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });

        // Add event_types filter if provided
        if (eventTypes && eventTypes.length > 0) {
            searchParams.set('event_types', eventTypes.join(','));
        }

        const response = await fetch(
            `${backendUrl}/api/tables/${encodeURIComponent(tableName)}/events?${searchParams.toString()}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Events fetch failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Unable to fetch table events.', error);
        throw error;
    }
}

// ============================================================
// Admin API — requires ADMIN_WALLETS auth cookie
// ============================================================

export async function verifyAdmin(): Promise<{ isAdmin: boolean; address?: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/admin/verify`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) return { isAdmin: false };
        return await response.json();
    } catch {
        return { isAdmin: false };
    }
}

export async function getAdminStats(chain?: 'base-sepolia' | 'base') {
    isBackendUrlValid();
    const qs = chain ? `?chain=${chain}` : '';
    const response = await fetch(`${backendUrl}/api/admin/stats${qs}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin stats fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminLiveStats(chain?: 'base-sepolia' | 'base') {
    isBackendUrlValid();
    const qs = chain ? `?chain=${chain}` : '';
    const response = await fetch(`${backendUrl}/api/admin/stats/live${qs}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin live stats fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminTables(params?: {
    type?: 'crypto' | 'free' | 'all';
    active?: boolean;
    search?: string;
    chain?: 'base-sepolia' | 'base' | 'all';
}) {
    isBackendUrlValid();
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.search) qs.set('search', params.search);
    if (params?.chain && params.chain !== 'all') qs.set('chain', params.chain);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const response = await fetch(`${backendUrl}/api/admin/tables${query}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin tables fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminTableDetail(name: string) {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/tables/${encodeURIComponent(name)}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin table detail fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminHealth() {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/health`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin health fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminSettlementHealth(chain?: 'base-sepolia' | 'base') {
    isBackendUrlValid();
    const qs = chain ? `?chain=${chain}` : '';
    const response = await fetch(`${backendUrl}/api/admin/settlement-health${qs}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Settlement health fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function clearAdminPendingSettlement(tableName: string) {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/settlement-health/${encodeURIComponent(tableName)}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Clear failed: ${response.statusText}`);
    }
    return await response.json();
}

export async function getAdminActionDistribution() {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/stats/actions`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Action distribution fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getIndexerHealth(chain: 'base-sepolia' | 'base' = 'base-sepolia'): Promise<{
    height: number | null;
    chainTip: number | null;
    lag: number | null;
    healthy: boolean;
    rakeAllTimeUsdc: string;
    rake24hUsdc: string;
    rake7dUsdc: string;
    rake30dUsdc: string;
    totalHands: number;
}> {
    const defaultResult = { height: null, chainTip: null, lag: null, healthy: false, rakeAllTimeUsdc: '0.00', rake24hUsdc: '0.00', rake7dUsdc: '0.00', rake30dUsdc: '0.00', totalHands: 0 };
    if (!backendUrl) return defaultResult;

    // Indexer block height is proxied through poker-server (GET /api/indexer/status)
    // so the indexer port never needs to be publicly exposed.
    // Rake aggregates come from poker-server's /api/stats.

    const rpcUrl = chain === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';

    try {
        type IndexerResp = { height?: number | null; error?: string };
        type RpcResp = { result?: string };
        type StatsResp = {
            success?: boolean;
            data?: {
                rake_all_time_usdc?: number;
                rake_24h_usdc?: number;
                rake_7d_usdc?: number;
                rake_30d_usdc?: number;
                total_settled_hands?: number;
            };
        };

        const [indexerResult, rpcResult, statsResult] = await Promise.allSettled([
            fetch(`${backendUrl}/api/indexer/status?chain=${chain}`).then(r => r.json() as Promise<IndexerResp>),
            fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
            }).then(r => r.json() as Promise<RpcResp>),
            fetch(`${backendUrl}/api/stats?chain=${chain}`).then(r => r.json() as Promise<StatsResp>),
        ]);

        const indexerHeight = indexerResult.status === 'fulfilled'
            ? (indexerResult.value?.height ?? null)
            : null;

        const chainTip = rpcResult.status === 'fulfilled' && rpcResult.value?.result
            ? parseInt(rpcResult.value.result, 16)
            : null;

        const lag = indexerHeight !== null && chainTip !== null ? chainTip - indexerHeight : null;
        // Healthy = lag ≤ 50 blocks (FINALITY_CONFIRMATION=10, so ~40 real lag)
        const healthy = indexerHeight !== null && lag !== null && lag <= 50;

        const sd = statsResult.status === 'fulfilled' ? statsResult.value?.data : undefined;

        return {
            height: indexerHeight,
            chainTip,
            lag,
            healthy,
            rakeAllTimeUsdc: (sd?.rake_all_time_usdc ?? 0).toFixed(2),
            rake24hUsdc:     (sd?.rake_24h_usdc ?? 0).toFixed(2),
            rake7dUsdc:      (sd?.rake_7d_usdc ?? 0).toFixed(2),
            rake30dUsdc:     (sd?.rake_30d_usdc ?? 0).toFixed(2),
            totalHands:      sd?.total_settled_hands ?? 0,
        };
    } catch {
        return defaultResult;
    }
}

// ============================================================
// Player Stats & Referral API
// ============================================================

export async function getPlayerStats(address: string): Promise<{
    tablesCreated: number;
    tablesPlayed: number;
}> {
    isBackendUrlValid();
    try {
        const response = await fetch(
            `${backendUrl}/api/player/stats?address=${encodeURIComponent(address)}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            throw new Error(`Player stats fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch player stats.', error);
        return { tablesCreated: 0, tablesPlayed: 0 };
    }
}

export async function getReferralInfo(address: string): Promise<{
    count: number;
    multiplier: number;
    nextTier: { required: number; multiplier: number } | null;
    hasReferrer: boolean;
    myCode: string | null;
}> {
    isBackendUrlValid();
    try {
        const response = await fetch(
            `${backendUrl}/api/referral?address=${encodeURIComponent(address)}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            throw new Error(`Referral info fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch referral info.', error);
        return { count: 0, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false, myCode: null };
    }
}

export async function registerReferral(
    referrerCode: string
): Promise<{ success: boolean; message: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/referral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ referrerCode }),
        });
        return await response.json();
    } catch (error) {
        console.error('Unable to register referral.', error);
        return { success: false, message: 'Network error' };
    }
}

export async function setMyReferralCode(
    code: string
): Promise<{ success: boolean; message: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/referral/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code }),
        });
        return await response.json();
    } catch (error) {
        console.error('Unable to set referral code.', error);
        return { success: false, message: 'Network error' };
    }
}

// ============================================================
// Quest API
// ============================================================

export interface QuestItem {
    id: string;
    title: string;
    points: number;
    completed: boolean;
    prerequisite?: string;
    actionUrl?: string;
    hasNft?: boolean;
}

export async function getQuests(address: string): Promise<{
    quests: QuestItem[];
    totalQuestPoints: number;
}> {
    isBackendUrlValid();
    try {
        const response = await fetch(
            `${backendUrl}/api/quests?address=${encodeURIComponent(address)}`,
            { method: 'GET', credentials: 'include' }
        );
        if (!response.ok) throw new Error(`Quests fetch failed: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch quests.', error);
        return { quests: [], totalQuestPoints: 0 };
    }
}

export async function completeQuest(
    questId: string,
    communityCode?: string
): Promise<{ success: boolean; alreadyCompleted?: boolean; message?: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/quests/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ questId, communityCode }),
        });
        return await response.json();
    } catch (error) {
        console.error('Unable to complete quest.', error);
        return { success: false, message: 'Network error' };
    }
}

// ============================================================
// SBT (Soulbound NFT) API
// ============================================================

export interface SBTInfo {
    contractAddress: string;
    chainName: string;
    explorerURL: string;
    tokenURI: string;
    name: string;
    image: string;
    description: string;
}

export async function getSBTInfo(): Promise<SBTInfo | null> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/sbt/info`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export async function checkSBTEligibility(
    address: string
): Promise<{ eligible: boolean; claimed: boolean }> {
    isBackendUrlValid();
    try {
        const response = await fetch(
            `${backendUrl}/api/sbt/eligibility?address=${encodeURIComponent(address)}`,
            { method: 'GET', credentials: 'include' }
        );
        if (!response.ok) throw new Error(`SBT eligibility fetch failed: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch SBT eligibility.', error);
        return { eligible: false, claimed: false };
    }
}

export async function claimSBT(): Promise<{ success: boolean; txHash?: string; message?: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/sbt/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Unable to claim SBT.', error);
        return { success: false, message: 'Network error' };
    }
}

export interface SBTWhitelistEntry {
    address: string;
    addedAt: string;
    claimed: boolean;
}

export interface SBTWhitelistResponse {
    entries: SBTWhitelistEntry[];
    total: number;
    claimed: number;
}

export async function getAdminSBTWhitelist(params?: {
    search?: string;
}): Promise<SBTWhitelistResponse> {
    isBackendUrlValid();
    const empty: SBTWhitelistResponse = { entries: [], total: 0, claimed: 0 };
    try {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        const response = await fetch(`${backendUrl}/api/admin/sbt/whitelist?${qs}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) throw new Error(`SBT whitelist fetch failed: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Unable to fetch SBT whitelist.', error);
        return empty;
    }
}

export async function addToSBTWhitelist(
    addresses: string[]
): Promise<{ success: boolean; added: number; message?: string }> {
    isBackendUrlValid();
    try {
        const response = await fetch(`${backendUrl}/api/admin/sbt/whitelist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ addresses }),
        });
        return await response.json();
    } catch (error) {
        console.error('Unable to add to SBT whitelist.', error);
        return { success: false, added: 0, message: 'Network error' };
    }
}

// ── Waitlist announcements (admin) ──────────────────────────────────────────

// Returns the number of non-suppressed waitlist subscribers — i.e. the real
// recipient count for a "send to all" blast.
export async function getWaitlistCount(): Promise<number> {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/waitlist`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Waitlist count fetch failed: ${response.statusText}`);
    const data = await response.json();
    return typeof data.total_count === 'number' ? data.total_count : 0;
}

// Sends a pre-rendered HTML announcement to the waitlist. Pass `testEmail` to
// deliver a single preview to that address; omit it to blast every subscriber.
// The backend injects the per-recipient unsubscribe link + CAN-SPAM footer.
export async function sendWaitlistAnnounce(payload: {
    subject: string;
    html: string;
    testEmail?: string;
}): Promise<{ success: boolean; sent: number; total?: number; test?: boolean }> {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/waitlist/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error ?? `Announce failed: ${response.statusText}`);
    }
    return data;
}

export async function fetchTableLedger(tableName: string) {
    isBackendUrlValid();

    if (!tableName) {
        throw new Error('Table name is not defined');
    }

    try {
        const response = await fetch(
            `${backendUrl}/api/tables/${encodeURIComponent(tableName)}/ledger`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Ledger fetch failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Unable to fetch table ledger.', error);
        throw error;
    }
}
