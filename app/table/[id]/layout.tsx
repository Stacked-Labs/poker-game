'use client';

import React, { useContext, useEffect, useState } from 'react';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import Navbar from '@/app/components/NavBar';
import { Flex, Modal, Text, useDisclosure, Box, Heading } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import LobbyBanner from '@/app/components/LobbyBanner';
import LandscapeScreen from '@/app/components/LandscapeScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// Animations
const float = keyframes`
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(-15px) translateX(10px); }
    66% { transform: translateY(10px) translateX(-15px); }
`;

const float2 = keyframes`
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(12px) translateX(-12px); }
    66% { transform: translateY(-10px) translateX(15px); }
`;

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
                <AnimatePresence>
                    {loading && (
                        <MotionFlex
                            key="loading-screen"
                            justify="center"
                            align="center"
                            w="100vw"
                            h="var(--full-vh)"
                            position="fixed"
                            zIndex={9999}
                            backdropFilter="blur(10px)"
                            sx={{
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <MotionText
                                color="text.white"
                                fontSize={{
                                    base: '50px',
                                    md: '120px',
                                    lg: '150px',
                                }}
                                mb={{ base: '10%', md: '4%' }}
                                fontWeight="extrabold"
                                lineHeight={1.1}
                                letterSpacing={{ base: '0.05em' }}
                                textShadow="2px 2px 10px rgba(0,0,0,0.5)"
                            >
                                {'LOADING'.split('').map((char, index) => (
                                    <span
                                        key={`${char}-${index}`}
                                        className={`loading-letter loading-variant-${index % 8}`}
                                        style={{
                                            animationDelay: `${index * 700}ms`,
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
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
                bg={loading ? 'charcoal.400' : 'bg.default'}
                filter={loading ? 'blur(3px)' : 'none'}
                transition="0.5s ease-in-out"
                position="relative"
                overflow="hidden"
            >
                {/* Animated Background Glow Elements */}
                <Box
                    position="absolute"
                    width="600px"
                    height="600px"
                    borderRadius="50%"
                    bg="brand.pink"
                    filter="blur(150px)"
                    opacity={0.12}
                    animation={`${float} 20s ease-in-out infinite`}
                    top="10%"
                    left="15%"
                    zIndex={0}
                    pointerEvents="none"
                />
                <Box
                    position="absolute"
                    width="500px"
                    height="500px"
                    borderRadius="50%"
                    bg="brand.green"
                    filter="blur(140px)"
                    opacity={0.1}
                    animation={`${float2} 25s ease-in-out infinite`}
                    bottom="20%"
                    right="10%"
                    zIndex={0}
                    pointerEvents="none"
                />
                <Box
                    position="absolute"
                    width="450px"
                    height="450px"
                    borderRadius="50%"
                    bg="brand.yellow"
                    filter="blur(130px)"
                    opacity={0.08}
                    animation={`${float} 22s ease-in-out infinite 5s`}
                    top="40%"
                    right="25%"
                    zIndex={0}
                    pointerEvents="none"
                />

                {/* Content Layer */}
                <Box
                    position="relative"
                    zIndex={1}
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    bg={'transparent'}
                >
                    <SocketProvider tableId={params.id}>
                        <Navbar isLoading={loading} />
                        {appState.game?.paused && (
                            <Box
                                className="pause-banner"
                                position="fixed"
                                top="80px"
                                left="50%"
                                transform="translateX(-50%)"
                                bg="brand.yellow"
                                color="text.white"
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
                            flex={1}
                            direction={'column'}
                            filter={appState.game?.paused ? 'blur(4px)' : 'none'}
                            transition='filter 0.3s ease-in-out'
                            height={'full'}
                            gap={4}
                        >
                            {children}
                            <Footer />
                        </Flex>
                    </SocketProvider>

                    <Modal
                        isOpen={isOpen}
                        onClose={onClose}
                        isCentered
                        size={'xs'}
                    >
                        <LobbyBanner onClose={onClose} />
                    </Modal>

                    <LandscapeScreen />
                </Box>
            </Flex>
        </>
    );
};

export default TableLayout;
