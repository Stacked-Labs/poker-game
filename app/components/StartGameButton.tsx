import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Button, Tooltip, IconButton, Icon } from '@chakra-ui/react';
import useIsTableOwner from '../hooks/useIsTableOwner';
import useToastHelper from '../hooks/useToastHelper';
import { FaPlay } from 'react-icons/fa';

// Exceeds the server's 30s on-chain timeout in StartHandCommand.PreValidate so
// the spinner only resets after the backend has truly given up.
const START_TIMEOUT_MS = 35000;

const StartGameButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const players = appState.game?.players || [];
    // Prefer backend-provided readyCount; fallback to counting ready flags
    const readyPlayersCount =
        game?.readyCount ?? players.filter((p) => p && p.ready).length;
    const isOwner = useIsTableOwner();
    const toast = useToastHelper();
    const [isStarting, setIsStarting] = useState(false);

    // First start of a crypto table blocks on an on-chain heartbeat tx, so the
    // update-game broadcast lags ~1–2s. Clear the spinner once the game flips
    // to running.
    useEffect(() => {
        if (isStarting && game?.running) {
            setIsStarting(false);
        }
    }, [isStarting, game?.running]);

    useEffect(() => {
        if (!isStarting) return;
        const timer = setTimeout(() => {
            setIsStarting(false);
            toast.error("Couldn't start the table. Try again.");
        }, START_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [isStarting, toast]);

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
            setIsStarting(true);
        }
    };

    if (!socket || !game || !isOwner) {
        return null;
    }

    if (isOwner && !game.running) {
        const isDisabled =
            isStarting || (!game.running && readyPlayersCount < 2);
        return (
            <Tooltip
                label="Need 2+ ready players"
                isDisabled={game.running || readyPlayersCount >= 2}
                placement="top"
                hasArrow
                bg="brand.navy"
                color="white"
                borderRadius="md"
                fontSize="xs"
                fontWeight="semibold"
                px={2.5}
                py={1.5}
            >
                {/* Icon button for mobile */}
                <IconButton
                    data-testid="start-game-btn"
                    aria-label="Start Game"
                    icon={<Icon as={FaPlay} boxSize={{ base: 4, md: 5 }} />}
                    variant="tactilePrimary"
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    size={{ base: 'md', md: 'md' }}
                    onClick={() => onClickStartGame(socket)}
                    isDisabled={isDisabled}
                    isLoading={isStarting}
                    display={{ base: 'inline-flex', md: 'none' }}
                />

                {/* Full button for tablet/desktop */}
                <Button
                    data-testid="start-game-btn-desktop"
                    variant="tactilePrimary"
                    size="md"
                    paddingX={{ md: 12 }}
                    onClick={() => onClickStartGame(socket)}
                    isDisabled={isDisabled}
                    isLoading={isStarting}
                    loadingText="Starting…"
                    display={{ base: 'none', md: 'inline-flex' }}
                >
                    Start
                </Button>
            </Tooltip>
        );
    }

    return null;
};

export default StartGameButton;
