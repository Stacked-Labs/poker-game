'use client';

import {
    createContext,
    ReactNode,
    useEffect,
    useState,
    useContext,
    useRef,
    useCallback,
} from 'react';
import { Message, Game, Log, Player } from '@/app/interfaces';
import { AppContext } from './AppStoreProvider';
import useToastHelper from '../hooks/useToastHelper';

/*  
WebSocket context creates a single connection to the server per client. 
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store. 
*/

export const SocketContext = createContext<WebSocket | null>(null);

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
    const { error, success, info, warning } = useToastHelper();

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
        const exponentialDelay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s, 8s, 16s (max)
        return Math.min(exponentialDelay, maxDelay);
    }, []);

    const attemptReconnection = useCallback(() => {
        if (!WS_URL || reconnectionAttempts >= maxReconnectionAttempts) {
            if (reconnectionAttempts >= maxReconnectionAttempts) {
                setIsReconnecting(false);
                error(
                    'Connection failed',
                    'Maximum reconnection attempts reached. Please refresh the page.',
                    2000
                );
            }
            return;
        }

        setIsReconnecting(true);
        const nextAttempt = reconnectionAttempts + 1;
        setReconnectionAttempts(nextAttempt);

        const delay = getReconnectDelay(reconnectionAttempts);

        info(
            'Attempting to reconnect',
            `Reconnection attempt ${nextAttempt}/${maxReconnectionAttempts} in ${delay / 1000}s`,
            delay,
            TOAST_ID_RECONNECTING
        );

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, delay);
    }, [WS_URL, reconnectionAttempts, maxReconnectionAttempts]);

    const connectWebSocket = useCallback(() => {
        if (!WS_URL) return;

        if (socketRef.current) {
            console.log('WebSocket already connected');
            return;
        }

        const _socket = new WebSocket(WS_URL);

        socketRef.current = _socket;
        setSocket(_socket);

        _socket.onopen = () => {
            console.log('WebSocket connected');

            if (isReconnecting) {
                success(
                    'Reconnected successfully',
                    'Connection restored',
                    2000,
                    TOAST_ID_RECONNECTED
                );
                setIsReconnecting(false);
                setReconnectionAttempts(0);

                if (appStateRef.current.game) {
                    const joinMessage = {
                        action: 'join-game',
                        gameID: appStateRef.current.table,
                    };
                    _socket.send(JSON.stringify(joinMessage));
                }
            } else {
                success('WebSocket connected');
            }
        };

        _socket.onclose = (event) => {
            if (!event.wasClean) {
                socketRef.current = null;
                setSocket(null);
                attemptReconnection();
            } else {
                error('WebSocket disconnected');
                console.log('WebSocket disconnected', event);
                socketRef.current = null;
                setSocket(null);
            }
        };

        _socket.onerror = (err) => {
            console.error('WebSocket error:', err);
            socketRef.current = null;
            setSocket(null);
            attemptReconnection();
        };

        _socket.onmessage = (e) => {
            const event = JSON.parse(e.data);
            switch (event.action) {
                case 'new-message': {
                    const newMessage: Message = {
                        name: event.username,
                        message: event.message,
                        timestamp: event.timestamp,
                    };
                    dispatch({ type: 'addMessage', payload: newMessage });

                    // Only increment unread count if chat isn't open
                    if (!appState.isChatOpen) {
                        dispatch({ type: 'incrementUnreadCount' });
                    }
                    return;
                }
                case 'new-log': {
                    const newLog: Log = {
                        message: event.message,
                        timestamp: event.timestamp,
                    };

                    dispatch({ type: 'addLog', payload: newLog });

                    // Check if the log message contains a confirmation of leave request
                    if (
                        event.message.includes('Request to leave table') &&
                        event.message.includes('received')
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
                        running: event.game.running,
                        dealer: event.game.dealer,
                        action: event.game.action,
                        utg: event.game.utg,
                        sb: event.game.sb,
                        bb: event.game.bb,
                        communityCards: event.game.communityCards,
                        stage: event.game.stage,
                        betting: event.game.betting,
                        config: event.game.config,
                        players: event.game.players,
                        pots: event.game.pots,
                        minRaise: event.game.minRaise,
                        readyCount: event.game.readyCount,
                    };
                    dispatch({ type: 'updateGame', payload: newGame });

                    // If player was just successfully seated, reset the flag
                    const isPlayerSeated = event.game.players?.some(
                        (p: Player) => {
                            return p.uuid === appStateRef.current.clientID;
                        }
                    );
                    if (isPlayerSeated && appStateRef.current.isSeatRequested) {
                        dispatch({
                            type: 'setIsSeatRequested',
                            payload: false,
                        });
                    }
                    return;
                }
                case 'update-player-uuid': {
                    dispatch({
                        type: 'updatePlayerID',
                        payload: event.uuid,
                    });
                    return;
                }
                case 'error':
                    // Handle error
                    error(`Error ${event.code}: ${event.message}`);
                    // If seat request was denied (message check), reset the flag
                    if (
                        event.message === 'Seat request denied.' &&
                        appStateRef.current.isSeatRequested
                    ) {
                        dispatch({
                            type: 'setIsSeatRequested',
                            payload: false,
                        });
                    }
                    return;
                default: {
                    console.warn(`Unhandled action type: ${event.action}`);
                    return;
                }
            }
        };
    }, [WS_URL, isReconnecting, attemptReconnection]);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [connectWebSocket]);

    // Update the socket state with the ref
    useEffect(() => {
        if (socketRef.current !== socket) {
            setSocket(socketRef.current);
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}
