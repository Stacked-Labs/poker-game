'use client';

import React from 'react';
import { Box, VStack, Flex, Text } from '@chakra-ui/react';
import { useActiveAccount } from 'thirdweb/react';
import Web3Button from '../Web3Button';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';

const PlayerCard: React.FC = () => {
    const account = useActiveAccount();
    const isConnected = !!account;

    return (
        <Box position="relative" bg="gray.100" p={6} borderRadius="lg" width="100%">
            <Box style={{ filter: isConnected ? 'none' : 'blur(4px)' }}>
                <VStack spacing={8} align="stretch">
                    <StatsSection />
                    <ReferralCodeSection />
                </VStack>
            </Box>
            {!isConnected && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    align="center"
                    justify="center"
                    direction="column"
                    bg="rgba(0, 0, 0, 0.6)"
                    borderRadius="lg"
                >
                    <Text color="white" mb={4} textAlign="center">
                        Connect your wallet to view your stats
                    </Text>
                    <Web3Button />
                </Flex>
            )}
        </Box>
    );
};

export default PlayerCard;
