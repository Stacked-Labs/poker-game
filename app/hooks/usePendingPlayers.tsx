import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { PendingPlayer } from '@/app/interfaces';
import { getPendingPlayers } from './server_actions';
import { SocketContext } from '@/app/contexts/WebSocketProvider';

/**
 * Hook to manage and fetch pending players
 * Provides functionality to get and update pending players count
 */
const usePendingPlayers = () => {
    const [pendingPlayers, setPendingPlayers] = useState<PendingPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);

    const loadPendingPlayers = useCallback(async () => {
        if (appState.table) {
            try {
                setIsLoading(true);
                const players = await getPendingPlayers(appState.table);
                setPendingPlayers(players);
            } catch (error) {
                console.error('Error loading pending players:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [appState.table]);

    // Listen for socket events related to player status changes
    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                // These are common actions that might affect pending players
                if (
                    data.action === 'player-join' ||
                    data.action === 'player-leave' ||
                    data.action === 'accept-player' ||
                    data.action === 'deny-player' ||
                    data.action === 'request-seat' ||
                    data.action === 'kick-player' ||
                    data.action === 'player-kicked' ||
                    data.action === 'table-update'
                ) {
                    // Immediately update pending players on relevant events
                    loadPendingPlayers();
                }
            } catch (e) {
                // Ignore malformed messages
            }
        };

        socket.addEventListener('message', handleSocketMessage);

        return () => {
            socket.removeEventListener('message', handleSocketMessage);
        };
    }, [socket, loadPendingPlayers]);

    // Initial load and periodic refresh
    useEffect(() => {
        loadPendingPlayers();

        // Reduce polling interval to 5 seconds for more responsive updates
        const intervalId = setInterval(loadPendingPlayers, 5000);

        return () => clearInterval(intervalId);
    }, [loadPendingPlayers]);

    return {
        pendingPlayers,
        pendingCount: pendingPlayers.length,
        refreshPendingPlayers: loadPendingPlayers,
        isLoading,
    };
};

export default usePendingPlayers;
