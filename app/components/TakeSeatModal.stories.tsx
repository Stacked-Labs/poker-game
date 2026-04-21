'use client';

import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Collapse,
    Flex,
    FormControl,
    HStack,
    Heading,
    Icon,
    Image,
    Input,
    Link,
    Spinner,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import BuyInPresets from './TakeSeat/BuyInPresets';
import StakesChip from './TakeSeat/StakesChip';

/**
 * Visual-only preview of TakeSeatModal (direction C redesign).
 * Mirrors the modal body layout without Chakra Modal/overlay or providers,
 * so every visual state is inspectable in Storybook.
 */

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
`;

const CHIPS_PER_USDC = 100;

interface TakeSeatPreviewProps {
    isCryptoGame: boolean;
    xUsername: string | null;
    xProfileImageUrl: string | null;
    usdcBalance: string | null;
    walletAddress: string | null;
    isConnected: boolean;
    showWithdrawFirst?: boolean;
    existingChipBalance?: string | null;
    isBalanceInsufficient?: boolean;
    sb: number;
    bb: number;
    maxBuyIn: number;
    seatId?: number;
    chain?: string;
    defaultBuyInChips?: number;
    depositStatus?:
        | 'idle'
        | 'checking_allowance'
        | 'approving'
        | 'depositing';
}

const formatUsdc = (chips: number): string =>
    (chips / CHIPS_PER_USDC).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const TakeSeatPreview: React.FC<TakeSeatPreviewProps> = ({
    isCryptoGame,
    xUsername,
    xProfileImageUrl,
    usdcBalance,
    walletAddress,
    isConnected,
    showWithdrawFirst = false,
    existingChipBalance = null,
    isBalanceInsufficient = false,
    sb,
    bb,
    maxBuyIn,
    seatId,
    chain,
    defaultBuyInChips,
    depositStatus = 'idle',
}) => {
    const isDepositing = depositStatus !== 'idle';
    const depositStatusMessage =
        depositStatus === 'checking_allowance'
            ? 'Checking USDC balance...'
            : depositStatus === 'approving'
              ? 'Approving USDC transfer...'
              : depositStatus === 'depositing'
                ? 'Depositing to table...'
                : null;
    const [inputUnit, setInputUnit] = useState<'chips' | 'usdc'>(
        isCryptoGame ? 'usdc' : 'chips'
    );
    const initialChips = defaultBuyInChips ?? maxBuyIn;
    const [buyIn, setBuyIn] = useState<number>(initialChips);
    const [buyInInput, setBuyInInput] = useState(
        isCryptoGame
            ? (initialChips / CHIPS_PER_USDC).toFixed(2)
            : initialChips.toString()
    );
    const finePrint = useDisclosure({ defaultIsOpen: false });

    const walletBalanceChips = useMemo(() => {
        if (!isCryptoGame || !usdcBalance) return null;
        return Math.floor(Number(usdcBalance) * CHIPS_PER_USDC);
    }, [isCryptoGame, usdcBalance]);

    const truncatedAddress = walletAddress
        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        : null;

    const formattedChips = buyIn.toLocaleString('en-US');
    const formattedUsdcEst = formatUsdc(buyIn);

    const handleBuyInChange = (value: string) => {
        if (isCryptoGame) {
            if (inputUnit === 'usdc') {
                if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
                setBuyInInput(value);
                setBuyIn(value === '' ? 0 : Math.round(Number(value) * CHIPS_PER_USDC));
                return;
            }
        }
        if (!/^\d*$/.test(value)) return;
        setBuyInInput(value);
        setBuyIn(value === '' ? 0 : Number(value));
    };

    const handleUnitChange = (unit: 'chips' | 'usdc') => {
        if (unit === inputUnit) return;
        setInputUnit(unit);
        if (unit === 'usdc') {
            setBuyInInput(formatUsdc(buyIn));
        } else {
            setBuyInInput(Math.round(buyIn).toString());
        }
    };

    const applyBuyInChips = (chips: number) => {
        setBuyIn(chips);
        setBuyInInput(
            isCryptoGame && inputUnit === 'usdc'
                ? formatUsdc(chips)
                : Math.round(chips).toString()
        );
    };

    const isJoinDisabled = buyIn <= 0;

    return (
        <Box
            borderRadius={{ base: '24px', sm: '28px' }}
            maxWidth={{ base: 'calc(100vw - 24px)', sm: '420px' }}
            mx="auto"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
            overflow="hidden"
            position="relative"
            bg="card.white"
            border="1px solid"
            borderColor="border.lightGray"
            minWidth="320px"
        >
            {/* Chair easter egg — bottom-right, quiet */}
            <Box
                position="absolute"
                bottom={3}
                right={3}
                fontSize="sm"
                opacity={0.35}
                animation={`${float} 5s ease-in-out infinite`}
                cursor="pointer"
                zIndex={2}
                _hover={{ opacity: 1 }}
                transition="opacity 0.2s ease"
            >
                🪑
            </Box>

            {/* Close placeholder */}
            <Box
                position="absolute"
                top={3}
                right={3}
                w="28px"
                h="28px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                color="text.secondary"
                _hover={{ bg: 'card.lightGray' }}
                fontSize="md"
                zIndex={2}
            >
                ✕
            </Box>

            {showWithdrawFirst ? (
                <>
                    <Box textAlign="center" pt={10} pb={2} px={6}>
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
                    </Box>
                    <Box px={{ base: 5, sm: 7 }} pb={2} pt={2}>
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
                                        {existingChipBalance ?? '—'}
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
                    </Box>
                    <Box px={{ base: 5, sm: 7 }} pb={7} pt={4}>
                        <VStack w="100%" spacing={3}>
                            <Button
                                w="100%"
                                h="52px"
                                borderRadius="bigButton"
                                bg="brand.navy"
                                color="white"
                                fontWeight="bold"
                                fontSize="sm"
                            >
                                {truncatedAddress ?? 'Sign In'}
                            </Button>
                            <Button
                                w="100%"
                                h="52px"
                                fontSize="md"
                                fontWeight="bold"
                                borderRadius="bigButton"
                                bg="brand.pink"
                                color="white"
                            >
                                Withdraw &amp; start fresh
                            </Button>
                        </VStack>
                    </Box>
                </>
            ) : (
                <>
                    <Box textAlign="center" pt={10} pb={2} px={6}>
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
                    </Box>

                    <Box px={{ base: 5, sm: 7 }} pb={2} pt={2}>
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
                                        w="100%"
                                        py={2.5}
                                        justify="center"
                                        spacing={2}
                                        cursor="pointer"
                                        bg="transparent"
                                        border="none"
                                        opacity={0.6}
                                        _hover={{ opacity: 1 }}
                                        transition="opacity 0.15s ease"
                                    >
                                        <Icon as={FaXTwitter} boxSize={3.5} color="text.primary" />
                                        <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color="text.secondary"
                                        >
                                            Sign in with X
                                        </Text>
                                    </HStack>
                                    {!isCryptoGame && (
                                        <>
                                            <HStack w="100%" spacing={3} align="center">
                                                <Box flex={1} h="1px" bg="border.lightGray" />
                                                <Text
                                                    fontSize="xs"
                                                    color="text.secondary"
                                                    fontWeight="medium"
                                                    opacity={0.6}
                                                >
                                                    or
                                                </Text>
                                                <Box flex={1} h="1px" bg="border.lightGray" />
                                            </HStack>
                                            <FormControl>
                                                <Input
                                                    placeholder="Pick a username"
                                                    variant="takeSeatModal"
                                                    maxLength={9}
                                                />
                                            </FormControl>
                                        </>
                                    )}
                                </VStack>
                            )}

                            {/* Buy-in: hero input */}
                            <FormControl>
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
                                        <Box position="relative" width="120px" height="26px">
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
                                                {(['chips', 'usdc'] as const).map((unit) => (
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
                                                        onClick={() => handleUnitChange(unit)}
                                                        background="transparent"
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
                                                            {unit === 'usdc' ? 'USDC' : 'Chips'}
                                                        </Text>
                                                    </Box>
                                                ))}
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
                                        value={buyInInput}
                                        onChange={(e) => handleBuyInChange(e.target.value)}
                                        htmlSize={Math.max(
                                            buyInInput.length || 4,
                                            isCryptoGame && inputUnit === 'usdc' ? 4 : 1
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
                                {isCryptoGame && (
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
                                            ? `${formattedChips} chips`
                                            : `$${formattedUsdcEst}`}
                                    </Text>
                                )}
                            </FormControl>

                            {/* Presets */}
                            {bb > 0 && (
                                <BuyInPresets
                                    bb={bb}
                                    maxBuyIn={maxBuyIn}
                                    walletBalanceChips={walletBalanceChips}
                                    isCrypto={isCryptoGame}
                                    selectedChips={buyIn}
                                    onSelect={applyBuyInChips}
                                />
                            )}
                        </VStack>
                    </Box>

                    <Box px={{ base: 5, sm: 7 }} pb={6} pt={3}>
                        <VStack w="100%" spacing={3}>
                            {isCryptoGame && !isConnected && (
                                <Button
                                    w="100%"
                                    h="52px"
                                    borderRadius="bigButton"
                                    bg="brand.navy"
                                    _dark={{ bg: 'brand.lightGray', color: 'brand.darkNavy' }}
                                    color="white"
                                    fontSize="sm"
                                    fontWeight="bold"
                                >
                                    Sign In
                                </Button>
                            )}
                            {isCryptoGame && isConnected && truncatedAddress && (
                                <Flex
                                    w="100%"
                                    bg="card.lightGray"
                                    borderRadius="xl"
                                    px={4}
                                    py={3}
                                    alignItems="center"
                                    gap={3}
                                >
                                    <Image
                                        src="/usdc-logo.png"
                                        alt="USDC"
                                        boxSize="28px"
                                        loading="lazy"
                                        flexShrink={0}
                                    />
                                    <VStack spacing={0} alignItems="flex-start" flex={1}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="text.secondary"
                                        >
                                            {truncatedAddress}
                                        </Text>
                                        <Text fontSize="xs" color="text.muted">
                                            {usdcBalance} USDC
                                        </Text>
                                    </VStack>
                                </Flex>
                            )}

                            {isCryptoGame && !isConnected && (
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
                                        Sign in with your wallet to join this crypto game.
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
                                        {usdcBalance ? ` (you have ${usdcBalance} USDC)` : ''}.
                                    </Text>
                                </HStack>
                            )}

                            <Button
                                w="100%"
                                h="56px"
                                borderRadius="bigButton"
                                bg={
                                    isDepositing
                                        ? 'brand.green'
                                        : isJoinDisabled
                                          ? 'btn.lightGray'
                                          : 'brand.green'
                                }
                                color={isDepositing ? 'white' : undefined}
                                border="none"
                                cursor={isDepositing ? 'wait' : undefined}
                                isLoading={isDepositing}
                                loadingText={
                                    depositStatusMessage || 'Processing...'
                                }
                                spinner={<Spinner size="sm" color="white" />}
                                boxShadow={
                                    isDepositing
                                        ? '0 6px 18px rgba(54, 163, 123, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : isJoinDisabled
                                          ? 'none'
                                          : '0 6px 18px rgba(54, 163, 123, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                }
                                _disabled={
                                    isDepositing
                                        ? {
                                              bg: 'brand.green',
                                              color: 'white',
                                              cursor: 'wait',
                                              opacity: 1,
                                              boxShadow:
                                                  '0 6px 18px rgba(54, 163, 123, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                          }
                                        : undefined
                                }
                                _hover={
                                    isJoinDisabled || isDepositing
                                        ? {}
                                        : {
                                              bg: '#2E8A66',
                                              transform: 'translateY(-2px)',
                                              boxShadow:
                                                  '0 14px 28px rgba(54, 163, 123, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                                          }
                                }
                                _active={{
                                    bg: isJoinDisabled
                                        ? 'btn.lightGray'
                                        : '#287859',
                                    transform: isJoinDisabled
                                        ? 'none'
                                        : 'translateY(0) scale(0.99)',
                                }}
                                transition="all 0.2s ease"
                            >
                                <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    letterSpacing="-0.01em"
                                    color={isJoinDisabled ? 'text.muted' : 'white'}
                                >
                                    {isCryptoGame
                                        ? `Sit down · $${formattedUsdcEst}`
                                        : 'Join game'}
                                </Text>
                            </Button>

                            {isCryptoGame && (
                                <Box w="100%" pt={1}>
                                    <Box
                                        as="button"
                                        type="button"
                                        onClick={finePrint.onToggle}
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
                                                finePrint.isOpen
                                                    ? 'rotate(180deg)'
                                                    : 'rotate(0deg)'
                                            }
                                            transition="transform 0.2s ease"
                                        />
                                    </Box>
                                    <Collapse in={finePrint.isOpen} animateOpacity>
                                        <Text
                                            fontSize="2xs"
                                            color="text.muted"
                                            textAlign="center"
                                            lineHeight="short"
                                            px={2}
                                            pt={2}
                                            opacity={0.75}
                                        >
                                            Your USDC is deposited into the table contract
                                            and converted to chips. Chip balances update
                                            after each settled hand. {CHIPS_PER_USDC} chips
                                            &nbsp;=&nbsp;1&nbsp;USDC.{' '}
                                            <Link
                                                href="#"
                                                color="brand.navy"
                                                _dark={{ color: 'brand.lightGray' }}
                                                fontWeight="semibold"
                                                textDecoration="underline"
                                                textUnderlineOffset="2px"
                                            >
                                                View contract
                                            </Link>
                                        </Text>
                                    </Collapse>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </>
            )}
        </Box>
    );
};

const meta = {
    title: 'Modals/TakeSeatModal',
    component: TakeSeatPreview,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Box p={8} minH="700px" display="flex" alignItems="center" justifyContent="center">
                <Story />
            </Box>
        ),
    ],
    argTypes: {
        isCryptoGame: { control: 'boolean' },
        xUsername: { control: 'text' },
        xProfileImageUrl: { control: 'text' },
        usdcBalance: { control: 'text' },
        walletAddress: { control: 'text' },
        isConnected: { control: 'boolean' },
        showWithdrawFirst: { control: 'boolean' },
        existingChipBalance: { control: 'text' },
        isBalanceInsufficient: { control: 'boolean' },
        sb: { control: 'number' },
        bb: { control: 'number' },
        maxBuyIn: { control: 'number' },
        seatId: { control: 'number' },
        chain: { control: 'text' },
        defaultBuyInChips: { control: 'number' },
        depositStatus: {
            control: { type: 'select' },
            options: ['idle', 'checking_allowance', 'approving', 'depositing'],
        },
    },
    args: {
        isCryptoGame: true,
        xUsername: null,
        xProfileImageUrl: null,
        usdcBalance: null,
        walletAddress: null,
        isConnected: false,
        showWithdrawFirst: false,
        existingChipBalance: null,
        isBalanceInsufficient: false,
        sb: 10,
        bb: 20,
        maxBuyIn: 10000,
        seatId: 3,
        chain: 'Base',
        defaultBuyInChips: 1000,
        depositStatus: 'idle',
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Take Seat modal (direction C redesign) — stakes-led header, chip stack hero, BB-anchored preset pills that scale with blinds, and a dual-unit CTA. Crypto shows USDC deposit flow, free game shows username/X identity.',
            },
        },
    },
} satisfies Meta<typeof TakeSeatPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Low stakes crypto ($0.10/$0.20), X linked — the most common first-deposit flow. */
export const CryptoMicroStakes: Story = {
    name: 'Crypto · $0.10/$0.20 · X linked',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        sb: 10,
        bb: 20,
        maxBuyIn: 10000,
        defaultBuyInChips: 1000,
    },
};

/** Mid stakes ($1/$2) — presets snap to $100/$250/$250(dedup)/Max. */
export const CryptoMidStakes: Story = {
    name: 'Crypto · $1/$2 · X linked',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '1250.00',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        sb: 100,
        bb: 200,
        maxBuyIn: 60000,
        defaultBuyInChips: 40000,
    },
};

/** High stakes ($100/$200) — presets auto-scale to $10k/$20k/$25k/Max. */
export const CryptoHighStakes: Story = {
    name: 'Crypto · $100/$200 · X linked',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '50000.00',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        sb: 10000,
        bb: 20000,
        maxBuyIn: 5000000,
        defaultBuyInChips: 2000000,
    },
};

/** Crypto, no X linked — shows Connect X affordance. */
export const CryptoNoX: Story = {
    name: 'Crypto · no X',
    args: {
        isCryptoGame: true,
        xUsername: null,
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
    },
};

/** Free game, X linked — chip-denominated presets, no USDC flow. */
export const FreeXLinked: Story = {
    name: 'Free · X linked',
    args: {
        isCryptoGame: false,
        xUsername: 'pokerShark',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg',
        isConnected: true,
        sb: 10,
        bb: 20,
        maxBuyIn: 5000,
        defaultBuyInChips: 2000,
        chain: undefined,
    },
};

/** Free game, no X — shows username input with divider. */
export const FreeNoX: Story = {
    name: 'Free · no X',
    args: {
        isCryptoGame: false,
        xUsername: null,
        isConnected: true,
        sb: 10,
        bb: 20,
        maxBuyIn: 5000,
        defaultBuyInChips: 2000,
        chain: undefined,
    },
};

/** Crypto, wallet not connected — Sign In button + hint banner. */
export const CryptoNotConnected: Story = {
    name: 'Crypto · wallet not connected',
    args: {
        isCryptoGame: true,
        xUsername: null,
        usdcBalance: null,
        walletAddress: null,
        isConnected: false,
    },
};

/** Insufficient balance — red warning banner + greyed chip stack. */
export const InsufficientBalance: Story = {
    name: 'Crypto · insufficient balance',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '2.50',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: true,
        defaultBuyInChips: 1000,
    },
};

/** Depositing state — CTA stays green-shaded with white spinner + status text. */
export const Depositing: Story = {
    name: 'Crypto · depositing (green loading CTA)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        defaultBuyInChips: 100,
        depositStatus: 'depositing',
    },
};

/** Approving allowance state — same green loading style, different message. */
export const Approving: Story = {
    name: 'Crypto · approving USDC',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        defaultBuyInChips: 100,
        depositStatus: 'approving',
    },
};

/** Existing chips on contract — full-face takeover, withdraw first. */
export const WithdrawFirst: Story = {
    name: 'Crypto · withdraw first (takeover)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        showWithdrawFirst: true,
        existingChipBalance: '5,000',
    },
};
