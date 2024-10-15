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
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa'; // Import the info icon from React Icons
import PlayTypeToggle from './PlayTypeToggle';
import OptionCard from './OptionCard';
import gameData from '../../create-game/gameOptions.json';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { joinTable, sendLog } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

const LeftSideContent: React.FC = () => {
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Free');
    const [selectedGameMode, setSelectedGameMode] =
        useState<string>('Texas Holdem');
    const [selectedNetwork, setSelectedNetwork] = useState<string>('Arbitrum');
    const [isLoading, setIsLoading] = useState(false);
    const { address } = useAccount();
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { dispatch } = useContext(AppContext);
    const toast = useToastHelper();
    const [smallBlind, setSmallBlind] = useState<string>('');
    const [bigBlind, setBigBlind] = useState<string>('');
    const [isFormValid, setIsFormValid] = useState(false);

    const { gameModes, networks } = gameData;

    useEffect(() => {
        const validateForm = () => {
            const smallBlindValue = parseFloat(smallBlind);
            const bigBlindValue = parseFloat(bigBlind);
            const isSmallBlindValid =
                !isNaN(smallBlindValue) &&
                smallBlindValue >= 0.01 &&
                /^\d+(\.\d{2})?$/.test(smallBlind);
            const isBigBlindValid =
                !isNaN(bigBlindValue) &&
                bigBlindValue >= smallBlindValue &&
                /^\d+(\.\d{2})?$/.test(bigBlind);
            const isGameModeSelected = selectedGameMode !== '';
            const isNetworkSelected =
                playType === 'Free' ||
                (playType === 'Crypto' && selectedNetwork !== '');
            const isWalletConnected = !!address;

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
            if (!address) {
                toast.warning(
                    'Wallet Not Connected',
                    'Please connect your wallet first.'
                );
            }
            if (smallBlind === '' || bigBlind === '') {
                toast.warning(
                    'Missing Blinds',
                    'Please enter both small and big blinds.'
                );
            }
            if (selectedGameMode === '') {
                toast.warning(
                    'Game Mode Not Selected',
                    'Please select a game mode.'
                );
            }
            if (playType === 'Crypto' && selectedNetwork === '') {
                toast.warning(
                    'Network Not Selected',
                    'Please select a network for crypto play.'
                );
            }
            return;
        }

        if (!socket) {
            toast.error('Connection Error', 'Unable to connect to the server.');
            return;
        }

        const tableName = address!;
        setIsLoading(true);
        dispatch({ type: 'setTablename', payload: tableName });

        try {
            await joinTable(socket, tableName);
            sendLog(socket, `Joined table ${tableName}`);
            router.push(`/game/${tableName}`);
            toast.success(
                'Joined Table',
                `You have joined table ${tableName}.`
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'Join Failed',
                'Failed to join the table. Please try again.'
            );
        } finally {
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
                    fontSize="5xl"
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
                            onChange={(e) => setSmallBlind(e.target.value)}
                            mr={2}
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Big Blind"
                            borderColor="white"
                            focusBorderColor="red.500"
                            value={bigBlind}
                            onChange={(e) => setBigBlind(e.target.value)}
                            ml={2}
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
                bg={isFormValid ? 'green.500' : 'green.300'}
                onClick={handleCreateGame}
                _hover={{ bg: isFormValid ? 'green.600' : 'green.300' }}
                size={['xl']}
                py={4}
                width="200px"
                fontSize={['xl']}
                isLoading={isLoading}
                loadingText="Creating..."
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