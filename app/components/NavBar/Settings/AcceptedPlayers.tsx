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
    VStack,
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
                <VStack align="stretch" gap={4} w="100%">
                    <Text
                        color={'brand.navy'}
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="bold"
                        mb={2}
                        letterSpacing="-0.02em"
                    >
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
                </VStack>

                {/* Confirmation Modal */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay
                        bg="rgba(11, 20, 48, 0.8)"
                        backdropFilter="blur(8px)"
                    />
                    <ModalContent
                        bg="white"
                        color="brand.navy"
                        borderRadius="24px"
                        borderWidth="2px"
                        borderColor="brand.lightGray"
                        boxShadow="0 20px 60px rgba(0, 0, 0, 0.2)"
                        mx={4}
                        maxW="420px"
                    >
                        <ModalHeader
                            borderBottomWidth="2px"
                            borderColor="brand.lightGray"
                            fontSize="2xl"
                            fontWeight="bold"
                            letterSpacing="-0.02em"
                            pt={6}
                        >
                            Confirm Player Kick
                        </ModalHeader>
                        <ModalCloseButton
                            color="brand.navy"
                            size="lg"
                            top="20px"
                            right="20px"
                            borderRadius="full"
                            _hover={{
                                bg: 'brand.lightGray',
                                transform: 'rotate(90deg)',
                            }}
                            transition="all 0.3s ease"
                        />
                        <ModalBody py={6}>
                            <Text fontSize="md" fontWeight="medium">
                                Are you sure you want to kick player{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="brand.pink"
                                >
                                    {selectedPlayer?.name}
                                </Text>
                                ?
                            </Text>
                            <Text mt={4} fontSize="sm" color="gray.600">
                                This action cannot be undone. The player will
                                need to rejoin the game.
                            </Text>
                        </ModalBody>
                        <ModalFooter
                            justifyContent="space-between"
                            borderTopWidth="2px"
                            borderColor="brand.lightGray"
                            py={5}
                            gap={3}
                        >
                            <Button
                                onClick={onClose}
                                size="md"
                                height="52px"
                                flex={1}
                                bg="brand.lightGray"
                                color="brand.navy"
                                border="none"
                                borderRadius="12px"
                                fontWeight="bold"
                                _hover={{
                                    bg: 'gray.300',
                                    transform: 'translateY(-2px)',
                                }}
                                transition="all 0.2s ease"
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="brand.pink"
                                color="white"
                                onClick={handleConfirmKick}
                                leftIcon={<GiBootKick size={22} />}
                                size="md"
                                height="52px"
                                flex={1}
                                borderRadius="12px"
                                border="none"
                                fontWeight="bold"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 12px 24px rgba(235, 11, 92, 0.3)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s ease"
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
