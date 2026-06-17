'use client';

import { Box, Flex, Text, type ResponsiveValue } from '@chakra-ui/react';
import { blo } from 'blo';
import React, { useEffect, useMemo, useState } from 'react';
import { getColorForUsername } from '@/app/utils/chatColors';

type PlayerAvatarProps = {
    profileImageUrl?: string | null;
    address?: string | null;
    username: string;
    /**
     * Font size for the initials fallback. Scale to the parent avatar
     * dimensions (e.g. ~40% of avatar height).
     */
    initialsFontSize?: ResponsiveValue<string>;
    initialsSx?: Record<string, unknown>;
};

const computeInitials = (username: string): string => {
    const stripped = username.replace(/^@/, '');
    const parts = stripped
        .split(/[\s._-]+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
    return parts || stripped.slice(0, 2).toUpperCase();
};

function PlayerAvatar({
    profileImageUrl,
    address,
    username,
    initialsFontSize = { base: '14px', md: '18px' },
    initialsSx,
}: PlayerAvatarProps) {
    const [imgFailed, setImgFailed] = useState(false);
    useEffect(() => {
        setImgFailed(false);
    }, [profileImageUrl]);

    // blo() hashes the address into a deterministic data-URI blockie; memoize so a
    // re-render (e.g. a leaderboard tick) doesn't re-derive the same image.
    const blockie = useMemo(
        () => (address ? blo(address as `0x${string}`) : null),
        [address]
    );

    const showImage = Boolean(profileImageUrl) && !imgFailed;

    if (showImage) {
        return (
            <Box
                as="img"
                src={profileImageUrl as string}
                alt=""
                width="100%"
                height="100%"
                borderRadius="full"
                objectFit="cover"
                onError={() => setImgFailed(true)}
            />
        );
    }

    if (blockie) {
        return (
            <Box
                as="img"
                src={blockie}
                alt=""
                width="100%"
                height="100%"
                borderRadius="4px"
            />
        );
    }

    const color = getColorForUsername(username);
    return (
        <Flex
            width="100%"
            height="100%"
            borderRadius="4px"
            bg={`${color}40`}
            alignItems="center"
            justifyContent="center"
        >
            <Text
                fontSize={initialsFontSize}
                fontWeight="bold"
                color={color}
                lineHeight="1"
                userSelect="none"
                sx={initialsSx}
            >
                {computeInitials(username)}
            </Text>
        </Flex>
    );
}

export default React.memo(PlayerAvatar);
