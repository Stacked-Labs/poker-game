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
    AspectRatio,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useActiveAccount } from 'thirdweb/react';
import { FaWallet, FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaMedal, FaXTwitter } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { blo } from 'blo';
import { playerDisplayName } from '@/app/utils/address';
import WalletButton from '../WalletButton';
import { SocialIconButton } from '@/app/components/SocialIconButton';
import StatsSection from './StatsSection';
import ReferralCodeSection from './ReferralCodeSection';
import ShareRankCard from './ShareRankCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { useConnectX } from '@/app/hooks/useConnectX';
import { useRankHistory } from '@/app/hooks/useRankHistory';
import { getTier } from './tierUtils';
import type { UserStats } from './StatsSection';

const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

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
    hasReferrer?: boolean;
    myCode?: string | null;
}

export type PlayerAuthState = 'disconnected' | 'connected-not-authed' | 'authed';

export interface PlayerCardViewProps {
    authState: PlayerAuthState;
    address?: string;
    xUsername?: string | null;
    xDisplayName?: string | null;
    xProfileImageUrl?: string | null;
    rank?: number;
    points?: number;
    total?: number;
    pointsToNext?: number;
    nextRank?: number;
    nextPoints?: number;
    improved?: boolean;
    previousRank?: number;
    stats?: UserStats;
    referralInfo?: ReferralInfo;
    initialReferralCode?: string;
    isAuthenticating?: boolean;
    isConnectingX?: boolean;
    isDisconnectingX?: boolean;
    onRequestAuth?: () => void;
    onConnectX?: () => void;
    onDisconnectX?: () => void;
    // Story slot — overrides the real WalletButton when provided.
    signInButton?: React.ReactNode;
}

interface PlayerCardProps {
    rank?: number;
    points?: number;
    stats?: UserStats;
    referralInfo?: ReferralInfo;
    initialReferralCode?: string;
    pointsToNext?: number;
    nextRank?: number;
    nextPoints?: number;
    total?: number;
    xUsername?: string | null;
    xDisplayName?: string | null;
    xProfileImageUrl?: string | null;
}

function CardBack({ style, accent }: { style?: React.CSSProperties; accent?: boolean }) {
    return (
        <Box
            w="76px"
            h="104px"
            borderRadius="8px"
            bg={accent ? 'brand.green' : 'brand.darkNavy'}
            border="2px solid"
            borderColor="rgba(255, 255, 255, 0.45)"
            boxShadow="0 8px 18px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.06)"
            sx={{
                backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 6px, transparent 6px 12px)',
                ...style,
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Icon as={FaWallet} boxSize="22px" color="white" opacity={0.9} aria-hidden />
        </Box>
    );
}

export function PlayerCardView({
    authState,
    address,
    xUsername,
    xDisplayName,
    xProfileImageUrl,
    rank,
    points,
    total = 0,
    pointsToNext,
    nextRank,
    nextPoints,
    improved,
    previousRank,
    stats,
    referralInfo,
    initialReferralCode,
    isAuthenticating,
    isConnectingX,
    isDisconnectingX,
    onRequestAuth,
    onConnectX,
    onDisconnectX,
    signInButton,
}: PlayerCardViewProps) {
    const isAuthed = authState === 'authed';
    const tier = rank != null ? getTier(rank, total) : null;

    const gap = pointsToNext ?? 0;
    const playerPoints = points ?? 0;
    const neighborPoints = nextPoints ?? 0;
    const progressPct =
        gap > 0 && neighborPoints > 0
            ? Math.min(((playerPoints / (playerPoints + gap)) * 100), 99)
            : gap === 0 && rank === 1
                ? 100
                : 0;
    const isNearMiss = gap > 0 && gap / (playerPoints + gap) <= 0.1;

    if (!isAuthed) {
        return (
            <Box position="relative" width="100%" maxW="400px">
                <AspectRatio ratio={1}>
                    <Box
                        bg="rgba(12, 21, 49, 0.82)"
                        backdropFilter="blur(10px)"
                        _dark={{
                            bg: 'rgba(0, 0, 0, 0.7)',
                            boxShadow: '0 16px 30px rgba(0, 0, 0, 0.45)',
                        }}
                        borderRadius="24px"
                        boxShadow="0 14px 32px rgba(12, 21, 49, 0.18)"
                        position="relative"
                        overflow="hidden"
                        p={{ base: 6, md: 7 }}
                    >
                        <Text
                            position="absolute"
                            bottom="14px"
                            right="18px"
                            fontSize="8xl"
                            opacity={0.06}
                            color="white"
                            transform="rotate(-12deg)"
                            lineHeight={1}
                            userSelect="none"
                            pointerEvents="none"
                        >
                            ♠
                        </Text>

                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            h="100%"
                            position="relative"
                            zIndex={1}
                            gap={5}
                        >
                            <Box position="relative" h="96px" w="120px">
                                <CardBack
                                    style={{
                                        position: 'absolute',
                                        left: '8px',
                                        top: '6px',
                                        transform: 'rotate(-8deg)',
                                    }}
                                />
                                <CardBack
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '0',
                                        transform: 'rotate(7deg)',
                                    }}
                                    accent
                                />
                            </Box>

                            <VStack spacing={1.5}>
                                <Text
                                    fontSize={{ base: 'xl', md: '2xl' }}
                                    fontWeight={900}
                                    color="white"
                                    lineHeight={1.15}
                                    textAlign="center"
                                >
                                    Stack points. Climb ranks. Get rewarded.
                                </Text>
                                <Text
                                    fontSize="sm"
                                    color="whiteAlpha.700"
                                    textAlign="center"
                                    lineHeight={1.45}
                                >
                                    Sign in to start.
                                </Text>
                            </VStack>

                            {authState === 'disconnected' ? (
                                signInButton ?? (
                                    <WalletButton
                                        width="200px"
                                        height="48px"
                                        label="Sign In"
                                    />
                                )
                            ) : (
                                <Button
                                    variant="tactilePrimary"
                                    height="48px"
                                    px={6}
                                    onClick={onRequestAuth}
                                    isLoading={isAuthenticating}
                                    loadingText="Waiting…"
                                >
                                    Finish Sign-In
                                </Button>
                            )}
                        </Flex>
                    </Box>
                </AspectRatio>
            </Box>
        );
    }

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

                {rank != null && address && (
                    <Box position="absolute" top={3} right={3} zIndex={1}>
                        <ShareRankCard
                            rank={rank}
                            points={playerPoints}
                            address={address}
                            total={total}
                        />
                    </Box>
                )}

                <VStack spacing={4} align="stretch">
                    <Flex align="center" gap={{ base: 4, md: 5 }}>
                        <Box position="relative" flexShrink={0}>
                            {tier && (
                                <Box
                                    position="absolute"
                                    inset="-3px"
                                    borderRadius={xProfileImageUrl ? 'full' : '9px'}
                                    border="2px solid"
                                    borderColor={tier.color}
                                    opacity={0.5}
                                    _dark={{ opacity: 0.35 }}
                                />
                            )}
                            <Box
                                as="img"
                                src={xProfileImageUrl ?? (address ? blo(address as `0x${string}`) : undefined)}
                                alt=""
                                w="64px"
                                h="64px"
                                borderRadius={xProfileImageUrl ? 'full' : '6px'}
                                objectFit="cover"
                                boxShadow={
                                    tier
                                        ? `0 4px 16px rgba(0,0,0,0.15), 0 0 12px ${tier.color}22`
                                        : '0 4px 16px rgba(0,0,0,0.15)'
                                }
                            />
                        </Box>

                        <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                            <HStack spacing={1.5} align="baseline">
                                <Text
                                    fontSize={{ base: '4xl', md: '5xl' }}
                                    fontWeight={900}
                                    lineHeight={1}
                                    color={tier?.color ?? 'text.primary'}
                                    textShadow={tier ? `0 2px 12px ${tier.color}33` : 'none'}
                                    animation={improved ? `${rankBounce} 0.7s ease-out` : undefined}
                                >
                                    {rank != null ? `#${rank}` : '—'}
                                </Text>
                                {tier && (
                                    <Tooltip label={`${tier.label} tier`} hasArrow fontSize="xs">
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

                            <Text
                                as="a"
                                href={
                                    xUsername
                                        ? `https://x.com/${xUsername}`
                                        : address
                                            ? `https://sepolia.basescan.org/address/${address}`
                                            : undefined
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
                                {playerDisplayName(
                                    xUsername ? `@${xUsername}` : null,
                                    address,
                                    xDisplayName
                                )}
                            </Text>

                            {xUsername ? (
                                <HStack
                                    as="button"
                                    onClick={onDisconnectX}
                                    disabled={isDisconnectingX}
                                    spacing={1.5}
                                    mt={1}
                                    alignSelf="flex-start"
                                    cursor="pointer"
                                    bg="transparent"
                                    border="none"
                                    outline="none"
                                    p={0}
                                    opacity={0.6}
                                    _hover={{ opacity: 1 }}
                                    _focus={{ outline: 'none', boxShadow: 'none' }}
                                    _focusVisible={{ outline: 'none', boxShadow: 'none' }}
                                    _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                                    transition="all 0.15s ease"
                                    sx={{
                                        '&:hover .unlink-text, &:hover .unlink-icon': {
                                            color: 'brand.pink',
                                        },
                                    }}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="text.secondary"
                                        className="unlink-text"
                                    >
                                        {isDisconnectingX ? 'Unlinking…' : 'Unlink'}
                                    </Text>
                                    <Icon
                                        as={FaXTwitter}
                                        boxSize="11px"
                                        color="text.secondary"
                                        className="unlink-icon"
                                    />
                                </HStack>
                            ) : (
                                <Box mt={2} alignSelf="flex-start">
                                    <SocialIconButton
                                        tone="x"
                                        label={isConnectingX ? 'Linking…' : 'Link X'}
                                        chipSize="sm"
                                        onClick={onConnectX}
                                        isDisabled={isConnectingX}
                                    />
                                </Box>
                            )}
                        </VStack>
                    </Flex>

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

                    {rank != null && rank > 1 && gap > 0 && nextRank != null && (
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
                                animation={isNearMiss ? `${pulseAmber} 1.4s ease-in-out infinite` : undefined}
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

                    <StatsSection stats={stats} />

                    <Box h="1px" bg="border.lightGray" opacity={0.5} />

                    <ReferralCodeSection referralInfo={referralInfo} initialReferralCode={initialReferralCode} />
                </VStack>
            </Box>
        </Box>
    );
}

const PlayerCard: React.FC<PlayerCardProps> = ({
    rank,
    points,
    stats,
    referralInfo,
    initialReferralCode,
    pointsToNext,
    nextRank,
    nextPoints,
    total = 0,
    xUsername,
    xDisplayName,
    xProfileImageUrl,
}) => {
    const account = useActiveAccount();
    const {
        isAuthenticated, isAuthenticating, requestAuthentication,
        xUsername: authXUsername, xDisplayName: authXDisplayName, xProfileImageUrl: authXProfileImageUrl, xStatusChecked,
    } = useAuth();
    const { connectX, disconnectX, isConnecting: isConnectingX, isDisconnecting: isDisconnectingX } =
        useConnectX();

    const effectiveXUsername = xStatusChecked ? authXUsername : (xUsername ?? null);
    const effectiveXDisplayName = xStatusChecked ? authXDisplayName : (xDisplayName ?? null);
    const effectiveXProfileImageUrl = xStatusChecked ? authXProfileImageUrl : (xProfileImageUrl ?? null);
    const isConnected = !!account;
    const isFullyAuthenticated = isConnected && isAuthenticated;

    const { improved, previousRank } = useRankHistory(account?.address, rank);
    const confettiFired = useRef(false);

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

    const authState: PlayerAuthState = isFullyAuthenticated
        ? 'authed'
        : isConnected
            ? 'connected-not-authed'
            : 'disconnected';

    return (
        <PlayerCardView
            authState={authState}
            address={account?.address}
            xUsername={effectiveXUsername}
            xDisplayName={effectiveXDisplayName}
            xProfileImageUrl={effectiveXProfileImageUrl}
            rank={rank}
            points={points}
            total={total}
            pointsToNext={pointsToNext}
            nextRank={nextRank}
            nextPoints={nextPoints}
            improved={improved}
            previousRank={previousRank ?? undefined}
            stats={stats}
            referralInfo={referralInfo}
            initialReferralCode={initialReferralCode}
            isAuthenticating={isAuthenticating}
            isConnectingX={isConnectingX}
            isDisconnectingX={isDisconnectingX}
            onRequestAuth={requestAuthentication}
            onConnectX={connectX}
            onDisconnectX={disconnectX}
        />
    );
};

export default PlayerCard;
