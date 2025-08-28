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

export function sendLog(socket: WebSocket, message: string) {
    sendWebSocketMessage(socket, {
        action: 'send-log',
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
export function playerSetReady(socket: WebSocket, ready: boolean) {
    sendWebSocketMessage(socket, {
        action: 'player-set-ready',
        ready,
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
