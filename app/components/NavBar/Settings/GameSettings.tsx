import { tableColors } from '@/app/utils/tableColors';
import {
    Box,
    Button,
    Flex,
    Image,
    Select,
    Text,
    Switch,
    HStack,
    Icon,
    IconButton,
    Tooltip,
    useMediaQuery,
    VStack,
    NumberInput,
    NumberInputField,
} from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';
import { IoMdSunny } from 'react-icons/io';
import { FiCheck, FiEye, FiEyeOff, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { useColorMode } from '@chakra-ui/react';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { CardBack } from '@/app/components/Card';
import type { CardBackVariant, DisplayMode } from '@/app/interfaces';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { sendUpdateBlinds, refreshXIdentity } from '@/app/hooks/server_actions';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import { useToast } from '@chakra-ui/react';

const chipDisplayColors: Record<string, string> = {
    chips: '#1A1A2E',
    bb: '#0A2A1B',
    usdc: '#2775CA',
};

const cardBackColors: Record<CardBackVariant, string> = {
    classic: '#0B1430',
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    base: '#1A6BFF',
    usdc: '#2775CA',
};

const ConnectXSection = () => {
    const { isAuthenticated, xUsername, xProfileImageUrl, refreshXStatus } = useAuth();
    const socket = useContext(SocketContext);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!isAuthenticated) return null;

    const handleConnect = () => {
        setIsConnecting(true);
        let handled = false;
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
            `${backendUrl}/auth/x`,
            'x_oauth',
            `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );

        const onComplete = () => {
            if (handled) return;
            handled = true;
            refreshXStatus().then(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    refreshXIdentity(socket);
                }
            });
        };

        // Listen for result from popup via postMessage
        const handler = (event: MessageEvent) => {
            if (event.data?.type !== 'x_oauth_result') return;
            window.removeEventListener('message', handler);
            setIsConnecting(false);
            if (event.data.status === 'success') {
                onComplete();
            }
        };
        window.addEventListener('message', handler);

        // Fallback: if popup is closed without sending a message
        const pollClosed = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(pollClosed);
                window.removeEventListener('message', handler);
                setIsConnecting(false);
                // Refresh anyway in case it worked but postMessage didn't fire
                onComplete();
            }
        }, 500);
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            await fetch(`${backendUrl}/auth/x`, {
                method: 'DELETE',
                credentials: 'include',
            });
            await refreshXStatus();
        } catch (err) {
            console.error('Failed to disconnect X account:', err);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Box
            bg="card.white"
            borderRadius="16px"
            border="2px solid"
            borderColor="border.lightGray"
            p={{ base: 2.5, md: 3 }}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
        >
            <Flex
                direction="row"
                justify="space-between"
                align="center"
                wrap="nowrap"
                gap={3}
            >
                <HStack spacing={2} flex={1} minWidth={0}>
                    <Icon as={FaXTwitter} boxSize={{ base: 4, md: 5 }} color="text.secondary" />
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        whiteSpace="nowrap"
                    >
                        {xUsername ? `@${xUsername}` : 'X Account'}
                    </Text>
                </HStack>
                <HStack spacing={2} flexShrink={0}>
                    {xProfileImageUrl && (
                        <Image
                            src={xProfileImageUrl}
                            alt="X avatar"
                            boxSize={{ base: '28px', md: '32px' }}
                            borderRadius="full"
                            objectFit="cover"
                        />
                    )}
                    {xUsername ? (
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            borderRadius="8px"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            onClick={handleDisconnect}
                            isLoading={isDisconnecting}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            bg="#000"
                            color="white"
                            borderRadius="8px"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            _hover={{ bg: '#333' }}
                            onClick={handleConnect}
                            isLoading={isConnecting}
                            leftIcon={<Icon as={FaXTwitter} boxSize={3.5} />}
                        >
                            Connect
                        </Button>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
};

const GameSettings = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { appState, dispatch } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const isOwner = useIsTableOwner();
    const toast = useToast();
    const [isPortrait] = useMediaQuery('(orientation: portrait)');
    const tableColorKey = localStorage.getItem('tableColorKey') ?? 'green';
    const config = appState.game?.config;
    const pendingBlinds = appState.game?.pendingBlinds;
    const hasPending = !!pendingBlinds;
    const { format, fromChips, toChips, mode: displayMode } = useFormatAmount();

    // Blinds only support chips or USDC — BB is circular (blinds define BB), so treat it as chips
    const blindsMode: 'chips' | 'usdc' = displayMode === 'usdc' ? 'usdc' : 'chips';
    const formatBlinds = blindsMode === 'usdc' ? format : (v: number) => v.toLocaleString('en-US');
    const blindsFromChips = blindsMode === 'usdc' ? fromChips : (v: number) => v;
    // Always round to integer — backend only accepts whole chips
    const blindsToChips = blindsMode === 'usdc' ? toChips : (v: number) => Math.round(v);

    // Inputs work in display units (USDC dollars or raw chips)
    const [sbDisplay, setSbDisplay] = useState<number>(blindsFromChips(config?.sb ?? 5));
    const [bbDisplay, setBbDisplay] = useState<number>(blindsFromChips(config?.bb ?? 10));

    // Re-sync display values when blindsMode changes (e.g. user switches chip display)
    useEffect(() => {
        if (!config) return;
        setSbDisplay(blindsFromChips(config.sb));
        setBbDisplay(blindsFromChips(config.bb));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blindsMode]);

    // Convert display values back to raw chips for server
    const sbChips = blindsToChips(sbDisplay);
    const bbChips = blindsToChips(bbDisplay);
    const isValidBlinds = sbChips > 0 && bbChips >= sbChips * 2;
    const isBlindsChanged = config && (sbChips !== config.sb || bbChips !== config.bb);

    const handleBlindsSubmit = () => {
        if (!socket || !isValidBlinds) return;
        sendUpdateBlinds(socket, sbChips, bbChips);
        toast({
            title: 'Blind change queued',
            description: `${formatBlinds(sbChips)} / ${formatBlinds(bbChips)} will apply at the start of the next hand.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top',
        });
    };

    const handleBlindsCancel = () => {
        if (!socket || !config) return;
        sendUpdateBlinds(socket, config.sb, config.bb);
    };
    const [selectedColor, onColorChange] = useState<string>(tableColorKey);
    const suitPalette = appState.fourColorDeckEnabled
        ? {
              spade: '#000000',
              heart: '#DC143C',
              diamond: '#1E6BD6',
              club: '#1F8A4C',
          }
        : {
              spade: '#000000',
              heart: '#DC143C',
              diamond: '#DC143C',
              club: '#000000',
          };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        onColorChange(key);

        localStorage.setItem('tableColorKey', key);
        window.dispatchEvent(new Event('tableColorChanged'));
    };

    return (
        <VStack spacing={{ base: 2, md: 4 }} align="stretch">
            <ConnectXSection />
            <Tooltip
                label={!isOwner ? 'Only the table owner can change blinds' : undefined}
                isDisabled={isOwner}
                hasArrow
                placement="top"
            >
                <Box
                    bg="card.white"
                    borderRadius="16px"
                    border="2px solid"
                    borderColor="border.lightGray"
                    p={{ base: 2.5, md: 3 }}
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
                >
                    <Flex
                        direction="row"
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        gap={{ base: 1.5, md: 3 }}
                    >
                        <HStack spacing={1.5} flex={1} minWidth={0} align="baseline">
                            <Text
                                fontSize={{ base: 'sm', md: 'lg' }}
                                fontWeight="bold"
                                color="text.secondary"
                                whiteSpace="nowrap"
                                lineHeight="1"
                            >
                                Blinds
                            </Text>
                            {hasPending && (
                                <Text
                                    fontSize={{ base: '2xs', md: 'xs' }}
                                    fontWeight="bold"
                                    color="orange.400"
                                    whiteSpace="nowrap"
                                    lineHeight="1"
                                >
                                    NEXT: {formatBlinds(pendingBlinds.sb)}/{formatBlinds(pendingBlinds.bb)}
                                </Text>
                            )}
                        </HStack>
                        <HStack spacing={{ base: 1, md: 1.5 }} flexShrink={0}>
                            <VStack spacing={0}>
                                <Text color="text.secondary" fontSize="2xs" fontWeight="semibold" lineHeight={1}>
                                    SB
                                </Text>
                                <NumberInput
                                    value={sbDisplay}
                                    onChange={(_, val) => setSbDisplay(val || 0)}
                                    min={blindsMode === 'usdc' ? 0.01 : 1}
                                    step={blindsMode === 'usdc' ? 0.01 : 1}
                                    precision={blindsMode === 'usdc' ? 2 : 0}
                                    size="sm"
                                    w={{ base: '52px', md: '68px' }}
                                    isDisabled={!isOwner}
                                >
                                    <NumberInputField
                                        bg="card.lightGray"
                                        color="text.primary"
                                        border="none"
                                        borderRadius="8px"
                                        textAlign="center"
                                        fontWeight="bold"
                                        px={1}
                                        h={{ base: '32px', md: '36px' }}
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        data-testid="sb-input"
                                    />
                                </NumberInput>
                            </VStack>
                            <Text color="text.secondary" pt={2.5} fontWeight="bold" fontSize="sm">/</Text>
                            <VStack spacing={0}>
                                <Text color="text.secondary" fontSize="2xs" fontWeight="semibold" lineHeight={1}>
                                    BB
                                </Text>
                                <NumberInput
                                    value={bbDisplay}
                                    onChange={(_, val) => setBbDisplay(val || 0)}
                                    min={blindsMode === 'usdc' ? 0.02 : 2}
                                    step={blindsMode === 'usdc' ? 0.01 : 1}
                                    precision={blindsMode === 'usdc' ? 2 : 0}
                                    size="sm"
                                    w={{ base: '52px', md: '68px' }}
                                    isDisabled={!isOwner}
                                >
                                    <NumberInputField
                                        bg="card.lightGray"
                                        color="text.primary"
                                        border="none"
                                        borderRadius="8px"
                                        textAlign="center"
                                        fontWeight="bold"
                                        px={1}
                                        h={{ base: '32px', md: '36px' }}
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        data-testid="bb-input"
                                    />
                                </NumberInput>
                            </VStack>
                            {isOwner && (
                                <>
                                    <IconButton
                                        icon={<Icon as={FiCheck} boxSize={{ base: 3.5, md: 4 }} />}
                                        aria-label="Queue blind change"
                                        size="sm"
                                        h={{ base: '30px', md: '34px' }}
                                        w={{ base: '30px', md: '34px' }}
                                        minW="unset"
                                        bg="brand.green"
                                        color="white"
                                        borderRadius="8px"
                                        _hover={{ opacity: 0.85 }}
                                        onClick={handleBlindsSubmit}
                                        isDisabled={!isValidBlinds || !isBlindsChanged}
                                        mt={2}
                                        data-testid="blinds-confirm-btn"
                                    />
                                    {hasPending && (
                                        <IconButton
                                            icon={<Icon as={FiX} boxSize={{ base: 3.5, md: 4 }} />}
                                            aria-label="Cancel pending blind change"
                                            size="sm"
                                            h={{ base: '30px', md: '34px' }}
                                            w={{ base: '30px', md: '34px' }}
                                            minW="unset"
                                            bg="red.500"
                                            color="white"
                                            borderRadius="8px"
                                            _hover={{ opacity: 0.85 }}
                                            onClick={handleBlindsCancel}
                                            mt={2}
                                        />
                                    )}
                                </>
                            )}
                        </HStack>
                    </Flex>
                    {isOwner && !isValidBlinds && (
                        <Text color="red.400" fontSize="xs" mt={1.5} textAlign="right">
                            BB must be at least 2x SB
                        </Text>
                    )}
                </Box>
            </Tooltip>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Table Color
                    </Text>
                    <Select
                        id="color-select"
                        value={selectedColor}
                        onChange={handleSelectChange}
                        variant="outline"
                        width={{ base: '52%', sm: '50%' }}
                        bg={tableColors[selectedColor].color}
                        color={
                            selectedColor == 'white'
                                ? 'brand.darkNavy'
                                : 'white'
                        }
                        fontWeight={'bold'}
                        sx={{
                            '& > option:checked': {
                                color: 'text.primary',
                                fontWeight: 'bold',
                            },
                            '& > option': {
                                bg: 'card.white',
                                color: 'text.primary',
                            },
                        }}
                        _hover={{
                            cursor: 'pointer',
                        }}
                        defaultValue={tableColorKey}
                    >
                        {tableColors &&
                            Object.entries(tableColors).map(([key]) => (
                                <option key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </option>
                            ))}
                    </Select>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Card Back
                    </Text>
                    <HStack spacing={{ base: 2, md: 3 }} flexShrink={0}>
                        <Box
                            width={{ base: '46px', md: '53px' }}
                            height={{ base: '61px', md: '71px' }}
                            flexShrink={0}
                        >
                            <CardBack
                                variant={appState.cardBackDesign}
                                idSuffix="-preview"
                            />
                        </Box>
                        <Select
                            value={appState.cardBackDesign}
                            onChange={(e) =>
                                dispatch({
                                    type: 'setCardBackDesign',
                                    payload: e.target
                                        .value as CardBackVariant,
                                })
                            }
                            variant="outline"
                            width={{ base: '120px', md: '140px' }}
                            bg={cardBackColors[appState.cardBackDesign]}
                            color="white"
                            fontWeight="bold"
                            sx={{
                                '& > option:checked': {
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                },
                                '& > option': {
                                    bg: 'card.white',
                                    color: 'text.primary',
                                },
                            }}
                            _hover={{ cursor: 'pointer' }}
                        >
                            <option value="classic">Classic</option>
<option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="base">Base</option>
                            <option value="usdc">USDC</option>
                        </Select>
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Four Color Deck
                    </Text>
                    <HStack spacing={{ base: 1.5, md: 2 }} flexShrink={0}>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.heart}
                        >
                            ♥
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.spade}
                        >
                            ♠
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.diamond}
                        >
                            ♦
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.club}
                        >
                            ♣
                        </Text>
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={appState.fourColorDeckEnabled}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                dispatch({
                                    type: 'setFourColorDeckEnabled',
                                    payload: nextValue,
                                });
                            }}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chip Display
                    </Text>
                    <Select
                        value={appState.displayMode}
                        onChange={(e) =>
                            dispatch({
                                type: 'setDisplayMode',
                                payload: e.target.value as DisplayMode,
                            })
                        }
                        variant="outline"
                        width={{ base: '160px', md: '185px' }}
                        bg={chipDisplayColors[appState.displayMode]}
                        color="white"
                        fontWeight="bold"
                        sx={{
                            '& > option:checked': {
                                color: 'text.primary',
                                fontWeight: 'bold',
                            },
                            '& > option': {
                                bg: 'card.white',
                                color: 'text.primary',
                            },
                        }}
                        _hover={{ cursor: 'pointer' }}
                    >
                        <option value="chips">Chips (1,500)</option>
                        <option value="bb">Big Blinds (150bb)</option>
                        {appState.game?.config?.crypto === true && (
                            <option value="usdc">USDC ($15.00)</option>
                        )}
                    </Select>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Theme
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                        <Icon
                            as={colorMode === 'light' ? IoMdSunny : FaMoon}
                            boxSize={{ base: 5, md: 6 }}
                            color="text.secondary"
                        />
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={colorMode === 'dark'}
                            onChange={toggleColorMode}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chat Overlay
                    </Text>
                    {isPortrait ? (
                        <HStack
                            spacing={2}
                            px={3}
                            py={1}
                            bg="card.lightGray"
                            borderRadius="full"
                            flexShrink={0}
                        >
                            <Icon
                                as={FiEyeOff}
                                boxSize={{ base: 4, md: 5 }}
                                color="text.secondary"
                            />
                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                fontWeight="semibold"
                                color="text.secondary"
                                whiteSpace="nowrap"
                            >
                                Disabled on portrait
                            </Text>
                        </HStack>
                    ) : (
                        <HStack spacing={3} flexShrink={0}>
                            <Icon
                                as={
                                    appState.chatOverlayEnabled
                                        ? FiEye
                                        : FiEyeOff
                                }
                                boxSize={{ base: 5, md: 6 }}
                                color="text.secondary"
                            />
                            <Switch
                                size={{ base: 'md', md: 'lg' }}
                                isChecked={appState.chatOverlayEnabled}
                                onChange={(event) => {
                                    const nextValue = event.target.checked;
                                    dispatch({
                                        type: 'setChatOverlayEnabled',
                                        payload: nextValue,
                                    });
                                }}
                                colorScheme="green"
                            />
                        </HStack>
                    )}
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chat Notification Sound
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                        <Icon
                            as={
                                appState.chatSoundEnabled
                                    ? FiVolume2
                                    : FiVolumeX
                            }
                            boxSize={{ base: 5, md: 6 }}
                            color="text.secondary"
                        />
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={appState.chatSoundEnabled}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                dispatch({
                                    type: 'setChatSoundEnabled',
                                    payload: nextValue,
                                });
                            }}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
        </VStack>
    );
};

export default GameSettings;
