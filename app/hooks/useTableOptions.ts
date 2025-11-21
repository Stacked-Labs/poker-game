import {
    playerSetReady,
    playerSitOutNext,
    requestLeave,
    sendLog,
} from './server_actions';

export const handleLeaveTable = (
    socket: WebSocket | null,
    username: string | null,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void,
    isLeaveRequested?: boolean
) => {
    if (socket != null && username != null) {
        const isCancelling = Boolean(isLeaveRequested);
        requestLeave(socket);
        const logMessage = isCancelling
            ? `${username} canceled their leave request`
            : `${username} requested to leave the table`;
        sendLog(socket, logMessage);
        toast(
            isCancelling ? 'Leave request canceled' : 'Leave request sent',
            isCancelling
                ? 'You will remain in your seat.'
                : 'You will leave after this hand (or immediately between hands).',
            5000
        );
    }
};

export const handleSitOutNext = (
    socket: WebSocket | null,
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
    playerSetReady(socket);
    toast("I'm Back", '', 3000);
};

export const handleCancelRejoin = (
    socket: WebSocket | null,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSetReady(socket);
    toast('Rejoin Cancelled', '', 3000);
};
