'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import {
    issueFriendCodes,
    type FriendCodesResponse,
} from '@/app/hooks/server_actions';
import FriendInvite from './FriendInvite';

// Bring-a-Friend share surface (§3.3) — data container. Mints (idempotently) the
// signed-in entrant's invite codes, then hands the next unused link to the pure
// FriendInvite card. Self-hides when the event has no free tickets, the player
// isn't signed in, or no codes were issued.
export default function FriendInviteSection({
    tournamentId,
}: {
    tournamentId: number;
}) {
    const { isAuthenticated } = useAuth();
    const { copy, copied } = useCopyToClipboard();
    const [data, setData] = useState<FriendCodesResponse | null>(null);
    const [loading, setLoading] = useState(true);

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
    const nextCode = data.codes.find((c) => !c.claimed) ?? data.codes[0];
    const shareUrl = nextCode
        ? nextCode.share_url || `${origin}${nextCode.claim_path}`
        : origin;
    const shareText =
        'I saved you a seat on Stacked. Your first entry’s on me.';
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

    const onCopy = () => void copy(shareUrl);

    return (
        <FriendInvite
            joined={data.joined}
            issued={data.issued}
            shareText={shareText}
            shareUrl={shareUrl}
            tweetUrl={tweetUrl}
            telegramUrl={telegramUrl}
            copied={copied}
            onCopy={onCopy}
        />
    );
}
