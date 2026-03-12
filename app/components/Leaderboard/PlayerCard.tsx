'use client';

import React, { useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    Flex,
    Text,
    Heading,
    Avatar,
    Badge,
    HStack,
    Icon,
    Button,
    Progress,
    Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useActiveAccount } from 'thirdweb/react';
import { FaWallet, FaTrophy } from 'react-icons/fa';
import WalletButton from '../WalletButton';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import ShareRankCard from './ShareRankCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRankHistory } from '@/app/hooks/useRankHistory';
import { getTier, TIER_EMOJI } from './tierUtils';

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
                p={{ base: 4, md: 5 }}
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
                style={{ filter: isFullyAuthenticated ? 'none' : 'blur(4px)' }}
                position="relative"
                overflow="hidden"
            >
                <VStack spacing={4} align="stretch">
                    {isFullyAuthenticated && (
                        <>
                            {/* Profile Header */}
                            <VStack spacing={3}>
                                <Avatar
                                    size="lg"
                                    border="3px solid"
                                    borderColor="brand.green"
                                    boxShadow="0 0 16px rgba(54, 163, 123, 0.35)"
                                    _dark={{
                                        borderColor: 'brand.green',
                                        boxShadow: '0 0 20px rgba(54, 163, 123, 0.45)',
                                    }}
                                />
                                <VStack spacing={2}>
                                    <Heading
                                        size="sm"
                                        color="text.primary"
                                        textAlign="center"
                                    >
                                        Player #
                                        {account!.address.slice(-4).toUpperCase()}
                                    </Heading>
                                    <HStack spacing={2}>
                                        <Icon as={FaWallet} color="text.gray600" />
                                        <Text
                                            color="text.gray600"
                                            fontSize="sm"
                                            fontFamily="mono"
                                        >
                                            {truncateAddress(account!.address)}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </VStack>

                            {/* Rank Badge + Tier */}
                            <Flex justify="center">
                                <HStack spacing={3}>
                                    <Badge
                                        bg="brand.navy"
                                        color="white"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                        fontSize="sm"
                                        fontWeight="bold"
                                        boxShadow="0 4px 12px rgba(12, 21, 49, 0.25)"
                                        animation={
                                            improved
                                                ? `${rankBounce} 0.7s ease-out`
                                                : undefined
                                        }
                                    >
                                        <HStack spacing={2}>
                                            <Icon as={FaTrophy} color="#FFD700" />
                                            <Text color="brand.lightGray">
                                                {rank != null ? `Rank #${rank}` : 'Unranked'}
                                            </Text>
                                        </HStack>
                                    </Badge>

                                    {/* Tier chip */}
                                    {tier && (
                                        <Tooltip
                                            label={`${tier.label} tier`}
                                            hasArrow
                                            fontSize="xs"
                                        >
                                            <Badge
                                                px={3}
                                                py={1.5}
                                                borderRadius="full"
                                                fontWeight="bold"
                                                fontSize="xs"
                                                style={{
                                                    background: `${tier.color}22`,
                                                    color: tier.color,
                                                    border: `1px solid ${tier.color}55`,
                                                    cursor: 'default',
                                                }}
                                            >
                                                {TIER_EMOJI[tier.name]} {tier.label}
                                            </Badge>
                                        </Tooltip>
                                    )}
                                </HStack>
                            </Flex>

                            {/* Rank-up message */}
                            {improved && previousRank != null && (
                                <Flex justify="center">
                                    <Text
                                        fontSize="xs"
                                        color="brand.green"
                                        fontWeight="semibold"
                                        textAlign="center"
                                    >
                                        🎉 Climbed from #{previousRank} → #{rank}!
                                    </Text>
                                </Flex>
                            )}

                            {/* Points */}
                            <Flex justify="center">
                                <Text
                                    fontSize="2xl"
                                    fontWeight="extrabold"
                                    color="brand.green"
                                >
                                    {playerPoints.toLocaleString()} pts
                                </Text>
                            </Flex>

                            {/* Progress to next rank */}
                            {rank != null && rank > 1 && gap > 0 && nextRank != null && (
                                <Box>
                                    <HStack justify="space-between" mb={1.5}>
                                        <Text fontSize="xs" color="text.secondary">
                                            Progress to #{nextRank}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color={isNearMiss ? 'brand.yellow' : 'text.secondary'}
                                            animation={
                                                isNearMiss
                                                    ? `${pulseAmber} 1.4s ease-in-out infinite`
                                                    : undefined
                                            }
                                        >
                                            {isNearMiss
                                                ? `Almost there! ${gap.toLocaleString()} pts`
                                                : `${gap.toLocaleString()} pts to go`}
                                        </Text>
                                    </HStack>
                                    <Progress
                                        value={progressPct}
                                        size="sm"
                                        borderRadius="full"
                                        bg="card.lightGray"
                                        sx={{
                                            '& > div': {
                                                background: isNearMiss
                                                    ? 'linear-gradient(90deg, #B78900, #FDC51D)'
                                                    : 'linear-gradient(90deg, #36A37B, #4ade80)',
                                                borderRadius: 'full',
                                                transition: 'width 0.6s ease',
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            {rank === 1 && (
                                <Flex justify="center">
                                    <Text fontSize="xs" color="brand.green" fontWeight="semibold">
                                        👑 You&apos;re on top!
                                    </Text>
                                </Flex>
                            )}
                        </>
                    )}

                    <StatsSection stats={stats} />
                    <ReferralCodeSection referralInfo={referralInfo} />

                    {/* Share button */}
                    {isFullyAuthenticated && rank != null && account && (
                        <ShareRankCard
                            rank={rank}
                            points={playerPoints}
                            address={account.address}
                            total={total}
                        />
                    )}
                </VStack>
            </Box>

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
