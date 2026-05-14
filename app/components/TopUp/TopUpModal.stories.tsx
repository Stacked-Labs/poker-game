'use client';

import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    DarkMode,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody,
    HStack,
    Icon,
    Image,
    Spinner,
    Text,
    VStack,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import { FaApple, FaInfoCircle, FaGoogle } from 'react-icons/fa';
import { SiVisa } from 'react-icons/si';

/**
 * Presentational replica of `TopUpModal` for visual review.
 *
 * The real modal renders thirdweb's `<BuyWidget>` which is a third-party
 * iframe whose internals we don't own. Storybook can't pre-fund a wallet
 * or hit a live onramp, so this replica reproduces the *modal chrome and
 * empty/loading/success/error states* we control — title, footer copy,
 * the inline amount the caller passes in. The widget body is represented
 * as a tabbed mock so you can review layout decisions without needing a
 * real BuyWidget render.
 */

type ReplicaState = 'idle' | 'loading' | 'success' | 'error';

interface TopUpModalStoryProps {
    amountUsdc?: string;
    state: ReplicaState;
    autoOpenModal: boolean;
}

const TopUpModalReplica: React.FC<TopUpModalStoryProps> = ({
    amountUsdc = '10.00',
    state,
    autoOpenModal,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (autoOpenModal) onOpen();
    }, [autoOpenModal, onOpen]);

    return (
        <>
            <Button onClick={onOpen} colorScheme="green" variant="solid">
                Open Top Up Modal
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(8px)" />
                <ModalContent
                    bg="card.white"
                    borderRadius="24px"
                    maxW="420px"
                    overflow="hidden"
                    position="relative"
                >
                    <ModalCloseButton zIndex={2} />
                    <ModalHeader textAlign="center" pt={8} pb={2}>
                        <Text fontSize="lg" fontWeight={700}>
                            Top up USDC
                        </Text>
                        <Text
                            fontSize="xs"
                            color="text.muted"
                            fontWeight="medium"
                            mt={1}
                        >
                            Pay with card or any crypto on any chain
                        </Text>
                    </ModalHeader>

                    <ModalBody pb={8}>
                        <VStack spacing={4}>
                            <HStack
                                w="100%"
                                p={3}
                                bg="card.lightGray"
                                borderRadius="12px"
                                justify="space-between"
                            >
                                <Text
                                    fontSize="xs"
                                    color="text.muted"
                                    textTransform="uppercase"
                                    fontWeight={700}
                                    letterSpacing="0.04em"
                                >
                                    Buying
                                </Text>
                                <HStack spacing={1}>
                                    <Image
                                        src="/usdc-logo.png"
                                        alt="USDC"
                                        boxSize="14px"
                                    />
                                    <Text fontWeight={700}>
                                        {amountUsdc} USDC
                                    </Text>
                                </HStack>
                            </HStack>

                            {/* Mock tabs */}
                            <HStack
                                w="100%"
                                bg="card.lightGray"
                                borderRadius="12px"
                                p={1}
                                spacing={1}
                            >
                                <Button
                                    flex={1}
                                    size="sm"
                                    bg="white"
                                    color="text.secondary"
                                    fontWeight={700}
                                    borderRadius="8px"
                                    leftIcon={<Icon as={SiVisa} boxSize={4} />}
                                >
                                    Card
                                </Button>
                                <Button
                                    flex={1}
                                    size="sm"
                                    bg="transparent"
                                    color="text.muted"
                                    fontWeight={600}
                                    borderRadius="8px"
                                >
                                    Crypto
                                </Button>
                            </HStack>

                            {/* Body — varies by state */}
                            {state === 'idle' && (
                                <VStack
                                    w="100%"
                                    spacing={2}
                                    align="stretch"
                                    py={2}
                                >
                                    <Button
                                        size="md"
                                        variant="outline"
                                        leftIcon={
                                            <Icon as={FaApple} boxSize={4} />
                                        }
                                    >
                                        Pay with Apple Pay
                                    </Button>
                                    <Button
                                        size="md"
                                        variant="outline"
                                        leftIcon={
                                            <Icon as={FaGoogle} boxSize={3.5} />
                                        }
                                    >
                                        Pay with Google Pay
                                    </Button>
                                    <Button
                                        size="md"
                                        variant="outline"
                                        leftIcon={
                                            <Icon as={SiVisa} boxSize={4} />
                                        }
                                    >
                                        Pay with credit card
                                    </Button>
                                </VStack>
                            )}

                            {state === 'loading' && (
                                <HStack
                                    w="100%"
                                    py={6}
                                    justify="center"
                                    spacing={3}
                                >
                                    <Spinner size="sm" color="brand.green" />
                                    <Text fontSize="sm" color="text.muted">
                                        Processing payment…
                                    </Text>
                                </HStack>
                            )}

                            {state === 'success' && (
                                <HStack
                                    w="100%"
                                    p={3}
                                    bg="rgba(54, 163, 123, 0.12)"
                                    color="green.700"
                                    borderRadius="md"
                                    spacing={2}
                                    align="flex-start"
                                >
                                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                                    <Text fontSize="xs" fontWeight={600}>
                                        Payment complete — USDC arrived on Base.
                                    </Text>
                                </HStack>
                            )}

                            {state === 'error' && (
                                <HStack
                                    w="100%"
                                    p={3}
                                    bg="red.50"
                                    color="red.700"
                                    borderRadius="md"
                                    spacing={2}
                                    align="flex-start"
                                >
                                    <Icon
                                        as={FaInfoCircle}
                                        boxSize={3.5}
                                        mt={0.5}
                                    />
                                    <Text fontSize="xs" fontWeight={600}>
                                        Payment failed. Try a different card or
                                        switch to the Crypto tab.
                                    </Text>
                                </HStack>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

const meta = {
    title: 'Components/TopUp/TopUpModal',
    component: TopUpModalReplica,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box p={6} bg="brand.darkNavy" minH="200px">
                <Story />
            </Box>
        ),
    ],
    argTypes: {
        amountUsdc: { control: 'text' },
        state: {
            control: { type: 'select' },
            options: ['idle', 'loading', 'success', 'error'],
        },
        autoOpenModal: { control: 'boolean' },
    },
    args: {
        amountUsdc: '10.00',
        state: 'idle',
        autoOpenModal: false,
    },
} satisfies Meta<typeof TopUpModalReplica>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ModalOpen: Story = {
    args: { autoOpenModal: true },
};

export const Loading: Story = {
    args: { autoOpenModal: true, state: 'loading' },
};

export const Success: Story = {
    args: { autoOpenModal: true, state: 'success' },
};

export const Error: Story = {
    args: { autoOpenModal: true, state: 'error' },
};

export const LargeAmount: Story = {
    args: { autoOpenModal: true, amountUsdc: '250.00' },
};

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
