'use client'

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { useContext } from 'react';
import FooterWithActionButtons from './FooterWithActionButtons';
import EmptyFooter from './EmptyFooter';
import BlindObligationControls from './BlindObligationControls';
import { Flex } from '@chakra-ui/react';

const Footer = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);

    // Check if the current user is a spectator (not in the game)
    const isSpectator = () => {
        if (!appState.game || !appState.clientID) return true;

        // Check if the user exists in the players array with a valid seat
        const userInGame = appState.game.players.some(
            (player) => player.uuid === appState.clientID && player.seatID > 0
        );

        return !userInGame;
    };

    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const seatIndex = localPlayer ? localPlayer.seatID - 1 : -1;
    const owesSB =
        seatIndex >= 0 ? Boolean(appState.game?.owesSB?.[seatIndex]) : false;
    const owesBB =
        seatIndex >= 0 ? Boolean(appState.game?.owesBB?.[seatIndex]) : false;
    const waitingForBB =
        seatIndex >= 0
            ? Boolean(appState.game?.waitingForBB?.[seatIndex])
            : false;
    const hasBlindObligation =
        !!localPlayer &&
        (owesSB || owesBB || waitingForBB || appState.blindObligation);

    const socketConnected = Boolean(socket);

    const isInHand = Boolean(localPlayer?.in);

    const showActionButtons =
        socketConnected &&
        appState.game &&
        appState.game.running &&
        !appState.game.betting == false &&
        !isSpectator() &&
        !hasBlindObligation &&
        isInHand;

    const content = showActionButtons ? (
        <FooterWithActionButtons
            isCurrentTurn={
                appState.clientID ===
                appState.game!.players[appState.game!.action].uuid
            }
        />
    ) : hasBlindObligation ? null : (
        <EmptyFooter />
    );

    return (
        <>
            <BlindObligationControls />
            {content}
        </>
    );
};

export default Footer;
