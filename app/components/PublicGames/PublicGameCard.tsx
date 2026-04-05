'use client';

import Link from 'next/link';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    Grid,
    Tooltip,
    Image,
} from '@chakra-ui/react';
import { FiArrowUpRight, FiUsers, FiEye, FiExternalLink } from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import type { PublicGame } from './types';
import { getStatusStyle, formatUsdc, truncateAddress, BASESCAN_URL } from './types';
import { useRelativeTime } from './useRelativeTime';
import SeatIndicator from './SeatIndicator';
import GameBadges from './GameBadges';

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 6px rgba(54, 163, 123, 0.4); }
    50% { box-shadow: 0 0 12px rgba(54, 163, 123, 0.8); }
`;

const spectatorGlow = keyframes`
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
`;

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const usdcLogoUrl = '/usdc-logo.png';
const CHIPS_PER_USDC = 100;

interface PublicGameCardProps {
    game: PublicGame;
    variant?: 'compact' | 'featured';
}

export default function PublicGameCard({ game, variant = 'compact' }: PublicGameCardProps) {
    const statusStyle = getStatusStyle(game.is_active);
    const statusLabel = game.is_active ? 'Active' : 'Open';
    const accentColor = game.is_crypto ? 'blue.500' : 'brand.green';
    const relativeTime = useRelativeTime(game.created_at, game.is_active);
    const usdcPerChip = 1 / CHIPS_PER_USDC;
    const blindsLabel = game.is_crypto
        ? `${formatUsdc(game.small_blind * usdcPerChip)} / ${formatUsdc(game.big_blind * usdcPerChip)}`
        : `${game.small_blind} / ${game.big_blind}`;

    if (variant === 'featured') {
        return <FeaturedCard game={game} statusStyle={statusStyle} statusLabel={statusLabel} blindsLabel={blindsLabel} relativeTime={relativeTime} />;
    }

    return (
        <Grid
            as={Link}
            href={`/table/${game.name}`}
            w="full"
            templateColumns={{
                base: '1fr 20px',
                md: '24px 2.2fr 1fr 0.8fr 20px',
            }}
            gap={{ base: 2, md: 4 }}
            alignItems="center"
            px={{ base: 3, md: 6 }}
            py={{ base: 2.5, md: 3 }}
            borderRadius="16px"
            bg="rgba(12, 21, 49, 0.02)"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
            backdropFilter="blur(4px)"
            cursor="pointer"
            textDecoration="none"
            _dark={{
                bg: 'rgba(255, 255, 255, 0.03)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            }}
            _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'glass',
                textDecoration: 'none',
                _dark: {
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                },
                '& .row-chevron': {
                    opacity: 1,
                    transform: 'translateX(0)',
                },
            }}
            transition={TRANSITION}
            role="group"
        >
            {/* Desktop dot indicator */}
            <Flex
                display={{ base: 'none', md: 'flex' }}
                align="center"
                justify="center"
            >
                <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={statusStyle.dotBg}
                    boxShadow={statusStyle.dotShadow}
                    animation={game.is_active ? `${dotPulse} 2s ease-in-out infinite` : undefined}
                />
            </Flex>

            {/* Name + badges column */}
            <HStack spacing={2} minW={0}>
                <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={statusStyle.dotBg}
                    boxShadow={statusStyle.dotShadow}
                    display={{ base: 'block', md: 'none' }}
                    flexShrink={0}
                    animation={game.is_active ? `${dotPulse} 2s ease-in-out infinite` : undefined}
                />
                <VStack align="start" spacing={0.5} minW={0}>
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight="semibold"
                        color="text.primary"
                        noOfLines={1}
                        w="full"
                        isTruncated
                    >
                        {game.name}
                    </Text>
                    {game.is_crypto && game.contract_address && (
                        <HStack
                            as="a"
                            href={`${BASESCAN_URL}/${game.contract_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            spacing={1}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            _hover={{ color: 'brand.green' }}
                            transition="color 0.15s ease"
                        >
                            <Text fontSize="2xs" fontFamily="monospace" color="text.muted">
                                {truncateAddress(game.contract_address)}
                            </Text>
                            <Icon as={FiExternalLink} boxSize="10px" color="text.muted" />
                        </HStack>
                    )}
                    <HStack spacing={1.5} align="center" flexWrap="wrap">
                        <Badge
                            bg={game.is_active ? 'rgba(54, 163, 123, 0.12)' : 'rgba(253, 197, 29, 0.12)'}
                            color={game.is_active ? 'brand.green' : 'brand.yellowDark'}
                            _dark={{
                                bg: game.is_active ? 'rgba(54, 163, 123, 0.18)' : 'rgba(253, 197, 29, 0.18)',
                                color: game.is_active ? 'brand.green' : 'brand.yellow',
                            }}
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="2xs"
                            fontWeight="800"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            lineHeight="short"
                            backdropFilter="blur(8px)"
                        >
                            {statusLabel}
                        </Badge>
                        {game.is_crypto && (
                            <Badge
                                bg="rgba(59, 130, 246, 0.12)"
                                color="blue.500"
                                _dark={{ bg: 'rgba(59, 130, 246, 0.18)', color: 'blue.300' }}
                                borderRadius="full"
                                px={2.5}
                                py={0.5}
                                fontSize="2xs"
                                fontWeight="800"
                                textTransform="uppercase"
                                letterSpacing="0.06em"
                                lineHeight="short"
                                backdropFilter="blur(8px)"
                            >
                                Crypto
                            </Badge>
                        )}
                        <GameBadges game={game} />
                    </HStack>
                    {/* Mobile: inline data */}
                    <HStack
                        spacing={1}
                        display={{ base: 'flex', md: 'none' }}
                        color="text.secondary"
                        fontSize="xs"
                    >
                        <Text>{blindsLabel} blinds</Text>
                        <Text>·</Text>
                        <Text>{game.player_count}/{game.max_players} seats</Text>
                        {game.spectator_count > 0 && (
                            <>
                                <Text>·</Text>
                                <Text>{game.spectator_count} watching</Text>
                            </>
                        )}
                    </HStack>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        display={{ base: 'block', md: 'none' }}
                    >
                        {relativeTime}
                    </Text>
                </VStack>
            </HStack>

            {/* Desktop: Blinds column */}
            <VStack
                align="start"
                spacing={0.5}
                display={{ base: 'none', md: 'flex' }}
            >
                <Text
                    fontSize="10px"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    opacity={0.6}
                >
                    Blinds
                </Text>
                {game.is_crypto ? (
                    <Tooltip label={`${game.small_blind} / ${game.big_blind} chips`} hasArrow>
                        <HStack spacing={1} align="center">
                            <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                                {blindsLabel}
                            </Text>
                            <Image src={usdcLogoUrl} alt="USDC" boxSize="12px" />
                        </HStack>
                    </Tooltip>
                ) : (
                    <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                        {blindsLabel}
                    </Text>
                )}
                <Text fontSize="2xs" color="text.muted">{relativeTime}</Text>
            </VStack>

            {/* Desktop: Seats column */}
            <VStack
                align="start"
                spacing={1}
                display={{ base: 'none', md: 'flex' }}
            >
                <Text
                    fontSize="10px"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    opacity={0.6}
                >
                    Seats
                </Text>
                <SeatIndicator playerCount={game.player_count} maxPlayers={game.max_players} />
                <HStack spacing={1} color="text.secondary" fontSize="xs">
                    <Icon as={FiUsers} boxSize="12px" />
                    <Text fontWeight="semibold" color="text.primary">
                        {game.player_count}/{game.max_players}
                    </Text>
                    {game.spectator_count > 0 && (
                        <>
                            <Text color="text.muted">·</Text>
                            <Icon as={FiEye} boxSize="11px" color="text.muted" />
                            <Text color="text.muted">{game.spectator_count}</Text>
                        </>
                    )}
                </HStack>
            </VStack>

            {/* Hover chevron */}
            <Flex
                className="row-chevron"
                align="center"
                justify="center"
                justifySelf="end"
                opacity={{ base: 0.4, md: 0 }}
                transform="translateX(-4px)"
                transition={TRANSITION}
            >
                <Icon
                    as={FiArrowUpRight}
                    boxSize={{ base: '14px', md: '16px' }}
                    color="brand.green"
                />
            </Flex>
        </Grid>
    );
}

/* ─── Featured Card Variant ─── */

function FeaturedCard({
    game,
    statusStyle,
    statusLabel,
    blindsLabel,
    relativeTime,
}: {
    game: PublicGame;
    statusStyle: ReturnType<typeof getStatusStyle>;
    statusLabel: string;
    blindsLabel: string;
    relativeTime: string;
}) {
    const gradientAccent = game.is_crypto
        ? 'linear(to-r, blue.400, blue.600)'
        : 'linear(to-r, brand.green, #2dd4bf)';

    return (
        <Box
            as={Link}
            href={`/table/${game.name}`}
            display="block"
            borderRadius="20px"
            overflow="hidden"
            position="relative"
            bg="card.white"
            border="none"
            boxShadow="glass"
            _dark={{
                bg: 'rgba(255, 255, 255, 0.03)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
            _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'glass-hover',
                _dark: {
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                },
            }}
            transition={TRANSITION}
            cursor="pointer"
            role="group"
        >
            {/* Watermark suit for personality */}
            <Text
                position="absolute"
                top="-10px"
                right="-5px"
                fontSize="120px"
                fontWeight="900"
                opacity={0.03}
                pointerEvents="none"
                userSelect="none"
                lineHeight="1"
                color="text.primary"
                _dark={{ color: 'white' }}
            >
                {game.is_crypto ? '\u2666' : '\u2660'}
            </Text>

            {/* Subtle gradient underline accent */}
            <Box
                h="2px"
                bgGradient={gradientAccent}
                opacity={0.6}
            />

            <VStack align="stretch" spacing={4} p={{ base: 4, md: 5 }}>
                {/* Header: name + status dot */}
                <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={1.5} minW={0} flex={1}>
                        <Text
                            fontSize={{ base: 'lg', md: 'xl' }}
                            fontWeight="800"
                            color="text.primary"
                            noOfLines={1}
                            isTruncated
                            textShadow="0 1px 4px rgba(0, 0, 0, 0.06)"
                            _dark={{
                                textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            {game.name}
                        </Text>

                        {/* Contract address for crypto tables */}
                        {game.is_crypto && game.contract_address && (
                            <HStack
                                as="a"
                                href={`${BASESCAN_URL}/${game.contract_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                spacing={1}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                _hover={{ color: 'brand.green' }}
                                transition={TRANSITION}
                            >
                                <Text
                                    fontSize="2xs"
                                    color="text.muted"
                                    fontFamily="monospace"
                                    letterSpacing="0.02em"
                                >
                                    {truncateAddress(game.contract_address)}
                                </Text>
                                <Icon as={FiExternalLink} boxSize="10px" color="text.muted" />
                            </HStack>
                        )}

                        <HStack spacing={1.5} flexWrap="wrap">
                            {/* Frosted status badge */}
                            <Badge
                                bg={
                                    game.is_active
                                        ? 'rgba(54, 163, 123, 0.12)'
                                        : 'rgba(253, 197, 29, 0.12)'
                                }
                                color={
                                    game.is_active
                                        ? 'brand.green'
                                        : 'brand.yellowDark'
                                }
                                _dark={{
                                    bg: game.is_active
                                        ? 'rgba(54, 163, 123, 0.18)'
                                        : 'rgba(253, 197, 29, 0.18)',
                                    color: game.is_active
                                        ? 'brand.green'
                                        : 'brand.yellow',
                                }}
                                borderRadius="full"
                                px={2.5}
                                py={0.5}
                                fontSize="2xs"
                                fontWeight="800"
                                textTransform="uppercase"
                                letterSpacing="0.06em"
                                lineHeight="short"
                                backdropFilter="blur(8px)"
                                border="none"
                            >
                                {statusLabel}
                            </Badge>
                            {game.is_crypto && (
                                <Badge
                                    bg="rgba(59, 130, 246, 0.12)"
                                    color="blue.500"
                                    _dark={{
                                        bg: 'rgba(59, 130, 246, 0.18)',
                                        color: 'blue.300',
                                    }}
                                    borderRadius="full"
                                    px={2.5}
                                    py={0.5}
                                    fontSize="2xs"
                                    fontWeight="800"
                                    textTransform="uppercase"
                                    letterSpacing="0.06em"
                                    lineHeight="short"
                                    backdropFilter="blur(8px)"
                                    border="none"
                                >
                                    Crypto
                                </Badge>
                            )}
                            <GameBadges game={game} />
                        </HStack>
                    </VStack>
                    <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg={statusStyle.dotBg}
                        boxShadow={statusStyle.dotShadow}
                        flexShrink={0}
                        mt={1.5}
                        animation={game.is_active ? `${dotPulse} 2s ease-in-out infinite` : undefined}
                    />
                </Flex>

                {/* Blinds — hero visual centerpiece */}
                <HStack spacing={2} align="baseline">
                    <Text
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="900"
                        color="text.primary"
                        letterSpacing="-0.02em"
                        textShadow="0 1px 4px rgba(0, 0, 0, 0.06)"
                        _dark={{
                            textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        {blindsLabel}
                    </Text>
                    {game.is_crypto && (
                        <Image src={usdcLogoUrl} alt="USDC" boxSize="18px" />
                    )}
                    {!game.is_crypto && (
                        <Text
                            fontSize="2xs"
                            fontWeight="800"
                            textTransform="uppercase"
                            letterSpacing="0.12em"
                            color="text.muted"
                            opacity={0.7}
                        >
                            chips
                        </Text>
                    )}
                </HStack>

                {/* Seats */}
                <VStack align="start" spacing={2}>
                    <SeatIndicator playerCount={game.player_count} maxPlayers={game.max_players} />
                    <HStack spacing={3} fontSize="xs" color="text.secondary">
                        <HStack spacing={1}>
                            <Icon as={FiUsers} boxSize="12px" />
                            <Text fontWeight="700">{game.player_count}/{game.max_players}</Text>
                        </HStack>
                        {game.spectator_count > 0 && (
                            <HStack spacing={1}>
                                <Icon
                                    as={FiEye}
                                    boxSize="11px"
                                    color="text.muted"
                                    animation={`${spectatorGlow} 3s ease-in-out infinite`}
                                />
                                <Text
                                    color="text.muted"
                                    fontWeight="600"
                                >
                                    {game.spectator_count} watching
                                </Text>
                            </HStack>
                        )}
                    </HStack>
                </VStack>

                {/* Footer: time pill + hover chevron */}
                <Flex justify="space-between" align="center" pt={1}>
                    <Box
                        bg="rgba(12, 21, 49, 0.04)"
                        _dark={{
                            bg: 'rgba(255, 255, 255, 0.06)',
                        }}
                        backdropFilter="blur(8px)"
                        borderRadius="full"
                        px={3}
                        py={1}
                    >
                        <Text
                            fontSize="2xs"
                            fontWeight="700"
                            color="text.muted"
                            letterSpacing="0.02em"
                        >
                            {relativeTime}
                        </Text>
                    </Box>

                    <Icon
                        as={FiArrowUpRight}
                        boxSize="18px"
                        color="brand.green"
                        opacity={0}
                        transform="translateX(-4px)"
                        transition={TRANSITION}
                        sx={{
                            '.group:hover &, [role=group]:hover &': {
                                opacity: 1,
                                transform: 'translateX(0)',
                            },
                        }}
                    />
                </Flex>
            </VStack>
        </Box>
    );
}
