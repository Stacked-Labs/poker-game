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
        <Box bg="bg.default" color="text.primary" pt={10} pb={6}>
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
                                color="text.primary"
                            >
                                STACKED
                            </Text>
                        </Flex>
                        <Text
                            color="text.secondary"
                            fontSize="md"
                            lineHeight="tall"
                        >
                            The easiest way to play poker with friends, onchain.
                            No downloads, no hassle—just pure poker action.
                        </Text>
                        <HStack spacing={4}>
                            <Link
                                href="https://x.com/stacked_poker"
                                isExternal
                                boxSize="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="card.lightGray"
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
                                href="https://discord.gg/347RBVcvpn"
                                isExternal
                                boxSize="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="card.lightGray"
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

                    <VStack align="flex-start" spacing={4}>
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="text.primary"
                        >
                            Product
                        </Text>
                        <Link
                            href="/"
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Play Now
                        </Link>
                        <Link
                            href="/create-game"
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Create Table
                        </Link>
                    </VStack>

                    {/* Resources Links */}
                    <VStack align="flex-start" spacing={4}>
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="text.primary"
                        >
                            Resources
                        </Text>
                        <Link
                            href="https://docs.stackedpoker.io/docs/introduction"
                            isExternal
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="#faq"
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            FAQs
                        </Link>
                        <Link
                            href="#how-to-play"
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            How to Play
                        </Link>
                    </VStack>

                    {/* Support Section */}
                    <VStack align="flex-start" spacing={4}>
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="text.primary"
                        >
                            Support
                        </Text>
                        <Link
                            href="https://discord.gg/347RBVcvpn"
                            isExternal
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Get Support
                        </Link>
                        <Link
                            href="https://x.com/stacked_poker"
                            isExternal
                            color="text.secondary"
                            _hover={{ color: 'brand.pink' }}
                            transition="0.2s"
                        >
                            Contact Us
                        </Link>
                    </VStack>
                </SimpleGrid>

                <Divider borderColor="border.lightGray" mb={6} />

                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="center"
                    gap={4}
                >
                    <Text color="text.gray600" fontSize="sm">
                        © {new Date().getFullYear()} Stacked Poker. All rights
                        reserved.
                    </Text>
                    <HStack spacing={6}>
                        <Text color="text.gray600" fontSize="xs">
                            Built with Thirdweb
                        </Text>
                        <Text color="text.gray600" fontSize="xs">
                            Made for Onchain Friends
                        </Text>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
