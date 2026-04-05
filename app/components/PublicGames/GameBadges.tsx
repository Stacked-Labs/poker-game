'use client';

import { HStack, Badge } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import type { PublicGame } from './types';
import { isNewTable, isHotTable, getSeatsLeft } from './useRelativeTime';

const subtlePulse = keyframes`
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
`;

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

interface GameBadgesProps {
    game: PublicGame;
}

export default function GameBadges({ game }: GameBadgesProps) {
    const seatsLeft = getSeatsLeft(game.player_count, game.max_players);
    const showUrgency = seatsLeft > 0 && seatsLeft <= 2;
    const showHot = game.is_active && isHotTable(game.spectator_count, game.player_count);
    const showNew = isNewTable(game.created_at);

    const badges: {
        key: string;
        label: string;
        bg: string;
        color: string;
        pulse?: boolean;
    }[] = [];

    if (showUrgency) {
        badges.push({
            key: 'urgency',
            label: seatsLeft === 1 ? '1 seat left!' : '2 seats left!',
            bg: 'rgba(235, 11, 92, 0.12)',
            color: 'brand.pink',
            pulse: true,
        });
    }
    if (showHot) {
        badges.push({
            key: 'hot',
            label: '\uD83D\uDD25 Hot',
            bg: 'rgba(251, 146, 60, 0.12)',
            color: 'orange.400',
        });
    }
    if (showNew) {
        badges.push({
            key: 'new',
            label: 'New',
            bg: 'rgba(54, 163, 123, 0.12)',
            color: 'brand.green',
        });
    }

    if (badges.length === 0) return null;

    return (
        <HStack spacing={1} flexWrap="wrap">
            {badges.map((b) => (
                <Badge
                    key={b.key}
                    bg={b.bg}
                    color={b.color}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="2xs"
                    fontWeight="800"
                    textTransform="uppercase"
                    lineHeight="short"
                    letterSpacing="0.04em"
                    backdropFilter="blur(8px)"
                    border="none"
                    animation={b.pulse ? `${subtlePulse} 2s ease-in-out infinite` : undefined}
                    transition={TRANSITION}
                    _dark={{
                        bg: b.key === 'urgency'
                            ? 'rgba(235, 11, 92, 0.18)'
                            : b.key === 'hot'
                            ? 'rgba(251, 146, 60, 0.18)'
                            : 'rgba(54, 163, 123, 0.18)',
                        color: b.key === 'hot' ? 'orange.300' : undefined,
                    }}
                >
                    {b.label}
                </Badge>
            ))}
        </HStack>
    );
}
