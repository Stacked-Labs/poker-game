const backendUrl = process.env.NEXT_PUBLIC_API_URL;

function isBackendUrlValid() {
    if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
    }
}

// Helper function to log and send WebSocket messages
function sendWebSocketMessage(socket: WebSocket, message: object) {
    const stringifiedMessage = JSON.stringify(message);

    // Log outgoing WebSocket message for debugging
    console.log('🔼 WebSocket Message Sent:', {
        timestamp: new Date().toISOString(),
        message: message,
        stringified: stringifiedMessage,
    });

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
    console.log('Getting auth payload for address:', address);

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
    console.log('Received auth payload:', data);
    return data; // Returns { payload, message }
}

// SIWE Authentication - Step 3: Verify signed payload
export async function verifySignedPayload(signedPayload: object) {
    console.log('Verifying signed payload:', signedPayload);

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
    console.log('Verification result:', data);
    return data; // Returns { success: true, address: "0x..." }
}

// Legacy function - kept for backward compatibility if needed
export async function authenticateUser(
    address: string,
    signature: string,
    message: string
) {
    console.log('Authenticating user with address:', address);
    console.log('Signature:', signature);
    console.log('Message:', message);

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

export async function isAuth() {
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

    return data.isAuth;
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

export async function getLeaderboard(address?: string): Promise<{
    leaderboard: { address: string; points: number; handsPlayed: number; rank: number }[];
    player: { address: string; points: number; handsPlayed: number; rank: number } | null;
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

export async function getPublicGames() {
    isBackendUrlValid();

    try {
        const response = await fetch(`${backendUrl}/api/public-games`, {
            method: 'GET',
        });
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
            `${backendUrl}/api/tables/${tableName}/events?${searchParams.toString()}`,
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

export async function getAdminStats() {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/stats`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Admin stats fetch failed: ${response.statusText}`);
    return await response.json();
}

export async function getAdminLiveStats() {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/stats/live`, {
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
}) {
    isBackendUrlValid();
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.search) qs.set('search', params.search);
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

export async function getAdminSettlementHealth() {
    isBackendUrlValid();
    const response = await fetch(`${backendUrl}/api/admin/settlement-health`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error(`Settlement health fetch failed: ${response.statusText}`);
    return await response.json();
}

// Chips → USDC display string (1 chip = 0.01 USDC; USDC_PER_CHIP = 10000, decimals = 6)
function chipsToUsdc(chips: string | null | undefined): string {
    if (!chips || chips === '0' || chips === 'null') return '0.00';
    const n = parseFloat(chips);
    if (isNaN(n)) return '0.00';
    return (n / 100).toFixed(2);
}

export async function getIndexerHealth(): Promise<{
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

    try {
        type IndexerResp = { height?: number | null; error?: string };
        type RpcResp = { result?: string };
        type StatsResp = {
            success?: boolean;
            data?: {
                rake_all_time_chips?: number;
                rake_24h_chips?: number;
                rake_7d_chips?: number;
                rake_30d_chips?: number;
                total_settled_hands?: number;
            };
        };

        const [indexerResult, rpcResult, statsResult] = await Promise.allSettled([
            fetch(`${backendUrl}/api/indexer/status`).then(r => r.json() as Promise<IndexerResp>),
            fetch('https://sepolia.base.org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
            }).then(r => r.json() as Promise<RpcResp>),
            fetch(`${backendUrl}/api/stats`).then(r => r.json() as Promise<StatsResp>),
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
            rakeAllTimeUsdc: chipsToUsdc(String(sd?.rake_all_time_chips ?? 0)),
            rake24hUsdc:     chipsToUsdc(String(sd?.rake_24h_chips ?? 0)),
            rake7dUsdc:      chipsToUsdc(String(sd?.rake_7d_chips ?? 0)),
            rake30dUsdc:     chipsToUsdc(String(sd?.rake_30d_chips ?? 0)),
            totalHands:      sd?.total_settled_hands ?? 0,
        };
    } catch {
        return defaultResult;
    }
}

export async function fetchTableLedger(tableName: string) {
    isBackendUrlValid();

    if (!tableName) {
        throw new Error('Table name is not defined');
    }

    try {
        const response = await fetch(
            `${backendUrl}/api/tables/${tableName}/ledger`,
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
