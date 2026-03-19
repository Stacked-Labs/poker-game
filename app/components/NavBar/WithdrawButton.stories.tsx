'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    DarkMode,
    Heading,
    HStack,
    Icon,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaCoins, FaInfoCircle } from 'react-icons/fa';

// ─── Constants & animations (mirrored from WithdrawButton) ───────────────────
const POLL_INTERVAL = 5;
const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = '/usdc-logo.png';
const CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ─── Props for the story-only wrapper ────────────────────────────────────────
interface WithdrawStoryProps {
    chipBalance: number;
    canWithdraw: boolean;
    isUserSeated: boolean;
    isLoading: boolean;
    status: 'idle' | 'checking' | 'withdrawing';
    error: string | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    /** When true, the modal opens automatically on mount. */
    autoOpenModal: boolean;
}

/**
 * Presentational replica of WithdrawButton + modal.
 * All state is controlled via props — no wallet, contract, or auth hooks needed.
 */
const WithdrawButtonStory = ({
    chipBalance,
    canWithdraw,
    isUserSeated,
    isLoading,
    status,
    error,
    isAuthenticated,
    isAuthenticating,
    autoOpenModal,
}: WithdrawStoryProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (autoOpenModal) onOpen();
    }, [autoOpenModal, onOpen]);

    const formattedChipBalance = chipBalance.toLocaleString('en-US');
    const formattedUsdcValue = (chipBalance / CHIPS_PER_USDC).toLocaleString(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );

    const isButtonDisabled =
        isUserSeated || isLoading || !canWithdraw || chipBalance === 0;

    const isPendingWithdraw =
        !canWithdraw && !isUserSeated && !isLoading && chipBalance > 0;

    // Live countdown for the pending-withdraw state
    const [countdown, setCountdown] = useState(POLL_INTERVAL);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPendingWithdraw && isOpen) {
            setCountdown(POLL_INTERVAL);
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => (prev <= 1 ? POLL_INTERVAL : prev - 1));
            }, 1000);
        }
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, [isPendingWithdraw, isOpen]);

    const getStatusMessage = () => {
        if (status === 'withdrawing') return 'Converting chips to USDC...';
        return 'Processing...';
    };

    return (
        <>
            <Tooltip
                label={
                    isUserSeated
                        ? 'Leave the table first to withdraw'
                        : 'Withdraw your chips'
                }
                placement="bottom"
                fontSize="xs"
                bg="brand.navy"
                color="white"
                borderRadius="md"
                px={2}
                py={1}
            >
                <Button
                    onClick={onOpen}
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width="auto"
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    bg="brand.yellow"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    fontWeight="semibold"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    leftIcon={
                        <Icon as={FaCoins} boxSize={{ base: 4, md: 5 }} />
                    }
                    iconSpacing={1.5}
                    filter={isUserSeated ? 'blur(1px)' : 'none'}
                    opacity={isUserSeated ? 0.6 : 1}
                    _hover={{
                        transform: isUserSeated ? 'none' : 'translateY(-2px)',
                        boxShadow: isUserSeated
                            ? 'none'
                            : '0 4px 12px rgba(253, 197, 29, 0.4)',
                        filter: isUserSeated ? 'blur(1px)' : 'none',
                    }}
                    transition="all 0.2s ease"
                >
                    Withdraw
                </Button>
            </Tooltip>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay
                    bg="rgba(0, 0, 0, 0.7)"
                    backdropFilter="blur(8px)"
                />
                <ModalContent
                    zIndex="modal"
                    borderRadius="32px"
                    maxWidth="420px"
                    minWidth="320px"
                    boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                    animation={`${slideUp} 0.4s ease-out`}
                    overflow="hidden"
                    position="relative"
                    border="1px solid"
                    borderColor="card.white"
                >
                    {/* Animated Gradient Border */}
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        borderRadius="32px"
                        padding="3px"
                        bgGradient="linear(to-r, brand.yellow, brand.green, brand.pink, brand.yellow)"
                        backgroundSize="200% 200%"
                        animation={`${gradientShift} 4s ease infinite`}
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

                    {/* Content Container */}
                    <Box position="relative" zIndex={1} bg="card.white">
                        <ModalCloseButton
                            color="text.secondary"
                            size="lg"
                            top={4}
                            right={4}
                            borderRadius="full"
                            _hover={{
                                bg: 'brand.lightGray',
                                transform: 'rotate(90deg)',
                            }}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        />

                        <ModalHeader textAlign="center" pt={10} pb={2}>
                            <Heading
                                as="h2"
                                fontSize="xl"
                                fontWeight="bold"
                                color="text.secondary"
                                letterSpacing="-0.02em"
                            >
                                Withdraw Chips
                            </Heading>
                        </ModalHeader>

                        <ModalBody px={8} pb={3} pt={0}>
                            <VStack spacing={3}>
                                {isLoading && status === 'checking' ? (
                                    <HStack
                                        bg="card.lightGray"
                                        borderRadius="12px"
                                        px={4}
                                        py={3}
                                        w="100%"
                                        spacing={3}
                                        justify="center"
                                    >
                                        <Spinner
                                            size="sm"
                                            color="brand.yellow"
                                            thickness="2px"
                                        />
                                        <Text
                                            fontSize="sm"
                                            color="text.muted"
                                            fontWeight="medium"
                                        >
                                            Checking balance...
                                        </Text>
                                    </HStack>
                                ) : (
                                    <>
                                        {/* Balance row */}
                                        <HStack
                                            bg="card.lightGray"
                                            borderRadius="12px"
                                            px={4}
                                            py={3}
                                            w="100%"
                                            justify="space-between"
                                            align="center"
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="text.muted"
                                                fontWeight="semibold"
                                                textTransform="uppercase"
                                                letterSpacing="0.04em"
                                            >
                                                Balance
                                            </Text>
                                            <VStack spacing={0} align="flex-end">
                                                <Text
                                                    fontSize="lg"
                                                    fontWeight="bold"
                                                    color="text.secondary"
                                                    lineHeight="short"
                                                >
                                                    {formattedChipBalance} chips
                                                </Text>
                                                <HStack spacing={1}>
                                                    <Image
                                                        src={USDC_LOGO_URL}
                                                        alt="USDC"
                                                        boxSize="12px"
                                                    />
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.muted"
                                                        fontWeight="medium"
                                                    >
                                                        {formattedUsdcValue}{' '}
                                                        USDC
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {!isAuthenticated && (
                                            <HStack
                                                spacing={2}
                                                alignItems="flex-start"
                                                bg="rgba(54, 163, 123, 0.12)"
                                                color="green.700"
                                                borderRadius="md"
                                                px={3}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="medium"
                                                width="100%"
                                            >
                                                <Icon
                                                    as={FaInfoCircle}
                                                    boxSize={3.5}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    color="inherit"
                                                    textAlign="left"
                                                >
                                                    {isAuthenticating
                                                        ? 'Check your wallet to sign the message\u2026'
                                                        : 'Sign the message in your wallet to continue.'}
                                                </Text>
                                            </HStack>
                                        )}

                                        {isUserSeated && (
                                            <HStack
                                                spacing={2}
                                                alignItems="flex-start"
                                                bg="rgba(237, 137, 54, 0.12)"
                                                color="orange.600"
                                                _dark={{
                                                    bg: 'rgba(237, 137, 54, 0.15)',
                                                    color: 'orange.300',
                                                }}
                                                borderRadius="md"
                                                px={3}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="medium"
                                                width="100%"
                                            >
                                                <Icon
                                                    as={FaInfoCircle}
                                                    boxSize={3.5}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    color="inherit"
                                                    textAlign="left"
                                                >
                                                    You must leave the table
                                                    before withdrawing.
                                                </Text>
                                            </HStack>
                                        )}

                                        {isPendingWithdraw && (
                                                <HStack
                                                    spacing={2}
                                                    alignItems="flex-start"
                                                    bg="rgba(237, 137, 54, 0.12)"
                                                    color="orange.600"
                                                    _dark={{
                                                        bg: 'rgba(237, 137, 54, 0.15)',
                                                        color: 'orange.300',
                                                    }}
                                                    borderRadius="md"
                                                    px={3}
                                                    py={2}
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    width="100%"
                                                >
                                                    <Icon
                                                        as={FaInfoCircle}
                                                        boxSize={3.5}
                                                        mt={0.5}
                                                    />
                                                    <Text
                                                        color="inherit"
                                                        textAlign="left"
                                                    >
                                                        Updating your balance, this
                                                        should only take a moment...
                                                    </Text>
                                                </HStack>
                                            )}

                                        {error && (
                                            <HStack
                                                spacing={2}
                                                alignItems="flex-start"
                                                bg="red.50"
                                                color="red.700"
                                                _dark={{
                                                    bg: 'rgba(254, 178, 178, 0.12)',
                                                    color: 'red.300',
                                                }}
                                                borderRadius="md"
                                                px={3}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="medium"
                                                width="100%"
                                            >
                                                <Icon
                                                    as={FaInfoCircle}
                                                    boxSize={3.5}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    color="inherit"
                                                    textAlign="left"
                                                    wordBreak="break-word"
                                                >
                                                    {error}
                                                </Text>
                                            </HStack>
                                        )}
                                    </>
                                )}
                            </VStack>
                        </ModalBody>

                        <ModalFooter px={8} pb={6} pt={1}>
                            <VStack w="100%" spacing={3}>
                            <Box position="relative" w="100%">
                                <Button
                                    w="100%"
                                    h="56px"
                                    fontSize="md"
                                    fontWeight="bold"
                                    borderRadius="bigButton"
                                    bg={
                                        isPendingWithdraw || isButtonDisabled
                                            ? 'gray.300'
                                            : 'brand.yellow'
                                    }
                                    color={
                                        isPendingWithdraw
                                            ? 'brand.yellow'
                                            : isButtonDisabled
                                              ? 'gray.500'
                                              : 'white'
                                    }
                                    border={isPendingWithdraw ? '2px solid' : 'none'}
                                    borderColor={isPendingWithdraw ? 'brand.yellow' : 'transparent'}
                                    opacity={isButtonDisabled || isPendingWithdraw ? 0.6 : 1}
                                    isDisabled={isButtonDisabled && !isPendingWithdraw}
                                    isLoading={
                                        isLoading && status === 'withdrawing'
                                    }
                                    loadingText={getStatusMessage()}
                                    cursor={isPendingWithdraw ? 'default' : undefined}
                                    _disabled={{
                                        bg: 'gray.300',
                                        color: 'gray.500',
                                        cursor: 'not-allowed',
                                        opacity: 0.6,
                                    }}
                                    position="relative"
                                    overflow="hidden"
                                    _before={{
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        bg: isPendingWithdraw
                                            ? 'none'
                                            : 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)',
                                        transform: 'translateX(-100%)',
                                        transition: 'transform 0.6s',
                                        opacity: isButtonDisabled ? 0 : 1,
                                    }}
                                    _hover={
                                        isPendingWithdraw
                                            ? { bg: 'gray.300' }
                                            : isButtonDisabled
                                              ? {}
                                              : {
                                                    bg: 'brand.yellow',
                                                    transform:
                                                        'translateY(-2px)',
                                                    boxShadow:
                                                        '0 12px 24px rgba(253, 197, 29, 0.35)',
                                                    _before: {
                                                        transform:
                                                            'translateX(100%)',
                                                    },
                                                }
                                    }
                                    _active={{
                                        transform:
                                            isButtonDisabled || isPendingWithdraw
                                                ? 'none'
                                                : 'translateY(0)',
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    {isPendingWithdraw ? (
                                        <HStack spacing={2} zIndex={1}>
                                            <Spinner
                                                size="xs"
                                                color="gray.500"
                                                thickness="2px"
                                            />
                                            <Text color="gray.500">
                                                Checking in {countdown}s...
                                            </Text>
                                        </HStack>
                                    ) : (
                                        'Withdraw'
                                    )}
                                    {isPendingWithdraw && (
                                        <Box
                                            position="absolute"
                                            bottom={0}
                                            left={0}
                                            h="3px"
                                            bg="brand.yellow"
                                            transition="width 1s linear"
                                            w={`${(countdown / POLL_INTERVAL) * 100}%`}
                                        />
                                    )}
                                </Button>
                            </Box>
                                <Text
                                    fontSize="2xs"
                                    color="text.muted"
                                    textAlign="center"
                                    lineHeight="short"
                                    px={2}
                                    opacity={0.7}
                                >
                                    {isUserSeated
                                        ? 'Leave the table before withdrawing. Your on-chain chip balance reflects the last settled hand.'
                                        : 'Your on-chain chip balance reflects the last settled hand. Chips are held by the table contract and returned as USDC upon withdrawal.'}
                                    {' '}
                                    {CHIPS_PER_USDC}{' '}
                                    chips&nbsp;=&nbsp;1&nbsp;USDC.
                                    {' '}
                                    <Link
                                        href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
                                        isExternal
                                        color="brand.navy"
                                        _dark={{ color: 'brand.lightGray' }}
                                        fontWeight="semibold"
                                        textDecoration="underline"
                                        textUnderlineOffset="2px"
                                    >
                                        View contract
                                    </Link>
                                </Text>
                            </VStack>
                        </ModalFooter>
                    </Box>

                    {/* Decorative Background Elements */}
                    <Box
                        position="absolute"
                        top="-20px"
                        right="-20px"
                        width="120px"
                        height="120px"
                        borderRadius="50%"
                        bg="brand.yellow"
                        opacity={0.08}
                        filter="blur(40px)"
                        pointerEvents="none"
                    />
                    <Box
                        position="absolute"
                        bottom="-30px"
                        left="-30px"
                        width="140px"
                        height="140px"
                        borderRadius="50%"
                        bg="brand.green"
                        opacity={0.08}
                        filter="blur(50px)"
                        pointerEvents="none"
                    />
                </ModalContent>
            </Modal>
        </>
    );
};

// ─── Meta ────────────────────────────────────────────────────────────────────
const meta = {
    title: 'Components/WithdrawButton',
    component: WithdrawButtonStory,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <Box
                p={6}
                bg="brand.darkNavy"
                minH="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Story />
            </Box>
        ),
    ],
    argTypes: {
        chipBalance: {
            control: { type: 'number', min: 0, step: 100 },
            description: 'Chip balance held in the contract',
        },
        canWithdraw: {
            control: 'boolean',
            description: 'Whether the contract allows withdrawal right now',
        },
        isUserSeated: {
            control: 'boolean',
            description: 'Whether the user is currently seated at the table',
        },
        isLoading: {
            control: 'boolean',
            description: 'Whether a withdraw/check operation is in progress',
        },
        status: {
            control: { type: 'select' },
            options: ['idle', 'checking', 'withdrawing'],
            description: 'Current operation status',
        },
        error: {
            control: 'text',
            description: 'Error message to display (null = no error)',
        },
        isAuthenticated: {
            control: 'boolean',
            description: 'Whether the user has signed the auth message',
        },
        isAuthenticating: {
            control: 'boolean',
            description: 'Whether auth signature is pending in wallet',
        },
        autoOpenModal: {
            control: 'boolean',
            description: 'Automatically open the modal on render',
        },
    },
    args: {
        chipBalance: 5000,
        canWithdraw: true,
        isUserSeated: false,
        isLoading: false,
        status: 'idle',
        error: null,
        isAuthenticated: true,
        isAuthenticating: false,
        autoOpenModal: false,
    },
} satisfies Meta<typeof WithdrawButtonStory>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

/** Default state — button only. Click to open the withdraw modal. */
export const Default: Story = {};

/** Modal open with a standard 5,000 chip balance (50.00 USDC). */
export const ModalOpen: Story = {
    args: { autoOpenModal: true },
};

/** Large balance — 250,000 chips (2,500.00 USDC). */
export const LargeBalance: Story = {
    args: { chipBalance: 250000, autoOpenModal: true },
};

/** Zero balance — withdraw button disabled. */
export const ZeroBalance: Story = {
    args: { chipBalance: 0, canWithdraw: false, autoOpenModal: true },
};

/** User is seated — button blurred, orange warning in modal. */
export const UserSeated: Story = {
    args: { isUserSeated: true, autoOpenModal: true },
};

/** Checking balance — spinner shown in modal body. */
export const CheckingBalance: Story = {
    args: { isLoading: true, status: 'checking', autoOpenModal: true },
};

/** Withdrawal in progress — button shows loading spinner. */
export const Withdrawing: Story = {
    args: { isLoading: true, status: 'withdrawing', autoOpenModal: true },
};

/** Cannot withdraw — waiting for hand to settle. */
export const CannotWithdraw: Story = {
    args: {
        canWithdraw: false,
        chipBalance: 3000,
        autoOpenModal: true,
    },
};

/** Error state — transaction reverted message. */
export const WithError: Story = {
    args: {
        error: 'Transaction reverted: insufficient contract balance.',
        autoOpenModal: true,
    },
};

/** Needs authentication — sign message prompt. */
export const NeedsAuth: Story = {
    args: {
        isAuthenticated: false,
        isAuthenticating: false,
        autoOpenModal: true,
    },
};

/** Authenticating — waiting for wallet signature. */
export const Authenticating: Story = {
    args: {
        isAuthenticated: false,
        isAuthenticating: true,
        autoOpenModal: true,
    },
};

/** Dark mode variant with modal open. */
export const Dark: Story = {
    args: { autoOpenModal: true },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
    ],
};

/**
 * Playground — all controls active. Use the Controls panel to toggle
 * every prop and see how the component responds.
 */
export const Playground: Story = {
    name: 'Playground — all controls',
    args: { autoOpenModal: true },
};
