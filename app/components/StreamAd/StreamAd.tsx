'use client';

import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { HomeDecor, ProgressSegments, QrCard } from './primitives';
import { driftStyle, enter, halo, sceneStyle } from './streamAdMotion';
import SceneCreate from './scenes/SceneCreate';
import SceneHero from './scenes/SceneHero';
import SceneHost from './scenes/SceneHost';
import SceneInstant from './scenes/SceneInstant';
import SceneLeaderboard from './scenes/SceneLeaderboard';
import SceneTournaments from './scenes/SceneTournaments';

// Hidden single-viewport (100vw x 100vh, no scroll) broadcast frame for the 24/7
// stream — the billboard Twitch/Kick viewers see when no real games are live. It
// rotates six full-screen scenes on a CSS-only loop (hero, host-to-earn, instant
// play, leaderboard, create-your-game, tournaments) under persistent chrome: top
// bar, LIVE badge, scene progress, and a scannable QR card.
//
// The frame is locked to the homepage's light look (bg.default light gradient,
// dark navy inks, white cards) regardless of color mode, so the broadcast always
// renders the same.
//
// Motion is pure CSS keyframes (compositor-driven transform/opacity), not JS/rAF:
// the stream worker runs headful Chromium under Xvfb where rAF is throttled but
// CSS animation still composites frames. Scene rotation and progress segments
// share the same delay scheme (see streamAdMotion.ts).

const SCENES = [SceneHero, SceneHost, SceneInstant, SceneLeaderboard, SceneCreate, SceneTournaments];

export default function StreamAd() {
    return (
        <Box
            position="fixed"
            inset={0}
            zIndex={99999}
            w="100vw"
            h="100vh"
            overflow="hidden"
            bg="linear-gradient(to top, rgb(237, 237, 237) 45%, rgb(238, 238, 238) 100%)"
            color="brand.darkNavy"
            fontFamily="var(--font-poppins)"
        >
            <HomeDecor />

            {/* ── Content ─────────────────────────────────────────────── */}
            <Flex
                position="relative"
                zIndex={1}
                direction="column"
                h="100%"
                px="clamp(32px, 5vw, 76px)"
                py="clamp(26px, 4vh, 50px)"
            >
                {/* Top bar */}
                <Flex justify="space-between" align="center" sx={enter(0)}>
                    <HStack spacing="clamp(10px, 1vw, 16px)">
                        <Flex
                            align="center"
                            justify="center"
                            w="clamp(38px, 3.4vw, 54px)"
                            h="clamp(38px, 3.4vw, 54px)"
                            borderRadius="14px"
                            bg="white"
                            border="1px solid"
                            borderColor="brand.lightGray"
                            boxShadow="0 8px 24px rgba(11, 20, 48, 0.1)"
                        >
                            <Box
                                w="74%"
                                h="74%"
                                bgImage="url('/IconLogo.png')"
                                bgSize="contain"
                                bgRepeat="no-repeat"
                                bgPosition="center"
                            />
                        </Flex>
                        <Text
                            color="brand.darkNavy"
                            fontWeight={800}
                            letterSpacing="0.14em"
                            fontSize="clamp(1.1rem, 1.9vw, 1.7rem)"
                        >
                            STACKED
                        </Text>
                    </HStack>

                    <HStack spacing="clamp(14px, 1.6vw, 24px)">
                        <ProgressSegments />
                        <Text
                            color="brand.navy"
                            fontWeight={700}
                            fontSize="clamp(0.85rem, 1.3vw, 1.2rem)"
                            letterSpacing="0.01em"
                            display={{ base: 'none', md: 'block' }}
                        >
                            stackedpoker.io
                        </Text>
                        <HStack
                            spacing="clamp(8px, 0.8vw, 12px)"
                            bg="brand.pink"
                            border="1px solid"
                            borderColor="brand.pinkDark"
                            borderRadius="full"
                            px="clamp(12px, 1.1vw, 18px)"
                            py="clamp(7px, 0.7vh, 10px)"
                            boxShadow="0 4px 14px rgba(235, 11, 92, 0.35)"
                        >
                            <Box position="relative" display="inline-flex">
                                <Box
                                    position="absolute"
                                    inset={0}
                                    borderRadius="full"
                                    bg="white"
                                    sx={{ animation: `${halo} 2.4s ease-out infinite` }}
                                />
                                <Box
                                    position="relative"
                                    w="clamp(8px, 0.8vw, 11px)"
                                    h="clamp(8px, 0.8vw, 11px)"
                                    borderRadius="full"
                                    bg="white"
                                />
                            </Box>
                            <Text
                                color="white"
                                fontWeight={800}
                                fontSize="clamp(0.72rem, 1vw, 0.95rem)"
                                letterSpacing="0.18em"
                            >
                                LIVE · 24/7
                            </Text>
                        </HStack>
                    </HStack>
                </Flex>

                {/* Scene stage — four absolutely-stacked scenes crossfading on the cycle */}
                <Box position="relative" flex="1" minH={0} sx={enter(0.2)}>
                    {SCENES.map((Scene, i) => (
                        <Box key={i} sx={sceneStyle(i)}>
                            <Box h="100%" sx={driftStyle(i)}>
                                <Scene />
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* QR card — persistent so it's always scannable */}
                <Flex justify="flex-end" sx={enter(0.5)}>
                    <QrCard />
                </Flex>
            </Flex>
        </Box>
    );
}
