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
    const { dispatch } = useContext(AppContext);
    const socketRef = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
    const { authToken } = useAuth(); // Consume AuthContext

    useEffect(() => {
        if (!WS_URL) return;

        const connectWebSocket = () => {
            if (socketRef.current) {
                console.log('WebSocket already connected');
                return;
            }

            if (!authToken) {
                console.log('No auth token, cannot connect WebSocket');
                return;
            }

            const _socket = new WebSocket(`${WS_URL}?token=${authToken}`);
            socketRef.current = _socket;
            setSocket(_socket);

            _socket.onopen = () => {
                console.log('WebSocket connected');
            };

            _socket.onclose = () => {
                console.log('WebSocket disconnected');
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
                    default: {
                        console.warn(`Unhandled action type: ${event.action}`);
                        return;
                    }
                }
            };
        };

        // Attempt to connect if token exists
        if (authToken) {
            connectWebSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [WS_URL, authToken]);

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
