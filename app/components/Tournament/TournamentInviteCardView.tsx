'use client';

import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Icon, Button, Skeleton, Link } from '@chakra-ui/react';
import { FaCheck, FaRegCopy, FaTicketAlt } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import { useWarmSkeleton } from '@/app/components/Skeletons/useWarmSkeleton';

// Clean, brand-safe share line: no em dash, "onchain" one word, no emoji — matches the referral
// section's share string so every share surface speaks the same sentence.
const SHARE_TEXT = 'Join me on Stacked. Onchain poker on Base.';

function inviteOrigin(): string {
    return typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://stackedpoker.io';
}

export function buildInviteUrl(tournamentId: number, referralCode: string, freeSeatCode?: string): string {
    const params = new URLSearchParams();
    if (freeSeatCode) params.set('c', freeSeatCode);
    if (referralCode) params.set('ref', referralCode);
    const path = freeSeatCode ? `/tournament/${tournamentId}/free` : `/tournament/${tournamentId}`;
    const qs = params.toString();
    return qs ? `${inviteOrigin()}${path}?${qs}` : `${inviteOrigin()}${path}`;
}

export interface TournamentInviteCardViewProps {
    tournamentId: number;
    myCode: string | null;
    loading: boolean;
    freeSeats?: string[];
}

// Presentational invite/share card (Viral §4 / #355): referral-stamped tournament invites + any
// Section 3 free-seat links. Pure render — the container resolves the player's referral code.
export default function TournamentInviteCardView({
    tournamentId,
    myCode,
    loading,
    freeSeats,
}: TournamentInviteCardViewProps) {
    const { copy } = useCopyToClipboard();
    const sk = useWarmSkeleton();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = async (key: string, url: string) => {
        if (await copy(url)) {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
        }
    };

    const share = async (url: string) => {
        // Keep share() synchronous inside the click so Safari preserves the user gesture.
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({ text: SHARE_TEXT, url });
                return;
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
            }
        }
        const tweet = `https://x.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`;
        window.open(tweet, '_blank', 'noopener,noreferrer');
    };

    const seats = (freeSeats ?? []).filter(Boolean);

    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="16px"
            p={{ base: 4, md: 5 }}
        >
            <VStack spacing={3} align="stretch">
                <HStack spacing={2} align="center">
                    <Icon as={FaTicketAlt} color="brand.green" boxSize={4} aria-hidden />
                    <Text as="h3" fontWeight={700} fontSize="sm" color="text.primary">
                        Invite to this tournament
                    </Text>
                </HStack>

                {loading ? (
                    <Skeleton height="92px" borderRadius="12px" {...sk} />
                ) : !myCode ? (
                    <Text fontSize="sm" color="text.secondary">
                        Set your referral code on the{' '}
                        <Link href="/leaderboard" color="brand.green" fontWeight={600}>
                            leaderboard
                        </Link>{' '}
                        to share invites that earn you referral credit.
                    </Text>
                ) : (
                    <VStack spacing={3} align="stretch">
                        {seats.length > 0 && (
                            <VStack spacing={2} align="stretch">
                                <HStack spacing={1.5}>
                                    <Icon as={FaTicketAlt} color="text.secondary" boxSize="11px" aria-hidden />
                                    <Text fontSize="xs" color="text.secondary" fontWeight={600}>
                                        You have {seats.length} free {seats.length === 1 ? 'seat' : 'seats'} to give
                                    </Text>
                                </HStack>
                                {seats.map((c) => {
                                    const url = buildInviteUrl(tournamentId, myCode, c);
                                    const key = `free-${c}`;
                                    return (
                                        <InviteRow
                                            key={key}
                                            url={url}
                                            copied={copiedKey === key}
                                            onCopy={() => handleCopy(key, url)}
                                            onShare={() => share(url)}
                                        />
                                    );
                                })}
                            </VStack>
                        )}

                        <VStack spacing={2} align="stretch">
                            <Text fontSize="xs" color="text.secondary" fontWeight={600}>
                                {seats.length > 0
                                    ? 'Or invite anyone (they pay the buy-in)'
                                    : 'Invite anyone (they pay the buy-in)'}
                            </Text>
                            {(() => {
                                const url = buildInviteUrl(tournamentId, myCode);
                                return (
                                    <InviteRow
                                        url={url}
                                        copied={copiedKey === 'plain'}
                                        onCopy={() => handleCopy('plain', url)}
                                        onShare={() => share(url)}
                                    />
                                );
                            })()}
                        </VStack>

                        <HStack spacing={1.5} align="center" pt={0.5}>
                            <Icon as={FaCheck} color="brand.green" boxSize={2.5} aria-hidden />
                            <Text fontSize="xs" color="text.secondary">
                                You earn referral credit when they buy in and play.
                            </Text>
                        </HStack>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
}

function InviteRow({
    url,
    copied,
    onCopy,
    onShare,
}: {
    url: string;
    copied: boolean;
    onCopy: () => void;
    onShare: () => void;
}) {
    const display = url.replace(/^https?:\/\//, '');
    return (
        <HStack spacing={2} bg="bg.pillNeutral" borderRadius="10px" px={3} py={2}>
            <Text flex={1} fontFamily="mono" fontSize="xs" color="text.primary" isTruncated title={display}>
                {display}
            </Text>
            <Button
                size="xs"
                minH="44px"
                variant="tactileGhost"
                leftIcon={<Icon as={copied ? FaCheck : FaRegCopy} boxSize="11px" />}
                color={copied ? 'brand.green' : undefined}
                onClick={onCopy}
                flexShrink={0}
                _focusVisible={{ boxShadow: 'focus.ring' }}
            >
                {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
                size="xs"
                minH="44px"
                variant="tactileGhost"
                leftIcon={<Icon as={FiShare2} boxSize="12px" />}
                onClick={onShare}
                flexShrink={0}
                aria-label="Share invite"
                _focusVisible={{ boxShadow: 'focus.ring' }}
            >
                Share
            </Button>
        </HStack>
    );
}
