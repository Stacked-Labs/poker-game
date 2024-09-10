import { Box, Flex, Image, Text, keyframes, VStack } from '@chakra-ui/react';
import React from 'react';
import HomeCard from '../HomeCard';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HomeSection = () => {
    return (
        <Box position="relative" width="100vw" height="100vh">
            <Image
                alt="Background Photo"
                src="/bg.png"
                width="100%"
                height="100%"
                position="absolute"
                objectFit="cover"
            />
            <Flex
                position="relative"
                width="100%"
                height="100%"
                zIndex={1}
                alignItems="center"
                justifyContent="space-between"
                px={4}
            >
                <Box flex={1}>
                    <HomeCard />
                </Box>
                
                <VStack flex={1} justifyContent="center" alignItems="flex-start" spacing={0}>
                    {['YOUR', 'CRYPTO', 'POKER ARENA'].map((word, index) => (
                        <Text
                            key={index}
                            fontSize="7xl"
                            fontWeight="bold"
                            color="white"
                            lineHeight={1.5}
                            animation={`${fadeIn} 0.5s ease-out ${index * 0.2}s forwards`}
                            opacity={0}
                            fontFamily="Poppins"
                        >
                            {word}
                        </Text>
                    ))}
                    <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color="white"
                        mt={4}
                        animation={`${fadeIn} 0.5s ease-out 0.6s forwards`}
                        opacity={0}
                        fontFamily="Poppins"
                    >
                        HOST AND PLAY FOR ANY ERC20
                    </Text>
                </VStack>
                
                <Box flex={1} />
            </Flex>
        </Box>
    );
};

export default HomeSection;
