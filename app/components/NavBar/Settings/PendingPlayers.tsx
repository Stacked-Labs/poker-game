import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { PendingPlayer } from '@/app/interfaces';
import { Text, VStack } from '@chakra-ui/react';
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

    if (pendingPlayers && pendingPlayers.length > 0) {
        return (
            <VStack align="stretch" gap={{ base: 2.5, md: 4 }} w="100%">
                <Text
                    color={'text.secondary'}
                    fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                    fontWeight="bold"
                    mb={{ base: 1, md: 2 }}
                    letterSpacing="-0.02em"
                >
                    Pending Players
                </Text>
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
};

export default PendingPlayers;
