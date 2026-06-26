'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Icon,
    Button,
    Skeleton,
    Link,
} from '@chakra-ui/react';
import { FaCheck, FaRegCopy, FaTicketAlt } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { getReferralInfo } from '@/app/hooks/server_actions';

// Tournament invite & share surface (Viral §4 / #355). Player-shared invites to a tournament,
// stamped with the sharer's permanent referral code (`ref=`). When the invited friend takes their
// first real-money action, the sharer earns referral credit — status only, never a cash reward.
// Free-seat links (the Section 3 bring-a-friend codes, #336) are referral-stamped too: pass them in
// via `freeSeatCodes` and they compose here. The plain paid-entry link always works.

interface TournamentInviteCardProps {
    tournamentId: number;
    // Optional Section 3 bring-a-friend free-seat codes the player still has to give (#336). When
    // present, each renders a referral-stamped free-seat link; absent, only the plain invite shows.
    freeSeatCodes?: string[];
}

function inviteOrigin(): string {
    return typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://stackedpoker.io';
}

function buildInviteUrl(tournamentId: number, referralCode: string, freeSeatCode?: string): string {
    const params = new URLSearchParams();
    if (freeSeatCode) params.set('c', freeSeatCode);
    if (referralCode) params.set('ref', referralCode);
    const path = freeSeatCode
        ? `/tournament/${tournamentId}/free`
        : `/tournament/${tournamentId}`;
    const qs = params.toString();
    return qs ? `${inviteOrigin()}${path}?${qs}` : `${inviteOrigin()}${path}`;
}

const SHARE_TEXT = 'Join me on Stacked — on-chain poker on Base. 🎟';

const TournamentInviteCard: React.FC<TournamentInviteCardProps> = ({
    tournamentId,
    freeSeatCodes,
}) => {
    const account = useActiveAccount();
    const toast = useToastHelper();
    const [loading, setLoading] = useState(false);
    const [myCode, setMyCode] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!account?.address) {
            setMyCode(null);
            return;
        }
        setLoading(true);
        getReferralInfo(account.address)
            .then((info) => {
                if (!cancelled) setMyCode(info.myCode ?? null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [account?.address]);

    const copy = async (key: string, url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
        } catch {
            toast.error('Could not copy', 'Failed to copy your invite link.');
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
        const tweet = `https://x.com/intent/tweet?text=${encodeURIComponent(
            SHARE_TEXT
        )}&url=${encodeURIComponent(url)}`;
        window.open(tweet, '_blank', 'noopener,noreferrer');
    };

    // Nothing to stamp without a connected wallet — the card is referrer-only.
    if (!account?.address) return null;

    const freeSeats = (freeSeatCodes ?? []).filter(Boolean);

    return (
        <Box
            borderWidth="1.5px"
            borderColor="border.lightGray"
            _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack spacing={3} align="stretch">
                <HStack spacing={2} align="center">
                    <Icon as={FaTicketAlt} color="brand.green" boxSize={4} />
                    <Text fontWeight={700} fontSize="sm" color="text.primary">
                        Invite to this tournament
                    </Text>
                </HStack>

                {loading ? (
                    <Skeleton height="92px" borderRadius="12px" />
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
                        {freeSeats.length > 0 && (
                            <VStack spacing={2} align="stretch">
                                <Text fontSize="xs" color="text.secondary" fontWeight={600}>
                                    🎟 You have {freeSeats.length} free{' '}
                                    {freeSeats.length === 1 ? 'seat' : 'seats'} to give:
                                </Text>
                                {freeSeats.map((c) => {
                                    const url = buildInviteUrl(tournamentId, myCode, c);
                                    const key = `free-${c}`;
                                    return (
                                        <InviteRow
                                            key={key}
                                            url={url}
                                            copied={copiedKey === key}
                                            onCopy={() => copy(key, url)}
                                            onShare={() => share(url)}
                                        />
                                    );
                                })}
                            </VStack>
                        )}

                        <VStack spacing={2} align="stretch">
                            <Text fontSize="xs" color="text.secondary" fontWeight={600}>
                                {freeSeats.length > 0
                                    ? 'Or invite anyone (they pay the buy-in):'
                                    : 'Invite anyone (they pay the buy-in):'}
                            </Text>
                            {(() => {
                                const url = buildInviteUrl(tournamentId, myCode);
                                return (
                                    <InviteRow
                                        url={url}
                                        copied={copiedKey === 'plain'}
                                        onCopy={() => copy('plain', url)}
                                        onShare={() => share(url)}
                                    />
                                );
                            })()}
                        </VStack>

                        <HStack spacing={1.5} align="center" pt={0.5}>
                            <Icon as={FaCheck} color="brand.green" boxSize={2.5} />
                            <Text fontSize="xs" color="text.secondary">
                                You earn referral credit when they buy in &amp; play.
                            </Text>
                        </HStack>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};

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
        <HStack
            spacing={2}
            borderWidth="1px"
            borderColor="border.lightGray"
            _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
            borderRadius="10px"
            px={3}
            py={2}
        >
            <Text
                flex={1}
                fontFamily="mono"
                fontSize="xs"
                color="text.primary"
                isTruncated
                title={display}
            >
                {display}
            </Text>
            <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={copied ? FaCheck : FaRegCopy} boxSize="11px" />}
                color={copied ? 'brand.green' : 'text.secondary'}
                onClick={onCopy}
                flexShrink={0}
            >
                {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
                size="xs"
                variant="ghost"
                color="text.secondary"
                leftIcon={<Icon as={FiShare2} boxSize="12px" />}
                onClick={onShare}
                flexShrink={0}
                aria-label="Share invite"
            >
                Share
            </Button>
        </HStack>
    );
}

export default TournamentInviteCard;
