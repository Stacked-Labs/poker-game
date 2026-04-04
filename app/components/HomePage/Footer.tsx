'use client';

import React from 'react';
import {
    Box,
    Container,
    SimpleGrid,
    Stack,
    Text,
    Flex,
    Link,
    Icon,
    HStack,
    VStack,
    Divider,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { FaDiscord } from 'react-icons/fa';
import { FaTelegram } from 'react-icons/fa6';
import { RiTwitterXLine } from 'react-icons/ri';
import FloatingDecor from './FloatingDecor';

const Footer = () => {
    return (
        <Box
            bg="bg.default"
            color="text.primary"
            pt={16}
            pb={8}
            position="relative"
            overflow="hidden"
            borderTop="1px solid"
            borderColor="border.lightGray"
        >
            <FloatingDecor density="minimal" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 4 }}
                    spacing={{ base: 10, md: 12, lg: 16 }}
                    mb={12}
                >
                    {/* Brand Section */}
                    <Stack spacing={6}>
                        <HStack spacing={3} align="center">
                            <Box
                                position="relative"
                                boxSize={{ base: '32px', md: '36px', lg: '40px' }}
                                flexShrink={0}
                            >
                                <Image
                                    src="/IconLogo.png"
                                    alt="Stacked Logo"
                                    fill
                                    sizes="(max-width: 48em) 32px, (max-width: 62em) 36px, 40px"
                                    quality={60}
                                    style={{ objectFit: 'contain' }}
                                />
                            </Box>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="extrabold"
                                letterSpacing="0.04em"
                                color="text.primary"
                            >
                                STACKED
                            </Text>
                        </HStack>
                        <Text
                            color="text.muted"
                            fontSize="sm"
                            lineHeight="1.7"
                            maxW="280px"
                        >
                            The easiest way to play poker with friends, onchain.
                            No downloads, no hassle — just pure poker action.
                        </Text>
                        <HStack spacing={3} pt={1}>
                            <Link
                                href="https://x.com/stacked_poker"
                                isExternal
                                boxSize="38px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="card.lightGray"
                                color="text.secondary"
                                borderRadius="lg"
                                _hover={{
                                    bg: 'brand.pink',
                                    color: 'white',
                                    transform:
                                        'translateY(-2px) scale(1.05)',
                                    boxShadow: 'glow-pink',
                                }}
                                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            >
                                <Icon as={RiTwitterXLine} boxSize={4} />
                            </Link>
                            <Link
                                href="https://discord.gg/347RBVcvpn"
                                isExternal
                                boxSize="38px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="card.lightGray"
                                color="text.secondary"
                                borderRadius="lg"
                                _hover={{
                                    bg: 'brand.pink',
                                    color: 'white',
                                    transform:
                                        'translateY(-2px) scale(1.05)',
                                    boxShadow: 'glow-pink',
                                }}
                                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            >
                                <Icon as={FaDiscord} boxSize={4} />
                            </Link>
                            <Link
                                href="https://t.me/stackedpoker"
                                isExternal
                                boxSize="38px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="card.lightGray"
                                color="text.secondary"
                                borderRadius="lg"
                                _hover={{
                                    bg: 'brand.pink',
                                    color: 'white',
                                    transform:
                                        'translateY(-2px) scale(1.05)',
                                    boxShadow: 'glow-pink',
                                }}
                                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            >
                                <Icon as={FaTelegram} boxSize={4} />
                            </Link>
                        </HStack>
                    </Stack>

                    <VStack align="flex-start" spacing={3}>
                        <Text
                            fontWeight="bold"
                            fontSize="xs"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.1em"
                            mb={1}
                        >
                            Product
                        </Text>
                        <Link
                            href="/"
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            Play Now
                        </Link>
                        <Link
                            href="/create-game"
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            Create Table
                        </Link>
                    </VStack>

                    {/* Resources Links */}
                    <VStack align="flex-start" spacing={3}>
                        <Text
                            fontWeight="bold"
                            fontSize="xs"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.1em"
                            mb={1}
                        >
                            Resources
                        </Text>
                        <Link
                            href="https://docs.stackedpoker.io/docs/introduction"
                            isExternal
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="#faq"
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            FAQs
                        </Link>
                        <Link
                            href="#how-to-play"
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            How to Play
                        </Link>
                    </VStack>

                    {/* Support Section */}
                    <VStack align="flex-start" spacing={3}>
                        <Text
                            fontWeight="bold"
                            fontSize="xs"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.1em"
                            mb={1}
                        >
                            Support
                        </Text>
                        <Link
                            href="https://discord.gg/347RBVcvpn"
                            isExternal
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            Get Support
                        </Link>
                        <Link
                            href="https://x.com/stacked_poker"
                            isExternal
                            color="text.secondary"
                            fontSize="sm"
                            _hover={{
                                color: 'brand.pink',
                                transform: 'translateX(2px)',
                            }}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        >
                            Contact Us
                        </Link>
                    </VStack>
                </SimpleGrid>

                <Divider
                    borderColor="border.lightGray"
                    opacity={0.6}
                    mb={8}
                />

                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="center"
                    gap={3}
                >
                    <Text color="text.muted" fontSize="xs">
                        &copy; {new Date().getFullYear()} Stacked Poker. All
                        rights reserved.
                    </Text>
                    <HStack
                        spacing={4}
                        divider={
                            <Box
                                w="3px"
                                h="3px"
                                borderRadius="full"
                                bg="text.muted"
                                opacity={0.4}
                            />
                        }
                    >
                        <Text
                            color="text.muted"
                            fontSize="xs"
                            letterSpacing="0.02em"
                        >
                            Built with Thirdweb
                        </Text>
                        <Text
                            color="text.muted"
                            fontSize="xs"
                            letterSpacing="0.02em"
                        >
                            Made for Onchain Friends
                        </Text>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
