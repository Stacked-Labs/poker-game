'use client';

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
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiExternalLink, FiEye } from 'react-icons/fi';
import {
    BASESCAN_URL,
    USDC_BLUE,
    USDC_LOGO,
    blindsLabel,
    isHot,
} from './types';
import type { PublicGame } from './types';
import { useRelativeTime } from './useRelativeTime';
import ChainBadge from '../ChainBadge';

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.55); }
    50%     { box-shadow: 0 0 0 5px rgba(54, 163, 123, 0); }
`;

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

export default function PublicGameCard({ game, ruleColor, isLast }: PublicGameCardProps) {
    const rowHover = useColorModeValue(
        'rgba(39, 117, 202, 0.04)',
        'rgba(39, 117, 202, 0.06)'
    );
    const freeRowHover = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.03)'
    );
    const relTime = useRelativeTime(game.created_at);
    const hot = isHot(game);

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
            _hover={{
                bg: game.is_crypto ? rowHover : freeRowHover,
                textDecoration: 'none',
            }}
            transition="background 120ms ease"
            role="group"
            minH={{ base: '68px', md: 'auto' }}
            align="center"
        >
            <StatusDot game={game} />

            <VStack align="start" spacing={0.5} flex="2.2" minW={0}>
                <HStack spacing={2} maxW="100%" minW={0}>
                    <Text
                        fontWeight="semibold"
                        color="text.primary"
                        noOfLines={1}
                        fontSize={{ base: 'sm', md: 'md' }}
                        minW={0}
                        display={{ base: 'none', md: 'block' }}
                        letterSpacing="-0.01em"
                    >
                        {game.name}
                    </Text>
                    <Text
                        fontWeight="semibold"
                        color="text.primary"
                        noOfLines={1}
                        fontSize="sm"
                        minW={0}
                        display={{ base: 'block', md: 'none' }}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        letterSpacing="-0.01em"
                    >
                        {shortenName(game.name)}
                    </Text>
                    <MarketTag game={game} />
                    {hot && <HotPill />}
                    <ContractLink game={game} />
                </HStack>
                <Flex
                    align="center"
                    gap={1.5}
                    fontSize="2xs"
                    color="text.muted"
                    mt={0.5}
                    flexWrap="wrap"
                >
                    {game.is_crypto ? (
                        <ChainBadge
                            chain={game.chain ?? 'base'}
                            size="sm"
                            variant="symbol"
                        />
                    ) : (
                        <Text as="span" color="text.muted">
                            Play money
                        </Text>
                    )}
                    <Text as="span" color="text.muted">
                        {' · '}
                        {game.is_active ? 'Running' : 'Open'}
                    </Text>
                </Flex>
                {/* Mobile-only meta */}
                <HStack
                    display={{ base: 'flex', md: 'none' }}
                    spacing={2}
                    fontSize="2xs"
                    pt={1}
                    color="text.muted"
                    flexWrap="wrap"
                >
                    {game.spectator_count > 0 && (
                        <>
                            <HStack spacing={1}>
                                <Icon as={FiEye} boxSize="10px" />
                                <Text>{game.spectator_count}</Text>
                            </HStack>
                            <Text>·</Text>
                        </>
                    )}
                    <Text>{relTime}</Text>
                </HStack>
            </VStack>

            <BlindsCell game={game} />

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
        </HStack>
    );
}

function StatusDot({ game }: { game: PublicGame }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    return (
        <Box
            w={{ base: '8px', md: '10px' }}
            h={{ base: '8px', md: '10px' }}
            borderRadius="full"
            bg={game.is_active ? 'brand.green' : 'brand.yellow'}
            animation={
                game.is_active && !prefersReducedMotion
                    ? `${dotPulse} 2.2s ease-in-out infinite`
                    : undefined
            }
            flexShrink={0}
            aria-hidden
        />
    );
}

function MarketTag({ game }: { game: PublicGame }) {
    const freeBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    if (game.is_crypto) {
        return (
            <HStack
                spacing={1}
                px={1.5}
                py="2px"
                borderRadius="full"
                bg="rgba(39, 117, 202, 0.10)"
                flexShrink={0}
            >
                <Image
                    src={USDC_LOGO}
                    alt=""
                    boxSize="10px"
                    loading="lazy"
                />
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.06em"
                    color={USDC_BLUE}
                    lineHeight="1"
                >
                    USDC
                </Text>
            </HStack>
        );
    }
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg={freeBg}
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.06em"
            color="text.muted"
            flexShrink={0}
            lineHeight="1"
        >
            FREE
        </Text>
    );
}

// One-off warm-orange for the HOT pill. No `brand.orange` token in theme
// and adding one for a single use is overkill (per CHAKRA.md §rules).
const HOT_ORANGE = '#E55A1E';
const HOT_ORANGE_LIGHT = '#FFB48A';

function HotPill() {
    return (
        <Text
            px={1.5}
            py="2px"
            borderRadius="full"
            bg="rgba(229, 90, 30, 0.12)"
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.06em"
            color={HOT_ORANGE}
            flexShrink={0}
            lineHeight="1"
            _dark={{
                bg: 'rgba(229, 90, 30, 0.22)',
                color: HOT_ORANGE_LIGHT,
            }}
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
                _hover={{ color: USDC_BLUE, bg: 'rgba(39, 117, 202, 0.10)' }}
                transition="all 0.15s ease"
            >
                <Icon as={FiExternalLink} boxSize="11px" />
            </Box>
        </Tooltip>
    );
}

function BlindsCell({ game }: { game: PublicGame }) {
    const isFull = game.player_count >= game.max_players;
    return (
        <VStack
            flex={{ base: '0 0 auto', md: '1' }}
            align="flex-end"
            spacing={1}
            flexShrink={0}
        >
            <HStack spacing={1.5}>
                {game.is_crypto && (
                    <Image
                        src={USDC_LOGO}
                        alt=""
                        boxSize={{ base: '12px', md: '14px' }}
                        flexShrink={0}
                    />
                )}
                <Text
                    fontWeight="bold"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    letterSpacing="-0.01em"
                    color={game.is_crypto ? USDC_BLUE : 'text.primary'}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    whiteSpace="nowrap"
                >
                    {blindsLabel(game)}
                </Text>
            </HStack>
            <HStack
                display={{ base: 'flex', md: 'none' }}
                spacing={1}
                align="baseline"
            >
                <Text
                    fontWeight="bold"
                    fontSize="2xs"
                    color={isFull ? 'text.muted' : 'text.secondary'}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    lineHeight="1"
                >
                    {game.player_count}/{game.max_players}
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
        </VStack>
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
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    // Full = neutral muted (no alarming pink). Otherwise: crypto rows get
    // USDC blue, free-play rows get the resting text-secondary tone.
    const fillFg = isFull
        ? 'text.muted'
        : isCrypto
          ? USDC_BLUE
          : 'text.secondary';

    return (
        <VStack spacing={1.5} align="flex-start" minW="78px">
            <HStack spacing={1.5} align="baseline">
                <Text
                    fontWeight="bold"
                    fontSize="xs"
                    color="text.primary"
                    lineHeight="1"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {taken}/{total}
                </Text>
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.10em"
                    fontWeight="semibold"
                    lineHeight="1"
                >
                    {isFull ? 'full' : 'seats'}
                </Text>
            </HStack>
            <Box
                position="relative"
                w="78px"
                h="3px"
                borderRadius="full"
                bg={trackBg}
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
