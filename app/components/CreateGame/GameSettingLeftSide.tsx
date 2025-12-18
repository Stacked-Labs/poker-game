'use client';


import React, { useState, useContext, useEffect, useMemo } from 'react';
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
} from '@chakra-ui/react';
import {
    FaInfoCircle,
    FaUsers,
    FaArrowRight,
    FaCheckCircle,
} from 'react-icons/fa';
import PlayTypeToggle from './PlayTypeToggle';
import NetworkCard from './NetworkCard';
import gameData from '../../create-game/gameOptions.json';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import { initSession } from '@/app/hooks/server_actions';
import { useActiveAccount } from 'thirdweb/react';
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
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Crypto');
    const [selectedGameMode, setSelectedGameMode] =
        useState<string>('Texas Holdem');
    const [selectedNetwork, setSelectedNetwork] = useState<string>('Optimism');
    const [isLoading, setIsLoading] = useState(false);
    const address = useActiveAccount()?.address;
    const router = useRouter();
    const { dispatch } = useContext(AppContext);
    const toast = useToastHelper();
    const [smallBlind, setSmallBlind] = useState<number>(1);
    const [bigBlind, setBigBlind] = useState<number>(2);
    const [isFormValid, setIsFormValid] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileError, setTurnstileError] = useState(false);
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
    const isTurnstileConfigured = Boolean(turnstileSiteKey);

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

    const blindsErrorMessage = useMemo(() => {
        if (smallBlind <= 0 || bigBlind <= 0) {
            return 'Blinds must be positive values.';
        }
        if (bigBlind < smallBlind) {
            return 'Big blind must be greater than or equal to small blind.';
        }
        return '';
    }, [smallBlind, bigBlind]);

    useEffect(() => {
        const validateForm = () => {
            const isSmallBlindValid =
                !isNaN(smallBlind) &&
                smallBlind >= 0.01 &&
                /^\d+(\.\d{1,2})?$/.test(smallBlind.toString());
            const isBigBlindValid =
                !isNaN(bigBlind) &&
                bigBlind >= smallBlind &&
                /^\d+(\.\d{1,2})?$/.test(bigBlind.toString());
            const isGameModeSelected = selectedGameMode !== '';
            const isNetworkSelected =
                playType === 'Free' ||
                (playType === 'Crypto' && selectedNetwork !== '');
            const isWalletConnected = playType === 'Free' || !!address;

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
    ]);

    const handleCreateGame = async () => {
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
            if (playType === 'Crypto' && !address) {
                toast.warning(
                    'Wallet Not Connected',
                    'Please connect your wallet for Crypto play.'
                );
                return;
            }
            if (!address && playType === 'Free') {
                toast.info(
                    'Creating as Guest',
                    'You are creating a free game without connecting a wallet.'
                );
            }
            if (smallBlind <= 0 || bigBlind <= 0 || bigBlind < smallBlind) {
                toast.warning(
                    'Invalid Blinds',
                    'Please enter valid positive blinds (big >= small).'
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

        setIsLoading(true);

        // Ensure HTTP session is initialized so `credentials: include` works as expected
        await initSession();

        try {
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
                    dispatch({ type: 'setTablename', payload: data.tablename });
                    router.push(`/table/${data.tablename}`);
                } else {
                    toast.error(
                        'Create Error',
                        'Received invalid response from server.'
                    );
                    setIsLoading(false);
                }
            } else {
                const errorData = await response.text();
                toast.error(
                    'Create Failed',
                    `Failed to create game: ${response.statusText} - ${errorData}`
                );
                setIsLoading(false);
            }

            setTurnstileToken(null);
        } catch (error) {
            console.error('Error creating game:', error);
            toast.error(
                'Create Failed',
                `An error occurred: ${error instanceof Error ? error.message : String(error)}`
            );
            setTurnstileToken(null);
            setIsLoading(false);
        }
    };

    const handleJoinPublicGame = () => {
        // Placeholder - will be implemented later
        toast.info('Coming Soon', 'Public game lobby will be available soon!');
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
                                label="Blinds must be in increments of 1 minimum"
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
                    <Box>
                        <HStack spacing={3} alignItems="flex-end">
                            {/* Small Blind */}
                            <Box position="relative">
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
                                    min="1"
                                    value={smallBlind}
                                    onChange={(e) =>
                                        setSmallBlind(Number(e.target.value))
                                    }
                                    bg="input.white"
                                    borderWidth="1px"
                                    borderColor="border.lightGray"
                                    borderRadius="14px"
                                    width="96px"
                                    height="48px"
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
                            </Box>
                            <Text
                                color="gray.400"
                                fontSize="xl"
                                fontWeight="light"
                                pb={2}
                            >
                                /
                            </Text>
                            {/* Big Blind */}
                            <Box position="relative">
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
                                    min="1"
                                    value={bigBlind}
                                    onChange={(e) =>
                                        setBigBlind(Number(e.target.value))
                                    }
                                    bg="input.white"
                                    borderWidth="1px"
                                    borderColor="border.lightGray"
                                    borderRadius="14px"
                                    width="96px"
                                    height="48px"
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
                    </Box>
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
            <Flex alignItems="center" justifyContent="center" gap={2} py={4}>
                {isTurnstileConfigured && !turnstileToken && !turnstileError ? (
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
                ) : (
                    <Box
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

            {/* Create Game Button */}
            <Button
                bg="brand.green"
                color="white"
                onClick={handleCreateGame}
                size="lg"
                height="56px"
                width="100%"
                maxW="480px"
                fontSize="md"
                fontWeight="bold"
                borderRadius="16px"
                border="none"
                isLoading={isLoading}
                loadingText="Creating..."
                spinner={<Spinner size="md" color="white" />}
                opacity={isFormValid && isCloudflareReady ? 1 : 0.6}
                cursor={
                    isFormValid && isCloudflareReady ? 'pointer' : 'not-allowed'
                }
                disabled={!isFormValid || !isCloudflareReady}
                _hover={{
                    bg: '#2d9268',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(54, 163, 123, 0.35)',
                }}
                _active={{
                    transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
            >
                Create Game
            </Button>
        </VStack>
    );
};

export default GameSettingLeftSide;
