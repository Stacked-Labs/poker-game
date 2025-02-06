'use client';

import { useEffect, useState } from 'react';
import {
    isTableExisting,
    joinTable,
    newPlayer,
    sendLog,
} from '@/app/hooks/server_actions';
import Table from '@/app/components/Table';
import { useContext } from 'react';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Player } from '@/app/interfaces';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import useToastHelper from '@/app/hooks/useToastHelper';

const initialPlayers: (Player | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
];

const MainGamePage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const toast = useToastHelper();
    const socket = useContext(SocketContext);
    const { dispatch } = useContext(AppContext);
    const [players, setPlayers] = useState(initialPlayers);
    const [tableStatus, setTableStatus] = useState<'checking' | 'success'>(
        'checking'
    );
    const tableId = params.id;

    useEffect(() => {
        const verifyAndJoinTable = async () => {
            if (socket && tableId) {
                try {
                    const result = await isTableExisting(tableId);
                    if (result.status === 'success') {
                        joinTable(socket, tableId);
                        newPlayer(socket, '');
                        dispatch({ type: 'setTablename', payload: tableId });
                        sendLog(socket, `Joined table ${tableId}`);
                        setTableStatus('success');
                    } else {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 5000)
                        );
                        router.push('/create-game');
                    }
                } catch (error) {
                    console.error('Error checking table existence:', error);
                    toast.error('Table does not exist.');
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    router.push('/create-game');
                }
            }
        };

        verifyAndJoinTable();
    }, [socket, tableId, dispatch, router]);

    return (
        <>
            <Box
                background={'rgba(7, 7, 7, 0.55)'}
                width={'100vw'}
                height={'100vh'}
                position={'fixed'}
                zIndex={999}
                hidden={tableStatus !== 'checking'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Spinner size="xl" color="grey" borderWidth={'0.3rem'} />
            </Box>
            <Box />
            <Flex flex={1} justifyContent={'center'} position={'relative'}>
                <Table players={players} setPlayers={setPlayers} />
            </Flex>
        </>
    );
};

export default MainGamePage;
