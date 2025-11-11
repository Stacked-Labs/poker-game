import React, { useState, useContext, useEffect } from 'react';
import {
    VStack,
    Text,
    SimpleGrid,
    Button,
    Flex,
    Input,
    FormControl,
    FormLabel,
    Tooltip,
    Spinner,
    Box,
    Heading,
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import PlayTypeToggle from './PlayTypeToggle';
import OptionCard from './OptionCard';
import gameData from '../../create-game/gameOptions.json';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import { initSession } from '@/app/hooks/server_actions';
import { useActiveAccount } from 'thirdweb/react';
import Turnstile from 'react-turnstile';
import { keyframes } from '@emotion/react';

// Animations
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

const LeftSideContent: React.FC = () => {
    // const wallet = useActiveWallet();
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Free');
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

    const { gameModes, networks } = gameData;

    // Debug logging for Turnstile setup
    useEffect(() => {
        console.log('🔍 Turnstile Debug Info:');
        console.log(
            '- Site Key configured:',
            !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
        );
        console.log(
            '- Site Key (first 10 chars):',
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.substring(0, 10)
        );
        console.log('- Current hostname:', window.location.hostname);
        console.log('- Current protocol:', window.location.protocol);

        // Check CSP
        const cspMetaTags = document.querySelectorAll(
            'meta[http-equiv="Content-Security-Policy"]'
        );
        console.log('- CSP meta tags found:', cspMetaTags.length);
        cspMetaTags.forEach((tag, i) => {
            const content = (tag as HTMLMetaElement).content;
            const hasScriptSrc = content.includes('script-src');
            const hasCloudflareCom = content.includes('cloudflare.com');
            console.log(
                `  Tag ${i}: script-src present: ${hasScriptSrc}, cloudflare.com allowed: ${hasCloudflareCom}`
            );
        });
    }, []);

    useEffect(() => {
        const validateForm = () => {
            const isSmallBlindValid =
                !isNaN(smallBlind) &&
                smallBlind >= 0.01 &&
                /^\d+(\.\d{2})?$/.test(smallBlind.toString());
            const isBigBlindValid =
                !isNaN(bigBlind) &&
                bigBlind >= smallBlind &&
                /^\d+(\.\d{2})?$/.test(bigBlind.toString());
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
        // If Turnstile is configured but has an error or no token, warn but allow proceed
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
                        cfTurnstileToken: turnstileToken || '', // Send empty string if no token (fallback mode)
                    }),
                }
            );
            console.log('create response:', response);

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
                    console.error(
                        'Create response OK but missing tablename:',
                        data
                    );
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

    return (
        <VStack
            spacing={4}
            alignItems="center"
            width="100%"
            maxWidth="900px"
            pt={{ base: 20, md: 20 }}
            pb={8}
            px={{ base: 4, md: 6 }}
        >
            {/* Title */}
            <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="extrabold"
                color='text.primary'
                textAlign="center"
                animation={`${slideUp} 0.6s ease-out`}
            >
                Game Settings
            </Heading>

            {/* Play Type Section */}
            <Box
                width="100%"
                animation={`${slideUp} 0.6s ease-out 0.1s backwards`}
            >
                <Flex justifyContent="center" width="100%">
                    <PlayTypeToggle
                        playType={playType}
                        setPlayType={setPlayType}
                    />
                </Flex>
            </Box>

            {/* Blinds Section */}
            <Box
                width="100%"
                maxW="450px"
                bg="card.white"
                borderRadius="20px"
                pt={{ base: 4, md: 5 }}
                pb={{ base: 6, md: 8 }}
                px={{ base: 6, md: 8 }}
                boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                animation={`${slideUp} 0.6s ease-out 0.2s backwards`}
            >
                <FormControl>
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        mb={3}
                        gap={2}
                    >
                        <FormLabel variant={'createGame'}>
                            Blinds
                        </FormLabel>
                        <Tooltip
                            label="Blinds must be in increments of 0.01 minimum"
                            aria-label="Blinds info"
                            bg="brand.darkNavy"
                            color="white"
                            borderRadius="8px"
                            px={3}
                            py={2}
                        >
                            <Box display="flex" alignItems="center">
                                <FaInfoCircle color="#EB0B5C" size={18} />
                            </Box>
                        </Tooltip>
                    </Flex>
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        gap={4}
                        flexDirection={{ base: 'column', sm: 'row' }}
                    >
                        <Flex alignItems="center" gap={2}>
                            <Text
                                color="brand.pink"
                                fontWeight="bold"
                                fontSize="md"
                                minWidth="fit-content"
                            >
                                SB:
                            </Text>
                            <Input
                                variant={'white'}
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Small Blind"
                                value={smallBlind}
                                onChange={(e) =>
                                    setSmallBlind(Number(e.target.value))
                                }
                            />
                        </Flex>
                        <Flex alignItems="center" gap={2}>
                            <Text
                                color="brand.pink"
                                fontWeight="bold"
                                fontSize="md"
                                minWidth="fit-content"
                            >
                                BB:
                            </Text>
                            <Input
                                variant={'white'}
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Big Blind"
                                value={bigBlind}
                                onChange={(e) =>
                                    setBigBlind(Number(e.target.value))
                                }
                            />
                        </Flex>
                    </Flex>
                </FormControl>
            </Box>

            {/* Game Mode Section */}
            <Box
                width="100%"
                maxW="500px"
                bg="card.white"
                borderRadius="20px"
                pt={{ base: 4, md: 5 }}
                pb={{ base: 6, md: 8 }}
                px={{ base: 6, md: 8 }}
                boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                animation={`${slideUp} 0.6s ease-out 0.3s backwards`}
            >
                <FormControl>
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        mb={4}
                        gap={2}
                    >
                        <FormLabel variant={'createGame'}>
                            Game Mode
                        </FormLabel>
                        <Tooltip
                            label="Choose the poker variant you want to play"
                            aria-label="Game mode info"
                            bg="brand.darkNavy"
                            color="white"
                            borderRadius="8px"
                            px={3}
                            py={2}
                        >
                            <Box display="flex" alignItems="center">
                                <FaInfoCircle color="#EB0B5C" size={18} />
                            </Box>
                        </Tooltip>
                    </Flex>
                    <Flex justifyContent="center" width="100%">
                        <SimpleGrid
                            columns={2}
                            spacing={4}
                            justifyItems="center"
                        >
                            {gameModes.map((mode) => (
                                <OptionCard
                                    key={mode.name}
                                    name={mode.name}
                                    description={mode.description}
                                    isSelected={selectedGameMode === mode.name}
                                    onClick={() =>
                                        setSelectedGameMode(mode.name)
                                    }
                                    disabled={mode.disabled}
                                />
                            ))}
                        </SimpleGrid>
                    </Flex>
                </FormControl>
            </Box>

            {/* Network Selection - Only for Crypto */}
            {playType === 'Crypto' && (
                <Box
                    width="100%"
                    bg="card.white"
                    borderRadius="20px"
                    pt={{ base: 4, md: 5 }}
                    pb={{ base: 6, md: 8 }}
                    px={{ base: 6, md: 8 }}
                    boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                    animation={`${slideUp} 0.6s ease-out 0.4s backwards`}
                >
                    <FormControl>
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            mb={4}
                            gap={2}
                        >
                            <FormLabel variant={'createGame'}>
                                Network
                            </FormLabel>
                            <Tooltip
                                label="Select the blockchain network for your crypto game"
                                aria-label="Network info"
                                bg="brand.darkNavy"
                                color="white"
                                borderRadius="8px"
                                px={3}
                                py={2}
                            >
                                <Box display="flex" alignItems="center">
                                    <FaInfoCircle color="#EB0B5C" size={18} />
                                </Box>
                            </Tooltip>
                        </Flex>
                        <Flex justifyContent="center" width="100%">
                            <SimpleGrid
                                columns={{ base: 2, sm: 3, md: 4 }}
                                spacing={4}
                                justifyItems="center"
                            >
                                {networks.map((network) => (
                                    <OptionCard
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
                            </SimpleGrid>
                        </Flex>
                    </FormControl>
                </Box>
            )}

            {/* Turnstile Section */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                <Box
                    width="100%"
                    animation={`${slideUp} 0.6s ease-out 0.5s backwards`}
                >
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        gap={2}
                    >
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                            onSuccess={(token: string) => {
                                console.log(
                                    '✅ Turnstile verification successful'
                                );
                                setTurnstileToken(token);
                                setTurnstileError(false);
                            }}
                            onExpire={() => {
                                console.log('⏱️ Turnstile token expired');
                                setTurnstileToken(null);
                            }}
                            onError={(errorCode?: string) => {
                                console.error('❌ Turnstile error:', errorCode);
                                console.log(
                                    'CSP Check - Current meta tags:',
                                    Array.from(
                                        document.querySelectorAll(
                                            'meta[http-equiv="Content-Security-Policy"]'
                                        )
                                    ).map((m) => (m as HTMLMetaElement).content)
                                );
                                setTurnstileError(true);
                                setTurnstileToken(null);

                                // Show a user-friendly error message
                                if (errorCode === '600010') {
                                    toast.warning(
                                        'Verification Issue',
                                        'Bot verification failed. You can still create a game.'
                                    );
                                }
                            }}
                            theme="light"
                            size="normal"
                            retry="auto"
                            refreshExpired="auto"
                            retryInterval={3000}
                        />
                        {turnstileError && (
                            <Text
                                color="brand.yellow"
                                fontSize="xs"
                                textAlign="center"
                            >
                                Verification temporarily unavailable
                            </Text>
                        )}
                    </Flex>
                </Box>
            ) : (
                <Text color="brand.yellow" fontSize="sm">
                    ⚠️ Turnstile not configured
                </Text>
            )}

            {/* Create Game Button */}
            <Button
                bg="brand.green"
                color="white"
                onClick={handleCreateGame}
                size="lg"
                height="60px"
                width={{ base: '100%', sm: '280px' }}
                maxW="400px"
                fontSize="lg"
                fontWeight="bold"
                borderRadius="16px"
                border="none"
                isLoading={isLoading}
                loadingText="Creating..."
                spinner={<Spinner size="md" color="white" />}
                opacity={
                    isFormValid && (!!turnstileToken || turnstileError)
                        ? 1
                        : 0.6
                }
                cursor={
                    isFormValid && (!!turnstileToken || turnstileError)
                        ? 'pointer'
                        : 'not-allowed'
                }
                disabled={
                    !isFormValid ||
                    (!turnstileToken &&
                        !turnstileError &&
                        !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
                }
                animation={`${slideUp} 0.6s ease-out 0.6s backwards`}
                position="relative"
                overflow="hidden"
                _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s',
                }}
                _hover={{
                    bg: 'brand.green',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(54, 163, 123, 0.35)',
                    _before: {
                        transform: 'translateX(100%)',
                    },
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

export default LeftSideContent;
