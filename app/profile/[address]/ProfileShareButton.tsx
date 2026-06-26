'use client';

import { useState } from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FiCheck, FiShare2 } from 'react-icons/fi';
import useToastHelper from '@/app/hooks/useToastHelper';

// Minimal "Share my profile" action (#345): copies the public profile link. The richer
// share surface (X / Telegram + the OG card unfurl) is layered on in #347.
export default function ProfileShareButton({
    address,
}: {
    address: string;
    name?: string;
}) {
    const [copied, setCopied] = useState(false);
    const { success } = useToastHelper();

    const onShare = async () => {
        const url =
            typeof window !== 'undefined'
                ? `${window.location.origin}/profile/${address}`
                : `/profile/${address}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            success('Profile link copied', '');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable — no-op; the URL is visible in the address bar.
        }
    };

    return (
        <Button
            size="sm"
            variant="outline"
            leftIcon={<Icon as={copied ? FiCheck : FiShare2} />}
            onClick={onShare}
            flexShrink={0}
        >
            {copied ? 'Copied' : 'Share'}
        </Button>
    );
}
