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
    currentUserUuid: string | null;
    settlementStuck?: boolean;
}

const AcceptedPlayers = ({ acceptedPlayers, handleKickPlayer, currentUserUuid, settlementStuck }: Props) => {
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
        // Sort so current user is always first
        const sortedPlayers = [...acceptedPlayers].sort((a, b) => {
            if (a.uuid === currentUserUuid) return -1;
            if (b.uuid === currentUserUuid) return 1;
            return 0;
        });

        return (
            <>
                <VStack align="stretch" gap={{ base: 2.5, md: 4 }} w="100%">
                    {sortedPlayers.map((player: Player, index: number) => {
                        if (player) {
                            const isKicking = kickingInProgress === player.uuid;

                            const formattedPlayer: PendingPlayer = {
                                uuid: player.uuid,
                                username: player.username,
                                seatId: player.seatID,
                                buyIn: player.totalBuyIn,
                                profileImageUrl: player.profileImageUrl,
                                address: player.address,
                            };

                            return (
                                <PlayerCard
                                    key={player.uuid}
                                    index={index}
                                    player={formattedPlayer}
                                    isOwner={isOwner}
                                    isCurrentUser={player.uuid === currentUserUuid}
                                    type={'accepted'}
                                    isKicking={isKicking}
                                    settlementStuck={settlementStuck}
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
                        bg="card.white"
                        color="text.secondary"
                        borderRadius="24px"
                        borderWidth="2px"
                        borderColor="border.lightGray"
                        boxShadow="0 20px 60px rgba(0, 0, 0, 0.2)"
                        mx={4}
                        maxW="420px"
                    >
                        <ModalHeader
                            borderBottomWidth="2px"
                            borderColor="border.lightGray"
                            fontSize="2xl"
                            fontWeight="bold"
                            letterSpacing="-0.02em"
                            pt={6}
                        >
                            Confirm Player Kick
                        </ModalHeader>
                        <ModalCloseButton
                            color="text.secondary"
                            size="lg"
                            top="20px"
                            right="20px"
                            borderRadius="full"
                            _hover={{
                                bg: 'brand.lightGray',
                            }}
                            _active={{
                                transform: 'translateY(1px)',
                            }}
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 80ms ease"
                        />
                        <ModalBody py={6}>
                            <Text
                                fontSize="md"
                                fontWeight="medium"
                                color="text.primary"
                            >
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
                            <Text mt={4} fontSize="sm" color="text.gray600">
                                This action cannot be undone. The player will
                                need to rejoin the game.
                            </Text>
                        </ModalBody>
                        <ModalFooter
                            justifyContent="space-between"
                            borderTopWidth="2px"
                            borderColor="border.lightGray"
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
                                boxShadow="inset 0 1px 0 rgba(255,255,255,0.50), 0 2px 0 rgba(0,0,0,0.10)"
                                _hover={{
                                    bg: 'gray.300',
                                }}
                                _active={{
                                    bg: 'gray.300',
                                    transform: 'translateY(2px)',
                                    boxShadow:
                                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 rgba(0,0,0,0.10)',
                                }}
                                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            >
                                Cancel
                            </Button>
                            <Button
                                data-testid="confirm-kick-btn"
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
                                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #950839"
                                _hover={{
                                    bg: 'brand.pink',
                                }}
                                _active={{
                                    bg: 'brand.pinkDark',
                                    transform: 'translateY(2px)',
                                    boxShadow:
                                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                                }}
                                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
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
