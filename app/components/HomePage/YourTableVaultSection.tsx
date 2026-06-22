'use client';

import React, { useRef } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    SimpleGrid,
    Icon,
} from '@chakra-ui/react';
import { MdCheck } from 'react-icons/md';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import ExternalLink from '../ExternalLink';
import { CardBack } from '../Card';

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

// Fixed, hand-authored target order for the riffle. Not random per render
// (would hydrate-mismatch); it just has to read as "scrambled, not sorted".
const RIFFLE_ORDER = [2, 4, 0, 3, 1];
const RIFFLE_CARDS = RIFFLE_ORDER.length;

function ShuffleProofCard() {
    const ref = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    // Trigger the riffle once, when the card scrolls into view. No always-on loop.
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const reseed = !prefersReducedMotion && inView;

    return (
        <Box
            ref={ref}
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="20px"
            overflow="hidden"
            bg="bg.default"
            display="flex"
            flexDirection="column"
            height="100%"
        >
            <Box
                p={{ base: 5, md: 6 }}
                borderBottom="1px solid"
                borderColor="border.lightGray"
                bg="bg.navyTint"
            >
                <HStack justify="space-between" align="center" mb={5}>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.navy"
                        _dark={{ color: 'rgba(180, 195, 235, 0.95)' }}
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Shuffle · Off-chain
                    </Text>
                    <HStack spacing={1.5} align="center">
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg="brand.pink"
                        />
                        <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="brand.pink"
                            letterSpacing="0.18em"
                            textTransform="uppercase"
                        >
                            Reseed
                        </Text>
                    </HStack>
                </HStack>

                {/* Signature motion beat: a row of card backs that riffles into
                    an unpredictable order once, when scrolled into view. */}
                <Flex
                    gap={{ base: '7px', md: '10px' }}
                    align="center"
                    justify="center"
                    h={{ base: '68px', md: '86px' }}
                    aria-hidden="true"
                >
                    {Array.from({ length: RIFFLE_CARDS }).map((_, i) => {
                        const target = RIFFLE_ORDER.indexOf(i);
                        // Each card slides toward its reshuffled slot, lifts,
                        // then settles. Distance scaled by card width + gap.
                        const shiftPct = ((target - i) / RIFFLE_CARDS) * 100;
                        return (
                            <MotionBox
                                key={i}
                                h="100%"
                                sx={{ aspectRatio: '3 / 4' }}
                                flexShrink={0}
                                initial={false}
                                animate={
                                    reseed
                                        ? {
                                              x: [
                                                  '0%',
                                                  `${shiftPct}%`,
                                                  `${shiftPct}%`,
                                                  '0%',
                                              ],
                                              y: ['0%', '-22%', '-22%', '0%'],
                                          }
                                        : { x: '0%', y: '0%' }
                                }
                                transition={
                                    reseed
                                        ? {
                                              duration: 1.1,
                                              times: [0, 0.35, 0.6, 1],
                                              ease: [0.16, 1, 0.3, 1],
                                              delay: i * 0.04,
                                          }
                                        : { duration: 0 }
                                }
                            >
                                <CardBack idSuffix={`riffle-${i}`} />
                            </MotionBox>
                        );
                    })}
                </Flex>
            </Box>

            <Box
                p={{ base: 5, md: 6 }}
                flex={1}
                display="flex"
                flexDirection="column"
                gap={{ base: 5, md: 6 }}
            >
                <Box>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.navy"
                        _dark={{ color: 'brand.lightGray' }}
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                        mb={2}
                    >
                        Shuffle proof
                    </Text>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        mb={2}
                    >
                        A provably fair, verifiable shuffle.
                    </Text>
                    <Text
                        color="text.secondary"
                        fontSize="sm"
                        fontWeight="medium"
                        lineHeight="tall"
                    >
                        Every deck is reseeded from hardware-grade randomness,
                        the same kind that secures your wallet. No predictable
                        seeds, no insider math.
                    </Text>
                </Box>
                <VStack align="stretch" spacing={2.5}>
                    {[
                        { label: 'Unpredictable', sub: 'New order every hand' },
                        {
                            label: 'Verifiable',
                            sub: 'Anyone can check the outcome',
                        },
                    ].map((row) => (
                        <HStack key={row.label} spacing={3} align="center">
                            <Box
                                w="20px"
                                h="20px"
                                borderRadius="full"
                                bg="brand.navy"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon
                                    as={MdCheck}
                                    color="white"
                                    boxSize="13px"
                                />
                            </Box>
                            <HStack spacing={2} align="baseline" flexWrap="wrap">
                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    {row.label}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    fontWeight="medium"
                                >
                                    {row.sub}
                                </Text>
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
}

function ContractReceipt() {
    return (
        <Box
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="20px"
            overflow="hidden"
            bg="bg.default"
            display="flex"
            flexDirection="column"
            height="100%"
        >
            <Box
                p={{ base: 5, md: 6 }}
                borderBottom="1px solid"
                borderColor="border.lightGray"
                bg="bg.greenSubtle"
            >
                <HStack justify="space-between" align="center" mb={4}>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Contract · Base
                    </Text>
                    <HStack spacing={1.5} align="center">
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg="brand.green"
                        />
                        <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="brand.green"
                            letterSpacing="0.18em"
                            textTransform="uppercase"
                        >
                            Live
                        </Text>
                    </HStack>
                </HStack>
                <HStack
                    spacing={3}
                    align="center"
                    mb={5}
                    flexWrap="wrap"
                >
                    <Text
                        fontFamily="mono"
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="text.secondary"
                        fontWeight="semibold"
                        letterSpacing="0.02em"
                        title="Illustrative address"
                    >
                        0x7a2c…f91d
                    </Text>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.14em"
                        textTransform="uppercase"
                    >
                        Example
                    </Text>
                    <ExternalLink
                        href="https://docs.stackedpoker.io/"
                        fontFamily="mono"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.04em"
                    >
                        How to verify
                    </ExternalLink>
                </HStack>
                <VStack align="stretch" spacing={2.5}>
                    {[
                        { label: 'Custody', sub: 'USDC held by the contract' },
                        { label: 'Payouts', sub: 'Paid by the contract' },
                        {
                            label: 'Settlement',
                            sub: 'Onchain when the hand ends',
                        },
                    ].map((row) => (
                        <HStack key={row.label} spacing={3} align="center">
                            <Box
                                w="20px"
                                h="20px"
                                borderRadius="full"
                                bg="brand.green"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon
                                    as={MdCheck}
                                    color="white"
                                    boxSize="13px"
                                />
                            </Box>
                            <HStack
                                spacing={2}
                                align="baseline"
                                flexWrap="wrap"
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    {row.label}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    fontWeight="medium"
                                >
                                    {row.sub}
                                </Text>
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>

            <Box
                p={{ base: 5, md: 6 }}
                flex={1}
                display="flex"
                flexDirection="column"
                gap={{ base: 5, md: 6 }}
            >
                <Box>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.green"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                        mb={2}
                    >
                        Custody proof
                    </Text>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        mb={2}
                    >
                        We never touch the cash.
                    </Text>
                    <Text
                        color="text.secondary"
                        fontSize="sm"
                        fontWeight="medium"
                        lineHeight="tall"
                    >
                        One smart contract per table. The contract pays the
                        winner, not us.
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const YourTableVaultSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const fadeUp = (delay = 0) =>
        prefersReducedMotion
            ? {}
            : {
                  // Slide-only entrance: opacity stays 1 so content is never gated
                  // invisible if the in-view reveal doesn't fire (fast scroll, JS
                  // hiccup, headless capture). Robustness over a fade.
                  initial: { y: 24 },
                  whileInView: { y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: { duration: 0.6, ease: 'easeOut', delay },
              };

    return (
        <Box
            as="section"
            id="under-the-hood"
            py={{ base: 10, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.lg" position="relative" zIndex={1}>
                <MotionVStack
                    align="start"
                    spacing={{ base: 8, md: 10 }}
                    {...fadeUp(0)}
                >
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Under the hood
                    </Text>

                    <Heading
                        as="h2"
                        fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                        fontWeight="black"
                        color="text.primary"
                        letterSpacing="-0.03em"
                        lineHeight={0.95}
                        maxW="4xl"
                    >
                        Engine deals. Contract pays.
                    </Heading>

                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color="text.secondary"
                        lineHeight="tall"
                        maxW="2xl"
                        fontWeight="medium"
                    >
                        Speed where it matters. Trust where it counts. The game
                        runs in real time on our engine. Every dollar lives in
                        a smart contract on Base. We deal the cards. The
                        contract holds the cash.
                    </Text>

                    {/* Engine / Contract split */}
                    <Box
                        w="100%"
                        pt={{ base: 4, md: 6 }}
                        display="grid"
                        gridTemplateColumns={{
                            base: '1fr',
                            md: '1fr auto 1fr',
                        }}
                        gap={{ base: 4, md: 6 }}
                        alignItems="stretch"
                    >
                        <Box
                            border="1px solid"
                            borderColor="rgba(51, 68, 121, 0.20)"
                            _dark={{
                                borderColor: 'rgba(150, 170, 230, 0.28)',
                                bg: 'rgba(150, 170, 230, 0.06)',
                            }}
                            borderRadius="16px"
                            p={{ base: 6, md: 7 }}
                            bg="rgba(51, 68, 121, 0.04)"
                            position="relative"
                        >
                            <HStack
                                justify="space-between"
                                align="center"
                                mb={3}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="brand.navy"
                                    _dark={{ color: 'rgba(180, 195, 235, 0.95)' }}
                                    letterSpacing="0.22em"
                                    textTransform="uppercase"
                                >
                                    Engine · Off-chain
                                </Text>
                                <Text
                                    fontFamily="mono"
                                    fontSize="2xs"
                                    color="brand.navy"
                                    _dark={{ color: 'rgba(180, 195, 235, 0.7)' }}
                                    opacity={0.7}
                                >
                                    {'// off-chain'}
                                </Text>
                            </HStack>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="bold"
                                color="text.primary"
                                letterSpacing="-0.01em"
                                mb={2}
                            >
                                Deals the hand.
                            </Text>
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Shuffle, deal, pot math. Real-time.
                            </Text>
                        </Box>

                        {/* Connector: md+ horizontal, mobile vertical */}
                        <Box
                            display={{ base: 'none', md: 'flex' }}
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            color="text.muted"
                            aria-hidden="true"
                            px={2}
                        >
                            <Text
                                fontFamily="mono"
                                fontSize="2xs"
                                letterSpacing="0.18em"
                                textTransform="uppercase"
                                mb={2}
                                whiteSpace="nowrap"
                            >
                                state →
                            </Text>
                            <Box w="80px" h="1px" bg="border.lightGray" />
                        </Box>
                        <Box
                            display={{ base: 'flex', md: 'none' }}
                            flexDirection="column"
                            alignItems="center"
                            color="text.muted"
                            aria-hidden="true"
                        >
                            <Text
                                fontFamily="mono"
                                fontSize="2xs"
                                letterSpacing="0.18em"
                                textTransform="uppercase"
                                mb={1}
                            >
                                state ↓
                            </Text>
                            <Box w="1px" h="28px" bg="border.lightGray" />
                        </Box>

                        <Box
                            border="1px solid"
                            borderColor="border.greenStrong"
                            borderRadius="16px"
                            p={{ base: 6, md: 7 }}
                            bg="bg.greenSubtle"
                        >
                            <HStack
                                justify="space-between"
                                align="center"
                                mb={3}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="brand.green"
                                    letterSpacing="0.22em"
                                    textTransform="uppercase"
                                >
                                    Contract · Base
                                </Text>
                                <Text
                                    fontFamily="mono"
                                    fontSize="2xs"
                                    color="brand.green"
                                    opacity={0.7}
                                >
                                    {'// onchain'}
                                </Text>
                            </HStack>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="bold"
                                color="text.primary"
                                letterSpacing="-0.01em"
                                mb={2}
                            >
                                Holds the cash.
                            </Text>
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                One smart contract per table. Custody, payouts,
                                settlement.
                            </Text>
                        </Box>
                    </Box>

                    <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={{ base: 5, md: 6 }}
                        w="100%"
                        pt={{ base: 4, md: 6 }}
                    >
                        <ShuffleProofCard />
                        <ContractReceipt />
                    </SimpleGrid>

                    <Box
                        w="100%"
                        pt={{ base: 6, md: 8 }}
                        borderTop="1px solid"
                        borderColor="border.lightGray"
                    >
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            color="text.secondary"
                            lineHeight="tall"
                            maxW="2xl"
                            fontWeight="medium"
                        >
                            There are more ways to order a 52-card deck (8 × 10
                            <Box as="sup" fontSize="0.6em">
                                67
                            </Box>{' '}
                            of them, more than there are atoms in the observable
                            universe) than anyone could ever exhaust, and every
                            hand draws a fresh one.
                        </Text>
                    </Box>
                </MotionVStack>
            </Container>
        </Box>
    );
};

export default YourTableVaultSection;
