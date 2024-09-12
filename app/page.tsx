'use client';

import React, { useContext, useEffect } from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeNavBar from './components/HomePage/HomeNavBar';
import HomeSection from './components/HomePage/HomeSection';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import Head from 'next/head';

const HomePage: React.FC = () => {
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    useEffect(() => {
        if (appState.table && socket) {
            router.push(`/game/${appState.table}`);
        }
    }, [appState.table, socket, router]);

    return (
        <>
            <Head>
                <title>Poker Game - Play Online Poker</title>
                <meta name="description" content="Join our online poker game and play with friends. Experience the thrill of Texas Hold'em poker from the comfort of your home." />
                <meta name="keywords" content="poker, online poker, Texas Hold'em, card game, multiplayer" />
            </Head>
            <Box w="100vw" bgColor={'gray.200'}>
                <HomeNavBar />
                <VStack height={'fit-content'}>
                    <Flex alignItems={'center'} height={'100vh'}>
                        <HomeSection />
                    </Flex>
                </VStack>
            </Box>
        </>
    );
};

export default HomePage;
