'use client';

import React from 'react';
import { HStack, Flex, IconButton, useDisclosure } from '@chakra-ui/react';
import { FiSettings, FiMessageSquare } from 'react-icons/fi';
import Web3Button from '../Web3Button';
import SettingsModal from './Settings/SettingsModal';
import SideBarChat from './Chat/SideBarChat';
import StartGameButton from '../StartGameButton';

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
                padding="1.5rem"
                bg="gray.200"
                color="white"
                zIndex={10}
            >
                <HStack>
                    <IconButton
                        icon={<FiSettings size={32} />}
                        aria-label="Settings"
                        size={'lg'}
                        onClick={onOpen}
                    />
                    <StartGameButton />
                </HStack>
                <HStack>
                    <Web3Button />
                    <IconButton
                        icon={<FiMessageSquare size={32} />}
                        aria-label="Chat"
                        size={'lg'}
                        onClick={onToggleChat}
                        marginRight="4"
                    />
                </HStack>

                <SettingsModal isOpen={isOpen} onClose={onClose} />
            </Flex>
            <SideBarChat isOpen={isOpenChat} onToggle={onToggleChat} />
        </>
    );
};

export default Navbar;
