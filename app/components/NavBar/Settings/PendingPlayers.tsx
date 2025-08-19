import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { PendingPlayer } from '@/app/interfaces';
import { Text } from '@chakra-ui/react';
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
            <>
                <Text color={'white'} fontSize="lg" fontWeight="bold" mb={4}>
                    Pending
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
            </>
        );
    }
};

export default PendingPlayers;
