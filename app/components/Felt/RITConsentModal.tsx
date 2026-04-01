'use client';

import React, { useContext, useMemo } from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendRITConsent } from '@/app/hooks/server_actions';

const RIT_AWAITING_CONSENT = 1;

const RITConsentModal = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const game = appState.game;

    const isConsentPhase = game?.ritPhase === RIT_AWAITING_CONSENT;

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

    if (!isConsentPhase || !isMyConsent || hasResponded) return null;

    return (
        <Flex
            data-testid="rit-consent-modal"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
            width="100%"
            height="100%"
            sx={{
                '@media (orientation: portrait)': {
                    justifyContent: 'space-between',
                    padding: '1%',
                    maxHeight: '70px',
                    minHeight: '50px',
                },
                '@media (orientation: landscape)': {
                    justifyContent: 'flex-end',
                },
            }}
        >
            <Text
                color="white"
                fontWeight="bold"
                fontSize="sm"
                whiteSpace="nowrap"
            >
                Run it Twice?
            </Text>
            <Button
                data-testid="rit-accept-btn"
                colorScheme="green"
                size="sm"
                onClick={() => socket && sendRITConsent(socket, true)}
            >
                Yes
            </Button>
            <Button
                data-testid="rit-decline-btn"
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={() => socket && sendRITConsent(socket, false)}
            >
                No
            </Button>
        </Flex>
    );
};

export default RITConsentModal;
