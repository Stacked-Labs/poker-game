import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { isTableOwner, startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Button, Tooltip } from '@chakra-ui/react';

const StartGameButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const players = appState.game?.players || [];
    const readyPlayers = players.filter((player) => player != null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkTableOwner = async () => {
            if (appState.table && appState.clientID) {
                try {
                    const result = await isTableOwner(
                        appState.table,
                        appState.clientID
                    );
                    setIsOwner(result);
                } catch (error) {
                    console.error('Error checking table ownership:', error);
                    setIsOwner(false);
                }
            }
        };
        checkTableOwner();
    }, [appState.table, appState.clientID]);

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
        }
    };

    if (!socket || !game) {
        return null;
    }

    if (isOwner) {
        return null;
    }

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
            >
                Start
            </Button>
        </Tooltip>
    );
};

export default StartGameButton;
