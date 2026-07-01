'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import type { CardBackVariant } from '../../interfaces';
import { CardBack, SVGCardFace } from '../Card';
import useToastHelper from '@/app/hooks/useToastHelper';

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

// Background for the closer "felt" band — deep poker-felt green.
const SECTION_BG = '#103D2B';

// One face-down back (the deck) revealing a mixed-suit broadway run. Mixed
// suits + a single back so every card reads as its own thing.
type FanCard =
    | { type: 'back'; variant: CardBackVariant; id: string }
    | { type: 'face'; rank: string; suit: string; id: string };

const FAN_CARDS: FanCard[] = [
    { type: 'back', variant: 'classic-red', id: 'fan-back' },
    { type: 'face', rank: 'A', suit: 'S', id: 'fan-as' },
    { type: 'face', rank: 'K', suit: 'H', id: 'fan-kh' },
    { type: 'face', rank: 'Q', suit: 'D', id: 'fan-qd' },
    { type: 'face', rank: 'J', suit: 'C', id: 'fan-jc' },
];

// `--fan` scales the spread; hovering the hand opens it wider. The center card
// (offset 0) doesn't move, so the hand fans open from the middle.
const CardFan = ({ interactive }: { interactive: boolean }) => {
    const mid = (FAN_CARDS.length - 1) / 2;
    return (
        <Box
            aria-hidden="true"
            position="relative"
            flexShrink={0}
            width={{ base: '330px', md: '540px' }}
            height={{ base: '210px', md: '300px' }}
            sx={{ '--fan': '1' }}
            _hover={interactive ? { '--fan': '1.3' } : undefined}
        >
            {FAN_CARDS.map((c, i) => {
                const off = i - mid;
                return (
                    <Box
                        key={c.id}
                        position="absolute"
                        top="50%"
                        left="50%"
                        width={{ base: '108px', md: '168px' }}
                        zIndex={i}
                        transformOrigin="center"
                        transform={{
                            base: `translate(calc(-50% + ${off * 54}px * var(--fan, 1)), calc(-50% + ${Math.abs(off) * 12}px * var(--fan, 1))) rotate(calc(${off * 6}deg * var(--fan, 1)))`,
                            md: `translate(calc(-50% + ${off * 80}px * var(--fan, 1)), calc(-50% + ${Math.abs(off) * 18}px * var(--fan, 1))) rotate(calc(${off * 7}deg * var(--fan, 1)))`,
                        }}
                        transition={
                            interactive
                                ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
                                : undefined
                        }
                        sx={{
                            filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.45))',
                        }}
                    >
                        <Box width="100%" sx={{ aspectRatio: '3 / 4' }}>
                            {c.type === 'back' ? (
                                <CardBack variant={c.variant} idSuffix={c.id} />
                            ) : (
                                <SVGCardFace rank={c.rank} suit={c.suit} />
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

// The closer. After the FAQ has handled objections, give the page one clear,
// confident "go play / go host" moment plus a last newsletter catch. The single
// "penthouse felt" beat on an otherwise-light homepage: a full-bleed warm-dark
// band with a hand dealt on it. Slide-only reveal; reduced-motion safe.
const FinalCtaSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const toast = useToastHelper();
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const fadeUp = prefersReducedMotion
        ? {}
        : {
              initial: { y: 24 },
              whileInView: { y: 0 },
              viewport: { once: true, amount: 0.4 },
              transition: { duration: 0.6, ease: 'easeOut' },
          };
    const fanReveal = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 16, rotate: -2 },
              whileInView: { opacity: 1, y: 0, rotate: 0 },
              viewport: { once: true, amount: 0.4 },
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
          };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubscribing) return;
        setIsSubscribing(true);
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (response.ok) {
                setIsSubscribed(true);
                setEmail('');
            } else {
                toast.error(
                    "Couldn't subscribe",
                    'Please try again in a moment.'
                );
            }
        } catch {
            toast.error(
                'Something went wrong',
                'Please check your connection and try again.'
            );
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <Box
            as="section"
            id="play-cta"
            bg={SECTION_BG}
            py={{ base: 8, md: 12 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            {/* Felt fabric texture — fine fractal-noise grain blended over the
                green so it reads as woven table felt, not flat paint. */}
            <Box
                aria-hidden="true"
                position="absolute"
                inset={0}
                zIndex={0}
                pointerEvents="none"
                opacity={0.5}
                sx={{ mixBlendMode: 'soft-light' }}
            >
                <svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                >
                    <filter id="feltGrain">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.9"
                            numOctaves={2}
                            stitchTiles="stitch"
                        />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#feltGrain)" />
                </svg>
            </Box>
            {/* Soft light pool — felt catches a little light toward the middle */}
            <Box
                aria-hidden="true"
                position="absolute"
                inset={0}
                zIndex={0}
                pointerEvents="none"
                bgGradient="radial(120% 120% at 50% 35%, rgba(255,255,255,0.06), transparent 62%)"
            />

            <Container maxW="container.xl" position="relative" zIndex={1}>
                <VStack spacing={{ base: 8, md: 10 }} align="stretch">
                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        align="center"
                        justify="space-between"
                        gap={{ base: 10, lg: 16 }}
                    >
                        <MotionVStack
                            align={{ base: 'center', lg: 'flex-start' }}
                            textAlign={{ base: 'center', lg: 'left' }}
                            spacing={{ base: 4, md: 6 }}
                            maxW={{ lg: 'lg' }}
                            {...fadeUp}
                        >
                            <Heading
                                as="h2"
                                fontSize={{ base: '4xl', md: '6xl' }}
                                fontWeight="black"
                                color="white"
                                letterSpacing="-0.03em"
                                lineHeight={1}
                            >
                                Pull up a{' '}
                                <Box
                                    as="span"
                                    display="inline-block"
                                    position="relative"
                                    px={1}
                                >
                                    seat
                                    <Box
                                        as="span"
                                        position="absolute"
                                        left="0"
                                        right="0"
                                        bottom={{ base: '0px', md: '4px' }}
                                        height={{ base: '10px', md: '14px' }}
                                        bg="brand.yellow"
                                        opacity={0.55}
                                        borderRadius="full"
                                        zIndex={-1}
                                        transform="rotate(-1deg)"
                                    />
                                </Box>
                                .
                                <Box
                                    as="span"
                                    display="inline-block"
                                    ml={{ base: 2, md: 3 }}
                                    fontSize="0.85em"
                                    role="img"
                                    aria-label="chair"
                                    transform="rotate(6deg)"
                                >
                                    🪑
                                </Box>
                            </Heading>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="rgba(255,255,255,0.72)"
                                fontWeight="medium"
                                maxW="md"
                                lineHeight="tall"
                            >
                                Real hands, real stakes. Your seat&apos;s one
                                click away.
                            </Text>
                            <Stack
                                direction={{ base: 'column', sm: 'row' }}
                                spacing={3}
                                pt={2}
                                w={{ base: '100%', sm: 'auto' }}
                            >
                                <Button
                                    as={Link}
                                    href="/public-games"
                                    variant="tactilePrimary"
                                    borderRadius="full"
                                    height={{ base: '52px', md: '56px' }}
                                    px={8}
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    leftIcon={
                                        <Box
                                            as="span"
                                            fontSize="lg"
                                            lineHeight={1}
                                            mt="-2px"
                                        >
                                            ♠
                                        </Box>
                                    }
                                >
                                    Find a table
                                </Button>
                                <Button
                                    as={Link}
                                    href="/create-game"
                                    variant="tactileOutline"
                                    borderRadius="full"
                                    height={{ base: '52px', md: '56px' }}
                                    px={8}
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    bg="rgba(255,255,255,0.04)"
                                    color="white"
                                    _hover={{ bg: 'rgba(54,163,123,0.16)' }}
                                >
                                    Host a table
                                </Button>
                            </Stack>
                            <Text
                                fontSize="sm"
                                color="rgba(255,255,255,0.5)"
                                fontWeight="medium"
                                pt={1}
                            >
                                Sit down, or deal the game.
                            </Text>
                        </MotionVStack>

                        <MotionBox flexShrink={0} {...fanReveal}>
                            <CardFan interactive={!prefersReducedMotion} />
                        </MotionBox>
                    </Flex>

                    {/* Last catch — a newsletter capture for anyone who scrolled
                        the whole way without sitting down. */}
                    <MotionVStack
                        spacing={3}
                        w="100%"
                        maxW={{ base: '100%', sm: '440px' }}
                        mx="auto"
                        {...fadeUp}
                    >
                        <HStack w="100%" spacing={3} align="center">
                            <Box
                                flex={1}
                                h="1px"
                                bgGradient="linear(to-r, transparent, rgba(255,255,255,0.2))"
                            />
                            <Text
                                fontSize="2xs"
                                color="rgba(255,255,255,0.6)"
                                fontWeight="bold"
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                                whiteSpace="nowrap"
                            >
                                Or just get on the list
                            </Text>
                            <Box
                                flex={1}
                                h="1px"
                                bgGradient="linear(to-l, transparent, rgba(255,255,255,0.2))"
                            />
                        </HStack>

                        {isSubscribed ? (
                            <HStack
                                w="100%"
                                h="52px"
                                px={5}
                                spacing={2}
                                justify="center"
                                bg="rgba(54,163,123,0.18)"
                                border="1px solid"
                                borderColor="rgba(54,163,123,0.4)"
                                borderRadius="full"
                            >
                                <Icon
                                    as={MdCheck}
                                    color="brand.green"
                                    boxSize={5}
                                />
                                <Text color="white" fontWeight="bold">
                                    You&apos;re on the list.
                                </Text>
                            </HStack>
                        ) : (
                            <>
                                <HStack
                                    as="form"
                                    onSubmit={handleEmailSubmit}
                                    w="100%"
                                    spacing={0}
                                    bg="white"
                                    borderRadius="full"
                                    pl={5}
                                    pr="6px"
                                    h="52px"
                                    align="center"
                                    boxShadow="0 8px 24px rgba(0,0,0,0.28)"
                                    transition="box-shadow 0.2s ease"
                                    _focusWithin={{
                                        boxShadow:
                                            '0 0 0 3px rgba(54,163,123,0.5)',
                                    }}
                                >
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        variant="unstyled"
                                        color="#0B1430"
                                        h="100%"
                                        fontSize="md"
                                        fontWeight="medium"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isSubscribing}
                                        required
                                        _placeholder={{ color: 'gray.400' }}
                                    />
                                    <IconButton
                                        type="submit"
                                        variant="tactilePrimary"
                                        borderRadius="full"
                                        aria-label="Subscribe"
                                        icon={
                                            <Icon
                                                as={MdArrowForward}
                                                boxSize={5}
                                            />
                                        }
                                        h="42px"
                                        minW="42px"
                                        flexShrink={0}
                                        isLoading={isSubscribing}
                                    />
                                </HStack>
                                <Text
                                    fontSize="xs"
                                    color="rgba(255,255,255,0.45)"
                                    textAlign="center"
                                >
                                    Game updates. Bonus drops. No spam.
                                </Text>
                            </>
                        )}
                    </MotionVStack>
                </VStack>
            </Container>
        </Box>
    );
};

export default FinalCtaSection;
