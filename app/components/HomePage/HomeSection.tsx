import {
    Box,
    Flex,
    Text,
    keyframes,
    VStack,
    useBreakpointValue,
} from '@chakra-ui/react';
import React from 'react';
import HomeCard from './HomeCard';
import { Poppins } from 'next/font/google';
import Image from 'next/image';

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
    const showArenaText = useBreakpointValue({ base: false, md: true });
    const words = React.useMemo(() => ['YOUR', 'CRYPTO', 'POKER', 'ARENA'], []);

    return (
        <Box position="relative" width="100vw" minHeight="100vh">
            <Image
                alt="Background Photo"
                src="/bg.png"
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
                // px={[4, 8, 12, 20]}
                flexWrap="wrap" // Allow wrapping
                gap={[2, 4, 6]} // Responsive gap between wrapped items
            >
                <Box flex={['1 1 100%', '1 1 100%', '1']} mb={[8, 8, 0]}>
                    <HomeCard />
                </Box>

                <VStack
                    flex={['1 1 100%', '1 1 100%', '1']}
                    justifyContent="center"
                    alignItems={['center', 'center', 'flex-start']}
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
