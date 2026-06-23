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
    useBreakpointValue,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { MdCheckCircle, MdFlashOn, MdLockOutline } from 'react-icons/md';
import { FaDiscord, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiTwitterXLine } from 'react-icons/ri';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const CommunitySection = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
    const shouldAnimate = !prefersReducedMotion && !isMobile;

    const getFadeUpMotion = (delay = 0) =>
        shouldAnimate
            ? {
                  initial: { y: 22 },
                  whileInView: { y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay,
                  },
              }
            : {};

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
            py={{ base: 10, md: 14 }}
            width="100%"
            position="relative"
            // Desktop-only: on mobile/tablet this section's beats are owned
            // elsewhere (Features = how-to-play, Vault = the 24h self-withdraw
            // trust row), so it would only repeat them on a small screen.
            display={{ base: 'none', lg: 'block' }}
        >
            {/* Big spade watermark — section signature */}
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '-40px', md: '-100px' }}
                right={{ base: '-50px', md: '-80px', lg: '-40px' }}
                fontSize={{ base: '220px', md: '460px', lg: '560px' }}
                lineHeight={1}
                color="brand.navy"
                opacity={0.05}
                pointerEvents="none"
                transform="rotate(-12deg)"
                fontWeight="bold"
                userSelect="none"
            >
                ♠
            </Box>

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
                        lineHeight={1.05}
                        letterSpacing={{ base: '-0.02em', md: '-0.03em' }}
                        color="text.primary"
                    >
                        <Box
                            as="span"
                            display="inline-block"
                            position="relative"
                            pr={2}
                        >
                            Poker Night
                            <Box
                                as="span"
                                position="absolute"
                                left="0"
                                right="0"
                                bottom="-6px"
                                height="10px"
                                bg="brand.yellow"
                                opacity={0.22}
                                borderRadius="full"
                                zIndex={-1}
                                transform="rotate(-1deg)"
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
                        >
                            is Back
                        </Box>
                    </Heading>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color="text.secondary"
                        maxW="2xl"
                        mx="auto"
                        fontWeight="medium"
                        lineHeight="tall"
                        opacity={0.85}
                    >
                        We brought the Friday night home game to your browser.
                        Talk trash in the chat, throw emojis at your friends,
                        and settle the score without leaving your couch.
                    </Text>
                </MotionVStack>

                {/* Content Rows */}
                <VStack spacing={{ base: 20, md: 28 }} align="stretch">
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
                            >
                                <Image
                                    src="/homepage/lobbyPic.png"
                                    alt="Poker lobby"
                                    fill
                                    sizes="(max-width: 992px) 100vw, 560px"
                                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                                />
                            </AspectRatio>
                        </MotionBox>

                        <MotionVStack align="start" spacing={6} {...getFadeUpMotion(0.2)}>
                            <Badge
                                bg="bg.greenTint"
                                color="brand.green"
                                variant="subtle"
                                px={4}
                                py={2}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="widest"
                                textTransform="uppercase"
                                border="1px solid"
                                borderColor="border.greenSubtle"
                            >
                                <Icon as={MdFlashOn} mr={1.5} fontSize="sm" />
                                INSTANT PLAY
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
                            <List spacing={3}>
                                {[
                                    {
                                        main: 'No Signup',
                                        detail: 'No email, no account',
                                    },
                                    {
                                        main: 'No Download',
                                        detail: 'Plays in your browser',
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
                                        bg="bg.greenSubtle"
                                        px={4}
                                        py={2.5}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="border.greenSubtle"
                                    >
                                        <ListIcon
                                            as={MdCheckCircle}
                                            color="brand.green"
                                            fontSize="lg"
                                            mr={3}
                                        />
                                        <Text
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                            fontSize="sm"
                                        >
                                            {item.main}
                                        </Text>
                                        <Text
                                            as="span"
                                            fontWeight="normal"
                                            color="text.secondary"
                                            opacity={0.6}
                                            ml={1.5}
                                            fontSize="sm"
                                        >
                                            {item.detail}
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
                                bg="bg.greenTint"
                                color="brand.green"
                                variant="subtle"
                                px={4}
                                py={2}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                textTransform="uppercase"
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="widest"
                                border="1px solid"
                                borderColor="border.greenSubtle"
                            >
                                <Icon as={MdFlashOn} mr={2} fontSize="sm" />
                                ONE-TAP SIGN-IN
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Real stakes. No custody risk.
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                Sign in with Google, Discord, X, or your wallet.
                                Buy in with USDC on Base. Your stack lives in a
                                smart contract, not our bank account.{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    We can&apos;t freeze it. We can&apos;t touch it.
                                </Text>
                            </Text>

                            <Box
                                bg="card.felt"
                                p={{ base: 6, md: 8 }}
                                borderRadius="2xl"
                                width="100%"
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.08)"
                                boxShadow="card.lift"
                            >
                                <VStack align="start" spacing={4}>
                                    <HStack
                                        spacing={2.5}
                                        align="center"
                                        bg="bg.greenTint"
                                        border="1px solid"
                                        borderColor="border.greenSubtle"
                                        px={3}
                                        py={1.5}
                                        borderRadius="full"
                                    >
                                        <Icon
                                            as={MdLockOutline}
                                            color="brand.green"
                                            fontSize="md"
                                        />
                                        <Text
                                            fontWeight="bold"
                                            fontSize="xs"
                                            letterSpacing="wide"
                                            textTransform="uppercase"
                                            color="brand.green"
                                        >
                                            24-hour self-withdraw
                                        </Text>
                                    </HStack>
                                    <Text
                                        fontSize="sm"
                                        color="rgba(236, 238, 245, 0.92)"
                                        lineHeight="tall"
                                    >
                                        If settlement ever stalls, you don&apos;t
                                        wait on us. Pull your own funds straight
                                        from the table contract after 24 hours.
                                        No ticket, no support queue, no
                                        permission.
                                    </Text>
                                </VStack>
                            </Box>

                            <HStack spacing={2.5} wrap="wrap">
                                {authOptions.map((option) => (
                                    <HStack
                                        key={option.name}
                                        bg="card.white"
                                        px={3.5}
                                        py={2}
                                        borderRadius="full"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="default"
                                        spacing={2}
                                        transition="background-color 0.12s ease, border-color 0.12s ease"
                                        cursor="default"
                                        _hover={{
                                            bg: 'bg.greenSubtle',
                                            borderColor: 'border.greenSubtle',
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
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="text.secondary"
                                        >
                                            {option.name}
                                        </Text>
                                    </HStack>
                                ))}
                            </HStack>
                        </MotionVStack>

                        <MotionBox
                            {...getFadeUpMotion(0.1)}
                            order={{ base: 1, lg: 2 }}
                        >
                            <AspectRatio
                                ratio={802 / 623}
                                w="full"
                                maxW={{ base: '100%', lg: '520px' }}
                                mx="auto"
                            >
                                <Image
                                    src="/homepage/thirdwebLogin.png"
                                    alt="One-tap sign-in"
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
