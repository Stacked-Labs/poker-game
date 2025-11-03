import { Box, Flex, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import HomeCard from './HomeCard';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const revealFromLeft = keyframes`
  from { clip-path: inset(0 100% 0 0); opacity: 1; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
`;

const subtleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
  50% { text-shadow: 0 0 30px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.1); }
`;

// Random free-floating character animations
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-3px, -12px); }
  50% { transform: translate(2px, -18px); }
  75% { transform: translate(-2px, -10px); }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(4px, -8px); }
  50% { transform: translate(-2px, -20px); }
  80% { transform: translate(3px, -6px); }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(-4px, -15px); }
  60% { transform: translate(3px, -22px); }
  90% { transform: translate(-1px, -8px); }
`;

const float4 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  15% { transform: translate(2px, -10px); }
  45% { transform: translate(-3px, -17px); }
  70% { transform: translate(4px, -12px); }
`;

const float5 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  35% { transform: translate(-2px, -14px); }
  55% { transform: translate(3px, -19px); }
  85% { transform: translate(-4px, -9px); }
`;

const float6 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(3px, -11px); }
  60% { transform: translate(-4px, -21px); }
  85% { transform: translate(2px, -7px); }
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
    const words = React.useMemo(() => ['HOST', 'YOUR', 'POKER', 'GAME'], []);
    const floatAnimations = React.useMemo(
        () => [float1, float2, float3, float4, float5, float6],
        []
    );

    return (
        <Box
            position="relative"
            width="100vw"
            height={{ base: '100%', lg: 'var(--full-vh)' }}
            bgAttachment="fixed"
            bgColor="brand.lightGray"
            bgSize="cover"
            bgPosition={{ base: 'right', lg: 'center' }}
            bgImage={''}
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
                {false && (
                    <VStack
                        width={{ base: '100%', lg: '60%' }}
                        justifyContent="center"
                        alignItems={{ base: 'center', lg: 'flex-start' }}
                        spacing={0}
                        mt={{ base: 8, lg: 16, xl: 20 }}
                    >
                        <>
                            {words.map((word, wordIndex) => (
                                <Box
                                    key={wordIndex}
                                    as="h1"
                                    fontSize={{
                                        base: '3xl',
                                        lg: '8xl',
                                        xl: '9xl',
                                    }}
                                    fontWeight="extrabold"
                                    fontFamily="heading"
                                    color="white"
                                    lineHeight={1.1}
                                    display="flex"
                                >
                                    {word.split('').map((char, charIndex) => {
                                        const totalDelay =
                                            wordIndex * 0.15 + charIndex * 0.08;
                                        const floatDelay = totalDelay + 2;

                                        // Pick random animation and duration for each character
                                        const animIndex =
                                            (wordIndex * 7 + charIndex * 3) %
                                            floatAnimations.length;
                                        const floatAnim =
                                            floatAnimations[animIndex];
                                        const floatDuration =
                                            20 + (charIndex % 7) * 2.5;

                                        return (
                                            <Box
                                                key={charIndex}
                                                as="span"
                                                display="inline-block"
                                                animation={`
                                                    ${fadeIn} 0.7s ease-out ${totalDelay}s forwards,
                                                    ${subtleGlow} 8s ease-in-out ${floatDelay}s infinite,
                                                    ${floatAnim} ${floatDuration}s cubic-bezier(0.42, 0, 0.58, 1) ${floatDelay}s infinite
                                                `}
                                                opacity={0}
                                                willChange="transform"
                                            >
                                                {char}
                                            </Box>
                                        );
                                    })}
                                </Box>
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
