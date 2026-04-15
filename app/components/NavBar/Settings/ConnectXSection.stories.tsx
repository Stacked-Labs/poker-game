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
 * Visual-only preview of the redesigned ConnectXSection from GameSettings.
 * Bypasses useAuth / useConnectX so it renders in Storybook without providers.
 *
 * Two visual states:
 *  - Disconnected: clean "Link your X" card with a subhead, black Connect button.
 *  - Connected: premium dark gradient card with large avatar + green ring,
 *    "Connected" pill, subtle "Unlink" text link.
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
    // Connected state — premium dark gradient card
    if (xUsername) {
        return (
            <Box
                position="relative"
                borderRadius="18px"
                overflow="hidden"
                bgGradient="linear(135deg, #0B1430 0%, #111a3d 45%, #1a1030 100%)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                boxShadow="0 10px 30px rgba(11, 20, 48, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                p={{ base: 3, md: 4 }}
            >
                <Box
                    position="absolute"
                    top="-30px"
                    right="-30px"
                    w="120px"
                    h="120px"
                    bg="radial-gradient(circle, rgba(54, 163, 123, 0.22) 0%, transparent 70%)"
                    pointerEvents="none"
                />

                <Flex align="center" gap={{ base: 3, md: 4 }} position="relative">
                    <Box position="relative" flexShrink={0}>
                        <Box
                            position="absolute"
                            inset="-3px"
                            borderRadius="full"
                            border="2px solid"
                            borderColor="brand.green"
                            opacity={0.55}
                        />
                        {xProfileImageUrl ? (
                            <Image
                                src={xProfileImageUrl}
                                alt="X avatar"
                                boxSize={{ base: '48px', md: '56px' }}
                                borderRadius="full"
                                objectFit="cover"
                                border="2px solid"
                                borderColor="rgba(11, 20, 48, 0.9)"
                            />
                        ) : (
                            <Box
                                boxSize={{ base: '48px', md: '56px' }}
                                borderRadius="full"
                                bg="black"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="2px solid"
                                borderColor="rgba(11, 20, 48, 0.9)"
                            >
                                <Icon as={FaXTwitter} boxSize={5} color="white" />
                            </Box>
                        )}
                    </Box>

                    <VStack spacing={1} align="flex-start" flex={1} minWidth={0}>
                        <HStack spacing={1.5}>
                            <Icon as={FaXTwitter} boxSize={3} color="whiteAlpha.700" />
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                fontWeight="bold"
                                color="white"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW={{ base: '150px', md: '200px' }}
                            >
                                @{xUsername}
                            </Text>
                        </HStack>
                        <HStack spacing={3}>
                            <HStack
                                spacing={1.5}
                                bg="rgba(54, 163, 123, 0.12)"
                                borderRadius="full"
                                px={2}
                                py={0.5}
                            >
                                <Box
                                    boxSize="6px"
                                    borderRadius="full"
                                    bg="brand.green"
                                    boxShadow="0 0 6px rgba(54, 163, 123, 0.6)"
                                />
                                <Text
                                    fontSize="xs"
                                    color="brand.green"
                                    fontWeight="semibold"
                                >
                                    Connected
                                </Text>
                            </HStack>
                            <Text
                                as="button"
                                fontSize="xs"
                                fontWeight="medium"
                                color="whiteAlpha.500"
                                cursor="pointer"
                                bg="transparent"
                                border="none"
                                p={0}
                                _hover={{
                                    color: 'brand.pink',
                                }}
                                transition="color 0.15s ease"
                            >
                                {isDisconnecting ? 'Unlinking…' : 'Unlink'}
                            </Text>
                        </HStack>
                    </VStack>
                </Flex>
            </Box>
        );
    }

    // Disconnected state — clean connect card with subhead
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
                            opacity={0.7}
                            whiteSpace="nowrap"
                            lineHeight="1.2"
                        >
                            Show avatar &amp; handle at the table
                        </Text>
                    </VStack>
                </HStack>
                <Button
                    size="sm"
                    bg="#000"
                    color="white"
                    borderRadius="8px"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    _hover={{ bg: '#1a1a1a', transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
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
                    'X account connection card shown at the top of GameSettings. Redesigned for premium gaming aesthetic: dark gradient card + green ring + "Connected" pill badge when linked, clean light card with subhead when not linked.',
            },
        },
    },
} satisfies Meta<typeof ConnectXPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No X account linked — light card with subhead, black "Connect" button with 𝕏 icon. */
export const Disconnected: Story = {};

/** X account linked — premium dark gradient card with green ring, Connected pill, Unlink link. */
export const Connected: Story = {
    args: {
        xUsername: 'pokerShark',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    },
};

/** Connected but no profile image yet — falls back to black X logo circle. */
export const ConnectedNoAvatar: Story = {
    name: 'Connected — No Avatar',
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

/** Disconnecting in progress — shows loading spinner on the Unlink link. */
export const Disconnecting: Story = {
    args: {
        xUsername: 'pokerShark',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        isDisconnecting: true,
    },
};

/** Connected with a long username — tests truncation behavior. */
export const LongUsername: Story = {
    name: 'Connected — Long Username',
    args: {
        xUsername: 'this_is_a_very_long_twitter_username',
        xProfileImageUrl: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg',
    },
};
