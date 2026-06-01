'use client';

import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { useRef, useEffect, useState } from 'react';
import HomeCard from './HomeCard';
import ScrollIndicator from './ScrollIndicator';
import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);

const VIDEO_POSTER_SRC = '/video/bgplaceholder.webp';

type HomeSectionProps = {
    isBroadcast?: boolean;
};

const HomeSection = ({ isBroadcast = false }: HomeSectionProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [videoError, setVideoError] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false;
    // Broadcast mode (livestream worker) is treated like reduced motion for
    // rendering stability: no autoplay video, no parallax.
    const staticMode = isBroadcast || prefersReducedMotion;

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    // Parallax and Scale transforms for the video
    const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
    const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.0]);

    useEffect(() => {
        if (staticMode) {
            setShouldLoadVideo(false);
            return;
        }

        const connection = (
            navigator as Navigator & {
                connection?: {
                    saveData?: boolean;
                    effectiveType?: string;
                };
            }
        ).connection;
        const saveData = connection?.saveData ?? false;
        const slowConnection =
            connection?.effectiveType === 'slow-2g' ||
            connection?.effectiveType === '2g';

        setShouldLoadVideo(!saveData && !slowConnection);
    }, [staticMode]);

    // Handle video loading and playback
    useEffect(() => {
        if (!shouldLoadVideo) return;
        const video = videoRef.current;
        const section = sectionRef.current;
        if (!video || !section) return;

        setVideoError(false);

        const tryPlay = () => {
            // Try to play as soon as the browser says it can; poster remains until playback starts.
            video.play().catch(() => {
                // Autoplay was prevented; poster remains visible.
            });
        };

        const handleError = () => {
            setVideoError(true);
        };

        const handleEnded = () => {
            try {
                video.currentTime = 0;
            } catch {
                // ignore
            }
            tryPlay();
        };

        video.addEventListener('canplay', tryPlay);
        video.addEventListener('error', handleError);
        video.addEventListener('ended', handleEnded);

        // Pause when scrolled off-screen so mobile devices don't decode video for nothing.
        const visibilityObserver = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (entry.isIntersecting) {
                    tryPlay();
                } else {
                    video.pause();
                }
            },
            { threshold: 0.01 }
        );
        visibilityObserver.observe(section);

        if (video.readyState >= 3) tryPlay();

        return () => {
            video.removeEventListener('canplay', tryPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('ended', handleEnded);
            visibilityObserver.disconnect();
        };
    }, [shouldLoadVideo]);

    const enableParallax = isDesktop && !staticMode;

    return (
        <Box
            ref={sectionRef}
            position="relative"
            className="home-section"
            width="100vw"
            bg="bg.default"
            height="var(--full-vh)"
            bgPosition={{ base: 'right', lg: 'center' }}
            overflow="hidden"
        >
            {/* Background Media (use poster on the same <video> element to avoid img-vs-video fit differences) */}
            <MotionBox
                position="absolute"
                top="-8%"
                left="0"
                width="100%"
                height="120%"
                zIndex={0}
                style={
                    enableParallax
                        ? {
                              y: videoY,
                              scale: videoScale,
                              transformOrigin: '70% center',
                          }
                        : undefined
                }
                sx={{
                    pointerEvents: 'none',
                }}
            >
                <MotionBox
                    as="video"
                    ref={videoRef}
                    autoPlay={shouldLoadVideo}
                    loop={shouldLoadVideo}
                    muted
                    playsInline
                    preload={shouldLoadVideo ? 'metadata' : 'none'}
                    poster={VIDEO_POSTER_SRC}
                    position="absolute"
                    inset={0}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    objectPosition="70% center"
                    style={
                        !shouldLoadVideo
                            ? {
                                  transform: 'scale(1.05)',
                                  transformOrigin: '70% center',
                              }
                            : undefined
                    }
                >
                    {shouldLoadVideo && !videoError ? (
                        <>
                            <source
                                src="/video/background2.webm"
                                type="video/webm"
                            />
                            <source
                                src="/video/background.mp4"
                                type="video/mp4"
                            />
                        </>
                    ) : null}
                </MotionBox>
            </MotionBox>

            <FloatingDecor density="light" />

            <Flex
                position="relative"
                width="100%"
                height="100%"
                flexWrap={{ base: 'wrap', lg: 'nowrap' }}
                gap={0}
                zIndex={2}
            >
                <Box width={{ base: '100%', lg: '40%' }}>
                    <HomeCard isBroadcast={isBroadcast} />
                </Box>
            </Flex>

            {/* Bottom fade — soft transition into the page bg below */}
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height={{ base: '120px', md: '180px' }}
                bgGradient="linear(to-b, rgba(237, 237, 237, 0), rgba(237, 237, 237, 1))"
                _dark={{
                    bgGradient:
                        'linear(to-b, rgba(25, 25, 25, 0), rgba(25, 25, 25, 1))',
                }}
                pointerEvents="none"
                zIndex={4}
            />

            {/* Scroll Indicator */}
            <ScrollIndicator isBroadcast={isBroadcast} />
        </Box>
    );
};

export default HomeSection;
