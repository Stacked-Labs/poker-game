'use client';

import {
    Badge,
    Box,
    Button,
    CloseButton,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    Stack,
    Text,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { acceptPlayer, denyPlayer } from '@/app/hooks/server_actions';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import useToastHelper from '@/app/hooks/useToastHelper';
import { PendingPlayer } from '@/app/interfaces';

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const SeatRequestPopup = () => {
    const { appState } = useContext(AppContext);
    const isOwner = useIsTableOwner();
    const socket = useContext(SocketContext);
    const toast = useToastHelper();
    const pendingPlayers = appState.pendingPlayers || [];
    const showPopups = appState.showSeatRequestPopups;
    const isSettingsOpen = appState.isSettingsOpen;
    const [queue, setQueue] = useState<PendingPlayer[]>([]);
    const prevPendingRef = useRef<string[]>([]);
    const dismissedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const currentIds = pendingPlayers.map((player) => player.uuid);

        dismissedRef.current.forEach((id) => {
            if (!currentIds.includes(id)) {
                dismissedRef.current.delete(id);
            }
        });

        if (!isOwner || !showPopups) {
            dismissedRef.current.clear();
            setQueue([]);
            prevPendingRef.current = [];
            return;
        }

        const prevIds = prevPendingRef.current;
        const newPlayers = pendingPlayers.filter(
            (player) =>
                !prevIds.includes(player.uuid) &&
                !dismissedRef.current.has(player.uuid)
        );
        prevPendingRef.current = currentIds;

        setQueue((prev) => {
            const filtered = prev.filter((player) =>
                currentIds.includes(player.uuid)
            );
            const existing = new Set(filtered.map((player) => player.uuid));
            const additions = newPlayers.filter(
                (player) => !existing.has(player.uuid)
            );
            return additions.length ? [...filtered, ...additions] : filtered;
        });
    }, [pendingPlayers, isOwner, showPopups]);

    const currentRequest = queue[0];
    const isOpen =
        Boolean(currentRequest) && isOwner && showPopups && !isSettingsOpen;

    const handleDismiss = () => {
        if (!currentRequest) return;
        dismissedRef.current.add(currentRequest.uuid);
        setQueue((prev) =>
            prev.filter((player) => player.uuid !== currentRequest.uuid)
        );
    };

    const handleAccept = () => {
        if (!currentRequest || !socket) {
            toast.error('Unable to accept player', 'Please try again');
            return;
        }
        const playerIdentifier =
            currentRequest.username || currentRequest.uuid.substring(0, 8);
        acceptPlayer(socket, currentRequest.uuid);
        toast.success(
            `Player ${playerIdentifier} accepted`,
            'Player will now be seated at the table',
            3000
        );
        handleDismiss();
    };

    const handleDeny = () => {
        if (!currentRequest || !socket) {
            toast.error('Unable to deny player request', 'Please try again');
            return;
        }
        const playerIdentifier =
            currentRequest.username || currentRequest.uuid.substring(0, 8);
        denyPlayer(socket, currentRequest.uuid);
        toast.info(
            `Player ${playerIdentifier} request denied`,
            'Player has been removed from the queue',
            3000
        );
        handleDismiss();
    };

    if (!currentRequest) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleDismiss}
            isCentered
            size="xs"
            closeOnOverlayClick
        >
            <ModalOverlay bg="blackAlpha.300" />
            <ModalContent
                bg="card.white"
                borderRadius="18px"
                overflow="hidden"
                boxShadow="0 16px 40px rgba(0, 0, 0, 0.22)"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                maxW="360px"
                mx={{ base: 3, md: 0 }}
                animation={`${fadeIn} 0.25s ease-out`}
            >
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    px={4}
                    py={2}
                    bg="card.lightGray"
                    borderBottom="1px solid"
                    borderColor="rgba(0, 0, 0, 0.08)"
                >
                    <Flex alignItems="center" gap={2}>
                        <Box
                            height={2}
                            width={2}
                            bg="brand.green"
                            borderRadius="full"
                            boxShadow="0 0 6px rgba(54, 163, 123, 0.6)"
                        />
                        <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color="text.secondary"
                            letterSpacing="-0.02em"
                        >
                            Seat Request
                        </Text>
                        {queue.length > 1 ? (
                            <Badge
                                bg="card.white"
                                color="text.secondary"
                                fontSize="2xs"
                                borderRadius="full"
                                px={2}
                                py={0.5}
                            >
                                Queue {queue.length}
                            </Badge>
                        ) : null}
                    </Flex>
                    <CloseButton
                        onClick={handleDismiss}
                        color="text.secondary"
                        borderRadius="8px"
                        size="sm"
                        _hover={{ bg: 'rgba(51, 68, 121, 0.1)' }}
                    />
                </Flex>

                <Stack px={4} py={3} gap={2}>
                    <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        gap={3}
                        w="100%"
                    >
                        <Stack gap={1} flex={1} minW={0}>
                            <Flex alignItems="center" gap={2} minW={0}>
                                <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color="text.secondary"
                                    noOfLines={1}
                                    maxW="120px"
                                >
                                    {currentRequest.username ||
                                        currentRequest.uuid.substring(0, 8)}
                                </Text>
                                <Badge
                                    bg="card.lightGray"
                                    color="brand.navy"
                                    fontSize="2xs"
                                    borderRadius="5px"
                                    px={1.5}
                                    py={0.25}
                                >
                                    Seat #{currentRequest.seatId}
                                </Badge>
                            </Flex>
                            <Flex gap={1} flexWrap="wrap" alignItems="center">
                                <Badge
                                    bg="card.lightGray"
                                    color="brand.green"
                                    fontSize="2xs"
                                    borderRadius="5px"
                                    px={1.5}
                                    py={0.25}
                                >
                                    Buy-in ${currentRequest.buyIn}
                                </Badge>
                                <Badge
                                    bg="card.lightGray"
                                    color="text.secondary"
                                    fontSize="2xs"
                                    borderRadius="5px"
                                    px={1.5}
                                    py={0.25}
                                >
                                    ID {currentRequest.uuid.substring(0, 8)}
                                </Badge>
                            </Flex>
                        </Stack>
                        <Flex
                            gap={1}
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                        >
                            <Button
                                size="sm"
                                bg="brand.green"
                                color="white"
                                minW="42px"
                                h="42px"
                                borderRadius="12px"
                                _hover={{
                                    bg: 'brand.green',
                                    transform: 'translateY(-1px)',
                                    boxShadow:
                                        '0 6px 12px rgba(54, 163, 123, 0.26)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={handleAccept}
                            >
                                <FaCircleCheck size={18} />
                            </Button>
                            <Button
                                size="sm"
                                bg="brand.pink"
                                color="white"
                                minW="42px"
                                h="42px"
                                borderRadius="12px"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-1px)',
                                    boxShadow:
                                        '0 6px 12px rgba(235, 11, 92, 0.26)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={handleDeny}
                            >
                                <FaCircleXmark size={18} />
                            </Button>
                        </Flex>
                    </Flex>
                </Stack>
            </ModalContent>
        </Modal>
    );
};

export default SeatRequestPopup;
