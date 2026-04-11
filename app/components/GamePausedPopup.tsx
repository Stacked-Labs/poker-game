'use client';

import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa6';
import { MdPause } from 'react-icons/md';
import { sendResumeGameCommand } from '@/app/hooks/server_actions';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';

// Match GameStatusBanner's fadeIn exactly
const fadeIn = keyframes`
    from { transform: translateY(4px); }
    to   { transform: translateY(0); }
`;

const GamePausedPopup = () => {
    const { appState } = useContext(AppContext);
    const isOwner = useIsTableOwner();
    const socket = useContext(SocketContext);

    const isPaused = Boolean(appState.game?.paused);
    const isPendingPause = Boolean(appState.game?.pendingPause);
    const isActive = isPaused || isPendingPause;

    const [dismissed, setDismissed] = useState(false);
    const prevPausedRef = useRef(false);

    // Reset dismiss when pause transitions false → true
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
                gap={{ base: 1.5, md: 2 }}
                whiteSpace="nowrap"
                bg="blackAlpha.200"
                backdropFilter="blur(8px)"
                borderRadius="full"
                px={{ base: 2.5, md: 3 }}
                py={{ base: 1, md: 1.5 }}
                animation={`${fadeIn} 300ms ease-out`}
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
                    fontWeight="700"
                    letterSpacing="0.04em"
                    lineHeight="1"
                    color="whiteAlpha.700"
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
                        letterSpacing="0.04em"
                        leftIcon={<FaPlay size={8} />}
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.08)"
                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            bg: 'brand.green',
                            transform: 'translateY(-2px)',
                            boxShadow:
                                '0 4px 12px rgba(54, 163, 123, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        }}
                        _active={{
                            transform: 'translateY(0) scale(0.96)',
                        }}
                        onClick={handleResume}
                    >
                        Resume
                    </Button>
                ) : (
                    <Button
                        data-testid="cancel-pause-btn"
                        size="xs"
                        bg="orange.400"
                        color="white"
                        h={{ base: '24px', md: '28px' }}
                        px={{ base: 2.5, md: 3 }}
                        borderRadius="full"
                        fontWeight="bold"
                        fontSize={{ base: '2xs', md: 'xs' }}
                        letterSpacing="0.04em"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.08)"
                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            bg: 'orange.400',
                            transform: 'translateY(-2px)',
                            boxShadow:
                                '0 4px 12px rgba(237, 137, 54, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        }}
                        _active={{
                            transform: 'translateY(0) scale(0.96)',
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
