'use client';

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { IoCaretBack } from 'react-icons/io5';
import {
    FiUsers,
    FiSettings,
    FiFileText,
    FiDollarSign,
    FiHelpCircle,
} from 'react-icons/fi';
import GameSettings from './GameSettings';
import PlayerList from './PlayerList';
import GameLog from './GameLog';
import Ledger from './Ledger';
import HowTo from './HowTo';

const SettingsModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
            <ModalOverlay bg="blackAlpha.900" />
            <ModalContent
                bg="#121212"
                h="100vh"
                w="100vw"
                maxW="100vw"
                maxH="100vh"
                m={0}
                borderRadius={0}
            >
                <ModalBody p={{ base: 3, md: 6 }} h="100%">
                    <Tabs
                        size={{ base: 'sm', md: 'md' }}
                        variant="soft-rounded"
                        colorScheme="green"
                        defaultIndex={1}
                        orientation="horizontal"
                        h="100%"
                        display="flex"
                        flexDirection="column"
                    >
                        <TabList
                            gap={{ base: 1, sm: 2 }}
                            bg="#191414"
                            p={{ base: 2, md: 3 }}
                            borderRadius="lg"
                            mb={{ base: 3, md: 4 }}
                            flexWrap={{ base: 'nowrap', sm: 'wrap' }}
                            overflowX="auto"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    height: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: '#171717',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: '#262626',
                                    borderRadius: 'full',
                                },
                            }}
                        >
                            <Tab
                                onClick={onClose}
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#eb4034',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={IoCaretBack}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text
                                        display={{ base: 'none', sm: 'block' }}
                                    >
                                        Back
                                    </Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#1db954',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={FiUsers}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text>Players</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#1db954',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={FiDollarSign}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text>Ledger</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#1db954',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={FiFileText}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text>Log</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#1db954',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={FiSettings}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text>Settings</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="#c6c6c6"
                                _hover={{
                                    bg: '#262626',
                                    color: 'white',
                                }}
                                _selected={{
                                    bg: '#1db954',
                                    color: 'white',
                                }}
                                borderRadius="md"
                                fontWeight="semibold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontFamily="Poppins, sans-serif"
                            >
                                <HStack spacing={{ base: 1, md: 2 }}>
                                    <Icon
                                        as={FiHelpCircle}
                                        boxSize={{ base: 4, md: 5 }}
                                    />
                                    <Text
                                        display={{ base: 'none', sm: 'block' }}
                                    >
                                        How To
                                    </Text>
                                    <Text
                                        display={{ base: 'block', sm: 'none' }}
                                    >
                                        Help
                                    </Text>
                                </HStack>
                            </Tab>
                        </TabList>

                        <TabPanels
                            flex={1}
                            overflowY="auto"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: '#191414',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: '#262626',
                                    borderRadius: 'full',
                                    _hover: {
                                        bg: '#363535',
                                    },
                                },
                            }}
                        >
                            <TabPanel></TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 2, md: 4 }}
                                py={{ base: 2, md: 4 }}
                            >
                                <PlayerList />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 2, md: 4 }}
                                py={{ base: 2, md: 4 }}
                            >
                                <Ledger />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 2, md: 4 }}
                                py={{ base: 2, md: 4 }}
                            >
                                <GameLog />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 2, md: 4 }}
                                py={{ base: 2, md: 4 }}
                            >
                                <GameSettings />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 2, md: 4 }}
                                py={{ base: 2, md: 4 }}
                            >
                                <HowTo />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;
