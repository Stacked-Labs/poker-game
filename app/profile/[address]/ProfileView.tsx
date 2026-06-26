'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Flex,
    HStack,
    VStack,
    Text,
    Heading,
    Image,
    SimpleGrid,
    Badge,
    Divider,
    Spinner,
    Link,
    Icon,
} from '@chakra-ui/react';
import { blo } from 'blo';
import { useActiveAccount } from 'thirdweb/react';
import { FiExternalLink } from 'react-icons/fi';
import {
    getPlayerProfile,
    type PlayerProfile,
} from '@/app/hooks/server_actions';
import { playerDisplayName, shortenAddress } from '@/app/utils/address';
import { TIER_EMOJI } from '@/app/components/Leaderboard/tierUtils';
import ReferralCodeSection from '@/app/components/Leaderboard/ReferralCodeSection';
import ProfileShareButton from './ProfileShareButton';

function usdc(base: number): string {
    return (base / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function StatCell({ label, value }: { label: string; value: string | number }) {
    return (
        <VStack spacing={0} align="start">
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={800} color="text.primary">
                {value}
            </Text>
            <Text fontSize="xs" color="text.secondary">
                {label}
            </Text>
        </VStack>
    );
}

export default function ProfileView({ address }: { address: string }) {
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const account = useActiveAccount();

    useEffect(() => {
        let active = true;
        setLoading(true);
        getPlayerProfile(address)
            .then((p) => active && setProfile(p))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [address]);

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="60vh">
                <Spinner size="lg" color="brand.green" />
            </Flex>
        );
    }

    if (!profile) {
        return (
            <Container maxW="container.md" py={16}>
                <VStack spacing={3}>
                    <Heading size="md" color="text.primary">
                        Player not found
                    </Heading>
                    <Text color="text.secondary" fontFamily="mono">
                        {shortenAddress(address)}
                    </Text>
                </VStack>
            </Container>
        );
    }

    const { identity, stats, host_earnings, recent } = profile;
    const name = playerDisplayName(
        identity.x_username ? `@${identity.x_username}` : null,
        profile.address,
        identity.x_display_name
    );
    const avatar =
        identity.avatar_url || blo(profile.address as `0x${string}`);
    const tierEmoji = TIER_EMOJI[profile.tier.toLowerCase()] ?? '';
    const isOwn =
        !!account?.address &&
        account.address.toLowerCase() === profile.address.toLowerCase();

    return (
        <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
            {/* Identity header */}
            <Flex
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'start', sm: 'center' }}
                gap={4}
                mb={6}
            >
                <Image
                    src={avatar}
                    alt={name}
                    boxSize={{ base: '72px', md: '88px' }}
                    borderRadius="full"
                    border="2px solid"
                    borderColor="whiteAlpha.300"
                />
                <VStack align="start" spacing={1} flex={1} minW={0}>
                    <Heading size="lg" color="text.primary" noOfLines={1}>
                        {name}
                    </Heading>
                    <HStack spacing={2} color="text.secondary" fontSize="sm" flexWrap="wrap">
                        {identity.x_username && (
                            <Link href={`https://x.com/${identity.x_username}`} isExternal>
                                @{identity.x_username}
                            </Link>
                        )}
                        <Text fontFamily="mono">{shortenAddress(profile.address)}</Text>
                    </HStack>
                    <HStack spacing={2} pt={1}>
                        <Badge colorScheme="purple" fontSize="xs">
                            {tierEmoji} {profile.tier}
                        </Badge>
                        {profile.rank > 0 && (
                            <Badge fontSize="xs">Rank #{profile.rank}</Badge>
                        )}
                    </HStack>
                </VStack>
                <ProfileShareButton address={profile.address} name={name} />
            </Flex>

            {/* HERO — Earned from Hosting (the marketing centerpiece) */}
            <Box
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                mb={6}
                bgGradient="linear(to-br, brand.green, brand.darkNavy)"
                color="white"
            >
                <Text fontSize="xs" letterSpacing="widest" opacity={0.8} mb={1}>
                    EARNED FROM HOSTING
                </Text>
                <Heading size="2xl" lineHeight={1}>
                    {host_earnings.available ? `$${usdc(host_earnings.usdc)}` : '—'}
                    <Text as="span" fontSize="md" fontWeight={500} ml={2} opacity={0.85}>
                        in platform fees
                    </Text>
                </Heading>
                <Text mt={2} fontSize="sm" opacity={0.9}>
                    {stats.tables_hosted} tables hosted · {stats.tournaments_hosted}{' '}
                    tournaments run
                </Text>
                <Text mt={1} fontSize="sm" opacity={0.75}>
                    Hosts earn ~1% of every pot they run.
                </Text>
                {!host_earnings.available && (
                    <Text mt={2} fontSize="xs" opacity={0.6}>
                        Host earnings total is being wired up.
                    </Text>
                )}
            </Box>

            {/* Stats grid (status only — no $) */}
            <Box
                bg="card.white"
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                mb={6}
                boxShadow="0 14px 28px rgba(12,21,49,0.08)"
                _dark={{ boxShadow: '0 16px 30px rgba(0,0,0,0.35)' }}
            >
                <Text fontSize="xs" letterSpacing="widest" color="text.secondary" mb={4}>
                    STATS
                </Text>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacingY={5} spacingX={4}>
                    <StatCell label="Hands" value={stats.hands_played.toLocaleString()} />
                    <StatCell label="Tournaments" value={stats.tournaments_entered} />
                    <StatCell label="Won" value={stats.tournaments_won} />
                    <StatCell label="Final tables" value={stats.final_tables} />
                    <StatCell
                        label="Best finish"
                        value={stats.best_finish > 0 ? ordinal(stats.best_finish) : '—'}
                    />
                    <StatCell label="Tables hosted" value={stats.tables_hosted} />
                    <StatCell label="Referrals" value={profile.referrals_count} />
                    <StatCell label="Points" value={profile.points.toLocaleString()} />
                </SimpleGrid>
            </Box>

            {/* Recent activity */}
            {(recent.results.length > 0 || recent.hosted.length > 0) && (
                <Box
                    bg="card.white"
                    borderRadius="2xl"
                    p={{ base: 5, md: 6 }}
                    mb={6}
                    boxShadow="0 14px 28px rgba(12,21,49,0.08)"
                    _dark={{ boxShadow: '0 16px 30px rgba(0,0,0,0.35)' }}
                >
                    <Text fontSize="xs" letterSpacing="widest" color="text.secondary" mb={4}>
                        RECENT
                    </Text>
                    <VStack align="stretch" spacing={3} divider={<Divider />}>
                        {recent.results.map((r) => (
                            <HStack key={`r-${r.tournament_id}`} justify="space-between">
                                <HStack spacing={3} minW={0}>
                                    <Text fontSize="lg">
                                        {r.finish_position === 1
                                            ? '🥇'
                                            : r.finish_position <= 3
                                              ? '🏅'
                                              : '🎯'}
                                    </Text>
                                    <Text color="text.primary" noOfLines={1}>
                                        {r.name}
                                    </Text>
                                </HStack>
                                <Text color="text.secondary" fontSize="sm" whiteSpace="nowrap">
                                    {ordinal(r.finish_position)}
                                </Text>
                            </HStack>
                        ))}
                        {recent.hosted.map((h) => (
                            <HStack key={`h-${h.tournament_id}`} justify="space-between">
                                <HStack spacing={3} minW={0}>
                                    <Text fontSize="lg">🎟</Text>
                                    <Text color="text.primary" noOfLines={1}>
                                        Hosted · {h.name}
                                    </Text>
                                </HStack>
                                <Text color="text.secondary" fontSize="sm" whiteSpace="nowrap">
                                    {h.entrants} entrants
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            )}

            {/* Own profile: the referral module (reuses the leaderboard component) */}
            {isOwn && (
                <Box mb={6}>
                    <ReferralCodeSection />
                </Box>
            )}

            <Flex justify="center" pt={2}>
                <Link
                    href="/leaderboard"
                    color="text.secondary"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                >
                    View the leaderboard <Icon as={FiExternalLink} boxSize={3} />
                </Link>
            </Flex>
        </Container>
    );
}
