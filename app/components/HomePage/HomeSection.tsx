import { Box, Flex, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import HomeCard from './HomeCard';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { keyframes } from '@emotion/react';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const revealFromLeft = keyframes`
  from { clip-path: inset(0 100% 0 0); opacity: 1; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
`;

const HomeSection = () => {
    const showArenaText = useBreakpointValue({
        base: false, // Mobile
        sm: false, // Small screens
        md: true, // Medium screens
        lg: true, // Large screens
        xl: true, // Extra large screens
        '2xl': true, // 2x Extra large screens (optional)
    });
    const words = React.useMemo(() => ['YOUR', 'CRYPTO', 'POKER', 'ARENA'], []);

    return (
        <Box
            position="relative"
            width="100vw"
            height={{ base: '100%', lg: '100vh' }}
            bgAttachment="fixed"
            bgSize="cover"
            bgPosition={{ base: 'right', lg: 'center' }}
            bgImage={'url("/bg.png")'}
        >
            <Flex
                position="relative"
                width="100%"
                flexWrap={{ base: 'wrap', lg: 'nowrap' }}
                gap={0}
            >
                <Box width={{ base: '100%', lg: '40%' }}>
                    <HomeCard />
                </Box>
                {showArenaText && (
                    <VStack
                        width={{ base: '100%', lg: '60%' }}
                        justifyContent="center"
                        alignItems={{ base: 'center', lg: 'flex-start' }}
                        spacing={0}
                    >
                        <>
                            {words.map((word, index) => (
                                <Text
                                    key={index}
                                    fontSize={{
                                        base: '3xl',
                                        lg: '8xl',
                                        xl: '9xl',
                                    }}
                                    fontWeight="extrabold"
                                    color="white"
                                    lineHeight={1.1}
                                    animation={`${fadeIn} 0.7s ease-out ${
                                        index * 0.4
                                    }s forwards`}
                                    opacity={0}
                                    className={poppins.className}
                                >
                                    {word}
                                </Text>
                            ))}
                            <Text
                                fontSize="4xl"
                                color="white"
                                animation={`${revealFromLeft} 3s ease-out 2s forwards`}
                                opacity={0}
                                fontFamily={`'Libre Barcode 39 Text', system-ui`}
                            >
                                HOST AND PLAY FOR ANY ERC20
                            </Text>
                        </>
                    </VStack>
                )}
            </Flex>
        </Box>
    );
};

export default HomeSection;
