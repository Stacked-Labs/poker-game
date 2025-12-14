'use client';

import React, { useContext, useEffect, useState } from 'react';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import Navbar from '@/app/components/NavBar';
import { Flex, Modal, useDisclosure, Box, Heading } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import GameConfigWatermark from '@/app/components/Footer/GameConfigWatermark';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import LobbyBanner from '@/app/components/LobbyBanner';
import GameViewport from '@/app/components/GameViewport';

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

    return (
        <GameViewport showLoading={loading}>
            {/* Content Layer - fills the fixed-ratio container */}
            <Flex
                className="game-content"
                position="relative"
                zIndex={1}
                width="100%"
                height="100%"
                direction="column"
                bg="transparent"
            >
                <SocketProvider tableId={params.id}>
                    {/* Navbar - absolutely positioned, overlays at top */}
                    <Navbar isLoading={loading} />

                    {/* Pause Banner */}
                    {appState.game?.paused && (
                        <Box
                            className="pause-banner"
                            position="absolute"
                            top="12%"
                            left="50%"
                            transform="translateX(-50%)"
                            bg="brand.yellow"
                            color="text.white"
                            px="3%"
                            py="1.5%"
                            borderRadius="16px"
                            boxShadow="0 8px 24px rgba(253, 197, 29, 0.4)"
                            zIndex={990}
                            textAlign="center"
                            border="2px solid white"
                        >
                            <Heading size="md" fontWeight="bold">
                                Paused
                            </Heading>
                        </Box>
                    )}

                    {/* Main Content Area */}
                    <Flex
                        className="main-content-area"
                        flex={1}
                        direction="column"
                        filter={appState.game?.paused ? 'blur(1px)' : 'none'}
                        transition="filter 0.3s ease-in-out"
                        minHeight={0}
                        overflow="hidden"
                    >
                        {children}
                        <Box
                            className="footer-wrapper"
                            position="relative"
                            width="100%"
                            height="10%"
                            gap={{ base: 2, md: 3 }}
                            px={{ base: 1, md: 4 }}
                            py={{ base: 0, md: 1 }}
                            maxHeight={{ base: '70px', md: '100px' }}
                            minHeight={{ base: '50px', md: '70px' }}
                        >
                            <GameConfigWatermark />
                            <Footer />
                        </Box>
                    </Flex>

                    {/* Modal - inside container so it scales with game */}
                    <Modal
                        isOpen={isOpen}
                        onClose={onClose}
                        isCentered
                        size={'xs'}
                    >
                        <LobbyBanner onClose={onClose} />
                    </Modal>
                </SocketProvider>
            </Flex>
        </GameViewport>
    );
};

export default TableLayout;
