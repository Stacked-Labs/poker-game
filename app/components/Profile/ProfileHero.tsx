'use client';

import { type ReactNode } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from '@chakra-ui/react';
import { blo } from 'blo';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { GiTwoCoins } from 'react-icons/gi';
import { USDC_LOGO } from '../PublicGames/types';
import PlayerNameLink from '../PlayerNameLink';
import TooltipOrPopover from '../TooltipOrPopover';
import { SocialIconButton } from '../SocialIconButton';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import { shortenAddress } from '@/app/utils/address';
import { formatUsdcMicro } from '@/app/utils/usdc';
import type { TierInfo } from '../Leaderboard/tierUtils';

// Host earnings, the page's single money moment. Counts (tables/tournaments hosted) live in
// HostingScorecard, so this never restates a figure.
export interface HostLedger {
    usdc: number;
    available: boolean;
    hasActivity: boolean;
}

export interface ProfileHeroProps {
    name: string;
    tier: TierInfo;
    rank: number; // 0 = unranked
    points: number;
    avatarUrl: string;
    hasAvatar: boolean;
    xUsername?: string | null;
    address: string;
    host: HostLedger;
    /** Share control — top-right desktop, full-width below on mobile. */
    shareSlot?: ReactNode;
    /** Own-hub rank ladder, rendered under identity. Absent => public (shows a points pill). */
    rankLadderSlot?: ReactNode;
    /** Own-hub, unlinked-X: shows a compact "Link X" CTA inline by the address. */
    linkX?: { onConnect: () => void; isConnecting?: boolean } | null;
    /** Play-record stat strip, rendered as a divided row at the foot of the hero card. */
    statsSlot?: ReactNode;
}

function HostBlock({ host }: { host: HostLedger }) {
    if (!host.hasActivity) return null;

    return (
        <VStack align={{ base: 'start', md: 'end' }} spacing={1.5} maxW="full">
            <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="0.04em"
                textTransform="uppercase"
                color="text.muted"
            >
                Hosting
            </Text>
            {host.available ? (
                <>
                    <HStack spacing={2} align="center">
                        <Image src={USDC_LOGO} alt="" boxSize={{ base: '24px', md: '28px' }} flexShrink={0} />
                        <TooltipOrPopover
                            label="Hosts earn 25% of the platform fee on real-money tables they create."
                            aria-label="About host earnings"
                        >
                            <Text
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight={800}
                                lineHeight={1}
                                color="text.usdc"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                ${formatUsdcMicro(host.usdc)}
                            </Text>
                        </TooltipOrPopover>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary">
                        Hosts earn 25% of the platform fee.
                    </Text>
                </>
            ) : (
                <Text fontSize="sm" color="text.secondary" maxW="220px">
                    Earnings will show here soon.
                </Text>
            )}
        </VStack>
    );
}

export default function ProfileHero({
    name,
    tier,
    rank,
    points,
    avatarUrl,
    hasAvatar,
    xUsername,
    address,
    host,
    shareSlot,
    rankLadderSlot,
    linkX,
    statsSlot,
}: ProfileHeroProps) {
    const { copy, copied } = useCopyToClipboard();
    const isRanked = rank > 0;
    const avatarRadius = hasAvatar ? 'full' : '12px';

    const copyAddress = () => void copy(address);

    return (
        <Box
            bg="card.white"
            borderRadius="24px"
            border="1px solid"
            borderColor="border.felt"
            boxShadow="card.lift"
            p={{ base: 5, md: 6 }}
            position="relative"
            overflow="hidden"
        >
            {/* Penthouse signature. */}
            <Text
                aria-hidden
                position="absolute"
                bottom="8px"
                right="14px"
                fontSize="7xl"
                lineHeight={1}
                color="text.primary"
                opacity={0.03}
                _dark={{ opacity: 0.05 }}
                transform="rotate(-12deg)"
                userSelect="none"
                pointerEvents="none"
            >
                ♠
            </Text>

            <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'stretch', md: 'flex-start' }}
                gap={{ base: 5, md: 8 }}
                position="relative"
                zIndex={1}
            >
                {/* Door — identity + (own) rank ladder */}
                <VStack align="stretch" spacing={4} flex={{ md: 1 }} minW={0}>
                    <HStack spacing={{ base: 4, md: 5 }} align="center">
                        <Box position="relative" flexShrink={0}>
                            {isRanked && (
                                <Box
                                    position="absolute"
                                    inset="-3px"
                                    borderRadius={avatarRadius}
                                    border="2px solid"
                                    borderColor={tier.token}
                                    opacity={0.5}
                                    _dark={{ opacity: 0.35 }}
                                    pointerEvents="none"
                                />
                            )}
                            <Image
                                src={avatarUrl}
                                fallbackSrc={blo(address as `0x${string}`)}
                                alt={name}
                                boxSize={{ base: '72px', md: '88px' }}
                                borderRadius={avatarRadius}
                                objectFit="cover"
                            />
                        </Box>

                        <VStack align="start" spacing={1.5} minW={0}>
                            <Heading as="h1" size="lg" color="text.primary" noOfLines={1} letterSpacing="-0.02em">
                                {name}
                            </Heading>
                            <Flex flexWrap="wrap" align="center" columnGap={2} rowGap={1}>
                                {/* Tier + rank pill (with explainer) */}
                                <TooltipOrPopover
                                    label={
                                        isRanked
                                            ? `${tier.label} tier — the top band of ranked players. Climb by earning points.`
                                            : 'Unranked — earn points by playing, hosting, quests and referrals to get on the board.'
                                    }
                                    aria-label="About tiers"
                                >
                                    <HStack
                                        bg="bg.pillNeutral"
                                        border="1px solid"
                                        borderColor="border.pillNeutral"
                                        borderRadius="full"
                                        px={2.5}
                                        py={1}
                                        spacing={1.5}
                                    >
                                        {isRanked && (
                                            <Icon as={tier.icon} color={tier.token} boxSize="13px" aria-hidden />
                                        )}
                                        <Text fontSize="xs" fontWeight={700} color="text.secondary">
                                            {isRanked ? `${tier.label} · Rank #${rank}` : 'Unranked'}
                                        </Text>
                                    </HStack>
                                </TooltipOrPopover>

                                {/* Points pill — public only (own shows points in the rank ladder). */}
                                {!rankLadderSlot && isRanked && (
                                    <HStack
                                        bg="bg.greenTint"
                                        borderRadius="full"
                                        px={2.5}
                                        py={1}
                                        spacing={1.5}
                                    >
                                        <Icon as={GiTwoCoins} color="brand.green" boxSize="12px" aria-hidden />
                                        <Text
                                            fontSize="xs"
                                            fontWeight={700}
                                            color="brand.green"
                                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {points.toLocaleString()} pts
                                        </Text>
                                    </HStack>
                                )}

                                {xUsername && (
                                    <PlayerNameLink username={`@${xUsername}`} address={address} fontSize="sm" color="text.secondary" />
                                )}

                                {/* Copy-address button (was a static label). */}
                                <Button
                                    onClick={copyAddress}
                                    aria-label={copied ? 'Address copied' : 'Copy address'}
                                    variant="tactileGhost"
                                    h="26px"
                                    px={2}
                                    fontFamily="mono"
                                    fontSize="xs"
                                    fontWeight={500}
                                    color={copied ? 'brand.green' : 'text.muted'}
                                    rightIcon={<Icon as={copied ? FiCheck : FiCopy} boxSize="11px" />}
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                >
                                    {shortenAddress(address)}
                                </Button>

                                {/* Own + unlinked X: a compact CTA inline, instead of a full-width strip. */}
                                {!xUsername && linkX && (
                                    <SocialIconButton
                                        tone="x"
                                        chipSize="sm"
                                        label={linkX.isConnecting ? 'Linking…' : 'Link X'}
                                        onClick={linkX.onConnect}
                                        isDisabled={linkX.isConnecting}
                                        aria-label="Link your X account"
                                    />
                                )}
                            </Flex>
                        </VStack>
                    </HStack>

                    {rankLadderSlot}
                </VStack>

                {/* Right — share (desktop top) + earnings. Order flips on mobile. */}
                <Flex
                    direction="column"
                    align={{ base: 'stretch', md: 'flex-end' }}
                    gap={4}
                    w={{ base: 'full', md: 'auto' }}
                    flexShrink={0}
                >
                    {shareSlot && (
                        <Box order={{ base: 2, md: 0 }} alignSelf={{ base: 'stretch', md: 'flex-end' }}>
                            {shareSlot}
                        </Box>
                    )}
                    <Box order={{ base: 1, md: 1 }}>
                        <HostBlock host={host} />
                    </Box>
                </Flex>
            </Flex>

            {statsSlot && (
                <Box
                    mt={{ base: 5, md: 6 }}
                    pt={{ base: 5, md: 6 }}
                    borderTop="1px solid"
                    borderColor="border.lightGray"
                    position="relative"
                    zIndex={1}
                >
                    {statsSlot}
                </Box>
            )}
        </Box>
    );
}
