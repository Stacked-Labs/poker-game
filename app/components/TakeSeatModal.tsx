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
    FormErrorMessage,
    VStack,
    HStack,
    Text,
    Heading,
    Image,
    Flex,
    Icon,
    Link,
    Collapse,
    useDisclosure,
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
import { useWithdraw } from '../hooks/useWithdraw';
import { useActiveWallet } from 'thirdweb/react';
import { CHAIN_CONFIG, defaultChain, defaultUsdcAddress } from '../thirdwebclient';
import { FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useConnectX } from '@/app/hooks/useConnectX';
import BuyInPresets from './TakeSeat/BuyInPresets';
import StakesChip from './TakeSeat/StakesChip';
import { readLastBuyIn, writeLastBuyIn } from '@/app/lib/takeSeat/lastBuyIn';

interface TakeSeatModalProps {
    isOpen: boolean;
    onClose: () => void;
    seatId?: number;
}

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const motionStyle: MotionStyle = {
    display: 'inline-block',
};

const variants = {
    hover: { scale: 1.12, rotate: 4, transition: { duration: 0.3 } },
    initial: { scale: 1, rotate: 0 },
};

const USERNAME_MAX_LENGTH = 9;
const CHIPS_PER_USDC = 100;

const TakeSeatModal = ({ isOpen, onClose, seatId }: TakeSeatModalProps) => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const appStore = useContext(AppContext);
    const config = appStore.appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const chain = config?.chain;
    const sb = config?.sb ?? 0;
    const bb = config?.bb ?? 0;
    const maxBuyIn = config?.maxBuyIn ?? 0;

    // Table id for localStorage persistence (contract address for crypto;
    // chain+blinds hash fallback for free games so different tables don't collide).
    const tableKey =
        contractAddress ??
        (bb > 0 ? `free:${sb}-${bb}-${maxBuyIn}` : null);

    const chainCfg = CHAIN_CONFIG[config?.chain ?? ''] ?? { chain: defaultChain, usdc: defaultUsdcAddress };
    const tableChain = chainCfg.chain;
    const tableUsdcAddress = chainCfg.usdc;

    const currentUser = useCurrentUser();
    const socket = useContext(SocketContext);
    const {
        isAuthenticated,
        isAuthenticating,
        lastAuthenticatedAddress,
        xUsername,
        xProfileImageUrl,
    } = useAuth();
    const { connectX, isConnecting: isConnectingX } = useConnectX();

    // Buy-in initial value: last-used for this table → max buy-in
    const initialBuyIn = useMemo(() => {
        const remembered = readLastBuyIn(tableKey);
        if (remembered && remembered > 0) return remembered;
        return maxBuyIn > 0 ? maxBuyIn : null;
    }, [tableKey, maxBuyIn]);

    const [name, setName] = useState('');
    const [buyIn, setBuyIn] = useState<number | null>(initialBuyIn);
    const [buyInInput, setBuyInInput] = useState(() => {
        if (initialBuyIn === null) return '';
        if (isCryptoGame) {
            const usdcValue = initialBuyIn / CHIPS_PER_USDC;
            return (Math.round(usdcValue * 100) / 100).toString();
        }
        return initialBuyIn.toString();
    });
    const [inputUnit, setInputUnit] = useState<'chips' | 'usdc'>(
        isCryptoGame ? 'usdc' : 'chips'
    );

    const { error, deposit } = useToastHelper();
    const needsWalletSignIn = isCryptoGame && (!address || !isAuthenticated);
    const cryptoJoinHint = !address
        ? 'Sign in with your wallet to join this crypto game.'
        : isAuthenticating
          ? 'Check your wallet to sign the message…'
          : 'Sign the message in your wallet to continue.';

    const {
        depositAndJoin,
        status: depositStatus,
        error: depositError,
        isLoading: isDepositing,
        reset: resetDeposit,
        usdcBalance,
        refreshBalance,
    } = useDepositAndJoin(contractAddress, tableChain, tableUsdcAddress);

    const {
        withdraw,
        checkCanWithdraw,
        chipBalance: existingChipBalance,
        status: withdrawStatus,
        error: withdrawError,
        isLoading: isWithdrawing,
        reset: resetWithdraw,
    } = useWithdraw(contractAddress, tableChain);

    const seatRequested = appStore.appState.seatRequested;
    const hasExistingChips =
        existingChipBalance !== null && existingChipBalance > BigInt(0);
    const showWithdrawFirst =
        isCryptoGame && hasExistingChips && seatRequested === null;

    const formattedExistingChips = useMemo(() => {
        if (existingChipBalance === null) return null;
        return Number(existingChipBalance).toLocaleString('en-US');
    }, [existingChipBalance]);

    const effectiveName = !isCryptoGame && xUsername ? `@${xUsername}` : name;
    const isNameInvalid =
        !isCryptoGame &&
        !xUsername &&
        (name.length === 0 || name.length > USERNAME_MAX_LENGTH);
    const isBuyInInvalid = buyIn === null || isNaN(Number(buyIn)) || buyIn <= 0;
    const isJoinDisabled = isDepositing || isNameInvalid || isBuyInInvalid;
    const isJoinVisuallyDisabled = isJoinDisabled || needsWalletSignIn;

    const walletBalanceChips = useMemo(() => {
        if (!isCryptoGame || usdcBalance === null) return null;
        const dollars = Number(usdcBalance) / 1_000_000;
        return Math.floor(dollars * CHIPS_PER_USDC);
    }, [isCryptoGame, usdcBalance]);

    const formattedUsdcBalance = useMemo(() => {
        if (usdcBalance === null) return null;
        const numeric = Number(usdcBalance) / 1_000_000;
        return numeric.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [usdcBalance]);

    const buyInUsdc = useMemo(() => {
        if (!isCryptoGame || buyIn === null || isNaN(Number(buyIn))) return null;
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
        return (Math.round(value * 100) / 100).toString();
    };

    const applyBuyInChips = (chips: number) => {
        if (chips <= 0) {
            setBuyIn(null);
            setBuyInInput('');
            return;
        }
        setBuyIn(chips);
        if (isCryptoGame && inputUnit === 'usdc') {
            setBuyInInput(formatUsdcInput(chips / CHIPS_PER_USDC));
        } else {
            setBuyInInput(Math.round(chips).toString());
        }
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
                setBuyIn(Math.round(Number(value) * CHIPS_PER_USDC));
                return;
            }
            if (!/^\d*$/.test(value)) return;
            setBuyInInput(value);
            setBuyIn(value === '' ? null : Number(value));
            return;
        }
        if (!/^\d*$/.test(value)) return;
        setBuyInInput(value);
        setBuyIn(value === '' ? null : Number(value));
    };

    const handleJoin = async () => {
        if (!seatId) return error('Missing Information', 'Seat ID is missing.');
        if (isBuyInInvalid)
            return error('Invalid Amount', 'Please enter a valid buy-in amount.');
        if (buyIn === null) return;
        if (needsWalletSignIn)
            return error('Authentication Required', cryptoJoinHint);

        const buyInValue = buyIn;

        if (isCryptoGame) {
            if (!contractAddress)
                return error('Contract Error', 'Game contract address not available.');
            if (
                address?.toLowerCase() !==
                lastAuthenticatedAddress?.toLowerCase()
            ) {
                return error(
                    'Wallet Mismatch',
                    `Your active wallet doesn't match your authenticated session. Switch back to ${lastAuthenticatedAddress ? lastAuthenticatedAddress.slice(0, 6) + '...' + lastAuthenticatedAddress.slice(-4) : 'your original wallet'} or re-authenticate.`
                );
            }
            const depositSuccess = await depositAndJoin(buyInValue);
            if (depositSuccess) {
                writeLastBuyIn(tableKey, buyInValue);
                appStore.dispatch({ type: 'setSeatRequested', payload: seatId });
                deposit(buyInValue, isCryptoGame);
                onClose();
            } else if (depositError) {
                error('Deposit Failed', depositError);
            }
            return;
        }

        if (!socket)
            return error('Connection Error', 'Unable to connect to the server.');
        if (effectiveName.length === 0)
            return error('Missing Information', 'Please enter a username.');
        if (!xUsername && effectiveName.length > USERNAME_MAX_LENGTH)
            return error(
                'Invalid Username',
                `Username must be fewer than 10 characters.`
            );
        if (!xUsername && effectiveName.startsWith('@'))
            return error(
                'Reserved Username',
                'The @ prefix is reserved for linked X accounts. Connect your X account in Settings to use your handle.'
            );

        newPlayer(socket, effectiveName);
        takeSeat(socket, effectiveName, seatId, buyInValue);
        writeLastBuyIn(tableKey, buyInValue);
        appStore.dispatch({ type: 'setUsername', payload: effectiveName });
        appStore.dispatch({ type: 'setSeatRequested', payload: seatId });
        currentUser.setCurrentUser({ name: effectiveName, seatId });
        onClose();
    };

    useEffect(() => {
        const nextUnit = isCryptoGame ? 'usdc' : 'chips';
        setInputUnit(nextUnit);
        if (buyIn === null || isNaN(Number(buyIn))) return;
        if (nextUnit === 'usdc') {
            setBuyInInput(formatUsdcInput(buyIn / CHIPS_PER_USDC));
        } else {
            setBuyInInput(Math.round(buyIn).toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCryptoGame]);

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

    useEffect(() => {
        if (!isOpen || !isCryptoGame || !address) return;
        checkCanWithdraw();
    }, [isOpen, isCryptoGame, address, checkCanWithdraw]);

    const handleWithdraw = async () => {
        const success = await withdraw();
        if (success) refreshBalance();
    };

    const handleClose = () => {
        resetDeposit();
        resetWithdraw();
        onClose();
    };

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

    // Fine-print disclosure: default open on first crypto deposit, collapsed after.
    const finePrintDisclosure = useDisclosure({
        defaultIsOpen:
            isCryptoGame && !readLastBuyIn(tableKey),
    });

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
            <ModalContent
                zIndex="modal"
                borderRadius={{ base: '24px', sm: '28px' }}
                maxWidth={{ base: 'calc(100vw - 24px)', sm: '420px' }}
                mx={{ base: 3, sm: 'auto' }}
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                animation={`${slideUp} 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)`}
                overflow="hidden"
                position="relative"
                bg="card.white"
                border="1px solid"
                borderColor="border.lightGray"
            >
                {/* Easter egg chair — bottom-right, quiet */}
                <Tooltip
                    label='"All you need is a chip and a chair." — Jack Straus'
                    fontSize="xs"
                    placement="top"
                    bg="brand.navy"
                    color="white"
                    borderRadius="lg"
                    px={3}
                    py={1.5}
                >
                    <Box
                        as={motion.div}
                        position="absolute"
                        bottom={3}
                        right={3}
                        style={motionStyle}
                        variants={variants}
                        initial="initial"
                        whileHover="hover"
                        fontSize="sm"
                        animation={`${float} 5s ease-in-out infinite`}
                        cursor="pointer"
                        zIndex={2}
                        opacity={0.35}
                        _hover={{ opacity: 1 }}
                        transition="opacity 0.2s ease"
                    >
                        🪑
                    </Box>
                </Tooltip>

                <ModalCloseButton
                    color="text.secondary"
                    size="md"
                    top={3}
                    right={3}
                    borderRadius="full"
                    _hover={{
                        bg: 'card.lightGray',
                        transform: 'rotate(90deg)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                />

                {showWithdrawFirst ? (
                    /* ── Withdraw-first takeover ─────────────────────────── */
                    <>
                        <ModalHeader textAlign="center" pt={10} pb={2} px={6}>
                            <VStack spacing={2}>
                                <Heading
                                    as="h2"
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="text.secondary"
                                    letterSpacing="-0.02em"
                                >
                                    Chips still on this table
                                </Heading>
                                <StakesChip
                                    sb={sb}
                                    bb={bb}
                                    seatId={seatId}
                                    isCrypto={isCryptoGame}
                                    chain={chain}
                                />
                            </VStack>
                        </ModalHeader>
                        <ModalBody px={{ base: 5, sm: 7 }} pb={2} pt={2}>
                            <VStack spacing={4} w="100%">
                                <Box
                                    w="100%"
                                    bg="card.lightGray"
                                    borderRadius="xl"
                                    px={5}
                                    py={5}
                                    textAlign="center"
                                >
                                    <VStack spacing={2}>
                                        <Text
                                            fontSize="3xl"
                                            fontWeight="bold"
                                            color="text.secondary"
                                            letterSpacing="-0.02em"
                                            lineHeight={1}
                                        >
                                            {formattedExistingChips ?? '—'}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color="text.muted"
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="0.05em"
                                        >
                                            chips in contract
                                        </Text>
                                    </VStack>
                                </Box>
                                <Text
                                    fontSize="sm"
                                    color="text.secondary"
                                    textAlign="center"
                                    lineHeight="short"
                                    px={2}
                                >
                                    Withdraw these to your wallet first, then you can
                                    deposit a new amount and take your seat.
                                </Text>
                            </VStack>
                        </ModalBody>
                        <ModalFooter px={{ base: 5, sm: 7 }} pb={7} pt={4}>
                            <VStack w="100%" spacing={3}>
                                <WalletButton width="100%" height="52px" />
                                {withdrawStatus === 'error' && withdrawError && (
                                    <HStack
                                        spacing={2}
                                        alignItems="flex-start"
                                        bg="red.50"
                                        borderRadius="md"
                                        px={3}
                                        py={2}
                                        width="100%"
                                    >
                                        <Icon
                                            as={FaInfoCircle}
                                            boxSize={3.5}
                                            mt={0.5}
                                            color="red.700"
                                        />
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="red.700"
                                            textAlign="left"
                                            wordBreak="break-word"
                                        >
                                            {withdrawError}
                                        </Text>
                                    </HStack>
                                )}
                                <Button
                                    w="100%"
                                    h="52px"
                                    borderRadius="bigButton"
                                    bg="brand.pink"
                                    isLoading={isWithdrawing}
                                    loadingText="Withdrawing chips..."
                                    _hover={{
                                        bg: 'brand.pink',
                                        transform: 'translateY(-2px)',
                                        boxShadow:
                                            '0 12px 24px rgba(235, 11, 92, 0.3)',
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={handleWithdraw}
                                >
                                    <Text
                                        fontSize="md"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        Withdraw &amp; start fresh
                                    </Text>
                                </Button>
                            </VStack>
                        </ModalFooter>
                    </>
                ) : (
                    /* ── Normal join flow ────────────────────────────────── */
                    <>
                        <ModalHeader textAlign="center" pt={10} pb={2} px={6}>
                            <VStack spacing={1.5}>
                                <Heading
                                    as="h2"
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="text.secondary"
                                    letterSpacing="-0.02em"
                                >
                                    Take your seat
                                </Heading>
                                <StakesChip
                                    sb={sb}
                                    bb={bb}
                                    seatId={seatId}
                                    isCrypto={isCryptoGame}
                                    chain={chain}
                                />
                            </VStack>
                        </ModalHeader>

                        <ModalBody px={{ base: 5, sm: 7 }} pb={2} pt={2}>
                            <VStack w="100%" spacing={4}>
                                {/* Identity */}
                                {xUsername ? (
                                    <HStack
                                        spacing={2}
                                        py={1}
                                        w="100%"
                                        justify="center"
                                    >
                                        {xProfileImageUrl ? (
                                            <Image
                                                src={xProfileImageUrl}
                                                alt="X avatar"
                                                boxSize="22px"
                                                borderRadius="full"
                                                objectFit="cover"
                                                flexShrink={0}
                                            />
                                        ) : (
                                            <Flex
                                                boxSize="22px"
                                                borderRadius="full"
                                                bg="black"
                                                alignItems="center"
                                                justifyContent="center"
                                                flexShrink={0}
                                            >
                                                <Icon
                                                    as={FaXTwitter}
                                                    boxSize={2.5}
                                                    color="white"
                                                />
                                            </Flex>
                                        )}
                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="text.secondary"
                                            noOfLines={1}
                                        >
                                            @{xUsername}
                                        </Text>
                                    </HStack>
                                ) : (
                                    <VStack spacing={3} w="100%">
                                        <HStack
                                            as="button"
                                            onClick={connectX}
                                            disabled={isConnectingX}
                                            w="100%"
                                            py={2.5}
                                            justify="center"
                                            spacing={2}
                                            cursor="pointer"
                                            bg="transparent"
                                            border="none"
                                            opacity={0.6}
                                            _hover={{ opacity: 1 }}
                                            _disabled={{
                                                opacity: 0.3,
                                                cursor: 'not-allowed',
                                            }}
                                            transition="opacity 0.15s ease"
                                        >
                                            <Icon
                                                as={FaXTwitter}
                                                boxSize={3.5}
                                                color="text.primary"
                                            />
                                            <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                                color="text.secondary"
                                            >
                                                {isConnectingX
                                                    ? 'Connecting…'
                                                    : 'Sign in with X'}
                                            </Text>
                                        </HStack>
                                        {!isCryptoGame && (
                                            <>
                                                <HStack
                                                    w="100%"
                                                    spacing={3}
                                                    align="center"
                                                >
                                                    <Box
                                                        flex={1}
                                                        h="1px"
                                                        bg="border.lightGray"
                                                    />
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.secondary"
                                                        fontWeight="medium"
                                                        opacity={0.6}
                                                    >
                                                        or
                                                    </Text>
                                                    <Box
                                                        flex={1}
                                                        h="1px"
                                                        bg="border.lightGray"
                                                    />
                                                </HStack>
                                                <FormControl
                                                    isInvalid={
                                                        name.length > 0 &&
                                                        name.length >
                                                            USERNAME_MAX_LENGTH
                                                    }
                                                >
                                                    <Input
                                                        data-testid="username-input"
                                                        placeholder="Pick a username"
                                                        onChange={(e) =>
                                                            setName(e.target.value)
                                                        }
                                                        variant="takeSeatModal"
                                                        maxLength={USERNAME_MAX_LENGTH}
                                                        required
                                                    />
                                                    <FormErrorMessage fontSize="xs" mt={1}>
                                                        Username must be fewer than 10
                                                        characters.
                                                    </FormErrorMessage>
                                                </FormControl>
                                            </>
                                        )}
                                    </VStack>
                                )}

                                {/* Buy-in: hero input */}
                                <FormControl>
                                    {/* Header row: label + unit toggle (crypto only) */}
                                    <Flex
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={2}
                                    >
                                        <Text
                                            fontSize="2xs"
                                            color="text.muted"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="0.06em"
                                        >
                                            Buy-in
                                        </Text>
                                        {isCryptoGame && (
                                            <Box
                                                position="relative"
                                                width="120px"
                                                height="26px"
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
                                                            : 'calc(50% + 1px)'
                                                    }
                                                    width="calc(50% - 4px)"
                                                    height="20px"
                                                    bg="card.white"
                                                    borderRadius="full"
                                                    boxShadow="sm"
                                                    transition="left 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
                                                />
                                                <Flex
                                                    position="relative"
                                                    zIndex={1}
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    height="full"
                                                >
                                                    {(['chips', 'usdc'] as const).map(
                                                        (unit) => (
                                                            <Box
                                                                as="button"
                                                                type="button"
                                                                key={unit}
                                                                flex="1"
                                                                height="full"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                cursor="pointer"
                                                                onClick={() =>
                                                                    handleUnitChange(unit)
                                                                }
                                                                background="transparent"
                                                                disabled={isDepositing}
                                                            >
                                                                <Text
                                                                    fontSize="2xs"
                                                                    fontWeight="bold"
                                                                    letterSpacing="0.05em"
                                                                    textTransform="uppercase"
                                                                    color={
                                                                        inputUnit === unit
                                                                            ? 'text.secondary'
                                                                            : 'text.muted'
                                                                    }
                                                                >
                                                                    {unit === 'usdc'
                                                                        ? 'USDC'
                                                                        : 'Chips'}
                                                                </Text>
                                                            </Box>
                                                        )
                                                    )}
                                                </Flex>
                                            </Box>
                                        )}
                                    </Flex>
                                    {/* Hero input — borderless, oversized, centered */}
                                    <Flex
                                        align="baseline"
                                        justify="center"
                                        gap={2}
                                        opacity={isBalanceInsufficient ? 0.5 : 1}
                                        transition="opacity 0.2s ease"
                                    >
                                        <Input
                                            placeholder={
                                                isCryptoGame
                                                    ? inputUnit === 'usdc'
                                                        ? '0.00'
                                                        : '0'
                                                    : '0'
                                            }
                                            type="text"
                                            inputMode={
                                                isCryptoGame && inputUnit === 'usdc'
                                                    ? 'decimal'
                                                    : 'numeric'
                                            }
                                            pattern={
                                                isCryptoGame && inputUnit === 'usdc'
                                                    ? '[0-9]*\\.?[0-9]*'
                                                    : '[0-9]*'
                                            }
                                            autoComplete="off"
                                            onChange={(e) =>
                                                handleBuyInChange(e.target.value)
                                            }
                                            data-testid="buy-in-input"
                                            value={buyInInput}
                                            isDisabled={isDepositing}
                                            required
                                            htmlSize={Math.max(
                                                buyInInput.length || 4,
                                                isCryptoGame && inputUnit === 'usdc'
                                                    ? 4
                                                    : 1
                                            )}
                                            variant="unstyled"
                                            textAlign="right"
                                            fontSize="4xl"
                                            fontWeight="bold"
                                            letterSpacing="-0.03em"
                                            color="text.secondary"
                                            lineHeight={1}
                                            height="auto"
                                            width="auto"
                                            minW={0}
                                            flex="0 0 auto"
                                        />
                                        <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                            color="text.muted"
                                            textTransform="uppercase"
                                            letterSpacing="0.06em"
                                        >
                                            {isCryptoGame ? inputUnit : 'chips'}
                                        </Text>
                                    </Flex>
                                    {/* Conversion line: show only the *other* unit */}
                                    {isCryptoGame && formattedChipsEstimate && (
                                        <Text
                                            mt={1.5}
                                            textAlign="right"
                                            fontSize="2xs"
                                            color="text.muted"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="0.06em"
                                        >
                                            ≈{' '}
                                            {inputUnit === 'usdc'
                                                ? `${formattedChipsEstimate} chips`
                                                : `$${formattedUsdcEstimate}`}
                                        </Text>
                                    )}
                                </FormControl>

                                {/* Preset pills */}
                                {bb > 0 && (
                                    <BuyInPresets
                                        bb={bb}
                                        maxBuyIn={maxBuyIn}
                                        walletBalanceChips={walletBalanceChips}
                                        isCrypto={isCryptoGame}
                                        selectedChips={buyIn}
                                        onSelect={applyBuyInChips}
                                        disabled={isDepositing}
                                    />
                                )}
                            </VStack>
                        </ModalBody>

                        <ModalFooter px={{ base: 5, sm: 7 }} pb={6} pt={3}>
                            <VStack w="100%" spacing={3}>
                                <WalletButton width="100%" height="52px" />

                                {needsWalletSignIn && (
                                    <HStack
                                        spacing={2}
                                        alignItems="flex-start"
                                        bg="rgba(54, 163, 123, 0.15)"
                                        borderRadius="md"
                                        px={3}
                                        py={2}
                                        width="100%"
                                    >
                                        <Icon
                                            as={FaInfoCircle}
                                            boxSize={3.5}
                                            mt={0.5}
                                            color="brand.green"
                                        />
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="brand.green"
                                            textAlign="left"
                                        >
                                            {cryptoJoinHint}
                                        </Text>
                                    </HStack>
                                )}
                                {isBalanceInsufficient && (
                                    <HStack
                                        spacing={2}
                                        alignItems="flex-start"
                                        bg="red.50"
                                        borderRadius="md"
                                        px={3}
                                        py={2}
                                        width="100%"
                                    >
                                        <Icon
                                            as={FaInfoCircle}
                                            boxSize={3.5}
                                            mt={0.5}
                                            color="red.700"
                                        />
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="red.700"
                                            textAlign="left"
                                        >
                                            Insufficient USDC balance
                                            {formattedUsdcBalance
                                                ? ` (you have ${formattedUsdcBalance} USDC)`
                                                : ''}
                                            .
                                        </Text>
                                    </HStack>
                                )}
                                {depositStatus === 'error' && depositError && (
                                    <HStack
                                        spacing={2}
                                        alignItems="flex-start"
                                        bg="red.50"
                                        borderRadius="md"
                                        px={3}
                                        py={2}
                                        width="100%"
                                    >
                                        <Icon
                                            as={FaInfoCircle}
                                            boxSize={3.5}
                                            mt={0.5}
                                            color="red.700"
                                        />
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="red.700"
                                            textAlign="left"
                                            wordBreak="break-word"
                                        >
                                            {depositError}
                                        </Text>
                                    </HStack>
                                )}

                                {/* Dual-unit CTA */}
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
                                        borderRadius="bigButton"
                                        bg={
                                            isJoinVisuallyDisabled
                                                ? 'btn.lightGray'
                                                : 'brand.green'
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
                                        boxShadow={
                                            isJoinVisuallyDisabled
                                                ? 'none'
                                                : '0 6px 18px rgba(54, 163, 123, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        }
                                        _disabled={{
                                            bg: 'btn.lightGray',
                                            cursor: 'not-allowed',
                                            opacity: 0.7,
                                            boxShadow: 'none',
                                        }}
                                        _hover={
                                            isJoinVisuallyDisabled
                                                ? {}
                                                : {
                                                      bg: '#2E8A66',
                                                      transform: 'translateY(-2px)',
                                                      boxShadow:
                                                          '0 14px 28px rgba(54, 163, 123, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                                                  }
                                        }
                                        _active={{
                                            bg: isJoinVisuallyDisabled
                                                ? 'btn.lightGray'
                                                : '#287859',
                                            transform: isJoinVisuallyDisabled
                                                ? 'none'
                                                : 'translateY(0) scale(0.99)',
                                            boxShadow: isJoinVisuallyDisabled
                                                ? 'none'
                                                : '0 4px 12px rgba(54, 163, 123, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                                        }}
                                        transition="all 0.2s ease"
                                        onClick={handleJoin}
                                        type="submit"
                                        data-testid="join-table-btn"
                                    >
                                        <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                            letterSpacing="-0.01em"
                                            color={
                                                isJoinVisuallyDisabled
                                                    ? 'text.muted'
                                                    : 'white'
                                            }
                                        >
                                            {isCryptoGame
                                                ? formattedUsdcEstimate
                                                    ? `Sit down · $${formattedUsdcEstimate}`
                                                    : 'Sit down'
                                                : 'Join game'}
                                        </Text>
                                    </Button>
                                </Tooltip>

                                {/* Collapsible fine print */}
                                {isCryptoGame && (
                                    <Box w="100%" pt={1}>
                                        <Box
                                            as="button"
                                            type="button"
                                            onClick={finePrintDisclosure.onToggle}
                                            w="100%"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            gap={1.5}
                                            py={1}
                                            cursor="pointer"
                                            bg="transparent"
                                            border="none"
                                            opacity={0.85}
                                            _hover={{ opacity: 1 }}
                                            transition="opacity 0.15s ease"
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="text.secondary"
                                                fontWeight="bold"
                                            >
                                                How does this work?
                                            </Text>
                                            <Icon
                                                as={FaChevronDown}
                                                boxSize={2.5}
                                                color="text.secondary"
                                                transform={
                                                    finePrintDisclosure.isOpen
                                                        ? 'rotate(180deg)'
                                                        : 'rotate(0deg)'
                                                }
                                                transition="transform 0.2s ease"
                                            />
                                        </Box>
                                        <Collapse
                                            in={finePrintDisclosure.isOpen}
                                            animateOpacity
                                        >
                                            <Text
                                                fontSize="2xs"
                                                color="text.muted"
                                                textAlign="center"
                                                lineHeight="short"
                                                px={2}
                                                pt={2}
                                                opacity={0.75}
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
                                        </Collapse>
                                    </Box>
                                )}
                            </VStack>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default TakeSeatModal;
