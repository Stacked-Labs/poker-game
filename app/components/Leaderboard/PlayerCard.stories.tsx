'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    VStack,
    Flex,
    Text,
    HStack,
    Icon,
    Progress,
    Tooltip,
    IconButton,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaShare, FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { blo } from 'blo';
import { ThirdwebProvider } from 'thirdweb/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import type { AppState } from '@/app/interfaces';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import { getTier } from './tierUtils';

// ─── Replicate PlayerCard's internal rendering without auth hooks ────────────

const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

const pulseAmber = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
`;

interface PlayerCardPreviewProps {
    address: string;
    rank: number;
    points: number;
    pointsToNext: number;
    nextRank: number;
    nextPoints: number;
    total: number;
    stats: { gamesCreated: number; gamesPlayed: number; handsPlayed?: number };
    referralInfo: {
        count: number;
        multiplier: number;
        nextTier: { required: number; multiplier: number } | null;
        hasReferrer: boolean;
    };
}

/**
 * Visual-only preview of the PlayerCard authenticated state.
 * Bypasses useActiveAccount / useAuth so it renders in Storybook
 * without a full thirdweb provider chain.
 */
const PlayerCardPreview: React.FC<PlayerCardPreviewProps> = ({
    address,
    rank,
    points,
    pointsToNext,
    nextRank,
    nextPoints,
    total,
    stats,
    referralInfo,
}) => {
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const tier = getTier(rank, total);
    const gap = pointsToNext;
    const progressPct =
        gap > 0 && nextPoints > 0
            ? Math.min((points / (points + gap)) * 100, 99)
            : rank === 1
                ? 100
                : 0;
    const isNearMiss = gap > 0 && gap / (points + gap) <= 0.1;

    return (
        <Box position="relative" width="100%">
            <Box
                bg="card.white"
                borderRadius="24px"
                p={{ base: 5, md: 6 }}
                boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
                position="relative"
                overflow="hidden"
            >
                {/* Card suit watermark */}
                <Text
                    position="absolute"
                    bottom="10px"
                    right="14px"
                    fontSize="6xl"
                    opacity={0.03}
                    color="text.primary"
                    transform="rotate(-12deg)"
                    lineHeight={1}
                    userSelect="none"
                    pointerEvents="none"
                >
                    ♠
                </Text>

                {/* Share icon — top-right */}
                <Box position="absolute" top={3} right={3} zIndex={1}>
                    <IconButton
                        aria-label="Share rank"
                        icon={<Icon as={FaShare} boxSize="13px" />}
                        size="xs"
                        variant="unstyled"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="text.secondary"
                        opacity={0.5}
                        _hover={{ opacity: 1, color: 'brand.green' }}
                        _dark={{ color: 'whiteAlpha.500', _hover: { opacity: 1, color: 'brand.green' } }}
                        transition="all 0.2s ease"
                        minW="auto"
                        h="auto"
                        p={1}
                    />
                </Box>

                <VStack spacing={4} align="stretch">
                    {/* A. Profile + Rank hero (horizontal) */}
                    <Flex align="center" gap={{ base: 4, md: 5 }}>
                        <Box position="relative" flexShrink={0}>
                            {/* Tier ring */}
                            <Box
                                position="absolute"
                                inset="-3px"
                                borderRadius="7px"
                                border="2px solid"
                                borderColor={tier.color}
                                opacity={0.5}
                                _dark={{ opacity: 0.35 }}
                            />
                            <Box
                                as="img"
                                src={blo(address as `0x${string}`)}
                                alt=""
                                w="56px"
                                h="56px"
                                borderRadius="4px"
                                boxShadow={`0 4px 16px rgba(0,0,0,0.15), 0 0 12px ${tier.color}22`}
                            />
                        </Box>
                        <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                            <HStack spacing={1.5} align="baseline">
                                <Text
                                    fontSize={{ base: '4xl', md: '5xl' }}
                                    fontWeight={900}
                                    lineHeight={1}
                                    color={tier.color}
                                    textShadow={`0 2px 12px ${tier.color}33`}
                                >
                                    #{rank}
                                </Text>
                                <Tooltip label={`${tier.label} tier`} hasArrow fontSize="xs">
                                    <span>
                                        <Icon as={TIER_ICON[tier.name]} color={tier.color} boxSize="18px" />
                                    </span>
                                </Tooltip>
                            </HStack>
                            <Text
                                as="a"
                                href={`https://sepolia.basescan.org/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="text.secondary"
                                fontSize="xs"
                                fontFamily="mono"
                                mt={1}
                                _hover={{ color: 'brand.green' }}
                                transition="color 0.2s ease"
                            >
                                {truncateAddress(address)}
                            </Text>
                        </VStack>
                    </Flex>

                    {/* B. Points */}
                    <Box
                        bg="rgba(54, 163, 123, 0.06)"
                        _dark={{ bg: 'rgba(54, 163, 123, 0.1)' }}
                        borderRadius="14px"
                        py={2}
                        px={4}
                        mx="auto"
                        w="fit-content"
                    >
                        <HStack spacing={2} align="baseline" justify="center">
                            <Text fontSize="3xl" fontWeight={900} color="brand.green">
                                {points.toLocaleString()}
                            </Text>
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="text.secondary"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                            >
                                points
                            </Text>
                        </HStack>
                    </Box>

                    {/* C. Progress to next rank */}
                    {rank > 1 && gap > 0 && (
                        <Box>
                            <Box h="1px" bg="border.lightGray" opacity={0.5} mb={3} />
                            <Progress
                                value={progressPct}
                                size="xs"
                                borderRadius="full"
                                bg="card.lightGray"
                                sx={{
                                    '& > div': {
                                        background: isNearMiss
                                            ? 'linear-gradient(90deg, #B78900, #FDC51D)'
                                            : 'linear-gradient(90deg, #36A37B, #4ade80)',
                                        borderRadius: 'full',
                                        transition: 'width 0.6s ease',
                                        position: 'relative',
                                        _after: {
                                            content: '""',
                                            position: 'absolute',
                                            right: '-3px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            w: '8px',
                                            h: '8px',
                                            borderRadius: 'full',
                                            bg: isNearMiss ? '#FDC51D' : '#36A37B',
                                            boxShadow: isNearMiss
                                                ? '0 0 6px rgba(253, 197, 29, 0.5)'
                                                : '0 0 6px rgba(54, 163, 123, 0.5)',
                                        },
                                    },
                                }}
                            />
                            <Text
                                fontSize="2xs"
                                color={isNearMiss ? 'brand.yellow' : 'text.secondary'}
                                textAlign="right"
                                mt={1}
                                animation={
                                    isNearMiss
                                        ? `${pulseAmber} 1.4s ease-in-out infinite`
                                        : undefined
                                }
                            >
                                {isNearMiss
                                    ? `Almost there! ${gap.toLocaleString()} pts`
                                    : `${gap.toLocaleString()} pts to #${nextRank}`}
                            </Text>
                        </Box>
                    )}

                    {rank === 1 && (
                        <Text fontSize="xs" color="brand.green" fontWeight="semibold" textAlign="center">
                            👑 You&apos;re on top!
                        </Text>
                    )}

                    {/* D. Stats inline */}
                    <StatsSection stats={stats} />

                    {/* Thin separator */}
                    <Box h="1px" bg="border.lightGray" opacity={0.5} />

                    {/* E. Referral section */}
                    <ReferralCodeSection referralInfo={referralInfo} />
                </VStack>
            </Box>
        </Box>
    );
};

// ─── Storybook meta ───────────────────────────────────────────────────────────

const MOCK_ADDRESS = '0xFA04e1d9C8b3F1b0b8E01A25C9d4568b0C2c445b';

const baseAppState = {
    messages: [], logs: [], username: 'pokerShark',
    clientID: null, address: MOCK_ADDRESS, table: null, game: null,
    volume: 0, chatSoundEnabled: false, chatOverlayEnabled: false,
    fourColorDeckEnabled: false, cardBackDesign: 'classic',
    unreadMessageCount: 0, isChatOpen: false,
    seatRequested: null, seatAccepted: null, pendingPlayers: [],
    showSeatRequestPopups: false, isSettingsOpen: false,
    blindObligation: null, isTableOwner: null,
    settlementStatus: null, displayMode: 'chips', tableClosed: null,
} as AppState;

const meta = {
    title: 'Leaderboard/PlayerCard',
    component: PlayerCardPreview,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <AppContext.Provider value={{ appState: baseAppState, dispatch: () => null }}>
                    <div style={{ maxWidth: 400, padding: 16 }}>
                        <Story />
                    </div>
                </AppContext.Provider>
            </ThirdwebProvider>
        ),
    ],
    argTypes: {
        rank: { control: { type: 'number', min: 1, max: 500 } },
        points: { control: { type: 'number', min: 0, step: 10 } },
        pointsToNext: { control: { type: 'number', min: 0, step: 10 } },
        nextRank: { control: { type: 'number', min: 1 } },
        total: { control: { type: 'number', min: 1 } },
    },
    args: {
        address: MOCK_ADDRESS,
        rank: 6,
        points: 340,
        pointsToNext: 50,
        nextRank: 5,
        nextPoints: 390,
        total: 200,
        stats: { gamesCreated: 19, gamesPlayed: 11, handsPlayed: 67 },
        referralInfo: {
            count: 3,
            multiplier: 1.0,
            nextTier: { required: 5, multiplier: 1.1 },
            hasReferrer: false,
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Full PlayerCard preview (authenticated state). Shows blockie avatar, hero rank number in tier color, points, progress bar, inline stats, and referral section — all without borders. Uses a visual-only wrapper to bypass auth hooks.',
            },
        },
    },
} satisfies Meta<typeof PlayerCardPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Iron tier, rank #6, 50 pts to go — matches the user's screenshot reference. */
export const Default: Story = {};

/** Diamond tier, rank #1 — shows "You're on top!" instead of progress bar. */
export const DiamondRankOne: Story = {
    name: '#1 Diamond',
    args: {
        rank: 1,
        points: 9200,
        pointsToNext: 0,
        nextRank: 0,
        nextPoints: 0,
        total: 200,
        stats: { gamesCreated: 42, gamesPlayed: 156, handsPlayed: 1840 },
    },
};

/** Gold tier with 1.1x referral bonus active. */
export const GoldWithBonus: Story = {
    name: 'Gold + 1.1x Bonus',
    args: {
        rank: 12,
        points: 2800,
        pointsToNext: 200,
        nextRank: 11,
        nextPoints: 3000,
        total: 200,
        stats: { gamesCreated: 8, gamesPlayed: 45, handsPlayed: 312 },
        referralInfo: {
            count: 7,
            multiplier: 1.1,
            nextTier: { required: 20, multiplier: 1.2 },
            hasReferrer: true,
        },
    },
};

/** Near-miss — almost at next rank, amber pulse animation. */
export const NearMiss: Story = {
    name: 'Almost Next Rank',
    args: {
        rank: 15,
        points: 1800,
        pointsToNext: 15,
        nextRank: 14,
        nextPoints: 1815,
        total: 200,
        stats: { gamesCreated: 3, gamesPlayed: 22, handsPlayed: 145 },
    },
};

/** Brand new player — 0 stats, 0 referrals. */
export const NewPlayer: Story = {
    name: 'New Player',
    args: {
        rank: 185,
        points: 10,
        pointsToNext: 40,
        nextRank: 184,
        nextPoints: 50,
        total: 200,
        stats: { gamesCreated: 0, gamesPlayed: 1, handsPlayed: 3 },
        referralInfo: {
            count: 0,
            multiplier: 1.0,
            nextTier: { required: 5, multiplier: 1.1 },
            hasReferrer: false,
        },
    },
};

/** Max referral tier — no next tier, "Max bonus active" message. */
export const MaxReferralTier: Story = {
    name: 'Max Referral (1.2x)',
    args: {
        rank: 3,
        points: 5400,
        pointsToNext: 300,
        nextRank: 2,
        nextPoints: 5700,
        total: 200,
        stats: { gamesCreated: 30, gamesPlayed: 89, handsPlayed: 620 },
        referralInfo: {
            count: 25,
            multiplier: 1.2,
            nextTier: null,
            hasReferrer: true,
        },
    },
};
