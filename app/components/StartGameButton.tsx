import { useContext } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Box, Tooltip } from '@chakra-ui/react';
import ActionButton from './Footer/ActionButton';

const StartGameButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const players = appState.game?.players || [];
    const readyPlayers = players.filter((player) => player != null);

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
        }
    };

    if (!socket || !game) {
        return null;
    }

    return (
        <Tooltip
            bg="red.600"
            label={'Needs 2 or more players to start a game.'}
            isDisabled={game.running || readyPlayers.length >= 2}
            hasArrow
        >
            {/*Tooltip wont work if ActionButton is not wrapped */}
            <Box>
                <ActionButton
                    text={'Start'}
                    color={'white'}
                    clickHandler={() => onClickStartGame(socket)}
                    isDisabled={
                        (!game.running && readyPlayers.length < 2) ||
                        (game.running && readyPlayers.length >= 2)
                    }
                />
            </Box>
        </Tooltip>
    );
};

export default StartGameButton;
