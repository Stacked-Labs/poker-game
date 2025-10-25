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
    Text,
    Heading,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { keyframes } from '@emotion/react';
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

// Animations
const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const slideUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(30px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const motionStyle: MotionStyle = {
    display: 'inline-block',
    color: '#334479',
};

const variants = {
    hover: { scale: 1.15, rotate: 5, transition: { duration: 0.3 } },
    initial: { scale: 1, rotate: 0 },
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
            <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
            <ModalContent
                bg="white"
                zIndex={'modal'}
                borderRadius="32px"
                maxWidth="420px"
                minWidth="320px"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                animation={`${slideUp} 0.4s ease-out`}
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.8)"
            >
                {/* Animated Gradient Border */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius="32px"
                    padding="3px"
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="200% 200%"
                    animation={`${gradientShift} 4s ease infinite`}
                    pointerEvents="none"
                    zIndex={0}
                >
                    <Box
                        width="100%"
                        height="100%"
                        bg="white"
                        borderRadius="29px"
                    />
                </Box>

                {/* Content Container */}
                <Box position="relative" zIndex={1}>
                    {/* Easter Egg Chair - Top Left */}
                    <Tooltip
                        label='"All you need is a chip and a chair." — Jack Straus'
                        fontSize="xs"
                        placement="bottom"
                        bg="brand.navy"
                        color="white"
                        borderRadius="lg"
                        px={3}
                        py={1.5}
                    >
                        <Box
                            as={motion.div}
                            position="absolute"
                            top={4}
                            left={4}
                            style={motionStyle}
                            variants={variants}
                            initial="initial"
                            whileHover="hover"
                            fontSize="2xl"
                            animation={`${float} 3s ease-in-out infinite`}
                            cursor="pointer"
                            zIndex={2}
                        >
                            🪑
                        </Box>
                    </Tooltip>

                    <ModalCloseButton
                        color="brand.navy"
                        size="lg"
                        top={4}
                        right={4}
                        borderRadius="full"
                        _hover={{
                            bg: 'brand.lightGray',
                            transform: 'rotate(90deg)',
                        }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    />

                    <ModalHeader textAlign="center" pt={12} pb={4}>
                        <VStack spacing={2}>
                            <Heading
                                as="h2"
                                fontSize="2xl"
                                fontWeight="bold"
                                color="brand.navy"
                                letterSpacing="-0.02em"
                            >
                                Take Your Seat
                            </Heading>
                            <Text
                                fontSize="sm"
                                color="gray.600"
                                fontWeight="medium"
                                textAlign="center"
                                px={4}
                            >
                                Join the table and start playing
                            </Text>
                        </VStack>
                    </ModalHeader>

                    <ModalBody px={8} pb={4} pt={2}>
                        <Center>
                            <VStack w="100%" spacing={4}>
                                {/* Name Input */}
                                <FormControl>
                                    <FormLabel
                                        color="brand.navy"
                                        fontSize="2xl"
                                        mb={1}
                                        textAlign="center"
                                    >
                                        🕵️
                                    </FormLabel>
                                    <Input
                                        placeholder="Enter your name"
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        _placeholder={{ color: 'gray.400' }}
                                        color="brand.navy"
                                        bg="brand.lightGray"
                                        border="2px solid transparent"
                                        borderRadius="12px"
                                        height="56px"
                                        fontSize="md"
                                        fontWeight="semibold"
                                        _hover={{
                                            borderColor: 'brand.green',
                                        }}
                                        _focus={{
                                            borderColor: 'brand.pink',
                                            boxShadow:
                                                '0 0 0 3px rgba(235, 11, 92, 0.1)',
                                            bg: 'white',
                                        }}
                                        transition="all 0.2s ease"
                                        required
                                    />
                                </FormControl>

                                {/* Buy-in Input */}
                                <FormControl>
                                    <FormLabel
                                        color="brand.navy"
                                        fontSize="2xl"
                                        mb={1}
                                        textAlign="center"
                                    >
                                        💵
                                    </FormLabel>
                                    <Input
                                        placeholder="Buy-in amount"
                                        type="number"
                                        onChange={(e) =>
                                            setBuyIn(parseFloat(e.target.value))
                                        }
                                        _placeholder={{ color: 'gray.400' }}
                                        color="brand.navy"
                                        bg="brand.lightGray"
                                        border="2px solid transparent"
                                        borderRadius="12px"
                                        height="56px"
                                        fontSize="md"
                                        fontWeight="semibold"
                                        _hover={{
                                            borderColor: 'brand.green',
                                        }}
                                        _focus={{
                                            borderColor: 'brand.pink',
                                            boxShadow:
                                                '0 0 0 3px rgba(235, 11, 92, 0.1)',
                                            bg: 'white',
                                        }}
                                        transition="all 0.2s ease"
                                        required
                                    />
                                </FormControl>
                            </VStack>
                        </Center>
                    </ModalBody>

                    <ModalFooter px={8} pb={8} pt={2}>
                        <VStack w="100%" spacing={4}>
                            {/* Wallet Button */}
                            <Box
                                width="100%"
                                sx={{
                                    '& > div': {
                                        display: 'flex !important',
                                        width: '100% !important',
                                        height: '56px !important',
                                    },
                                    '& button': {
                                        height: '56px !important',
                                        minHeight: '56px !important',
                                        borderRadius: '12px !important',
                                        fontSize: 'md !important',
                                        fontWeight: 'bold !important',
                                        transition: 'all 0.2s ease !important',
                                    },
                                    '& button:hover': {
                                        backgroundColor:
                                            'var(--chakra-colors-brand-pink) !important',
                                        color: 'white !important',
                                        transform:
                                            'translateY(-2px) !important',
                                        boxShadow:
                                            '0 8px 20px rgba(235, 11, 92, 0.3) !important',
                                    },
                                }}
                            >
                                <WalletButton width="100%" height="56px" />
                            </Box>

                            {/* Join Button */}
                            <Button
                                w="100%"
                                h="56px"
                                fontSize="md"
                                fontWeight="bold"
                                borderRadius="12px"
                                bg="brand.green"
                                color="white"
                                border="none"
                                isDisabled={
                                    name === '' ||
                                    buyIn === null ||
                                    isNaN(Number(buyIn)) ||
                                    buyIn <= 0
                                }
                                _disabled={{
                                    bg: 'gray.300',
                                    color: 'gray.500',
                                    cursor: 'not-allowed',
                                    opacity: 0.6,
                                }}
                                _active={{
                                    transform: 'translateY(0)',
                                }}
                                position="relative"
                                overflow="hidden"
                                _before={{
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bg: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    transform: 'translateX(-100%)',
                                    transition: 'transform 0.6s',
                                }}
                                _hover={{
                                    bg: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 12px 24px rgba(54, 163, 123, 0.35)',
                                    _before: {
                                        transform: 'translateX(100%)',
                                    },
                                }}
                                transition="all 0.2s ease"
                                onClick={handleJoin}
                                type="submit"
                            >
                                Join Game
                            </Button>
                        </VStack>
                    </ModalFooter>
                </Box>

                {/* Decorative Background Elements */}
                <Box
                    position="absolute"
                    top="-20px"
                    right="-20px"
                    width="120px"
                    height="120px"
                    borderRadius="50%"
                    bg="brand.pink"
                    opacity={0.08}
                    filter="blur(40px)"
                    pointerEvents="none"
                />
                <Box
                    position="absolute"
                    bottom="-30px"
                    left="-30px"
                    width="140px"
                    height="140px"
                    borderRadius="50%"
                    bg="brand.green"
                    opacity={0.08}
                    filter="blur(50px)"
                    pointerEvents="none"
                />
            </ModalContent>
        </Modal>
    );
};

export default TakeSeatModal;
