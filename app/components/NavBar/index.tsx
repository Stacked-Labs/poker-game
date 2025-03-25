'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
    HStack,
    Flex,
    IconButton,
    useDisclosure,
    Icon,
    Box,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiSettings, FiMessageSquare } from 'react-icons/fi';
import Web3Button from '../Web3Button';
import SettingsModal from './Settings/SettingsModal';
import SideBarChat from './Chat/SideBarChat';
import StartGameButton from '../StartGameButton';
import VolumeButton from '../VolumeButton';
import usePendingPlayers from '@/app/hooks/usePendingPlayers';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// Keyframes for the pulse animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenChat, onToggle: onToggleChat } = useDisclosure();
    const { pendingCount } = usePendingPlayers();
    const [animateBadge, setAnimateBadge] = useState(false);
    const [animateMsgBadge, setAnimateMsgBadge] = useState(false);
    const { appState, dispatch } = useContext(AppContext);
    const unreadMessageCount = appState.unreadMessageCount;

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
            >
                <HStack>
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
                    <StartGameButton />
                </HStack>
                <HStack>
                    <Web3Button />
                    <VolumeButton />
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
                </HStack>

                <SettingsModal isOpen={isOpen} onClose={onClose} />
            </Flex>
            <Flex
                height={'100vh'}
                width={'100vw'}
                position={'absolute'}
                zIndex={999}
                onClick={onToggleChat}
                display={isOpenChat ? 'block' : 'none'}
            ></Flex>
            <SideBarChat isOpen={isOpenChat} onToggle={onToggleChat} />
        </>
    );
};

export default Navbar;
