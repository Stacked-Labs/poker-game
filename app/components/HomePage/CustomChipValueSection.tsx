'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const MotionVStack = motion(VStack);

// USDC-blue text that clears AA 4.5:1 on both grounds: darker token on the
// light page, a lighter shade on the near-black dark page.
const usdcText = {
    color: 'brand.usdcDark',
    _dark: { color: '#5BA8E8' },
};

type Stake = {
    blinds: string;
    usdc: string;
    tier: string; // chip-dot color (Chakra token)
};

const STAKES: Stake[] = [
    { blinds: '5 / 10', usdc: '0.05 / 0.10 USDC', tier: 'brand.green' },
    { blinds: '25 / 50', usdc: '0.25 / 0.50 USDC', tier: 'brand.yellow' },
    { blinds: '100 / 200', usdc: '1.00 / 2.00 USDC', tier: 'brand.pink' },
];

const CustomChipValueSection = () => {
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
            id="chip-value"
            py={{ base: 6, md: 14 }}
            width="100%"
            position="relative"
        >
            {/* USDC watermark — felt-fluent decoration */}
            <Box
                position="absolute"
                left={{ base: '-60px', md: '-120px', lg: '-100px' }}
                bottom={{ base: '-60px', md: '-100px' }}
                width={{ base: '220px', md: '420px', lg: '520px' }}
                height={{ base: '220px', md: '420px', lg: '520px' }}
                opacity={0.05}
                pointerEvents="none"
                aria-hidden="true"
                transform="rotate(12deg)"
            >
                <NextImage
                    src="/usdc-logo.png"
                    alt=""
                    fill
                    sizes="520px"
                    style={{ objectFit: 'contain' }}
                />
            </Box>

            <Container maxW="container.lg" position="relative" zIndex={1}>
                <MotionVStack
                    spacing={{ base: 3, md: 5 }}
                    align={{ base: 'start', md: 'center' }}
                    textAlign={{ base: 'left', md: 'center' }}
                    {...fadeUp(0)}
                >
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Priced in USDC
                    </Text>

                    <Heading
                        as="h2"
                        fontSize={{ base: '4xl', md: '7xl', lg: '8xl' }}
                        fontWeight="black"
                        color="text.primary"
                        letterSpacing="-0.04em"
                        lineHeight={1}
                    >
                        1 chip ={' '}
                        <Box as="span" {...usdcText}>
                            0.01
                        </Box>{' '}
                        <Box
                            as="span"
                            display="inline-block"
                            position="relative"
                            width={{ base: '30px', md: '56px', lg: '68px' }}
                            height={{ base: '30px', md: '56px', lg: '68px' }}
                            verticalAlign="middle"
                            mr={{ base: 1.5, md: 2 }}
                            top={{ base: '-2px', md: '-4px' }}
                        >
                            <NextImage
                                src="/usdc-logo.png"
                                alt=""
                                fill
                                sizes="(max-width: 48em) 30px, (max-width: 62em) 56px, 68px"
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                        <Box
                            as="span"
                            {...usdcText}
                            fontSize={{ base: '2xl', md: '5xl', lg: '6xl' }}
                            fontWeight="bold"
                            letterSpacing="0.02em"
                        >
                            USDC
                        </Box>
                    </Heading>

                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight="black"
                        color="text.secondary"
                        letterSpacing="0.18em"
                        textTransform="uppercase"
                        display={{ base: 'none', md: 'block' }}
                    >
                        Always.
                    </Text>

                    <Text
                        color="text.secondary"
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="medium"
                        maxW="2xl"
                        lineHeight="tall"
                        pt={{ base: 0, md: 3 }}
                    >
                        No volatility. A 100-chip stack is $1.00 at buy-in, at
                        showdown, at cashout.
                    </Text>

                    <Box
                        pt={{ base: 5, md: 12 }}
                        w="100%"
                        maxW="lg"
                        mx={{ base: 0, md: 'auto' }}
                    >
                        <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="text.muted"
                            letterSpacing="0.18em"
                            textTransform="uppercase"
                            mb={3}
                            textAlign={{ base: 'left', md: 'center' }}
                        >
                            Common stakes
                        </Text>
                        <VStack spacing={0} align="stretch" w="100%">
                            {STAKES.map((s, i) => (
                                <HStack
                                    key={s.blinds}
                                    justify="space-between"
                                    py={{ base: 3, md: 3.5 }}
                                    borderTop={i === 0 ? '1px solid' : 'none'}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    <HStack spacing={3} align="center">
                                        <Box
                                            w={{ base: '10px', md: '12px' }}
                                            h={{ base: '10px', md: '12px' }}
                                            borderRadius="full"
                                            bg={s.tier}
                                            border="1px solid"
                                            borderColor="rgba(0, 0, 0, 0.15)"
                                            flexShrink={0}
                                            aria-hidden="true"
                                        />
                                        <Text
                                            fontWeight="bold"
                                            color="text.primary"
                                            fontSize={{ base: 'sm', md: 'md' }}
                                            sx={{ fontVariantNumeric: "tabular-nums" }}
                                        >
                                            {s.blinds} chip game
                                        </Text>
                                    </HStack>
                                    <Text
                                        {...usdcText}
                                        fontWeight="semibold"
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        sx={{ fontVariantNumeric: "tabular-nums" }}
                                    >
                                        {s.usdc}
                                    </Text>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                </MotionVStack>
            </Container>
        </Box>
    );
};

export default CustomChipValueSection;
