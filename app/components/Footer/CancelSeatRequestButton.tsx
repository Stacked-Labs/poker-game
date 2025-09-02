'use client';

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { cancelSeatRequest } from '@/app/hooks/server_actions';
import { Button } from '@chakra-ui/react';
import { useContext } from 'react';

const CancelSeatRequestButton = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    if (!socket || !appState.clientID || appState.seatRequested === null) {
        return null;
    }

    return (
        <Button
            position="fixed"
            bottom="2"
            right="2"
            bg="red.400"
            width="fit-content"
            alignSelf="end"
            m={4}
            onClick={() => {
                cancelSeatRequest(socket);
            }}
        >
            Cancel Request ({appState.seatRequested})
        </Button>
    );
};

export default CancelSeatRequestButton;
