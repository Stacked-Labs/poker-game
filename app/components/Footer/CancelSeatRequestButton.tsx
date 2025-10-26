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
            Cancel Request ({appState.seatRequested})
        </Button>
    );
};

export default CancelSeatRequestButton;
