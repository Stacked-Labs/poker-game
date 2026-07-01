'use client';

import {
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FiCheck, FiLink, FiShare2 } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';

/**
 * Platform-aware share for tournament results + the bring-a-friend invite.
 *
 * Mobile / Safari (where `navigator.share` exists): one tap opens the OS share
 * sheet so the player can route to X, Telegram, Messages, IG, etc. — falling
 * back to the X composer only if the sheet errors.
 *
 * Desktop (no `navigator.share`): instead of silently opening an X tab (which
 * read as "the button does nothing"), we show an explicit menu — Post to X, or
 * Copy link with inline confirmation. The link unfurls into the matching OG card.
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
    // Feature-detect after mount so SSR + first client render agree (both render
    // the desktop menu), then swap to the native button where the sheet exists.
    const [canNativeShare, setCanNativeShare] = useState(false);
    const { copy, copied } = useCopyToClipboard();

    useEffect(() => {
        setCanNativeShare(
            typeof navigator !== 'undefined' &&
                typeof navigator.share === 'function'
        );
    }, []);

    const openComposer = () => {
        const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
            shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    };

    const handleNativeShare = async () => {
        // Call share() synchronously inside the click so the user gesture is
        // preserved (Safari blocks it otherwise).
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
    };

    if (canNativeShare) {
        return (
            <Button
                variant={variant}
                size="sm"
                w="full"
                minH="42px"
                leftIcon={<Icon as={idleIcon} boxSize="14px" />}
                isLoading={sharing}
                loadingText="Sharing…"
                onClick={handleNativeShare}
            >
                {label}
            </Button>
        );
    }

    return (
        <Menu placement="top" gutter={6} autoSelect={false}>
            <MenuButton
                as={Button}
                variant={variant}
                size="sm"
                w="full"
                minH="42px"
                leftIcon={<Icon as={idleIcon} boxSize="14px" />}
            >
                {label}
            </MenuButton>
            <MenuList minW="220px" zIndex={2100}>
                <MenuItem
                    icon={<Icon as={FaXTwitter} boxSize="14px" />}
                    onClick={openComposer}
                >
                    Post to X
                </MenuItem>
                <MenuItem
                    icon={
                        <Icon
                            as={copied ? FiCheck : FiLink}
                            boxSize="14px"
                            color={copied ? 'brand.green' : undefined}
                        />
                    }
                    closeOnSelect={false}
                    onClick={() => copy(shareUrl)}
                >
                    {copied ? 'Link copied' : 'Copy link'}
                </MenuItem>
            </MenuList>
        </Menu>
    );
}
