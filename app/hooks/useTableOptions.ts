import { playerSetReady, playerSitOutNext, requestLeave } from './server_actions';

export const handleLeaveTable = (
    socket: WebSocket | null,
    toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void,
    isLeaveRequested?: boolean
) => {
    if (!socket) {
        return;
    }

    const isCancelling = Boolean(isLeaveRequested);
    requestLeave(socket);
    toast(
        isCancelling ? 'Leave request canceled' : 'Leave request sent',
        isCancelling
            ? 'You will remain in your seat.'
            : 'You will leave after this hand (or immediately between hands).',
        5000
    );
};

export const handleSitOutNext = (
    socket: WebSocket | null,
    // Confirmation is the footer flipping to the away pill; no toast (kept in the
    // signature so callers stay unchanged).
    _toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSitOutNext(socket);
};

export const handleReturnReady = (
    socket: WebSocket | null,
    // Confirmation is the footer reverting to the active state; no toast.
    _toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSetReady(socket);
};

export const handleCancelRejoin = (
    socket: WebSocket | null,
    // Confirmation is the footer toggling back to the away state; no toast.
    _toast: (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => void
) => {
    if (!socket) return;
    playerSetReady(socket);
};
