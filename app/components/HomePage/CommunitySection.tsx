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
    Stack,
    HStack,
    Image,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { MdCheckCircle, MdFlashOn } from 'react-icons/md';
import { SiThirdweb } from 'react-icons/si';
import { FaDiscord, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiTwitterXLine } from 'react-icons/ri';
import React from 'react';

const CommunitySection = () => {
    const iconColor = useColorModeValue('#000000', '#FFFFFF');

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
            color: iconColor,
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
            color: iconColor,
        },
    ];

    return (
        <Box bg="bg.default" py={{ base: 8, md: 16 }} width="100%">
            <Container maxW="container.xl">
                {/* Header Section */}
                <VStack
                    spacing={6}
                    textAlign="center"
                    mb={{ base: 10, md: 16 }}
                >
                    <Heading
                        fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                        fontWeight="extrabold"
                        lineHeight={1.2}
                        color="text.primary"
                    >
                        A Social & Interactive{' '}
                        <Text
                            as="span"
                            bgGradient="linear(to-r, brand.yellow, brand.pink)"
                            bgClip="text"
                        >
                            Poker Community
                        </Text>
                    </Heading>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        color="text.secondary"
                        maxW="2xl"
                        mx="auto"
                        fontWeight="medium"
                    >
                        Experience a vibrant, close-knit platform where every
                        hand is a conversation and every game brings people
                        together.
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
                            <Text color="text.gray600" fontWeight="bold">
                                IMAGE PLACEHOLDER
                            </Text>
                            {/* Red X Overlay for the guide */}
                            <Box
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                bg="rgba(235, 11, 92, 0.03)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Box
                                    width="100%"
                                    height="100%"
                                    position="relative"
                                    _before={{
                                        content: '""',
                                        position: 'absolute',
                                        width: '2px',
                                        height: '141%',
                                        bg: 'brand.pink',
                                        opacity: 0.4,
                                        transform: 'rotate(45deg)',
                                        left: '50%',
                                        top: '-20%',
                                    }}
                                    _after={{
                                        content: '""',
                                        position: 'absolute',
                                        width: '2px',
                                        height: '141%',
                                        bg: 'brand.pink',
                                        opacity: 0.4,
                                        transform: 'rotate(-45deg)',
                                        left: '50%',
                                        top: '-20%',
                                    }}
                                />
                            </Box>
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
                                ZERO FRICTION
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Instant Free Play.
                                <br />
                                No Sign-in Required.
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                We believe in &quot;Show up and play&quot;.
                                Create a guest account in one click and sit at a
                                table immediately. It&apos;s the fastest way to
                                play poker online with friends.
                            </Text>
                            <List spacing={4}>
                                {[
                                    'No email address needed',
                                    'No KYC verification',
                                    'Play immediately with free chips',
                                ].map((item) => (
                                    <ListItem
                                        key={item}
                                        display="flex"
                                        alignItems="center"
                                        fontSize="md"
                                        fontWeight="semibold"
                                        color="text.secondary"
                                    >
                                        <ListIcon
                                            as={MdCheckCircle}
                                            color="brand.green"
                                            fontSize="xl"
                                        />
                                        {item}
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
                                Crypto Play & Auth
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
                                            borderColor: 'brand.pink',
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
                                                    width="100%"
                                                    height="100%"
                                                    objectFit="contain"
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
                            bg="card.lighterGray"
                            borderRadius="3xl"
                            height={{ base: '300px', md: '400px' }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            overflow="hidden"
                            order={{ base: 1, lg: 2 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                        >
                            <Text color="text.gray600" fontWeight="bold">
                                IMAGE PLACEHOLDER
                            </Text>
                            {/* Red X Overlay for the guide */}
                            <Box
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                bg="rgba(235, 11, 92, 0.03)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Box
                                    width="100%"
                                    height="100%"
                                    position="relative"
                                    _before={{
                                        content: '""',
                                        position: 'absolute',
                                        width: '2px',
                                        height: '141%',
                                        bg: 'brand.pink',
                                        opacity: 0.4,
                                        transform: 'rotate(45deg)',
                                        left: '50%',
                                        top: '-20%',
                                    }}
                                    _after={{
                                        content: '""',
                                        position: 'absolute',
                                        width: '2px',
                                        height: '141%',
                                        bg: 'brand.pink',
                                        opacity: 0.4,
                                        transform: 'rotate(-45deg)',
                                        left: '50%',
                                        top: '-20%',
                                    }}
                                />
                            </Box>
                        </Box>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

export default CommunitySection;
