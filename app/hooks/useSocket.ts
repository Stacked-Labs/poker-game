import { useContext } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';

export function useSocket() {
    const socket = useContext(SocketContext);
    return socket;
}
