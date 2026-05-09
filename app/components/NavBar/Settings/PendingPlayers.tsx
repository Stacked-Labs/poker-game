import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { PendingPlayer } from '@/app/interfaces';
import { Flex, Text, VStack } from '@chakra-ui/react';
import React from 'react';

import PlayerCard from './PlayerCard';

interface Props {
    pendingPlayers: PendingPlayer[];
    handleAcceptPlayer: (uuid: string) => void;
    handleDenyPlayer: (uuid: string) => void;
}

const PendingPlayers = ({
    pendingPlayers,
    handleAcceptPlayer,
    handleDenyPlayer,
}: Props) => {
    const isOwner = useIsTableOwner();
    const hasPending = pendingPlayers && pendingPlayers.length > 0;

    if (hasPending) {
        return (
            <VStack align="stretch" gap={{ base: 2.5, md: 4 }} w="100%">
                {pendingPlayers.map((player: PendingPlayer, index: number) => {
                    if (player) {
                        return (
                            <PlayerCard
                                key={player.uuid}
                                index={index}
                                player={player}
                                isOwner={isOwner}
                                type={'pending'}
                                isKicking={null}
                                handleAcceptPlayer={handleAcceptPlayer}
                                handleDenyPlayer={handleDenyPlayer}
                                confirmKick={null}
                            />
                        );
                    }
                })}
            </VStack>
        );
    }

    // Empty state — only shown to owners (non-owners have no agency over
    // pending requests, so the panel would just be noise).
    if (!isOwner) return null;

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={5}
            px={4}
            bg="card.lightGray"
            borderRadius="16px"
            border="1px dashed"
            borderColor="border.lightGray"
            gap={1.5}
            w="100%"
        >
            <Text fontWeight="bold" fontSize="sm" color="text.secondary">
                No pending requests
            </Text>
            <Text fontSize="xs" color="text.muted" textAlign="center">
                When someone asks to join the table, they&apos;ll appear here for
                you to accept or deny.
            </Text>
        </Flex>
    );
};

export default PendingPlayers;
