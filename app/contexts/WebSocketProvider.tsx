'use client';

import {
    createContext,
    ReactNode,
    useEffect,
    useState,
    useContext,
    useRef,
    useCallback,
    Context,
} from 'react';
import { Message, Game, Log, Player } from '@/app/interfaces';
import { AppContext } from './AppStoreProvider';
import useToastHelper from '../hooks/useToastHelper';

/*  
WebSocket context creates a single connection to the server per client. 
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store. 
*/

export const SocketContext: Context<WebSocket | null> =
    createContext<WebSocket | null>(null);

type SocketProviderProps = {
    children: ReactNode;
};

const TOAST_ID_RECONNECTING = 'attemptReconnection';
const TOAST_ID_RECONNECTED = 'isReconnected';

export function SocketProvider(props: SocketProviderProps) {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { appState, dispatch } = useContext(AppContext);
    const socketRef = useRef<WebSocket | null>(null);
    const appStateRef = useRef(appState);

    const {
        error: originalError,
        success: originalSuccess,
        info: originalInfo,
    } = useToastHelper();

    const toastErrorRef = useRef(originalError);
    const toastSuccessRef = useRef(originalSuccess);
    const toastInfoRef = useRef(originalInfo);

    useEffect(() => {
        toastErrorRef.current = originalError;
        toastSuccessRef.current = originalSuccess;
        toastInfoRef.current = originalInfo;
    }, [originalError, originalSuccess, originalInfo]);

    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
    const maxReconnectionAttempts = 5;
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        appStateRef.current = appState;
    }, [appState]);

    const getReconnectDelay = useCallback((attempt: number) => {
        const baseDelay = 1000;
        const maxDelay = 16000;
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    }, []);

    const connectWebSocket = useCallback(async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!WS_URL || !API_URL) {
            console.error('WebSocket URL or API URL is not defined.');
            toastErrorRef.current(
                'Configuration Error',
                'WebSocket or API URL not set.'
            );
            return;
        }

        if (socketRef.current) {
            console.log(
                'WebSocket connection attempt skipped: already connected or in progress.'
            );
            return;
        }

        try {
            console.log(
                `Initializing session with ${API_URL}/api/init-session`
            );
            const sessionInitResponse = await fetch(
                `${API_URL}/api/init-session`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (!sessionInitResponse.ok) {
                console.error(
                    'Failed to initialize session:',
                    sessionInitResponse.status,
                    sessionInitResponse.statusText
                );
                toastErrorRef.current(
                    'Session Init Failed',
                    `Server error: ${sessionInitResponse.statusText}`
                );
                // Do not attempt to reconnect if session initialization itself fails critically.
                return;
            }
            const sessionData = await sessionInitResponse.json();
            console.log(
                'Session initialization/confirmation successful:',
                sessionData
            );

            console.log(`Attempting to connect WebSocket to ${WS_URL}`);
            const _socket = new WebSocket(WS_URL);

            socketRef.current = _socket;
            setSocket(_socket);

            _socket.onopen = () => {
                console.log('WebSocket connected');
                setIsReconnecting(false); // Reset reconnection state on successful open
                setReconnectionAttempts(0); // Reset attempts on successful open

                if (isReconnecting) {
                    // This flag might still be true if this open is from a reconnect attempt
                    toastSuccessRef.current(
                        'Reconnected successfully',
                        'Connection restored',
                        2000,
                        TOAST_ID_RECONNECTED
                    );
                } else {
                    toastSuccessRef.current('WebSocket connected');
                }
                // Send join-game message if applicable (moved out of isReconnecting block)
                if (appStateRef.current.game && appStateRef.current.table) {
                    const joinMessage = {
                        action: 'join-game',
                        gameID: appStateRef.current.table,
                    };

                    // Log outgoing WebSocket message for debugging
                    console.log('🔼 WebSocket Message Sent:', {
                        timestamp: new Date().toISOString(),
                        message: joinMessage,
                        stringified: JSON.stringify(joinMessage),
                    });

                    _socket.send(JSON.stringify(joinMessage));
                    console.log('Sent join-game message after connection.');
                }
            };

            _socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event);
                socketRef.current = null;
                setSocket(null);
                if (!event.wasClean) {
                    toastErrorRef.current(
                        'WebSocket disconnected unexpectedly'
                    );
                    attemptReconnection(); // Safe to call here
                } else {
                    toastInfoRef.current('WebSocket disconnected cleanly');
                }
            };

            _socket.onerror = (err) => {
                console.error('WebSocket error:', err);
                socketRef.current = null;
                setSocket(null);
                toastErrorRef.current(
                    'WebSocket error',
                    'An error occurred with the WebSocket connection.'
                );
                attemptReconnection(); // Safe to call here
            };

            _socket.onmessage = (e) => {
                // Log all incoming WebSocket messages for debugging
                console.log('🔽 WebSocket Message Received:', {
                    timestamp: new Date().toISOString(),
                    rawData: e.data,
                    parsedData: (() => {
                        try {
                            return JSON.parse(e.data);
                        } catch (error) {
                            return {
                                error: 'Failed to parse JSON',
                                data: e.data,
                            };
                        }
                    })(),
                });

                let eventData;
                try {
                    eventData = JSON.parse(e.data);
                } catch (error) {
                    console.error(
                        'Failed to parse WebSocket message as JSON:',
                        error
                    );
                    console.error('Raw WebSocket data:', e.data);
                    return; // Stop processing if JSON is invalid
                }

                // Handle pending_players_update first as it uses event.type
                if (eventData.type === 'pending_players_update') {
                    if (Array.isArray(eventData.payload)) {
                        dispatch({
                            type: 'setPendingPlayers',
                            payload: eventData.payload,
                        });
                    } else {
                        console.error(
                            'pending_players_update payload is not an array:',
                            eventData.payload
                        );
                        dispatch({ type: 'setPendingPlayers', payload: [] });
                    }
                    return; // Message handled
                }

                if (eventData.type === 'is_pending_player') {
                    // Handle is_pending_player message
                    if (eventData.payload !== undefined) {
                        dispatch({
                            type: 'setIsSeatRequested',
                            payload: eventData.payload, // true if the player is pending, false otherwise
                        });
                    } else {
                        console.error(
                            'is_pending_player is undefined',
                            eventData.payload
                        );
                        dispatch({
                            type: 'setIsSeatRequested',
                            payload: false,
                        });
                        return; // Message handled
                    }
                }

                switch (eventData.action) {
                    case 'new-message': {
                        const newMessage: Message = {
                            name: eventData.username,
                            message: eventData.message,
                            timestamp: eventData.timestamp,
                        };
                        dispatch({ type: 'addMessage', payload: newMessage });

                        // Only increment unread count if chat isn't open
                        if (!appStateRef.current.isChatOpen) {
                            dispatch({ type: 'incrementUnreadCount' });
                        }
                        return;
                    }
                    case 'new-log': {
                        const newLog: Log = {
                            message: eventData.message,
                            timestamp: eventData.timestamp,
                        };

                        dispatch({ type: 'addLog', payload: newLog });

                        // Check if the log message contains a confirmation of leave request
                        if (
                            eventData.message.includes(
                                'Request to leave table'
                            ) &&
                            eventData.message.includes('received')
                        ) {
                            dispatch({
                                type: 'setIsLeaveRequested',
                                payload: true,
                            });
                        }
                        return;
                    }
                    case 'update-game': {
                        const newGame: Game = {
                            running: eventData.game.running,
                            dealer: eventData.game.dealer,
                            action: eventData.game.action,
                            utg: eventData.game.utg,
                            sb: eventData.game.sb,
                            bb: eventData.game.bb,
                            communityCards: eventData.game.communityCards,
                            stage: eventData.game.stage,
                            betting: eventData.game.betting,
                            config: eventData.game.config,
                            players: eventData.game.players,
                            pots: eventData.game.pots,
                            minRaise: eventData.game.minRaise,
                            readyCount: eventData.game.readyCount,
                            paused: eventData.game.paused,
                            actionDeadline:
                                eventData.game?.actionDeadline ??
                                eventData.actionDeadline ??
                                0,
                        };
                        dispatch({ type: 'updateGame', payload: newGame });

                        // If player was just successfully seated, reset the flag
                        const isPlayerSeated = eventData.game.players?.some(
                            (p: Player) => {
                                return p.uuid === appStateRef.current.clientID;
                            }
                        );
                        if (
                            isPlayerSeated &&
                            appStateRef.current.isSeatRequested
                        ) {
                            dispatch({
                                type: 'setIsSeatRequested',
                                payload: false,
                            });
                        }
                        return;
                    }
                    case 'game-paused': {
                        toastInfoRef.current(
                            'Game Paused',
                            `Game paused by ${eventData.pausedBy || 'table owner'}.`,
                            5000
                        );
                        // The backend will also send a full 'update-game'.
                        // For immediate UI update, we can dispatch an update to the game state here.
                        if (appStateRef.current.game) {
                            const updatedGame = {
                                ...appStateRef.current.game,
                                paused: true,
                            };
                            dispatch({
                                type: 'updateGame',
                                payload: updatedGame,
                            });
                        }
                        return;
                    }
                    case 'game-resumed': {
                        toastSuccessRef.current(
                            'Game Resumed',
                            `Game resumed by ${eventData.resumedBy || 'table owner'}.`,
                            5000
                        );
                        if (appStateRef.current.game) {
                            const updatedGame = {
                                ...appStateRef.current.game,
                                paused: false,
                            };
                            dispatch({
                                type: 'updateGame',
                                payload: updatedGame,
                            });
                        }
                        return;
                    }
                    case 'update-player-uuid': {
                        dispatch({
                            type: 'updatePlayerID',
                            payload: eventData.uuid,
                        });
                        return;
                    }
                    case 'error':
                        // Handle error
                        toastErrorRef.current(
                            `Error ${eventData.code}: ${eventData.message}`
                        );
                        // If seat request was denied (message check), reset the flag
                        if (
                            (eventData.message === 'Seat request denied.' ||
                                eventData.message ===
                                    'A player is already requesting for this seat.') &&
                            appStateRef.current.isSeatRequested
                        ) {
                            dispatch({
                                type: 'setIsSeatRequested',
                                payload: false,
                            });
                        }
                        return;
                    default: {
                        console.warn(
                            `Unhandled action type: ${eventData.action}`
                        );
                        return;
                    }
                }
            };
        } catch (e) {
            console.error('Fatal error during WebSocket connection setup:', e);
            toastErrorRef.current(
                'Connection Error',
                'Could not establish WebSocket connection. Check console.'
            );
            // If the exception occurs during fetch or new WebSocket(), then attempt reconnection.
            attemptReconnection(); // Safe to call here
        }
    }, [
        WS_URL,
        appStateRef, // Added appStateRef to deps as it's used in onopen
        dispatch,
        isReconnecting, // Added isReconnecting
        // getReconnectDelay, reconnectionAttempts, maxReconnectionAttempts are for attemptReconnection
    ]);

    const attemptReconnection = useCallback(() => {
        if (!WS_URL || reconnectionAttempts >= maxReconnectionAttempts) {
            if (reconnectionAttempts >= maxReconnectionAttempts) {
                setIsReconnecting(false);
                toastErrorRef.current(
                    'Connection Failed',
                    'Max reconnection attempts reached. Please refresh.',
                    2000
                );
            }
            return;
        }
        if (isReconnecting) return; // Already trying to reconnect

        setIsReconnecting(true);
        const nextAttempt = reconnectionAttempts + 1;
        setReconnectionAttempts(nextAttempt);
        const delay = getReconnectDelay(reconnectionAttempts);

        toastInfoRef.current(
            'Attempting Reconnection',
            `Attempt ${nextAttempt}/${maxReconnectionAttempts} in ${delay / 1000}s`,
            delay,
            TOAST_ID_RECONNECTING
        );

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, delay);
    }, [
        WS_URL,
        reconnectionAttempts,
        maxReconnectionAttempts,
        getReconnectDelay,
        connectWebSocket,
        isReconnecting,
    ]);

    useEffect(() => {
        if (!socketRef.current && !isReconnecting) {
            // Also check isReconnecting to prevent multiple initial calls
            connectWebSocket();
        }
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                console.log('Closing WebSocket connection on unmount/cleanup.');
                socketRef.current.close(1000, 'Component unmounting'); // Clean close
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [connectWebSocket, isReconnecting]); // Added isReconnecting to dependencies

    // This useEffect is to ensure the socket state (used by context consumers) is updated
    // when socketRef.current changes. setSocket is batched by React.
    useEffect(() => {
        if (socketRef.current !== socket) {
            setSocket(socketRef.current);
        }
    }, [socket, socketRef.current]); // Watch socketRef.current as well

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}
