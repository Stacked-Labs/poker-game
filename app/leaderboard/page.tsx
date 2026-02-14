'use client';

import React from 'react';
import { Flex, Stack, Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import LeaderboardTable from '@/app/components/Leaderboard/LeaderboardTable';
import PlayerCard from '@/app/components/Leaderboard/PlayerCard';
import FloatingDecor from '@/app/components/HomePage/FloatingDecor';
import Footer from '@/app/components/HomePage/Footer';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const LeaderboardPage: React.FC = () => {
    return (
        <Box
            minH="100vh"
            bg="bg.default"
            pt={{ base: 24, md: 28 }}
            px={{ base: 4, md: 6 }}
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />

            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '8%', md: '6%' }}
                right={{ base: '-15%', md: '5%' }}
                w={{ base: '220px', md: '320px' }}
                h={{ base: '220px', md: '320px' }}
                borderRadius="full"
                bg="brand.pink"
                opacity={0.12}
                filter="blur(90px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '6%', md: '10%' }}
                left={{ base: '-10%', md: '6%' }}
                w={{ base: '200px', md: '300px' }}
                h={{ base: '200px', md: '300px' }}
                borderRadius="full"
                bg="brand.green"
                opacity={0.12}
                filter="blur(80px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />

            <Flex
                justify="center"
                align="flex-start"
                position="relative"
                zIndex={1}
            >
                <Stack
                    direction={{ base: 'column', lg: 'row' }}
                    spacing={{ base: 6, lg: 8 }}
                    align={{ base: 'stretch', lg: 'flex-start' }}
                    maxW="1400px"
                    width="100%"
                    animation={`${fadeIn} 0.5s ease-out`}
                >
                    <Box w="full" maxW={{ base: '100%', lg: '400px' }}>
                        <PlayerCard />
                    </Box>
                    <Box flex="1" w="full">
                        <LeaderboardTable />
                    </Box>
                </Stack>
            </Flex>

            <Box position="relative" zIndex={1} mt={{ base: 12, md: 16 }}>
                <Footer />
            </Box>
        </Box>
    );
};

export default LeaderboardPage;
