'use client';

import {
    createContext,
    ReactChild,
    useEffect,
    useState,
    useContext,
    useRef,
} from 'react';
import { Message, Game, Log } from '@/app/interfaces';
import { AppContext } from './AppStoreProvider';
import useToastHelper from '../hooks/useToastHelper';
import { useAuth } from './AuthContext';

/*  
WebSocket context creates a single connection to the server per client. 
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store. 
*/

export const SocketContext = createContext<WebSocket | null>(null);

type SocketProviderProps = {
    children: ReactChild;
};

export function SocketProvider(props: SocketProviderProps) {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { appState, dispatch } = useContext(AppContext);
    const socketRef = useRef<WebSocket | null>(null);
    const { error, success } = useToastHelper();
    const { isAuthenticated } = useAuth();

    // Connect to WebSocket immediately without authentication
    useEffect(() => {
        if (!WS_URL) return;

        const connectWebSocket = () => {
            if (socketRef.current) {
                console.log('WebSocket already connected');
                return;
            }

            const _socket = new WebSocket(WS_URL);

            socketRef.current = _socket;
            setSocket(_socket);

            _socket.onopen = () => {
                console.log('WebSocket connected');
                success('WebSocket connected');
            };

            _socket.onclose = (event) => {
                console.log('WebSocket disconnected');
                error('WebSocket disconnected');
                socketRef.current = null;
                setSocket(null);
            };

            _socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                socketRef.current = null;
                setSocket(null);
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
                        return;
                    }
                    case 'update-player-uuid': {
                        dispatch({
                            type: 'updatePlayerID',
                            payload: event.uuid,
                        });
                        return;
                    }
                    case 'auth-success': {
                        // Handle successful authentication
                        console.log(
                            'Authentication successful for address:',
                            event.address
                        );
                        success('Authentication successful');
                        return;
                    }
                    case 'error':
                        // Handle error
                        error(`Error ${event.code}: ${event.message}`);
                        break;
                    default: {
                        console.warn(`Unhandled action type: ${event.action}`);
                        return;
                    }
                }
            };
        };

        // Always try to connect, whether authenticated or not
        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [WS_URL]);

    // Handle authentication after connection is established
    useEffect(() => {
        if (
            isAuthenticated &&
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            // Get auth token from cookies
            const getCookie = (name: string) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop()?.split(';').shift();
                return undefined;
            };

            const authToken = getCookie('auth_token');
            if (authToken) {
                // Send authentication message to server
                socketRef.current.send(
                    JSON.stringify({
                        action: 'authenticate',
                        token: authToken,
                    })
                );
                console.log('Sent authentication request to server');
            }
        }
    }, [isAuthenticated, socket?.readyState]);

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
