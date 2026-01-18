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
import { FiSettings, FiMessageSquare } from 'react-icons/fi';
import WalletButton from '../WalletButton';
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
    handleCancelRejoin,
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

const Navbar = () => {
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
    const [isLoading, setLoading] = useState(true);

    // Check if the current user is seated at the table
    const isUserSeated = appState.game?.players?.some(
        (player) => player.uuid === appState.clientID
    );

    // Local player state
    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const isAway = !!localPlayer && localPlayer.stack > 0 && !localPlayer.ready;
    const leaveAfterHandRequested = Boolean(localPlayer?.leaveAfterHand);

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

    useEffect(() => {

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Flex
                className="table-navbar"
                as="nav"
                align="center"
                justify="space-between"
                wrap="wrap"
                padding="0.5%"
                bg="none"
                color="text.secondary"
                zIndex={99}
                opacity={isLoading ? 0 : 1}
                position="absolute"
                top={0}
                left={0}
                right={0}
                pointerEvents={'none'}
            >
                <HStack
                    className="navbar-left-controls"
                    spacing={{ base: 1, md: 2 }}
                    alignItems="stretch"
                    pointerEvents={'auto'}
                >
                    <TableMenuBurger
                        isUserSeated={isUserSeated}
                        isAway={isAway}
                    />
                    <Box
                        className="navbar-settings-wrapper"
                        position="relative"
                    >
                        <IconButton
                            icon={
                                <Icon
                                    as={FiSettings}
                                    boxSize={{ base: 4, md: 5 }}
                                />
                            }
                            aria-label="Settings"
                            onClick={onOpen}
                            px={2}
                            py={2}
                            width={{ base: '40px', sm: '40px', md: '48px' }}
                            height={{ base: '40px', sm: '40px', md: '48px' }}
                            variant={'gameSettingsButton'}
                            size={{ base: 'md', md: 'md' }}
                        />
                        {pendingCount > 0 && (
                            <Flex
                                className="navbar-pending-badge"
                                position="absolute"
                                top="-6px"
                                right="-6px"
                                width="24px"
                                height="24px"
                                borderRadius="full"
                                bg="brand.pink"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="xs"
                                fontWeight="bold"
                                zIndex={11}
                                boxShadow="0 2px 8px rgba(235, 11, 92, 0.4)"
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
                        <Box
                            className="navbar-away-wrapper"
                            sx={{
                                '@media (orientation: portrait)': {
                                    display: 'none',
                                },
                                '@media (orientation: landscape)': {
                                    display: 'block',
                                },
                            }}
                        >
                            <AwayButton
                                isAway={isAway}
                                sitOutNextHand={localPlayer?.sitOutNextHand}
                                readyNextHand={localPlayer?.readyNextHand}
                                handleReturnReady={() =>
                                    handleReturnReady(socket, info)
                                }
                                handleSitOutNext={() =>
                                    handleSitOutNext(socket, info)
                                }
                                handleCancelRejoin={() =>
                                    handleCancelRejoin(socket, info)
                                }
                            />
                        </Box>
                    )}
                    <StartGameButton />
                    {isUserSeated && isAway && (
                        <Box
                            className="navbar-away-portrait-wrapper"
                            sx={{
                                '@media (orientation: portrait)': {
                                    display: 'block',
                                },
                                '@media (orientation: landscape)': {
                                    display: 'none',
                                },
                            }}
                        >
                            <AwayButton
                                isAway={isAway}
                                sitOutNextHand={localPlayer?.sitOutNextHand}
                                readyNextHand={localPlayer?.readyNextHand}
                                handleReturnReady={() =>
                                    handleReturnReady(socket, info)
                                }
                                handleSitOutNext={() =>
                                    handleSitOutNext(socket, info)
                                }
                                handleCancelRejoin={() =>
                                    handleCancelRejoin(socket, info)
                                }
                            />
                        </Box>
                    )}
                    {isOwner &&
                        appState.game?.running &&
                        appState.game?.paused &&
                        socket && (
                            <Box
                                className="navbar-resume-wrapper"
                                sx={{
                                    '@media (orientation: portrait)': {
                                        display: 'block',
                                    },
                                    '@media (orientation: landscape)': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <Tooltip
                                    label="Resume Game"
                                    aria-label="Resume game tooltip"
                                >
                                    <IconButton
                                        icon={
                                            <Icon
                                                as={FaPlay}
                                                boxSize={{ base: 4, md: 5 }}
                                            />
                                        }
                                        aria-label="Resume Game"
                                        size={{ base: 'md', md: 'md' }}
                                        px={2}
                                        py={2}
                                        width={{
                                            base: '40px',
                                            sm: '40px',
                                            md: '48px',
                                        }}
                                        height={{
                                            base: '40px',
                                            sm: '40px',
                                            md: '48px',
                                        }}
                                        onClick={() =>
                                            sendResumeGameCommand(socket)
                                        }
                                        bg="brand.green"
                                        color="white"
                                        border="none"
                                        borderRadius="12px"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow:
                                                '0 4px 12px rgba(54, 163, 123, 0.4)',
                                        }}
                                        transition="all 0.2s ease"
                                    />
                                </Tooltip>
                            </Box>
                        )}
                    {isOwner && appState.game?.running && socket && (
                        <Box
                            className="navbar-pause-wrapper"
                            sx={{
                                '@media (orientation: portrait)': {
                                    display: 'none',
                                },
                                '@media (orientation: landscape)': {
                                    display: 'block',
                                },
                            }}
                        >
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
                                            <Icon
                                                as={FaPlay}
                                                boxSize={{ base: 4, md: 5 }}
                                            />
                                        ) : (
                                            <Icon
                                                as={FaPause}
                                                boxSize={{ base: 4, md: 5 }}
                                            />
                                        )
                                    }
                                    aria-label={
                                        appState.game?.paused
                                            ? 'Resume Game'
                                            : 'Pause Game'
                                    }
                                    size={{ base: 'md', md: 'md' }}
                                    px={2}
                                    py={2}
                                    width={{
                                        base: '40px',
                                        sm: '40px',
                                        md: '48px',
                                    }}
                                    height={{
                                        base: '40px',
                                        sm: '40px',
                                        md: '48px',
                                    }}
                                    onClick={() => {
                                        if (appState.game?.paused) {
                                            sendResumeGameCommand(socket);
                                        } else {
                                            sendPauseGameCommand(socket);
                                        }
                                    }}
                                    bg={
                                        appState.game?.paused
                                            ? 'brand.green'
                                            : 'brand.yellow'
                                    }
                                    color="white"
                                    border="none"
                                    borderRadius="12px"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: appState.game?.paused
                                            ? '0 4px 12px rgba(54, 163, 123, 0.4)'
                                            : '0 4px 12px rgba(253, 197, 29, 0.4)',
                                    }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </Box>
                    )}
                </HStack>
                <HStack
                    className="navbar-right-controls"
                    spacing={{ base: 1, md: 2 }}
                    alignItems="center"
                    pointerEvents={'auto'}
                >
                    <Box
                        className="navbar-volume-wrapper"
                        sx={{
                            '@media (orientation: portrait)': {
                                display: 'none',
                            },
                            '@media (orientation: landscape)': {
                                display: 'block',
                            },
                        }}
                    >
                        <VolumeButton />
                    </Box>
                    {/* Away toggle is now placed on the left next to Settings */}
                    {isUserSeated && (
                        <Box
                            className="navbar-leave-wrapper"
                            sx={{
                                '@media (orientation: portrait)': {
                                    display: 'none',
                                },
                                '@media (orientation: landscape)': {
                                    display: 'block',
                                },
                            }}
                        >
                            <LeaveButton
                                isUserSeated
                                isLeaveRequested={leaveAfterHandRequested}
                                handleLeaveTable={() =>
                                    handleLeaveTable(
                                        socket,
                                        info,
                                        leaveAfterHandRequested
                                    )
                                }
                            />
                        </Box>
                    )}
                    <Box className="navbar-chat-wrapper" position="relative">
                        <IconButton
                            icon={
                                <Icon
                                    as={FiMessageSquare}
                                    boxSize={{ base: 4, md: 5 }}
                                />
                            }
                            aria-label="Chat"
                            onClick={handleChatToggle}
                            variant={'gameSettingsButton'}
                            size={{ base: 'md', md: 'md' }}
                            px={2}
                            py={2}
                            width={{ base: '40px', sm: '40px', md: '48px' }}
                            height={{ base: '40px', sm: '40px', md: '48px' }}
                        />
                        {unreadMessageCount > 0 && (
                            <Flex
                                className="navbar-unread-badge"
                                position="absolute"
                                top="-6px"
                                right="-6px"
                                width="22px"
                                height="22px"
                                borderRadius="full"
                                bg="brand.pink"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="10px"
                                fontWeight="bold"
                                zIndex={11}
                                boxShadow="0 2px 8px rgba(235, 11, 92, 0.4)"
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
                    <Box
                        className="navbar-wallet-wrapper"
                        sx={{
                            '@media (orientation: portrait)': {
                                display: 'none',
                            },
                            '@media (orientation: landscape)': {
                                display: 'inline-flex',
                            },
                        }}
                    >
                        <WalletButton />
                    </Box>
                </HStack>

                <SettingsModal isOpen={isOpen} onClose={onClose} />
            </Flex>
            <Flex
                className="chat-overlay-backdrop"
                height={'100%'}
                width={'100%'}
                position={'absolute'}
                top={0}
                left={0}
                zIndex={999}
                onClick={handleChatToggle}
                display={isOpenChat ? 'block' : 'none'}
                opacity={isLoading ? 0 : 1}
            ></Flex>
            <SideBarChat isOpen={isOpenChat} onToggle={handleChatToggle} />
        </>
    );
};

export default Navbar;
