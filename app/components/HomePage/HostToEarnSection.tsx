'use client';

import {
    Badge,
    Box,
    Container,
    Heading,
    HStack,
    Icon,
    List,
    ListIcon,
    ListItem,
    SimpleGrid,
    Text,
    useBreakpointValue,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdArrowUpward, MdRocketLaunch } from 'react-icons/md';
import { FaCoins } from 'react-icons/fa';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.55; }
`;

const HostToEarnSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
    const shouldAnimate = !prefersReducedMotion && !isMobile;

    const getFadeUpMotion = (delay = 0) =>
        shouldAnimate
            ? {
                  initial: { opacity: 0, y: 22 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay,
                  },
              }
            : {};

    return (
        <Box
            as="section"
            id="host-to-earn"
            py={{ base: 16, md: 24 }}
            width="100%"
            position="relative"
        >
            {/* $ watermark — section signature, mirrors the spade on CommunitySection */}
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '-40px', md: '-100px' }}
                left={{ base: '-60px', md: '-90px', lg: '-40px' }}
                fontSize={{ base: '220px', md: '460px', lg: '560px' }}
                lineHeight={1}
                color="brand.yellow"
                opacity={0.08}
                pointerEvents="none"
                transform="rotate(12deg)"
                fontWeight="extrabold"
                userSelect="none"
            >
                $
            </Box>

            <Container maxW="container.xl" position="relative" zIndex={1}>
                {/* Header */}
                <MotionVStack
                    spacing={5}
                    textAlign="center"
                    mb={{ base: 10, md: 12 }}
                    {...getFadeUpMotion(0)}
                >
                    {/* Wordmark — typographic only, no pill, no rotation */}
                    <Heading
                        as="h2"
                        fontSize={{ base: '5xl', md: '7xl', lg: '8xl' }}
                        fontWeight="extrabold"
                        lineHeight={0.95}
                        letterSpacing="-0.04em"
                        color="text.primary"
                    >
                        Host to{' '}
                        <Text
                            as="span"
                            color="brand.yellow"
                            sx={{
                                WebkitTextStroke: '0',
                                textShadow:
                                    '0 0 28px rgba(255, 199, 44, 0.45)',
                            }}
                        >
                            Earn.
                        </Text>
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
                        Anyone can host. On every real-money hand at a table
                        you run, you keep a quarter of the rake — credited
                        on-chain, hand by hand. Run a public game, earn while
                        the room plays.
                    </Text>
                </MotionVStack>

                <VStack spacing={{ base: 20, md: 28 }} align="stretch">
                    {/* Row 1: Earnings card LEFT, pitch RIGHT */}
                    <SimpleGrid
                        columns={{ base: 1, lg: 2 }}
                        spacing={{ base: 12, lg: 24 }}
                        alignItems="center"
                    >
                        <MotionBox {...getFadeUpMotion(0.1)}>
                            <EarningsCard />
                        </MotionBox>

                        <MotionVStack
                            align="start"
                            spacing={6}
                            {...getFadeUpMotion(0.2)}
                        >
                            <Badge
                                bg="rgba(255, 199, 44, 0.12)"
                                variant="subtle"
                                px={4}
                                py={2}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                border="1px solid"
                                borderColor="rgba(255, 199, 44, 0.28)"
                                _dark={{
                                    bg: 'rgba(255, 199, 44, 0.14)',
                                    borderColor: 'rgba(255, 199, 44, 0.32)',
                                }}
                            >
                                <Icon
                                    as={FaCoins}
                                    mr={1.5}
                                    fontSize="sm"
                                    color="brand.yellowDark"
                                    _dark={{ color: 'brand.yellow' }}
                                />
                                <Text
                                    as="span"
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    color="brand.yellowDark"
                                    _dark={{ color: 'brand.yellow' }}
                                >
                                    FROM EVERY HAND
                                </Text>
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Run the table.
                                <br />
                                Take the cut.
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                You host the table. We take a cut. So do you —{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="brand.yellowDark"
                                    _dark={{ color: 'brand.yellow' }}
                                >
                                    25% of every rake, credited per hand.
                                </Text>{' '}
                                You don&apos;t even have to play.
                            </Text>
                            <List spacing={3} w="100%">
                                {[
                                    {
                                        main: '25% of every rake',
                                        detail: 'credited per hand, not per session',
                                    },
                                    {
                                        main: '0% deploy fee',
                                        detail: 'Stacked covers the gas to spin up your table',
                                    },
                                    {
                                        main: '0% custody risk',
                                        detail: 'earnings live in the table contract, not our account',
                                    },
                                ].map((item) => (
                                    <ListItem
                                        key={item.main}
                                        display="flex"
                                        alignItems="center"
                                        fontSize="md"
                                        bg="rgba(255, 199, 44, 0.10)"
                                        px={4}
                                        py={2.5}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="rgba(255, 199, 44, 0.22)"
                                        _dark={{
                                            bg: 'rgba(255, 199, 44, 0.12)',
                                            borderColor:
                                                'rgba(255, 199, 44, 0.28)',
                                        }}
                                    >
                                        <ListIcon
                                            as={FaCoins}
                                            color="brand.yellowDark"
                                            fontSize="lg"
                                            mr={3}
                                            _dark={{ color: 'brand.yellow' }}
                                        />
                                        <Text
                                            fontWeight="bold"
                                            color="text.primary"
                                            fontSize="sm"
                                        >
                                            {item.main}
                                        </Text>
                                        <Text
                                            fontWeight="normal"
                                            color="text.secondary"
                                            opacity={0.7}
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

                    {/* Row 2: pitch LEFT, setup card RIGHT */}
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
                                bg="rgba(255, 199, 44, 0.12)"
                                variant="subtle"
                                px={4}
                                py={2}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                border="1px solid"
                                borderColor="rgba(255, 199, 44, 0.28)"
                                _dark={{
                                    bg: 'rgba(255, 199, 44, 0.14)',
                                    borderColor: 'rgba(255, 199, 44, 0.32)',
                                }}
                            >
                                <Icon
                                    as={MdRocketLaunch}
                                    mr={1.5}
                                    fontSize="sm"
                                    color="brand.yellowDark"
                                    _dark={{ color: 'brand.yellow' }}
                                />
                                <Text
                                    as="span"
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    color="brand.yellowDark"
                                    _dark={{ color: 'brand.yellow' }}
                                >
                                    ANYONE CAN HOST
                                </Text>
                            </Badge>
                            <Heading
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                Three clicks. You&apos;re the house.
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                Connect a wallet. Pick the stakes. Click create.
                                Stacked sponsors the deployment, so your table
                                goes live for free —{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    first hand settles, first cents land.
                                </Text>
                            </Text>

                            <Box
                                bg="rgba(255, 199, 44, 0.10)"
                                p={{ base: 6, md: 8 }}
                                borderRadius="2xl"
                                width="100%"
                                border="1px solid"
                                borderColor="rgba(255, 199, 44, 0.22)"
                                borderLeft="4px solid"
                                borderLeftColor="brand.yellow"
                                position="relative"
                                _dark={{
                                    bg: 'rgba(255, 199, 44, 0.12)',
                                    borderColor: 'rgba(255, 199, 44, 0.28)',
                                }}
                            >
                                <VStack align="start" spacing={3}>
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        color="text.primary"
                                    >
                                        No application gates.
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        color="text.secondary"
                                        lineHeight="tall"
                                    >
                                        No approval queue. No staking
                                        requirement. No fee to deploy. The
                                        marketplace is open — if you can
                                        connect a wallet, you can run a table.
                                    </Text>
                                </VStack>
                            </Box>
                        </MotionVStack>

                        <MotionBox
                            order={{ base: 1, lg: 2 }}
                            {...getFadeUpMotion(0.1)}
                        >
                            <SetupCard />
                        </MotionBox>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

const EarningsCard = () => (
    <Box
        bg="card.white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="border.lightGray"
        boxShadow="card.hero"
        p={{ base: 6, md: 7 }}
        maxW={{ base: '100%', lg: '520px' }}
        mx="auto"
        position="relative"
        overflow="hidden"
        transition="all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'card.lift' }}
    >
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bgGradient="linear(to-r, brand.yellow, brand.yellowDark)"
        />
        <VStack align="stretch" spacing={5}>
            <HStack justify="space-between" align="start">
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                    >
                        Host earnings
                    </Text>
                    <Text
                        fontSize="sm"
                        color="text.primary"
                        fontWeight="bold"
                    >
                        Sunday Night Hold&apos;em
                    </Text>
                </VStack>
                <HStack
                    spacing={1.5}
                    bg="brand.pink"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    border="1px solid"
                    borderColor="brand.pinkDark"
                    boxShadow="0 4px 14px rgba(235, 11, 92, 0.35)"
                >
                    <Box
                        w={1.5}
                        h={1.5}
                        bg="white"
                        borderRadius="full"
                        animation={`${pulse} 1.6s ease-in-out infinite`}
                    />
                    <Text
                        color="white"
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="wider"
                    >
                        LIVE
                    </Text>
                </HStack>
            </HStack>

            <VStack align="start" spacing={1}>
                <HStack spacing={2} align="center">
                    <Icon
                        as={FaCoins}
                        color="brand.yellow"
                        fontSize={{ base: '2xl', md: '3xl' }}
                    />
                    <Heading
                        fontSize={{ base: '4xl', md: '5xl' }}
                        fontWeight="extrabold"
                        color="text.primary"
                        letterSpacing="-0.02em"
                    >
                        $147.32
                    </Heading>
                </HStack>
                <HStack spacing={1.5}>
                    <Icon
                        as={MdArrowUpward}
                        fontSize="sm"
                        color="brand.yellowDark"
                        _dark={{ color: 'brand.yellow' }}
                    />
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="brand.yellowDark"
                        _dark={{ color: 'brand.yellow' }}
                    >
                        +$0.42 from last hand
                    </Text>
                </HStack>
            </VStack>

            <HStack
                bg="brand.yellow"
                color="white"
                fontSize="sm"
                fontWeight="bold"
                py={3}
                px={4}
                borderRadius="xl"
                justify="center"
                spacing={2}
                userSelect="none"
                cursor="default"
                aria-hidden="true"
                _hover={{ bg: 'brand.yellowDark' }}
                transition="background 0.18s ease"
            >
                <Icon as={FaCoins} fontSize="md" color="white" />
                <Text color="white">Withdraw to wallet</Text>
            </HStack>

            <VStack align="stretch" spacing={2} pt={2}>
                <Text
                    fontSize="2xs"
                    color="text.secondary"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                >
                    Recent settlements
                </Text>
                {[
                    { id: '2934', amt: '+$0.18' },
                    { id: '2933', amt: '+$0.30' },
                    { id: '2932', amt: '+$0.24' },
                ].map((row) => (
                    <HStack
                        key={row.id}
                        justify="space-between"
                        fontSize="sm"
                    >
                        <Text color="text.secondary">Hand #{row.id}</Text>
                        <Text color="text.primary" fontWeight="semibold">
                            {row.amt}
                        </Text>
                    </HStack>
                ))}
            </VStack>
        </VStack>
    </Box>
);

const SetupCard = () => {
    const steps = [
        {
            n: '1',
            title: 'Connect wallet',
            body: 'Any thirdweb wallet — or sign in with email.',
        },
        {
            n: '2',
            title: 'Pick stakes, click create',
            body: 'A smart contract deploys for your table.',
        },
        {
            n: '3',
            title: 'Earn from the first hand',
            body: 'Your 25% credits live, hand by hand.',
            active: true,
        },
    ];

    return (
        <Box
            bg="card.white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="border.lightGray"
            boxShadow="card.hero"
            p={{ base: 6, md: 7 }}
            maxW={{ base: '100%', lg: '520px' }}
            mx="auto"
            position="relative"
            overflow="hidden"
            transition="all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'card.lift' }}
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bgGradient="linear(to-r, brand.yellow, brand.yellowDark)"
            />
            <VStack align="stretch" spacing={5}>
                <HStack justify="space-between">
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                    >
                        Host setup
                    </Text>
                    <Text
                        fontSize="2xs"
                        color="brand.yellowDark"
                        fontWeight="bold"
                        letterSpacing="wider"
                        _dark={{ color: 'brand.yellow' }}
                    >
                        GAS SPONSORED
                    </Text>
                </HStack>

                <VStack align="stretch" spacing={3}>
                    {steps.map((step) => (
                        <HStack
                            key={step.n}
                            spacing={4}
                            align="start"
                            py={2}
                        >
                            <Box
                                w="32px"
                                h="32px"
                                bg={
                                    step.active
                                        ? 'brand.yellow'
                                        : 'rgba(255, 199, 44, 0.12)'
                                }
                                _dark={{
                                    bg: step.active
                                        ? 'brand.yellow'
                                        : 'rgba(255, 199, 44, 0.14)',
                                }}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                border={step.active ? 'none' : '1px solid'}
                                borderColor="rgba(255, 199, 44, 0.30)"
                                boxShadow={
                                    step.active
                                        ? '0 4px 12px rgba(255, 199, 44, 0.45)'
                                        : 'none'
                                }
                            >
                                <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color={
                                        step.active
                                            ? 'white'
                                            : 'brand.yellowDark'
                                    }
                                    _dark={{
                                        color: step.active
                                            ? 'white'
                                            : 'brand.yellow',
                                    }}
                                >
                                    {step.n}
                                </Text>
                            </Box>
                            <VStack align="start" spacing={0.5}>
                                <Text
                                    fontWeight="bold"
                                    color="text.primary"
                                    fontSize="sm"
                                >
                                    {step.title}
                                </Text>
                                <Text fontSize="xs" color="text.secondary">
                                    {step.body}
                                </Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>

                <Box
                    pt={3}
                    borderTop="1px solid"
                    borderColor="border.lightGray"
                >
                    <Text fontSize="xs" color="text.secondary">
                        No application. No approval queue. No fee to deploy.
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
};

export default HostToEarnSection;
