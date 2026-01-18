'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Stack,
    SimpleGrid,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { MdArrowForward } from 'react-icons/md';
import React from 'react';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';

const pulseBorderPink = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(235, 11, 92, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(235, 11, 92, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(235, 11, 92, 0);
  }
`;

const CustomChipValueSection = () => {
    const prefersReducedMotion = useReducedMotion();

    const highlightPulse = !prefersReducedMotion
        ? `${pulseBorderPink} 2s ease-out infinite`
        : 'none';

    return (
        <Box bg="bg.default" py={{ base: 8, md: 12 }} width="100%">
            <Container maxW="container.xl">
                <Box
                    position="relative"
                    borderRadius="32px"
                    bg="#073d2a" // Deep Forest Green Felt
                    p={{ base: 8, md: 16 }}
                    overflow="hidden"
                    boxShadow="0 20px 80px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(0, 0, 0, 0.5)"
                    transition="all 0.5s ease"
                    animation={highlightPulse}
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow:
                            '0 30px 100px rgba(0, 0, 0, 0.9), inset 0 0 120px rgba(0, 0, 0, 0.6)',
                    }}
                    sx={{
                        WebkitMaskImage: `
                            radial-gradient(circle at 0px 50%, transparent 12px, black 12.5px),
                            radial-gradient(circle at 100% 50%, transparent 12px, black 12.5px)
                        `,
                        WebkitMaskSize: '100% 48px',
                        WebkitMaskRepeat: 'repeat-y',
                        maskImage: `
                            radial-gradient(circle at 0px 50%, transparent 12px, black 12.5px),
                            radial-gradient(circle at 100% 50%, transparent 12px, black 12.5px)
                        `,
                        maskSize: '100% 48px',
                        maskRepeat: 'repeat-y',
                    }}
                >
                    {/* Felt Texture Overlay */}
                    <Box
                        position="absolute"
                        inset={0}
                        opacity="0.4"
                        pointerEvents="none"
                        backgroundImage="radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0.12) 1px, transparent 1px)"
                        backgroundSize="6px 6px"
                    />

                    {/* Spotlight Effect */}
                    <Box
                        position="absolute"
                        inset={0}
                        bgGradient="radial(circle at 50% -20%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)"
                        pointerEvents="none"
                    />

                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={12}
                        alignItems="center"
                        position="relative"
                        zIndex={1}
                    >
                        <VStack align="start" spacing={8}>
                            <Badge
                                bg="rgba(255, 255, 255, 0.1)"
                                color="white"
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="wider"
                            >
                                CHIP VALUE SYSTEM
                            </Badge>

                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="white"
                            >
                                1 Chip = 0.01 USDC. Always.
                            </Heading>

                            <VStack align="start" spacing={5}>
                                <Text
                                    fontSize="lg"
                                    color="brand.lightGray"
                                    lineHeight="tall"
                                >
                                    Simple, predictable, and enforced by smart
                                    contracts. When you create a game, you set
                                    the blind structure in{' '}
                                    <Box
                                        as="span"
                                        color="white"
                                        fontWeight="semibold"
                                    >
                                        chips
                                    </Box>
                                    , and the{' '}
                                    <Box
                                        as="span"
                                        color="blue.400"
                                        fontWeight="semibold"
                                    >
                                        USDC value
                                    </Box>{' '}
                                    is automatically calculated.
                                </Text>
                                <Text
                                    fontSize="lg"
                                    color="brand.lightGray"
                                    lineHeight="tall"
                                >
                                    A{' '}
                                    <Box
                                        as="span"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        bg="rgba(255,255,255,0.08)"
                                        color="brand.yellow"
                                        fontWeight="semibold"
                                    >
                                        10/20 chip game
                                    </Box>{' '}
                                    means blinds of 10/20 chips (0.10/0.20 USDC).
                                    Players buy in with USDC and receive the
                                    exact chip amount for your table&apos;s
                                    structure.
                                </Text>
                            </VStack>
                        </VStack>

                        {/* Conversion Graphic */}
                        <Box
                            bg="rgba(0, 0, 0, 0.3)"
                            p={{ base: 6, sm: 8, md: 12 }}
                            borderRadius="30px"
                            border="1px solid"
                            borderColor="rgba(255, 255, 255, 0.15)"
                            backdropFilter="blur(20px)"
                            maxW={{ base: '380px', lg: 'none' }}
                            mx={{ base: 'auto', lg: 0 }}
                        >
                            <VStack spacing={8} align="stretch">
                                {/* Fixed Rate Display */}
                                <VStack spacing={4}>
                                    <Text
                                        color="gray.300"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        textAlign="center"
                                    >
                                        FIXED EXCHANGE RATE
                                    </Text>
                                    <HStack spacing={4} justify="center" align="center">
                                        <HStack spacing={3}>
                                            <Box
                                                position="relative"
                                                width={{
                                                    base: '32px',
                                                    md: '40px',
                                                }}
                                                height={{
                                                    base: '32px',
                                                    md: '40px',
                                                }}
                                                flexShrink={0}
                                            >
                                                <Image
                                                    src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                                                    alt="USDC"
                                                    fill
                                                    sizes="(max-width: 48em) 32px, 40px"
                                                    style={{
                                                        objectFit: 'contain',
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            </Box>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize={{
                                                    base: 'lg',
                                                    md: 'xl',
                                                }}
                                            >
                                                0.01 USDC
                                            </Text>
                                        </HStack>

                                        <Icon
                                            as={MdArrowForward}
                                            color="brand.green"
                                            fontSize={{
                                                base: '20px',
                                                md: '24px',
                                            }}
                                        />

                                        <HStack spacing={3}>
                                            <Box
                                                w={{
                                                    base: '40px',
                                                    md: '48px',
                                                }}
                                                h={{
                                                    base: '40px',
                                                    md: '48px',
                                                }}
                                                borderRadius="full"
                                                bg="brand.green"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                border="2px solid rgba(255,255,255,0.3)"
                                                boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                                            >
                                                <Text
                                                    color="white"
                                                    fontWeight="black"
                                                    fontSize={{
                                                        base: 'lg',
                                                        md: 'xl',
                                                    }}
                                                >
                                                    1
                                                </Text>
                                            </Box>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize={{
                                                    base: 'lg',
                                                    md: 'xl',
                                                }}
                                            >
                                                Chip
                                            </Text>
                                        </HStack>
                                    </HStack>
                                </VStack>

                                <Box h="1px" bg="rgba(255, 255, 255, 0.1)" />

                                {/* Example Blinds */}
                                <VStack spacing={3}>
                                    <Text
                                        color="gray.300"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        textAlign="center"
                                    >
                                        EXAMPLE GAMES
                                    </Text>
                                    <SimpleGrid columns={2} spacing={4} w="full">
                                        <VStack spacing={1}>
                                            <Text
                                                color="brand.yellow"
                                                fontSize="sm"
                                                fontWeight="bold"
                                            >
                                                5/10 GAME
                                            </Text>
                                            <Text
                                                color="gray.400"
                                                fontSize="xs"
                                                textAlign="center"
                                            >
                                                5/10 chips
                                                <br />
                                                0.05/0.10 USDC
                                            </Text>
                                        </VStack>
                                        <VStack spacing={1}>
                                            <Text
                                                color="brand.yellow"
                                                fontSize="sm"
                                                fontWeight="bold"
                                            >
                                                25/50 GAME
                                            </Text>
                                            <Text
                                                color="gray.400"
                                                fontSize="xs"
                                                textAlign="center"
                                            >
                                                25/50 chips
                                                <br />
                                                0.25/0.50 USDC
                                            </Text>
                                        </VStack>
                                    </SimpleGrid>
                                </VStack>
                            </VStack>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Container>
        </Box>
    );
};

export default CustomChipValueSection;
