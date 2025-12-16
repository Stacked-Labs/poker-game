import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeSection from './components/HomePage/HomeSection';
import { Metadata } from 'next';
import CoinGecko from './components/HomePage/CoinGecko';

export const metadata: Metadata = {
    title: 'Stacked - Poker with Friends',
    description:
        'The easiest way to play poker for free or with crypto. No download, no sign up needed.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Stacked - Poker with Friends',
        description:
            'The easiest way to play poker for free or for crypto. No download, no sign up needed.',
        url: 'https://stackedpoker.io',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Stacked - Poker with Friends',
        description:
            'The easiest way to play poker for free or with crypto. No download, no sign up needed.',
        images: ['https://stackedpoker.io/previews/home_preview.png',],
    },
    keywords: ["poker, online poker, Texas Hold'em, card game, multiplayer"]
};

const HomePage: React.FC = () => {
    return (
        <>
            <CoinGecko />
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
