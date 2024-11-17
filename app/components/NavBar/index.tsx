'use client';

import React from 'react';
import {
    HStack,
    Flex,
    IconButton,
    useDisclosure,
    Icon,
} from '@chakra-ui/react';
import { FiSettings, FiMessageSquare } from 'react-icons/fi';
import Web3Button from '../Web3Button';
import SettingsModal from './Settings/SettingsModal';
import SideBarChat from './Chat/SideBarChat';
import StartGameButton from '../StartGameButton';
import VolumeButton from '../VolumeButton';

const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenChat, onToggle: onToggleChat } = useDisclosure();

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
                    <StartGameButton />
                </HStack>
                <HStack>
                    <Web3Button />
                    <VolumeButton />
                    <IconButton
                        icon={
                            <Icon
                                as={FiMessageSquare}
                                boxSize={{ base: 5, md: 8 }}
                            />
                        }
                        aria-label="Chat"
                        size={'lg'}
                        onClick={onToggleChat}
                    />
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
