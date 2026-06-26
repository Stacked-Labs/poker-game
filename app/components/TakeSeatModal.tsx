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
    Spinner,
    useDisclosure,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { keyframes } from '@emotion/react';
import WalletButton from './WalletButton';
import { newPlayer, takeSeat } from '../hooks/server_actions';
import { useCurrentUser } from '@/app/contexts/CurrentUserProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { playerDisplayName } from '@/app/utils/address';
import { track } from '@/app/utils/analytics';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useDepositAndJoin } from '../hooks/useDepositAndJoin';
import { useWithdraw } from '../hooks/useWithdraw';
import { useActiveWallet } from 'thirdweb/react';
import { CHAIN_CONFIG, defaultChain, defaultUsdcAddress } from '../thirdwebclient';
import { FaInfoCircle, FaChevronDown, FaCheck } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useConnectX } from '@/app/hooks/useConnectX';
import BuyInPresets from './TakeSeat/BuyInPresets';
import StakesChip from './TakeSeat/StakesChip';
import { readLastBuyIn, writeLastBuyIn } from '@/app/lib/takeSeat/lastBuyIn';
import {
    readLastUsername,
    writeLastUsername,
    USERNAME_MAX_LENGTH,
} from '@/app/lib/takeSeat/lastUsername';
import TopUpModal from './TopUp/LazyTopUpModal';
import { useIsMiniApp } from '@/app/hooks/useIsMiniApp';
import { isTestnetOnly } from '@/app/thirdwebclient';

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
        xDisplayName,
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

    // Free games let players pick a one-off username. Each time the modal opens,
    // prefill the last name they actually joined with (and drop any unsaved edits
    // from a previous open). Crypto/X games use wallet/X identity instead.
    useEffect(() => {
        if (isOpen) setName(readLastUsername() ?? '');
    }, [isOpen]);

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
        isGasInsufficient,
        refreshBalance,
    } = useDepositAndJoin(contractAddress, tableChain, tableUsdcAddress);

    const {
        withdraw,
        checkCanWithdraw,
        canWithdraw: withdrawCanWithdraw,
        chipBalance: existingChipBalance,
        isGasInsufficient: withdrawGasInsufficient,
        status: withdrawStatus,
        error: withdrawError,
        isLoading: isWithdrawing,
        reset: resetWithdraw,
    } = useWithdraw(contractAddress, tableChain);

    const seatRequested = appStore.appState.seatRequested;
    const hasExistingChips =
        existingChipBalance !== null && existingChipBalance > BigInt(0);

    // Success flash: keeps the withdraw-first body mounted for 2s after a
    // successful withdraw so the user sees the celebration chip before the
    // modal snaps into the normal join-flow body.
    const [withdrawSuccessFlash, setWithdrawSuccessFlash] = useState(false);
    useEffect(() => {
        if (withdrawStatus !== 'success') return;
        setWithdrawSuccessFlash(true);
        const t = setTimeout(() => {
            setWithdrawSuccessFlash(false);
            resetWithdraw();
        }, 2000);
        return () => clearTimeout(t);
    }, [withdrawStatus, resetWithdraw]);

    const showWithdrawFirst =
        isCryptoGame &&
        (hasExistingChips || withdrawSuccessFlash) &&
        seatRequested === null;

    const formattedExistingChips = useMemo(() => {
        if (existingChipBalance === null) return null;
        return Number(existingChipBalance).toLocaleString('en-US');
    }, [existingChipBalance]);

    // USDC equivalent of the existing chip stack (1 USDC = 100 chips).
    // Leads the value display on the withdraw-first body — players think in
    // real money, not chips.
    const formattedExistingUsdc = useMemo(() => {
        if (existingChipBalance === null) return null;
        const usdc = Number(existingChipBalance) / CHIPS_PER_USDC;
        return usdc.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [existingChipBalance]);

    // Settlement-pending countdown: when chips exist but canWithdraw is
    // false, the last hand is still settling on-chain. Auto-poll every 5s
    // and surface a live countdown. Mirrors NavBar WithdrawButton.tsx.
    const WITHDRAW_POLL_INTERVAL = 5; // seconds
    const isWithdrawSettlementPending =
        showWithdrawFirst &&
        hasExistingChips &&
        withdrawCanWithdraw === false &&
        !isWithdrawing;
    const [withdrawCountdown, setWithdrawCountdown] =
        useState(WITHDRAW_POLL_INTERVAL);
    useEffect(() => {
        if (!isWithdrawSettlementPending) return;
        setWithdrawCountdown(WITHDRAW_POLL_INTERVAL);
        const id = setInterval(() => {
            setWithdrawCountdown((prev) => {
                if (prev <= 1) {
                    checkCanWithdraw();
                    return WITHDRAW_POLL_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isWithdrawSettlementPending, checkCanWithdraw]);


    const effectiveName =
        !isCryptoGame && xUsername
            ? playerDisplayName(`@${xUsername}`, null, xDisplayName)
            : name;
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

    // Deficit math — how much USDC the user still needs to sit at this buy-in.
    const deficitUsdc = useMemo(() => {
        if (!isBalanceInsufficient || usdcBalance === null || buyInUsdc === null) {
            return null;
        }
        return Math.max(0, buyInUsdc - Number(usdcBalance) / 1_000_000);
    }, [isBalanceInsufficient, usdcBalance, buyInUsdc]);

    const formattedDeficitUsdc = useMemo(() => {
        if (deficitUsdc === null) return null;
        return deficitUsdc.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [deficitUsdc]);

    // Bridge widget can only run on mainnet outside a Mini App host. When
    // unavailable, we still surface the deficit hint but the CTA stays in
    // "Sit down" mode (existing behavior — user tops up externally).
    const isMiniApp = useIsMiniApp();
    const canBridgeTopUp = !isTestnetOnly && !isMiniApp;
    const isTopUpMode = Boolean(
        isCryptoGame && isBalanceInsufficient && canBridgeTopUp
    );
    // Gas top-up mode: USDC is fine but the external EOA has no ETH on Base.
    // Suppressed when isBalanceInsufficient is true — USDC has to be topped
    // up first, otherwise the deposit can't succeed even with gas in hand.
    const isGasTopUpMode = Boolean(
        isCryptoGame &&
            !isBalanceInsufficient &&
            isGasInsufficient &&
            canBridgeTopUp
    );

    // Gas-shortage mode for the withdraw CTA. Mirrors the deposit gas
    // pattern but only applies when withdrawal is currently possible —
    // settlement-pending takes precedence (the chips can't move yet
    // regardless of how much gas the wallet has).
    const isWithdrawGasMode = Boolean(
        showWithdrawFirst &&
            hasExistingChips &&
            withdrawCanWithdraw !== false &&
            withdrawGasInsufficient &&
            canBridgeTopUp
    );

    const topUpUsdc = useDisclosure();
    const topUpGas = useDisclosure();

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

        track('seat_requested', {
            seat_id: seatId,
            buy_in: buyInValue,
            mode: isCryptoGame ? 'real' : 'free',
        });

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
        if (!xUsername) writeLastUsername(effectiveName);
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
                                    Stack still on the table
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
                                {/* USDC-leading value block. Real money first;
                                    chips secondary. */}
                                <VStack
                                    spacing={1}
                                    w="100%"
                                    py={4}
                                    textAlign="center"
                                >
                                    {formattedExistingUsdc === null ? (
                                        <HStack spacing={2}>
                                            <Spinner
                                                size="sm"
                                                color="text.muted"
                                                thickness="2px"
                                            />
                                            <Text
                                                fontSize="sm"
                                                color="text.muted"
                                                fontWeight="medium"
                                            >
                                                Checking your stack…
                                            </Text>
                                        </HStack>
                                    ) : (
                                        <>
                                            <HStack
                                                spacing={1.5}
                                                align="baseline"
                                                justify="center"
                                            >
                                                <Text
                                                    fontSize="4xl"
                                                    fontWeight="bold"
                                                    color="text.secondary"
                                                    letterSpacing="-0.02em"
                                                    lineHeight={1}
                                                >
                                                    ${formattedExistingUsdc}
                                                </Text>
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                    fontWeight={700}
                                                    textTransform="uppercase"
                                                    letterSpacing="0.06em"
                                                >
                                                    USDC
                                                </Text>
                                            </HStack>
                                            <Text
                                                fontSize="sm"
                                                color="text.muted"
                                                fontWeight="medium"
                                            >
                                                {formattedExistingChips} chips
                                            </Text>
                                            <Text
                                                fontSize="2xs"
                                                color="text.muted"
                                                fontWeight="medium"
                                                opacity={0.75}
                                            >
                                                in this table&rsquo;s contract
                                            </Text>
                                        </>
                                    )}
                                </VStack>
                                <Text
                                    fontSize="sm"
                                    color="text.secondary"
                                    textAlign="center"
                                    lineHeight="short"
                                    px={2}
                                >
                                    Cash these out first, then sit down with a
                                    fresh stack.
                                </Text>
                            </VStack>
                        </ModalBody>
                        <ModalFooter px={{ base: 5, sm: 7 }} pb={7} pt={4}>
                            <VStack w="100%" spacing={3}>
                                <WalletButton
                                    width="100%"
                                    height="52px"
                                    chain={isCryptoGame ? tableChain : undefined}
                                />

                                {/* One warning chip at a time — priority:
                                    settlement-pending > gas > error. The
                                    success state replaces the CTA below
                                    rather than rendering a chip up here. */}
                                {!withdrawSuccessFlash &&
                                    isWithdrawSettlementPending && (
                                        <HStack
                                            spacing={2}
                                            alignItems="flex-start"
                                            width="100%"
                                            bg="rgba(253, 197, 29, 0.12)"
                                            _dark={{
                                                bg: 'rgba(253, 197, 29, 0.10)',
                                            }}
                                            borderRadius="md"
                                            px={3}
                                            py={2}
                                        >
                                            <Icon
                                                as={FaInfoCircle}
                                                boxSize={3.5}
                                                mt={0.5}
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                            />
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                                textAlign="left"
                                                lineHeight="short"
                                            >
                                                Last hand still settling.
                                                Withdraw unlocks in{' '}
                                                {withdrawCountdown}s.
                                            </Text>
                                        </HStack>
                                    )}
                                {!withdrawSuccessFlash &&
                                    !isWithdrawSettlementPending &&
                                    isWithdrawGasMode && (
                                        <HStack
                                            spacing={2}
                                            alignItems="flex-start"
                                            width="100%"
                                            bg="rgba(253, 197, 29, 0.12)"
                                            _dark={{
                                                bg: 'rgba(253, 197, 29, 0.10)',
                                            }}
                                            borderRadius="md"
                                            px={3}
                                            py={2}
                                        >
                                            <Icon
                                                as={FaInfoCircle}
                                                boxSize={3.5}
                                                mt={0.5}
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                            />
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                                textAlign="left"
                                                lineHeight="short"
                                            >
                                                Your wallet has no ETH on Base
                                                for gas. Swap a tiny bit of
                                                USDC for ETH below, $0.25 is
                                                more than enough.
                                            </Text>
                                        </HStack>
                                    )}
                                {!withdrawSuccessFlash &&
                                    !isWithdrawSettlementPending &&
                                    !isWithdrawGasMode &&
                                    withdrawStatus === 'error' &&
                                    withdrawError && (
                                        <HStack
                                            spacing={2}
                                            alignItems="flex-start"
                                            bg="red.50"
                                            _dark={{
                                                bg: 'rgba(254, 178, 178, 0.12)',
                                            }}
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
                                                _dark={{ color: 'red.300' }}
                                            />
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="red.700"
                                                _dark={{ color: 'red.300' }}
                                                textAlign="left"
                                                wordBreak="break-word"
                                            >
                                                {withdrawError}
                                            </Text>
                                        </HStack>
                                    )}

                                {/* State-aware CTA. Five visual variants:
                                    success-flash, settlement-pending,
                                    gas-mode, withdrawing, and idle. */}
                                {withdrawSuccessFlash ? (
                                    <HStack
                                        w="100%"
                                        h="56px"
                                        bg="brand.green"
                                        borderRadius="bigButton"
                                        justify="center"
                                        spacing={2}
                                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 3px 0 #1F7A56"
                                    >
                                        <Icon as={FaCheck} color="white" boxSize={4} />
                                        <Text
                                            fontSize="md"
                                            fontWeight={800}
                                            color="white"
                                            letterSpacing="-0.01em"
                                        >
                                            ${formattedExistingUsdc} sent to
                                            your wallet
                                        </Text>
                                    </HStack>
                                ) : isWithdrawSettlementPending ? (
                                    // Not `isDisabled` — the theme's
                                    // _disabled filter (saturate 0.45 +
                                    // brightness 0.92) would dim the yellow
                                    // text and spinner into mud. The outline
                                    // + transparent bg + bare onClick=undefined
                                    // carries the "waiting" affordance with
                                    // no interaction surface. Mirrors
                                    // NavBar/WithdrawButton's pending state.
                                    <Button
                                        w="100%"
                                        h="56px"
                                        borderRadius="bigButton"
                                        bg="transparent"
                                        border="2px solid"
                                        borderColor="brand.yellow"
                                        cursor="default"
                                        _hover={{ bg: 'transparent' }}
                                        _active={{ bg: 'transparent' }}
                                    >
                                        <HStack spacing={2}>
                                            <Spinner
                                                size="xs"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                                thickness="2px"
                                            />
                                            <Text
                                                fontSize="md"
                                                fontWeight={700}
                                                letterSpacing="-0.01em"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                            >
                                                Checking in {withdrawCountdown}s…
                                            </Text>
                                        </HStack>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="tactilePrimary"
                                        w="100%"
                                        h="56px"
                                        borderRadius="bigButton"
                                        {...(isWithdrawGasMode
                                            ? {
                                                  bg: '#0052FF',
                                                  _hover: { bg: '#0052FF' },
                                                  _active: { bg: '#0040CC' },
                                              }
                                            : {})}
                                        isLoading={isWithdrawing}
                                        loadingText="Cashing out…"
                                        spinner={
                                            <Spinner size="sm" color="white" />
                                        }
                                        onClick={
                                            isWithdrawGasMode
                                                ? topUpGas.onOpen
                                                : handleWithdraw
                                        }
                                        color="white"
                                        _hover={{ color: 'white' }}
                                        _active={{ color: 'white' }}
                                        _focus={{ color: 'white' }}
                                        _loading={{ color: 'white' }}
                                    >
                                        {isWithdrawGasMode && (
                                            <Box
                                                position="relative"
                                                boxSize="26px"
                                                mr={2}
                                                flexShrink={0}
                                            >
                                                <Box
                                                    boxSize="26px"
                                                    borderRadius="full"
                                                    bg="white"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    boxShadow="0 0 0 1px rgba(0,0,0,0.06)"
                                                >
                                                    <Image
                                                        src="/networkLogos/eth-logo.png"
                                                        alt="ETH"
                                                        boxSize="20px"
                                                        objectFit="contain"
                                                    />
                                                </Box>
                                                <Image
                                                    src="/networkLogos/base-logo.png"
                                                    alt="on Base"
                                                    position="absolute"
                                                    bottom="-2px"
                                                    right="-2px"
                                                    boxSize="13px"
                                                    borderRadius="full"
                                                    border="1.5px solid white"
                                                />
                                            </Box>
                                        )}
                                        <Text
                                            as="span"
                                            fontSize="md"
                                            fontWeight={800}
                                            color="white"
                                            letterSpacing="-0.01em"
                                        >
                                            {isWithdrawGasMode
                                                ? 'Swap $0.25 → ETH'
                                                : formattedExistingUsdc
                                                  ? `Cash out · $${formattedExistingUsdc}`
                                                  : 'Cash out'}
                                        </Text>
                                    </Button>
                                )}
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
                                                        value={name}
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
                                    {/* Conversion line: show only the *other* unit.
                                        Always rendered (visibility-hidden when empty)
                                        so the modal height doesn't jump on input. */}
                                    {isCryptoGame && (
                                        <Text
                                            mt={1.5}
                                            textAlign="right"
                                            fontSize="2xs"
                                            color="text.muted"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="0.06em"
                                            visibility={
                                                formattedChipsEstimate
                                                    ? 'visible'
                                                    : 'hidden'
                                            }
                                            aria-hidden={!formattedChipsEstimate}
                                        >
                                            ≈{' '}
                                            {inputUnit === 'usdc'
                                                ? `${formattedChipsEstimate ?? '0'} chips`
                                                : `$${formattedUsdcEstimate ?? '0.00'}`}
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
                                <WalletButton width="100%" height="52px" chain={isCryptoGame ? tableChain : undefined} />

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
                                {isBalanceInsufficient &&
                                    formattedDeficitUsdc &&
                                    formattedUsdcBalance && (
                                        <HStack
                                            spacing={2}
                                            alignItems="flex-start"
                                            width="100%"
                                            bg="rgba(253, 197, 29, 0.12)"
                                            _dark={{
                                                bg: 'rgba(253, 197, 29, 0.10)',
                                            }}
                                            borderRadius="md"
                                            px={3}
                                            py={2}
                                        >
                                            <Icon
                                                as={FaInfoCircle}
                                                boxSize={3.5}
                                                mt={0.5}
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                            />
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                                textAlign="left"
                                                lineHeight="short"
                                            >
                                                You have {formattedUsdcBalance}{' '}
                                                USDC.{' '}
                                                {canBridgeTopUp
                                                    ? `Top up ${formattedDeficitUsdc} to sit at this buy-in.`
                                                    : `Add ${formattedDeficitUsdc} USDC from your wallet to sit at this buy-in.`}
                                            </Text>
                                        </HStack>
                                    )}
                                {/* Gas warning — only when USDC is fine but
                                    the wallet has no ETH on Base. Suppressed
                                    while the USDC deficit chip is on screen
                                    (USDC top-up has to happen first anyway). */}
                                {!isBalanceInsufficient &&
                                    isGasInsufficient &&
                                    isCryptoGame && (
                                        <HStack
                                            spacing={2}
                                            alignItems="flex-start"
                                            width="100%"
                                            bg="rgba(253, 197, 29, 0.12)"
                                            _dark={{
                                                bg: 'rgba(253, 197, 29, 0.10)',
                                            }}
                                            borderRadius="md"
                                            px={3}
                                            py={2}
                                        >
                                            <Icon
                                                as={FaInfoCircle}
                                                boxSize={3.5}
                                                mt={0.5}
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                            />
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="brand.yellowDark"
                                                _dark={{ color: 'brand.yellow' }}
                                                textAlign="left"
                                                lineHeight="short"
                                            >
                                                {canBridgeTopUp
                                                    ? 'Your wallet has no ETH on Base for gas. Swap a tiny bit of USDC for ETH below — $0.25 is more than enough.'
                                                    : 'Your wallet needs a small amount of ETH on Base to pay gas. Buy ETH inside your wallet or send a few cents to this address, then try again.'}
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
                                        variant="tactilePrimary"
                                        w="100%"
                                        h="56px"
                                        borderRadius="bigButton"
                                        // Base-blue override in gas-top-up
                                        // mode. Keeps the tactilePrimary
                                        // recipe shape (press, radius, white
                                        // text); swaps only the colors so
                                        // the user reads "different action"
                                        // at a glance.
                                        {...(isGasTopUpMode
                                            ? {
                                                  bg: '#0052FF',
                                                  _hover: { bg: '#0052FF' },
                                                  _active: { bg: '#0040CC' },
                                              }
                                            : {})}
                                        cursor={
                                            isDepositing
                                                ? 'wait'
                                                : isTopUpMode || isGasTopUpMode
                                                  ? 'pointer'
                                                  : isJoinVisuallyDisabled
                                                    ? 'not-allowed'
                                                    : 'pointer'
                                        }
                                        aria-disabled={
                                            isTopUpMode || isGasTopUpMode
                                                ? undefined
                                                : isJoinVisuallyDisabled || undefined
                                        }
                                        isDisabled={
                                            isTopUpMode || isGasTopUpMode
                                                ? false
                                                : isJoinDisabled
                                        }
                                        isLoading={isDepositing}
                                        loadingText={
                                            getDepositStatusMessage() ||
                                            'Processing...'
                                        }
                                        spinner={
                                            <Spinner size="sm" color="white" />
                                        }
                                        onClick={
                                            isTopUpMode
                                                ? topUpUsdc.onOpen
                                                : isGasTopUpMode
                                                  ? topUpGas.onOpen
                                                  : handleJoin
                                        }
                                        type={
                                            isTopUpMode || isGasTopUpMode
                                                ? 'button'
                                                : 'submit'
                                        }
                                        data-testid="join-table-btn"
                                    >
                                        {isGasTopUpMode && (
                                            <Box
                                                position="relative"
                                                boxSize="26px"
                                                mr={2}
                                                flexShrink={0}
                                            >
                                                <Box
                                                    boxSize="26px"
                                                    borderRadius="full"
                                                    bg="white"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    boxShadow="0 0 0 1px rgba(0,0,0,0.06)"
                                                >
                                                    <Image
                                                        src="/networkLogos/eth-logo.png"
                                                        alt="ETH"
                                                        boxSize="20px"
                                                        objectFit="contain"
                                                    />
                                                </Box>
                                                <Image
                                                    src="/networkLogos/base-logo.png"
                                                    alt="on Base"
                                                    position="absolute"
                                                    bottom="-2px"
                                                    right="-2px"
                                                    boxSize="13px"
                                                    borderRadius="full"
                                                    border="1.5px solid white"
                                                />
                                            </Box>
                                        )}
                                        <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                            letterSpacing="-0.01em"
                                            color="white"
                                        >
                                            {!isCryptoGame
                                                ? 'Join game'
                                                : isTopUpMode &&
                                                    formattedDeficitUsdc
                                                  ? `Top up ${formattedDeficitUsdc} USDC`
                                                  : isGasTopUpMode
                                                    ? 'Swap $0.25 → ETH'
                                                    : formattedUsdcEstimate
                                                      ? `Sit down · $${formattedUsdcEstimate}`
                                                      : 'Sit down'}
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
            <TopUpModal
                isOpen={topUpUsdc.isOpen}
                onClose={topUpUsdc.onClose}
                mode="usdc"
                amountUsdc={formattedDeficitUsdc ?? undefined}
                onSuccess={() => {
                    // Settlement on Base takes ~30s; balance check on close is
                    // optimistic. TakeSeatModal stays open so the user sees the
                    // CTA flip from "Top up X" back to "Sit down".
                    refreshBalance();
                    topUpUsdc.onClose();
                }}
            />
            <TopUpModal
                isOpen={topUpGas.isOpen}
                onClose={topUpGas.onClose}
                mode="gas"
                onSuccess={() => {
                    // Refresh both pre-flights — the gas chip is used by
                    // both the deposit CTA and the withdraw-first CTA, and
                    // each hook reads native balance independently.
                    refreshBalance();
                    checkCanWithdraw();
                    topUpGas.onClose();
                }}
            />
        </Modal>
    );
};

export default TakeSeatModal;
