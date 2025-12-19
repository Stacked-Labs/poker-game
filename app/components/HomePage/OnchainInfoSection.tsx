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
    Link,
    Image,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdLock, MdVisibility, MdArrowForward } from 'react-icons/md';
import React from 'react';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const OnchainInfoSection = () => {
    return (
        <Box bg="bg.default" py={{ base: 12, md: 20 }} width="100%">
            <Container maxW="container.xl">
                <VStack spacing={20} align="stretch">
                    {/* Part 1: Why Onchain? */}
                    <Box
                        bg="card.white"
                        borderRadius="32px"
                        p={{ base: 8, md: 16 }}
                        border="1px solid"
                        borderColor="border.lightGray"
                        boxShadow="0 10px 40px rgba(0,0,0,0.04)"
                    >
                        <VStack align="start" spacing={8}>
                            <HStack spacing={4}>
                                <Box
                                    w="40px"
                                    h="4px"
                                    bg="orange.400"
                                    borderRadius="full"
                                />
                                <Text
                                    color="text.gray600"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    letterSpacing="0.1em"
                                    textTransform="uppercase"
                                >
                                    Why Onchain?
                                </Text>
                            </HStack>

                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                            >
                                Trust, but verify everything.
                            </Heading>

                            <VStack align="start" spacing={6} maxW="3xl">
                                <Text
                                    fontSize="lg"
                                    color="text.secondary"
                                    lineHeight="tall"
                                >
                                    Traditional online poker requires you to
                                    trust the &quot;House&quot;. You trust them
                                    not to rig the deck, not to steal your
                                    funds, and to actually let you cash out.
                                </Text>
                                <Text
                                    fontSize="lg"
                                    color="text.secondary"
                                    lineHeight="tall"
                                >
                                    Stacked uses <b>Smart Contracts</b>. These
                                    are pieces of code that live on the internet
                                    that no one can change once deployed. The
                                    code holds the money, the code deals the
                                    cards, and the code pays the winner. We
                                    don&apos;t touch your money.
                                </Text>
                            </VStack>

                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={8}
                                width="100%"
                                pt={4}
                            >
                                <Box
                                    position="relative"
                                    p="2px"
                                    borderRadius="30px"
                                    bgGradient="linear(to-r, brand.green, brand.navy, brand.pink, brand.green)"
                                    backgroundSize="300% 300%"
                                    animation={`${gradientMove} 6s linear infinite`}
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: 'translateY(-4px)',
                                        boxShadow:
                                            '0 12px 30px rgba(54, 163, 123, 0.2)',
                                    }}
                                >
                                    <Box
                                        bg="card.white"
                                        p={10}
                                        borderRadius="28px"
                                        height="100%"
                                    >
                                        <HStack spacing={4} mb={5}>
                                            <Icon
                                                as={MdLock}
                                                color="brand.green"
                                                fontSize="28px"
                                            />
                                            <Heading
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color="text.primary"
                                                letterSpacing="-0.01em"
                                            >
                                                Self-Custody
                                            </Heading>
                                        </HStack>
                                        <Text
                                            color="text.secondary"
                                            lineHeight="tall"
                                            fontSize="md"
                                            fontWeight="medium"
                                        >
                                            Your funds stay in your wallet until
                                            you sit at a table. No need to
                                            deposit to a site balance.
                                        </Text>
                                    </Box>
                                </Box>

                                <Box
                                    position="relative"
                                    p="2px"
                                    borderRadius="30px"
                                    bgGradient="linear(to-r, blue.400, brand.navy, brand.yellow, blue.400)"
                                    backgroundSize="300% 300%"
                                    animation={`${gradientMove} 6s linear infinite`}
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: 'translateY(-4px)',
                                        boxShadow:
                                            '0 12px 30px rgba(66, 153, 225, 0.2)',
                                    }}
                                >
                                    <Box
                                        bg="card.white"
                                        p={10}
                                        borderRadius="28px"
                                        height="100%"
                                    >
                                        <HStack spacing={4} mb={5}>
                                            <Icon
                                                as={MdVisibility}
                                                color="blue.400"
                                                fontSize="28px"
                                            />
                                            <Heading
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color="text.primary"
                                                letterSpacing="-0.01em"
                                            >
                                                Transparency
                                            </Heading>
                                        </HStack>
                                        <Text
                                            color="text.secondary"
                                            lineHeight="tall"
                                            fontSize="md"
                                            fontWeight="medium"
                                        >
                                            Every transaction and shuffle is
                                            recorded on the public ledger for
                                            full accountability.
                                        </Text>
                                    </Box>
                                </Box>
                            </SimpleGrid>
                        </VStack>
                    </Box>

                    {/* Part 2: Chips are Tokens */}
                    <Box
                        bg="brand.darkNavy"
                        borderRadius="32px"
                        p={{ base: 8, md: 16 }}
                        position="relative"
                        overflow="hidden"
                    >
                        {/* Subtle Glows */}
                        <Box
                            position="absolute"
                            top="-20%"
                            right="-10%"
                            width="40%"
                            height="140%"
                            bgGradient="radial(circle, rgba(54, 163, 123, 0.1) 0%, transparent 70%)"
                            filter="blur(40px)"
                            pointerEvents="none"
                        />

                        <SimpleGrid
                            columns={{ base: 1, lg: 2 }}
                            spacing={12}
                            alignItems="center"
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
                                    NEW TO CRYPTO?
                                </Badge>

                                <Heading
                                    fontSize={{ base: '3xl', md: '4xl' }}
                                    fontWeight="extrabold"
                                    color="white"
                                >
                                    Chips are Tokens (ERC-20s)
                                </Heading>

                                <VStack align="start" spacing={6}>
                                    <Text
                                        fontSize="lg"
                                        color="brand.lightGray"
                                        lineHeight="tall"
                                    >
                                        In Stacked, your poker chips are
                                        represented by digital tokens, often
                                        called ERC-20s on Ethereum. Think of
                                        them exactly like casino chips, but
                                        digital.
                                    </Text>
                                    <Text
                                        fontSize="lg"
                                        color="brand.lightGray"
                                        lineHeight="tall"
                                    >
                                        Instead of buying chips from a cashier
                                        cage, you swap digital currency (like
                                        USDC) for chips directly through your
                                        wallet via our Thirdweb integration.
                                    </Text>
                                </VStack>

                                <Link
                                    href="#"
                                    color="brand.yellow"
                                    fontWeight="bold"
                                    display="flex"
                                    alignItems="center"
                                    _hover={{
                                        textDecoration: 'none',
                                        opacity: 0.8,
                                    }}
                                >
                                    Read our beginner&apos;s guide{' '}
                                    <Icon as={MdArrowForward} ml={2} />
                                </Link>
                            </VStack>

                            {/* Conversion Graphic */}
                            <Box
                                bg="rgba(255, 255, 255, 0.05)"
                                p={{ base: 8, md: 12 }}
                                borderRadius="24px"
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.1)"
                                backdropFilter="blur(10px)"
                            >
                                <VStack spacing={8} align="stretch">
                                    <HStack
                                        justify="center"
                                        spacing={{ base: 4, md: 8 }}
                                    >
                                        <HStack spacing={4}>
                                            <Image
                                                src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                                                alt="USDC"
                                                boxSize="48px"
                                            />
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="xl"
                                            >
                                                USDC
                                            </Text>
                                        </HStack>

                                        <Icon
                                            as={MdArrowForward}
                                            color="gray.500"
                                            fontSize="24px"
                                        />

                                        <HStack spacing={4}>
                                            <Box
                                                position="relative"
                                                w="52px"
                                                h="52px"
                                                borderRadius="full"
                                                bg="brand.green"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                border="4px dashed rgba(255,255,255,0.4)"
                                                boxShadow="0 4px 10px rgba(0,0,0,0.3), inset 0 0 15px rgba(0,0,0,0.2)"
                                                _before={{
                                                    content: '""',
                                                    position: 'absolute',
                                                    width: '75%',
                                                    height: '75%',
                                                    borderRadius: 'full',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                }}
                                            >
                                                <Text
                                                    color="white"
                                                    fontWeight="black"
                                                    fontSize="xl"
                                                    zIndex={1}
                                                >
                                                    S
                                                </Text>
                                            </Box>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="xl"
                                            >
                                                Chips
                                            </Text>
                                        </HStack>
                                    </HStack>

                                    <Box
                                        h="1px"
                                        bg="rgba(255, 255, 255, 0.1)"
                                    />

                                    <Text
                                        color="gray.400"
                                        fontSize="sm"
                                        textAlign="center"
                                        lineHeight="tall"
                                    >
                                        1 USDC = 1 Chip. The exchange rate is
                                        fixed, stable, and handled automatically
                                        by the smart contract.
                                    </Text>
                                </VStack>
                            </Box>
                        </SimpleGrid>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default OnchainInfoSection;
