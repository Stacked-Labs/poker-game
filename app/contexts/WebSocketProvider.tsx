import {
    createContext,
    ReactChild,
    useEffect,
    useState,
    useContext,
} from 'react';
import { Message, Game, Log } from '@/app/interfaces';
import { AppContext } from './AppStoreProvider';

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

    useEffect(() => {
        if (!WS_URL) return;

        const connectWebSocket = () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const _socket = new WebSocket(`${WS_URL}?token=${token}`);

            _socket.onopen = () => {
                console.log('WebSocket connected');
                setSocket(_socket);
            };

            _socket.onclose = () => {
                console.log('WebSocket disconnected');
                setSocket(null);
            };

            _socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setSocket(null);
            };
        };

        window.addEventListener('authenticationComplete', connectWebSocket);
        
        // Attempt to connect if token already exists
        connectWebSocket();

        return () => {
            window.removeEventListener('authenticationComplete', connectWebSocket);
            socket?.close();
        };
    }, [WS_URL]);

    if (!WS_URL) {
        return null;
    }

    if (socket) {
        socket.onmessage = (e) => {
            const event = JSON.parse(e.data);
            switch (event.action) {
                case 'new-message':
                    // eslint-disable-next-line no-case-declarations
                    const newMessage: Message = {
                        name: event.username,
                        message: event.message,
                        timestamp: event.timestamp,
                    };
                    dispatch({ type: 'addMessage', payload: newMessage });
                    return;
                case 'new-log':
                    // eslint-disable-next-line no-case-declarations
                    const newLog: Log = {
                        message: event.message,
                        timestamp: event.timestamp,
                    };
                    dispatch({ type: 'addLog', payload: newLog });
                    return;
                case 'update-game':
                    // eslint-disable-next-line no-case-declarations
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
                case 'update-player-uuid':
                    dispatch({ type: 'updatePlayerID', payload: event.uuid });
                    return;
                default:
                    throw new Error();
            }
        };
    }

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}
