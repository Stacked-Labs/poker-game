'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendRITConsent } from '@/app/hooks/server_actions';

const RIT_AWAITING_CONSENT = 1;

const RITConsentModal = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const game = appState.game;

    const [remainingSeconds, setRemainingSeconds] = useState(10);

    const isConsentPhase = game?.ritPhase === RIT_AWAITING_CONSENT;
    const deadline = game?.ritConsentDeadline ?? 0;

    // Determine if current player is in the consent set
    const myPlayerIndex = useMemo(() => {
        if (!game?.players || !appState.clientID) return -1;
        return game.players.findIndex((p) => p.uuid === appState.clientID);
    }, [game?.players, appState.clientID]);

    const isMyConsent = useMemo(() => {
        if (!isConsentPhase || myPlayerIndex < 0 || !game?.ritConsent) return false;
        return myPlayerIndex in game.ritConsent;
    }, [isConsentPhase, myPlayerIndex, game?.ritConsent]);

    const hasResponded = useMemo(() => {
        if (!isMyConsent || !game?.ritConsent) return false;
        return game.ritConsent[myPlayerIndex] === true;
    }, [isMyConsent, myPlayerIndex, game?.ritConsent]);

    // Countdown timer
    useEffect(() => {
        if (!isConsentPhase || !deadline) {
            setRemainingSeconds(10);
            return;
        }
        const update = () => {
            const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            setRemainingSeconds(left);
        };
        update();
        const interval = setInterval(update, 250);
        return () => clearInterval(interval);
    }, [isConsentPhase, deadline]);

    if (!isConsentPhase || !isMyConsent || hasResponded) return null;

    return (
        <Box
            data-testid="rit-consent-modal"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={100}
            bg="rgba(0, 0, 0, 0.9)"
            borderRadius="16px"
            border="2px solid"
            borderColor="green.400"
            p={4}
            textAlign="center"
            minW="220px"
            boxShadow="0 0 30px rgba(72, 187, 120, 0.3)"
        >
            <Text color="white" fontWeight="bold" fontSize="lg" mb={1}>
                Run It Twice?
            </Text>
            <Text color="gray.300" fontSize="sm" mb={3}>
                {remainingSeconds}s remaining
            </Text>
            <Flex gap={3} justify="center">
                <Button
                    data-testid="rit-accept-btn"
                    colorScheme="green"
                    size="sm"
                    onClick={() => socket && sendRITConsent(socket, true)}
                >
                    Accept
                </Button>
                <Button
                    data-testid="rit-decline-btn"
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => socket && sendRITConsent(socket, false)}
                >
                    Decline
                </Button>
            </Flex>
        </Box>
    );
};

export default RITConsentModal;
