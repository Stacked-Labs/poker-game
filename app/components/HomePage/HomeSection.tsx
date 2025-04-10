import { Box, Flex, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import HomeCard from './HomeCard';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { keyframes } from '@emotion/react'; // Import keyframes from @emotion/react

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
        <Box position="relative" width="100vw" minHeight="100vh">
            <Image
                alt="Background Photo"
                src="/bg.svg"
                layout="fill"
                objectFit="cover"
                priority
            />
            <Flex
                position="relative"
                width="100%"
                minHeight="100%"
                zIndex={1}
                alignItems="center"
                justifyContent="space-between"
                flexWrap={{ base: 'wrap', lg: 'nowrap' }} // Wrap on mobile, nowrap on large screens
                gap={{ base: 2, md: 4, lg: 6 }} // Responsive gap
            >
                <Box
                    flex={{ base: '1 1 100%', lg: '1 1 0%' }} // Full width on mobile, equal width on large screens
                    mb={{ base: 8, lg: 0 }} // Margin bottom on mobile
                >
                    <HomeCard />
                </Box>

                <VStack
                    flex={{ base: '1 1 100%', lg: '1 1 0%' }} // Full width on mobile, equal width on large screens
                    justifyContent="center"
                    alignItems={{ base: 'center', lg: 'flex-start' }} // Center align on mobile, start align on large screens
                    spacing={0}
                >
                    {showArenaText && (
                        <>
                            {words.map((word, index) => (
                                <Text
                                    key={index}
                                    fontSize="9xl"
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
                    )}
                </VStack>

                <Box
                    flex={['1 1 100%', '1 1 100%', '1']}
                    display={['none', 'none', 'block']}
                />
            </Flex>
        </Box>
    );
};

export default HomeSection;
