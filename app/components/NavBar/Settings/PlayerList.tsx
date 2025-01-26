'use client';

import { acceptPlayer } from '@/app/hooks/server_actions';
import React, { useEffect, useState } from 'react';
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

    const handleAcceptPlayer = async (uuid: string) => {
        if (uuid) {
            await acceptPlayer(uuid);
        }
    };

    const handleDenyPlayer = async (uuid: string) => {};

    const handleKickPlayer = async (uuid: string) => {};

    useEffect(() => {
        const loadPendingPlayers = async () => {
            const players = await fetchPendingPlayers();
            setPendingPlayers(players);
        };

        const loadAcceptedPlayers = async () => {
            const players = await fetcAcceptedPlayers();
            setAcceptedPlayers(players);
        };

        loadPendingPlayers();
        loadAcceptedPlayers();
    }, [pendingPlayers, acceptedPlayers]);

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
