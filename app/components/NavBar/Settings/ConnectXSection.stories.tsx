'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FaXTwitter } from 'react-icons/fa6';

/**
 * Visual-only preview of the ConnectXSection from GameSettings.
 * Bypasses useAuth / useConnectX so it renders in Storybook without providers.
 *
 * Two visual states:
 *  - Disconnected: clean "Link your X" card with a subhead, black Connect button.
 *  - Connected: compact inline card with avatar, @handle, green "Connected" pill,
 *    and subtle "Unlink" text link — matches the settings panel style.
 */
interface ConnectXPreviewProps {
    xUsername: string | null;
    xProfileImageUrl: string | null;
    isConnecting?: boolean;
    isDisconnecting?: boolean;
}

const ConnectXPreview: React.FC<ConnectXPreviewProps> = ({
    xUsername,
    xProfileImageUrl,
    isConnecting = false,
    isDisconnecting = false,
}) => {
    // Connected state — compact inline card
    if (xUsername) {
        return (
            <Box
                bg="card.white"
                borderRadius="16px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
            >
                <Flex align="center" gap={3}>
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

                    <Text
                        as="button"
                        fontSize="xs"
                        fontWeight="medium"
                        color="gray.400"
                        cursor="pointer"
                        bg="transparent"
                        border="none"
                        p={0}
                        flexShrink={0}
                        _hover={{ color: 'brand.pink' }}
                        transition="color 0.15s ease"
                    >
                        {isDisconnecting ? 'Unlinking…' : 'Unlink'}
                    </Text>
                </Flex>
            </Box>
        );
    }

    // Disconnected state — clean connect card with subhead
    return (
        <Box
            bg="card.white"
            borderRadius="16px"
            border="1px solid"
            borderColor="border.lightGray"
            p={{ base: 2.5, md: 3 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
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
                    borderRadius="10px"
                    fontWeight={700}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    letterSpacing="0.02em"
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #000000"
                    transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                    _hover={{ bg: '#0A0B12' }}
                    _active={{
                        bg: '#000000',
                        transform: 'translateY(1.5px)',
                        boxShadow:
                            'inset 0 2px 4px rgba(0,0,0,0.30), 0 0 0 #000000',
                    }}
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

const meta = {
    title: 'Settings/ConnectXSection',
    component: ConnectXPreview,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 420, padding: 16 }}>
                <Story />
            </div>
        ),
    ],
    argTypes: {
        xUsername: { control: 'text', description: 'Linked X username (null = not connected)' },
        xProfileImageUrl: { control: 'text', description: 'X profile image URL' },
        isConnecting: { control: 'boolean' },
        isDisconnecting: { control: 'boolean' },
    },
    args: {
        xUsername: null,
        xProfileImageUrl: null,
        isConnecting: false,
        isDisconnecting: false,
    },
    parameters: {
        docs: {
            description: {
                component:
                    'X account connection card at the top of GameSettings. Connected state is a compact inline card with avatar, @handle, green status pill, and "Unlink" link — matches the settings panel style. Disconnected state shows a clean card with "Link your X" prompt and black Connect button.',
            },
        },
    },
} satisfies Meta<typeof ConnectXPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No X account linked — light card with subhead, black "Connect" button with X icon. */
export const Disconnected: Story = {};

/** X account linked — compact inline card with avatar, green status pill, Unlink link. */
export const Connected: Story = {
    args: {
        xUsername: 'pokerShark',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    },
};

/** Connected but no profile image yet — falls back to black X logo circle. */
export const ConnectedNoAvatar: Story = {
    name: 'Connected — no avatar',
    args: {
        xUsername: 'stackedPoker',
        xProfileImageUrl: null,
    },
};

/** Connecting in progress — shows loading spinner on the Connect button. */
export const Connecting: Story = {
    args: {
        xUsername: null,
        xProfileImageUrl: null,
        isConnecting: true,
    },
};

/** Disconnecting in progress — shows "Unlinking..." on the Unlink link. */
export const Disconnecting: Story = {
    args: {
        xUsername: 'pokerShark',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        isDisconnecting: true,
    },
};

/** Connected with a long username — tests truncation behavior. */
export const LongUsername: Story = {
    name: 'Connected — long username',
    args: {
        xUsername: 'this_is_a_very_long_twitter_username',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg',
    },
};
