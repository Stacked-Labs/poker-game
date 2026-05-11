'use client';

import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
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

    if (!isOwner || !isActive || dismissed) return null;

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
                gap={{ base: 2, md: 2.5 }}
                whiteSpace="nowrap"
                bg="blackAlpha.300"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="full"
                pl={{ base: 3, md: 3.5 }}
                pr={{ base: 1, md: 1.5 }}
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
                    color="whiteAlpha.700"
                    aria-hidden
                />
                <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight={700}
                    lineHeight="1"
                    color="whiteAlpha.800"
                    letterSpacing="0.04em"
                >
                    {isPaused ? 'Game Paused' : 'Pausing…'}
                </Text>

                {isPaused ? (
                    <Button
                        variant="tactilePrimary"
                        data-testid="resume-game-btn"
                        size="xs"
                        h={{ base: '26px', md: '30px' }}
                        px={{ base: 3, md: 3.5 }}
                        borderRadius="full"
                        color="white"
                        _hover={{ color: 'white' }}
                        _active={{ color: 'white' }}
                        _focus={{ color: 'white' }}
                        leftIcon={
                            <Icon as={FaPlay} boxSize="8px" color="white" />
                        }
                        onClick={handleResume}
                    >
                        <Text
                            as="span"
                            fontWeight={800}
                            color="white"
                            fontSize={{ base: '2xs', md: 'xs' }}
                        >
                            Resume
                        </Text>
                    </Button>
                ) : (
                    <Button
                        variant="tactileDestructive"
                        data-testid="cancel-pause-btn"
                        size="xs"
                        h={{ base: '26px', md: '30px' }}
                        px={{ base: 3, md: 3.5 }}
                        borderRadius="full"
                        color="white"
                        _hover={{ color: 'white' }}
                        _active={{ color: 'white' }}
                        _focus={{ color: 'white' }}
                        onClick={handleResume}
                    >
                        <Text
                            as="span"
                            fontWeight={800}
                            color="white"
                            fontSize={{ base: '2xs', md: 'xs' }}
                        >
                            Cancel
                        </Text>
                    </Button>
                )}
            </Flex>
        </Box>
    );
};

export default GamePausedPopup;
