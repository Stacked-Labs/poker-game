'use client';

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    SimpleGrid,
    List,
    ListItem,
    ListIcon,
    Badge,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { MdCheckCircle, MdFlashOn } from 'react-icons/md';
import { SiThirdweb } from 'react-icons/si';
import { FaDiscord, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiTwitterXLine } from 'react-icons/ri';
import React from 'react';

const CommunitySection = () => {
    const authOptions: {
        name: string;
        icon: string | React.ElementType;
        color?: string;
        isReactIcon?: boolean;
    }[] = [
        {
            name: 'Base',
            icon: '/networkLogos/base-logo.png',
            color: '#0052FF', // Base Blue
        },
        {
            name: 'Google',
            icon: FcGoogle,
            isReactIcon: true,
        },
        {
            name: 'X',
            icon: RiTwitterXLine,
            isReactIcon: true,
            color: 'text.primary',
        },
        {
            name: 'Discord',
            icon: FaDiscord,
            isReactIcon: true,
            color: '#5865F2',
        },
        {
            name: 'Apple',
            icon: FaApple,
            isReactIcon: true,
            color: 'text.primary',
        },
    ];

    return (
        <Box bg="bg.default" py={{ base: 4, md: 8 }} width="100%">
            <Container maxW="container.xl">
                {/* Header Section */}
                <VStack
                    spacing={6}
                    textAlign="center"
                    mb={{ base: 10, md: 12 }}
                >
                    <Heading
                        fontSize={{ base: '3xl', md: '6xl', lg: '7xl' }}
                        fontWeight="extrabold"
                        lineHeight={1.2}
                        color="text.primary"
                    >
                        Poker Night is Back 🤑
                    </Heading>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        color="text.secondary"
                        maxW="2xl"
                        mx="auto"
                        fontWeight="medium"
                    >
                        We brought the Friday night home game to your browser.
                        Talk trash in the chat, throw emojis at your friends,
                        and settle the score without leaving your couch.
                    </Text>
                </VStack>

                {/* Content Rows */}
                <VStack spacing={{ base: 16, md: 24 }} align="stretch">
                    {/* Row 1: Image Left, Text Right */}
                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={{ base: 12, lg: 24 }}
                        alignItems="center"
                    >
                        <Box
                            bg="card.lightGray"
                            borderRadius="3xl"
                            height={{ base: '300px', md: '400px' }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="border.lightGray"
                        >
                            <Image
                                src="/homepage/lobbyPic.png"
                                alt="Poker lobby"
                                fill
                                sizes="(max-width: 992px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </Box>

                        <VStack align="start" spacing={6}>
                            <Badge
                                bg="rgba(54, 163, 123, 0.1)"
                                color="brand.green"
                                variant="subtle"
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="wider"
                            >
                                <Icon as={MdFlashOn} mr={1} />
                                ZERO BRAINPOWER NEEDED
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Play in seconds.
                                <br />
                                Just send the link.
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                You didn&apos;t come here to fill out forms. You
                                came to play. Test our game engine, check the
                                vibes, and bluff your friends using a completely
                                anonymous guest account.{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="brand.green"
                                >
                                    No strings attached.
                                </Text>
                            </Text>
                            <List spacing={4}>
                                {[
                                    {
                                        main: '100% Anonymous',
                                        detail: "We don't want your data",
                                    },
                                    {
                                        main: 'No Downloads',
                                        detail: 'Browser-based action',
                                    },
                                    {
                                        main: 'Free to Play',
                                        detail: 'Practice with free chips',
                                    },
                                ].map((item) => (
                                    <ListItem
                                        key={item.main}
                                        display="flex"
                                        alignItems="center"
                                        fontSize="md"
                                        color="text.secondary"
                                    >
                                        <ListIcon
                                            as={MdCheckCircle}
                                            color="brand.green"
                                            fontSize="xl"
                                        />
                                        <Text
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                        >
                                            {item.main}
                                        </Text>
                                        <Text
                                            as="span"
                                            fontWeight="normal"
                                            color="text.secondary"
                                            opacity={0.7}
                                            ml={1}
                                        >
                                            ({item.detail})
                                        </Text>
                                    </ListItem>
                                ))}
                            </List>
                        </VStack>
                    </SimpleGrid>

                    {/* Row 2: Text Left, Image Right */}
                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={{ base: 12, lg: 24 }}
                        alignItems="center"
                    >
                        <VStack
                            align="start"
                            spacing={6}
                            order={{ base: 2, lg: 1 }}
                        >
                            <Badge
                                bg="rgba(133, 93, 205, 0.1)"
                                color="purple.600"
                                variant="subtle"
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                textTransform="uppercase"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="wider"
                            >
                                <Icon as={SiThirdweb} mr={2} />
                                POWERED BY THIRDWEB
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Auth & Crypto Play
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                Ready for real stakes? We use{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="purple.600"
                                >
                                    Thirdweb
                                </Text>{' '}
                                for secure payments and seamless sign-in
                                options. This ensures your connection is safe,
                                fast, and compatible with modern standards.
                            </Text>

                            <Box
                                bg="purple.600"
                                p={8}
                                borderRadius="2xl"
                                width="100%"
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.2)"
                                boxShadow="xl"
                            >
                                <VStack align="start" spacing={4}>
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        color="text.white"
                                    >
                                        How it works:
                                    </Text>
                                    <Text fontSize="sm" color="brand.lightGray">
                                        Thirdweb handles the complexity. You
                                        simply log in using your favorite social
                                        account (Google, Discord, X) or connect
                                        your Web3 wallet directly.
                                    </Text>
                                </VStack>
                            </Box>

                            <HStack spacing={3} wrap="wrap">
                                {authOptions.map((option) => (
                                    <HStack
                                        key={option.name}
                                        bg="card.white"
                                        px={4}
                                        py={2.5}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="sm"
                                        spacing={3}
                                        transition="all 0.2s"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'md',
                                        }}
                                    >
                                        <Flex
                                            w="24px"
                                            h="24px"
                                            align="center"
                                            justify="center"
                                            overflow="hidden"
                                        >
                                            {option.isReactIcon ? (
                                                <Icon
                                                    as={
                                                        option.icon as React.ElementType
                                                    }
                                                    color={option.color}
                                                    fontSize="xl"
                                                />
                                            ) : option.icon ? (
                                                <Image
                                                    src={option.icon as string}
                                                    alt={option.name}
                                                    width={24}
                                                    height={24}
                                                    sizes="24px"
                                                    style={{
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    w="100%"
                                                    h="100%"
                                                    bg={option.color}
                                                    borderRadius="full"
                                                />
                                            )}
                                        </Flex>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color="text.secondary"
                                        >
                                            {option.name}
                                        </Text>
                                    </HStack>
                                ))}
                            </HStack>
                        </VStack>

                        <Box
                            height={{ base: '300px', md: '500px' }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            borderRadius="2xl"
                            overflow="hidden"
                            order={{ base: 1, lg: 2 }}
                            transition="transform 0.3s ease"
                            _hover={{ transform: 'scale(1.02)' }}
                        >
                            <Image
                                src="/homepage/thirdwebLogin.png"
                                alt="Thirdweb Login"
                                fill
                                sizes="(max-width: 992px) 100vw, 50vw"
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

export default CommunitySection;
