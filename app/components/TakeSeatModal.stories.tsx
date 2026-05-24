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
import { FaInfoCircle, FaChevronDown, FaCheck } from 'react-icons/fa';
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
    /**
     * When true, simulates the BridgeWidget being available (mainnet, not in
     * Mini App). The CTA flips to "Top up X USDC" and the deficit copy
     * promises a top-up. When false, the CTA stays as "Sit down · $X" and
     * the copy tells the user to fund externally.
     */
    canBridgeTopUp?: boolean;
    /**
     * When true, simulates an external EOA with USDC but no ETH on Base.
     * Renders the gas-warning chip. Suppressed when isBalanceInsufficient
     * is true (USDC deficit takes priority).
     */
    isGasInsufficient?: boolean;
    /** Withdraw-first preview controls. Only relevant when showWithdrawFirst=true. */
    withdrawCanWithdraw?: boolean | null;
    withdrawGasInsufficient?: boolean;
    withdrawStatus?: 'idle' | 'withdrawing' | 'error';
    withdrawError?: string | null;
    /** Seconds left in the settlement-pending countdown shown on the CTA. */
    withdrawCountdownSeconds?: number;
    /** When true, renders the 2s post-success celebration in place of the CTA. */
    withdrawSuccessFlash?: boolean;
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
    canBridgeTopUp = true,
    isGasInsufficient = false,
    withdrawCanWithdraw = true,
    withdrawGasInsufficient = false,
    withdrawStatus = 'idle',
    withdrawError = null,
    withdrawCountdownSeconds = 5,
    withdrawSuccessFlash = false,
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
    // Deficit math mirrors production. Story passes usdcBalance as a decimal
    // string; we compare it against the buy-in's USDC equivalent.
    const buyInUsdc = buyIn / CHIPS_PER_USDC;
    const balanceNum = usdcBalance ? Number(usdcBalance) : null;
    const deficitUsdc =
        isBalanceInsufficient && balanceNum !== null
            ? Math.max(0, buyInUsdc - balanceNum).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : null;
    const isTopUpMode = isCryptoGame && isBalanceInsufficient && canBridgeTopUp;
    const isGasTopUpMode =
        isCryptoGame &&
        !isBalanceInsufficient &&
        isGasInsufficient &&
        canBridgeTopUp;

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
                (() => {
                    // Derive USDC from chips for the value display. Strip any
                    // commas the caller may pass in `existingChipBalance`.
                    const chipsNumber = existingChipBalance
                        ? Number(
                              String(existingChipBalance).replace(/,/g, '')
                          )
                        : null;
                    const existingUsdc =
                        chipsNumber !== null
                            ? (chipsNumber / CHIPS_PER_USDC).toLocaleString(
                                  'en-US',
                                  {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }
                              )
                            : null;
                    const isLoading = chipsNumber === null;
                    const isSettlementPending = withdrawCanWithdraw === false;
                    const isGasMode =
                        !isSettlementPending && withdrawGasInsufficient;
                    return (
                        <>
                            <Box
                                textAlign="center"
                                pt={10}
                                pb={2}
                                px={6}
                            >
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
                            </Box>
                            <Box px={{ base: 5, sm: 7 }} pb={2} pt={2}>
                                <VStack spacing={4} w="100%">
                                    <VStack
                                        spacing={1}
                                        w="100%"
                                        py={4}
                                        textAlign="center"
                                    >
                                        {isLoading ? (
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
                                                        ${existingUsdc}
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
                                                    {existingChipBalance} chips
                                                </Text>
                                                <Text
                                                    fontSize="2xs"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                    opacity={0.75}
                                                >
                                                    in this table&rsquo;s
                                                    contract
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
                                        Cash these out first, then sit down
                                        with a fresh stack.
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

                                    {!withdrawSuccessFlash &&
                                        isSettlementPending && (
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
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                />
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="semibold"
                                                    color="brand.yellowDark"
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                    textAlign="left"
                                                    lineHeight="short"
                                                >
                                                    Last hand still settling.
                                                    Withdraw unlocks in{' '}
                                                    {withdrawCountdownSeconds}s.
                                                </Text>
                                            </HStack>
                                        )}
                                    {!withdrawSuccessFlash &&
                                        !isSettlementPending &&
                                        isGasMode && (
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
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                />
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="semibold"
                                                    color="brand.yellowDark"
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                    textAlign="left"
                                                    lineHeight="short"
                                                >
                                                    Your wallet has no ETH on
                                                    Base for gas. Swap a tiny
                                                    bit of USDC for ETH below,
                                                    $0.25 is more than enough.
                                                </Text>
                                            </HStack>
                                        )}
                                    {!withdrawSuccessFlash &&
                                        !isSettlementPending &&
                                        !isGasMode &&
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
                                            <Icon
                                                as={FaCheck}
                                                color="white"
                                                boxSize={4}
                                            />
                                            <Text
                                                fontSize="md"
                                                fontWeight={800}
                                                color="white"
                                                letterSpacing="-0.01em"
                                            >
                                                ${existingUsdc} sent to your
                                                wallet
                                            </Text>
                                        </HStack>
                                    ) : isSettlementPending ? (
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
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                    thickness="2px"
                                                />
                                                <Text
                                                    fontSize="md"
                                                    fontWeight={700}
                                                    letterSpacing="-0.01em"
                                                    color="brand.yellowDark"
                                                    _dark={{
                                                        color: 'brand.yellow',
                                                    }}
                                                >
                                                    Checking in{' '}
                                                    {withdrawCountdownSeconds}s…
                                                </Text>
                                            </HStack>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="tactilePrimary"
                                            size="lg"
                                            w="100%"
                                            h="56px"
                                            {...(isGasMode
                                                ? {
                                                      bg: '#0052FF',
                                                      _hover: { bg: '#0052FF' },
                                                      _active: {
                                                          bg: '#0040CC',
                                                      },
                                                  }
                                                : {})}
                                            isLoading={
                                                withdrawStatus ===
                                                'withdrawing'
                                            }
                                            loadingText="Cashing out…"
                                            spinner={
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                            }
                                            color="white"
                                            _hover={{ color: 'white' }}
                                            _active={{ color: 'white' }}
                                            _focus={{ color: 'white' }}
                                            _loading={{ color: 'white' }}
                                        >
                                            {isGasMode && (
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
                                                {isGasMode
                                                    ? 'Swap $0.25 → ETH'
                                                    : existingUsdc
                                                      ? `Cash out · $${existingUsdc}`
                                                      : 'Cash out'}
                                            </Text>
                                        </Button>
                                    )}
                                </VStack>
                            </Box>
                        </>
                    );
                })()
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

                            {isBalanceInsufficient && deficitUsdc && usdcBalance && (
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
                                        You have {usdcBalance} USDC.{' '}
                                        {canBridgeTopUp
                                            ? `Top up ${deficitUsdc} to sit at this buy-in.`
                                            : `Add ${deficitUsdc} USDC from your wallet to sit at this buy-in.`}
                                    </Text>
                                </HStack>
                            )}
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

                            <Button
                                variant="tactilePrimary"
                                w="100%"
                                h="56px"
                                borderRadius="bigButton"
                                {...(isGasTopUpMode
                                    ? {
                                          bg: '#0052FF',
                                          _hover: { bg: '#0052FF' },
                                          _active: { bg: '#0040CC' },
                                      }
                                    : {})}
                                isDisabled={
                                    isTopUpMode || isGasTopUpMode
                                        ? false
                                        : isJoinDisabled && !isDepositing
                                }
                                isLoading={isDepositing}
                                loadingText={
                                    depositStatusMessage || 'Processing...'
                                }
                                spinner={<Spinner size="sm" color="white" />}
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
                                    fontWeight={700}
                                    letterSpacing="0.02em"
                                    color="white"
                                >
                                    {!isCryptoGame
                                        ? 'Join game'
                                        : isTopUpMode && deficitUsdc
                                          ? `Top up ${deficitUsdc} USDC`
                                          : isGasTopUpMode
                                            ? 'Swap $0.25 → ETH'
                                            : `Sit down · $${formattedUsdcEst}`}
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

/**
 * Insufficient balance, Bridge available — CTA flips to "Top up X USDC"
 * (single primary action). Slim chip-yellow deficit line above the CTA;
 * no red banner. Tapping the CTA opens TopUpModal in production.
 */
export const CryptoInsufficientBalanceTopUp: Story = {
    name: 'Crypto · insufficient balance (Top Up CTA)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '2.50',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: true,
        canBridgeTopUp: true,
        defaultBuyInChips: 1000,
    },
};

/**
 * Insufficient balance, Bridge unavailable (testnet or Mini App host) — CTA
 * stays as "Sit down · $X" but the deficit hint tells the user to fund
 * externally. State-aware slot, no double CTA.
 */
export const CryptoInsufficientBalanceNoBridge: Story = {
    name: 'Crypto · insufficient balance (no Bridge — testnet/MiniApp)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '2.50',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: true,
        canBridgeTopUp: false,
        defaultBuyInChips: 1000,
    },
};

/**
 * USDC is fine, ETH for gas is not — external EOA (MetaMask, Coinbase
 * Wallet) sent USDC from a CEX directly to its address and never had any
 * native ETH. Bridge is unavailable here (testnet / Mini App), so the chip
 * tells the user to fund externally and the CTA stays "Sit down · $X".
 */
export const CryptoGasInsufficient: Story = {
    name: 'Crypto · gas (ETH) insufficient (no Bridge)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '50.00',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: false,
        isGasInsufficient: true,
        canBridgeTopUp: false,
        defaultBuyInChips: 1000,
    },
};

/**
 * USDC is fine, ETH for gas is not, Bridge available — state-aware CTA
 * flips to Base-blue with the Base logo and "Buy ETH for gas". Clicking
 * opens TopUpModal in gas mode (native ETH on Base prefill, ~$0.50).
 */
export const CryptoGasInsufficientWithBridge: Story = {
    name: 'Crypto · gas (ETH) insufficient (Base-blue CTA)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '50.00',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: false,
        isGasInsufficient: true,
        canBridgeTopUp: true,
        defaultBuyInChips: 1000,
    },
};

/**
 * Just topped up — balance refresh fired after BridgeWidget succeeded.
 * Same modal, CTA reverted to "Sit down · $X" so the user can confirm
 * with one final tap. (The visual continuity is what makes the state-aware
 * pattern feel correct.)
 */
export const CryptoJustToppedUp: Story = {
    name: 'Crypto · just topped up (CTA reverted to Sit down)',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl:
            'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '14.20',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: false,
        canBridgeTopUp: true,
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

// ── Withdraw-first states ───────────────────────────────────────────────
// The withdraw-first body takes over the modal when a player has leftover
// chips on a crypto table from a prior session. Five visual states:
// Idle / Loading / SettlementPending / Gas / Withdrawing / SuccessFlash /
// Error. The CTA is state-aware — one primary action per screen.

const WITHDRAW_FIRST_BASE = {
    isCryptoGame: true,
    xUsername: '0xVoxin',
    xProfileImageUrl:
        'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    usdcBalance: '82.41',
    walletAddress: '0xFA0412345678901234567890123456789012445b',
    isConnected: true,
    showWithdrawFirst: true,
    existingChipBalance: '395',
    canBridgeTopUp: true,
} as const;

/** Idle — chips on contract, ready to withdraw. Green "Cash out · $3.95". */
export const WithdrawFirstIdle: Story = {
    name: 'Crypto · withdraw first · idle',
    args: { ...WITHDRAW_FIRST_BASE },
};

/** Loading — initial balance read in flight. "Checking your stack…" with spinner. */
export const WithdrawFirstLoading: Story = {
    name: 'Crypto · withdraw first · loading',
    args: { ...WITHDRAW_FIRST_BASE, existingChipBalance: null },
};

/** Settlement pending — last hand still settling. Outlined yellow CTA + countdown. */
export const WithdrawFirstSettlementPending: Story = {
    name: 'Crypto · withdraw first · settlement pending',
    args: {
        ...WITHDRAW_FIRST_BASE,
        withdrawCanWithdraw: false,
        withdrawCountdownSeconds: 4,
    },
};

/** Gas insufficient — Base-blue "Swap $0.25 → ETH" CTA reuses the deposit gas pattern. */
export const WithdrawFirstGas: Story = {
    name: 'Crypto · withdraw first · gas insufficient',
    args: {
        ...WITHDRAW_FIRST_BASE,
        withdrawGasInsufficient: true,
    },
};

/** Withdrawing — CTA in loading state, "Cashing out…". */
export const WithdrawFirstWithdrawing: Story = {
    name: 'Crypto · withdraw first · withdrawing',
    args: {
        ...WITHDRAW_FIRST_BASE,
        withdrawStatus: 'withdrawing',
    },
};

/**
 * Success flash (~2s) — Felt-green chip replaces the CTA with a check icon
 * and "$3.95 sent to your wallet". After 2s in production this collapses
 * into the normal join flow body; here it's frozen for inspection.
 */
export const WithdrawFirstSuccessFlash: Story = {
    name: 'Crypto · withdraw first · success flash',
    args: {
        ...WITHDRAW_FIRST_BASE,
        withdrawSuccessFlash: true,
    },
};

/**
 * Error — red chip with the actionable message (mapped from raw wallet
 * errors via useWithdraw's insufficient-funds catch). CTA stays enabled
 * so the user can retry.
 */
export const WithdrawFirstError: Story = {
    name: 'Crypto · withdraw first · error',
    args: {
        ...WITHDRAW_FIRST_BASE,
        withdrawStatus: 'error',
        withdrawError:
            'Not enough ETH on Base for gas. Swap a tiny bit of USDC for ETH and try again.',
    },
};

/**
 * Large stack — 25,000 chips ($250). Validates 6-figure USDC formatting
 * and that the value display doesn't overflow on mobile widths.
 */
export const WithdrawFirstLargeStack: Story = {
    name: 'Crypto · withdraw first · large stack',
    args: {
        ...WITHDRAW_FIRST_BASE,
        existingChipBalance: '25,000',
    },
};
