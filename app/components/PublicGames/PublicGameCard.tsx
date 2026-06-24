'use client';

import { memo } from 'react';
import Link from 'next/link';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Image,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink, FiEye } from 'react-icons/fi';
import {
    BASESCAN_URL,
    STAKE_TIER_LABEL,
    USDC_BLUE,
    USDC_LOGO,
    blindsLabel,
    hostLabel,
    isHot,
    stakeTier,
} from './types';
import type { PublicGame } from './types';
import { useRelativeTime } from './useRelativeTime';
import StatePill from './StatePill';
import ChainBadge from '../ChainBadge';
import PlayerAvatar from '../PlayerAvatar';

interface PublicGameCardProps {
    game: PublicGame;
    ruleColor: string;
    isLast: boolean;
}

function shortenName(name: string): string {
    if (!name) return name;
    if (name.startsWith('0x') && name.length > 14) {
        return `${name.slice(0, 6)}…${name.slice(-4)}`;
    }
    if (name.length > 14) return `${name.slice(0, 10)}…`;
    return name;
}

function PublicGameCard({ game, ruleColor, isLast }: PublicGameCardProps) {
    const rowHover = useColorModeValue(
        'rgba(39, 117, 202, 0.04)',
        'rgba(39, 117, 202, 0.06)'
    );
    const freeRowHover = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.03)'
    );
    const hoverBg = game.is_crypto ? rowHover : freeRowHover;
    const relTime = useRelativeTime(game.created_at);

    return (
        <HStack
            as={Link}
            href={`/table/${game.name}`}
            target="_blank"
            rel="noopener noreferrer"
            px={{ base: 3, md: 6 }}
            py={{ base: 3, md: 3.5 }}
            spacing={{ base: 3, md: 4 }}
            borderBottom={isLast ? 'none' : '1px solid'}
            borderColor={ruleColor}
            cursor="pointer"
            textDecoration="none"
            _hover={{ bg: hoverBg, textDecoration: 'none' }}
            _focusVisible={{ bg: hoverBg, boxShadow: 'focus.ring' }}
            transition="background 120ms ease"
            role="group"
            minH={{ base: '68px', md: 'auto' }}
            align="center"
        >
            <StatePill active={game.is_active} />

            {/* ---- Desktop: stakes-led columns ---- */}
            <Box flex="1.4" minW={0} display={{ base: 'none', md: 'block' }}>
                <StakesCell game={game} />
            </Box>
            <Box flex="2.2" minW={0} display={{ base: 'none', md: 'block' }}>
                <TableIdentity game={game} />
            </Box>
            <HStack flex="1.2" spacing={3} display={{ base: 'none', md: 'flex' }}>
                <SeatProgress
                    taken={game.player_count}
                    total={game.max_players}
                    isCrypto={game.is_crypto}
                />
                <SpectatorPip count={game.spectator_count} />
            </HStack>
            <Text
                w="48px"
                textAlign="right"
                fontSize="2xs"
                color="text.muted"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                display={{ base: 'none', md: 'block' }}
            >
                {relTime}
            </Text>

            {/* ---- Mobile: stakes on top, identity + meta beneath ---- */}
            <VStack
                align="start"
                spacing={1}
                flex={1}
                minW={0}
                display={{ base: 'flex', md: 'none' }}
            >
                <StakesCell game={game} />
                <MobileIdentity game={game} />
            </VStack>
            <VStack
                align="end"
                spacing={1}
                flexShrink={0}
                display={{ base: 'flex', md: 'none' }}
            >
                <SeatCount
                    taken={game.player_count}
                    total={game.max_players}
                />
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {relTime}
                </Text>
            </VStack>
        </HStack>
    );
}

export default memo(PublicGameCard);

// The bold money anchor: the blinds lead, marked with the USDC logo + USDC-blue
// for real-money tables (qualified by a Micro/Mid/High tier chip), and tagged
// "chips" for free play so play-money blinds never read as dollars.
function StakesCell({ game }: { game: PublicGame }) {
    const tier = stakeTier(game);
    return (
        <HStack spacing={2} align="center" minW={0}>
            {game.is_crypto && (
                <Image
                    src={USDC_LOGO}
                    alt=""
                    boxSize={{ base: '14px', md: '16px' }}
                    flexShrink={0}
                />
            )}
            <HStack spacing={1} align="baseline" minW={0}>
                <Text
                    fontWeight="extrabold"
                    fontSize={{ base: 'sm', md: 'md' }}
                    letterSpacing="-0.01em"
                    color={game.is_crypto ? USDC_BLUE : 'text.primary'}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    whiteSpace="nowrap"
                >
                    {blindsLabel(game)}
                </Text>
                {!game.is_crypto && (
                    <Text
                        as="span"
                        fontSize="2xs"
                        fontWeight="semibold"
                        color="text.muted"
                        flexShrink={0}
                    >
                        chips
                    </Text>
                )}
            </HStack>
            {tier && <TierChip tier={tier} />}
        </HStack>
    );
}

function TierChip({ tier }: { tier: 'micro' | 'mid' | 'high' }) {
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg="bg.pillNeutral"
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="text.secondary"
            lineHeight="1"
            flexShrink={0}
        >
            {STAKE_TIER_LABEL[tier]}
        </Text>
    );
}

// Who's running the table. Leads with the Host (handle or shortened wallet) when
// the backend provides it (poker-server#318); until then it falls back to the
// table name. The raw table id always stays available, demoted into the meta row.
// A small circular host avatar — the Host's X picture when we have it, otherwise
// a deterministic wallet blockie, otherwise colored initials (PlayerAvatar's own
// cascade). Reused at the table and on the leaderboard; a hairline ring keeps a
// white profile photo from dissolving into the card.
function HostAvatar({
    game,
    size,
    initialsFontSize,
}: {
    game: PublicGame;
    size: string;
    initialsFontSize: string;
}) {
    return (
        <Box position="relative" boxSize={size} flexShrink={0}>
            <Box position="absolute" inset={0} borderRadius="full" overflow="hidden">
                <PlayerAvatar
                    profileImageUrl={game.host_profile_image_url}
                    address={game.host_wallet}
                    username={game.host_username || hostLabel(game)}
                    initialsFontSize={initialsFontSize}
                />
            </Box>
            <Box
                position="absolute"
                inset={0}
                borderRadius="full"
                pointerEvents="none"
                boxShadow="inset 0 0 0 1px rgba(11, 20, 48, 0.08)"
                _dark={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10)' }}
            />
        </Box>
    );
}

function TableIdentity({ game }: { game: PublicGame }) {
    const host = hostLabel(game);
    const hot = isHot(game);
    return (
        <HStack spacing={2.5} align="center" minW={0}>
            {host && (
                <HostAvatar game={game} size="28px" initialsFontSize="10px" />
            )}
            <VStack align="start" spacing={0.5} minW={0}>
                <HStack spacing={1.5} maxW="100%" minW={0}>
                    <Text
                        fontWeight="semibold"
                        color="text.primary"
                        noOfLines={1}
                        fontSize="sm"
                        minW={0}
                        letterSpacing="-0.01em"
                    >
                        {host || shortenName(game.name)}
                    </Text>
                    {hot && <HotPill />}
                    <ContractLink game={game} />
                </HStack>
                <Flex
                    align="center"
                    gap={1.5}
                    fontSize="2xs"
                    color="text.muted"
                    flexWrap="wrap"
                >
                    {game.is_crypto ? (
                        <ChainBadge
                            chain={game.chain ?? 'base'}
                            size="sm"
                            variant="lockup"
                        />
                    ) : (
                        <Text as="span" color="text.muted">
                            Play money
                        </Text>
                    )}
                </Flex>
            </VStack>
        </HStack>
    );
}

function MobileIdentity({ game }: { game: PublicGame }) {
    const host = hostLabel(game);
    const hot = isHot(game);
    return (
        <HStack
            spacing={1.5}
            fontSize="2xs"
            color="text.muted"
            flexWrap="wrap"
            minW={0}
        >
            {host ? (
                <HStack spacing={1.5} minW={0}>
                    <HostAvatar game={game} size="16px" initialsFontSize="7px" />
                    <Text as="span" color="text.secondary" noOfLines={1} minW={0}>
                        {host}
                    </Text>
                </HStack>
            ) : (
                <Text
                    as="span"
                    color="text.secondary"
                    noOfLines={1}
                    minW={0}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {shortenName(game.name)}
                </Text>
            )}
            {hot && <HotPill />}
            <ContractLink game={game} />
        </HStack>
    );
}

function HotPill() {
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg="bg.hotSubtle"
            color="text.hot"
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.06em"
            flexShrink={0}
            lineHeight="1"
        >
            HOT
        </Text>
    );
}

function ContractLink({ game }: { game: PublicGame }) {
    if (!game.is_crypto || !game.contract_address) return null;
    return (
        <Tooltip
            label="View contract on Basescan"
            hasArrow
            placement="top"
            openDelay={300}
            fontSize="xs"
        >
            <Box
                as="a"
                href={`${BASESCAN_URL}/${game.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                aria-label="View contract on Basescan"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="20px"
                h="20px"
                borderRadius="6px"
                color="text.muted"
                flexShrink={0}
                _hover={{ color: USDC_BLUE, bg: 'bg.usdcSubtle' }}
                _focusVisible={{ boxShadow: 'focus.ring' }}
                transition="color 0.15s ease, background 0.15s ease"
            >
                <Icon as={FiExternalLink} boxSize="11px" />
            </Box>
        </Tooltip>
    );
}

function SpectatorPip({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <Tooltip
            label={`${count} ${count === 1 ? 'spectator' : 'spectators'} watching`}
            hasArrow
            placement="top"
            openDelay={300}
            fontSize="xs"
        >
            <HStack spacing={1} color="text.muted" fontSize="xs">
                <Icon as={FiEye} boxSize="11px" />
                <Text
                    color="text.muted"
                    fontWeight="semibold"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {count}
                </Text>
            </HStack>
        </Tooltip>
    );
}

function SeatCount({ taken, total }: { taken: number; total: number }) {
    const isFull = taken >= total;
    return (
        <HStack spacing={1} align="baseline">
            <Text
                fontWeight="bold"
                fontSize="xs"
                color={isFull ? 'text.muted' : 'text.primary'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                lineHeight="1"
            >
                {taken}/{total}
            </Text>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
                lineHeight="1"
            >
                {isFull ? 'full' : 'seats'}
            </Text>
        </HStack>
    );
}

function SeatProgress({
    taken,
    total,
    isCrypto,
}: {
    taken: number;
    total: number;
    isCrypto: boolean;
}) {
    const ratio = total === 0 ? 0 : Math.min(1, taken / total);
    const isFull = taken >= total;
    // Full = neutral muted (no alarming pink). Otherwise: crypto rows get
    // USDC blue, free-play rows get the resting text-secondary tone.
    const fillFg = isFull
        ? 'text.muted'
        : isCrypto
          ? USDC_BLUE
          : 'text.secondary';

    return (
        <VStack spacing={1.5} align="flex-start" minW="78px">
            <SeatCount taken={taken} total={total} />
            <Box
                position="relative"
                w="78px"
                h="3px"
                borderRadius="full"
                bg="border.pillNeutral"
            >
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    h="3px"
                    w={`${ratio * 100}%`}
                    borderRadius="full"
                    bg={fillFg}
                    opacity={0.9}
                    transition="width 0.2s ease"
                />
            </Box>
        </VStack>
    );
}
