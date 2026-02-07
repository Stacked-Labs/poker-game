'use client';

import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import {
    VStack,
    Text,
    Button,
    Flex,
    Input,
    Tooltip,
    Spinner,
    Box,
    Heading,
    Select,
    Icon,
    Divider,
    HStack,
    Image,
    Link,
    Switch,
} from '@chakra-ui/react';
import {
    FaInfoCircle,
    FaUsers,
    FaArrowRight,
    FaCheckCircle,
    FaDiscord,
} from 'react-icons/fa';
import { RiTwitterXLine } from 'react-icons/ri';
import PlayTypeToggle from './PlayTypeToggle';
import NetworkCard from './NetworkCard';
import gameData from '../../create-game/gameOptions.json';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import WalletButton from '@/app/components/WalletButton';
import { useAuth } from '@/app/contexts/AuthContext';
import useToastHelper from '@/app/hooks/useToastHelper';
import { initSession } from '@/app/hooks/server_actions';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import Turnstile from 'react-turnstile';
import { keyframes } from '@emotion/react';

// Animations
const fadeIn = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const GameSettingLeftSide: React.FC = () => {
    const isCryptoEnabled = true; //process.env.NODE_ENV === 'development';
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Free');
    const [selectedGameMode, setSelectedGameMode] =
        useState<string>('Texas Holdem');
    const [selectedNetwork, setSelectedNetwork] =
        useState<string>('Base Sepolia');
    const [isLoading, setIsLoading] = useState(false);
    const address = useActiveAccount()?.address;
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { isAuthenticated, isAuthenticating, requestAuthentication } =
        useAuth();
    const router = useRouter();
    const { dispatch } = useContext(AppContext);
    const toast = useToastHelper();
    const [smallBlind, setSmallBlind] = useState<number>(5);
    const [bigBlind, setBigBlind] = useState<number>(10);
    const [isFormValid, setIsFormValid] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileError, setTurnstileError] = useState(false);
    const isCreatingRef = useRef(false);
    const [isPublicGame, setIsPublicGame] = useState(true);
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
    const isTurnstileConfigured = Boolean(turnstileSiteKey);

    const isCloudflareVerifying =
        isTurnstileConfigured && !turnstileToken && !turnstileError;

    const isCloudflareReady = useMemo(() => {
        if (!isTurnstileConfigured) {
            return true;
        }
        return Boolean(turnstileToken) || turnstileError;
    }, [isTurnstileConfigured, turnstileToken, turnstileError]);

    const { gameModes, networks } = gameData;

    // Get the description for the selected game mode
    const selectedGameModeDescription = useMemo(() => {
        const mode = gameModes.find((m) => m.name === selectedGameMode);
        return mode?.description || '';
    }, [selectedGameMode, gameModes]);

    const usdcLogoUrl = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
    const blindInputWidth = { base: '140px', md: '160px' };
    const chipsPerUsdc = 100;
    const usdcPerChip = 1 / chipsPerUsdc;
    const blindsMinChips = useMemo(() => {
        if (playType === 'Crypto') {
            return { small: 5, big: 10 };
        }
        return { small: 1, big: 1 };
    }, [playType]);

    const formatUsdc = (value: number) => {
        const safeValue = Number.isFinite(value) ? value : 0;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(safeValue);
    };

    const smallBlindUsdc = useMemo(
        () => smallBlind * usdcPerChip,
        [smallBlind, usdcPerChip]
    );
    const bigBlindUsdc = useMemo(
        () => bigBlind * usdcPerChip,
        [bigBlind, usdcPerChip]
    );

    const blindsErrorMessage = useMemo(() => {
        if (!Number.isFinite(smallBlind) || !Number.isFinite(bigBlind)) {
            return 'Blinds must be valid numbers.';
        }
        if (
            smallBlind < blindsMinChips.small ||
            bigBlind < blindsMinChips.big
        ) {
            return playType === 'Crypto'
                ? 'Minimum stakes for crypto games are 5/10 chips.'
                : 'Blinds must be positive values.';
        }
        if (!Number.isInteger(smallBlind) || !Number.isInteger(bigBlind)) {
            return 'Blinds must be whole-chip amounts.';
        }
        if (bigBlind < smallBlind) {
            return 'Big blind must be greater than or equal to small blind.';
        }
        return '';
    }, [
        smallBlind,
        bigBlind,
        blindsMinChips.big,
        blindsMinChips.small,
        playType,
    ]);

    useEffect(() => {
        const validateForm = () => {
            const isSmallBlindValid =
                !isNaN(smallBlind) &&
                smallBlind >= blindsMinChips.small &&
                Number.isInteger(smallBlind);
            const isBigBlindValid =
                !isNaN(bigBlind) &&
                bigBlind >= Math.max(blindsMinChips.big, smallBlind) &&
                Number.isInteger(bigBlind);
            const isGameModeSelected = selectedGameMode !== '';
            const isNetworkSelected =
                playType === 'Free' ||
                (playType === 'Crypto' && selectedNetwork !== '');
            const isWalletConnected =
                playType === 'Free' ||
                (playType === 'Crypto' &&
                    isCryptoEnabled &&
                    !!address &&
                    isAuthenticated);

            setIsFormValid(
                isSmallBlindValid &&
                    isBigBlindValid &&
                    isGameModeSelected &&
                    isNetworkSelected &&
                    isWalletConnected
            );
        };

        validateForm();
    }, [
        smallBlind,
        bigBlind,
        selectedGameMode,
        playType,
        selectedNetwork,
        address,
        isAuthenticated,
        isCryptoEnabled,
        blindsMinChips.big,
        blindsMinChips.small,
    ]);

    useEffect(() => {
        if (playType !== 'Crypto') return;
        setSmallBlind((prev) => (prev < 5 ? 5 : prev));
        setBigBlind((prev) => (prev < 10 ? 10 : prev));
    }, [playType]);

    const handleCreateGame = async () => {
        if (isCreatingRef.current) {
            return;
        }

        if (playType === 'Crypto' && !isCryptoEnabled) {
            toast.info(
                'Coming Soon',
                'Crypto games are coming soon. Follow us on social media for updates.'
            );
            return;
        }

        if (
            !turnstileToken &&
            !turnstileError &&
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
        ) {
            toast.warning(
                'Verification Pending',
                'Please wait for bot verification to complete.'
            );
            return;
        }

        if (!isFormValid) {
            if (
                playType === 'Crypto' &&
                (!isCryptoEnabled || !address || !isAuthenticated)
            ) {
                toast.warning(
                    'Authentication Required',
                    !isCryptoEnabled
                        ? 'Crypto games are coming soon.'
                        : !address
                          ? 'Please sign in with your wallet for crypto play.'
                          : 'Please sign the message in your wallet to continue.'
                );
                return;
            }
            if (!address && playType === 'Free') {
                toast.info(
                    'Creating as Guest',
                    'You are creating a free game without connecting a wallet.'
                );
            }
            if (
                smallBlind < blindsMinChips.small ||
                bigBlind < blindsMinChips.big ||
                bigBlind < smallBlind ||
                !Number.isInteger(smallBlind) ||
                !Number.isInteger(bigBlind)
            ) {
                toast.warning(
                    'Invalid Blinds',
                    playType === 'Crypto'
                        ? 'Minimum stakes are 5/10 chips. Blinds must be whole-chip amounts (big ≥ small).'
                        : 'Please enter valid blinds (big ≥ small).'
                );
                return;
            }
            if (selectedGameMode === '') {
                toast.warning(
                    'Game Mode Not Selected',
                    'Please select a game mode.'
                );
                return;
            }
            if (playType === 'Crypto' && selectedNetwork === '') {
                toast.warning(
                    'Network Not Selected',
                    'Please select a network for crypto play.'
                );
                return;
            }
            if (!isFormValid) {
                toast.error(
                    'Validation Error',
                    'Please check your game settings.'
                );
                return;
            }
        }

        isCreatingRef.current = true;
        setIsLoading(true);

        let didCreate = false;
        try {
            // Ensure HTTP session is initialized so `credentials: include` works as expected
            await initSession();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/create-table`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        smallBlind: smallBlind,
                        bigBlind: bigBlind,
                        isCrypto: playType === 'Crypto',
                        chain: playType === 'Crypto' ? selectedNetwork : '',
                        isPublic: isPublicGame,
                        cfTurnstileToken: turnstileToken || '',
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.tablename) {
                    toast.success(
                        'Game Created',
                        `Successfully created game: ${data.tablename}`
                    );
                    didCreate = true;
                    dispatch({ type: 'setTablename', payload: data.tablename });
                    router.push(`/table/${data.tablename}`);
                } else {
                    toast.error(
                        'Create Error',
                        'Received invalid response from server.'
                    );
                }
            } else {
                const errorData = await response.text();
                toast.error(
                    'Create Failed',
                    `Failed to create game: ${response.statusText} - ${errorData}`
                );
            }
        } catch (error) {
            console.error('Error creating game:', error);
            toast.error(
                'Create Failed',
                `An error occurred: ${error instanceof Error ? error.message : String(error)}`
            );
        } finally {
            setTurnstileToken(null);
            if (!didCreate) {
                isCreatingRef.current = false;
                setIsLoading(false);
            }
        }
    };

    const handleJoinPublicGame = () => {
        router.push('/public-games');
    };

    const handleDisconnectWallet = () => {
        if (wallet) {
            disconnect(wallet);
        }
    };

    return (
        <VStack
            spacing={1}
            alignItems="center"
            width="100%"
            maxWidth="720px"
            pt={{ base: 24, md: 28 }}
            pb={8}
            px={{ base: 4, md: 6 }}
            animation={`${fadeIn} 0.5s ease-out`}
        >
            {/* Header Section */}
            <Flex
                width="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                mb={2}
            >
                <Box>
                    <Heading
                        as="h1"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="extrabold"
                        color="text.primary"
                    >
                        Game Settings
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                        Configure your table parameters
                    </Text>
                </Box>
                <Button
                    variant="outline"
                    size="md"
                    bg="card.white"
                    color="text.primary"
                    borderColor="border.lightGray"
                    borderWidth="2px"
                    borderRadius="full"
                    px={4}
                    py={2}
                    fontWeight="semibold"
                    fontSize="sm"
                    onClick={handleJoinPublicGame}
                    _hover={{
                        borderColor: 'brand.pink',
                        bg: 'card.white',
                    }}
                    leftIcon={<Icon as={FaUsers} color="brand.pink" />}
                    rightIcon={<Icon as={FaArrowRight} boxSize={3} />}
                >
                    Join Public Game
                </Button>
            </Flex>

            {/* Main Settings Card */}
            <Box
                width="100%"
                bg="card.white"
                borderRadius="24px"
                boxShadow="0 4px 24px rgba(0, 0, 0, 0.08)"
                overflow="hidden"
            >
                {/* Play Mode Section */}
                <Flex
                    px={{ base: 5, md: 8 }}
                    py={3}
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                        >
                            Play Mode
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Select currency type
                        </Text>
                    </Box>
                    <PlayTypeToggle
                        playType={playType}
                        setPlayType={setPlayType}
                        isCryptoEnabled={isCryptoEnabled}
                    />
                </Flex>

                <Divider borderColor="gray.100" />

                {/* Public Game Section */}
                <Flex
                    px={{ base: 5, md: 8 }}
                    py={3}
                    justifyContent="space-between"
                    alignItems={{ base: 'flex-start', sm: 'center' }}
                    flexDirection={{ base: 'column', sm: 'row' }}
                    gap={4}
                >
                    <Box>
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                        >
                            Public
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Show this game in the lobby
                        </Text>
                    </Box>
                    <Switch
                        isChecked={isPublicGame}
                        onChange={(e) => setIsPublicGame(e.target.checked)}
                        colorScheme="green"
                        size="lg"
                        alignSelf={{ base: 'flex-end', sm: 'center' }}
                    />
                </Flex>

                <Divider borderColor="gray.100" />

                {/* Game Mode Section */}
                <Flex
                    px={{ base: 5, md: 8 }}
                    py={3}
                    justifyContent="space-between"
                    alignItems={{ base: 'flex-start', sm: 'center' }}
                    flexDirection={{ base: 'column', sm: 'row' }}
                    gap={4}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                    >
                        <Flex alignItems="center" gap={2}>
                            <Text
                                fontWeight="bold"
                                fontSize="md"
                                color="text.primary"
                            >
                                Game Mode
                            </Text>
                            <Tooltip
                                label="Choose the poker variant you want to play"
                                bg="brand.darkNavy"
                                color="white"
                                borderRadius="8px"
                                px={3}
                                py={2}
                            >
                                <Box display="flex" alignItems="center">
                                    <FaInfoCircle color="#EB0B5C" size={14} />
                                </Box>
                            </Tooltip>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                            Choose the poker variant
                        </Text>
                    </Box>
                    <Box
                        width={{ base: '100%', sm: '200px' }}
                        mt={{ base: 3, sm: 0 }}
                    >
                        <Select
                            value={selectedGameMode}
                            onChange={(e) =>
                                setSelectedGameMode(e.target.value)
                            }
                            bg="card.lightGray"
                            borderColor="transparent"
                            borderRadius="12px"
                            fontWeight="semibold"
                            fontSize="sm"
                            color="text.primary"
                            height="44px"
                            _hover={{
                                borderColor: 'brand.green',
                            }}
                            _focus={{
                                borderColor: 'brand.pink',
                                boxShadow: '0 0 0 1px #EB0B5C',
                            }}
                            iconColor="gray.500"
                        >
                            {gameModes.map((mode) => (
                                <option
                                    key={mode.name}
                                    value={mode.name}
                                    disabled={mode.disabled}
                                >
                                    {mode.name}
                                </option>
                            ))}
                        </Select>
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mt={2}
                            textAlign="right"
                        >
                            {selectedGameModeDescription}
                        </Text>
                    </Box>
                </Flex>

                <Divider borderColor="gray.100" />

                {/* Blinds Section */}
                <Flex
                    px={{ base: 5, md: 8 }}
                    py={3}
                    justifyContent="space-between"
                    alignItems={{ base: 'flex-start', sm: 'center' }}
                    flexDirection={{ base: 'column', sm: 'row' }}
                    gap={4}
                >
                    <Box mt={{ base: 3, sm: 0 }}>
                        <Flex alignItems="center" gap={2}>
                            <Text
                                fontWeight="bold"
                                fontSize="md"
                                color="text.primary"
                                zIndex={1}
                            >
                                Blinds
                            </Text>
                            <Tooltip
                                label={
                                    playType === 'Crypto'
                                        ? 'Crypto blinds are in chips. Amounts shown in USDC. Min 5/10 • 1 chip = $0.01 USDC.'
                                        : 'Blinds must be whole-chip amounts.'
                                }
                                bg="brand.darkNavy"
                                color="white"
                                borderRadius="8px"
                                px={3}
                                py={2}
                                zIndex={1}
                            >
                                <Box display="flex" alignItems="center">
                                    <FaInfoCircle color="#EB0B5C" size={14} />
                                </Box>
                            </Tooltip>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                            Set the table stakes
                        </Text>
                    </Box>
                    <Flex
                        width="100%"
                        flexDirection="column"
                        alignItems="flex-end"
                    >
                        <HStack
                            spacing={{ base: 3, md: 4 }}
                            alignItems="flex-start"
                            width="100%"
                            justifyContent="flex-end"
                        >
                            {/* Small Blind */}
                            <Box position="relative" width={blindInputWidth}>
                                <Text
                                    fontSize="11px"
                                    fontWeight="bold"
                                    color="brand.pink"
                                    letterSpacing="wide"
                                    position="absolute"
                                    top="-2"
                                    left="3"
                                    px="1.5"
                                    zIndex={10}
                                    py="0.5"
                                    borderRadius="full"
                                >
                                    SB
                                </Text>
                                <Input
                                    type="number"
                                    step="1"
                                    min={blindsMinChips.small}
                                    value={smallBlind}
                                    onChange={(e) =>
                                        setSmallBlind(Number(e.target.value))
                                    }
                                    bg="input.white"
                                    borderWidth="1px"
                                    borderColor="border.lightGray"
                                    borderRadius="14px"
                                    width={blindInputWidth}
                                    height={{ base: '52px', md: '56px' }}
                                    textAlign="right"
                                    pr={4}
                                    fontWeight="semibold"
                                    fontSize="md"
                                    color="text.primary"
                                    _hover={{
                                        borderColor: 'gray.300',
                                    }}
                                    _focus={{
                                        borderColor: 'brand.pink',
                                        boxShadow:
                                            '0 0 0 2px rgba(235, 11, 92, 0.2)',
                                    }}
                                />
                                {playType === 'Crypto' && (
                                    <Tooltip
                                        label={`${formatUsdc(smallBlindUsdc)} USDC`}
                                        isDisabled={
                                            `${formatUsdc(smallBlindUsdc)} USDC`
                                                .length <= 12
                                        }
                                        hasArrow
                                        placement="top"
                                    >
                                        <Flex
                                            mt={1}
                                            width="full"
                                            maxW={blindInputWidth}
                                            fontSize="xs"
                                            color="text.gray600"
                                            fontWeight="medium"
                                            justifyContent="flex-end"
                                            alignItems="center"
                                            gap={1.5}
                                            pr={1.5}
                                            lineHeight="short"
                                            overflow="hidden"
                                        >
                                            <Image
                                                src={usdcLogoUrl}
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
                                                {formatUsdc(smallBlindUsdc)}{' '}
                                                USDC
                                            </Text>
                                        </Flex>
                                    </Tooltip>
                                )}
                            </Box>
                            <Text
                                color="gray.400"
                                fontSize="xl"
                                fontWeight="light"
                                pt={2}
                            >
                                /
                            </Text>
                            {/* Big Blind */}
                            <Box position="relative" width={blindInputWidth}>
                                <Text
                                    fontSize="11px"
                                    fontWeight="bold"
                                    color="brand.pink"
                                    letterSpacing="wide"
                                    position="absolute"
                                    top="-2"
                                    left="3"
                                    px="1.5"
                                    zIndex={10}
                                    py="0.5"
                                    borderRadius="full"
                                >
                                    BB
                                </Text>
                                <Input
                                    type="number"
                                    step="1"
                                    min={blindsMinChips.big}
                                    value={bigBlind}
                                    onChange={(e) =>
                                        setBigBlind(Number(e.target.value))
                                    }
                                    bg="input.white"
                                    borderWidth="1px"
                                    borderColor="border.lightGray"
                                    borderRadius="14px"
                                    width={blindInputWidth}
                                    height={{ base: '52px', md: '56px' }}
                                    textAlign="right"
                                    pr={4}
                                    fontWeight="semibold"
                                    fontSize="md"
                                    color="text.primary"
                                    _hover={{
                                        borderColor: 'gray.300',
                                    }}
                                    _focus={{
                                        borderColor: 'brand.pink',
                                        boxShadow:
                                            '0 0 0 2px rgba(235, 11, 92, 0.2)',
                                    }}
                                />
                                {playType === 'Crypto' && (
                                    <Tooltip
                                        label={`${formatUsdc(bigBlindUsdc)} USDC`}
                                        isDisabled={
                                            `${formatUsdc(bigBlindUsdc)} USDC`
                                                .length <= 12
                                        }
                                        hasArrow
                                        placement="top"
                                    >
                                        <Flex
                                            mt={1}
                                            width="full"
                                            maxW={blindInputWidth}
                                            fontSize="xs"
                                            color="text.gray600"
                                            fontWeight="medium"
                                            justifyContent="flex-end"
                                            alignItems="center"
                                            gap={1.5}
                                            pr={1.5}
                                            lineHeight="short"
                                            overflow="hidden"
                                        >
                                            <Image
                                                src={usdcLogoUrl}
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
                                                {formatUsdc(bigBlindUsdc)} USDC
                                            </Text>
                                        </Flex>
                                    </Tooltip>
                                )}
                            </Box>
                        </HStack>
                        {blindsErrorMessage && (
                            <Box mt={1} maxW="220px">
                                <Text
                                    fontSize="10px"
                                    color="red.100"
                                    fontWeight="medium"
                                    lineHeight="shorter"
                                >
                                    {blindsErrorMessage}
                                </Text>
                            </Box>
                        )}
                        {playType === 'Crypto' && (
                            <Flex
                                mt={2}
                                width="100%"
                                justifyContent="flex-end"
                                alignItems="center"
                                gap={2}
                                fontSize="xs"
                                fontWeight="medium"
                                color="text.gray600"
                                lineHeight="short"
                                whiteSpace="nowrap"
                                _dark={{
                                    fontWeight: 'semibold',
                                }}
                            >
                                <Text as="span" color="inherit">
                                    1 chip = {formatUsdc(usdcPerChip)} USDC •
                                    Min 5/10
                                </Text>
                            </Flex>
                        )}
                    </Flex>
                </Flex>

                {/* Network Section - Only for Crypto */}
                {playType === 'Crypto' && (
                    <>
                        <Divider borderColor="gray.100" />
                        <Box px={{ base: 5, md: 8 }} py={3}>
                            <Flex alignItems="center" gap={2} mb={1}>
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    color="text.primary"
                                >
                                    Network
                                </Text>
                                <Tooltip
                                    label="Select the blockchain network for your crypto game"
                                    bg="brand.darkNavy"
                                    color="white"
                                    borderRadius="8px"
                                    px={3}
                                    py={2}
                                >
                                    <Box display="flex" alignItems="center">
                                        <FaInfoCircle
                                            color="#EB0B5C"
                                            size={14}
                                        />
                                    </Box>
                                </Tooltip>
                            </Flex>
                            <Text fontSize="sm" color="gray.500" mb={4}>
                                Select blockchain to play on
                            </Text>
                            <Flex
                                gap={3}
                                flexWrap="wrap"
                                justifyContent={{
                                    base: 'center',
                                    sm: 'flex-start',
                                }}
                            >
                                {networks.map((network) => (
                                    <NetworkCard
                                        key={network.name}
                                        name={network.name}
                                        image={network.image}
                                        badge={network.badge}
                                        isSelected={
                                            selectedNetwork === network.name
                                        }
                                        onClick={() =>
                                            setSelectedNetwork(network.name)
                                        }
                                        disabled={network.disabled}
                                    />
                                ))}
                            </Flex>
                        </Box>
                    </>
                )}
            </Box>

            {/* Cloudflare Verification */}
            <Flex alignItems="center" justifyContent="center" py={0}>
                {isCloudflareVerifying ? (
                    <VStack spacing={1} alignItems="center">
                        <Box
                            role="status"
                            aria-live="polite"
                            bg="card.white"
                            borderRadius="full"
                            px={4}
                            py={2}
                            borderWidth="1px"
                            borderColor="border.lightGray"
                            boxShadow="sm"
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >
                            <Spinner size="sm" color="brand.green" />
                            <Text fontSize="sm" color="gray.600">
                                Verifying with Cloudflare…
                            </Text>
                            <Tooltip
                                label="We run a quick bot check in the background. The Create Game button unlocks automatically when it finishes."
                                hasArrow
                                placement="top"
                            >
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    color="gray.500"
                                >
                                    <FaInfoCircle size={14} />
                                </Box>
                            </Tooltip>
                        </Box>

                        <Text
                            fontSize="xs"
                            color="gray.500"
                            textAlign="center"
                            maxW="420px"
                        >
                            This usually takes a few seconds. If you’re blocked
                            by an ad/tracker blocker, verification may not load.
                        </Text>

                        <Turnstile
                            sitekey={turnstileSiteKey}
                            onSuccess={(token: string) => {
                                setTurnstileToken(token);
                                setTurnstileError(false);
                            }}
                            onExpire={() => {
                                setTurnstileToken(null);
                            }}
                            onError={() => {
                                setTurnstileError(true);
                                setTurnstileToken(null);
                            }}
                            theme="light"
                            size="normal"
                            retry="auto"
                            refreshExpired="auto"
                            retryInterval={3000}
                        />
                    </VStack>
                ) : (
                    <Box
                        bg="card.white"
                        borderRadius="full"
                        px={3}
                        py={2}
                        borderWidth="1px"
                        borderColor="rgba(0, 0, 0, 0.06)"
                        boxShadow="none"
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >
                        <Icon
                            as={FaCheckCircle}
                            color={
                                turnstileError ? 'brand.yellow' : 'brand.green'
                            }
                            boxSize={4}
                        />
                        <Text
                            fontSize="sm"
                            color={turnstileError ? 'brand.yellow' : 'gray.500'}
                        >
                            {turnstileError
                                ? 'Verification unavailable — you can still create'
                                : isTurnstileConfigured
                                  ? 'Verified by Cloudflare'
                                  : 'Verified locally'}
                        </Text>
                    </Box>
                )}
            </Flex>

            {/* Create Game CTA */}
            {playType === 'Crypto' && !isCryptoEnabled ? (
                <Box width="100%" maxW="480px">
                    <Flex direction="column" align="center" gap={3} py={2}>
                        <Text
                            fontSize="sm"
                            color="text.gray600"
                            textAlign="center"
                        >
                            Crypto games coming soon — we&apos;re working
                            tirelessly. Follow us for updates.
                        </Text>
                        <HStack spacing={3}>
                            <Button
                                as={Link}
                                href="https://x.com/stacked_poker"
                                isExternal
                                variant="outline"
                                bg="card.white"
                                borderColor="border.lightGray"
                                borderWidth="2px"
                                borderRadius="14px"
                                size="sm"
                                leftIcon={<Icon as={RiTwitterXLine} />}
                            >
                                X
                            </Button>
                            <Button
                                as={Link}
                                href="https://discord.gg/347RBVcvpn"
                                isExternal
                                variant="outline"
                                bg="card.white"
                                borderColor="border.lightGray"
                                borderWidth="2px"
                                borderRadius="14px"
                                size="sm"
                                leftIcon={<Icon as={FaDiscord} />}
                            >
                                Discord
                            </Button>
                        </HStack>
                    </Flex>
                </Box>
            ) : playType === 'Crypto' && (!address || !isAuthenticated) ? (
                <Box width="100%" maxW="480px">
                    <Flex direction="column" align="center" gap={3} py={2}>
                        <Text
                            fontSize="sm"
                            color="text.gray600"
                            textAlign="center"
                        >
                            {!address
                                ? 'Sign in with your wallet to create a crypto game.'
                                : isAuthenticating
                                  ? 'Check your wallet to sign the message…'
                                  : 'Sign the message in your wallet to continue.'}
                        </Text>
                        <Flex width="100%" gap={3}>
                            {!address ? (
                                <WalletButton
                                    width="100%"
                                    height="56px"
                                    label="Sign In"
                                />
                            ) : (
                                <>
                                    <Button
                                        flex="1"
                                        height="56px"
                                        bg="brand.green"
                                        color="white"
                                        fontWeight="bold"
                                        borderRadius="16px"
                                        onClick={requestAuthentication}
                                        isLoading={isAuthenticating}
                                        loadingText="Waiting…"
                                        _hover={{
                                            bg: '#2d9268',
                                            transform: 'translateY(-2px)',
                                            boxShadow:
                                                '0 8px 20px rgba(54, 163, 123, 0.35)',
                                        }}
                                        _active={{
                                            transform: 'translateY(0)',
                                        }}
                                        transition="all 0.2s ease"
                                    >
                                        Finish Sign-In
                                    </Button>
                                    <Button
                                        flex="1"
                                        height="56px"
                                        bg="brand.pink"
                                        color="white"
                                        fontWeight="bold"
                                        borderRadius="16px"
                                        onClick={handleDisconnectWallet}
                                        _hover={{
                                            bg: '#d50a52',
                                            transform: 'translateY(-2px)',
                                            boxShadow:
                                                '0 8px 20px rgba(235, 11, 92, 0.25)',
                                        }}
                                        _active={{
                                            transform: 'translateY(0)',
                                        }}
                                        transition="all 0.2s ease"
                                    >
                                        Disconnect
                                    </Button>
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Box>
            ) : (
                <Tooltip
                    label="Waiting for Cloudflare verification to finish…"
                    isDisabled={!isCloudflareVerifying}
                    hasArrow
                    placement="top"
                >
                    <Box width="100%" maxW="480px">
                        <Button
                            bg="brand.green"
                            color="white"
                            onClick={handleCreateGame}
                            size="lg"
                            height="56px"
                            width="100%"
                            fontSize="md"
                            fontWeight="bold"
                            borderRadius="16px"
                            border="none"
                            isLoading={isLoading}
                            loadingText="Creating..."
                            spinner={<Spinner size="md" color="white" />}
                            opacity={
                                isFormValid && isCloudflareReady && !isLoading
                                    ? 1
                                    : 0.6
                            }
                            cursor={
                                isFormValid && isCloudflareReady && !isLoading
                                    ? 'pointer'
                                    : 'not-allowed'
                            }
                            disabled={
                                !isFormValid || !isCloudflareReady || isLoading
                            }
                            _hover={{
                                bg: '#2d9268',
                                transform: 'translateY(-2px)',
                                boxShadow:
                                    '0 8px 20px rgba(54, 163, 123, 0.35)',
                            }}
                            _active={{
                                transform: 'translateY(0)',
                            }}
                            transition="all 0.2s ease"
                        >
                            Create Game
                        </Button>
                    </Box>
                </Tooltip>
            )}
        </VStack>
    );
};

export default GameSettingLeftSide;
