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
    description: React.ReactNode;
    iconBg: string;
    iconColor: string;
}) => (
    <Box
        bg="card.white"
        p={8}
        borderRadius="32px"
        border="1px solid"
        borderColor="border.lightGray"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.03)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
            borderColor: iconBg,
        }}
        position="relative"
        overflow="hidden"
    >
        <HStack spacing={5} mb={4} align="center">
            <Flex
                w="56px"
                h="56px"
                bg={iconBg}
                color={iconColor}
                borderRadius="16px"
                align="center"
                justify="center"
                fontSize="28px"
                boxShadow={`0 8px 16px -4px ${iconBg}4D`}
            >
                <Icon as={icon} />
            </Flex>
            <Heading fontSize="2xl" fontWeight="bold" color="text.primary">
                {title}
            </Heading>
        </HStack>
        <Text
            color="text.secondary"
            fontSize="lg"
            lineHeight="tall"
            fontWeight="medium"
        >
            {description}
        </Text>
    </Box>
);

const Highlight = ({
    children,
    color = 'pink',
}: {
    children: React.ReactNode;
    color?: 'pink' | 'green';
}) => (
    <Box
        as="span"
        color={color === 'pink' ? 'brand.pink' : 'brand.green'}
        fontWeight="bold"
        position="relative"
        whiteSpace="nowrap"
    >
        {children}
        <Box
            as="span"
            position="absolute"
            bottom="1px"
            left="-2px"
            right="-2px"
            height="35%"
            bg={color === 'pink' ? 'brand.pink' : 'brand.green'}
            opacity={0.08}
            zIndex={-1}
            borderRadius="sm"
        />
    </Box>
);

const FeaturesSection = () => {
    return (
        <Box bg="bg.default" py={{ base: 8, md: 12 }} width="100%">
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
                                fontSize={{ base: '4xl', md: '6xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.03em"
                                lineHeight="shorter"
                            >
                                <Highlight color="pink">3 Steps</Highlight> to
                                the <Highlight color="green">Flop</Highlight>.
                            </Heading>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                color="text.secondary"
                                lineHeight="tall"
                                fontWeight="medium"
                                maxW="2xl"
                            >
                                We handled the tech so you can handle the cards.{' '}
                                <Box
                                    as="span"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    No downloads
                                </Box>
                                ,{' '}
                                <Box
                                    as="span"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    no updates
                                </Box>
                                , just pure poker action.
                            </Text>
                        </VStack>

                        <VStack spacing={6} align="stretch" width="100%">
                            <FeatureCard
                                icon={IoWallet}
                                iconBg="brand.green"
                                iconColor="white"
                                title="Jump In Instantly"
                                description={
                                    <>
                                        Use what you have—
                                        <Highlight color="green">
                                            Google
                                        </Highlight>
                                        ,{' '}
                                        <Highlight color="green">
                                            Discord
                                        </Highlight>
                                        , or your{' '}
                                        <Highlight color="green">
                                            Wallet
                                        </Highlight>
                                        . Or just play for free as a{' '}
                                        <Box
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                        >
                                            Guest
                                        </Box>
                                        . No sign-up forms required.
                                    </>
                                }
                            />
                            <FeatureCard
                                icon={MdTableBar}
                                iconBg="blue.500"
                                iconColor="white"
                                title="Host Your Table"
                                description={
                                    <>
                                        Spin up a{' '}
                                        <Highlight color="pink">
                                            private room
                                        </Highlight>
                                        . Set the blinds, choose the game speed,
                                        and control exactly who sits down. It’s{' '}
                                        <Highlight color="pink">
                                            your rules
                                        </Highlight>
                                        .
                                    </>
                                }
                            />
                            <FeatureCard
                                icon={HiLink}
                                iconBg="purple.500"
                                iconColor="white"
                                title="Share & Play"
                                description={
                                    <>
                                        Drop the link in your group chat.
                                        Friends join instantly on{' '}
                                        <Highlight color="green">
                                            any browser or device
                                        </Highlight>
                                        .{' '}
                                        <Box
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                        >
                                            No app store downloads
                                        </Box>
                                        , ever.
                                    </>
                                }
                            />
                        </VStack>
                    </VStack>

                    {/* Right Side: Video Placeholder */}
                    <Box
                        bg="card.white"
                        borderRadius="48px"
                        width="100%"
                        height={{ base: '400px', md: '500px', lg: '700px' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="border.lightGray"
                        boxShadow="2xl"
                    >
                        {/* Background Gradient */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bgGradient="radial(circle at 20% 20%, brand.pink, transparent 40%), radial(circle at 80% 80%, brand.green, transparent 40%)"
                            opacity={0.03}
                        />

                        {/* Complex Grid */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            backgroundImage="radial-gradient(circle, #000 1px, transparent 1px)"
                            backgroundSize="40px 40px"
                            opacity={0.05}
                            _dark={{
                                backgroundImage:
                                    'radial-gradient(circle, #fff 1px, transparent 1px)',
                            }}
                        />

                        <VStack spacing={6} zIndex={1}>
                            <Box
                                bg="card.white"
                                p={6}
                                borderRadius="full"
                                boxShadow="0 20px 40px rgba(235, 11, 92, 0.2)"
                                cursor="pointer"
                                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                _hover={{
                                    transform: 'scale(1.15) rotate(5deg)',
                                }}
                            >
                                <Box
                                    width="0"
                                    height="0"
                                    borderTop="20px solid transparent"
                                    borderBottom="20px solid transparent"
                                    borderLeft="30px solid"
                                    borderLeftColor="brand.pink"
                                    ml={2}
                                />
                            </Box>
                            <VStack spacing={1}>
                                <Text
                                    color="text.primary"
                                    fontWeight="900"
                                    fontSize="2xl"
                                    letterSpacing="0.1em"
                                >
                                    WATCH DEMO
                                </Text>
                                <Text
                                    color="text.secondary"
                                    fontWeight="bold"
                                    fontSize="md"
                                    opacity={0.6}
                                >
                                    SEE HOW IT WORKS
                                </Text>
                            </VStack>
                        </VStack>

                        {/* Decorative floating elements */}
                        <Box
                            position="absolute"
                            top="10%"
                            right="10%"
                            w="80px"
                            h="110px"
                            bg="card.white"
                            borderRadius="12px"
                            border="1px solid"
                            borderColor="border.lightGray"
                            transform="rotate(15deg)"
                            boxShadow="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="40px"
                            color="brand.pink"
                        >
                            ♥
                        </Box>
                        <Box
                            position="absolute"
                            bottom="15%"
                            left="12%"
                            w="80px"
                            h="110px"
                            bg="card.white"
                            borderRadius="12px"
                            border="1px solid"
                            borderColor="border.lightGray"
                            transform="rotate(-12deg)"
                            boxShadow="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="40px"
                            color="text.primary"
                        >
                            ♠
                        </Box>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default FeaturesSection;
