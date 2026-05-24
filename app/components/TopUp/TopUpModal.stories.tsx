'use client';

import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    DarkMode,
    HStack,
    Icon,
    Image,
    Input,
    InputGroup,
    InputLeftAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { FaApple, FaGoogle, FaInfoCircle, FaArrowDown } from 'react-icons/fa';
import { SiVisa } from 'react-icons/si';

/**
 * Presentational replica of `TopUpModal` for visual review.
 *
 * The real modal renders thirdweb's `<BridgeWidget>`, a third-party iframe
 * with two tabs: **Swap** (cross-chain crypto-to-USDC) and **Buy** (fiat
 * onramp). Storybook can't run that widget against a live wallet or
 * onramp, so this replica mirrors the *chrome and tab structure* we
 * actually control — tab switcher, prefilled buy target, source/sell
 * picker, and the four lifecycle states.
 */

type ReplicaState = 'idle' | 'loading' | 'success' | 'error';
type ReplicaTab = 'swap' | 'buy';

interface TopUpModalStoryProps {
    amountUsdc?: string;
    state: ReplicaState;
    defaultTab: ReplicaTab;
    autoOpenModal: boolean;
}

const TopUpModalReplica: React.FC<TopUpModalStoryProps> = ({
    amountUsdc = '10.00',
    state,
    defaultTab,
    autoOpenModal,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [tab, setTab] = useState<ReplicaTab>(defaultTab);

    useEffect(() => {
        setTab(defaultTab);
    }, [defaultTab]);

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
                            Swap any crypto or pay by card — settles on Base
                        </Text>
                    </ModalHeader>

                    <ModalBody pb={8}>
                        <VStack spacing={4} align="stretch">
                            {/* Tab switcher — the BridgeWidget's defining feature */}
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
                                    bg={tab === 'swap' ? 'white' : 'transparent'}
                                    color={
                                        tab === 'swap'
                                            ? 'text.secondary'
                                            : 'text.muted'
                                    }
                                    fontWeight={tab === 'swap' ? 700 : 600}
                                    borderRadius="8px"
                                    boxShadow={
                                        tab === 'swap'
                                            ? '0 1px 2px rgba(0,0,0,0.06)'
                                            : 'none'
                                    }
                                    onClick={() => setTab('swap')}
                                    leftIcon={<Icon as={FaArrowDown} boxSize={3} />}
                                >
                                    Swap
                                </Button>
                                <Button
                                    flex={1}
                                    size="sm"
                                    bg={tab === 'buy' ? 'white' : 'transparent'}
                                    color={
                                        tab === 'buy'
                                            ? 'text.secondary'
                                            : 'text.muted'
                                    }
                                    fontWeight={tab === 'buy' ? 700 : 600}
                                    borderRadius="8px"
                                    boxShadow={
                                        tab === 'buy'
                                            ? '0 1px 2px rgba(0,0,0,0.06)'
                                            : 'none'
                                    }
                                    onClick={() => setTab('buy')}
                                    leftIcon={<Icon as={SiVisa} boxSize={4} />}
                                >
                                    Buy
                                </Button>
                            </HStack>

                            {/* Tab body */}
                            {tab === 'swap' && state === 'idle' && (
                                <VStack spacing={3} align="stretch">
                                    <Text
                                        fontSize="2xs"
                                        color="text.muted"
                                        textTransform="uppercase"
                                        fontWeight={700}
                                        letterSpacing="0.04em"
                                    >
                                        You pay
                                    </Text>
                                    <HStack
                                        w="100%"
                                        p={3}
                                        bg="card.lightGray"
                                        borderRadius="12px"
                                        spacing={2}
                                    >
                                        <Select
                                            size="sm"
                                            variant="filled"
                                            bg="white"
                                            defaultValue="eth-arb"
                                        >
                                            <option value="eth-arb">
                                                ETH · Arbitrum
                                            </option>
                                            <option value="usdc-eth">
                                                USDC · Ethereum
                                            </option>
                                            <option value="usdc-poly">
                                                USDC · Polygon
                                            </option>
                                        </Select>
                                        <Input
                                            size="sm"
                                            bg="white"
                                            placeholder="0.0"
                                            textAlign="right"
                                            fontWeight={700}
                                        />
                                    </HStack>

                                    <HStack
                                        justify="center"
                                        py={1}
                                        color="text.muted"
                                    >
                                        <Icon as={FaArrowDown} boxSize={3} />
                                    </HStack>

                                    <Text
                                        fontSize="2xs"
                                        color="text.muted"
                                        textTransform="uppercase"
                                        fontWeight={700}
                                        letterSpacing="0.04em"
                                    >
                                        You receive
                                    </Text>
                                    <HStack
                                        w="100%"
                                        p={3}
                                        bg="card.lightGray"
                                        borderRadius="12px"
                                        spacing={2}
                                    >
                                        <HStack flex={1}>
                                            <Image
                                                src="/usdc-logo.png"
                                                alt="USDC"
                                                boxSize="16px"
                                            />
                                            <Text fontWeight={700} fontSize="sm">
                                                USDC · Base
                                            </Text>
                                        </HStack>
                                        <Text fontWeight={700} color="text.muted">
                                            ~{amountUsdc}
                                        </Text>
                                    </HStack>

                                    <Button
                                        size="md"
                                        colorScheme="green"
                                        mt={1}
                                    >
                                        Swap to USDC
                                    </Button>
                                </VStack>
                            )}

                            {tab === 'buy' && state === 'idle' && (
                                <VStack spacing={3} align="stretch">
                                    <Text
                                        fontSize="2xs"
                                        color="text.muted"
                                        textTransform="uppercase"
                                        fontWeight={700}
                                        letterSpacing="0.04em"
                                    >
                                        Buying
                                    </Text>
                                    <HStack
                                        w="100%"
                                        p={3}
                                        bg="card.lightGray"
                                        borderRadius="12px"
                                        spacing={2}
                                    >
                                        <HStack flex={1}>
                                            <Image
                                                src="/usdc-logo.png"
                                                alt="USDC"
                                                boxSize="16px"
                                            />
                                            <Text fontWeight={700} fontSize="sm">
                                                USDC · Base
                                            </Text>
                                        </HStack>
                                        <InputGroup size="sm" maxW="140px">
                                            <InputLeftAddon
                                                bg="white"
                                                borderColor="transparent"
                                                fontSize="sm"
                                                fontWeight={700}
                                            >
                                                $
                                            </InputLeftAddon>
                                            <Input
                                                bg="white"
                                                defaultValue={amountUsdc}
                                                textAlign="right"
                                                fontWeight={700}
                                            />
                                        </InputGroup>
                                    </HStack>

                                    <VStack
                                        w="100%"
                                        spacing={2}
                                        align="stretch"
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
                                        {tab === 'swap'
                                            ? 'Routing your swap…'
                                            : 'Processing payment…'}
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
                                    <Icon
                                        as={FaInfoCircle}
                                        boxSize={3.5}
                                        mt={0.5}
                                    />
                                    <Text fontSize="xs" fontWeight={600}>
                                        Done — USDC arrived on Base.
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
                                        {tab === 'swap'
                                            ? 'No route found for that token pair. Try a different source.'
                                            : 'Payment failed. Try a different card or switch to Swap.'}
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
        defaultTab: {
            control: { type: 'select' },
            options: ['swap', 'buy'],
            description:
                'Which BridgeWidget tab is active. Real widget defaults to Swap.',
        },
        autoOpenModal: { control: 'boolean' },
    },
    args: {
        amountUsdc: '10.00',
        state: 'idle',
        defaultTab: 'swap',
        autoOpenModal: false,
    },
} satisfies Meta<typeof TopUpModalReplica>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Modal open — Swap tab (the BridgeWidget default). */
export const ModalOpenSwap: Story = {
    args: { autoOpenModal: true, defaultTab: 'swap' },
};

/** Modal open — Buy tab (fiat onramp options). */
export const ModalOpenBuy: Story = {
    args: { autoOpenModal: true, defaultTab: 'buy' },
};

/** Loading — routing a swap or processing a card payment. */
export const Loading: Story = {
    args: { autoOpenModal: true, state: 'loading' },
};

/** Success — USDC arrived on Base. */
export const Success: Story = {
    args: { autoOpenModal: true, state: 'success' },
};

/** Error — swap-no-route or card-failed copy depending on the active tab. */
export const ErrorState: Story = {
    args: { autoOpenModal: true, state: 'error' },
};

/** Large amount pre-fill — e.g. a $250 buy-in. */
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
