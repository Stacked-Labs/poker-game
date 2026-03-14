'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

type HeatLevel = 'cold' | 'warm' | 'hot' | 'overcharge';

const getHeatLevel = (pts: number): HeatLevel => {
    if (pts >= 500) return 'overcharge';
    if (pts >= 200) return 'hot';
    if (pts >= 50) return 'warm';
    return 'cold';
};

const HEAT_ACCENT: Record<HeatLevel, string> = {
    cold:       '#36A37B',
    warm:       '#36A37B',
    hot:        '#FDC51D',
    overcharge: '#EB0B5C',
};

const HEAT_GLOW: Record<HeatLevel, string> = {
    cold:       '0 0 8px rgba(54,163,123,0.25)',
    warm:       '0 0 14px rgba(54,163,123,0.55)',
    hot:        '0 0 18px rgba(253,197,29,0.55)',
    overcharge: '0 0 24px rgba(235,11,92,0.75), 0 0 48px rgba(235,11,92,0.3)',
};

const pylonBar = keyframes`
  0%, 100% { transform: scaleY(0.5); opacity: 0.4; }
  50%       { transform: scaleY(1);   opacity: 1; }
`;

const MotionBox = motion(Box);
const MotionText = motion(Text);

export default function SessionPointsBadge() {
    const sessionTotal = usePointsAnimationStore((s) => s.sessionTotal);
    const prefersReducedMotion = useReducedMotion();

    const prevTotalRef = useRef(sessionTotal);
    const [delta, setDelta] = useState<number | null>(null);
    const [pulsingPylon, setPulsingPylon] = useState(false);
    const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pylonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const heat = getHeatLevel(sessionTotal);
    const accent = HEAT_ACCENT[heat];
    const glow = HEAT_GLOW[heat];

    const badgeBg = useColorModeValue('rgba(236, 238, 245, 0.95)', 'rgba(6, 8, 18, 0.88)');
const numberColor = useColorModeValue('brand.darkNavy', 'white');
    const tooltipBg = useColorModeValue('brand.darkNavy', 'gray.700');

    useEffect(() => {
        const diff = sessionTotal - prevTotalRef.current;
        if (diff > 0) {
            setDelta(diff);
            setPulsingPylon(true);

            if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
            deltaTimerRef.current = setTimeout(() => setDelta(null), 1600);

            if (pylonTimerRef.current) clearTimeout(pylonTimerRef.current);
            pylonTimerRef.current = setTimeout(() => setPulsingPylon(false), 800);
        }
        prevTotalRef.current = sessionTotal;
    }, [sessionTotal]);

    return (
        <Tooltip
            label="Leaderboard points earned this session. Awarded each hand — equal to the big blind."
            placement="top"
            hasArrow
            fontSize="xs"
            bg={tooltipBg}
            color="white"
            borderRadius="md"
            px={3}
            py={2}
            maxWidth="200px"
            textAlign="center"
        >
            <Box
                position="relative"
                display="inline-flex"
                cursor="default"
                userSelect="none"
                bg={badgeBg}
                sx={{
                    backdropFilter: 'blur(10px)',
                    borderRight: `2.5px solid ${accent}`,
                    borderBottom: `1px solid ${accent}44`,
                    boxShadow: `inset -1px 0 0 ${accent}22, ${glow}`,
                }}
                px={3}
                pt="6px"
                pb="5px"
            >
                <Flex align="center" gap="8px">
                    {/* Energy pylon — 3 stacked bars */}
                    <Flex
                        direction="column"
                        align="center"
                        justify="flex-end"
                        gap="2px"
                        height="18px"
                        flexShrink={0}
                    >
                        {[0, 1, 2].map((i) => (
                            <Box
                                key={i}
                                width="3px"
                                borderRadius="1px"
                                bg={accent}
                                sx={{
                                    height: `${(i + 1) * 4}px`,
                                    opacity: pulsingPylon ? 1 : 0.4 + i * 0.2,
                                    transformOrigin: 'bottom',
                                    animation: pulsingPylon
                                        ? `${pylonBar} 0.4s ease-in-out ${i * 0.08}s`
                                        : undefined,
                                    transition: 'opacity 0.3s ease',
                                    boxShadow: pulsingPylon ? `0 0 6px ${accent}` : undefined,
                                }}
                            />
                        ))}
                    </Flex>

                    {/* Points counter */}
                    <Flex direction="column" align="flex-start" gap={0} minWidth="52px">
                        {/* Label */}
                        <Text
                            fontSize="8px"
                            fontWeight={700}
                            letterSpacing="0.18em"
                            textTransform="uppercase"
                            color={`${accent}dd`}
                            lineHeight={1}
                            mb="1px"
                        >
                            SESSION
                        </Text>

                        {/* Main number — slot machine roll */}
                        <Flex align="baseline" gap="4px" overflow="hidden" height="18px">
                            <Box overflow="hidden" height="18px">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <MotionText
                                        key={sessionTotal}
                                        initial={prefersReducedMotion ? { opacity: 1 } : { y: 8, opacity: 0, filter: 'blur(3px)' }}
                                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                        exit={{ y: -8, opacity: 0, filter: 'blur(3px)' }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        fontSize="13px"
                                        fontWeight={800}
                                        color={numberColor}
                                        lineHeight={1}
                                        display="block"
                                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {sessionTotal.toLocaleString('en-US')}
                                    </MotionText>
                                </AnimatePresence>
                            </Box>
                            <Text
                                fontSize="9px"
                                fontWeight={700}
                                color={accent}
                                lineHeight={1}
                                letterSpacing="0.1em"
                            >
                                PTS
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                {/* Delta overlay "+X" */}
                <AnimatePresence>
                    {delta !== null && (
                        <MotionBox
                            key={`delta-${sessionTotal}`}
                            initial={{ opacity: 0, y: 4, scale: 0.8 }}
                            animate={{ opacity: 1, y: -2, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.7 }}
                            transition={{ duration: 0.2 }}
                            position="absolute"
                            top="-18px"
                            left="50%"
                            sx={{ transform: 'translateX(-50%)' }}
                            pointerEvents="none"
                        >
                            <Text
                                fontSize="10px"
                                fontWeight={800}
                                color={accent}
                                sx={{
                                    fontFamily: 'monospace',
                                    textShadow: `0 0 8px ${accent}`,
                                }}
                            >
                                +{delta}
                            </Text>
                        </MotionBox>
                    )}
                </AnimatePresence>
            </Box>
        </Tooltip>
    );
}
