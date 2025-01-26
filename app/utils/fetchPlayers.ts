import { getPendingPlayers } from '../hooks/server_actions';

export interface PendingPlayer {
    uuid: string;
    username: string;
    seatId: number;
    buyIn: number;
}

export const fetchPendingPlayers = async () => {
    try {
        const data = await getPendingPlayers();
        return data;
    } catch (error) {
        console.error('Failed to fetch pending players:', error);
    }

    return null;
};
