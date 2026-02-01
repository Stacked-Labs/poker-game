'use client';

import {
    Box,
    Badge,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Icon,
    useToken,
    useBreakpointValue,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import { IoWallet } from 'react-icons/io5';
import { MdTableBar } from 'react-icons/md';
import { HiLink } from 'react-icons/hi';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const FeatureCard = ({
    icon,
    title,
    description,
    iconBg,
    iconColor,
    step,
}: {
    icon: React.ElementType;
    title: string;
    description: React.ReactNode;
    iconBg: string;
    iconColor: string;
    step: number;
}) => {
    const [resolvedIconBg] = useToken('colors', [iconBg]);
    const shadowColor = resolvedIconBg
        ? `${resolvedIconBg}4D`
        : 'rgba(0, 0, 0, 0.15)';
    const stepBg = resolvedIconBg
        ? `${resolvedIconBg}1A`
        : 'rgba(0, 0, 0, 0.08)';
    const stepLabel = `Step ${String(step).padStart(2, '0')}`;

    return (
        <Box
            bg="card.white"
            p={{ base: 5, md: 6 }}
            borderRadius="28px"
            border="1px solid"
            borderColor="border.lightGray"
            boxShadow="0 4px 18px rgba(0, 0, 0, 0.03)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                borderColor: iconBg,
            }}
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                left="0"
                top="18px"
                bottom="18px"
                w="3px"
                bgGradient={`linear(to-b, ${iconBg}, transparent)`}
                opacity={0.5}
            />

            <Badge
                bg={stepBg}
                color={iconBg}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="0.16em"
                textTransform="uppercase"
                mb={3}
            >
                {stepLabel}
            </Badge>

            <HStack spacing={4} mb={3} align="center">
                <Flex
                    w="44px"
                    h="44px"
                    bg={iconBg}
                    color={iconColor}
                    borderRadius="14px"
                    align="center"
                    justify="center"
                    fontSize="22px"
                    boxShadow={`0 6px 12px -4px ${shadowColor}`}
                >
                    <Icon as={icon} />
                </Flex>
                <Heading
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="bold"
                    color="text.primary"
                >
                    {title}
                </Heading>
            </HStack>
            <Text
                color="text.secondary"
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight="tall"
                fontWeight="medium"
            >
                {description}
            </Text>
        </Box>
    );
};

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
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
    const shouldAnimate = !prefersReducedMotion && !isMobile;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);
    const fadeUp = (delay = 0) =>
        shouldAnimate
            ? {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: { duration: 0.6, ease: 'easeOut', delay },
              }
            : {};

    useEffect(() => {
        const video = videoRef.current;
        if (!video || videoFailed) return;

        const tryPlay = () => {
            video.play().catch(() => {
                // Autoplay may be blocked in WebViews; keep poster visible.
            });
        };

        const handleError = () => {
            setVideoFailed(true);
        };

        video.addEventListener('canplay', tryPlay);
        video.addEventListener('error', handleError);

        if (video.readyState >= 3) {
            tryPlay();
        }

        return () => {
            video.removeEventListener('canplay', tryPlay);
            video.removeEventListener('error', handleError);
        };
    }, [videoFailed]);

    return (
        <Box
            as="section"
            id="how-to-play"
            bg="bg.default"
            py={{ base: 8, md: 12 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <SimpleGrid
                    columns={{ base: 1, lg: 2 }}
                    spacing={{ base: 12, lg: 20 }}
                    alignItems="center"
                >
                    {/* Left Side: Text and Features */}
                    <VStack align="start" spacing={10}>
                        <MotionVStack align="start" spacing={6} {...fadeUp(0)}>
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
                        </MotionVStack>

                        <VStack spacing={6} align="stretch" width="100%">
                            <MotionBox {...fadeUp(0.1)}>
                                <FeatureCard
                                    step={1}
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
                            </MotionBox>
                            <MotionBox {...fadeUp(0.2)}>
                                <FeatureCard
                                    step={2}
                                    icon={MdTableBar}
                                    iconBg="brand.navy"
                                    iconColor="white"
                                    title="Host Your Table"
                                    description={
                                        <>
                                            Spin up a{' '}
                                            <Highlight color="pink">
                                                private room
                                            </Highlight>
                                            . Set the blinds, choose the game
                                            speed, and control exactly who sits
                                            down. It’s{' '}
                                            <Highlight color="pink">
                                                your rules
                                            </Highlight>
                                            .
                                        </>
                                    }
                                />
                            </MotionBox>
                            <MotionBox {...fadeUp(0.3)}>
                                <FeatureCard
                                    step={3}
                                    icon={HiLink}
                                    iconBg="brand.pink"
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
                            </MotionBox>
                        </VStack>
                    </VStack>

                    {/* Right Side: iPhone Mockup Video */}
                    <MotionBox {...fadeUp(0.15)} alignSelf="center">
                        <Box
                            width="100%"
                            className="iphone-mockup"
                            maxW={{ base: '272px', md: '336px', lg: '416px' }}
                            ml={{ base: 'auto', lg: 'auto' }}
                            mr={{ base: 'auto', lg: 0 }}
                            position="relative"
                            aspectRatio={751 / 1510}
                        >
                            <Box
                                className="iphone-mockup-frame"
                                position="absolute"
                                inset="0"
                                zIndex={2}
                                pointerEvents="none"
                            >
                                <Box
                                    position="relative"
                                    width="100%"
                                    height="100%"
                                >
                                    <NextImage
                                        src="/homepage/iphonemock.png"
                                        alt="iPhone mockup frame"
                                        fill
                                        sizes="(max-width: 48em) 272px, (max-width: 62em) 336px, 416px"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </Box>
                            </Box>

                            <Box
                                className="iphone-mockup-video"
                                position="absolute"
                                top="2.38%"
                                bottom="2.38%"
                                left="5.46%"
                                right="5.06%"
                                borderRadius="28px"
                                overflow="hidden"
                                bg="black"
                                zIndex={1}
                            >
                            {videoFailed ? (
                                <NextImage
                                    src="/previews/home_preview.png"
                                    alt="Stacked Poker preview"
                                    fill
                                    sizes="(max-width: 48em) 272px, (max-width: 62em) 336px, 416px"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <Box
                                    className="iphone-mockup-video-inner"
                                    as="video"
                                    ref={videoRef}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    poster="/previews/home_preview.png"
                                >
                                    <source
                                        src="/video/demoiphone.mp4"
                                        type="video/mp4"
                                    />
                                    <source
                                        src="/video/demoiphone.webm"
                                        type="video/webm"
                                    />
                                </Box>
                            )}
                            </Box>
                        </Box>
                    </MotionBox>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default FeaturesSection;
