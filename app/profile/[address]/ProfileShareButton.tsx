'use client';

import {
    Button,
    type ButtonProps,
    Icon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Link,
} from '@chakra-ui/react';
import { FiShare2, FiCopy, FiCheck, FiChevronDown } from 'react-icons/fi';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';

const X_HANDLE = 'stacked_poker';

function tierCase(tier?: string): string {
    if (!tier) return '';
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
}

// Concrete, player-to-player share copy that harvests rank/tier — never generic filler.
function shareText({
    name,
    tier,
    rank,
    isOwn,
}: {
    name?: string;
    tier?: string;
    rank?: number;
    isOwn?: boolean;
}): string {
    const t = tierCase(tier);
    const ranked = rank && rank > 0;
    if (isOwn) {
        return ranked && t
            ? `I'm ${t}, rank #${rank} on Stacked. Your table, your money.`
            : 'My profile on Stacked. Your table, your money.';
    }
    if (name) {
        return ranked && t
            ? `${name} is ${t}, rank #${rank} on Stacked.`
            : `${name} on Stacked.`;
    }
    return 'A profile on Stacked. Your table, your money.';
}

// "Share my profile" (#347): copy link / X / Telegram. The shared link unfurls the per-profile
// OG card (/api/og/profile) via the page's OpenGraph tags.
export default function ProfileShareButton({
    address,
    name,
    tier,
    rank,
    isOwn,
    width,
}: {
    address: string;
    name?: string;
    tier?: string;
    rank?: number;
    isOwn?: boolean;
    width?: ButtonProps['width'];
}) {
    const { copy, copied } = useCopyToClipboard();

    const url =
        typeof window !== 'undefined'
            ? `${window.location.origin}/profile/${address}`
            : `https://stackedpoker.io/profile/${address}`;
    const text = shareText({ name, tier, rank, isOwn });
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=${X_HANDLE}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    const copyLink = () => void copy(url);

    return (
        <Menu placement="bottom-end">
            <MenuButton
                as={Button}
                variant="tactileNeutral"
                size="sm"
                minH={{ base: '44px', md: '36px' }}
                width={width}
                leftIcon={<Icon as={FiShare2} />}
                rightIcon={<Icon as={FiChevronDown} />}
                _focusVisible={{ boxShadow: 'focus.ring' }}
                flexShrink={0}
            >
                Share
            </MenuButton>
            <MenuList>
                <MenuItem
                    icon={<Icon as={copied ? FiCheck : FiCopy} color={copied ? 'brand.green' : undefined} />}
                    onClick={copyLink}
                    closeOnSelect={false}
                >
                    {copied ? 'Copied' : 'Copy link'}
                </MenuItem>
                <MenuItem
                    as={Link}
                    href={tweetUrl}
                    isExternal
                    icon={<Icon as={FaXTwitter} />}
                    _hover={{ textDecoration: 'none' }}
                >
                    Share on X
                </MenuItem>
                <MenuItem
                    as={Link}
                    href={telegramUrl}
                    isExternal
                    icon={<Icon as={FaTelegram} />}
                    _hover={{ textDecoration: 'none' }}
                >
                    Share on Telegram
                </MenuItem>
            </MenuList>
        </Menu>
    );
}
