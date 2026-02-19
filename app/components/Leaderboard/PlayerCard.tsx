'use client';

import React from 'react';
import {
    Box,
    VStack,
    Flex,
    Text,
    Heading,
    Avatar,
    Badge,
    HStack,
    Icon,
    Button,
} from '@chakra-ui/react';
import { useActiveAccount } from 'thirdweb/react';
import { FaWallet, FaTrophy } from 'react-icons/fa';
import WalletButton from '../WalletButton';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import { useAuth } from '@/app/contexts/AuthContext';

interface PlayerCardProps {
    rank?: number;
    points?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ rank, points }) => {
    const account = useActiveAccount();
    const { isAuthenticated, isAuthenticating, requestAuthentication } =
        useAuth();
    const isConnected = !!account;
    const isFullyAuthenticated = isConnected && isAuthenticated;

    // Helper to shorten long wallet addresses (e.g. 0x1234...abcd)
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <Box position="relative" width="100%">
            <Box
                bg="card.white"
                borderRadius="24px"
                p={{ base: 4, md: 5 }}
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
                style={{ filter: isFullyAuthenticated ? 'none' : 'blur(4px)' }}
                position="relative"
                overflow="hidden"
            >
                <VStack spacing={4} align="stretch">
                    {isFullyAuthenticated && (
                        <>
                            {/* Profile Header */}
                            <VStack spacing={3}>
                                <Avatar
                                    size="lg"
                                    border="3px solid"
                                    borderColor="brand.green"
                                    boxShadow="0 0 16px rgba(54, 163, 123, 0.35)"
                                    _dark={{
                                        borderColor: 'brand.green',
                                        boxShadow:
                                            '0 0 20px rgba(54, 163, 123, 0.45)',
                                    }}
                                />
                                <VStack spacing={2}>
                                    <Heading
                                        size="sm"
                                        color="text.primary"
                                        textAlign="center"
                                    >
                                        Player #
                                        {account!.address
                                            .slice(-4)
                                            .toUpperCase()}
                                    </Heading>
                                    <HStack spacing={2}>
                                        <Icon
                                            as={FaWallet}
                                            color="text.gray600"
                                        />
                                        <Text
                                            color="text.gray600"
                                            fontSize="sm"
                                            fontFamily="mono"
                                        >
                                            {truncateAddress(account!.address)}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </VStack>

                            {/* Rank Badge */}
                            <Flex justify="center">
                                <Badge
                                    bg="brand.navy"
                                    color="white"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    boxShadow="0 4px 12px rgba(12, 21, 49, 0.25)"
                                >
                                    <HStack spacing={2}>
                                        <Icon as={FaTrophy} color="#FFD700" />
                                        <Text color="brand.lightGray">
                                            {rank != null ? `Rank #${rank}` : 'Unranked'}
                                        </Text>
                                    </HStack>
                                </Badge>
                            </Flex>

                            {/* Points */}
                            <Flex justify="center">
                                <Text
                                    fontSize="2xl"
                                    fontWeight="extrabold"
                                    color="brand.green"
                                >
                                    {points != null ? points.toLocaleString() : '0'} pts
                                </Text>
                            </Flex>
                        </>
                    )}

                    <StatsSection />
                    <ReferralCodeSection />
                </VStack>
            </Box>

            {!isFullyAuthenticated && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    align="center"
                    justify="center"
                    direction="column"
                    bg="rgba(12, 21, 49, 0.82)"
                    borderRadius="24px"
                    backdropFilter="blur(10px)"
                    _dark={{ bg: 'rgba(0, 0, 0, 0.7)' }}
                >
                    <VStack spacing={4}>
                        <Icon
                            as={FaWallet}
                            boxSize={12}
                            color="white"
                            opacity={0.7}
                        />
                        <Text
                            color="white"
                            fontSize="lg"
                            textAlign="center"
                            fontWeight="medium"
                        >
                            {!isConnected
                                ? 'Connect to view stats'
                                : isAuthenticating
                                  ? 'Check your wallet to sign the message…'
                                  : 'Please complete authentication'}
                        </Text>
                        {!isConnected ? (
                            <WalletButton
                                width="200px"
                                height="48px"
                                label="Sign In"
                            />
                        ) : (
                            <Button
                                height="48px"
                                bg="brand.green"
                                color="white"
                                fontWeight="bold"
                                borderRadius="12px"
                                onClick={requestAuthentication}
                                isLoading={isAuthenticating}
                                loadingText="Waiting…"
                                _hover={{
                                    bg: '#2d9268',
                                    transform: 'translateY(-2px)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s ease"
                            >
                                Finish Sign-In
                            </Button>
                        )}
                    </VStack>
                </Flex>
            )}
        </Box>
    );
};

export default PlayerCard;
