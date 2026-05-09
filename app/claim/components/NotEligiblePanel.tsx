import React from 'react';
import { Box, Icon, Text, VStack } from '@chakra-ui/react';
import { GiSpades } from 'react-icons/gi';

const NotEligiblePanel: React.FC = () => (
    <VStack spacing={4} py={6} align="center">
        <Box
            w="56px"
            h="56px"
            borderRadius="14px"
            bg="rgba(253, 197, 29, 0.10)"
            _dark={{ bg: 'rgba(253, 197, 29, 0.15)' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Icon as={GiSpades} boxSize="28px" color="brand.yellow" opacity={0.5} />
        </Box>
        <VStack spacing={1} align="center">
            <Text fontSize="sm" fontWeight={700} color="text.primary">
                Not eligible yet
            </Text>
            <Text fontSize="sm" color="text.secondary" textAlign="center" maxW="280px">
                Climb the ranks on the leaderboard to unlock your badge.
            </Text>
        </VStack>
    </VStack>
);

export default NotEligiblePanel;
