'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import React, { useRef, useEffect, useState } from 'react';
import HomeCard from './HomeCard';
import ScrollIndicator from './ScrollIndicator';
import { keyframes } from '@emotion/react';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const revealFromLeft = keyframes`
  from { clip-path: inset(0 100% 0 0); opacity: 1; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
`;

const subtleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
  50% { text-shadow: 0 0 30px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.1); }
`;

// Random free-floating character animations
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-3px, -12px); }
  50% { transform: translate(2px, -18px); }
  75% { transform: translate(-2px, -10px); }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(4px, -8px); }
  50% { transform: translate(-2px, -20px); }
  80% { transform: translate(3px, -6px); }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(-4px, -15px); }
  60% { transform: translate(3px, -22px); }
  90% { transform: translate(-1px, -8px); }
`;

const float4 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  15% { transform: translate(2px, -10px); }
  45% { transform: translate(-3px, -17px); }
  70% { transform: translate(4px, -12px); }
`;

const float5 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  35% { transform: translate(-2px, -14px); }
  55% { transform: translate(3px, -19px); }
  85% { transform: translate(-4px, -9px); }
`;

const float6 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(3px, -11px); }
  60% { transform: translate(-4px, -21px); }
  85% { transform: translate(2px, -7px); }
`;

const MotionBox = motion(Box);

const VIDEO_POSTER_SRC = '/video/bgplaceholder.png';

const HomeSection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [videoError, setVideoError] = useState(false);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    // Parallax and Scale transforms for the video
    // Increased range from 10% to 20% travel to make the parallax more pronounced
    const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
    const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.0]);

    const words = React.useMemo(() => ['HOST', 'YOUR', 'POKER', 'GAME'], []);
    const floatAnimations = React.useMemo(
        () => [float1, float2, float3, float4, float5, float6],
        []
    );

    // Handle video loading and playback
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

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

        // Defensive: if the browser doesn't honor `loop` for some reason, restart manually.
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

        // If we attach after the event already fired (e.g. StrictMode/dev timing), still attempt playback.
        if (video.readyState >= 3) tryPlay();

        return () => {
            video.removeEventListener('canplay', tryPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

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
                style={{
                    y: videoY,
                    scale: videoScale,
                    transformOrigin: '70% center',
                }}
                sx={{
                    pointerEvents: 'none',
                }}
            >
                {videoError ? (
                    <Box
                        as="img"
                        src={VIDEO_POSTER_SRC}
                        alt=""
                        aria-hidden="true"
                        position="absolute"
                        inset={0}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        objectPosition="70% center"
                    />
                ) : (
                    <MotionBox
                        as="video"
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster={VIDEO_POSTER_SRC}
                        position="absolute"
                        inset={0}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        objectPosition="70% center"
                    >
                        <source
                            src="/video/background2.webm"
                            type="video/webm"
                        />
                        <source src="/video/background.mp4" type="video/mp4" />
                    </MotionBox>
                )}
            </MotionBox>

            <Flex
                position="relative"
                width="100%"
                height="100%"
                flexWrap={{ base: 'wrap', lg: 'nowrap' }}
                gap={0}
                zIndex={2}
            >
                <Box width={{ base: '100%', lg: '40%' }}>
                    <HomeCard />
                </Box>
                {false && (
                    <VStack
                        width={{ base: '100%', lg: '60%' }}
                        justifyContent="center"
                        alignItems={{ base: 'center', lg: 'flex-start' }}
                        spacing={0}
                        mt={{ base: 8, lg: 16, xl: 20 }}
                    >
                        <>
                            {words.map((word, wordIndex) => (
                                <Box
                                    key={wordIndex}
                                    as="h1"
                                    fontSize={{
                                        base: '3xl',
                                        lg: '8xl',
                                        xl: '9xl',
                                    }}
                                    fontWeight="extrabold"
                                    fontFamily="heading"
                                    color="white"
                                    lineHeight={1.1}
                                    display="flex"
                                >
                                    {word.split('').map((char, charIndex) => {
                                        const totalDelay =
                                            wordIndex * 0.15 + charIndex * 0.08;
                                        const floatDelay = totalDelay + 2;

                                        // Pick random animation and duration for each character
                                        const animIndex =
                                            (wordIndex * 7 + charIndex * 3) %
                                            floatAnimations.length;
                                        const floatAnim =
                                            floatAnimations[animIndex];
                                        const floatDuration =
                                            20 + (charIndex % 7) * 2.5;

                                        return (
                                            <Box
                                                key={charIndex}
                                                as="span"
                                                display="inline-block"
                                                animation={`
                                                    ${fadeIn} 0.7s ease-out ${totalDelay}s forwards,
                                                    ${subtleGlow} 8s ease-in-out ${floatDelay}s infinite,
                                                    ${floatAnim} ${floatDuration}s cubic-bezier(0.42, 0, 0.58, 1) ${floatDelay}s infinite
                                                `}
                                                opacity={0}
                                                willChange="transform"
                                            >
                                                {char}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ))}
                            <Text
                                fontSize="4xl"
                                color="white"
                                animation={`${revealFromLeft} 3s ease-out 2s forwards`}
                                opacity={0}
                                fontFamily={`'Libre Barcode 39 Text', system-ui`}
                            >
                                HOST AND PLAY FOR ANY ERC20
                            </Text>
                        </>
                    </VStack>
                )}
            </Flex>

            {/* Scroll Indicator */}
            <ScrollIndicator />
        </Box>
    );
};

export default HomeSection;
