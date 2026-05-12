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

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 6px rgba(54, 163, 123, 0.4); }
    50% { box-shadow: 0 0 12px rgba(54, 163, 123, 0.8); }
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

function getChainLogo(chain: string): string | null {
    const c = chain.toLowerCase();
    if (c === 'base' || c === 'base sepolia' || c === 'base-sepolia')
        return '/networkLogos/base-logo.png';
    if (c === 'arbitrum') return '/networkLogos/arbitrum-logo.png';
    if (c === 'optimism') return '/networkLogos/optimism-logo.png';
    if (c === 'solana') return '/networkLogos/solana-logo.png';
    return null;
}

export default function PublicGameCard({ game, ruleColor, isLast }: PublicGameCardProps) {
    const rowHover = useColorModeValue('rgba(11, 20, 48, 0.025)', 'rgba(255, 255, 255, 0.03)');
    const relTime = useRelativeTime(game.created_at);
    const hot = isHot(game);
    const chainName = game.is_crypto ? (game.chain ?? 'Base') : null;
    const chainLogo = chainName ? getChainLogo(chainName) : null;

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
            _hover={{ bg: rowHover, textDecoration: 'none' }}
            transition="background 0.12s ease"
            role="group"
            minH={{ base: '64px', md: 'auto' }}
            align="center"
        >
            <Box
                w={{ base: '8px', md: '10px' }}
                h={{ base: '8px', md: '10px' }}
                borderRadius="full"
                bg={game.is_active ? 'brand.green' : 'brand.yellow'}
                animation={game.is_active ? `${dotPulse} 2s ease-in-out infinite` : undefined}
                flexShrink={0}
            />

            <VStack align="start" spacing={0} flex="2.2" minW={0}>
                <HStack spacing={2} maxW="100%" minW={0}>
                    <Text
                        fontWeight="semibold"
                        color="text.primary"
                        noOfLines={1}
                        fontSize={{ base: 'sm', md: 'md' }}
                        minW={0}
                        display={{ base: 'none', md: 'block' }}
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
                    >
                        {shortenName(game.name)}
                    </Text>
                    <MarketTag game={game} />
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
                    {chainLogo && chainName && (
                        <Image
                            src={chainLogo}
                            alt={`${chainName} logo`}
                            w={{ base: '14px', md: '16px' }}
                            h={{ base: '14px', md: '16px' }}
                            objectFit="contain"
                            loading="lazy"
                            flexShrink={0}
                        />
                    )}
                    <Text as="span" color="text.muted">
                        {chainName ?? 'Play money'}
                        {' · '}
                        {game.is_active ? 'Running' : 'Open'}
                        {hot && ' · Hot'}
                    </Text>
                </Flex>
                {/* Mobile-only: spectator + time meta (seats moved next to stakes) */}
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

function MarketTag({ game }: { game: PublicGame }) {
    if (game.is_crypto) {
        return (
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.08em"
                color={USDC_BLUE}
                flexShrink={0}
            >
                USDC
            </Text>
        );
    }
    return (
        <Text
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="0.08em"
            color="text.muted"
            flexShrink={0}
        >
            FREE
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
                _hover={{ color: USDC_BLUE, bg: 'rgba(39, 117, 202, 0.1)' }}
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
                        alt="USDC"
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
                    color={isFull ? 'brand.pink' : 'text.secondary'}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    lineHeight="1"
                >
                    {game.player_count}/{game.max_players}
                </Text>
                <Text
                    fontSize="2xs"
                    color={isFull ? 'brand.pink' : 'text.muted'}
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

function SeatProgress({ taken, total }: { taken: number; total: number }) {
    const ratio = total === 0 ? 0 : Math.min(1, taken / total);
    const isFull = taken >= total;
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    const fillFg = isFull ? 'brand.pink' : 'text.secondary';

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
                    color={isFull ? 'brand.pink' : 'text.muted'}
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
                h="2px"
                borderRadius="full"
                bg={trackBg}
            >
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    h="2px"
                    w={`${ratio * 100}%`}
                    borderRadius="full"
                    bg={fillFg}
                    opacity={0.85}
                    transition="width 0.2s ease"
                />
            </Box>
        </VStack>
    );
}
