'use client';

import React, { useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    Flex,
    Text,
    HStack,
    Icon,
    Button,
    Progress,
    Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useActiveAccount } from 'thirdweb/react';
import { FaWallet, FaTrophy, FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { blo } from 'blo';
import WalletButton from '../WalletButton';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import ShareRankCard from './ShareRankCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRankHistory } from '@/app/hooks/useRankHistory';
import { getTier } from './tierUtils';

const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

import type { UserStats } from './StatsSection';

const rankBounce = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35); }
  60%  { transform: scale(0.9); }
  80%  { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const pulseAmber = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
`;

interface ReferralInfo {
    count: number;
    multiplier: number;
    nextTier: { required: number; multiplier: number } | null;
}

interface PlayerCardProps {
    rank?: number;
    points?: number;
    stats?: UserStats;
    referralInfo?: ReferralInfo;
    pointsToNext?: number;
    nextRank?: number;
    nextPoints?: number;
    total?: number;
    xUsername?: string | null;
    xProfileImageUrl?: string | null;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
    rank,
    points,
    stats,
    referralInfo,
    pointsToNext,
    nextRank,
    nextPoints,
    total = 0,
    xUsername,
    xProfileImageUrl,
}) => {
    const account = useActiveAccount();
    const { isAuthenticated, isAuthenticating, requestAuthentication } =
        useAuth();
    const isConnected = !!account;
    const isFullyAuthenticated = isConnected && isAuthenticated;

    const { improved, previousRank } = useRankHistory(account?.address, rank);
    const confettiFired = useRef(false);

    // Fire confetti once when rank has improved
    useEffect(() => {
        if (!improved || confettiFired.current) return;
        confettiFired.current = true;
        import('canvas-confetti').then((mod) => {
            const confetti = mod.default;
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.5 },
                colors: ['#36A37B', '#FFD700', '#EB0B5C', '#A78BFA'],
            });
        });
    }, [improved]);

    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const tier = rank != null ? getTier(rank, total) : null;

    // Progress bar calculation
    const gap = pointsToNext ?? 0;
    const playerPoints = points ?? 0;
    const neighborPoints = nextPoints ?? 0;
    const progressPct =
        gap > 0 && neighborPoints > 0
            ? Math.min(
                  ((playerPoints / (playerPoints + gap)) * 100),
                  99
              )
            : gap === 0 && rank === 1
                ? 100
                : 0;
    const isNearMiss = gap > 0 && gap / (playerPoints + gap) <= 0.1;

    return (
        <Box position="relative" width="100%">
            <Box
                bg="card.white"
                borderRadius="24px"
                p={{ base: 5, md: 6 }}
                boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
                style={{ filter: isFullyAuthenticated ? 'none' : 'blur(4px)' }}
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
                {isFullyAuthenticated && rank != null && account && (
                    <Box position="absolute" top={3} right={3} zIndex={1}>
                        <ShareRankCard
                            rank={rank}
                            points={playerPoints}
                            address={account.address}
                            total={total}
                        />
                    </Box>
                )}

                <VStack spacing={4} align="stretch">
                    {isFullyAuthenticated && (
                        <>
                            {/* A. Profile + Rank hero (horizontal) */}
                            <Flex align="center" gap={{ base: 4, md: 5 }}>
                                {/* Avatar with tier ring */}
                                <Box position="relative" flexShrink={0}>
                                    {tier && (
                                        <Box
                                            position="absolute"
                                            inset="-3px"
                                            borderRadius={xProfileImageUrl ? 'full' : '7px'}
                                            border="2px solid"
                                            borderColor={tier.color}
                                            opacity={0.5}
                                            _dark={{ opacity: 0.35 }}
                                        />
                                    )}
                                    <Box
                                        as="img"
                                        src={xProfileImageUrl ?? blo(account!.address as `0x${string}`)}
                                        alt=""
                                        w="56px"
                                        h="56px"
                                        borderRadius={xProfileImageUrl ? 'full' : '4px'}
                                        objectFit="cover"
                                        boxShadow={
                                            tier
                                                ? `0 4px 16px rgba(0,0,0,0.15), 0 0 12px ${tier.color}22`
                                                : '0 4px 16px rgba(0,0,0,0.15)'
                                        }
                                    />
                                </Box>

                                <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                                    {/* Rank + tier */}
                                    <HStack spacing={1.5} align="baseline">
                                        <Text
                                            fontSize={{ base: '4xl', md: '5xl' }}
                                            fontWeight={900}
                                            lineHeight={1}
                                            color={tier?.color ?? 'text.primary'}
                                            textShadow={tier ? `0 2px 12px ${tier.color}33` : 'none'}
                                            animation={
                                                improved
                                                    ? `${rankBounce} 0.7s ease-out`
                                                    : undefined
                                            }
                                        >
                                            {rank != null ? `#${rank}` : '—'}
                                        </Text>
                                        {tier && (
                                            <Tooltip
                                                label={`${tier.label} tier`}
                                                hasArrow
                                                fontSize="xs"
                                            >
                                                <span>
                                                    <Icon
                                                        as={TIER_ICON[tier.name]}
                                                        color={tier.color}
                                                        boxSize="18px"
                                                    />
                                                </span>
                                            </Tooltip>
                                        )}
                                    </HStack>

                                    {/* Identity — X username or wallet address */}
                                    <Text
                                        as="a"
                                        href={
                                            xUsername
                                                ? `https://x.com/${xUsername}`
                                                : `https://sepolia.basescan.org/address/${account!.address}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        color="text.secondary"
                                        fontSize="xs"
                                        fontFamily={xUsername ? 'body' : 'mono'}
                                        mt={1}
                                        _hover={{ color: 'brand.green' }}
                                        transition="color 0.2s ease"
                                    >
                                        {xUsername ? `@${xUsername}` : truncateAddress(account!.address)}
                                    </Text>
                                </VStack>
                            </Flex>

                            {/* Rank-up message */}
                            {improved && previousRank != null && (
                                <Text
                                    fontSize="xs"
                                    color="brand.green"
                                    fontWeight="semibold"
                                    textAlign="center"
                                >
                                    🎉 Climbed from #{previousRank} → #{rank}!
                                </Text>
                            )}

                            {/* B. Points (single line, accent pill) */}
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
                                    <Text
                                        fontSize="3xl"
                                        fontWeight={900}
                                        color="brand.green"
                                    >
                                        {playerPoints.toLocaleString()}
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
                            {rank != null && rank > 1 && gap > 0 && nextRank != null && (
                                <Box>
                                    <Box
                                        h="1px"
                                        bg="border.lightGray"
                                        opacity={0.5}
                                        mb={3}
                                    />
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
                                <Text
                                    fontSize="xs"
                                    color="brand.green"
                                    fontWeight="semibold"
                                    textAlign="center"
                                >
                                    👑 You&apos;re on top!
                                </Text>
                            )}
                        </>
                    )}

                    {/* D. Stats inline */}
                    <StatsSection stats={stats} />

                    {/* Thin separator */}
                    <Box h="1px" bg="border.lightGray" opacity={0.5} />

                    {/* E. Referral section */}
                    <ReferralCodeSection referralInfo={referralInfo} />
                </VStack>
            </Box>

            {/* Auth overlay */}
            {!isFullyAuthenticated && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    align="center"
                    justify="center"
                    direction="column"
                    bg="rgba(12, 21, 49, 0.82)"
                    borderRadius="24px"
                    backdropFilter="blur(10px)"
                    _dark={{ bg: 'rgba(0, 0, 0, 0.7)' }}
                >
                    <VStack spacing={4}>
                        <Icon
                            as={FaWallet}
                            boxSize={12}
                            color="white"
                            opacity={0.7}
                        />
                        <Text
                            color="white"
                            fontSize="lg"
                            textAlign="center"
                            fontWeight="medium"
                        >
                            {!isConnected
                                ? 'Connect to view stats'
                                : isAuthenticating
                                  ? 'Check your wallet to sign the message…'
                                  : 'Please complete authentication'}
                        </Text>
                        {!isConnected ? (
                            <WalletButton
                                width="200px"
                                height="48px"
                                label="Sign In"
                            />
                        ) : (
                            <Button
                                height="48px"
                                bg="brand.green"
                                color="white"
                                fontWeight="bold"
                                borderRadius="12px"
                                onClick={requestAuthentication}
                                isLoading={isAuthenticating}
                                loadingText="Waiting…"
                                _hover={{
                                    bg: '#2d9268',
                                    transform: 'translateY(-2px)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s ease"
                            >
                                Finish Sign-In
                            </Button>
                        )}
                    </VStack>
                </Flex>
            )}
        </Box>
    );
};

export default PlayerCard;
