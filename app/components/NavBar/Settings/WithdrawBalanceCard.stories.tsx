'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Collapse,
    Flex,
    Text,
    HStack,
    Icon,
    Spinner,
    Image,
    Link,
    Divider,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { FaCoins, FaCrown, FaInfoCircle } from 'react-icons/fa';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';

const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = '/usdc-logo.png';

interface ShellProps {
    isOwner?: boolean;
    isUserSeated?: boolean;
    leaveAfterHandRequested?: boolean;
    settlementStuck?: boolean;
    isCheckingBalance?: boolean;
    isCheckingRake?: boolean;
    chipBalance?: number;
    rakeUsdc?: string;
    showError?: string | null;
    advancedDefaultOpen?: boolean;
}

const WithdrawBalanceShell = ({
    isOwner = false,
    isUserSeated = false,
    leaveAfterHandRequested = false,
    settlementStuck = false,
    isCheckingBalance = false,
    isCheckingRake = false,
    chipBalance = 0,
    rakeUsdc = '0.00',
    showError = null,
    advancedDefaultOpen = false,
}: ShellProps) => {
    const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure({
        defaultIsOpen: advancedDefaultOpen,
    });

    const formattedChipBalance = chipBalance.toLocaleString('en-US');
    const formattedUsdcValue = (chipBalance / CHIPS_PER_USDC).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const hasBalance = chipBalance > 0;
    const isWithdrawDisabled = isUserSeated || !hasBalance;
    const hasRake = parseFloat(rakeUsdc) > 0;

    return (
        <Flex
            direction="column"
            gap={{ base: 2, md: 2.5 }}
            w="100%"
            bg="card.white"
            borderRadius={{ base: '12px', md: '16px' }}
            border="2px solid"
            borderColor="border.lightGray"
            px={{ base: 3, sm: 4, md: 5 }}
            py={{ base: 2.5, sm: 3, md: 4 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
        >
            {/* Withdrawable Balance row */}
            <Flex align="center" w="100%" gap={{ base: 2, md: 3 }}>
                <Icon as={FaCoins} color="brand.yellow" boxSize={{ base: 3.5, md: 4 }} flexShrink={0} />
                <Text
                    fontSize={{ base: '2xs', md: 'xs' }}
                    fontWeight="semibold"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    flexShrink={0}
                >
                    Withdrawable
                </Text>
                {isCheckingBalance ? (
                    <HStack spacing={2} flex={1} minW={0}>
                        <Spinner size="xs" color="brand.yellow" thickness="2px" />
                        <Text fontSize="xs" color="text.muted" fontWeight="medium">
                            Checking…
                        </Text>
                    </HStack>
                ) : (
                    <HStack spacing={1.5} align="baseline" flex={1} minW={0}>
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="bold"
                            color="text.secondary"
                            lineHeight="1"
                        >
                            ${formattedUsdcValue}
                        </Text>
                        <HStack spacing={1} opacity={0.7}>
                            <Image src={USDC_LOGO_URL} alt="USDC" boxSize="11px" />
                            <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                                USDC
                            </Text>
                        </HStack>
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            opacity={0.5}
                            display={{ base: 'none', sm: 'inline' }}
                        >
                            · {formattedChipBalance} chips
                        </Text>
                    </HStack>
                )}
                {isUserSeated ? (
                    <LeaveSeatActionShell
                        isLeaveRequested={leaveAfterHandRequested}
                        settlementStuck={settlementStuck}
                    />
                ) : (
                    <Button
                        size={{ base: 'sm', md: 'md' }}
                        px={{ base: 4, md: 5 }}
                        h={{ base: '34px', sm: '36px', md: '40px' }}
                        bg="brand.yellow"
                        color="white"
                        border="none"
                        borderRadius={{ base: '10px', md: '12px' }}
                        fontWeight="bold"
                        fontSize={{ base: 'xs', md: 'sm' }}
                        letterSpacing="0.02em"
                        isDisabled={isWithdrawDisabled}
                        flexShrink={0}
                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B78900"
                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                        _hover={{ bg: 'brand.yellow' }}
                        _active={{
                            bg: 'brand.yellowDark',
                            transform: 'translateY(2px)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                        }}
                    >
                        Withdraw
                    </Button>
                )}
            </Flex>

            {isUserSeated && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(237, 137, 54, 0.12)"
                    color="orange.600"
                    _dark={{ bg: 'rgba(237, 137, 54, 0.15)', color: 'orange.300' }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} flexShrink={0} />
                    <Text color="inherit">
                        {settlementStuck
                            ? 'Settlement in progress — leave temporarily unavailable.'
                            : leaveAfterHandRequested
                              ? 'Leaving after this hand. Withdraw unlocks once you stand up.'
                              : 'Leave your seat to unlock withdraw.'}
                    </Text>
                </HStack>
            )}

            {showError && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(254, 178, 178, 0.12)"
                    color="red.700"
                    _dark={{ bg: 'rgba(254, 178, 178, 0.12)', color: 'red.300' }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                    <Text color="inherit">{showError}</Text>
                </HStack>
            )}

            {isOwner && (
                <>
                    <Divider borderColor="border.lightGray" />
                    <Flex align="center" w="100%" gap={{ base: 2, md: 3 }}>
                        <Icon as={FaCrown} color="brand.yellow" boxSize={{ base: 3.5, md: 4 }} flexShrink={0} />
                        <Tooltip
                            label="Earned from table fees on each settled hand"
                            placement="top"
                            hasArrow
                            fontSize="xs"
                            bg="gray.800"
                            color="white"
                            borderRadius="md"
                            px={3}
                            py={1.5}
                        >
                            <Text
                                fontSize={{ base: '2xs', md: 'xs' }}
                                fontWeight="semibold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                                cursor="help"
                                borderBottom="1px dashed"
                                borderColor="text.muted"
                                flexShrink={0}
                            >
                                Host Rewards
                            </Text>
                        </Tooltip>
                        {isCheckingRake ? (
                            <HStack spacing={2} flex={1} minW={0}>
                                <Spinner size="xs" color="brand.yellow" thickness="2px" />
                                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                                    Checking…
                                </Text>
                            </HStack>
                        ) : (
                            <HStack spacing={1.5} align="baseline" flex={1} minW={0}>
                                <Text
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight="bold"
                                    color="text.secondary"
                                    lineHeight="1"
                                >
                                    ${rakeUsdc}
                                </Text>
                                <HStack spacing={1} opacity={0.7}>
                                    <Image src={USDC_LOGO_URL} alt="USDC" boxSize="11px" />
                                    <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                                        USDC
                                    </Text>
                                </HStack>
                            </HStack>
                        )}
                        <Button
                            size={{ base: 'sm', md: 'md' }}
                            px={{ base: 4, md: 5 }}
                            h={{ base: '34px', sm: '36px', md: '40px' }}
                            bg="brand.yellow"
                            color="white"
                            border="none"
                            borderRadius={{ base: '10px', md: '12px' }}
                            fontWeight="bold"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            letterSpacing="0.02em"
                            isDisabled={!hasRake}
                            flexShrink={0}
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B78900"
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: 'brand.yellow' }}
                            _active={{
                                bg: 'brand.yellowDark',
                                transform: 'translateY(2px)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                            }}
                        >
                            Collect
                        </Button>
                    </Flex>
                </>
            )}

            <Divider borderColor="border.lightGray" />
            <Box>
                <Flex
                    as="button"
                    type="button"
                    onClick={onAdvancedToggle}
                    align="center"
                    justify="space-between"
                    w="100%"
                    py={1}
                    aria-expanded={isAdvancedOpen}
                    _hover={{ '& .advanced-label': { color: 'text.secondary' } }}
                >
                    <Text
                        className="advanced-label"
                        fontSize="2xs"
                        fontWeight="semibold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        transition="color 80ms ease"
                    >
                        Advanced
                    </Text>
                    <Icon
                        as={FiChevronDown}
                        boxSize={3.5}
                        color="text.muted"
                        transform={isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                        transition="transform 160ms ease"
                    />
                </Flex>
                <Collapse in={isAdvancedOpen} animateOpacity>
                    <Flex align="center" justify="space-between" w="100%" gap={3} pt={2}>
                        <Text fontSize="2xs" color="text.muted" lineHeight="1.4" opacity={0.85} flex={1} minW={0}>
                            Escape hatch if normal withdraw is unavailable.
                            Only enabled <strong>before the first hand</strong>{' '}
                            or <strong>24 hours after the last settlement</strong>.
                            Pulls your last-settled balance directly from the
                            contract. {CHIPS_PER_USDC}&nbsp;chips&nbsp;=&nbsp;1&nbsp;USDC.{' '}
                            <Link
                                href="https://sepolia.basescan.org/address/0x0"
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
                        <Button
                            px={2.5}
                            py={1.5}
                            h="auto"
                            minH={0}
                            borderRadius="8px"
                            fontSize="2xs"
                            fontWeight={700}
                            lineHeight="1.05"
                            whiteSpace="pre-line"
                            letterSpacing="0.02em"
                            bg="brand.pink"
                            color="white"
                            border="none"
                            flexShrink={0}
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: 'brand.pink' }}
                            _active={{
                                bg: 'brand.pinkDark',
                                transform: 'translateY(1.5px)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                            }}
                        >
                            {'Emergency\nWithdraw'}
                        </Button>
                    </Flex>
                </Collapse>
            </Box>
        </Flex>
    );
};

interface LeaveSeatActionShellProps {
    isLeaveRequested: boolean;
    settlementStuck: boolean;
}

const LeaveSeatActionShell = ({
    isLeaveRequested,
    settlementStuck,
}: LeaveSeatActionShellProps) => {
    const tooltipLabel = settlementStuck
        ? 'Settlement in progress — leave unavailable'
        : isLeaveRequested
          ? 'Cancel leave request'
          : 'Leave after this hand';

    return (
        <Tooltip
            label={tooltipLabel}
            placement="top"
            hasArrow
            fontSize="xs"
            bg="gray.800"
            color="white"
            borderRadius="md"
            px={2}
            py={1}
        >
            <Button
                size={{ base: 'sm', md: 'md' }}
                h={{ base: '34px', sm: '36px', md: '40px' }}
                px={{ base: 3.5, md: 4 }}
                borderRadius={{ base: '10px', md: '12px' }}
                fontWeight="bold"
                fontSize={{ base: 'xs', md: 'sm' }}
                letterSpacing="0.02em"
                flexShrink={0}
                leftIcon={<Icon as={FiLogOut} boxSize={{ base: 3.5, md: 4 }} />}
                iconSpacing={1.5}
                isDisabled={settlementStuck}
                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease"
                {...(isLeaveRequested
                    ? {
                          bg: 'brand.pink',
                          color: 'white',
                          border: 'none',
                          boxShadow:
                              'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #950839',
                          _hover: { bg: 'brand.pink' },
                          _active: {
                              bg: 'brand.pinkDark',
                              transform: 'translateY(2px)',
                              boxShadow:
                                  'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                          },
                      }
                    : {
                          bg: 'transparent',
                          color: 'brand.pink',
                          border: '2px solid',
                          borderColor: 'brand.pink',
                          boxShadow: 'none',
                          _hover: { bg: 'brand.pink', color: 'white' },
                          _active: {
                              bg: 'brand.pinkDark',
                              color: 'white',
                              transform: 'translateY(1px)',
                          },
                      })}
            >
                {isLeaveRequested ? 'Cancel leave' : 'Leave seat'}
            </Button>
        </Tooltip>
    );
};

const meta: Meta<typeof WithdrawBalanceShell> = {
    title: 'Settings/WithdrawBalanceCard (Proposed)',
    component: WithdrawBalanceShell,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Proposed compact layout: inline single-line rows for Withdrawable + Host Rewards, with Emergency Withdraw collapsed under an "Advanced" disclosure. Resting height ~104px (vs ~210px today).',
            },
        },
    },
    decorators: [
        (Story) => (
            <Box w={{ base: '320px', md: '560px' }} maxW="100%">
                <Story />
            </Box>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof WithdrawBalanceShell>;

export const EmptyPlayer: Story = {
    name: 'Player · empty balance',
    args: {
        isOwner: false,
        chipBalance: 0,
    },
};

export const PlayerWithBalance: Story = {
    name: 'Player · with balance',
    args: {
        isOwner: false,
        chipBalance: 1850,
    },
};

export const OwnerWithBoth: Story = {
    name: 'Owner · balance + rewards',
    args: {
        isOwner: true,
        chipBalance: 1850,
        rakeUsdc: '4.20',
    },
};

export const OwnerEmpty: Story = {
    name: 'Owner · both empty',
    args: {
        isOwner: true,
        chipBalance: 0,
        rakeUsdc: '0.00',
    },
};

export const Loading: Story = {
    name: 'Loading state',
    args: {
        isOwner: true,
        isCheckingBalance: true,
        isCheckingRake: true,
    },
};

export const SeatedIdle: Story = {
    name: 'Seated · Leave seat (idle)',
    args: {
        isOwner: false,
        isUserSeated: true,
        chipBalance: 1850,
    },
};

export const SeatedLeaveQueued: Story = {
    name: 'Seated · leave queued (Cancel)',
    args: {
        isOwner: false,
        isUserSeated: true,
        leaveAfterHandRequested: true,
        chipBalance: 1850,
    },
};

export const SeatedSettlementStuck: Story = {
    name: 'Seated · settlement stuck (disabled)',
    args: {
        isOwner: false,
        isUserSeated: true,
        settlementStuck: true,
        chipBalance: 1850,
    },
};

export const SeatedOwnerIdle: Story = {
    name: 'Seated owner · Leave + Collect',
    args: {
        isOwner: true,
        isUserSeated: true,
        chipBalance: 1850,
        rakeUsdc: '4.20',
    },
};

export const AdvancedExpanded: Story = {
    name: 'Advanced expanded',
    args: {
        isOwner: true,
        chipBalance: 1850,
        rakeUsdc: '4.20',
        advancedDefaultOpen: true,
    },
};

export const ErrorState: Story = {
    name: 'With error',
    args: {
        isOwner: false,
        chipBalance: 1850,
        showError: 'Transaction reverted. Check your wallet and try again.',
    },
};

export const Mobile: Story = {
    name: 'Mobile width',
    args: {
        isOwner: true,
        chipBalance: 1850,
        rakeUsdc: '4.20',
    },
    decorators: [
        (Story) => (
            <Box w="320px">
                <Story />
            </Box>
        ),
    ],
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
    },
};
