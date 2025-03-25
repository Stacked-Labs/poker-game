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
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);

    const loadPendingPlayers = useCallback(async () => {
        if (appState.table) {
            try {
                const players = await getPendingPlayers(appState.table);
                setPendingPlayers(players);
            } catch (error) {
                console.error('Error loading pending players:', error);
            }
        }
    }, [appState.table]);

    // Listen for socket events related to player status changes
    useEffect(() => {
        if (!socket) return;

        // Setup event listeners for player-related events
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
                    loadPendingPlayers();
                }
            } catch (e) {
                // Ignore malformed messages
            }
        };

        // Add the event listener
        socket.addEventListener('message', handleSocketMessage);

        // Cleanup function
        return () => {
            // Remove the event listener
            socket.removeEventListener('message', handleSocketMessage);
        };
    }, [socket, loadPendingPlayers]);

    // Load pending players on component mount and when table changes
    useEffect(() => {
        loadPendingPlayers();

        // Set up a polling interval to check for new pending players
        const intervalId = setInterval(() => {
            loadPendingPlayers();
        }, 10000); // Check every 10 seconds

        return () => clearInterval(intervalId);
    }, [loadPendingPlayers]);

    return {
        pendingPlayers,
        pendingCount: pendingPlayers.length,
        refreshPendingPlayers: loadPendingPlayers,
    };
};

export default usePendingPlayers;
