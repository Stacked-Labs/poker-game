'use client';

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Icon,
} from '@chakra-ui/react';
import { IoWallet } from 'react-icons/io5';
import { MdTableBar } from 'react-icons/md';
import { HiLink } from 'react-icons/hi';
import React from 'react';

const FeatureCard = ({
    icon,
    title,
    description,
    iconBg,
    iconColor,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
}) => (
    <Box
        bg="white"
        p={6}
        borderRadius="24px"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
        <HStack spacing={4} mb={3} align="center">
            <Flex
                w="48px"
                h="48px"
                bg={iconBg}
                color={iconColor}
                borderRadius="12px"
                align="center"
                justify="center"
                fontSize="24px"
            >
                <Icon as={icon} />
            </Flex>
            <Heading fontSize="xl" fontWeight="bold" color="brand.darkNavy">
                {title}
            </Heading>
        </HStack>
        <Text color="brand.navy" fontSize="md" lineHeight="tall">
            {description}
        </Text>
    </Box>
);

const FeaturesSection = () => {
    return (
        <Box bg="white" py={{ base: 12, md: 20 }} width="100%">
            <Container maxW="container.xl">
                <SimpleGrid
                    columns={{ base: 1, lg: 2 }}
                    spacing={{ base: 12, lg: 20 }}
                    alignItems="center"
                >
                    {/* Left Side: Text and Features */}
                    <VStack align="start" spacing={10}>
                        <VStack align="start" spacing={6}>
                            <Heading
                                fontSize={{ base: '3xl', md: '5xl' }}
                                fontWeight="extrabold"
                                color="brand.darkNavy"
                                letterSpacing="-0.02em"
                            >
                                Simply Put...
                            </Heading>
                            <Text
                                fontSize={{ base: 'lg', md: 'xl' }}
                                color="brand.navy"
                                lineHeight="tall"
                                fontWeight="medium"
                                maxW="2xl"
                            >
                                Stacked is poker for the internet age. We
                                stripped away the casinos, the sketchy
                                downloads, and the account managers. It&apos;s
                                just you, your friends, and a deck of cards on
                                the blockchain.
                            </Text>
                        </VStack>

                        <VStack spacing={6} align="stretch" width="100%">
                            <FeatureCard
                                icon={IoWallet}
                                iconBg="brand.green"
                                iconColor="white"
                                title="Connect Wallet"
                                description="Use MetaMask, Phantom, or any Web3 wallet to log in instantly."
                            />
                            <FeatureCard
                                icon={MdTableBar}
                                iconBg="blue.500"
                                iconColor="white"
                                title="Create Table"
                                description="Set your blinds, buy-in amounts, and game speed. It's your room."
                            />
                            <FeatureCard
                                icon={HiLink}
                                iconBg="purple.500"
                                iconColor="white"
                                title="Share Link"
                                description="Send the invite link to friends. They click, connect, and play."
                            />
                        </VStack>
                    </VStack>

                    {/* Right Side: Video Placeholder */}
                    <Box
                        bg="brand.lightGray"
                        borderRadius="32px"
                        width="100%"
                        height={{ base: '300px', md: '500px', lg: '600px' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <VStack spacing={4}>
                            <Box
                                bg="white"
                                p={4}
                                borderRadius="full"
                                boxShadow="lg"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ transform: 'scale(1.1)' }}
                            >
                                <Box
                                    width="0"
                                    height="0"
                                    borderTop="15px solid transparent"
                                    borderBottom="15px solid transparent"
                                    borderLeft="25px solid"
                                    borderLeftColor="brand.pink"
                                    ml={1}
                                />
                            </Box>
                            <Text
                                color="brand.navy"
                                fontWeight="bold"
                                fontSize="lg"
                            >
                                VIDEO PLACEHOLDER
                            </Text>
                        </VStack>

                        {/* Blueprint decorative lines */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bg="rgba(235, 11, 92, 0.02)"
                            pointerEvents="none"
                            _before={{
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '1px',
                                bg: 'brand.pink',
                                opacity: 0.1,
                                top: '50%',
                            }}
                            _after={{
                                content: '""',
                                position: 'absolute',
                                width: '1px',
                                height: '100%',
                                bg: 'brand.pink',
                                opacity: 0.1,
                                left: '50%',
                            }}
                        />
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default FeaturesSection;
