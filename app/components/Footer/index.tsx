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

        // Debug logging for clientID vs player UUID mismatch
        console.log('🔍 Footer Debug - Spectator Check:', {
            clientID: appState.clientID,
            players: appState.game.players.map((p) => ({
                uuid: p.uuid,
                address: p.address,
                seatID: p.seatID,
                username: p.username,
            })),
            gameRunning: appState.game.running,
            gameBetting: appState.game.betting,
            gameAction: appState.game.action,
        });

        // Check if the user exists in the players array with a valid seat
        const userInGame = appState.game.players.some(
            (player) => player.uuid === appState.clientID && player.seatID > 0
        );

        console.log('🔍 Footer Debug - Spectator Result:', {
            userInGame,
            isSpectator: !userInGame,
            clientIDMatches: appState.game.players.some(
                (p) => p.uuid === appState.clientID
            ),
            clientIDAddressMatches: appState.game.players.some(
                (p) => p.address === appState.clientID
            ),
        });

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
