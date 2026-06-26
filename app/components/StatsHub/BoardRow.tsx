'use client';

import React from 'react';
import { Box, Flex, HStack, Text, Icon, Tooltip, Spacer } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaGem, FaCrown, FaAward } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { blo } from 'blo';
import { playerDisplayName } from '@/app/utils/address';
import type { BoardRow as BoardRowData } from '@/app/hooks/server_actions';

// The backend sends a status tier per row ("Diamond"…"Bronze"/"Unranked"); map it to an icon so
// the board reads at a glance. Kept here (not theme.ts) — it's local presentation, not a token.
const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    platinum: FaCrown,
    gold: FaCrown,
    silver: FaMedal,
    bronze: FaAward,
};
const TIER_COLOR: Record<string, string> = {
    diamond: '#A78BFA',
    platinum: '#7DD3FC',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
};

const PODIUM_COLORS: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export interface BoardRowProps {
    row: BoardRowData;
    isCurrent: boolean;
    // pinned = rendered in the sticky "your position" slot (visual divider above).
    pinned?: boolean;
}

// One ranked row of any board. Identity links to the player's public profile (Viral §1), the stat
// uses the server-formatted value_label, and Top Hosts rows surface their two activity counts.
const BoardRow: React.FC<BoardRowProps> = ({ row, isCurrent, pinned }) => {
    const tierKey = (row.tier || '').toLowerCase();
    const tierIcon = TIER_ICON[tierKey];
    const podiumColor = PODIUM_COLORS[row.rank];
    const label = playerDisplayName(
        row.x_username ? `@${row.x_username}` : undefined,
        row.wallet,
        row.x_display_name
    );
    const accentColor = isCurrent
        ? 'var(--chakra-colors-brand-green)'
        : podiumColor ?? undefined;

    const tablesHosted = row.extra?.tables_hosted;
    const tournamentsRun = row.extra?.tournaments_run;

    return (
        <Flex
            align="center"
            py={{ base: 2.5, md: 3 }}
            px={{ base: 3, md: 4 }}
            borderRadius="14px"
            position="relative"
            bg={isCurrent ? 'rgba(54, 163, 123, 0.06)' : undefined}
            transition="all 0.2s ease"
            _hover={{
                bg: isCurrent ? 'rgba(54, 163, 123, 0.1)' : 'card.lightGray',
                transform: 'translateX(4px)',
                _dark: { bg: isCurrent ? 'rgba(54, 163, 123, 0.12)' : 'legacy.grayDark' },
            }}
            _before={
                accentColor
                    ? {
                          content: '""',
                          position: 'absolute',
                          left: '0',
                          top: '20%',
                          bottom: '20%',
                          width: '3px',
                          borderRadius: 'full',
                          bg: accentColor,
                      }
                    : undefined
            }
        >
            {/* Rank */}
            <Text
                w="44px"
                flexShrink={0}
                fontSize={podiumColor ? { base: 'md', md: 'lg' } : { base: 'sm', md: 'md' }}
                fontWeight={podiumColor ? 900 : 700}
                color={podiumColor ?? 'text.secondary'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {row.rank > 0 ? `#${row.rank}` : '—'}
            </Text>

            {/* Player → links to the public profile */}
            <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                <Box
                    as="img"
                    src={row.avatar_url ?? blo(row.wallet as `0x${string}`)}
                    alt=""
                    w={{ base: '28px', md: '32px' }}
                    h={{ base: '28px', md: '32px' }}
                    borderRadius={row.avatar_url ? 'full' : '4px'}
                    flexShrink={0}
                    objectFit="cover"
                    boxShadow={isCurrent ? '0 0 0 2px #36A37B' : undefined}
                />
                <Text
                    as={NextLink}
                    href={`/profile/${row.wallet}`}
                    color={isCurrent ? 'brand.green' : 'text.primary'}
                    fontWeight={isCurrent ? 'bold' : 'medium'}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    isTruncated
                    _hover={{ textDecoration: 'underline' }}
                >
                    {label}
                </Text>
                {isCurrent && (
                    <Text
                        fontSize="2xs"
                        fontWeight={900}
                        color="brand.green"
                        letterSpacing="0.15em"
                        flexShrink={0}
                    >
                        {pinned ? 'YOU ▸' : 'YOU'}
                    </Text>
                )}
                {tierIcon && (
                    <Tooltip label={`${row.tier} tier`} hasArrow placement="top" fontSize="xs">
                        <span>
                            <Icon as={tierIcon} color={TIER_COLOR[tierKey] ?? '#9CA3AF'} boxSize="14px" />
                        </span>
                    </Tooltip>
                )}
            </HStack>

            <Spacer />

            {/* Top Hosts activity counts */}
            {(tablesHosted != null || tournamentsRun != null) && (
                <Text
                    display={{ base: 'none', sm: 'block' }}
                    fontSize="2xs"
                    color="text.secondary"
                    mr={3}
                    flexShrink={0}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {tablesHosted ?? 0} tables · {tournamentsRun ?? 0} tournaments
                </Text>
            )}

            {/* Stat (server-formatted label) */}
            <Text
                color={isCurrent ? 'brand.green' : 'text.primary'}
                fontWeight="bold"
                fontSize={{ base: 'md', md: 'lg' }}
                flexShrink={0}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {row.value_label}
            </Text>
        </Flex>
    );
};

export default BoardRow;
