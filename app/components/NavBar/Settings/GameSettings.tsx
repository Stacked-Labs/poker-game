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
    useMediaQuery,
    VStack,
    NumberInput,
    NumberInputField,
} from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';
import { IoMdSunny } from 'react-icons/io';
import { FiCheck, FiEye, FiEyeOff, FiLock, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { CardBack } from '@/app/components/Card';
import type { CardBackVariant, DisplayMode } from '@/app/interfaces';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { sendUpdateBlinds, sendToggleRabbitHunt } from '@/app/hooks/server_actions';
import { useConnectX } from '@/app/hooks/useConnectX';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import { useToast } from '@chakra-ui/react';

// Chip Display backgrounds — chips/bb use brand tokens (raw hex avoided
// where possible). USDC keeps its real brand hex since it identifies
// the network.
const chipDisplayColors: Record<string, string> = {
    chips: '#0B1430', // brand.darkNavy
    bb: '#22674E', // brand.greenEdge
    usdc: '#2775CA',
};

// Card-back colors are network-branded — these crypto hex codes
// identify the network and are intentional. Classic uses brand.darkNavy.
const cardBackColors: Record<CardBackVariant, string> = {
    classic: '#0B1430', // brand.darkNavy
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    base: '#1A6BFF',
    usdc: '#2775CA',
};

// ─── Section group header ────────────────────────────────────────────────
// Used to group settings cards into Account / Table / Display / App
// sections. The Owner-only chip is rendered next to the section label
// when the section's controls are gated to the table owner; non-owners
// see the chip as a quiet "this is locked" indicator.
const SectionGroupHeader = ({
    label,
    ownerOnly,
}: {
    label: string;
    ownerOnly?: boolean;
}) => (
    <HStack spacing={1.5} px={1} mb={1.5}>
        <Text
            fontSize="2xs"
            color="whiteAlpha.700"
            textTransform="uppercase"
            letterSpacing="0.10em"
            fontWeight={800}
        >
            {label}
        </Text>
        {ownerOnly && (
            <HStack
                spacing={1}
                px={1.5}
                py={0.5}
                bg="card.lightGray"
                borderRadius="full"
            >
                <Icon as={FiLock} boxSize="9px" color="text.muted" />
                <Text fontSize="2xs" color="text.secondary" fontWeight={700}>
                    Owner only
                </Text>
            </HStack>
        )}
    </HStack>
);

const ConnectXSection = () => {
    const { isAuthenticated, xUsername, xProfileImageUrl } = useAuth();
    const { connectX, disconnectX, isConnecting, isDisconnecting } = useConnectX();
    const sectionShadow = useColorModeValue(
        '0 2px 8px rgba(0, 0, 0, 0.06)',
        '0 2px 8px rgba(0, 0, 0, 0.25)'
    );
    const unlinkColor = useColorModeValue('gray.400', 'gray.500');

    if (!isAuthenticated) return null;

    // Connected state — compact inline card matching settings panel style
    if (xUsername) {
        return (
            <Box
                bg="card.white"
                borderRadius="16px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow={sectionShadow}
            >
                <Flex align="center" gap={3}>
                    {/* Avatar */}
                    <Box flexShrink={0}>
                        {xProfileImageUrl ? (
                            <Image
                                src={xProfileImageUrl}
                                alt="X avatar"
                                boxSize={{ base: '38px', md: '42px' }}
                                borderRadius="full"
                                objectFit="cover"
                            />
                        ) : (
                            <Flex
                                boxSize={{ base: '38px', md: '42px' }}
                                borderRadius="full"
                                bg="black"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={FaXTwitter} boxSize={4} color="white" />
                            </Flex>
                        )}
                    </Box>

                    {/* Handle + status */}
                    <VStack spacing={0.5} align="flex-start" flex={1} minWidth={0}>
                        <HStack spacing={1.5}>
                            <Icon as={FaXTwitter} boxSize="11px" color="text.primary" opacity={0.5} />
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight="bold"
                                color="text.secondary"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW={{ base: '140px', md: '200px' }}
                            >
                                @{xUsername}
                            </Text>
                            <HStack spacing={1} px={1.5} py={0.5} bg="rgba(54, 163, 123, 0.08)" borderRadius="full">
                                <Box boxSize="5px" borderRadius="full" bg="brand.green" />
                                <Text fontSize="2xs" color="brand.green" fontWeight="semibold">
                                    Connected
                                </Text>
                            </HStack>
                        </HStack>
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            opacity={0.55}
                            lineHeight="1.2"
                        >
                            Avatar and handle shown at the table
                        </Text>
                    </VStack>

                    {/* Unlink */}
                    <Text
                        as="button"
                        onClick={disconnectX}
                        aria-disabled={isDisconnecting}
                        fontSize="xs"
                        fontWeight="medium"
                        color={unlinkColor}
                        bg="transparent"
                        border="none"
                        p={0}
                        flexShrink={0}
                        _hover={{ color: 'brand.pink' }}
                        _active={{ color: 'brand.pinkDark', transform: 'translateY(1px)' }}
                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), color 120ms ease"
                    >
                        {isDisconnecting ? 'Unlinking…' : 'Unlink'}
                    </Text>
                </Flex>
            </Box>
        );
    }

    // Disconnected state — clean connect card
    return (
        <Box
            bg="card.white"
            borderRadius="16px"
            border="1px solid"
            borderColor="border.lightGray"
            p={{ base: 2.5, md: 3 }}
            boxShadow={sectionShadow}
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
                    <VStack spacing={0} align="flex-start" minWidth={0}>
                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight="bold"
                            color="text.secondary"
                            whiteSpace="nowrap"
                            lineHeight="1.2"
                        >
                            Link your X
                        </Text>
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            opacity={0.55}
                            whiteSpace="nowrap"
                            lineHeight="1.2"
                        >
                            Show avatar &amp; handle at the table
                        </Text>
                    </VStack>
                </HStack>
                <Button
                    size="sm"
                    bg="#0A0B12"
                    color="white"
                    border="none"
                    borderRadius="8px"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight={700}
                    letterSpacing="0.02em"
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #000000"
                    _hover={{ bg: '#15161E' }}
                    _active={{
                        bg: '#000000',
                        transform: 'translateY(2px)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #000000',
                    }}
                    transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                    onClick={connectX}
                    isLoading={isConnecting}
                    leftIcon={<Icon as={FaXTwitter} boxSize={3.5} />}
                    flexShrink={0}
                >
                    Connect
                </Button>
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
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
            {/* Account */}
            <Box>
                <SectionGroupHeader label="Account" />
                <ConnectXSection />
            </Box>

            {/* Table — owner-only controls */}
            <Box>
                <SectionGroupHeader label="Table" ownerOnly />
                <VStack spacing={2} align="stretch">
                <Box
                    bg="card.white"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    p={{ base: 2.5, md: 3 }}
                    boxShadow="card.lift"
                >
                    <Flex
                        direction="row"
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        gap={{ base: 1.5, md: 3 }}
                    >
                        <HStack spacing={2} flex={1} minWidth={0} align="baseline">
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight={700}
                                color="text.secondary"
                                whiteSpace="nowrap"
                                lineHeight="1"
                            >
                                Blinds
                            </Text>
                            {hasPending && (
                                <HStack
                                    spacing={1}
                                    px={1.5}
                                    py={0.5}
                                    bg="rgba(253, 197, 29, 0.15)"
                                    borderRadius="full"
                                >
                                    <Box
                                        w="5px"
                                        h="5px"
                                        borderRadius="full"
                                        bg="brand.yellow"
                                    />
                                    <Text
                                        fontSize="2xs"
                                        fontWeight={700}
                                        color="brand.yellowDark"
                                        whiteSpace="nowrap"
                                        sx={{
                                            fontVariantNumeric:
                                                'tabular-nums',
                                        }}
                                    >
                                        Next {formatBlinds(pendingBlinds.sb)}/
                                        {formatBlinds(pendingBlinds.bb)}
                                    </Text>
                                </HStack>
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
                                        border="none"
                                        borderRadius="8px"
                                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #22674E"
                                        _hover={{ bg: 'brand.green' }}
                                        _active={{
                                            bg: 'brand.greenDark',
                                            transform: 'translateY(1.5px)',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                                        }}
                                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
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
                                            bg="brand.pink"
                                            color="white"
                                            border="none"
                                            borderRadius="8px"
                                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                                            _hover={{ bg: 'brand.pink' }}
                                            _active={{
                                                bg: 'brand.pinkDark',
                                                transform: 'translateY(1.5px)',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                                            }}
                                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                                            onClick={handleBlindsCancel}
                                            mt={2}
                                        />
                                    )}
                                </>
                            )}
                        </HStack>
                    </Flex>
                    {isOwner && !isValidBlinds && (
                        <Text color="brand.pink" fontSize="xs" mt={1.5} textAlign="right">
                            BB must be at least 2x SB
                        </Text>
                    )}
                </Box>
                {/* Rabbit Hunt — owner-only */}
                <Box
                    bg="card.white"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    p={{ base: 2.5, md: 3 }}
                    boxShadow="card.lift"
                    opacity={isOwner ? 1 : 0.6}
                >
                    <Flex
                        direction="row"
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        gap={3}
                    >
                        <VStack spacing={0} align="flex-start" flex={1} minWidth={0}>
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight={700}
                                color="text.secondary"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                Rabbit Hunt 🐇
                            </Text>
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                lineHeight="1.3"
                            >
                                Show undealt cards after all fold
                            </Text>
                        </VStack>
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={config?.rabbitHuntEnabled ?? false}
                            isDisabled={!isOwner}
                            onChange={(e) => {
                                if (!socket) return;
                                sendToggleRabbitHunt(socket, e.target.checked);
                            }}
                            colorScheme="green"
                            data-testid="rabbit-hunt-toggle"
                        />
                    </Flex>
                </Box>
                </VStack>
            </Box>

            {/* Display */}
            <Box>
                <SectionGroupHeader label="Display" />
                <VStack spacing={2} align="stretch">
            <Box
                bg="card.white"
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                </VStack>
            </Box>

            {/* App */}
            <Box>
                <SectionGroupHeader label="App" />
                <VStack spacing={2} align="stretch">
            <Box
                bg="card.white"
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight={700}
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
            </Box>
        </VStack>
    );
};

export default GameSettings;
