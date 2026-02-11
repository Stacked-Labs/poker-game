'use client';
import React, { useState, useContext, useEffect, useMemo } from 'react';
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
    FormErrorMessage,
    VStack,
    Center,
    HStack,
    Text,
    Heading,
    Spinner,
    Image,
    Flex,
    Icon,
    Link,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { keyframes } from '@emotion/react';
import WalletButton from './WalletButton';
import { newPlayer, takeSeat } from '../hooks/server_actions';
import { useCurrentUser } from '@/app/contexts/CurrentUserProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useDepositAndJoin } from '../hooks/useDepositAndJoin';
import { useActiveWallet } from 'thirdweb/react';
import { FaInfoCircle } from 'react-icons/fa';

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

const USERNAME_MAX_LENGTH = 9;
const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

const TakeSeatModal = ({ isOpen, onClose, seatId }: TakeSeatModalProps) => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const appStore = useContext(AppContext);
    const config = appStore.appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const initialBuyIn = config?.maxBuyIn ?? null;
    const currentUser = useCurrentUser();
    const socket = useContext(SocketContext);
    const { isAuthenticated, isAuthenticating } = useAuth();
    const [name, setName] = useState('');
    const [buyIn, setBuyIn] = useState<number | null>(initialBuyIn);
    const [buyInInput, setBuyInInput] = useState(() => {
        if (initialBuyIn === null || isNaN(Number(initialBuyIn))) {
            return '';
        }
        if (isCryptoGame) {
            const usdcValue = initialBuyIn / CHIPS_PER_USDC;
            const rounded = Math.round(usdcValue * 100) / 100;
            return rounded.toString();
        }
        return initialBuyIn.toString();
    });
    const [inputUnit, setInputUnit] = useState<'chips' | 'usdc'>(
        isCryptoGame ? 'usdc' : 'chips'
    );
    const { error, success } = useToastHelper();
    const needsWalletSignIn = isCryptoGame && (!address || !isAuthenticated);
    const cryptoJoinHint = !address
        ? 'Sign in with your wallet to join this crypto game.'
        : isAuthenticating
          ? 'Check your wallet to sign the message…'
          : 'Sign the message in your wallet to continue.';

    // Crypto deposit hook
    const {
        depositAndJoin,
        status: depositStatus,
        error: depositError,
        isLoading: isDepositing,
        reset: resetDeposit,
        usdcBalance,
        refreshBalance,
    } = useDepositAndJoin(contractAddress);

    const isNameInvalid =
        !isCryptoGame &&
        (name.length === 0 || name.length > USERNAME_MAX_LENGTH);
    const isBuyInInvalid = buyIn === null || isNaN(Number(buyIn)) || buyIn <= 0;
    const isJoinDisabled = isDepositing || isNameInvalid || isBuyInInvalid;
    const isJoinVisuallyDisabled = isJoinDisabled || needsWalletSignIn;

    const formattedUsdcBalance = useMemo(() => {
        if (usdcBalance === null) return null;
        const numeric = Number(usdcBalance) / 1_000_000;
        return numeric.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [usdcBalance]);

    const buyInUsdc = useMemo(() => {
        if (!isCryptoGame || buyIn === null || isNaN(Number(buyIn))) {
            return null;
        }
        return buyIn / CHIPS_PER_USDC;
    }, [buyIn, isCryptoGame]);

    const formattedChipsEstimate = useMemo(() => {
        if (buyIn === null || isNaN(Number(buyIn))) return null;
        return Math.round(buyIn).toLocaleString('en-US');
    }, [buyIn]);

    const formattedUsdcEstimate = useMemo(() => {
        if (buyInUsdc === null || isNaN(Number(buyInUsdc))) return null;
        return buyInUsdc.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [buyInUsdc]);

    const isBalanceInsufficient =
        isCryptoGame &&
        usdcBalance !== null &&
        buyInUsdc !== null &&
        buyInUsdc > Number(usdcBalance) / 1_000_000;

    const formatUsdcInput = (value: number) => {
        if (!Number.isFinite(value)) return '';
        const rounded = Math.round(value * 100) / 100;
        return rounded.toString();
    };

    const handleBuyInChange = (value: string) => {
        if (isCryptoGame) {
            if (inputUnit === 'usdc') {
                if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
                setBuyInInput(value);
                if (value === '' || value === '.') {
                    setBuyIn(null);
                    return;
                }
                const usdcValue = Number(value);
                setBuyIn(Math.round(usdcValue * CHIPS_PER_USDC));
                return;
            }

            if (!/^\d*$/.test(value)) return;
            setBuyInInput(value);
            if (value === '') {
                setBuyIn(null);
                return;
            }
            const chips = Number(value);
            setBuyIn(chips);
            return;
        }

        if (!/^\d*$/.test(value)) return;
        setBuyInInput(value);
        if (value === '') {
            setBuyIn(null);
            return;
        }
        setBuyIn(Number(value));
    };

    const handleJoin = async () => {
        // Basic validation for seatId, buyIn
        if (!seatId) {
            error('Missing Information', 'Seat ID is missing.');
            return;
        }
        if (isBuyInInvalid) {
            error('Invalid Amount', 'Please enter a valid buy-in amount.');
            return;
        }
        if (buyIn === null) {
            return;
        }
        if (needsWalletSignIn) {
            error('Authentication Required', cryptoJoinHint);
            return;
        }

        const buyInValue = buyIn;

        // Crypto game flow: deposit via smart contract
        if (isCryptoGame) {
            if (!contractAddress) {
                error('Contract Error', 'Game contract address not available.');
                return;
            }

            const depositSuccess = await depositAndJoin(buyInValue);

            if (depositSuccess) {
                appStore.dispatch({ type: 'setSeatRequested', payload: seatId });
                success(
                    'Deposit Successful',
                    'Your deposit is being processed. You will be seated once approved.'
                );
                onClose();
            } else {
                // Error is already set in the hook, just show it
                if (depositError) {
                    error('Deposit Failed', depositError);
                }
            }
            return;
        }

        // Regular game flow: WebSocket
        if (!socket) {
            error('Connection Error', 'Unable to connect to the server.');
            return;
        }
        if (name.length === 0) {
            error('Missing Information', 'Please enter a username.');
            return;
        }
        if (name.length > USERNAME_MAX_LENGTH) {
            error(
                'Invalid Username',
                `Username must be fewer than 10 characters.`
            );
            return;
        }
        newPlayer(socket, name);
        takeSeat(socket, name, seatId, buyInValue);
        appStore.dispatch({ type: 'setUsername', payload: name });
        appStore.dispatch({ type: 'setSeatRequested', payload: seatId });
        currentUser.setCurrentUser({ name, seatId });
        onClose();
    };

    useEffect(() => {
        if (!isCryptoGame && inputUnit !== 'chips') {
            setInputUnit('chips');
        }
    }, [inputUnit, isCryptoGame]);

    const handleUnitChange = (unit: 'chips' | 'usdc') => {
        if (unit === inputUnit) return;
        setInputUnit(unit);
        if (buyIn === null || isNaN(Number(buyIn))) {
            setBuyInInput('');
            return;
        }
        if (unit === 'usdc') {
            setBuyInInput(formatUsdcInput(buyIn / CHIPS_PER_USDC));
            return;
        }
        setBuyInInput(Math.round(buyIn).toString());
    };

    useEffect(() => {
        if (!isOpen || !isCryptoGame || !refreshBalance) return;
        refreshBalance();
    }, [isOpen, isCryptoGame, refreshBalance]);

    // Reset deposit state when modal closes
    const handleClose = () => {
        resetDeposit();
        onClose();
    };

    // Get status message for crypto deposit
    const getDepositStatusMessage = () => {
        switch (depositStatus) {
            case 'checking_allowance':
                return 'Checking USDC balance...';
            case 'approving':
                return 'Approving USDC transfer...';
            case 'depositing':
                return 'Depositing to table...';
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
            <ModalContent
                zIndex={'modal'}
                borderRadius="32px"
                maxWidth="420px"
                minWidth="320px"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                animation={`${slideUp} 0.4s ease-out`}
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="card.white"
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
                        bg="card.white"
                        borderRadius="29px"
                    />
                </Box>

                {/* Content Container */}
                <Box position="relative" zIndex={1} bg={'card.white'}>
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
                        color="text.secondary"
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
                                color="text.secondary"
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
                                {isCryptoGame
                                    ? 'Deposit USDC to join the table'
                                    : 'Join the table and start playing'}
                            </Text>
                        </VStack>
                    </ModalHeader>

                    <ModalBody px={8} pb={4} pt={2}>
                        <Center>
                            <VStack w="100%" spacing={4}>
                                {/* Name Input - only for non-crypto games */}
                                {!isCryptoGame && (
                                    <FormControl
                                        isInvalid={
                                            name.length > 0 &&
                                            name.length > USERNAME_MAX_LENGTH
                                        }
                                    >
                                        <FormLabel
                                            color="text.secondary"
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
                                            variant={'takeSeatModal'}
                                            maxLength={USERNAME_MAX_LENGTH}
                                            required
                                        />
                                        <FormErrorMessage fontSize="xs" mt={1}>
                                            Username must be fewer than 10
                                            characters.
                                        </FormErrorMessage>
                                    </FormControl>
                                )}

                                {/* Buy-in Input */}
                                <FormControl>
                                    <Flex
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1}
                                    >
                                        <FormLabel
                                            color="text.secondary"
                                            fontSize="2xl"
                                            mb={0}
                                            textAlign="center"
                                        >
                                            {isCryptoGame ? '💰' : '💵'}
                                        </FormLabel>
                                        {isCryptoGame && (
                                            <Box
                                                position="relative"
                                                width="140px"
                                                height="28px"
                                            >
                                                <Box
                                                    position="absolute"
                                                    inset={0}
                                                    bg="card.lightGray"
                                                    borderRadius="full"
                                                />
                                                <Box
                                                    position="absolute"
                                                    top="3px"
                                                    left={
                                                        inputUnit === 'chips'
                                                            ? '3px'
                                                            : 'calc(50% + 3px)'
                                                    }
                                                    width="calc(50% - 6px)"
                                                    height="22px"
                                                    bg="white"
                                                    borderRadius="full"
                                                    boxShadow="sm"
                                                    transition="left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                                />
                                                <Flex
                                                    position="relative"
                                                    zIndex={1}
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    height="full"
                                                >
                                                    <Box
                                                        as="button"
                                                        type="button"
                                                        flex="1"
                                                        height="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        onClick={() =>
                                                            handleUnitChange(
                                                                'chips'
                                                            )
                                                        }
                                                        background="transparent"
                                                        disabled={isDepositing}
                                                    >
                                                        <Text
                                                            fontSize="xs"
                                                            fontWeight="semibold"
                                                            color={
                                                                inputUnit ===
                                                                'chips'
                                                                    ? 'brand.darkNavy'
                                                                    : 'gray.500'
                                                            }
                                                            whiteSpace="nowrap"
                                                        >
                                                            Chips
                                                        </Text>
                                                    </Box>
                                                    <Box
                                                        as="button"
                                                        type="button"
                                                        flex="1"
                                                        height="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        onClick={() =>
                                                            handleUnitChange(
                                                                'usdc'
                                                            )
                                                        }
                                                        background="transparent"
                                                        disabled={isDepositing}
                                                    >
                                                        <Text
                                                            fontSize="xs"
                                                            fontWeight="semibold"
                                                            color={
                                                                inputUnit ===
                                                                'usdc'
                                                                    ? 'brand.darkNavy'
                                                                    : 'gray.500'
                                                            }
                                                            whiteSpace="nowrap"
                                                        >
                                                            USDC
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                            </Box>
                                        )}
                                    </Flex>
                                    <Box position="relative">
                                        <Input
                                            placeholder={
                                                isCryptoGame
                                                    ? inputUnit === 'usdc'
                                                        ? 'Enter USDC'
                                                        : 'Enter chips'
                                                    : 'Buy-in amount'
                                            }
                                            type="number"
                                            step={
                                                isCryptoGame &&
                                                inputUnit === 'usdc'
                                                    ? '0.01'
                                                    : '1'
                                            }
                                            inputMode={
                                                isCryptoGame &&
                                                inputUnit === 'usdc'
                                                    ? 'decimal'
                                                    : 'numeric'
                                            }
                                            onChange={(e) =>
                                                handleBuyInChange(
                                                    e.target.value
                                                )
                                            }
                                            variant={'takeSeatModal'}
                                            required
                                            isDisabled={isDepositing}
                                            value={buyInInput}
                                            pr="70px"
                                        />
                                        <Text
                                            position="absolute"
                                            right="16px"
                                            top="50%"
                                            transform="translateY(-50%)"
                                            fontSize="xs"
                                            color="gray.400"
                                            fontWeight="semibold"
                                            letterSpacing="0.02em"
                                            pointerEvents="none"
                                            textTransform="uppercase"
                                        >
                                            {isCryptoGame
                                                ? inputUnit
                                                : 'chips'}
                                        </Text>
                                    </Box>
                                    {isCryptoGame && (
                                        <Flex
                                            mt={2}
                                            alignItems="center"
                                            justifyContent="space-between"
                                            gap={2}
                                            fontSize="xs"
                                            color="gray.500"
                                            fontWeight="medium"
                                            lineHeight="short"
                                        >
                                            <Flex
                                                alignItems="center"
                                                gap={1}
                                                minWidth={0}
                                            >
                                                {inputUnit === 'chips' ? (
                                                    <>
                                                        <Text
                                                            as="span"
                                                            color="inherit"
                                                            isTruncated
                                                        >
                                                            {CHIPS_PER_USDC}{' '}
                                                            chips = 1
                                                        </Text>
                                                        <Text
                                                            as="span"
                                                            color="inherit"
                                                            isTruncated
                                                        >
                                                            USDC
                                                        </Text>
                                                        <Image
                                                            src={USDC_LOGO_URL}
                                                            alt="USDC"
                                                            boxSize="14px"
                                                            loading="lazy"
                                                            flexShrink={0}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text
                                                            as="span"
                                                            color="inherit"
                                                            isTruncated
                                                        >
                                                            1 USDC
                                                        </Text>
                                                        <Image
                                                            src={USDC_LOGO_URL}
                                                            alt="USDC"
                                                            boxSize="14px"
                                                            loading="lazy"
                                                            flexShrink={0}
                                                        />
                                                        <Text
                                                            as="span"
                                                            color="inherit"
                                                            isTruncated
                                                        >
                                                            = {CHIPS_PER_USDC}{' '}
                                                            chips
                                                        </Text>
                                                    </>
                                                )}
                                            </Flex>
                                            {formattedChipsEstimate &&
                                                formattedUsdcEstimate && (
                                                    <Text
                                                        as="span"
                                                        color="gray.500"
                                                        textAlign="right"
                                                        whiteSpace="nowrap"
                                                    >
                                                        {inputUnit === 'chips'
                                                            ? `~ ${formattedUsdcEstimate} USDC`
                                                            : `~ ${formattedChipsEstimate} chips`}
                                                    </Text>
                                                )}
                                        </Flex>
                                    )}
                                </FormControl>

                            </VStack>
                        </Center>
                    </ModalBody>

                    <ModalFooter px={8} pb={8} pt={2}>
                        <VStack w="100%" spacing={4}>
                            {/* Wallet Button */}
                            <WalletButton width="100%" height="56px" />
                            {needsWalletSignIn && (
                                <HStack
                                    spacing={2}
                                    alignItems="flex-start"
                                    bg="rgba(54, 163, 123, 0.12)"
                                    color="green.700"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    fontSize="xs"
                                    fontWeight="medium"
                                    width="100%"
                                    alignSelf="stretch"
                                >
                                    <Icon
                                        as={FaInfoCircle}
                                        boxSize={3.5}
                                        mt={0.5}
                                    />
                                    <Text color="inherit" textAlign="left">
                                        {cryptoJoinHint}
                                    </Text>
                                </HStack>
                            )}
                            {isBalanceInsufficient && (
                                <HStack
                                    spacing={2}
                                    alignItems="flex-start"
                                    bg="red.50"
                                    color="red.700"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    fontSize="xs"
                                    fontWeight="medium"
                                    width="100%"
                                    alignSelf="stretch"
                                >
                                    <Icon
                                        as={FaInfoCircle}
                                        boxSize={3.5}
                                        mt={0.5}
                                    />
                                    <Text color="inherit" textAlign="left">
                                        Insufficient USDC balance
                                        {formattedUsdcBalance
                                            ? ` (balance: ${formattedUsdcBalance} USDC)`
                                            : ''}
                                        .
                                    </Text>
                                </HStack>
                            )}
                            {/* Deposit Error Message */}
                            {depositStatus === 'error' && depositError && (
                                <HStack
                                    spacing={2}
                                    alignItems="flex-start"
                                    bg="red.50"
                                    color="red.700"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    fontSize="xs"
                                    fontWeight="medium"
                                    width="100%"
                                    alignSelf="stretch"
                                >
                                    <Icon
                                        as={FaInfoCircle}
                                        boxSize={3.5}
                                        mt={0.5}
                                    />
                                    <Text
                                        color="inherit"
                                        textAlign="left"
                                        wordBreak="break-word"
                                    >
                                        {depositError}
                                    </Text>
                                </HStack>
                            )}

                            {/* Join Button */}
                            <Tooltip
                                label={cryptoJoinHint}
                                isDisabled={!needsWalletSignIn}
                                placement="top"
                                fontSize="xs"
                                bg="brand.navy"
                                color="white"
                                borderRadius="md"
                                px={2}
                                py={1}
                            >
                                <Button
                                    w="100%"
                                    h="56px"
                                    fontSize="md"
                                    fontWeight="bold"
                                    borderRadius={'bigButton'}
                                    bg={
                                        isJoinVisuallyDisabled
                                            ? 'gray.300'
                                            : 'brand.green'
                                    }
                                    color={
                                        isJoinVisuallyDisabled
                                            ? 'gray.500'
                                            : 'white'
                                    }
                                    border="none"
                                    cursor={
                                        isJoinVisuallyDisabled
                                            ? 'not-allowed'
                                            : 'pointer'
                                    }
                                    aria-disabled={
                                        isJoinVisuallyDisabled || undefined
                                    }
                                    isDisabled={isJoinDisabled}
                                    isLoading={isDepositing}
                                    loadingText={
                                        getDepositStatusMessage() ||
                                        'Processing...'
                                    }
                                    _disabled={{
                                        bg: 'gray.300',
                                        color: 'gray.500',
                                        cursor: 'not-allowed',
                                        opacity: 0.6,
                                    }}
                                    _active={{
                                        transform: isJoinVisuallyDisabled
                                            ? 'none'
                                            : 'translateY(0)',
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
                                        opacity: isJoinVisuallyDisabled ? 0 : 1,
                                    }}
                                    _hover={
                                        isJoinVisuallyDisabled
                                            ? {}
                                            : {
                                                  bg: 'brand.green',
                                                  transform: 'translateY(-2px)',
                                                  boxShadow:
                                                      '0 12px 24px rgba(54, 163, 123, 0.35)',
                                                  _before: {
                                                      transform:
                                                          'translateX(100%)',
                                                  },
                                              }
                                    }
                                    transition="all 0.2s ease"
                                    onClick={handleJoin}
                                    type="submit"
                                >
                                    {isCryptoGame
                                        ? 'Deposit & Join'
                                        : 'Join Game'}
                                </Button>
                            </Tooltip>
                            {isCryptoGame && (
                                <Text
                                    fontSize="2xs"
                                    color="text.muted"
                                    textAlign="center"
                                    lineHeight="short"
                                    px={2}
                                    opacity={0.7}
                                >
                                    Your USDC is deposited into the table
                                    contract and converted to chips. Chip
                                    balances update after each settled hand.
                                    {' '}{CHIPS_PER_USDC}
                                    {' '}chips&nbsp;=&nbsp;1&nbsp;USDC.
                                    {contractAddress && (
                                        <>
                                            {' '}
                                            <Link
                                                href={`https://sepolia.basescan.org/address/${contractAddress}`}
                                                isExternal
                                                color="brand.navy"
                                                _dark={{
                                                    color: 'brand.lightGray',
                                                }}
                                                fontWeight="semibold"
                                                textDecoration="underline"
                                                textUnderlineOffset="2px"
                                            >
                                                View contract
                                            </Link>
                                        </>
                                    )}
                                </Text>
                            )}
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
