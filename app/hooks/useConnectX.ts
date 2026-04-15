'use client';

import { useContext, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { refreshXIdentity } from '@/app/hooks/server_actions';

/**
 * Reusable X (Twitter) account connection hook.
 *
 * Opens the `/auth/x` OAuth popup, listens for the `x_oauth_result` postMessage
 * reply, and refreshes auth state + notifies the game socket so the player's
 * new identity (avatar + @username) fans out to other seats immediately.
 *
 * Used in:
 *   - Settings → ConnectXSection (primary entry point)
 *   - TakeSeatModal (optional connect during seat request)
 *   - Leaderboard → PlayerCard (connect link from current user row)
 */
export const useConnectX = () => {
    const { refreshXStatus } = useAuth();
    const socket = useContext(SocketContext);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    const connectX = () => {
        setIsConnecting(true);
        let handled = false;
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
            `${backendUrl}/auth/x`,
            'x_oauth',
            `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );

        const onComplete = () => {
            if (handled) return;
            handled = true;
            refreshXStatus().then(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    refreshXIdentity(socket);
                }
            });
        };

        const handler = (event: MessageEvent) => {
            if (event.data?.type !== 'x_oauth_result') return;
            window.removeEventListener('message', handler);
            setIsConnecting(false);
            if (event.data.status === 'success') {
                onComplete();
            }
        };
        window.addEventListener('message', handler);

        // Fallback: popup closed without postMessage
        const pollClosed = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(pollClosed);
                window.removeEventListener('message', handler);
                setIsConnecting(false);
                onComplete();
            }
        }, 500);
    };

    const disconnectX = async () => {
        setIsDisconnecting(true);
        try {
            await fetch(`${backendUrl}/auth/x`, {
                method: 'DELETE',
                credentials: 'include',
            });
            await refreshXStatus();
        } catch (err) {
            console.error('Failed to disconnect X account:', err);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return {
        connectX,
        disconnectX,
        isConnecting,
        isDisconnecting,
    };
};
