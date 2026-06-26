'use client';

import {
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Link,
} from '@chakra-ui/react';
import { FiShare2, FiCopy, FiChevronDown } from 'react-icons/fi';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import useToastHelper from '@/app/hooks/useToastHelper';

// "Share my profile" (#347): copy link / X / Telegram. The shared link unfurls the per-profile
// OG card (/api/og/profile) via the page's OpenGraph tags.
export default function ProfileShareButton({
    address,
    name,
}: {
    address: string;
    name?: string;
}) {
    const { success } = useToastHelper();

    const url =
        typeof window !== 'undefined'
            ? `${window.location.origin}/profile/${address}`
            : `https://stackedpoker.io/profile/${address}`;
    const text = name
        ? `Check out ${name} on Stacked Poker`
        : 'Check out my Stacked Poker profile';
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            success('Profile link copied', '');
        } catch {
            // Clipboard unavailable — the URL is visible in the address bar.
        }
    };

    return (
        <Menu placement="bottom-end">
            <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FiShare2} />}
                rightIcon={<Icon as={FiChevronDown} />}
                flexShrink={0}
            >
                Share
            </MenuButton>
            <MenuList>
                <MenuItem icon={<Icon as={FiCopy} />} onClick={copy}>
                    Copy link
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
