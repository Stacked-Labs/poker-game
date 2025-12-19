'use client';

import React from 'react';
import {
    Box,
    Container,
    SimpleGrid,
    Stack,
    Text,
    Flex,
    Image,
    Link,
    Icon,
    HStack,
    VStack,
    Divider,
} from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';
import { RiTwitterXLine } from 'react-icons/ri';
import { HiLightningBolt } from 'react-icons/hi';

const Footer = () => {
    return (
        <Box bg="brand.lightGray" color="brand.darkNavy" pt={16} pb={8}>
            <Container maxW="container.xl">
                <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 4 }}
                    spacing={12}
                    mb={8}
                >
                    {/* Brand Section */}
                    <Stack spacing={6}>
                        <Flex alignItems="center">
                            <Image
                                src="/IconLogo.png"
                                alt="Stacked Logo"
                                boxSize="48px"
                                objectFit="contain"
                            />
                            <Text
                                ml={3}
                                fontSize="2xl"
                                fontWeight="extrabold"
                                letterSpacing="tight"
                            >
                                STACKED
                            </Text>
                        </Flex>
                        <Text
                            color="brand.navy"
                            fontSize="md"
                            lineHeight="tall"
                        >
                            The easiest way to play poker with friends,
                            on-chain. No downloads, no hassle—just pure poker
                            action.
                        </Text>
                        <HStack spacing={4}>
                            <Link
                                href="https://x.com/stacked_poker"
                                isExternal
                                boxSize="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="rgba(0, 0, 0, 0.05)"
                                borderRadius="full"
                                _hover={{
                                    bg: 'brand.pink',
                                    color: 'white',
                                }}
                                transition="all 0.2s"
                            >
                                <Icon as={RiTwitterXLine} boxSize={5} />
                            </Link>
                            <Link
                                href="https://discord.gg/XMWfksjt"
                                isExternal
                                boxSize="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="rgba(0, 0, 0, 0.05)"
                                borderRadius="full"
                                _hover={{
                                    bg: 'brand.pink',
                                    color: 'white',
                                }}
                                transition="all 0.2s"
                            >
                                <Icon as={FaDiscord} boxSize={5} />
                            </Link>
                        </HStack>
                    </Stack>

                    {/* Product Links */}
                    <VStack align="flex-start" spacing={4}>
                        <Text fontWeight="bold" fontSize="lg">
                            Product
                        </Text>
                        <Link
                            href="/"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Play Now
                        </Link>
                        <Link
                            href="/create-game"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Create Table
                        </Link>
                    </VStack>

                    {/* Resources Links */}
                    <VStack align="flex-start" spacing={4}>
                        <Text fontWeight="bold" fontSize="lg">
                            Resources
                        </Text>
                        <Link
                            href="https://docs.stackedpoker.io/docs/introduction"
                            isExternal
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="#faq"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            FAQs
                        </Link>
                        <Link
                            href="#how-to-play"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            How to Play
                        </Link>
                    </VStack>

                    {/* Support Section */}
                    <VStack align="flex-start" spacing={4}>
                        <Text fontWeight="bold" fontSize="lg">
                            Support
                        </Text>
                        <Link
                            href="https://discord.gg/XMWfksjt"
                            isExternal
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Get Support
                        </Link>
                        <Link
                            href="https://x.com/stacked_poker"
                            isExternal
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Contact Us
                        </Link>
                    </VStack>
                </SimpleGrid>

                <Divider borderColor="rgba(0, 0, 0, 0.1)" mb={6} />

                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="center"
                    gap={4}
                >
                    <Text color="gray.500" fontSize="sm">
                        © {new Date().getFullYear()} Stacked Poker. All rights
                        reserved.
                    </Text>
                    <HStack spacing={6}>
                        <Text color="gray.500" fontSize="xs">
                            Built with Thirdweb
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                            Made for On-Chain Friends
                        </Text>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
