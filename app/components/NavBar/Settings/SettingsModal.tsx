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
import { BiSupport } from 'react-icons/bi';
import GameSettings from './GameSettings';
import PlayerList from './PlayerList';
import GameLog from './GameLog';
import Ledger from './Ledger';
import HowTo from './HowTo';
import Support from './Support';
import { GameEventsProvider } from '@/app/contexts/GameEventsProvider';
import { FINANCIAL_EVENT_TYPES } from '@/app/interfaces';
import { IconType } from 'react-icons/lib/iconBase';
import { ColorModeButton } from '../../ColorModeButton';

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

const TabItem = ({ text, color, icon }: { text: string, color: string, icon: IconType }) => {
    return (
        <Tab
            minW="fit-content"
            px={{ base: 3, md: 4 }}
            py={2}
            _hover={{
                bg: 'input.white',
                color: color,
                transform: 'translateY(-2px)',
                boxShadow:
                    '0 4px 8px rgba(54, 163, 123, 0.2)',
            }}
            _selected={{
                bg: color,
                color: 'text.white !important',
                boxShadow:
                    '0 4px 12px rgba(54, 163, 123, 0.3)',
                '& *': {
                    color: 'text.white !important',
                },
            }}
            borderRadius="12px"
            fontWeight="bold"
            fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
            transition="all 0.2s ease"
        >
            <HStack spacing={{ base: 1, md: 2 }}>
                <Icon
                    as={icon}
                    boxSize={{ base: 4, md: 5 }}
                    color={'text.primary'}
                />
                <Text
                    textTransform={'capitalize'}
                    color={'text.primary'}
                >
                    {text}
                </Text>
            </HStack>
        </Tab>
    )
}

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
                bg="bg.default"
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
                            gap={{ base: 1, md: 2 }}
                            bg="card.lightGray"
                            p={{ base: 2, md: 3 }}
                            borderRadius="20px"
                            mb={{ base: 0.25, md: 0.25 }}
                            flexWrap={{ base: 'nowrap', sm: 'wrap' }}
                            overflowX="auto"
                            animation={`${slideDown} 0.4s ease-out`}
                            boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: 'card.white',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: 'text.secondary',
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
                                color="text.gray600"
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
                                >
                                    <Icon
                                        as={IoCaretBack}
                                        boxSize={{ base: 4, md: 5 }}
                                        color="text.white"
                                    />
                                    <Text
                                        display={{ base: 'none', sm: 'block' }}
                                        color="text.white"
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
                                        color={'text.gray600'}

                                    />
                                    <Text color={'text.gray600'}>Players</Text>
                                </HStack>
                            </Tab>
                            <TabItem text='Ledger' color="brand.green" icon={FiDollarSign} />
                            <TabItem text='Log' color="brand.green" icon={FiFileText} />
                            <TabItem text='Settings' color="brand.green" icon={FiSettings} />
                            <TabItem text='Support' color="brand.pink" icon={BiSupport} />
                            <TabItem text='How To' color="brand.navy" icon={FiHelpCircle} />
                            <ColorModeButton />
                        </TabList>

                        <TabPanels
                            flex={1}
                            overflowY="auto"
                            bg="bg.default"
                            borderRadius="20px"
                            p={{ base: 1, md: 2 }}
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '10px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: 'card.lightGray',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: 'text.secondary',
                                    borderRadius: 'full',
                                    _hover: {
                                        bg: 'brand.pink',
                                    },
                                },
                            }}
                        >
                            <TabPanel></TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <PlayerList />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <GameEventsProvider 
                                    isModalOpen={isOpen} 
                                    eventTypes={FINANCIAL_EVENT_TYPES}
                                >
                                    <Ledger />
                                </GameEventsProvider>
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <GameEventsProvider isModalOpen={isOpen}>
                                    <GameLog />
                                </GameEventsProvider>
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <GameSettings />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <Support />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
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
