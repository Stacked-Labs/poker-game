'use client';

import React, { useContext, useEffect, useState } from 'react';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import Navbar from '@/app/components/NavBar';
import { Flex, Modal, Text, useDisclosure } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import LobbyBanner from '@/app/components/LobbyBanner';
import LandscapeScreen from '@/app/components/LandscapeScreen';
import { AnimatePresence, motion, MotionContext } from 'framer-motion';

const MotionFlex = motion(Flex);
const MotionText = motion(Text);

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
        <>
            {loading && (
                <AnimatePresence initial={false}>
                    {loading && (
                        <MotionFlex
                            key="loading-screen"
                            justify="center"
                            align="center"
                            w="100vw"
                            h="var(--full-vh)"
                            position="fixed"
                            zIndex={9999}
                            backdropFilter="blur(3px)"
                            sx={{
                                backdropFilter: 'blur(3px)',
                                WebkitBackdropFilter: 'blur(3px)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.4,
                                ease: 'easeInOut',
                                delayChildren: 0,
                            }}
                        >
                            <MotionText
                                color="white"
                                fontSize={{ base: '6xl', lg: '8xl' }}
                                fontWeight="extrabold"
                                lineHeight={1.1}
                                textShadow="2px 2px 10px rgba(0,0,0,0.5)"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                Loading...
                            </MotionText>
                        </MotionFlex>
                    )}
                </AnimatePresence>
            )}
            <Flex
                direction="column"
                w="100vw"
                h="var(--full-vh)"
                zIndex="auto"
                transformOrigin="center center"
                bg={'gray.200'}
                filter={loading ? 'blur(3px)' : 'none'}
                transition={'0.5s ease-in-out'}
            >
                <SocketProvider tableId={params.id}>
                    <Navbar isLoading={loading} />
                    {children}
                    <Footer />
                </SocketProvider>

                <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xs'}>
                    <LobbyBanner onClose={onClose} />
                </Modal>

                <LandscapeScreen />
            </Flex>
        </>
    );
};

export default TableLayout;
