'use client';

import Link from 'next/link';
import {
    Box,
    HStack,
    Icon,
    Image,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiExternalLink, FiEye, FiUsers } from 'react-icons/fi';
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

export default function PublicGameCard({ game, ruleColor, isLast }: PublicGameCardProps) {
    const rowHover = useColorModeValue('rgba(11, 20, 48, 0.025)', 'rgba(255, 255, 255, 0.03)');
    const relTime = useRelativeTime(game.created_at);
    const hot = isHot(game);

    return (
        <HStack
            as={Link}
            href={`/table/${game.name}`}
            px={{ base: 4, md: 6 }}
            py={{ base: 3, md: 3.5 }}
            spacing={4}
            borderBottom={isLast ? 'none' : '1px solid'}
            borderColor={ruleColor}
            cursor="pointer"
            textDecoration="none"
            _hover={{ bg: rowHover, textDecoration: 'none' }}
            transition="background 0.12s ease"
            role="group"
        >
            <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={game.is_active ? 'brand.green' : 'brand.yellow'}
                animation={game.is_active ? `${dotPulse} 2s ease-in-out infinite` : undefined}
                flexShrink={0}
            />

            <VStack align="start" spacing={0} flex="2.2" minW={0}>
                <HStack spacing={2}>
                    <Text fontWeight="semibold" color="text.primary" noOfLines={1}>
                        {game.name}
                    </Text>
                    <MarketTag game={game} />
                    <ContractLink game={game} />
                </HStack>
                <Text fontSize="2xs" color="text.muted">
                    {game.is_crypto ? 'Base' : 'Play money'}
                    {' · '}
                    {game.is_active ? 'Running' : 'Open'}
                    {hot && ' · Hot'}
                </Text>
                {/* Mobile-only inline data */}
                <HStack
                    display={{ base: 'flex', md: 'none' }}
                    spacing={2}
                    color="text.secondary"
                    fontSize="xs"
                    pt={1}
                >
                    <Text fontWeight="semibold">
                        {game.player_count}/{game.max_players} seats
                    </Text>
                    {game.spectator_count > 0 && (
                        <>
                            <Text color="text.muted">·</Text>
                            <HStack spacing={1} color="text.muted">
                                <Icon as={FiEye} boxSize="11px" />
                                <Text>{game.spectator_count}</Text>
                            </HStack>
                        </>
                    )}
                    <Text color="text.muted">·</Text>
                    <Text color="text.muted">{relTime}</Text>
                </HStack>
            </VStack>

            <BlindsCell game={game} />

            <HStack flex="1.2" spacing={3} display={{ base: 'none', md: 'flex' }}>
                <SeatDots taken={game.player_count} total={game.max_players} />
                <HStack spacing={1} color="text.secondary" fontSize="xs">
                    <Icon as={FiUsers} boxSize="11px" />
                    <Text fontWeight="semibold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {game.player_count}/{game.max_players}
                    </Text>
                </HStack>
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
                _hover={{ color: USDC_BLUE, bg: 'rgba(39, 117, 202, 0.1)' }}
                transition="all 0.15s ease"
            >
                <Icon as={FiExternalLink} boxSize="11px" />
            </Box>
        </Tooltip>
    );
}

function BlindsCell({ game }: { game: PublicGame }) {
    return (
        <HStack flex="1" justify="flex-end" spacing={1.5}>
            {game.is_crypto && (
                <Image src={USDC_LOGO} alt="USDC" boxSize="14px" />
            )}
            <Text
                fontWeight="bold"
                fontSize="sm"
                letterSpacing="-0.01em"
                color={game.is_crypto ? USDC_BLUE : 'text.primary'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {blindsLabel(game)}
            </Text>
        </HStack>
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
                <Text fontWeight="semibold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {count}
                </Text>
            </HStack>
        </Tooltip>
    );
}

function SeatDots({ taken, total }: { taken: number; total: number }) {
    const emptyBorder = useColorModeValue('rgba(11, 20, 48, 0.18)', 'rgba(255, 255, 255, 0.22)');
    return (
        <HStack spacing="3px">
            {Array.from({ length: total }).map((_, i) => (
                <Box
                    key={i}
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={i < taken ? 'brand.green' : 'transparent'}
                    border={i < taken ? 'none' : '1px solid'}
                    borderColor={emptyBorder}
                />
            ))}
        </HStack>
    );
}
