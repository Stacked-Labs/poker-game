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
import { keyframes } from '@emotion/react';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// Icon glow pulse animation
const iconGlow = keyframes`
    0%, 100% { box-shadow: 0 6px 12px -4px var(--glow-color); }
    50% { box-shadow: 0 8px 20px -2px var(--glow-color), 0 0 30px -4px var(--glow-color); }
`;

const FeatureCard = ({
    icon,
    title,
    description,
    iconBg,
    iconColor,
    step,
    index,
}: {
    icon: React.ElementType;
    title: string;
    description: React.ReactNode;
    iconBg: string;
    iconColor: string;
    step: number;
    index: number;
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
        <MotionBox
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: index * 0.15,
            }}
        >
            <Box
                bg="card.white"
                p={{ base: 5, md: 6 }}
                borderRadius="28px"
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="glass"
                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                _hover={{
                    transform: 'translateY(-6px)',
                    boxShadow: 'glass-hover',
                    borderColor: iconBg,
                }}
                position="relative"
                overflow="hidden"
                role="group"
            >
                {/* Gradient accent line */}
                <Box
                    position="absolute"
                    left="0"
                    top="18px"
                    bottom="18px"
                    w="3px"
                    bgGradient={`linear(to-b, ${iconBg}, transparent)`}
                    opacity={0.5}
                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    _groupHover={{ opacity: 0.9, w: '4px' }}
                />

                {/* Background gradient on hover */}
                <Box
                    position="absolute"
                    inset={0}
                    bgGradient={`radial(circle at 0% 50%, ${resolvedIconBg}12, transparent 60%)`}
                    opacity={0}
                    transition="opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    _groupHover={{ opacity: 1 }}
                    pointerEvents="none"
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
                    border="1px solid"
                    borderColor={`${resolvedIconBg}20`}
                >
                    {stepLabel}
                </Badge>

                <HStack spacing={4} mb={3} align="center">
                    <Flex
                        w="48px"
                        h="48px"
                        bg={iconBg}
                        color={iconColor}
                        borderRadius="16px"
                        align="center"
                        justify="center"
                        fontSize="22px"
                        boxShadow={`0 6px 16px -2px ${shadowColor}, 0 0 24px -4px ${shadowColor}`}
                        transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        style={
                            {
                                '--glow-color': shadowColor,
                            } as React.CSSProperties
                        }
                        _groupHover={{
                            transform: 'scale(1.1) rotate(-3deg)',
                            animation: `${iconGlow} 2s ease-in-out infinite`,
                        }}
                        position="relative"
                        sx={{
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 'inherit',
                                background:
                                    'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent)',
                                pointerEvents: 'none',
                            },
                        }}
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
                    position="relative"
                    zIndex={1}
                >
                    {description}
                </Text>
            </Box>
        </MotionBox>
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
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || videoFailed) return;

        let playAttempts = 0;
        const maxAttempts = 5;
        const timeoutIds: NodeJS.Timeout[] = [];
        let isMounted = true;

        const tryPlay = async () => {
            if (!isMounted) return;

            try {
                await video.play();
                if (isMounted) {
                    setIsPlaying(true);
                }
            } catch (error) {
                if (playAttempts < maxAttempts && isMounted) {
                    playAttempts++;
                    const timeoutId = setTimeout(tryPlay, 200 * playAttempts);
                    timeoutIds.push(timeoutId);
                }
            }
        };

        const handleError = () => {
            if (isMounted) {
                setVideoFailed(true);
            }
        };

        const handleCanPlay = () => {
            tryPlay();
        };

        const handleLoadedData = () => {
            tryPlay();
        };

        const handlePlay = () => {
            if (isMounted) {
                setIsPlaying(true);
            }
        };

        const handlePause = () => {
            if (isMounted) {
                setIsPlaying(false);
            }
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        if (video.readyState >= 2) {
            tryPlay();
        }

        return () => {
            isMounted = false;
            timeoutIds.forEach(clearTimeout);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoFailed]);

    const handleVideoClick = () => {
        const video = videoRef.current;
        if (!video || videoFailed) return;

        if (video.paused) {
            video.play().catch(() => {});
        }
    };

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
                        <MotionVStack
                            align="start"
                            spacing={6}
                            initial={
                                shouldAnimate
                                    ? { opacity: 0, y: 24 }
                                    : undefined
                            }
                            whileInView={
                                shouldAnimate
                                    ? { opacity: 1, y: 0 }
                                    : undefined
                            }
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{
                                type: 'spring',
                                stiffness: 150,
                                damping: 20,
                            }}
                        >
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
                            <FeatureCard
                                step={1}
                                icon={IoWallet}
                                iconBg="brand.green"
                                iconColor="white"
                                title="Jump In Instantly"
                                index={0}
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
                                step={2}
                                icon={MdTableBar}
                                iconBg="brand.navy"
                                iconColor="white"
                                title="Host Your Table"
                                index={1}
                                description={
                                    <>
                                        Spin up a{' '}
                                        <Highlight color="pink">
                                            private room
                                        </Highlight>
                                        . Set the blinds, choose the game speed,
                                        and control exactly who sits down.
                                        It&apos;s{' '}
                                        <Highlight color="pink">
                                            your rules
                                        </Highlight>
                                        .
                                    </>
                                }
                            />
                            <FeatureCard
                                step={3}
                                icon={HiLink}
                                iconBg="brand.pink"
                                iconColor="white"
                                title="Share & Play"
                                index={2}
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

                    {/* Right Side: iPhone Mockup Video */}
                    <MotionBox
                        initial={
                            shouldAnimate
                                ? { opacity: 0, y: 30, scale: 0.95 }
                                : undefined
                        }
                        whileInView={
                            shouldAnimate
                                ? { opacity: 1, y: 0, scale: 1 }
                                : undefined
                        }
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            type: 'spring',
                            stiffness: 150,
                            damping: 20,
                            delay: 0.2,
                        }}
                        alignSelf="center"
                    >
                        <Box
                            width="100%"
                            className="iphone-mockup"
                            maxW={{
                                base: '272px',
                                md: '336px',
                                lg: '416px',
                            }}
                            ml={{ base: 'auto', lg: 'auto' }}
                            mr={{ base: 'auto', lg: 0 }}
                            position="relative"
                            aspectRatio={751 / 1510}
                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            filter="drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))"
                            _hover={{
                                transform: 'scale(1.02) rotate(1deg)',
                                filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.12))',
                            }}
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
                                cursor={
                                    !isPlaying && !videoFailed
                                        ? 'pointer'
                                        : 'default'
                                }
                                onClick={handleVideoClick}
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
                                        preload="auto"
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
