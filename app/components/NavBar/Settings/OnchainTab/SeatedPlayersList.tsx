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
    const count = players?.length ?? null;
    return (
        <SectionCard
            icon={FiUsers}
            title={count !== null ? `Seated · ${count}` : 'Seated'}
            subtitle="From the contract — not the game server."
            accent="green"
        >
            {players === null ? (
                <Text fontSize="xs" color="text.muted">
                    Reading from contract…
                </Text>
            ) : players.length === 0 ? (
                <Text fontSize="xs" color="text.muted">
                    No players seated onchain yet.
                </Text>
            ) : (
                <Flex direction="column" gap={1.5}>
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
    const settling = player.withdrawable;
    return (
        <Flex
            align="center"
            justify="space-between"
            gap={2}
            bg="card.lightGray"
            borderRadius="10px"
            px={{ base: 2, md: 2.5 }}
            py={2}
            border="1px solid transparent"
            _hover={{ borderColor: 'border.lightGray' }}
        >
            <HStack spacing={1.5} minW={0} flex={1}>
                <AddressChip
                    address={player.address}
                    explorerUrl={explorerUrl}
                    showCopy={false}
                />
                {settling && (
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                        color="brand.green"
                        _dark={{ color: 'brand.green' }}
                    >
                        Withdrawable
                    </Text>
                )}
            </HStack>
            <HStack spacing={{ base: 2.5, md: 3 }} align="baseline" flexShrink={0}>
                <Stat label="Chips" value={formatChips(player.chips)} />
                <Stat
                    label="In"
                    value={
                        <>
                            ${formatUsdc(player.usdcDeposited)}
                            <Image
                                src="/usdc-logo.png"
                                alt="USDC"
                                boxSize="9px"
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
        <Text fontSize="xs" fontWeight="bold" color="text.secondary" lineHeight="1.1">
            {value}
        </Text>
    </Box>
);

export default SeatedPlayersList;
