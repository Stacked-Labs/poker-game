'use client';

import {
    acceptPlayer,
    denyPlayer,
    leaveTable,
    sendLog,
} from '@/app/hooks/server_actions';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import PendingPlayers from './PendingPlayers';
import { fetchPendingPlayers } from '@/app/utils/fetchPlayers';
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
        const players = await fetchPendingPlayers();
        setPendingPlayers(players);
    }, []);

    const handleAcceptPlayer = async (uuid: string) => {
        if (uuid) {
            await acceptPlayer(uuid);
            await loadPendingPlayers();
        }
    };

    const handleDenyPlayer = async (uuid: string) => {
        if (uuid) {
            await denyPlayer(uuid);
            await loadPendingPlayers();
        }
    };

    const handleKickPlayer = async (uuid: string) => {};

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
