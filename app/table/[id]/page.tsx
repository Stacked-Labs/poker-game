'use client';

import { useEffect, useState, useContext } from 'react';
import { isTableExisting } from '@/app/hooks/server_actions';
import Table from '@/app/components/Table';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import useToastHelper from '@/app/hooks/useToastHelper';

const TablePage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const toast = useToastHelper();
    const { appState, dispatch } = useContext(AppContext);
    const [tableStatus, setTableStatus] = useState<'checking' | 'success'>(
        'checking'
    );
    const tableId = params.id;

    useEffect(() => {
        const verifyAndJoinTable = async () => {
            if (tableId) {
                try {
                    const result = await isTableExisting(tableId);
                    if (result.status === 'success') {
                        dispatch({ type: 'setTablename', payload: tableId });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableId]);

    return (
        <>
            {appState.game?.paused && (
                <Box
                    className="pause-banner"
                    position="fixed"
                    top="80px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="brand.yellow"
                    color="white"
                    px={8}
                    py={4}
                    borderRadius="16px"
                    boxShadow="0 8px 24px rgba(253, 197, 29, 0.4)"
                    zIndex={990}
                    textAlign="center"
                    border="2px solid white"
                >
                    <Heading size="md" fontWeight="bold">
                        Game Paused
                    </Heading>
                </Box>
            )}
            <Flex
                className="game-page-container"
                flex={1}
                minHeight={0}
                overflow="hidden"
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

export default TablePage;
