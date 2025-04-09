'use client';

import {
    acceptPlayer,
    denyPlayer,
    isTableOwner,
    kickPlayer,
} from '@/app/hooks/server_actions';
import React, { useContext, useEffect, useState } from 'react';
import PendingPlayers from './PendingPlayers';
import AcceptedPlayers from './AcceptedPlayers';
import { VStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import usePendingPlayers from '@/app/hooks/usePendingPlayers';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';

const PlayerList = () => {
    const { pendingPlayers, refreshPendingPlayers } = usePendingPlayers();
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const toast = useToastHelper();
    const isOwner = useIsTableOwner();

    const handleAcceptPlayer = async (uuid: string) => {
        if (!isOwner) {
            toast.error(
                'Unable to accept player',
                'Only table owner can accept a player.'
            );
            return;
        }

        if (socket && uuid && appState.table) {
            // Find player name from pending players list
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            // Send accept request to server
            acceptPlayer(socket, uuid, appState.table);
            refreshPendingPlayers();

            // Show success toast
            toast.success(
                `Player ${playerIdentifier} accepted`,
                'Player will now be seated at the table',
                3000
            );
        } else {
            toast.error('Unable to accept player', 'Please try again');
        }
    };

    const handleDenyPlayer = async (uuid: string) => {
        if (!isOwner) {
            toast.error(
                'Unable to deny player',
                'Only table owner can deny a player.'
            );
            return;
        }

        if (socket && uuid && appState.table) {
            // Find player name from pending players list
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            // Send deny request to server
            denyPlayer(socket, uuid, appState.table);
            refreshPendingPlayers();

            // Show info toast
            toast.info(
                `Player ${playerIdentifier} request denied`,
                'Player has been removed from the queue',
                3000
            );
        } else {
            toast.error('Unable to deny player request', 'Please try again');
        }
    };

    const handleKickPlayer = async (uuid: string, seatId: number) => {
        try {
            if (uuid && appState.table && socket) {
                // Find player's display name or ID to show in toast
                const kickedPlayer = appState.game?.players?.find(
                    (player) => player.uuid === uuid
                );
                const playerIdentifier =
                    kickedPlayer?.username || uuid.substring(0, 8);

                // Show initial "kicking" toast
                toast.warning(
                    `Kicking player ${playerIdentifier}...`,
                    'Please wait while we remove the player',
                    2000
                );

                // Send kick request to server
                kickPlayer(socket, uuid, seatId, appState.table);
            } else {
                toast.error('Unable to kick player', 'Please try again');
            }
        } catch (error) {
            console.error('Error kicking player:', error);
            toast.error(
                'Failed to kick player',
                'An error occurred. Please try again.'
            );
        }
    };

    return (
        <VStack gap={5}>
            <PendingPlayers
                pendingPlayers={pendingPlayers}
                handleAcceptPlayer={handleAcceptPlayer}
                handleDenyPlayer={handleDenyPlayer}
            />
            <AcceptedPlayers
                acceptedPlayers={appState.game?.players}
                handleKickPlayer={handleKickPlayer}
                isOwner={isOwner}
            />
        </VStack>
    );
};

export default PlayerList;
