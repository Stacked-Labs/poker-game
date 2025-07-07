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
import {
    Box,
    Flex,
    Spinner,
    Text,
    VStack,
    Heading,
    Center,
    useStyleConfig,
} from '@chakra-ui/react';
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
    const { appState, dispatch } = useContext(AppContext);
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
                className="loading-overlay"
                background={'gray.200'}
                width={'100vw'}
                height={'var(--full-vh)'}
                position={'fixed'}
                zIndex={999}
                hidden={tableStatus !== 'checking'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <VStack spacing={4}>
                    <Spinner
                        size="xl"
                        color="red"
                        thickness="4px"
                        speed="0.8s"
                    />
                    <Text color="white" fontSize="lg" fontWeight="bold">
                        Connecting to game...
                    </Text>
                </VStack>
            </Box>
            {appState.game?.paused && (
                <Box
                    className="pause-banner"
                    position="fixed"
                    top="80px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="yellow.400"
                    color="black"
                    px={6}
                    py={3}
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={990}
                    textAlign="center"
                >
                    <Heading size="md">Game Paused</Heading>
                </Box>
            )}
            <Flex
                className="game-page-container"
                flex={1}
                justifyContent={'center'}
                position={'relative'}
                style={{
                    filter: appState.game?.paused ? 'blur(4px)' : 'none',
                    transition: 'filter 0.3s ease-in-out',
                }}
            >
                <Table />
            </Flex>
        </>
    );
};

export default MainGamePage;
