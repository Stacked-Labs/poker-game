export function joinTable(socket: WebSocket, tablename: string) {
    socket.send(
        JSON.stringify({
            action: 'join-table',
            tablename: tablename,
        })
    );
}

export function sendMessage(
    socket: WebSocket,
    username: string,
    message: string
) {
    socket.send(
        JSON.stringify({
            action: 'send-message',
            username: username,
            message: message,
        })
    );
}

export function sendLog(socket: WebSocket, message: string) {
    socket.send(
        JSON.stringify({
            action: 'send-log',
            message: message,
        })
    );
}

export function takeSeat(
    socket: WebSocket,
    username: string,
    seatID: number,
    buyIn: number
) {
    socket.send(
        JSON.stringify({
            action: 'take-seat',
            username: username,
            seatID: seatID,
            buyIn: buyIn,
        })
    );
}

export function startGame(socket: WebSocket) {
    socket.send(
        JSON.stringify({
            action: 'start-game',
        })
    );
}

export function resetGame(socket: WebSocket) {
    socket.send(
        JSON.stringify({
            action: 'reset-game',
        })
    );
}

export function dealGame(socket: WebSocket) {
    socket.send(
        JSON.stringify({
            action: 'deal-game',
        })
    );
}

export function newPlayer(socket: WebSocket, username: string) {
    socket?.send(
        JSON.stringify({
            action: 'new-player',
            username: username,
        })
    );
}

export function playerCall(socket: WebSocket) {
    socket?.send(
        JSON.stringify({
            action: 'player-call',
        })
    );
}

export function playerCheck(socket: WebSocket) {
    socket?.send(
        JSON.stringify({
            action: 'player-check',
        })
    );
}

export function playerRaise(socket: WebSocket, amount: number) {
    socket?.send(
        JSON.stringify({
            action: 'player-raise',
            amount: amount,
        })
    );
}

export function playerFold(socket: WebSocket) {
    socket?.send(
        JSON.stringify({
            action: 'player-fold',
        })
    );
}

export async function authenticateUser(
    address: string,
    signature: string,
    message: string
) {
    console.log('Authenticating user with address:', address);
    console.log('Signature:', signature);
    console.log('Message:', message);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
    }

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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
    }

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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
    }

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
