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
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import PlayTypeToggle from './PlayTypeToggle';
import OptionCard from './OptionCard';
import gameData from '../../create-game/gameOptions.json';
import { useRouter } from 'next/navigation';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { joinTable, sendLog } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import { Poppins } from 'next/font/google';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

const LeftSideContent: React.FC = () => {
    const wallet = useActiveWallet();
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Free');
    const [selectedGameMode, setSelectedGameMode] =
        useState<string>('Texas Holdem');
    const [selectedNetwork, setSelectedNetwork] = useState<string>('Optimism');
    const [isLoading, setIsLoading] = useState(false);
    const address = useActiveAccount()?.address;
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { appState, dispatch } = useContext(AppContext);
    const toast = useToastHelper();
    const [smallBlind, setSmallBlind] = useState<number>(1);
    const [bigBlind, setBigBlind] = useState<number>(2);
    const [isFormValid, setIsFormValid] = useState(false);

    const { gameModes, networks } = gameData;

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

        if (!socket) {
            toast.error('Connection Error', 'Unable to connect to the server.');
            return;
        }
        if (!appState.clientID) {
            toast.error(
                'Connection Error',
                'Client ID not available. Cannot create game.'
            );
            return;
        }

        setIsLoading(true);

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
                        uuid: appState.clientID,
                        smallBlind: smallBlind,
                        bigBlind: bigBlind,
                        isCrypto: playType === 'Crypto',
                        chain: playType === 'Crypto' ? selectedNetwork : '',
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

                    joinTable(socket, data.tablename);
                    router.push(`/game/${data.tablename}`);
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
        } catch (error) {
            console.error('Error creating game:', error);
            toast.error(
                'Create Failed',
                `An error occurred: ${error instanceof Error ? error.message : String(error)}`
            );
            setIsLoading(false);
        }
    };

    return (
        <VStack
            spacing={4}
            alignItems="center"
            width="100%"
            maxWidth="800px"
            pt={20}
            height="100%"
            justifyContent="space-between"
        >
            <VStack spacing={4} alignItems="center" width="100%">
                <Text
                    className={poppins.className}
                    fontSize={['2xl', '2xl', '3xl', '5xl']}
                    fontWeight="bold"
                    mb={4}
                    color="white"
                >
                    Game Settings
                </Text>

                <PlayTypeToggle playType={playType} setPlayType={setPlayType} />

                {/* Blinds inputs */}
                <FormControl width="50%">
                    <Flex justifyContent="center" alignItems="center" mb={2}>
                        <FormLabel color="white" mb={0} mr={2}>
                            Blinds
                        </FormLabel>
                        <Tooltip
                            label="Blinds must be in increments of 0.01 minimum"
                            aria-label="Blinds info"
                        >
                            <span>
                                <FaInfoCircle color="white" />
                            </span>
                        </Tooltip>
                    </Flex>
                    <Flex justifyContent="space-between">
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Small Blind"
                            borderColor="white"
                            focusBorderColor="red.500"
                            value={smallBlind}
                            onChange={(e) =>
                                setSmallBlind(Number(e.target.value))
                            }
                            mr={2}
                            color={'white'}
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Big Blind"
                            borderColor="white"
                            focusBorderColor="red.500"
                            value={bigBlind}
                            onChange={(e) =>
                                setBigBlind(Number(e.target.value))
                            }
                            ml={2}
                            color={'white'}
                        />
                    </Flex>
                </FormControl>

                {/* Game Mode selection */}
                <FormControl
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    width="100%"
                >
                    <Flex alignItems="center" mb={2}>
                        <FormLabel color="white" mb={0}>
                            Game Mode
                        </FormLabel>
                        <Tooltip
                            label="Choose the poker variant you want to play"
                            aria-label="Game mode info"
                        >
                            <span>
                                <FaInfoCircle color="white" />
                            </span>
                        </Tooltip>
                    </Flex>
                    <SimpleGrid
                        columns={2}
                        spacing={2}
                        justifyItems="center"
                        width="auto"
                        maxWidth="100%"
                    >
                        {gameModes.map((mode) => (
                            <OptionCard
                                key={mode.name}
                                name={mode.name}
                                description={mode.description}
                                isSelected={selectedGameMode === mode.name}
                                onClick={() => setSelectedGameMode(mode.name)}
                                disabled={mode.disabled}
                            />
                        ))}
                    </SimpleGrid>
                </FormControl>

                {/* Network selection for Crypto play type */}
                {playType === 'Crypto' && (
                    <FormControl
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        width="100%"
                    >
                        <Flex alignItems="center" mb={2}>
                            <FormLabel color="white" mb={0}>
                                Network
                            </FormLabel>
                            <Tooltip
                                label="Select the blockchain network for your crypto game"
                                aria-label="Network info"
                            >
                                <span>
                                    <FaInfoCircle color="white" />
                                </span>
                            </Tooltip>
                        </Flex>
                        <SimpleGrid
                            columns={3}
                            spacing={2}
                            justifyItems="center"
                            width="auto"
                            maxWidth="100%"
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
                    </FormControl>
                )}
            </VStack>

            <Button
                variant="homeSectionButton"
                bg="green.500"
                onClick={handleCreateGame}
                _hover={{ bg: 'green.600' }}
                size={['xl']}
                py={4}
                width="200px"
                fontSize={['xl']}
                isLoading={isLoading}
                loadingText="Loading"
                spinner={<Spinner size="md" color="white" />}
                opacity={isFormValid ? 1 : 0.6}
                cursor={isFormValid ? 'pointer' : 'not-allowed'}
                disabled={!isFormValid}
            >
                Create Game
            </Button>
        </VStack>
    );
};

export default LeftSideContent;
