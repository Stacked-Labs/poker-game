import { getPendingPlayers } from '../hooks/server_actions';

export interface PendingPlayer {
    uuid: string;
    username: string;
    seatId: number;
    buyIn: number;
    isAccepted: boolean;
}

export const fetchPendingPlayers = async () => {
    try {
        const data = await getPendingPlayers();
        return data.filter((player: PendingPlayer) => !player.isAccepted);
    } catch (error) {
        console.error('Failed to fetch pending players:', error);
    }

    return null;
};

export const fetcAcceptedPlayers = async () => {
    try {
        const data = await getPendingPlayers();
        return data.filter((player: PendingPlayer) => player.isAccepted);
    } catch (error) {
        console.error('Failed to fetch accepted players:', error);
    }

    return null;
};
