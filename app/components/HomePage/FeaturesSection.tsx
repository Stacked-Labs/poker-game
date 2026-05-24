'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    useBreakpointValue,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

type Step = {
    n: number;
    title: string;
    body: string;
    color: string;
    rotate: string;
    tintRgba: string;
};

const STEPS: Step[] = [
    {
        n: 1,
        title: 'Jump in instantly',
        body: 'Use what you have: Google, Discord, or your wallet. Or play free as a guest. No signup, no email, no nothing.',
        color: 'brand.green',
        rotate: '-3deg',
        tintRgba: 'rgba(54, 163, 123, 0.06)',
    },
    {
        n: 2,
        title: 'Host your table',
        body: 'Spin up a private room. Set the blinds, choose the game speed, and control exactly who sits down. Your rules.',
        color: 'brand.navy',
        rotate: '2deg',
        tintRgba: 'rgba(51, 68, 121, 0.06)',
    },
    {
        n: 3,
        title: 'Share and play',
        body: 'Drop the link in your group chat. Friends join instantly on any browser or device. No app store downloads, ever.',
        color: 'brand.pink',
        rotate: '-2deg',
        tintRgba: 'rgba(235, 11, 92, 0.05)',
    },
];

const StepRow = ({
    step,
    last,
    delay,
    shouldAnimate,
}: {
    step: Step;
    last: boolean;
    delay: number;
    shouldAnimate: boolean;
}) => (
    <MotionBox
        initial={shouldAnimate ? { opacity: 0, x: -16 } : undefined}
        whileInView={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
            type: 'spring',
            stiffness: 200,
            damping: 22,
            delay,
        }}
    >
        <Box
            py={{ base: 5, md: 6 }}
            px={{ base: 2, md: 3 }}
            mx={{ base: -2, md: -3 }}
            borderBottom={last ? 'none' : '1px solid'}
            borderColor="border.lightGray"
            borderRadius="14px"
            transition="background 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            role="group"
            _hover={{ bg: step.tintRgba }}
        >
            <HStack align="flex-start" spacing={{ base: 4, md: 6 }}>
                <Text
                    as="span"
                    display="inline-block"
                    color={step.color}
                    fontSize={{ base: '6xl', md: '7xl', lg: '8xl' }}
                    fontWeight="black"
                    lineHeight={0.9}
                    letterSpacing="-0.06em"
                    minW={{ base: '78px', md: '110px', lg: '130px' }}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                    transform={`rotate(${step.rotate})`}
                    transformOrigin="center"
                    transition="transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    _groupHover={{
                        transform: `rotate(${step.rotate}) scale(1.06)`,
                    }}
                >
                    {String(step.n).padStart(2, '0')}
                </Text>
                <VStack align="start" spacing={2} flex={1} pt={{ md: 1 }}>
                    <Heading
                        as="h3"
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="bold"
                        color="text.primary"
                        letterSpacing="-0.02em"
                        lineHeight={1.2}
                    >
                        {step.title}
                    </Heading>
                    <Text
                        color="text.secondary"
                        fontSize={{ base: 'sm', md: 'md' }}
                        lineHeight="tall"
                        fontWeight="medium"
                    >
                        {step.body}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    </MotionBox>
);

const FeaturesSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
    const shouldAnimate = !prefersReducedMotion && !isMobile;
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [shouldLoadDemoVideo, setShouldLoadDemoVideo] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section || shouldLoadDemoVideo) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldLoadDemoVideo(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px 0px' }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, [shouldLoadDemoVideo]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || videoFailed || !shouldLoadDemoVideo) return;

        let playAttempts = 0;
        const maxAttempts = 5;
        const timeoutIds: NodeJS.Timeout[] = [];
        let isMounted = true;

        const tryPlay = async () => {
            if (!isMounted) return;
            try {
                await video.play();
                if (isMounted) setIsPlaying(true);
            } catch {
                if (playAttempts < maxAttempts && isMounted) {
                    playAttempts++;
                    const timeoutId = setTimeout(tryPlay, 200 * playAttempts);
                    timeoutIds.push(timeoutId);
                }
            }
        };

        const handleError = () => {
            if (isMounted) setVideoFailed(true);
        };
        const handleCanPlay = () => tryPlay();
        const handleLoadedData = () => tryPlay();
        const handlePlay = () => {
            if (isMounted) setIsPlaying(true);
        };
        const handlePause = () => {
            if (isMounted) setIsPlaying(false);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        if (video.readyState >= 2) tryPlay();

        return () => {
            isMounted = false;
            timeoutIds.forEach(clearTimeout);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoFailed, shouldLoadDemoVideo]);

    const handleVideoClick = () => {
        const video = videoRef.current;
        if (!shouldLoadDemoVideo) {
            setShouldLoadDemoVideo(true);
            return;
        }
        if (!video || videoFailed) return;
        if (video.paused) {
            video.play().catch(() => {});
        }
    };

    return (
        <Box
            as="section"
            id="how-to-play"
            ref={sectionRef}
            py={{ base: 10, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <SimpleGrid
                    columns={{ base: 1, lg: 2 }}
                    spacing={{ base: 12, lg: 16 }}
                    alignItems="center"
                >
                    {/* Left: iPhone mockup with demo video */}
                    <MotionBox
                        initial={
                            shouldAnimate
                                ? { opacity: 0, y: 30, scale: 0.96 }
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
                        }}
                        alignSelf="center"
                        order={{ base: 1, lg: 1 }}
                    >
                        <Box
                            width="100%"
                            className="iphone-mockup"
                            maxW={{
                                base: '272px',
                                md: '336px',
                                lg: '416px',
                            }}
                            mx={{ base: 'auto', lg: 0 }}
                            ml={{ lg: 'auto' }}
                            mr={{ lg: '12' }}
                            position="relative"
                            aspectRatio={751 / 1510}
                            transform={{
                                base: 'rotate(0deg)',
                                md: 'rotate(-1.5deg)',
                            }}
                            transition="transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            filter="drop-shadow(0 22px 40px rgba(11, 20, 48, 0.18)) drop-shadow(0 8px 16px rgba(11, 20, 48, 0.10))"
                            _dark={{
                                filter: 'drop-shadow(0 22px 40px rgba(0, 0, 0, 0.55)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                            }}
                            _hover={{
                                transform: {
                                    base: 'translateY(-4px)',
                                    md: 'rotate(-1.5deg) translateY(-4px)',
                                },
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
                                        as="video"
                                        ref={videoRef}
                                        width="100%"
                                        height="100%"
                                        objectFit="cover"
                                        autoPlay={shouldLoadDemoVideo}
                                        muted
                                        loop
                                        playsInline
                                        preload={
                                            shouldLoadDemoVideo
                                                ? 'metadata'
                                                : 'none'
                                        }
                                        poster="/previews/home_preview.png"
                                    >
                                        {shouldLoadDemoVideo ? (
                                            <>
                                                <source
                                                    src="/video/demoiphone.webm"
                                                    type="video/webm"
                                                />
                                                <source
                                                    src="/video/demoiphone.mp4"
                                                    type="video/mp4"
                                                />
                                            </>
                                        ) : null}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </MotionBox>

                    {/* Right: numbered narrative — no card chrome */}
                    <MotionVStack
                        align="start"
                        spacing={4}
                        initial={
                            shouldAnimate ? { opacity: 0, y: 24 } : undefined
                        }
                        whileInView={
                            shouldAnimate ? { opacity: 1, y: 0 } : undefined
                        }
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            type: 'spring',
                            stiffness: 150,
                            damping: 20,
                        }}
                        order={{ base: 2, lg: 2 }}
                    >
                        <Heading
                            fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                            fontWeight="extrabold"
                            color="text.primary"
                            letterSpacing="-0.03em"
                            lineHeight={1.05}
                        >
                            3 Steps to the{' '}
                            <Box
                                as="span"
                                display="inline-block"
                                position="relative"
                                px={1}
                            >
                                Flop
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
                        </Heading>
                        <Text
                            fontSize={{ base: 'lg', md: 'xl' }}
                            color="text.secondary"
                            fontWeight="medium"
                            lineHeight="tall"
                            maxW="md"
                        >
                            No downloads. No updates. Just play.
                        </Text>
                        <VStack
                            align="stretch"
                            spacing={0}
                            width="100%"
                            pt={2}
                        >
                            {STEPS.map((step, i) => (
                                <StepRow
                                    key={step.n}
                                    step={step}
                                    last={i === STEPS.length - 1}
                                    delay={shouldAnimate ? i * 0.1 : 0}
                                    shouldAnimate={shouldAnimate}
                                />
                            ))}
                        </VStack>
                    </MotionVStack>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default FeaturesSection;
