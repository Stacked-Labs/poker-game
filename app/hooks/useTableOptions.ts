import {
    playerSetReady,
    playerSitOutNext,
    requestLeave,
    sendLog,
} from './server_actions';
import { ACTIONTYPE } from '../contexts/AppStoreProvider';

export const handleLeaveTable = (
    socket: WebSocket | null,
    username: string | null,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (socket != null && username != null) {
        requestLeave(socket);
        sendLog(socket, `${username} requested to leave the table`);
        toast(
            'Leave request sent',
            'You will be removed after this hand.',
            5000
        );
    }
};

export const handleSitOutNext = (
    socket: WebSocket | null,
    dispatch: (value: ACTIONTYPE) => void,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSitOutNext(socket);
    toast('Away...', '', 3000);
    dispatch({ type: 'setIsSitOutNext', payload: true });
};

export const handleReturnReady = (
    socket: WebSocket | null,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSetReady(socket, true);
    toast("I'm Back", '', 3000);
};
