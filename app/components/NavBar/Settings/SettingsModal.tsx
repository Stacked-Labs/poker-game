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
import { keyframes } from '@emotion/react';
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

// Animations
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideDown = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(-20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const SettingsModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.95)"
                backdropFilter="blur(10px)"
            />
            <ModalContent
                bg="white"
                h="100vh"
                w="100vw"
                maxW="100vw"
                maxH="100vh"
                m={0}
                borderRadius={0}
                animation={`${fadeIn} 0.3s ease-out`}
            >
                <ModalBody p={{ base: 4, md: 8 }} h="100%">
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
                            gap={{ base: 2, sm: 3 }}
                            bg="brand.lightGray"
                            p={{ base: 2, md: 3 }}
                            borderRadius="20px"
                            mb={{ base: 4, md: 6 }}
                            flexWrap={{ base: 'nowrap', sm: 'wrap' }}
                            overflowX="auto"
                            animation={`${slideDown} 0.4s ease-out`}
                            boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: 'white',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: 'brand.navy',
                                    borderRadius: 'full',
                                    _hover: {
                                        bg: 'brand.pink',
                                    },
                                },
                            }}
                        >
                            <Tab
                                onClick={onClose}
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                bg="brand.pink"
                                color="white"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(235, 11, 92, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.pink',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(235, 11, 92, 0.3)',
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
                            >
                                <HStack
                                    spacing={{ base: 1, md: 2 }}
                                    color="white"
                                >
                                    <Icon
                                        as={IoCaretBack}
                                        boxSize={{ base: 4, md: 5 }}
                                        color="white"
                                    />
                                    <Text
                                        display={{ base: 'none', sm: 'block' }}
                                        color="white"
                                    >
                                        Back
                                    </Text>
                                </HStack>
                            </Tab>
                            <Tab
                                minW="fit-content"
                                px={{ base: 3, md: 4 }}
                                py={2}
                                color="gray.600"
                                _hover={{
                                    bg: 'white',
                                    color: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(54, 163, 123, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.green',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(54, 163, 123, 0.3)',
                                    '& *': {
                                        color: 'white !important',
                                    },
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
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
                                color="gray.600"
                                _hover={{
                                    bg: 'white',
                                    color: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(54, 163, 123, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.green',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(54, 163, 123, 0.3)',
                                    '& *': {
                                        color: 'white !important',
                                    },
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
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
                                color="gray.600"
                                _hover={{
                                    bg: 'white',
                                    color: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(54, 163, 123, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.green',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(54, 163, 123, 0.3)',
                                    '& *': {
                                        color: 'white !important',
                                    },
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
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
                                color="gray.600"
                                _hover={{
                                    bg: 'white',
                                    color: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(54, 163, 123, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.green',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(54, 163, 123, 0.3)',
                                    '& *': {
                                        color: 'white !important',
                                    },
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
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
                                color="gray.600"
                                _hover={{
                                    bg: 'white',
                                    color: 'brand.navy',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 4px 8px rgba(51, 68, 121, 0.2)',
                                }}
                                _selected={{
                                    bg: 'brand.navy',
                                    color: 'white !important',
                                    boxShadow:
                                        '0 4px 12px rgba(51, 68, 121, 0.3)',
                                    '& *': {
                                        color: 'white !important',
                                    },
                                }}
                                borderRadius="12px"
                                fontWeight="bold"
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                transition="all 0.2s ease"
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
                            bg="white"
                            borderRadius="20px"
                            p={{ base: 3, md: 5 }}
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '10px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: 'brand.lightGray',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: 'brand.navy',
                                    borderRadius: 'full',
                                    _hover: {
                                        bg: 'brand.pink',
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
