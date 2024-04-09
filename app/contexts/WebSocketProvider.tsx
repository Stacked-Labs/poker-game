'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

/*  
WebSocket context creates a single connection to the server per client. 
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store. 
*/

export const SocketContext = createContext<WebSocket | null>(null);

type SocketProviderProps = {
    children: ReactNode;
};

export function SocketProvider(props: SocketProviderProps) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        // WebSocket api is browser side only.
        const isBrowser = typeof window !== 'undefined';
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

        if (isBrowser && WS_URL) {
            const _socket = new WebSocket(WS_URL);
            _socket.onopen = () => {
                console.log('websocket connected');
            };
            _socket.onclose = () => {
                console.log('websocket disconnected');
            };

            setSocket(_socket);

            return () => {
                _socket.close();
            };
        }
    }, []);

    return socket ? (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    ) : null;
}

export function useSocket() {
    const socket = useContext(SocketContext);
    return socket;
}
