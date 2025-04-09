import { Player } from '@/app/interfaces';
import {
    Flex,
    Box,
    Button,
    Text,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Tooltip,
    ModalCloseButton,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { GiBootKick } from 'react-icons/gi';
import useToastHelper from '@/app/hooks/useToastHelper';

interface Props {
    acceptedPlayers: Player[] | undefined;
    handleKickPlayer: (uuid: string, seatId: number) => void;
    isOwner: boolean;
}

const AcceptedPlayers = ({
    acceptedPlayers,
    handleKickPlayer,
    isOwner,
}: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPlayer, setSelectedPlayer] = useState<{
        uuid: string;
        seatId: number;
        name?: string;
    } | null>(null);
    const [kickingInProgress, setKickingInProgress] = useState<string | null>(
        null
    );
    const toast = useToastHelper();

    const confirmKick = (player: Player) => {
        if (!isOwner) {
            toast.error(
                'Unable to kick player',
                'Only table owner can kick a player.'
            );
            return;
        }
        setSelectedPlayer({
            uuid: player.uuid,
            seatId: player.seatID,
            name: player.username || player.uuid.substring(0, 8),
        });
        onOpen();
    };

    const handleConfirmKick = () => {
        if (selectedPlayer) {
            setKickingInProgress(selectedPlayer.uuid);
            handleKickPlayer(selectedPlayer.uuid, selectedPlayer.seatId);

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

                        return (
                            <Flex
                                key={index}
                                alignItems={'center'}
                                gap={{ base: 0, lg: 10 }}
                                width={{ base: '90vw', md: '70%' }}
                                borderColor={'grey'}
                                borderWidth={2}
                                borderRadius={10}
                                paddingX={{ base: 5, md: 10 }}
                                paddingY={{ base: 2, md: 5 }}
                                direction={{
                                    base: 'column',
                                    lg: 'row',
                                }}
                                mb={4}
                                bg={
                                    isKicking
                                        ? 'rgba(255, 0, 0, 0.1)'
                                        : 'transparent'
                                }
                                transition="background-color 0.3s"
                            >
                                <Flex
                                    flex={3}
                                    justifyContent={'space-around'}
                                    alignItems={'center'}
                                    textAlign={'left'}
                                    gap={40}
                                >
                                    <Flex
                                        gap={{ base: 2, xl: 5 }}
                                        flex={2}
                                        direction={{
                                            base: 'column',
                                            xl: 'row',
                                        }}
                                    >
                                        <Flex
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                            gap={{ base: 2, xl: 5 }}
                                        >
                                            <Flex
                                                gap={{ base: 2, xl: 5 }}
                                                direction={{
                                                    base: 'column',
                                                    xl: 'row',
                                                }}
                                            >
                                                <Box
                                                    bgColor={'charcoal.600'}
                                                    paddingY={1}
                                                    paddingX={2}
                                                    borderRadius={10}
                                                >
                                                    <Text
                                                        fontSize={'small'}
                                                        color={'white'}
                                                    >
                                                        ID:{' '}
                                                        {player.uuid.substring(
                                                            0,
                                                            8
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Text color={'white'}>
                                                Total buy-in:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.totalBuyIn}
                                                </Text>
                                            </Text>
                                        </Flex>
                                        <Flex
                                            gap={4}
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                        >
                                            <Text color={'white'}>
                                                Seat:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.seatID}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>

                                <Flex
                                    gap={{ base: 5, lg: 10 }}
                                    py={{ base: 5, lg: 0 }}
                                    width={{ base: '100%', lg: '25%' }}
                                    justifyContent={{
                                        base: 'center',
                                        lg: 'flex-end',
                                    }}
                                >
                                    <Tooltip
                                        label="Kick Player"
                                        placement="top"
                                    >
                                        <Button
                                            variant={'settingsSmallButton'}
                                            bg={'red.500'}
                                            _hover={{ background: 'red.600' }}
                                            onClick={() => confirmKick(player)}
                                            isLoading={isKicking}
                                            loadingText="Kicking..."
                                            width={{ base: '100%', lg: 'auto' }}
                                            color="white"
                                            rightIcon={<GiBootKick size={20} />}
                                            px={4}
                                        >
                                            Kick
                                        </Button>
                                    </Tooltip>
                                </Flex>
                            </Flex>
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
