'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    VStack,
    Text,
    Progress,
    Icon,
    Link,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { FiCopy, FiCheck, FiShare2 } from 'react-icons/fi';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import { useAuth } from '@/app/contexts/AuthContext';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    issueFriendCodes,
    type FriendCodesResponse,
} from '@/app/hooks/server_actions';

// Bring-a-Friend share surface (§3.3). For a registered entrant: mints (idempotently) their
// invite codes, shows "X of N friends joined" recognition, and shares the next unused invite
// link via copy / native / X / Telegram. Recognition only — no money surface.
export default function FriendInviteSection({
    tournamentId,
}: {
    tournamentId: number;
}) {
    const { isAuthenticated } = useAuth();
    const { success } = useToastHelper();
    const [data, setData] = useState<FriendCodesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        let active = true;
        issueFriendCodes(tournamentId)
            .then((d) => active && setData(d))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [tournamentId, isAuthenticated]);

    if (loading || !data || !data.enabled || data.issued === 0) return null;

    const origin =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://stackedpoker.io';
    const linkFor = (claimPath: string, shareUrl?: string) =>
        shareUrl || `${origin}${claimPath}`;

    const nextCode = data.codes.find((c) => !c.claimed) ?? data.codes[0];
    const shareUrl = nextCode
        ? linkFor(nextCode.claim_path, nextCode.share_url)
        : origin;
    const allUsed = data.joined >= data.issued;
    const text = 'I’ve got a free seat for you on Stacked Poker 🎟';

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            success('Invite link copied', '');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable.
        }
    };

    const nativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: 'Stacked Poker', text, url: shareUrl });
            } catch {
                // user cancelled
            }
        } else {
            copy();
        }
    };

    return (
        <Box
            bg="card.white"
            borderRadius="2xl"
            p={{ base: 5, md: 6 }}
            boxShadow="0 14px 28px rgba(12,21,49,0.08)"
            _dark={{ boxShadow: '0 16px 30px rgba(0,0,0,0.35)' }}
        >
            <VStack align="stretch" spacing={4}>
                <VStack align="start" spacing={1}>
                    <Text fontWeight={800} color="text.primary">
                        Bring a friend
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                        Each invite is a free seat at this event. {data.joined} of{' '}
                        {data.issued} friends joined.
                    </Text>
                </VStack>

                <Progress
                    value={data.issued > 0 ? (data.joined / data.issued) * 100 : 0}
                    colorScheme="green"
                    borderRadius="full"
                    size="sm"
                />

                {allUsed ? (
                    <Text fontSize="sm" color="brand.green" fontWeight={600}>
                        🎉 All {data.issued} invites used — nice work.
                    </Text>
                ) : (
                    <Wrap spacing={2}>
                        <WrapItem>
                            <Button
                                size="sm"
                                colorScheme="green"
                                leftIcon={<Icon as={copied ? FiCheck : FiShare2} />}
                                onClick={nativeShare}
                            >
                                Invite a friend
                            </Button>
                        </WrapItem>
                        <WrapItem>
                            <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<Icon as={copied ? FiCheck : FiCopy} />}
                                onClick={copy}
                            >
                                {copied ? 'Copied' : 'Copy link'}
                            </Button>
                        </WrapItem>
                        <WrapItem>
                            <Button
                                as={Link}
                                href={tweetUrl}
                                isExternal
                                size="sm"
                                variant="outline"
                                leftIcon={<Icon as={FaXTwitter} />}
                                _hover={{ textDecoration: 'none' }}
                            >
                                X
                            </Button>
                        </WrapItem>
                        <WrapItem>
                            <Button
                                as={Link}
                                href={telegramUrl}
                                isExternal
                                size="sm"
                                variant="outline"
                                leftIcon={<Icon as={FaTelegram} />}
                                _hover={{ textDecoration: 'none' }}
                            >
                                Telegram
                            </Button>
                        </WrapItem>
                    </Wrap>
                )}
            </VStack>
        </Box>
    );
}
