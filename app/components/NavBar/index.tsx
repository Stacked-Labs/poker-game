'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
    HStack,
    Flex,
    IconButton,
    useDisclosure,
    Icon,
    Box,
    Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiSettings, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import Web3Button from '../Web3Button';
import SettingsModal from './Settings/SettingsModal';
import SideBarChat from './Chat/SideBarChat';
import StartGameButton from '../StartGameButton';
import VolumeButton from '../VolumeButton';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import {
    sendPauseGameCommand,
    sendResumeGameCommand,
} from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { FaPlay, FaPause } from 'react-icons/fa';
import {
    handleReturnReady,
    handleSitOutNext,
    handleLeaveTable,
} from '@/app/hooks/useTableOptions';
import TableMenuBurger from './TableMenuBurger';
import AwayButton from './AwayButton';
import LeaveButton from './LeaveButton';

// Keyframes for the pulse animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const Navbar = ({ isLoading }: { isLoading: boolean }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenChat, onToggle: onToggleChat } = useDisclosure();
    const { appState, dispatch } = useContext(AppContext);
    const pendingCount = appState.pendingPlayers?.length || 0;
    const [animateBadge, setAnimateBadge] = useState(false);
    const [animateMsgBadge, setAnimateMsgBadge] = useState(false);
    const socket = useContext(SocketContext);
    const unreadMessageCount = appState.unreadMessageCount;
    const { info } = useToastHelper();
    const isOwner = useIsTableOwner();

    // Check if the current user is seated at the table
    const isUserSeated = appState.game?.players?.some(
        (player) => player.uuid === appState.clientID
    );

    // Local player state
    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const isAway = !!localPlayer && localPlayer.stack > 0 && !localPlayer.ready;

    const sitOutPending = appState.isSitOutNext;

    // Reset pending flag once away state takes effect or player leaves seat
    useEffect(() => {
        if (isAway && sitOutPending) {
            dispatch({ type: 'setIsSitOutNext', payload: false });
        }
        if (!localPlayer && sitOutPending) {
            dispatch({ type: 'setIsSitOutNext', payload: false });
        }
    }, [isAway, localPlayer, sitOutPending]);

    // Trigger animation when pendingCount changes
    useEffect(() => {
        if (pendingCount > 0) {
            setAnimateBadge(true);
            const timer = setTimeout(() => {
                setAnimateBadge(false);
            }, 1000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [pendingCount]);

    // Trigger animation when unreadMessageCount changes
    useEffect(() => {
        if (unreadMessageCount > 0) {
            setAnimateMsgBadge(true);
            const timer = setTimeout(() => {
                setAnimateMsgBadge(false);
            }, 1000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [unreadMessageCount]);

    // Update chat open state and reset unread count when chat is opened
    const handleChatToggle = () => {
        // Toggle the chat state
        const newChatState = !isOpenChat;

        // Update the app state
        dispatch({ type: 'setChatOpen', payload: newChatState });

        // Toggle the UI
        onToggleChat();
    };

    return (
        <>
            <Flex
                as="nav"
                align="center"
                justify="space-between"
                wrap="wrap"
                padding={{ base: '0.5rem', md: '1rem' }}
                bg="gray.200"
                color="white"
                zIndex={10}
                opacity={isLoading ? 0 : 1}
            >
                <HStack spacing={{ base: 1, md: 2 }} alignItems="stretch">
                    <TableMenuBurger
                        isUserSeated={isUserSeated}
                        isAway={isAway}
                    />
                    <Box position="relative">
                        <IconButton
                            icon={
                                <Icon
                                    as={FiSettings}
                                    boxSize={{ base: 5, md: 8 }}
                                />
                            }
                            aria-label="Settings"
                            size={'lg'}
                            onClick={onOpen}
                        />
                        {pendingCount > 0 && (
                            <Flex
                                position="absolute"
                                top="-5px"
                                right="-5px"
                                width="22px"
                                height="22px"
                                borderRadius="full"
                                bg="red.500"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="xs"
                                fontWeight="bold"
                                zIndex={11}
                                boxShadow="0px 0px 5px rgba(0, 0, 0, 0.3)"
                                border="2px solid white"
                                animation={
                                    animateBadge
                                        ? `${pulseAnimation} 1s ease-in-out`
                                        : undefined
                                }
                            >
                                {pendingCount}
                            </Flex>
                        )}
                    </Box>
                    {isUserSeated && (
                        <Box display={{ base: 'none', md: 'block' }}>
                            <AwayButton
                                isAway={isAway}
                                sitOutPending={appState.isSitOutNext}
                                handleReturnReady={() =>
                                    handleReturnReady(socket, info)
                                }
                                handleSitOutNext={() =>
                                    handleSitOutNext(socket, dispatch, info)
                                }
                            />
                        </Box>
                    )}
                    <StartGameButton />
                    {isOwner && appState.game?.running && socket && (
                        <Tooltip
                            label={
                                appState.game?.paused
                                    ? 'Resume Game'
                                    : 'Pause Game'
                            }
                            aria-label={
                                appState.game?.paused
                                    ? 'Resume game tooltip'
                                    : 'Pause game tooltip'
                            }
                        >
                            <IconButton
                                icon={
                                    appState.game?.paused ? (
                                        <FaPlay />
                                    ) : (
                                        <FaPause />
                                    )
                                }
                                aria-label={
                                    appState.game?.paused
                                        ? 'Resume Game'
                                        : 'Pause Game'
                                }
                                size={'lg'}
                                onClick={() => {
                                    if (appState.game?.paused) {
                                        sendResumeGameCommand(socket);
                                    } else {
                                        sendPauseGameCommand(socket);
                                    }
                                }}
                                colorScheme={
                                    appState.game?.paused ? 'green' : 'yellow'
                                }
                            />
                        </Tooltip>
                    )}
                </HStack>
                <HStack spacing={{ base: 1, md: 2 }} alignItems="center">
                    <Box display={{ base: 'none', md: 'block' }}>
                        <VolumeButton />
                    </Box>
                    {/* Away toggle is now placed on the left next to Settings */}
                    {isUserSeated && (
                        <Box display={{ base: 'none', md: 'block' }}>
                            <LeaveButton
                                isUserSeated
                                isLeaveRequested={appState.isLeaveRequested}
                                handleLeaveTable={() =>
                                    handleLeaveTable(
                                        socket,
                                        appState.username,
                                        info
                                    )
                                }
                            />
                        </Box>
                    )}
                    <Box position="relative">
                        <IconButton
                            icon={
                                <Icon
                                    as={FiMessageSquare}
                                    boxSize={{ base: 5, md: 8 }}
                                />
                            }
                            aria-label="Chat"
                            size={'lg'}
                            onClick={handleChatToggle}
                        />
                        {unreadMessageCount > 0 && (
                            <Flex
                                position="absolute"
                                top="-5px"
                                right="-5px"
                                width="22px"
                                height="22px"
                                borderRadius="full"
                                bg="red.500"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="xs"
                                fontWeight="bold"
                                zIndex={11}
                                boxShadow="0px 0px 5px rgba(0, 0, 0, 0.3)"
                                border="2px solid white"
                                animation={
                                    animateMsgBadge
                                        ? `${pulseAnimation} 1s ease-in-out`
                                        : undefined
                                }
                            >
                                {unreadMessageCount}
                            </Flex>
                        )}
                    </Box>
                    <Web3Button
                        size="lg"
                        variant="white"
                        colorScheme="white"
                        paddingX={{ md: 12 }}
                        display={{ base: 'none', md: 'inline-flex' }}
                    />
                </HStack>

                <SettingsModal isOpen={isOpen} onClose={onClose} />
            </Flex>
            <Flex
                height={'var(--full-vh)'}
                width={'100vw'}
                position={'absolute'}
                zIndex={999}
                onClick={onToggleChat}
                display={isOpenChat ? 'block' : 'none'}
                opacity={isLoading ? 0 : 1}
            ></Flex>
            <SideBarChat isOpen={isOpenChat} onToggle={onToggleChat} />
        </>
    );
};

export default Navbar;
