'use client'

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { useContext, useEffect, useState } from 'react';
import FooterWithActionButtons from './FooterWithActionButtons';
import EmptyFooter from './EmptyFooter';
import BlindObligationControls from './BlindObligationControls';
import ShowCardsFooter from './ShowCardsFooter';
import { revealCards } from '@/app/hooks/server_actions';

const Footer = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const [showCardsSubmitted, setShowCardsSubmitted] = useState(false);

    // Check if the current user is a spectator (not in the game)
    const isSpectator = () => {
        if (!appState.game || !appState.clientID) return true;

        // Check if the user exists in the players array with a valid seat
        // Backend uses 0-indexed seats (0-9)
        const userInGame = appState.game.players.some(
            (player) => player.uuid === appState.clientID && player.seatID >= 0
        );

        return !userInGame;
    };

    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    // Backend uses 0-indexed seats, seatID is already the array index
    const seatIndex = localPlayer?.seatID ?? -1;
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

    const game = appState.game;
    const inRevealWindow = Boolean(
        game &&
            game.running &&
            game.stage === 1 &&
            !game.betting &&
            game.actionDeadline === 0
    );

    useEffect(() => {
        if (!inRevealWindow) {
            setShowCardsSubmitted(false);
        }
    }, [inRevealWindow]);

    const hasRevealableCards = Boolean(
        localPlayer?.cards &&
            localPlayer.cards.length >= 2 &&
            Number(localPlayer.cards[0]) > 0 &&
            Number(localPlayer.cards[1]) > 0
    );

    const shouldShowCardsFooter = Boolean(
        socketConnected &&
            inRevealWindow &&
            localPlayer &&
            localPlayer.seatID >= 0 &&
            localPlayer.ready &&
            !localPlayer.sitOutNextHand &&
            !localPlayer.left &&
            hasRevealableCards &&
            !isSpectator()
    );

    const showCardsDisabled = Boolean(
        !socketConnected || showCardsSubmitted || localPlayer?.hasRevealed
    );

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
    ) : shouldShowCardsFooter ? (
        <ShowCardsFooter
            onShowCards={() => {
                if (socket) {
                    setShowCardsSubmitted(true);
                    revealCards(socket);
                }
            }}
            isDisabled={showCardsDisabled}
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
