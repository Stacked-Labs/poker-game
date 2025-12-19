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
    Icon,
} from '@chakra-ui/react';
import { HiArrowRight } from 'react-icons/hi';
import React from 'react';

const NewsletterSection = () => {
    return (
        <Box bg="bg.default" py={{ base: 4, md: 12 }} width="100%">
            <Container maxW="container.xl">
                <Box
                    position="relative"
                    borderRadius={{ base: '24px', md: '32px' }}
                    bg="brand.darkNavy"
                    p={{ base: 8, md: 12 }}
                    overflow="hidden"
                    boxShadow="2xl"
                >
                    {/* Decorative Background Elements */}
                    <Box
                        position="absolute"
                        top="-10%"
                        left="-5%"
                        width="40%"
                        height="120%"
                        bgGradient="radial(circle, rgba(54, 163, 123, 0.15) 0%, transparent 70%)"
                        filter="blur(40px)"
                        pointerEvents="none"
                    />
                    <Box
                        position="absolute"
                        bottom="-20%"
                        right="-10%"
                        width="50%"
                        height="140%"
                        bgGradient="radial(circle, rgba(235, 11, 92, 0.1) 0%, transparent 70%)"
                        filter="blur(60px)"
                        pointerEvents="none"
                    />

                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align={{ base: 'flex-start', lg: 'center' }}
                        gap={{ base: 10, lg: 20 }}
                        position="relative"
                        zIndex={1}
                    >
                        {/* Text Content */}
                        <VStack align="start" spacing={6} maxW="xl">
                            <HStack spacing={3}>
                                <Box
                                    w="8px"
                                    h="8px"
                                    borderRadius="full"
                                    bg="brand.green"
                                />
                                <Text
                                    color="brand.green"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    letterSpacing="0.2em"
                                    textTransform="uppercase"
                                >
                                    Newsletter
                                </Text>
                            </HStack>

                            <Heading
                                color="white"
                                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                                fontWeight="extrabold"
                                lineHeight={1.1}
                                letterSpacing="-0.02em"
                            >
                                Don&apos;t Miss the Next{' '}
                                <Text
                                    as="span"
                                    bgGradient="linear(to-r, brand.yellow, brand.pink)"
                                    bgClip="text"
                                >
                                    Big Tournament
                                </Text>
                            </Heading>

                            <Text
                                color="brand.lightGray"
                                fontSize={{ base: 'md', md: 'lg' }}
                                lineHeight="tall"
                                fontWeight="medium"
                            >
                                Join 15,000+ players getting weekly updates on
                                prize pools, new features, and exclusive
                                community events.
                            </Text>
                        </VStack>

                        {/* Form Section */}
                        <VStack
                            align={{ base: 'stretch', lg: 'flex-end' }}
                            spacing={4}
                            w={{ base: '100%', lg: 'md' }}
                        >
                            <Box
                                position="relative"
                                w="100%"
                                bg="rgba(255, 255, 255, 0.03)"
                                p={1.5}
                                borderRadius="20px"
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.1)"
                                backdropFilter="blur(10px)"
                                transition="all 0.3s"
                                _focusWithin={{
                                    borderColor: 'brand.green',
                                    boxShadow:
                                        '0 0 20px rgba(54, 163, 123, 0.2)',
                                }}
                            >
                                <HStack spacing={0}>
                                    <Input
                                        placeholder="your@email.com"
                                        variant="unstyled"
                                        color="white"
                                        px={4}
                                        fontSize="md"
                                        _placeholder={{ color: 'gray.500' }}
                                    />
                                    <Button
                                        bg="brand.green"
                                        color="white"
                                        px={8}
                                        height="52px"
                                        borderRadius="16px"
                                        fontSize="md"
                                        fontWeight="bold"
                                        _hover={{
                                            bg: 'brand.green',
                                            transform: 'translateY(-1px)',
                                            boxShadow:
                                                '0 4px 12px rgba(54, 163, 123, 0.4)',
                                        }}
                                        _active={{ transform: 'translateY(0)' }}
                                        rightIcon={<Icon as={HiArrowRight} />}
                                    >
                                        Join Now
                                    </Button>
                                </HStack>
                            </Box>
                            <Text
                                color="text.gray600"
                                fontSize="xs"
                                fontWeight="medium"
                                px={2}
                            >
                                No spam, unsubscribe anytime.
                            </Text>
                        </VStack>
                    </Flex>
                </Box>
            </Container>
        </Box>
    );
};

export default NewsletterSection;
