import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { isTableOwner, startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Button, Tooltip } from '@chakra-ui/react';
import useIsTableOwner from '../hooks/useIsTableOwner';

const StartGameButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const players = appState.game?.players || [];
    const readyPlayers = players.filter((player) => player != null);
    const isOwner = useIsTableOwner();

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
        }
    };

    if (!socket || !game || !isOwner) {
        return null;
    }

    if (isOwner) {
        return (
            <Tooltip
                bg="red.600"
                label={'Needs 2 or more players to start a game.'}
                isDisabled={game.running || readyPlayers.length >= 2}
                hasArrow
            >
                <Button
                    size="lg"
                    color={'white'}
                    borderColor={'white'}
                    paddingX={{ base: 8, md: 12 }}
                    onClick={() => onClickStartGame(socket)}
                    isDisabled={
                        (!game.running && readyPlayers.length < 2) ||
                        (game.running && readyPlayers.length >= 2)
                    }
                    display={game.running ? 'none' : 'inline-flex'}
                >
                    Start
                </Button>
            </Tooltip>
        );
    }
};

export default StartGameButton;
