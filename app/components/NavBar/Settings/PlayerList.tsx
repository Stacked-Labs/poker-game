'use client';

import {
    acceptPlayer,
    denyPlayer,
    kickPlayer,
} from '@/app/hooks/server_actions';
import React, { useContext } from 'react';
import PendingPlayers from './PendingPlayers';
import AcceptedPlayers from './AcceptedPlayers';
import { VStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';

const PlayerList = () => {
    const { appState } = useContext(AppContext);
    const pendingPlayers = appState.pendingPlayers || [];
    const socket = useContext(SocketContext);
    const toast = useToastHelper();

    const handleAcceptPlayer = async (uuid: string) => {
        if (socket && uuid && appState.table) {
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            acceptPlayer(socket, uuid, appState.table);

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
        if (socket && uuid && appState.table) {
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            denyPlayer(socket, uuid, appState.table);

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
                const kickedPlayer = appState.game?.players?.find(
                    (player) => player.uuid === uuid
                );
                const playerIdentifier =
                    kickedPlayer?.username || uuid.substring(0, 8);

                toast.warning(
                    `Kicking player ${playerIdentifier}...`,
                    'Please wait while we remove the player',
                    2000
                );

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
            />
        </VStack>
    );
};

export default PlayerList;
