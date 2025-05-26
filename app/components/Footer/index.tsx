import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { useContext, useState } from 'react';
import FooterWithActionButtons from './FooterWithActionButtons';
import EmptyFooter from './EmptyFooter';

const Footer = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const gameIsPaused = appState.game?.paused || false;

    // Check if the current user is a spectator (not in the game)
    const isSpectator = () => {
        if (!appState.game || !appState.clientID) return true;

        // Check if the user exists in the players array with a valid seat
        const userInGame = appState.game.players.some(
            (player) => player.uuid === appState.clientID && player.seatID > 0
        );

        return !userInGame;
    };

    if (
        appState.game &&
        appState.game.running &&
        !appState.game.betting == false &&
        !isSpectator()
    ) {
        return (
            <FooterWithActionButtons
                isCurrentTurn={
                    appState.clientID ===
                    appState.game.players[appState.game.action].uuid
                }
            />
        );
    }

    return <EmptyFooter />;
};

export default Footer;
