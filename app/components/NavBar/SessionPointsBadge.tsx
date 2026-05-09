'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, HStack, Text, Tooltip, useColorModeValue, useToken } from '@chakra-ui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

const MotionBox = motion(Box);

// 1500 → "1.5K", 12340 → "12.3K", 100000 → "100K", 999 → "999"
function formatPoints(n: number): string {
    if (n < 1000) return n.toLocaleString('en-US');
    const k = n / 1000;
    if (k >= 100) return `${Math.round(k)}K`;
    const fixed = k.toFixed(1);
    return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}K`;
}

type Tier = 'stack' | 'gold' | 'overcharge';
const tierFor = (pts: number): Tier => {
    if (pts >= 1000) return 'overcharge';
    if (pts >= 200) return 'gold';
    return 'stack';
};

export default function SessionPointsBadge() {
    const sessionTotal = usePointsAnimationStore((s) => s.sessionTotal);
    const prefersReducedMotion = useReducedMotion();

    const prevRef = useRef(sessionTotal);
    const [delta, setDelta] = useState<number | null>(null);
    const [tick, setTick] = useState(false);
    const deltaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bg = useColorModeValue('white', '#171717');
    const border = useColorModeValue('rgba(11, 20, 48, 0.08)', 'rgba(255, 255, 255, 0.08)');
    const stripeColor = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.05)');
    const labelColor = useColorModeValue('rgba(11, 20, 48, 0.55)', 'rgba(236, 238, 245, 0.55)');
    const ptsColor = useColorModeValue('rgba(11, 20, 48, 0.65)', 'rgba(236, 238, 245, 0.7)');
    const tooltipBg = useColorModeValue('brand.darkNavy', 'gray.700');

    const [green, yellow, pink, navy] = useToken('colors', [
        'brand.green',
        'brand.yellow',
        'brand.pink',
        'brand.darkNavy',
    ]);
    const tier = useMemo(() => tierFor(sessionTotal), [sessionTotal]);
    const palette = useMemo(() => {
        switch (tier) {
            case 'overcharge':
                return {
                    chipBg: pink,
                    numColor: 'white',
                    dashColor: 'rgba(255, 255, 255, 0.6)',
                    deltaColor: pink,
                };
            case 'gold':
                return {
                    chipBg: yellow,
                    numColor: navy,
                    dashColor: 'rgba(11, 20, 48, 0.45)',
                    deltaColor: yellow,
                };
            default:
                return {
                    chipBg: green,
                    numColor: 'white',
                    dashColor: 'rgba(255, 255, 255, 0.55)',
                    deltaColor: green,
                };
        }
    }, [tier, green, yellow, pink, navy]);

    useEffect(() => {
        const diff = sessionTotal - prevRef.current;
        if (diff > 0) {
            setDelta(diff);
            setTick(true);
            if (deltaTimer.current) clearTimeout(deltaTimer.current);
            deltaTimer.current = setTimeout(() => setDelta(null), 1300);
            if (tickTimer.current) clearTimeout(tickTimer.current);
            tickTimer.current = setTimeout(() => setTick(false), 420);
        }
        prevRef.current = sessionTotal;
    }, [sessionTotal]);

    const fullValue = sessionTotal.toLocaleString('en-US');
    const displayValue = formatPoints(sessionTotal);

    return (
        <Tooltip
            label={`Leaderboard points this session: ${fullValue}. Bigger stakes, bigger points.`}
            placement="top"
            hasArrow
            fontSize="xs"
            bg={tooltipBg}
            color="white"
            borderRadius="md"
            px={3}
            py={2}
            maxWidth="240px"
            textAlign="center"
        >
            <Box position="relative" display="inline-flex">
                <Box
                    position="relative"
                    bg={bg}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="xl"
                    px="10px"
                    py="5px"
                    boxShadow="card.lift"
                    overflow="hidden"
                    cursor="default"
                    userSelect="none"
                    _after={{
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, ${stripeColor} 6px 7px)`,
                        opacity: 0.55,
                    }}
                    aria-label={`Session points: ${fullValue}`}
                >
                    <HStack spacing="8px" align="center" position="relative" zIndex={1}>
                        <Text
                            fontSize="9px"
                            fontWeight={700}
                            color={labelColor}
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            lineHeight={1}
                        >
                            Session
                        </Text>

                        <MotionBox
                            position="relative"
                            borderRadius="md"
                            px="9px"
                            py="4px"
                            flexShrink={0}
                            animate={
                                tick && !prefersReducedMotion
                                    ? { rotate: [-3, -7, -3], scale: [1, 1.07, 1] }
                                    : { rotate: -3, scale: 1 }
                            }
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            sx={{
                                transformOrigin: 'center',
                                backgroundColor: palette.chipBg,
                                boxShadow:
                                    tier === 'overcharge'
                                        ? `0 1px 2px rgba(11, 20, 48, 0.18), 0 0 14px ${pink}55`
                                        : tier === 'gold'
                                            ? `0 1px 2px rgba(11, 20, 48, 0.18), 0 0 12px ${yellow}55`
                                            : '0 1px 2px rgba(11, 20, 48, 0.18)',
                                transition: 'background-color 0.45s ease, box-shadow 0.45s ease',
                            }}
                        >
                            <Box
                                position="absolute"
                                inset="3px"
                                borderRadius="4px"
                                border="1.5px dashed"
                                borderColor={palette.dashColor}
                                pointerEvents="none"
                                sx={{ transition: 'border-color 0.45s ease' }}
                            />
                            <Text
                                fontSize="13px"
                                fontWeight={800}
                                lineHeight={1}
                                position="relative"
                                color={palette.numColor}
                                sx={{
                                    fontVariantNumeric: 'tabular-nums',
                                    fontFeatureSettings: '"tnum"',
                                    letterSpacing: '0.01em',
                                    transition: 'color 0.45s ease',
                                }}
                            >
                                {displayValue}
                            </Text>
                        </MotionBox>

                        <Text
                            fontSize="10px"
                            fontWeight={700}
                            color={ptsColor}
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            lineHeight={1}
                        >
                            pts
                        </Text>
                    </HStack>
                </Box>

                <AnimatePresence>
                    {delta !== null && (
                        <MotionBox
                            key={`d-${sessionTotal}`}
                            initial={{ opacity: 0, y: 2, scale: 0.85, rotate: -6 }}
                            animate={{ opacity: 1, y: -14, scale: 1, rotate: -3 }}
                            exit={{ opacity: 0, y: -22, scale: 0.85, rotate: -3 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            position="absolute"
                            top="-2px"
                            right="36px"
                            pointerEvents="none"
                        >
                            <Text
                                fontSize="11px"
                                fontWeight={800}
                                lineHeight={1}
                                color={palette.deltaColor}
                                sx={{
                                    fontVariantNumeric: 'tabular-nums',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                +{formatPoints(delta)}
                            </Text>
                        </MotionBox>
                    )}
                </AnimatePresence>
            </Box>
        </Tooltip>
    );
}
