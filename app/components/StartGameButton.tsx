import { useContext } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Player } from '../interfaces';
import { Button, Tooltip } from '@chakra-ui/react';

const StartGameButton = ({ players }: { players: (Player | null)[] }) => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const readyPlayers = players.filter((player) => player != null);

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
        }
    };

    if (!socket || !game) {
        return null;
    }

    if (appState.game?.running) {
        return null;
    }

    return (
        <Tooltip
            bg="red.600"
            label={'Needs 2 or more players to start a game.'}
            isDisabled={!game.running && readyPlayers.length > 2}
            hasArrow
        >
            <Button
                content="dfsdf"
                aria-label="Start a game."
                isDisabled={!game.running && readyPlayers.length < 2}
                onClick={() => onClickStartGame(socket)}
            >
                Start
            </Button>
        </Tooltip>
    );
};

export default StartGameButton;
