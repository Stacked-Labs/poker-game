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
} from '@chakra-ui/react';
import { useActiveAccount } from 'thirdweb/react';
import { FaWallet, FaGamepad, FaTrophy, FaCode } from 'react-icons/fa';
import Web3Button from '../Web3Button';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import { useAuth } from '@/app/contexts/AuthContext';

const PlayerCard: React.FC = () => {
    const account = useActiveAccount();
    const { isAuthenticated } = useAuth();
    const isConnected = !!account;
    const isFullyAuthenticated = isConnected && isAuthenticated;

    // Helper to shorten long wallet addresses (e.g. 0x1234…abcd)
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <Box position="relative" width="100%">
            <Box
                bgColor="gray.100"
                borderRadius="lg"
                p={6}
                boxShadow="xl"
                style={{ filter: isFullyAuthenticated ? 'none' : 'blur(4px)' }}
            >
                <VStack spacing={6} align="stretch">
                    {isFullyAuthenticated && (
                        <>
                            {/* Profile Header */}
                            <VStack spacing={4}>
                                <Avatar
                                    size="xl"
                                    border="3px solid rgba(255, 255, 255, 0.2)"
                                />
                                <VStack spacing={2}>
                                    <Heading
                                        size="md"
                                        color="white"
                                        textAlign="center"
                                    >
                                        Player #
                                        {account!.address
                                            .slice(-4)
                                            .toUpperCase()}
                                    </Heading>
                                    <HStack spacing={2}>
                                        <Icon as={FaWallet} color="gray.400" />
                                        <Text
                                            color="gray.300"
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
                                    colorScheme="purple"
                                    variant="solid"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    fontSize="sm"
                                >
                                    <HStack spacing={2}>
                                        <Icon as={FaTrophy} />
                                        <Text>Rank #42</Text>
                                    </HStack>
                                </Badge>
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
                    bg="rgba(0, 0, 0, 0.8)"
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                >
                    <VStack spacing={6}>
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
                                : 'Please complete authentication'}
                        </Text>
                        <Web3Button />
                    </VStack>
                </Flex>
            )}
        </Box>
    );
};

export default PlayerCard;
