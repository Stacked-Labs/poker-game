'use client';

import { acceptPlayer, denyPlayer } from '@/app/hooks/server_actions';
import React, { useCallback, useEffect, useState } from 'react';
import PendingPlayers from './PendingPlayers';
import {
    fetcAcceptedPlayers,
    fetchPendingPlayers,
} from '@/app/utils/fetchPlayers';
import AcceptedPlayers from './AcceptedPlayers';
import { VStack } from '@chakra-ui/react';

const PlayerList = () => {
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [acceptedPlayers, setAcceptedPlayers] = useState([]);

    const loadPendingPlayers = useCallback(async () => {
        const players = await fetchPendingPlayers();
        setPendingPlayers(players);
    }, []);

    const loadAcceptedPlayers = useCallback(async () => {
        const players = await fetcAcceptedPlayers();
        setAcceptedPlayers(players);
    }, []);

    const handleAcceptPlayer = async (uuid: string) => {
        if (uuid) {
            await acceptPlayer(uuid);
            await loadPendingPlayers();
            await loadAcceptedPlayers();
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
        loadAcceptedPlayers();
    }, [loadPendingPlayers, loadAcceptedPlayers]);

    return (
        <VStack gap={5}>
            <PendingPlayers
                pendingPlayers={pendingPlayers}
                handleAcceptPlayer={handleAcceptPlayer}
                handleDenyPlayer={handleDenyPlayer}
            />
            <AcceptedPlayers
                acceptedPlayers={acceptedPlayers}
                handleKickPlayer={handleKickPlayer}
            />
        </VStack>
    );
};

export default PlayerList;
