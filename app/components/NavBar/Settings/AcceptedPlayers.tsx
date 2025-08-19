import { PendingPlayer, Player } from '@/app/interfaces';
import {
    Text,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { GiBootKick } from 'react-icons/gi';

import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import PlayerCard from './PlayerCard';

interface Props {
    acceptedPlayers: Player[] | undefined;
    handleKickPlayer: (uuid: string) => void;
}

const AcceptedPlayers = ({ acceptedPlayers, handleKickPlayer }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPlayer, setSelectedPlayer] = useState<{
        uuid: string;
        name?: string;
    } | null>(null);
    const [kickingInProgress, setKickingInProgress] = useState<string | null>(
        null
    );

    const isOwner = useIsTableOwner();

    const confirmKick = (player: PendingPlayer) => {
        setSelectedPlayer({
            uuid: player.uuid,
            name: player.username || player.uuid.substring(0, 8),
        });
        onOpen();
    };

    const handleConfirmKick = () => {
        if (selectedPlayer) {
            setKickingInProgress(selectedPlayer.uuid);
            handleKickPlayer(selectedPlayer.uuid);

            // Reset kicking state after a delay to show visual feedback
            setTimeout(() => {
                setKickingInProgress(null);
                onClose();
            }, 500);
        }
    };

    if (acceptedPlayers && acceptedPlayers.length > 0) {
        return (
            <>
                <Text color={'white'} fontSize="lg" fontWeight="bold" mb={4}>
                    Accepted Players
                </Text>
                {acceptedPlayers.map((player: Player, index: number) => {
                    if (player) {
                        const isKicking = kickingInProgress === player.uuid;

                        const formattedPlayer: PendingPlayer = {
                            uuid: player.uuid,
                            username: player.username,
                            seatId: player.seatID,
                            buyIn: player.totalBuyIn,
                        };

                        return (
                            <PlayerCard
                                key={player.uuid}
                                index={index}
                                player={formattedPlayer}
                                isOwner={isOwner}
                                type={'accepted'}
                                isKicking={isKicking}
                                handleAcceptPlayer={null}
                                handleDenyPlayer={null}
                                confirmKick={confirmKick}
                            />
                        );
                    }
                })}

                {/* Confirmation Modal */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay backdropFilter="blur(5px)" />
                    <ModalContent
                        bg="gray.900"
                        color="white"
                        borderRadius={10}
                        borderWidth="1px"
                        borderColor="gray.900"
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
                        mx={4}
                    >
                        <ModalHeader
                            borderBottomWidth="1px"
                            borderColor="gray.800"
                        >
                            Confirm Player Kick
                        </ModalHeader>
                        <ModalCloseButton color="white" size="lg" top="12px" />
                        <ModalBody py={6}>
                            <Text fontSize="md">
                                Are you sure you want to kick player{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="red.300"
                                >
                                    {selectedPlayer?.name}
                                </Text>
                                ?
                            </Text>
                            <Text mt={4} fontSize="sm" color="gray.400">
                                This action cannot be undone. The player will
                                need to rejoin the game.
                            </Text>
                        </ModalBody>
                        <ModalFooter
                            justifyContent="space-between"
                            borderTopWidth="1px"
                            borderColor="gray.800"
                            py={4}
                        >
                            <Button
                                variant="outline"
                                onClick={onClose}
                                size="md"
                                height="48px"
                                _hover={{
                                    bg: 'transparent',
                                    borderColor: 'gray.400',
                                }}
                                color="white"
                                borderColor="gray.600"
                                width="130px"
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="red.500"
                                _hover={{ bg: 'red.600' }}
                                _active={{ bg: 'red.700' }}
                                color="white"
                                onClick={handleConfirmKick}
                                leftIcon={<GiBootKick size={22} />}
                                size="md"
                                height="48px"
                                width="130px"
                                fontWeight="bold"
                            >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        );
    }

    return null;
};

export default AcceptedPlayers;
