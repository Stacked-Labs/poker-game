'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import {
    Box,
    HStack,
    Icon,
    Progress,
    Text,
    VStack,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import TooltipOrPopover from '../TooltipOrPopover';
import type { TierInfo } from '../Leaderboard/tierUtils';

export interface RankLadderInlineProps {
    rank: number;
    points: number;
    tier: TierInfo;
    /** Points to pass the player ranked just above; null when unknown (rank 1 or fetch failed). */
    pointsToNext: number | null;
    nextRank: number | null;
    improved?: boolean;
    previousRank?: number | null;
    loading?: boolean;
    /** ShareRank trigger from the container. */
    shareSlot?: ReactNode;
}

// Own-hub rank progress, extracted headless from PlayerCard so the hero keeps one ring /
// one watermark / one confetti owner. Points are STATUS, never money — the only money-colored
// figure on the page is host earnings. Near-miss is a static amber state (no urgency pulse).
export default function RankLadderInline({
    rank,
    points,
    tier,
    pointsToNext,
    nextRank,
    improved,
    previousRank,
    loading,
    shareSlot,
}: RankLadderInlineProps) {
    const prefersReduced = usePrefersReducedMotion();
    const fired = useRef(false);

    useEffect(() => {
        if (!improved || fired.current || prefersReduced) return;
        fired.current = true;
        import('canvas-confetti')
            .then((mod) => {
                mod.default({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: ['#36A37B', '#FDC51D', '#5E86B0', '#EB0B5C'],
                });
            })
            .catch(() => {});
    }, [improved, prefersReduced]);

    const isTop = rank === 1;
    const gap = pointsToNext ?? 0;
    const total = points + gap;
    const pct = gap > 0 && total > 0 ? Math.min((points / total) * 100, 99) : isTop ? 100 : 0;
    const nearMiss = gap > 0 && total > 0 && gap / total <= 0.1;

    return (
        <VStack align="stretch" spacing={2} w="full">
            <HStack justify="space-between" align="center">
                <HStack spacing={2} align="baseline">
                    <Text
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight={900}
                        lineHeight={1}
                        color={tier.token}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        #{rank}
                    </Text>
                    <TooltipOrPopover
                        label={`${tier.label} tier — climb by earning points`}
                        aria-label={`${tier.label} tier`}
                    >
                        <Icon as={tier.icon} color={tier.token} boxSize="16px" aria-hidden />
                    </TooltipOrPopover>
                </HStack>
                {shareSlot}
            </HStack>

            <HStack spacing={1.5} align="baseline">
                <Text
                    fontSize="xl"
                    fontWeight={800}
                    color="brand.green"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {points.toLocaleString()}
                </Text>
                <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    color="text.muted"
                >
                    points · status
                </Text>
            </HStack>
            <Text fontSize="2xs" color="text.muted">
                Points are your standing, not money.
            </Text>

            {improved && previousRank != null && (
                <HStack spacing={1.5}>
                    <Icon as={FiTrendingUp} color="brand.green" boxSize="14px" aria-hidden />
                    <Text fontSize="xs" fontWeight={700} color="brand.green">
                        Climbed from #{previousRank} to #{rank}
                    </Text>
                </HStack>
            )}

            {loading ? (
                <Box h="6px" borderRadius="full" bg="border.lightGray" opacity={0.5} />
            ) : isTop ? (
                <HStack spacing={1.5}>
                    <Icon
                        as={FaCrown}
                        color="brand.yellowDark"
                        _dark={{ color: 'brand.yellow' }}
                        boxSize="14px"
                        aria-hidden
                    />
                    <Text fontSize="xs" fontWeight={700} color="text.primary">
                        You&apos;re on top
                    </Text>
                </HStack>
            ) : pointsToNext != null && nextRank != null ? (
                <Box>
                    <Progress
                        value={pct}
                        size="xs"
                        borderRadius="full"
                        bg="border.lightGray"
                        sx={{
                            '& > div': {
                                bg: nearMiss ? 'brand.yellow' : 'brand.green',
                                borderRadius: 'full',
                            },
                        }}
                        aria-label={`${gap} points to rank ${nextRank}`}
                    />
                    <Text
                        fontSize="2xs"
                        mt={1}
                        color={nearMiss ? 'brand.yellowDark' : 'text.muted'}
                        _dark={nearMiss ? { color: 'brand.yellow' } : undefined}
                        fontWeight={nearMiss ? 700 : 500}
                    >
                        {nearMiss
                            ? `Almost there · ${gap.toLocaleString()} pts to #${nextRank}`
                            : `${gap.toLocaleString()} pts to #${nextRank}`}
                    </Text>
                </Box>
            ) : null}
        </VStack>
    );
}
