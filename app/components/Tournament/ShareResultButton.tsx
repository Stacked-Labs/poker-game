'use client';

import { Button, Icon } from '@chakra-ui/react';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { FiShare2 } from 'react-icons/fi';

/**
 * Shares a link through the native share sheet (mobile and some desktop browsers)
 * so the OS can route to X, Telegram, Messages, etc.; falls back to the X composer
 * where the Web Share API is unavailable. Used for tournament results (default copy)
 * and the bring-a-friend invite (label="Invite a friend", variant="tactilePrimary").
 * The link unfurls into the matching OG card.
 */
export default function ShareResultButton({
    shareText,
    shareUrl,
    variant = 'tactileNeutral',
    label = 'Share result',
    idleIcon = FiShare2,
}: {
    shareText: string;
    shareUrl: string;
    variant?: string;
    label?: string;
    idleIcon?: IconType;
}) {
    const [sharing, setSharing] = useState(false);

    const openComposer = () => {
        const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
            shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShare = async () => {
        // Call share() synchronously inside the click so the user gesture is
        // preserved (Safari blocks it otherwise).
        if (
            typeof navigator !== 'undefined' &&
            typeof navigator.share === 'function'
        ) {
            setSharing(true);
            try {
                await navigator.share({ text: shareText, url: shareUrl });
            } catch (err) {
                // Dismissing the sheet throws AbortError — leave it be. Any other
                // failure falls back to the composer.
                if (!(err instanceof Error) || err.name !== 'AbortError') {
                    openComposer();
                }
            } finally {
                setSharing(false);
            }
            return;
        }
        openComposer();
    };

    return (
        <Button
            variant={variant}
            size="sm"
            w="full"
            minH="42px"
            leftIcon={<Icon as={idleIcon} boxSize="14px" />}
            isLoading={sharing}
            loadingText="Sharing…"
            onClick={handleShare}
        >
            {label}
        </Button>
    );
}
