'use client';

import React, { useContext, useEffect } from 'react';
import { Box, Flex, useColorMode, VStack } from '@chakra-ui/react';
import HomeSection from './components/HomePage/HomeSection';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import Head from 'next/head';
import Script from 'next/script';

const HomePage: React.FC = () => {
    const router = useRouter();
    const { appState } = useContext(AppContext);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (appState.table) {
            router.push(`/table/${appState.table}`);
        }
    }, [appState.table, router]);

    return (
        <>
            <Head>
                <title>Poker Game - Play Online Poker</title>
                <meta
                    name="description"
                    content="Join our online poker game and play with friends. Experience the thrill of Texas Hold'em poker from the comfort of your home."
                />
                <meta
                    name="keywords"
                    content="poker, online poker, Texas Hold'em, card game, multiplayer"
                />
            </Head>
            {/* Load CoinGecko widget script */}
            <Script
                src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"
                strategy="afterInteractive"
            />
            {/* CoinGecko price marquee placed directly under the navbar */}
            <Box
                width="100%"
                bgColor="bg.card"
                display="flex"
                justifyContent="center"
                position="fixed"
                top={{ base: '68px', md: '76px' }}
                left={0}
                zIndex={98}
                borderBottom="1px solid"
                borderColor="rgba(235, 11, 92, 0.2)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                dangerouslySetInnerHTML={{
                    __html: `<gecko-coin-price-marquee-widget dark-mode="${colorMode == 'dark' ? 'true' : 'false'}" locale="en" transparent-background="true" coin-ids="bitcoin,ethereum,usd-coin,tether,spx6900,virtual-protocol,aerodrome-finance,based-brett,degen-base,cookie,ponke" initial-currency="usd"></gecko-coin-price-marquee-widget>`,
                }}
            />
            <Box w="100vw" bgColor={'gray.200'}>
                <VStack height={'fit-content'}>
                    <Flex alignItems={'center'} height={'var(--full-vh)'}>
                        <HomeSection />
                    </Flex>
                </VStack>
            </Box>
        </>
    );
};

export default HomePage;
