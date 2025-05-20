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
    Box,
    Text,
} from '@chakra-ui/react';
import { IoCaretBack } from 'react-icons/io5';
import GameSettings from './GameSettings';
import PlayerList from './PlayerList';

const SettingsModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'full'} isCentered>
            <ModalOverlay />
            <ModalContent bgColor="gray.100" zIndex={'base'} padding={4}>
                <ModalBody w="100% ">
                    <Tabs
                        size="md"
                        variant="enclosed"
                        colorScheme="green.500"
                        defaultIndex={1}
                        isFitted
                    >
                        <TabList gap={5} borderBottomColor={'green.500'}>
                            <Tab
                                onClick={onClose}
                                alignItems={'center'}
                                _focus={{ border: 0 }}
                            >
                                <Box>
                                    <IoCaretBack color="white" />
                                </Box>
                                <Text color="white">Back</Text>
                            </Tab>
                            <Tab
                                _selected={{
                                    bg: 'green.500',
                                }}
                            >
                                <Text color="white">Players</Text>
                            </Tab>
                            <Tab
                                _selected={{
                                    bg: 'green.500',
                                }}
                            >
                                <Text color="white">Game</Text>
                            </Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel></TabPanel>
                            <TabPanel>
                                <PlayerList />
                            </TabPanel>
                            <TabPanel>
                                <GameSettings />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;
