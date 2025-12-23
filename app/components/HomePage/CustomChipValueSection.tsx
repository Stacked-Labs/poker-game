'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Icon,
    Badge,
    Image,
} from '@chakra-ui/react';
import { MdArrowForward } from 'react-icons/md';
import React, { useEffect, useState } from 'react';

const USDC_PER_CHIP_OPTIONS = ['0.1', '1', '10'];

const CustomChipValueSection = () => {
    const [usdcPerChipIndex, setUsdcPerChipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(
            () =>
                setUsdcPerChipIndex(
                    (prev) => (prev + 1) % USDC_PER_CHIP_OPTIONS.length
                ),
            1500
        );

        return () => clearInterval(interval);
    }, []);

    const currentUsdcPerChip = USDC_PER_CHIP_OPTIONS[usdcPerChipIndex];

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
                    border="4px solid"
                    borderColor="#0a5238"
                    transition="all 0.5s ease"
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
                        backgroundImage="url('https://www.transparenttextures.com/patterns/felt.png')"
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
                                CUSTOM CHIP VALUE
                            </Badge>

                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="white"
                            >
                                You Decide What a Chip is Worth.
                            </Heading>

                            <VStack align="start" spacing={5}>
                                <Text
                                    fontSize="lg"
                                    color="brand.lightGray"
                                    lineHeight="tall"
                                >
                                    In Stacked, the chip count is standard, but
                                    the value is{' '}
                                    <Box
                                        as="span"
                                        color="white"
                                        fontWeight="semibold"
                                    >
                                        up to you
                                    </Box>
                                    . As the host, when creating a game, you
                                    assign a{' '}
                                    <Box
                                        as="span"
                                        color="blue.400"
                                        fontWeight="semibold"
                                    >
                                        USDC value
                                    </Box>{' '}
                                    to the chips by setting the Small Blind and
                                    Big Blind. Make a{' '}
                                    <Box
                                        as="span"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        bg="rgba(255,255,255,0.08)"
                                        color="brand.yellow"
                                        fontWeight="semibold"
                                    >
                                        1/2 game = 0.10 / 0.20
                                    </Box>{' '}
                                    for a friendly night, or{' '}
                                    <Box
                                        as="span"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        bg="rgba(255,255,255,0.08)"
                                        color="brand.yellow"
                                        fontWeight="semibold"
                                    >
                                        10 / 20
                                    </Box>{' '}
                                    for high-stakes action.
                                </Text>
                                <Text
                                    fontSize="lg"
                                    color="brand.lightGray"
                                    lineHeight="tall"
                                >
                                    Players buy in with{' '}
                                    <Box
                                        as="span"
                                        color="blue.400"
                                        fontWeight="semibold"
                                    >
                                        USDC
                                    </Box>
                                    , get the exact correct amount of chips for
                                    your table&apos;s ratio.
                                </Text>
                            </VStack>
                        </VStack>

                        {/* Conversion Graphic */}
                        <Box
                            bg="rgba(0, 0, 0, 0.3)"
                            p={{ base: 12, md: 18 }}
                            borderRadius="30px"
                            border="1px solid"
                            borderColor="rgba(255, 255, 255, 0.15)"
                            backdropFilter="blur(20px)"
                        >
                            <VStack spacing={12} align="stretch">
                                <HStack
                                    justify="center"
                                    spacing={{ base: 6, md: 10 }}
                                >
                                    <HStack spacing={6}>
                                        <Image
                                            src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                                            alt="USDC"
                                            boxSize="72px"
                                        />
                                        <VStack align="flex-start" spacing={0}>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="2xl"
                                            >
                                                USDC
                                            </Text>
                                            <Text
                                                color="gray.300"
                                                fontSize="md"
                                                fontWeight="medium"
                                            >
                                                {currentUsdcPerChip} USDC
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <Icon
                                        as={MdArrowForward}
                                        color="gray.500"
                                        fontSize="36px"
                                    />

                                    <HStack spacing={6}>
                                        <Box
                                            position="relative"
                                            w="78px"
                                            h="78px"
                                            borderRadius="full"
                                            bg="brand.green"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            border="6px dashed rgba(255,255,255,0.4)"
                                            boxShadow="0 6px 16px rgba(0,0,0,0.35), inset 0 0 20px rgba(0,0,0,0.25)"
                                            _before={{
                                                content: '""',
                                                position: 'absolute',
                                                width: '78%',
                                                height: '78%',
                                                borderRadius: 'full',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                            }}
                                        >
                                            <Text
                                                color="white"
                                                fontWeight="black"
                                                fontSize="2xl"
                                                zIndex={1}
                                            >
                                                S
                                            </Text>
                                        </Box>
                                        <VStack align="flex-start" spacing={0}>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="2xl"
                                            >
                                                Chips
                                            </Text>
                                            <Text
                                                color="gray.300"
                                                fontSize="md"
                                                fontWeight="medium"
                                            >
                                                1 Chip
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>

                                <Box h="1px" bg="rgba(255, 255, 255, 0.1)" />

                                <Text
                                    color="gray.400"
                                    fontSize="md"
                                    textAlign="center"
                                    lineHeight="tall"
                                >
                                    You choose how much 1 Chip is worth (e.g.
                                    0.1, 1, or 10 USDC). The exchange rate is
                                    enforced by the smart contract, keeping it
                                    stable and automatic.
                                </Text>
                            </VStack>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Container>
        </Box>
    );
};

export default CustomChipValueSection;
