'use client';

import React from 'react';
import { Box, Flex, HStack, Text, Icon, Spacer } from '@chakra-ui/react';
import NextLink from 'next/link';
import { blo } from 'blo';
import { playerDisplayName } from '@/app/utils/address';
import { tierFromString } from '@/app/components/Leaderboard/tierUtils';
import TooltipOrPopover from '@/app/components/TooltipOrPopover';
import type { BoardRow as BoardRowData } from '@/app/hooks/server_actions';

export interface BoardRowProps {
    row: BoardRowData;
    isCurrent: boolean;
    // pinned = rendered in the sticky "your position" slot (visual divider above).
    pinned?: boolean;
    // moneyStat = the stat is host USDC earnings (Top Hosts) — the one money-colored figure.
    moneyStat?: boolean;
}

// One ranked row of any board. Identity links to the public profile (Viral §1); the stat uses the
// server-formatted value_label. Tier color + icon come from the shared tierFromString so every
// surface speaks one visual language (steel/brass ramp, never the stale lavender). Podium: only the
// champion (#1) wears the quarantined win gold — tiers keep their own ramp so the two golds never
// collide; ranks 2–3 read as podium through weight/size, not a trophy-shop gold/silver/bronze.
const BoardRow: React.FC<BoardRowProps> = ({ row, isCurrent, pinned, moneyStat }) => {
    const tier = tierFromString(row.tier);
    const showTier = tier.name !== 'unranked';
    const isChampion = row.rank === 1;
    const isPodium = row.rank >= 1 && row.rank <= 3;

    const label = playerDisplayName(
        row.x_username ? `@${row.x_username}` : undefined,
        row.wallet,
        row.x_display_name
    );

    const tablesHosted = row.extra?.tables_hosted;
    const tournamentsRun = row.extra?.tournaments_run;

    // Left accent stripe: "you" (green) wins; otherwise only the champion gets win gold.
    const stripe = isCurrent ? 'brand.green' : isChampion ? 'brand.yellow' : undefined;

    return (
        <Flex
            align="center"
            py={{ base: 2.5, md: 3 }}
            px={{ base: 3, md: 4 }}
            borderRadius="14px"
            position="relative"
            bg={isCurrent ? 'bg.greenSubtle' : undefined}
            transition="background-color 0.15s ease"
            _hover={{ bg: isCurrent ? 'bg.greenTint' : 'card.lightGray' }}
            _before={
                stripe
                    ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '22%',
                          bottom: '22%',
                          width: '3px',
                          borderRadius: 'full',
                          bg: stripe,
                      }
                    : undefined
            }
        >
            {/* Rank — champion in win gold, podium bumped by weight, you in green. */}
            <Text
                w="44px"
                flexShrink={0}
                fontSize={isPodium ? { base: 'md', md: 'lg' } : { base: 'sm', md: 'md' }}
                fontWeight={isPodium ? 900 : 700}
                color={
                    isCurrent
                        ? 'brand.green'
                        : isChampion
                          ? 'brand.yellowDark'
                          : isPodium
                            ? 'text.primary'
                            : 'text.secondary'
                }
                _dark={isChampion && !isCurrent ? { color: 'brand.yellow' } : undefined}
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
                    boxShadow={isCurrent ? '0 0 0 2px var(--chakra-colors-brand-green)' : undefined}
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
                {showTier && (
                    <TooltipOrPopover label={`${tier.label} tier`} aria-label={`${tier.label} tier`}>
                        <Icon as={tier.icon} color={tier.token} boxSize="14px" aria-hidden />
                    </TooltipOrPopover>
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

            {/* Stat — host earnings ride the one money color; every other board stays neutral. */}
            <Text
                color={isCurrent ? 'brand.green' : moneyStat ? 'text.usdc' : 'text.primary'}
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
