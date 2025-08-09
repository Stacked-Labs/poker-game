'use client';

import React, { useContext, useEffect, useState } from 'react';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import Navbar from '@/app/components/NavBar';
import {
    Flex,
    Modal,
    Spinner,
    Text,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import LobbyBanner from '@/app/components/LobbyBanner';

const TableLayout: React.FC<{ params: { id: string } }> = ({
    children,
    params,
}: React.PropsWithChildren<{ params: { id: string } }>) => {
    const { appState } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        onOpen();

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [onOpen]);

    useEffect(() => {
        if (appState.game?.players && appState.game?.players.length > 1) {
            onClose();
        }
    }, [appState.game?.players, onClose]);

    if (loading) {
        return (
            <Flex
                justify="center"
                align="center"
                w="100vw"
                h="var(--full-vh)"
                position="fixed"
                backgroundColor="gray.200"
                zIndex={999}
            >
                <VStack spacing={4}>
                    <Spinner
                        size="xl"
                        color="red"
                        thickness="4px"
                        speed="0.8s"
                    />
                    <Text color="white" fontSize="lg" fontWeight="bold">
                        Loading table...
                    </Text>
                </VStack>
            </Flex>
        );
    }

    return (
        <Flex
            direction="column"
            w="100vw"
            h="var(--full-vh)"
            zIndex="auto"
            transformOrigin="center center"
            bg={'gray.200'}
        >
            <SocketProvider tableId={params.id}>
                <Navbar />
                {children}
                <Footer />
            </SocketProvider>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xs'}>
                <LobbyBanner onClose={onClose} />
            </Modal>
        </Flex>
    );
};

export default TableLayout;
