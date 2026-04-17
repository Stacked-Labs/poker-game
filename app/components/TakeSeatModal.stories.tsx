'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Center,
    Flex,
    FormControl,
    HStack,
    Heading,
    Icon,
    Image,
    Input,
    Link,
    Text,
    Tooltip,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaInfoCircle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

/**
 * Visual-only preview of TakeSeatModal.
 * Renders the modal body directly (no Chakra Modal/overlay, no hooks)
 * so every visual state is inspectable in Storybook without providers.
 */

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

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
}

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
}) => {
    const [inputUnit, setInputUnit] = useState<'chips' | 'usdc'>(
        isCryptoGame ? 'usdc' : 'chips'
    );
    const [buyInInput, setBuyInInput] = useState('');

    const truncatedAddress = walletAddress
        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        : null;

    const isJoinDisabled = !buyInInput || showWithdrawFirst;

    return (
        <Box
            borderRadius="32px"
            maxWidth="420px"
            minWidth="320px"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
            overflow="hidden"
            position="relative"
            border="1px solid"
            borderColor="card.white"
            mx="auto"
        >
            {/* Animated gradient border */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius="32px"
                padding="3px"
                bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                backgroundSize="200% 200%"
                animation={`${gradientShift} 8s ease infinite`}
                pointerEvents="none"
                zIndex={0}
            >
                <Box
                    width="100%"
                    height="100%"
                    bg="card.white"
                    borderRadius="29px"
                />
            </Box>

            {/* Content */}
            <Box position="relative" zIndex={1} bg="card.white">
                {/* Chair easter egg */}
                <Tooltip
                    label='"All you need is a chip and a chair." — Jack Straus'
                    fontSize="xs"
                    placement="bottom"
                    bg="brand.navy"
                    color="white"
                    borderRadius="lg"
                    px={3}
                    py={1.5}
                >
                    <Box
                        position="absolute"
                        top={3}
                        left={4}
                        fontSize="xl"
                        opacity={0.7}
                        animation={`${float} 5s ease-in-out infinite`}
                        cursor="pointer"
                        zIndex={2}
                    >
                        🪑
                    </Box>
                </Tooltip>

                {/* Close button placeholder */}
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

                {/* Header */}
                <Box textAlign="center" pt={10} pb={2} px={8}>
                    <VStack spacing={1}>
                        <Heading
                            as="h2"
                            fontSize="xl"
                            fontWeight="bold"
                            color="text.secondary"
                            letterSpacing="-0.02em"
                        >
                            Take your seat
                        </Heading>
                        <Text
                            fontSize="xs"
                            color="text.muted"
                            fontWeight="medium"
                            textAlign="center"
                        >
                            {isCryptoGame
                                ? 'Deposit USDC to join the table'
                                : 'Join the table and start playing'}
                        </Text>
                    </VStack>
                </Box>

                {/* Body */}
                <Box px={7} pb={3} pt={1}>
                    <Center>
                        <VStack w="100%" spacing={4}>
                            {/* Withdraw-first warning */}
                            {showWithdrawFirst && (
                                <VStack
                                    w="100%"
                                    spacing={3}
                                    bg="orange.50"
                                    borderRadius="xl"
                                    px={4}
                                    py={4}
                                    border="1px solid"
                                    borderColor="orange.200"
                                >
                                    <HStack spacing={2} alignItems="flex-start" w="100%">
                                        <Icon as={FaInfoCircle} boxSize={4} color="orange.500" mt={0.5} flexShrink={0} />
                                        <VStack spacing={1} alignItems="flex-start">
                                            <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                                                Chips already in contract
                                            </Text>
                                            <Text fontSize="xs" color="orange.600" lineHeight="short">
                                                You have {existingChipBalance || '5,000'} chips sitting in this contract
                                                from a previous deposit. Withdraw them first, then deposit a new amount to join.
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            )}

                            {/* X-linked identity banner */}
                            {!showWithdrawFirst && xUsername && (
                                <HStack
                                    spacing={3}
                                    py={2}
                                    px={3}
                                    w="100%"
                                    bg="card.lightGray"
                                    borderRadius="xl"
                                >
                                    {xProfileImageUrl ? (
                                        <Image
                                            src={xProfileImageUrl}
                                            alt="X avatar"
                                            boxSize="34px"
                                            borderRadius="full"
                                            objectFit="cover"
                                            flexShrink={0}
                                        />
                                    ) : (
                                        <Flex
                                            boxSize="34px"
                                            borderRadius="full"
                                            bg="black"
                                            alignItems="center"
                                            justifyContent="center"
                                            flexShrink={0}
                                        >
                                            <Icon as={FaXTwitter} boxSize={3.5} color="white" />
                                        </Flex>
                                    )}
                                    <HStack spacing={1.5} flex={1} minW={0}>
                                        <Icon
                                            as={FaXTwitter}
                                            boxSize="11px"
                                            color="text.primary"
                                            opacity={0.5}
                                            flexShrink={0}
                                        />
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color="text.secondary"
                                            noOfLines={1}
                                        >
                                            @{xUsername}
                                        </Text>
                                    </HStack>
                                </HStack>
                            )}

                            {/* Connect X button (no X linked) */}
                            {!showWithdrawFirst && !xUsername && (
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
                                        opacity={0.55}
                                        _hover={{ opacity: 1 }}
                                        transition="opacity 0.15s ease"
                                    >
                                        <Icon as={FaXTwitter} boxSize={3.5} color="text.primary" />
                                        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                                            Sign in with X
                                        </Text>
                                    </HStack>

                                    {!isCryptoGame && (
                                        <>
                                            <HStack w="100%" spacing={3} align="center">
                                                <Box flex={1} h="1px" bg="border.lightGray" />
                                                <Text fontSize="xs" color="text.secondary" fontWeight="medium" opacity={0.6}>
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

                            {/* Buy-in input */}
                            {!showWithdrawFirst && (
                                <FormControl>
                                    <Flex alignItems="center" justifyContent="space-between" mb={1.5}>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="text.secondary"
                                            textTransform="none"
                                        >
                                            Buy-in amount
                                        </Text>
                                        {isCryptoGame && (
                                            <Box position="relative" width="140px" height="28px">
                                                <Box position="absolute" inset={0} bg="card.lightGray" borderRadius="full" />
                                                <Box
                                                    position="absolute"
                                                    top="3px"
                                                    left={inputUnit === 'chips' ? '3px' : 'calc(50% + 3px)'}
                                                    width="calc(50% - 6px)"
                                                    height="22px"
                                                    bg="card.white"
                                                    borderRadius="full"
                                                    boxShadow="sm"
                                                    transition="left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                                />
                                                <Flex position="relative" zIndex={1} alignItems="center" justifyContent="space-between" height="full">
                                                    <Box
                                                        as="button"
                                                        type="button"
                                                        flex="1"
                                                        height="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        onClick={() => setInputUnit('chips')}
                                                        background="transparent"
                                                    >
                                                        <Text fontSize="xs" fontWeight="semibold" color={inputUnit === 'chips' ? 'text.secondary' : 'text.muted'} whiteSpace="nowrap">
                                                            Chips
                                                        </Text>
                                                    </Box>
                                                    <Box
                                                        as="button"
                                                        type="button"
                                                        flex="1"
                                                        height="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor="pointer"
                                                        onClick={() => setInputUnit('usdc')}
                                                        background="transparent"
                                                    >
                                                        <Text fontSize="xs" fontWeight="semibold" color={inputUnit === 'usdc' ? 'text.secondary' : 'text.muted'} whiteSpace="nowrap">
                                                            USDC
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                            </Box>
                                        )}
                                    </Flex>
                                    <Box position="relative">
                                        <Input
                                            placeholder={isCryptoGame ? (inputUnit === 'usdc' ? 'Enter USDC' : 'Enter chips') : 'Buy-in amount'}
                                            type="number"
                                            variant="takeSeatModal"
                                            value={buyInInput}
                                            onChange={(e) => setBuyInInput(e.target.value)}
                                            pr="70px"
                                        />
                                        <Text
                                            position="absolute"
                                            right="16px"
                                            top="50%"
                                            transform="translateY(-50%)"
                                            fontSize="xs"
                                            color="text.muted"
                                            fontWeight="semibold"
                                            letterSpacing="0.02em"
                                            pointerEvents="none"
                                            textTransform="uppercase"
                                        >
                                            {isCryptoGame ? inputUnit : 'chips'}
                                        </Text>
                                    </Box>
                                    {isCryptoGame && (
                                        <Flex mt={2} alignItems="center" justifyContent="space-between" gap={2} fontSize="xs" color="text.secondary" fontWeight="medium" lineHeight="short">
                                            <Flex alignItems="center" gap={1}>
                                                <Text as="span" color="text.secondary">{CHIPS_PER_USDC} chips = 1 USDC</Text>
                                                <Image src="/usdc-logo.png" alt="USDC" boxSize="14px" loading="lazy" flexShrink={0} />
                                            </Flex>
                                        </Flex>
                                    )}
                                </FormControl>
                            )}

                            {/* USDC balance card (crypto only) */}
                            {!showWithdrawFirst && isCryptoGame && isConnected && usdcBalance && (
                                <Flex
                                    w="100%"
                                    bg="card.lightGray"
                                    borderRadius="xl"
                                    px={4}
                                    py={3}
                                    alignItems="center"
                                    gap={3}
                                >
                                    <Image src="/usdc-logo.png" alt="USDC" boxSize="32px" loading="lazy" flexShrink={0} />
                                    <VStack spacing={0} alignItems="flex-start">
                                        <Text fontSize="sm" fontWeight="semibold" color="text.secondary">
                                            {truncatedAddress}
                                        </Text>
                                        <Text fontSize="xs" color="text.muted">
                                            {usdcBalance} USDC
                                        </Text>
                                    </VStack>
                                </Flex>
                            )}
                        </VStack>
                    </Center>
                </Box>

                {/* Footer */}
                <Box px={7} pb={7} pt={2}>
                    <VStack w="100%" spacing={4}>
                        {/* Wallet sign-in placeholder (crypto, not connected) */}
                        {isCryptoGame && !isConnected && (
                            <Button
                                w="100%"
                                h="50px"
                                fontSize="sm"
                                fontWeight="bold"
                                borderRadius="bigButton"
                                bg="brand.navy"
                                _dark={{ bg: 'brand.lightGray', color: 'brand.darkNavy' }}
                                color="white"
                                border="none"
                                _hover={{ transform: 'translateY(-1px)' }}
                                transition="all 0.2s ease"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Wallet hint (crypto, not connected) */}
                        {isCryptoGame && !isConnected && (
                            <HStack spacing={2} alignItems="flex-start" bg="rgba(54, 163, 123, 0.12)" color="green.700" borderRadius="md" px={3} py={2} fontSize="xs" fontWeight="medium" width="100%">
                                <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                                <Text color="inherit" textAlign="left">
                                    Sign in with your wallet to join this crypto game.
                                </Text>
                            </HStack>
                        )}

                        {/* Insufficient balance warning */}
                        {isBalanceInsufficient && (
                            <HStack spacing={2} alignItems="flex-start" bg="red.50" color="red.700" borderRadius="md" px={3} py={2} fontSize="xs" fontWeight="medium" width="100%">
                                <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                                <Text color="inherit" textAlign="left">
                                    Insufficient USDC balance{usdcBalance ? ` (balance: ${usdcBalance} USDC)` : ''}.
                                </Text>
                            </HStack>
                        )}

                        {/* Withdraw button */}
                        {showWithdrawFirst && (
                            <Button
                                w="100%"
                                h="50px"
                                fontSize="md"
                                fontWeight="bold"
                                borderRadius="bigButton"
                                bg="brand.pink"
                                color="white"
                                border="none"
                                _hover={{ bg: 'brand.pink', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(255, 105, 135, 0.35)' }}
                                transition="all 0.2s ease"
                            >
                                Withdraw chips &amp; start fresh
                            </Button>
                        )}

                        {/* Join / Buy In button */}
                        {!showWithdrawFirst && (
                            <Button
                                w="100%"
                                h="50px"
                                fontSize="md"
                                fontWeight="bold"
                                borderRadius="bigButton"
                                bg={isJoinDisabled ? 'gray.300' : 'brand.green'}
                                color={isJoinDisabled ? 'gray.500' : 'white'}
                                border="none"
                                cursor={isJoinDisabled ? 'not-allowed' : 'pointer'}
                                _hover={isJoinDisabled ? {} : {
                                    bg: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 24px rgba(54, 163, 123, 0.35)',
                                }}
                                transition="all 0.2s ease"
                            >
                                {isCryptoGame ? 'Buy In' : 'Join Game'}
                            </Button>
                        )}

                        {/* Crypto fine print */}
                        {!showWithdrawFirst && isCryptoGame && (
                            <Text fontSize="2xs" color="text.muted" textAlign="center" lineHeight="short" px={2} opacity={0.7}>
                                Your USDC is deposited into the table contract and converted to chips.
                                Chip balances update after each settled hand. {CHIPS_PER_USDC} chips&nbsp;=&nbsp;1&nbsp;USDC.{' '}
                                <Link href="#" color="text.secondary" fontWeight="semibold" textDecoration="underline" textUnderlineOffset="2px">
                                    View contract
                                </Link>
                            </Text>
                        )}
                    </VStack>
                </Box>
            </Box>

            {/* Decorative blurs */}
            <Box position="absolute" top="-20px" right="-20px" width="120px" height="120px" borderRadius="50%" bg="brand.pink" opacity={0.08} filter="blur(40px)" pointerEvents="none" />
            <Box position="absolute" bottom="-30px" left="-30px" width="140px" height="140px" borderRadius="50%" bg="brand.green" opacity={0.08} filter="blur(50px)" pointerEvents="none" />
        </Box>
    );
};

// ── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
    title: 'Modals/TakeSeatModal',
    component: TakeSeatPreview,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Box p={8} minH="600px" display="flex" alignItems="center" justifyContent="center">
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
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Take Seat modal — the main entry point for joining a poker table. Crypto games show a USDC deposit flow with Chips/USDC toggle. Free games show a username input or X-linked identity. X-linked players see their avatar and @handle in a compact card.',
            },
        },
    },
} satisfies Meta<typeof TakeSeatPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

/** Crypto game with X account linked — avatar + @handle badge, USDC deposit flow. */
export const CryptoXLinked: Story = {
    name: 'Crypto — X linked',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA04...445b',
        isConnected: true,
    },
};

/** Crypto game, no X linked — shows Connect X button, no username input. */
export const CryptoNoX: Story = {
    name: 'Crypto — no X',
    args: {
        isCryptoGame: true,
        xUsername: null,
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
    },
};

/** Crypto game with X linked but no avatar image — fallback X circle. */
export const CryptoXNoAvatar: Story = {
    name: 'Crypto — X linked (no avatar)',
    args: {
        isCryptoGame: true,
        xUsername: 'stackedPoker',
        xProfileImageUrl: null,
        usdcBalance: '150.00',
        walletAddress: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        isConnected: true,
    },
};

/** Free game with X linked — avatar + @handle, no buy-in currency toggle. */
export const FreeXLinked: Story = {
    name: 'Free game — X linked',
    args: {
        isCryptoGame: false,
        xUsername: 'pokerShark',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg',
        isConnected: true,
    },
};

/** Free game, no X — shows Connect X button + username input with "or" divider. */
export const FreeNoX: Story = {
    name: 'Free game — no X',
    args: {
        isCryptoGame: false,
        xUsername: null,
        isConnected: true,
    },
};

/** Crypto game, wallet not connected — shows Sign In button + wallet hint. */
export const CryptoNotConnected: Story = {
    name: 'Crypto — wallet not connected',
    args: {
        isCryptoGame: true,
        xUsername: null,
        usdcBalance: null,
        walletAddress: null,
        isConnected: false,
    },
};

/** Crypto with existing chips — withdraw-first flow with warning banner. */
export const WithdrawFirst: Story = {
    name: 'Crypto — withdraw first',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '82.41',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        showWithdrawFirst: true,
        existingChipBalance: '5,000',
    },
};

/** Crypto with insufficient balance — error banner shown. */
export const InsufficientBalance: Story = {
    name: 'Crypto — insufficient balance',
    args: {
        isCryptoGame: true,
        xUsername: '0xVoxin',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        usdcBalance: '2.50',
        walletAddress: '0xFA0412345678901234567890123456789012445b',
        isConnected: true,
        isBalanceInsufficient: true,
    },
};
