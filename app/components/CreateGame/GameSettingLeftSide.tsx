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
    FaExternalLinkAlt,
} from 'react-icons/fa';
import { FiGift } from 'react-icons/fi';
import PlayTypeToggle from './PlayTypeToggle';
import NetworkCard from './NetworkCard';
import gameData from '../../create-game/gameOptions.json';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import WalletButton from '@/app/components/WalletButton';
import { SocialIconButton } from '@/app/components/SocialIconButton';
import { useAuth } from '@/app/contexts/AuthContext';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useRotatingMessages } from '@/app/hooks/useRotatingMessages';
import { initSession } from '@/app/hooks/server_actions';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import { CHAIN_CONFIG } from '@/app/thirdwebclient';
import Turnstile from 'react-turnstile';
import { keyframes } from '@emotion/react';

const CREATE_GAME_MESSAGES = [
    'Deploying…',
    'Verifying…',
    'Decentralizing…',
] as const;

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

interface StakePreset {
    name: string;
    sb: number;
    bb: number;
}

const STAKE_PRESETS: StakePreset[] = [
    { name: 'Micro', sb: 5, bb: 10 },
    { name: 'Casual', sb: 25, bb: 50 },
    { name: 'Serious', sb: 100, bb: 200 },
];

const BLINDS_STORAGE_KEY = 'stacked:create-game:blinds';

function readStoredBlinds(): { sb: number; bb: number } | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(BLINDS_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            Number.isInteger(parsed?.sb) &&
            Number.isInteger(parsed?.bb) &&
            parsed.sb > 0 &&
            parsed.bb > 0
        ) {
            return { sb: parsed.sb, bb: parsed.bb };
        }
        return null;
    } catch {
        return null;
    }
}

function InfoDot({ label }: { label: string }) {
    return (
        <Tooltip
            label={label}
            bg="brand.darkNavy"
            color="white"
            borderRadius="8px"
            px={3}
            py={2}
            hasArrow
        >
            <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                color="gray.400"
                cursor="help"
            >
                <FaInfoCircle size={14} />
            </Box>
        </Tooltip>
    );
}

// why is this called left side... no idea
const GameSettingLeftSide: React.FC = () => {
    const isCryptoEnabled = true; //process.env.NODE_ENV === 'development';
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Free');
    const [selectedGameMode, setSelectedGameMode] =
        useState<string>('Texas Holdem');
    // Enabled chains come from env var (e.g. "base-sepolia,base"); fall back to sepolia.
    const enabledChainIds = useMemo(() => {
        const raw = process.env.NEXT_PUBLIC_ENABLED_CHAINS ?? 'base-sepolia';
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }, []);

    const enabledNetworks = useMemo(
        () => gameData.networks.filter((n) => enabledChainIds.includes(n.chainId)),
        [enabledChainIds]
    );

    const [selectedNetwork, setSelectedNetwork] =
        useState<string>(enabledChainIds[0] ?? 'base-sepolia');
    const [isLoading, setIsLoading] = useState(false);
    const rotatingCreateLabel = useRotatingMessages(
        CREATE_GAME_MESSAGES,
        1600,
        isLoading
    );
    const address = useActiveAccount()?.address;
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { isAuthenticated, isAuthenticating, requestAuthentication } =
        useAuth();
    const router = useRouter();
    const { dispatch } = useContext(AppContext);
    const toast = useToastHelper();
    // Blinds are stored as display strings so the field renders without
    // leading-zero artifacts ("05" vs "5") when the user pastes or retypes.
    const [smallBlindStr, setSmallBlindStr] = useState<string>('5');
    const [bigBlindStr, setBigBlindStr] = useState<string>('10');
    const smallBlind = smallBlindStr === '' ? NaN : Number(smallBlindStr);
    const bigBlind = bigBlindStr === '' ? NaN : Number(bigBlindStr);
    const setSmallBlind = (n: number) =>
        setSmallBlindStr(Number.isFinite(n) ? String(n) : '');
    const setBigBlind = (n: number) =>
        setBigBlindStr(Number.isFinite(n) ? String(n) : '');
    const [isFormValid, setIsFormValid] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileError, setTurnstileError] = useState(false);
    const isCreatingRef = useRef(false);
    const blindsHydratedRef = useRef(false);
    const [isPublicGame, setIsPublicGame] = useState(true);
    const isE2E = process.env.NEXT_PUBLIC_E2E === 'true';
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
    const isTurnstileConfigured = !isE2E && Boolean(turnstileSiteKey);

    const isCloudflareVerifying =
        isTurnstileConfigured && !turnstileToken && !turnstileError;

    const isCloudflareReady = useMemo(() => {
        if (!isTurnstileConfigured) {
            return true;
        }
        return Boolean(turnstileToken) || turnstileError;
    }, [isTurnstileConfigured, turnstileToken, turnstileError]);

    const { gameModes } = gameData;

    // Get the description for the selected game mode
    const selectedGameModeDescription = useMemo(() => {
        const mode = gameModes.find((m) => m.name === selectedGameMode);
        return mode?.description || '';
    }, [selectedGameMode, gameModes]);

    const usdcLogoUrl = '/usdc-logo.png';
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
            return 'Whole chips only — no decimals.';
        }
        if (bigBlind < smallBlind) {
            return 'Big blind must be at least the small blind.';
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
        if (!Number.isFinite(smallBlind) || smallBlind < 5) setSmallBlindStr('5');
        if (!Number.isFinite(bigBlind) || bigBlind < 10) setBigBlindStr('10');
    }, [playType, smallBlind, bigBlind]);

    // Hydrate blinds from localStorage on mount.
    useEffect(() => {
        const stored = readStoredBlinds();
        if (stored) {
            setSmallBlind(stored.sb);
            setBigBlind(stored.bb);
        }
        blindsHydratedRef.current = true;
    }, []);

    // Persist blinds to localStorage after hydration completes.
    useEffect(() => {
        if (!blindsHydratedRef.current) return;
        if (!Number.isInteger(smallBlind) || !Number.isInteger(bigBlind)) return;
        try {
            window.localStorage.setItem(
                BLINDS_STORAGE_KEY,
                JSON.stringify({ sb: smallBlind, bb: bigBlind })
            );
        } catch {
            // localStorage unavailable (private mode, quota); ignore.
        }
    }, [smallBlind, bigBlind]);

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
            !isE2E &&
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
                        ? 'Minimum stakes are 5/10 chips. Whole chips only, big ≥ small.'
                        : 'Whole chips only, big blind ≥ small blind.'
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
                        cfTurnstileToken:
                            turnstileToken ||
                            (isE2E ? 'E2E_DUMMY_TOKEN' : ''),
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
                if (response.status === 403) {
                    toast.error(
                        'Security Check Failed',
                        'Please wait a moment and try again.'
                    );
                } else {
                    const errorData = await response.text();
                    toast.error(
                        'Create Failed',
                        `Failed to create game: ${response.statusText} - ${errorData}`
                    );
                }
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
                alignItems="center"
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
                    variant="tactilePrimary"
                    size={{ base: 'sm', md: 'md' }}
                    borderRadius={{ base: '10px', md: '12px' }}
                    px={{ base: 4, md: 6 }}
                    height={{ base: '36px', md: '44px' }}
                    fontWeight={{ base: 'semibold', md: 'bold' }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    onClick={handleJoinPublicGame}
                    leftIcon={<Icon as={FaUsers} boxSize={{ base: 3.5, md: 4 }} />}
                    rightIcon={<Icon as={FaArrowRight} boxSize={{ base: 2.5, md: 3 }} />}
                    flexShrink={0}
                >
                    Join Game
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
                    alignItems="center"
                >
                    <Text
                        fontWeight="bold"
                        fontSize="md"
                        color="text.primary"
                    >
                        Play Mode
                    </Text>
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
                    alignItems="center"
                >
                    <HStack spacing={2} align="center">
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                        >
                            List publicly
                        </Text>
                        <InfoDot label="Public games appear in the lobby. Off keeps it invite-only." />
                    </HStack>
                    <Switch
                        isChecked={isPublicGame}
                        onChange={(e) => setIsPublicGame(e.target.checked)}
                        colorScheme="green"
                        size="lg"
                        flexShrink={0}
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
                    <HStack spacing={2} align="center">
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                        >
                            Variant
                        </Text>
                        <InfoDot label="Choose the poker variant you want to play." />
                    </HStack>
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
                    <HStack spacing={2} align="center" mt={{ base: 3, sm: 0 }}>
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                        >
                            Blinds
                        </Text>
                        <InfoDot
                            label={
                                playType === 'Crypto'
                                    ? 'Crypto blinds are in chips. Amounts shown in USDC. Min 5/10 • 1 chip = $0.01 USDC.'
                                    : 'Blinds must be whole-chip amounts.'
                            }
                        />
                    </HStack>
                    <Flex
                        width="100%"
                        flexDirection="column"
                        alignItems="flex-end"
                    >
                        {/* Stake presets — Crypto only; Free Play uses raw chip values */}
                        {playType === 'Crypto' && (
                        <HStack
                            spacing={2}
                            mb={2}
                            justifyContent="flex-end"
                            flexWrap="wrap"
                        >
                            {STAKE_PRESETS.map((preset) => {
                                const isActive =
                                    smallBlind === preset.sb &&
                                    bigBlind === preset.bb;
                                return (
                                    <Button
                                        key={preset.name}
                                        onClick={() => {
                                            setSmallBlind(preset.sb);
                                            setBigBlind(preset.bb);
                                        }}
                                        variant="unstyled"
                                        height="32px"
                                        px={4}
                                        borderRadius="full"
                                        bg={
                                            isActive
                                                ? 'brand.green'
                                                : 'transparent'
                                        }
                                        border="1.5px solid"
                                        borderColor={
                                            isActive
                                                ? 'brand.green'
                                                : 'border.greenStrong'
                                        }
                                        boxShadow={
                                            isActive
                                                ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #22674E'
                                                : '0 1.5px 0 #22674E'
                                        }
                                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, border-color 80ms ease"
                                        _hover={
                                            isActive
                                                ? { bg: 'brand.green' }
                                                : {
                                                      bg: 'rgba(54, 163, 123, 0.10)',
                                                      borderColor:
                                                          'brand.greenDark',
                                                  }
                                        }
                                        _active={
                                            isActive
                                                ? {
                                                      bg: 'brand.greenDark',
                                                      transform:
                                                          'translateY(1.5px)',
                                                      boxShadow:
                                                          'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                                                  }
                                                : {
                                                      bg: 'rgba(54, 163, 123, 0.16)',
                                                      borderColor:
                                                          'brand.greenDark',
                                                      transform:
                                                          'translateY(1.5px)',
                                                      boxShadow: '0 0 0 #22674E',
                                                  }
                                        }
                                    >
                                        <HStack spacing={1.5} align="baseline">
                                            <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                lineHeight={1}
                                                color={
                                                    isActive
                                                        ? 'white'
                                                        : 'brand.green'
                                                }
                                            >
                                                {preset.name}
                                            </Text>
                                            <Text
                                                fontSize="11px"
                                                fontWeight="medium"
                                                lineHeight={1}
                                                color={
                                                    isActive
                                                        ? 'whiteAlpha.800'
                                                        : 'brand.green'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {preset.sb}/{preset.bb}
                                            </Text>
                                        </HStack>
                                    </Button>
                                );
                            })}
                        </HStack>
                        )}
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
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={smallBlindStr}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (/[.,]/.test(raw)) {
                                            toast.warning(
                                                'Whole chips only',
                                                "Blinds can't be split into decimals.",
                                                3000,
                                                'blinds-no-decimal'
                                            );
                                        }
                                        const digits = raw.replace(/\D/g, '');
                                        setSmallBlindStr(
                                            digits === '' ? '' : String(Number(digits))
                                        );
                                    }}
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
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={bigBlindStr}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (/[.,]/.test(raw)) {
                                            toast.warning(
                                                'Whole chips only',
                                                "Blinds can't be split into decimals.",
                                                3000,
                                                'blinds-no-decimal'
                                            );
                                        }
                                        const digits = raw.replace(/\D/g, '');
                                        setBigBlindStr(
                                            digits === '' ? '' : String(Number(digits))
                                        );
                                    }}
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
                            <Flex mt={2} align="center" gap={1.5}>
                                <Icon
                                    as={FaInfoCircle}
                                    color="brand.pink"
                                    boxSize={3.5}
                                />
                                <Text
                                    fontSize="sm"
                                    color="brand.pink"
                                    fontWeight="medium"
                                    lineHeight="short"
                                >
                                    {blindsErrorMessage}
                                </Text>
                            </Flex>
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
                            <Flex
                                alignItems="center"
                                justifyContent="space-between"
                                mb={4}
                            >
                                <HStack spacing={2} align="center">
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        color="text.primary"
                                    >
                                        Network
                                    </Text>
                                    <InfoDot label="Select the blockchain network for your crypto game." />
                                </HStack>
                                {selectedNetwork === 'base-sepolia' && (
                                    <Link
                                        href="/free-tokens"
                                        isExternal
                                        _hover={{
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Flex
                                            align="center"
                                            gap={2}
                                            bg="rgba(54, 163, 123, 0.08)"
                                            _dark={{
                                                bg: 'rgba(54, 163, 123, 0.12)',
                                                borderColor:
                                                    'rgba(54, 163, 123, 0.25)',
                                            }}
                                            borderRadius="full"
                                            pl={2}
                                            pr={3}
                                            py={1.5}
                                            borderWidth="1px"
                                            borderColor="rgba(54, 163, 123, 0.15)"
                                            cursor="pointer"
                                            transition="all 0.2s ease"
                                            _hover={{
                                                bg: 'rgba(54, 163, 123, 0.14)',
                                                borderColor:
                                                    'rgba(54, 163, 123, 0.3)',
                                                _dark: {
                                                    bg: 'rgba(54, 163, 123, 0.18)',
                                                    borderColor:
                                                        'rgba(54, 163, 123, 0.35)',
                                                },
                                            }}
                                        >
                                            <Flex
                                                align="center"
                                                justify="center"
                                                bg="brand.green"
                                                borderRadius="full"
                                                boxSize="22px"
                                                flexShrink={0}
                                            >
                                                <Icon
                                                    as={FiGift}
                                                    color="white"
                                                    boxSize="12px"
                                                />
                                            </Flex>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="brand.green"
                                                _dark={{
                                                    color: 'green.300',
                                                }}
                                                whiteSpace="nowrap"
                                            >
                                                Free tokens
                                            </Text>
                                            <Icon
                                                as={FaExternalLinkAlt}
                                                color="brand.green"
                                                _dark={{
                                                    color: 'green.300',
                                                }}
                                                boxSize="10px"
                                                flexShrink={0}
                                            />
                                        </Flex>
                                    </Link>
                                )}
                            </Flex>
                            <Flex
                                gap={3}
                                flexWrap="wrap"
                                justifyContent={{
                                    base: 'center',
                                    sm: 'flex-start',
                                }}
                            >
                                {enabledNetworks.map((network) => (
                                    <NetworkCard
                                        key={network.chainId}
                                        name={network.name}
                                        image={network.image}
                                        badge={network.badge}
                                        isSelected={
                                            selectedNetwork === network.chainId
                                        }
                                        onClick={() =>
                                            setSelectedNetwork(network.chainId)
                                        }
                                        disabled={!enabledChainIds.includes(network.chainId)}
                                    />
                                ))}
                            </Flex>

                        </Box>
                    </>
                )}
            </Box>

            {/* Cloudflare Verification */}
            <Flex
                alignItems="center"
                justifyContent="center"
                py={2}
                position="relative"
            >
                {/* Turnstile widget — always mounted, off-layout to prevent shift */}
                {isTurnstileConfigured && (
                    <Box
                        position="absolute"
                        opacity={0}
                        h={0}
                        overflow="hidden"
                        aria-hidden="true"
                    >
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
                    </Box>
                )}

                {/* Status pill — consistent height in both states */}
                <Tooltip
                    label="We run a quick bot check. The button unlocks automatically when it finishes."
                    isDisabled={!isCloudflareVerifying}
                    hasArrow
                    placement="top"
                >
                    <Box
                        role="status"
                        aria-live="polite"
                        bg="card.white"
                        borderRadius="full"
                        px={isCloudflareVerifying ? 4 : 3}
                        py={2}
                        borderWidth="1px"
                        borderColor={
                            isCloudflareVerifying
                                ? 'border.lightGray'
                                : 'rgba(0, 0, 0, 0.06)'
                        }
                        boxShadow={isCloudflareVerifying ? 'sm' : 'none'}
                        display="flex"
                        alignItems="center"
                        gap={2}
                        transition="all 0.3s ease"
                    >
                        {isCloudflareVerifying ? (
                            <>
                                <Spinner size="sm" color="brand.green" />
                                <Text fontSize="sm" color="gray.600">
                                    Verifying with Cloudflare…
                                </Text>
                            </>
                        ) : (
                            <>
                                <Icon
                                    as={FaCheckCircle}
                                    color={
                                        turnstileError
                                            ? 'brand.yellow'
                                            : 'brand.green'
                                    }
                                    boxSize={4}
                                />
                                <Text
                                    fontSize="sm"
                                    color={
                                        turnstileError
                                            ? 'brand.yellow'
                                            : 'gray.500'
                                    }
                                >
                                    {turnstileError
                                        ? 'Verification unavailable — you can still create'
                                        : isTurnstileConfigured
                                          ? 'Verified by Cloudflare'
                                          : 'Verified locally'}
                                </Text>
                            </>
                        )}
                    </Box>
                </Tooltip>
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
                            <Link
                                href="https://x.com/stacked_poker"
                                isExternal
                            >
                                <SocialIconButton
                                    tone="x"
                                    label="X"
                                    chipSize="sm"
                                />
                            </Link>
                            <Link
                                href="https://discord.gg/347RBVcvpn"
                                isExternal
                            >
                                <SocialIconButton
                                    tone="discord"
                                    label="Discord"
                                    chipSize="sm"
                                />
                            </Link>
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
                                    chain={CHAIN_CONFIG[selectedNetwork]?.chain}
                                />
                            ) : (
                                <>
                                    <Button
                                        variant="tactilePrimary"
                                        flex="1"
                                        height="56px"
                                        fontWeight="bold"
                                        borderRadius="16px"
                                        onClick={requestAuthentication}
                                        isLoading={isAuthenticating}
                                        loadingText="Waiting…"
                                    >
                                        Finish Sign-In
                                    </Button>
                                    <Button
                                        variant="tactileDestructive"
                                        flex="1"
                                        height="56px"
                                        borderRadius="16px"
                                        onClick={handleDisconnectWallet}
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
                            variant="tactilePrimary"
                            data-testid="create-game-btn"
                            onClick={handleCreateGame}
                            size="lg"
                            height="56px"
                            width="100%"
                            fontSize="md"
                            borderRadius="16px"
                            isLoading={isLoading}
                            loadingText={rotatingCreateLabel}
                            spinner={<Spinner size="md" color="white" />}
                            isDisabled={
                                !isFormValid || !isCloudflareReady || isLoading
                            }
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
