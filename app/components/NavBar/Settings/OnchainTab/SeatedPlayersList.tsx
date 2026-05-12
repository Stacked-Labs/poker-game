'use client';

import { Box, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import SectionCard from './SectionCard';
import AddressChip from './AddressChip';
import { formatChips, formatUsdc } from './formatters';
import type { OnchainPlayer } from '@/app/hooks/useOnchainTableSnapshot';

interface SeatedPlayersListProps {
    players: OnchainPlayer[] | null;
    explorerFor: (addr: string) => string | null;
}

const SeatedPlayersList = ({ players, explorerFor }: SeatedPlayersListProps) => {
    return (
        <SectionCard
            icon={FiUsers}
            title="Seated players (onchain)"
            subtitle="Sourced from the contract's player list — not the game server."
            accent="green"
        >
            {players === null ? (
                <Text fontSize="xs" color="text.muted">
                    Reading from contract…
                </Text>
            ) : players.length === 0 ? (
                <Text fontSize="xs" color="text.muted">
                    No players seated onchain. Chips will appear here as soon as someone buys in.
                </Text>
            ) : (
                <Flex direction="column" gap={2}>
                    {players.map((player) => (
                        <PlayerRow
                            key={player.address}
                            player={player}
                            explorerUrl={explorerFor(player.address)}
                        />
                    ))}
                </Flex>
            )}
        </SectionCard>
    );
};

const PlayerRow = ({
    player,
    explorerUrl,
}: {
    player: OnchainPlayer;
    explorerUrl: string | null;
}) => {
    const settling = !player.withdrawable && player.seated;
    return (
        <Flex
            align="center"
            justify="space-between"
            gap={3}
            bg="card.lightGray"
            borderRadius="10px"
            px={{ base: 2.5, md: 3 }}
            py={{ base: 2, md: 2.5 }}
            border="1px solid transparent"
            _hover={{ borderColor: 'border.lightGray' }}
        >
            <HStack spacing={2.5} minW={0} flex={1}>
                <AddressChip
                    address={player.address}
                    explorerUrl={explorerUrl}
                    showCopy={false}
                />
                {settling && (
                    <Text
                        fontSize="2xs"
                        color="orange.500"
                        _dark={{ color: 'orange.300' }}
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        Settling
                    </Text>
                )}
            </HStack>
            <HStack
                spacing={{ base: 3, md: 5 }}
                align="baseline"
                flexShrink={0}
            >
                <Stat label="Chips" value={formatChips(player.chips)} />
                <Stat
                    label="Deposited"
                    value={
                        <>
                            ${formatUsdc(player.usdcDeposited)}
                            <Image
                                src="/usdc-logo.png"
                                alt="USDC"
                                boxSize="10px"
                                display="inline-block"
                                ml={1}
                                mb="-1px"
                            />
                        </>
                    }
                />
            </HStack>
        </Flex>
    );
};

const Stat = ({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) => (
    <Box textAlign="right" minW={0}>
        <Text
            fontSize="2xs"
            color="text.muted"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.04em"
        >
            {label}
        </Text>
        <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            fontWeight="bold"
            color="text.secondary"
            lineHeight="1.1"
        >
            {value}
        </Text>
    </Box>
);

export default SeatedPlayersList;
