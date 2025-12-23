'use client';

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Input,
    Button,
} from '@chakra-ui/react';
import React from 'react';

const NewsletterSection = () => {
    return (
        <Box
            bg="bg.default"
            py={{ base: 2, md: 4 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            <Container maxW="container.xl">
                <Box
                    position="relative"
                    borderRadius={{ base: '24px', md: '40px' }}
                    bg="#073d2a" // Deep Forest Green Felt
                    p={{ base: 6, md: 10 }}
                    overflow="hidden"
                    boxShadow="0 20px 80px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(0, 0, 0, 0.5)"
                    role="group"
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

                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align={{ base: 'flex-start', lg: 'center' }}
                        gap={{ base: 10, lg: 16 }}
                        position="relative"
                        zIndex={1}
                    >
                        {/* Text Content */}
                        <VStack align="start" spacing={8} maxW="2xl">
                            <HStack spacing={4}>
                                <Flex align="center" gap={2}>
                                    <Box
                                        w="10px"
                                        h="10px"
                                        borderRadius="full"
                                        bg="brand.green"
                                        boxShadow="0 0 15px #36A37B"
                                    />
                                    <Text
                                        color="brand.pink"
                                        fontSize="sm"
                                        fontWeight="bold"
                                    >
                                        ♦️
                                    </Text>
                                </Flex>
                                <Text
                                    color="brand.green"
                                    fontSize="sm"
                                    fontWeight="black"
                                    letterSpacing="0.3em"
                                    textTransform="uppercase"
                                >
                                    MEMBERS ONLY
                                </Text>
                            </HStack>

                            <Heading
                                color="white"
                                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                                fontWeight="black"
                                lineHeight={0.9}
                                letterSpacing="-0.05em"
                            >
                                A Seat is{' '}
                                <Box
                                    as="span"
                                    display="inline-block"
                                    bgGradient="linear(to-r, brand.yellow, brand.pink)"
                                    bgClip="text"
                                    transform="rotate(-1deg)"
                                >
                                    Waiting
                                </Box>{' '}
                                For You 🫵
                            </Heading>

                            <Text
                                color="whiteAlpha.800"
                                fontSize={{ base: 'lg', md: 'xl' }}
                                lineHeight="relaxed"
                                fontWeight="semibold"
                                maxW="xl"
                            >
                                The world&apos;s funnest digital poker party.
                                Unhinged players, massive pots. Get invites to
                                private community games and exclusive developer
                                Q&As.
                            </Text>
                        </VStack>

                        {/* Animated Tear Line */}
                        <Box
                            h={{ base: '2px', lg: '240px' }}
                            w={{ base: '100%', lg: '2px' }}
                            position="relative"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Box
                                h="100%"
                                w="100%"
                                bgGradient={{
                                    base: 'linear(to-r, transparent, rgba(255,255,255,0.2), transparent)',
                                    lg: 'linear(to-b, transparent, rgba(255,255,255,0.2), transparent)',
                                }}
                                borderLeft={{ base: 'none', lg: '2px dashed' }}
                                borderBottom={{
                                    base: '2px dashed',
                                    lg: 'none',
                                }}
                                borderColor="whiteAlpha.400"
                                opacity={0.6}
                            />
                            {/* Decorative Punch Holes */}
                            <Box
                                position="absolute"
                                top={{ base: '-12px', lg: '-12px' }}
                                left={{ base: '50%', lg: '50%' }}
                                transform="translateX(-50%)"
                                w="24px"
                                h="24px"
                                bg="#052c1e"
                                borderRadius="full"
                                border="2px solid"
                                borderColor="whiteAlpha.200"
                                boxShadow="inset 0 2px 4px rgba(0,0,0,0.5)"
                            />
                            <Box
                                position="absolute"
                                bottom={{ base: '-12px', lg: '-12px' }}
                                left={{ base: '50%', lg: '50%' }}
                                transform="translateX(-50%)"
                                w="24px"
                                h="24px"
                                bg="#052c1e"
                                borderRadius="full"
                                border="2px solid"
                                borderColor="whiteAlpha.200"
                                boxShadow="inset 0 2px 4px rgba(0,0,0,0.5)"
                            />
                        </Box>

                        {/* Form Section (The Ticket Stub) */}
                        <VStack
                            align={{ base: 'stretch', lg: 'flex-end' }}
                            spacing={6}
                            w={{ base: '100%', lg: 'md' }}
                            transition="all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            _groupHover={{
                                transform: {
                                    lg: 'translateX(-10px) rotate(0.5deg)',
                                },
                            }}
                        >
                            <Box
                                position="relative"
                                w="100%"
                                bg="rgba(0, 0, 0, 0.4)"
                                p={1.5}
                                borderRadius="20px"
                                border="2px solid"
                                borderColor="whiteAlpha.300"
                                backdropFilter="blur(25px)"
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                _focusWithin={{
                                    borderColor: 'brand.green',
                                    boxShadow:
                                        '0 0 0 4px rgba(54, 163, 123, 0.15)',
                                    bg: 'rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                <HStack spacing={0}>
                                    <Input
                                        placeholder="your@email.com"
                                        variant="unstyled"
                                        color="white"
                                        px={6}
                                        fontSize="md"
                                        fontWeight="medium"
                                        _placeholder={{
                                            color: 'whiteAlpha.400',
                                        }}
                                    />
                                    <Button
                                        bg="brand.green"
                                        color="white"
                                        px={8}
                                        height="48px"
                                        borderRadius="14px"
                                        fontSize="sm"
                                        fontWeight="bold"
                                        textTransform="uppercase"
                                        letterSpacing="0.05em"
                                        transition="all 0.2s ease"
                                        _hover={{
                                            bg: '#2d8a68',
                                            transform: 'translateY(-1px)',
                                            boxShadow:
                                                '0 4px 12px rgba(54, 163, 123, 0.3)',
                                        }}
                                        _active={{
                                            transform: 'translateY(0)',
                                            filter: 'brightness(0.9)',
                                        }}
                                    >
                                        Save My Seat
                                    </Button>
                                </HStack>
                            </Box>
                            <VStack
                                align={{ base: 'center', lg: 'flex-end' }}
                                spacing={1}
                            >
                                <Text
                                    color="whiteAlpha.500"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    px={4}
                                >
                                    Limited availability for early access
                                </Text>
                                <Text
                                    color="whiteAlpha.400"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    px={4}
                                >
                                    No spam, unsubscribe anytime.
                                </Text>
                            </VStack>
                        </VStack>
                    </Flex>
                </Box>
            </Container>
        </Box>
    );
};

export default NewsletterSection;
