'use client';

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    AspectRatio,
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
import { motion, useReducedMotion } from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const CommunitySection = () => {
    const prefersReducedMotion = useReducedMotion();

    const getFadeUpMotion = (delay = 0) =>
        prefersReducedMotion
            ? {}
            : {
                  initial: { opacity: 0, y: 22 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: { duration: 0.6, ease: 'easeOut', delay },
              };

    const authOptions: {
        name: string;
        icon: string | React.ElementType;
        color?: string;
        isReactIcon?: boolean;
        boxSize?: number;
        iconScale?: number;
    }[] = [
        {
            name: 'Base',
            icon: '/networkLogos/base-logo.png',
            color: '#0052FF', // Base Blue
            iconScale: 0.7,
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
        <Box
            as="section"
            id="community"
            bg="bg.default"
            py={{ base: 4, md: 8 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                {/* Header Section */}
                <MotionVStack
                    spacing={6}
                    textAlign="center"
                    mb={{ base: 10, md: 12 }}
                    {...getFadeUpMotion(0)}
                >
                    <Heading
                        fontSize={{ base: '3xl', md: '6xl', lg: '7xl' }}
                        fontWeight="extrabold"
                        lineHeight={1.1}
                        color="text.primary"
                    >
                        <Box as="span" display="inline-block" position="relative" px={1}>
                            <MotionBox
                                aria-hidden="true"
                                position="absolute"
                                top={{ base: '-10px', md: '-14px' }}
                                left={{ base: '-10px', md: '-18px' }}
                                w={{ base: '10px', md: '12px' }}
                                h={{ base: '10px', md: '12px' }}
                                borderRadius="full"
                                bg="brand.pink"
                                boxShadow="0 0 0 6px rgba(235, 11, 92, 0.12)"
                                animate={
                                    prefersReducedMotion
                                        ? undefined
                                        : { y: [0, -6, 0], rotate: [0, 12, 0] }
                                }
                                transition={
                                    prefersReducedMotion
                                        ? undefined
                                        : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                                }
                            />
                            <MotionBox
                                aria-hidden="true"
                                position="absolute"
                                bottom={{ base: '-8px', md: '-12px' }}
                                right={{ base: '-12px', md: '-20px' }}
                                w={{ base: '12px', md: '14px' }}
                                h={{ base: '12px', md: '14px' }}
                                bg="brand.yellow"
                                borderRadius="4px"
                                boxShadow="0 0 0 6px rgba(253, 197, 29, 0.18)"
                                animate={
                                    prefersReducedMotion
                                        ? undefined
                                        : { y: [0, 6, 0], rotate: [20, 8, 20] }
                                }
                                transition={
                                    prefersReducedMotion
                                        ? undefined
                                        : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                                }
                            />
                            <Box
                                as="span"
                                display="inline-block"
                                position="relative"
                                pr={2}
                            >
                                Poker Night
                            <MotionBox
                                as="span"
                                position="absolute"
                                left="0"
                                right="0"
                                bottom="-6px"
                                height="10px"
                                bg="brand.yellow"
                                opacity={0.18}
                                borderRadius="full"
                                zIndex={-1}
                                style={{ rotate: -1 }}
                            />
                            </Box>{' '}
                            <Box
                                as="span"
                                display="inline-block"
                                bg="brand.green"
                                color="white"
                                px={{ base: 3, md: 4 }}
                                py={{ base: 1, md: 1.5 }}
                                borderRadius="full"
                                transform="rotate(-2deg)"
                                boxShadow="0 6px 16px rgba(54, 163, 123, 0.35)"
                            >
                                is Back
                            </Box>{' '}
                            <MotionBox
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="brand.pink"
                                color="white"
                                w={{ base: '42px', md: '48px' }}
                                h={{ base: '42px', md: '48px' }}
                                borderRadius="full"
                                transform="rotate(6deg)"
                                boxShadow="0 8px 18px rgba(235, 11, 92, 0.35)"
                                ml={1}
                                animate={
                                    prefersReducedMotion
                                        ? undefined
                                        : { y: [0, -6, 0], rotate: [6, 2, 6] }
                                }
                                transition={
                                    prefersReducedMotion
                                        ? undefined
                                        : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                                }
                            >
                                🤑
                            </MotionBox>
                        </Box>
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
                </MotionVStack>

                {/* Content Rows */}
                <VStack spacing={{ base: 16, md: 24 }} align="stretch">
                    {/* Row 1: Image Left, Text Right */}
                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={{ base: 12, lg: 24 }}
                        alignItems="center"
                    >
                        <MotionBox {...getFadeUpMotion(0.1)}>
                            <AspectRatio
                                ratio={1183 / 780}
                                w="full"
                                maxW={{ base: '100%', lg: '560px' }}
                                mx="auto"
                                bg="card.lightGray"
                                borderRadius="3xl"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="border.lightGray"
                            >
                                <Image
                                    src="/homepage/lobbyPic.png"
                                    alt="Poker lobby"
                                    fill
                                    sizes="(max-width: 992px) 100vw, 560px"
                                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                                />
                            </AspectRatio>
                        </MotionBox>

                        <MotionVStack align="start" spacing={6} {...getFadeUpMotion(0.2)}>
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
                        </MotionVStack>
                    </SimpleGrid>

                    {/* Row 2: Text Left, Image Right */}
                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={{ base: 12, lg: 24 }}
                        alignItems="center"
                    >
                        <MotionVStack
                            align="start"
                            spacing={6}
                            order={{ base: 2, lg: 1 }}
                            {...getFadeUpMotion(0.2)}
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
                                            w={`${option.boxSize ?? 24}px`}
                                            h={`${option.boxSize ?? 24}px`}
                                            align="center"
                                            justify="center"
                                            position="relative"
                                            flexShrink={0}
                                            overflow="hidden"
                                        >
                                            {option.isReactIcon ? (
                                                <Icon
                                                    as={
                                                        option.icon as React.ElementType
                                                    }
                                                    color={option.color}
                                                    fontSize="xl"
                                                    transform={
                                                        option.iconScale
                                                            ? `scale(${option.iconScale})`
                                                            : undefined
                                                    }
                                                />
                                            ) : option.icon ? (
                                                <Box
                                                    position="relative"
                                                    w="100%"
                                                    h="100%"
                                                    transform={
                                                        option.iconScale
                                                            ? `scale(${option.iconScale})`
                                                            : undefined
                                                    }
                                                >
                                                    <Image
                                                        src={option.icon as string}
                                                        alt={option.name}
                                                        fill
                                                        sizes={`${option.boxSize ?? 24}px`}
                                                        style={{
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                </Box>
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
                        </MotionVStack>

                        <MotionBox {...getFadeUpMotion(0.1)}>
                            <AspectRatio
                                ratio={802 / 623}
                                w="full"
                                maxW={{ base: '100%', lg: '520px' }}
                                mx="auto"
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
                                    sizes="(max-width: 992px) 100vw, 520px"
                                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                                />
                            </AspectRatio>
                        </MotionBox>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

export default CommunitySection;
