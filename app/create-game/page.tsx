'use client';

import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import GameSettingLeftSide from '../components/CreateGame/GameSettingLeftSide';
import Head from 'next/head';
import { keyframes } from '@emotion/react';

// Animations
const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const floatSlow = keyframes`
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-10px, -15px); }
`;

const CreateGamePage: React.FC = () => {
    return (
        <>
            <Head>
                <link
                    rel="preconnect"
                    href="https://challenges.cloudflare.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://challenges.cloudflare.com"
                />
            </Head>
            <Box
                minHeight="var(--full-vh)"
                bg="white"
                position="relative"
                overflow="hidden"
                animation={`${fadeIn} 0.6s ease-out`}
            >
                {/* Decorative Floating Gradient Orbs */}
                <Box
                    position="absolute"
                    top={{ base: '10%', md: '5%' }}
                    right={{ base: '-10%', md: '5%' }}
                    width={{ base: '200px', md: '300px' }}
                    height={{ base: '200px', md: '300px' }}
                    borderRadius="50%"
                    bg="brand.pink"
                    filter="blur(100px)"
                    opacity={0.12}
                    animation={`${float} 8s ease-in-out infinite`}
                    zIndex={0}
                    pointerEvents="none"
                />

                <Box
                    position="absolute"
                    bottom={{ base: '5%', md: '10%' }}
                    left={{ base: '-10%', md: '5%' }}
                    width={{ base: '180px', md: '250px' }}
                    height={{ base: '180px', md: '250px' }}
                    borderRadius="50%"
                    bg="brand.green"
                    filter="blur(80px)"
                    opacity={0.1}
                    animation={`${floatSlow} 10s ease-in-out infinite`}
                    zIndex={0}
                    pointerEvents="none"
                />

                <Box
                    position="absolute"
                    top={{ base: '45%', md: '50%' }}
                    left={{ base: '50%', md: '50%' }}
                    transform="translate(-50%, -50%)"
                    width={{ base: '150px', md: '200px' }}
                    height={{ base: '150px', md: '200px' }}
                    borderRadius="50%"
                    bg="brand.yellow"
                    filter="blur(60px)"
                    opacity={0.08}
                    animation={`${float} 12s ease-in-out infinite`}
                    zIndex={0}
                    pointerEvents="none"
                />

                {/* Main Content */}
                <Flex
                    flex="1"
                    justifyContent="center"
                    position="relative"
                    zIndex={1}
                    minHeight="var(--full-vh)"
                >
                    <GameSettingLeftSide />
                </Flex>
            </Box>
        </>
    );
};

export default CreateGamePage;
