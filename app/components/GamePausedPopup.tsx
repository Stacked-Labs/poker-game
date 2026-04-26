'use client';

import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa6';
import { MdPause } from 'react-icons/md';
import { sendResumeGameCommand } from '@/app/hooks/server_actions';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const breathe = keyframes`
    0%, 100% { opacity: 0.6; }
    50%      { opacity: 0.9; }
`;

const GamePausedPopup = () => {
    const { appState } = useContext(AppContext);
    const isOwner = useIsTableOwner();
    const socket = useContext(SocketContext);
    const prefersReducedMotion = usePrefersReducedMotion();

    const isPaused = Boolean(appState.game?.paused);
    const isPendingPause = Boolean(appState.game?.pendingPause);
    const isActive = isPaused || isPendingPause;

    const [dismissed, setDismissed] = useState(false);
    const prevPausedRef = useRef(false);

    useEffect(() => {
        if (isPaused && !prevPausedRef.current) {
            setDismissed(false);
        }
        prevPausedRef.current = isPaused;
    }, [isPaused]);

    const handleResume = () => {
        if (!socket) return;
        sendResumeGameCommand(socket);
    };

    const pillBg = useColorModeValue(
        'rgba(255, 255, 255, 0.7)',
        'rgba(11, 20, 48, 0.55)'
    );
    const pillBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

    if (!isOwner || !isActive || dismissed) return null;

    const buttonTransition = prefersReducedMotion
        ? 'none'
        : 'background-color 120ms ease-out, box-shadow 120ms ease-out, transform 120ms cubic-bezier(0.19, 1, 0.22, 1)';

    return (
        <Box
            position="absolute"
            top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={991}
            pointerEvents="auto"
        >
            <Flex
                data-testid="game-paused-banner"
                align="center"
                justifyContent="center"
                gap={{ base: 1.5, md: 2 }}
                whiteSpace="nowrap"
                bg={pillBg}
                backdropFilter="blur(16px) saturate(140%)"
                border="1px solid"
                borderColor={pillBorder}
                boxShadow="glass"
                borderRadius="full"
                px={{ base: 2.5, md: 3 }}
                py={{ base: 1, md: 1.5 }}
                animation={
                    prefersReducedMotion
                        ? undefined
                        : `${fadeIn} 240ms cubic-bezier(0.4, 0, 0.2, 1)`
                }
                role="status"
            >
                <Icon
                    as={MdPause}
                    boxSize={{ base: 4, md: 5 }}
                    color="text.secondary"
                    animation={
                        prefersReducedMotion
                            ? undefined
                            : `${breathe} 2.4s ease-in-out infinite`
                    }
                    aria-hidden
                />
                <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="700"
                    lineHeight="1"
                    color="text.secondary"
                >
                    {isPaused ? 'Game Paused' : 'Pausing…'}
                </Text>

                {isPaused ? (
                    <Button
                        data-testid="resume-game-btn"
                        size="xs"
                        bg="brand.green"
                        color="white"
                        h={{ base: '24px', md: '28px' }}
                        px={{ base: 2.5, md: 3 }}
                        borderRadius="full"
                        fontWeight="bold"
                        fontSize={{ base: '2xs', md: 'xs' }}
                        leftIcon={<FaPlay size={8} />}
                        transition={buttonTransition}
                        _hover={{
                            bg: 'brand.green',
                            boxShadow: 'glow-green',
                        }}
                        _active={{ transform: 'scale(0.96)' }}
                        _focusVisible={{
                            boxShadow:
                                '0 0 0 2px rgba(255, 255, 255, 0.6), 0 0 20px rgba(54, 163, 123, 0.4)',
                        }}
                        onClick={handleResume}
                    >
                        Resume
                    </Button>
                ) : (
                    <Button
                        data-testid="cancel-pause-btn"
                        size="xs"
                        bg="brand.pink"
                        color="white"
                        h={{ base: '24px', md: '28px' }}
                        px={{ base: 2.5, md: 3 }}
                        borderRadius="full"
                        fontWeight="bold"
                        fontSize={{ base: '2xs', md: 'xs' }}
                        transition={buttonTransition}
                        _hover={{
                            bg: 'brand.pink',
                            boxShadow: 'glow-pink',
                        }}
                        _active={{ transform: 'scale(0.96)' }}
                        _focusVisible={{
                            boxShadow:
                                '0 0 0 2px rgba(255, 255, 255, 0.6), 0 0 20px rgba(235, 11, 92, 0.4)',
                        }}
                        onClick={handleResume}
                    >
                        Cancel
                    </Button>
                )}
            </Flex>
        </Box>
    );
};

export default GamePausedPopup;
