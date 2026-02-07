'use client';

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { cancelSeatRequest } from '@/app/hooks/server_actions';
import { Button, Flex, Text, Spinner } from '@chakra-ui/react';
import { useContext } from 'react';
import { keyframes } from '@emotion/react';
import { FaCheck } from 'react-icons/fa';

const subtlePulse = keyframes`
    0%, 100% { box-shadow: 0 4px 12px rgba(54, 163, 123, 0.3); }
    50% { box-shadow: 0 4px 20px rgba(54, 163, 123, 0.5); }
`;

const SeatRequestStatusBadge = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    // Accepted state takes priority - show success badge
    if (appState.seatAccepted) {
        return (
            <Flex
                position="fixed"
                bottom="2"
                right="2"
                bg="brand.green"
                color="white"
                width="fit-content"
                alignSelf="end"
                alignItems="center"
                gap={2}
                m={4}
                px={4}
                py={2}
                zIndex={10}
                border="2px solid"
                borderColor="brand.green"
                borderRadius="10px"
                fontWeight="bold"
                animation={`${subtlePulse} 2s ease-in-out infinite`}
            >
                <FaCheck />
                <Text textTransform="uppercase" fontSize="sm">
                    Joining Next Hand
                </Text>
                <Text opacity={0.9} fontSize="sm">
                    (Seat {appState.seatAccepted.seatId + 1})
                </Text>
                {appState.seatAccepted.queued && (
                    <Spinner size="sm" ml={1} />
                )}
            </Flex>
        );
    }

    // Pending state - show cancel button
    if (!socket || !appState.clientID || appState.seatRequested === null) {
        return null;
    }

    return (
        <Button
            position="fixed"
            bottom="2"
            right="2"
            bg="brand.pink"
            color="white"
            width="fit-content"
            alignSelf="end"
            m={4}
            zIndex={10}
            border="2px solid"
            borderColor="brand.pink"
            borderRadius="10px"
            fontWeight="bold"
            textTransform="uppercase"
            _hover={{
                bg: '#c9094c', // darker pink
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
            }}
            _active={{
                transform: 'translateY(0px)',
            }}
            transition="all 0.2s"
            onClick={() => {
                cancelSeatRequest(socket);
            }}
        >
            Cancel Request ({appState.seatRequested + 1})
        </Button>
    );
};

export default SeatRequestStatusBadge;
