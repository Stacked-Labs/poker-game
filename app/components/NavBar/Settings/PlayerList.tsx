'use client';

import {
    acceptPlayer,
    denyPlayer,
    getPendingPlayers,
    kickPlayer,
} from '@/app/hooks/server_actions';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import PendingPlayers from './PendingPlayers';
import AcceptedPlayers from './AcceptedPlayers';
import { VStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';

const PlayerList = () => {
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const toast = useToastHelper();

    const loadPendingPlayers = useCallback(async () => {
        if (appState.table) {
            const players = await getPendingPlayers(appState.table);
            setPendingPlayers(players);
        }
    }, []);

    const handleAcceptPlayer = async (uuid: string) => {
        if (socket && uuid && appState.table) {
            acceptPlayer(socket, uuid, appState.table);
            loadPendingPlayers();
        } else {
            toast.error('Unable to accept player.');
        }
    };

    const handleDenyPlayer = async (uuid: string) => {
        if (socket && uuid && appState.table) {
            denyPlayer(socket, uuid, appState.table);
            loadPendingPlayers();
        } else {
            toast.error('Unable to kick player.');
        }
    };

    const handleKickPlayer = async (uuid: string, seatId: number) => {
        if (uuid && appState.table && socket) {
            kickPlayer(socket, uuid, seatId, appState.table);
        } else {
            toast.error('Unable to kick player.');
        }
    };

    useEffect(() => {
        loadPendingPlayers();
    }, [loadPendingPlayers]);

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
