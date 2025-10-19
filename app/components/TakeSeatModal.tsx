'use client';
import React, { useState, useContext } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Input,
    Tooltip,
    Box,
    FormControl,
    FormLabel,
    VStack,
    Center,
    HStack,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import WalletButton from './WalletButton';
import { newPlayer, sendLog, takeSeat } from '../hooks/server_actions';
import { useCurrentUser } from '@/app/contexts/CurrentUserProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useActiveWallet } from 'thirdweb/react';

interface TakeSeatModalProps {
    isOpen: boolean;
    onClose: () => void;
    seatId?: number;
}

const motionStyle: MotionStyle = {
    display: 'inline-block',
    color: 'white',
};

const variants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
    initial: { scale: 1 },
};

const TakeSeatModal = ({ isOpen, onClose, seatId }: TakeSeatModalProps) => {
    const address = useActiveWallet()?.getAccount()?.address;
    const appStore = useContext(AppContext);
    const currentUser = useCurrentUser();
    const socket = useContext(SocketContext);
    const [name, setName] = useState('');
    const [buyIn, setBuyIn] = useState(
        appStore.appState.game?.config.maxBuyIn
            ? appStore.appState.game?.config.maxBuyIn
            : null
    );
    const { error } = useToastHelper();

    const handleJoin = () => {
        /* REMOVED Wallet Check
        if (!address) {
            error(
                'Wallet Not Connected',
                'Please connect your wallet to join.'
            );
            return;
        }
        */

        // Basic validation for name, seatId, buyIn
        if (!socket) {
            error('Connection Error', 'Unable to connect to the server.');
            return;
        }
        if (name.length === 0) {
            error('Missing Information', 'Please enter a username.');
            return;
        }
        if (!seatId) {
            error('Missing Information', 'Seat ID is missing.'); // Should not happen
            return;
        }
        if (buyIn === null || isNaN(Number(buyIn)) || buyIn <= 0) {
            error('Invalid Amount', 'Please enter a valid buy-in amount.');
            return;
        }

        // Proceed with sending messages
        newPlayer(socket, name);
        takeSeat(socket, name, seatId, buyIn);
        appStore.dispatch({ type: 'setUsername', payload: name });
        appStore.dispatch({ type: 'setSeatRequested', payload: seatId });
        currentUser.setCurrentUser({ name, seatId });
        sendLog(socket, `${name} buys in for ${buyIn}`);
        onClose(); // Close modal after sending
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent
                bgColor="gray.100"
                zIndex={'base'}
                borderRadius="3xl"
                maxWidth="350px"
            >
                <ModalHeader color="#f2f2f2" textAlign="center" p={0}>
                    <Tooltip
                        label="All you need is a chip and a chair - Jack  Straus"
                        fontSize="lg"
                        placement="top"
                    >
                        <Box
                            as={motion.div}
                            style={motionStyle}
                            variants={variants}
                            initial="initial"
                            whileHover="hover"
                            fontSize="6xl"
                        >
                            🪑
                        </Box>
                    </Tooltip>
                </ModalHeader>
                <ModalCloseButton color={'#f2f2f2'} size="42px" padding={2} />
                <ModalBody w="100% " mt={-8}>
                    <Center>
                        <FormControl justifyContent={'center'} w="80%">
                            <FormLabel color="#f2f2f2" fontSize={'4xl'}>
                                🕵️
                            </FormLabel>
                            <Input
                                border={'1.5px solid #f2f2f2'}
                                placeholder="Name"
                                onChange={(e) => setName(e.target.value)}
                                _placeholder={{ color: 'white' }}
                                color="white"
                                required
                            />
                            <FormLabel mt={4} color="#f2f2f2" fontSize={'4xl'}>
                                💵
                            </FormLabel>
                            <Input
                                border={'1.5px solid #f2f2f2'}
                                placeholder="Amount"
                                type="number"
                                onChange={(e) =>
                                    setBuyIn(parseFloat(e.target.value))
                                }
                                _placeholder={{ color: 'white' }}
                                color="white"
                                required
                            />
                        </FormControl>
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <VStack w={'100%'}>
                        <WalletButton width="80%" />
                        <HStack width="80%" justifyContent={'flex-end'} mt={4}>
                            <Button
                                size="lg"
                                mb={4}
                                w={'fit-content'}
                                h={12}
                                isDisabled={
                                    name === '' ||
                                    buyIn === null ||
                                    isNaN(Number(buyIn)) ||
                                    buyIn <= 0 // Allow join even if address is null
                                }
                                bg="green.500"
                                color="white"
                                _hover={{
                                    borderColor: 'white',
                                    borderWidth: '2px',
                                }}
                                onClick={() => {
                                    handleJoin();
                                }}
                                type="submit"
                            >
                                Join
                            </Button>
                        </HStack>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TakeSeatModal;
