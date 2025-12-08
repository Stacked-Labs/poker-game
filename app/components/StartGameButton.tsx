import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/WebSocketProvider';
import { isTableOwner, startGame } from '../hooks/server_actions';
import { AppContext } from '../contexts/AppStoreProvider';
import { Button, Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import useIsTableOwner from '../hooks/useIsTableOwner';
import { FaPlay } from 'react-icons/fa';

const StartGameButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const players = appState.game?.players || [];
    // Prefer backend-provided readyCount; fallback to counting ready flags
    const readyPlayersCount =
        game?.readyCount ?? players.filter((p) => p && p.ready).length;
    const isOwner = useIsTableOwner();

    const onClickStartGame = (socket: WebSocket) => {
        if (socket) {
            startGame(socket);
        }
    };

    // Pulse animation keyframes
    const pulseKeyframes = keyframes`
        0% { transform: scale(1); }
        50% { transform: scale(1.08); }
        100% { transform: scale(1); }
    `;

    const pulseAnimation = `${pulseKeyframes} 1.8s ease-in-out infinite`;

    if (!socket || !game || !isOwner) {
        return null;
    }

    if (isOwner && !game.running) {
        const isDisabled = !game.running && readyPlayersCount < 2;
        return (
            <Tooltip
                bg="red.600"
                label={'Needs 2 or more ready players to start a game.'}
                isDisabled={game.running || readyPlayersCount >= 2}
                hasArrow
            >
                {/* Icon button for mobile */}
                <IconButton
                    aria-label="Start Game"
                    icon={<Icon as={FaPlay} boxSize={{ base: 4, md: 5 }} />}
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    size={{ base: 'md', md: 'md' }}
                    onClick={() => onClickStartGame(socket)}
                    isDisabled={isDisabled}
                    display={{ base: 'inline-flex', md: 'none' }}
                    role="button"
                    tabIndex={0}
                    bg="brand.green"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(54, 163, 123, 0.4)',
                    }}
                    _disabled={{
                        bg: 'gray.300',
                        color: 'gray.500',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                    }}
                    transition="all 0.2s ease"
                    animation={!isDisabled ? pulseAnimation : undefined}
                />

                {/* Full button for tablet/desktop */}
                <Button
                    size="lg"
                    paddingX={{ md: 12 }}
                    onClick={() => onClickStartGame(socket)}
                    isDisabled={isDisabled}
                    display={{ base: 'none', md: 'inline-flex' }}
                    bg="brand.green"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    fontWeight="bold"
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(54, 163, 123, 0.4)',
                    }}
                    _disabled={{
                        bg: 'gray.300',
                        color: 'gray.500',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                    }}
                    transition="all 0.2s ease"
                    animation={!isDisabled ? pulseAnimation : undefined}
                >
                    Start
                </Button>
            </Tooltip>
        );
    }

    return null;
};

export default StartGameButton;
