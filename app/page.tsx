import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeSection from './components/HomePage/HomeSection';
import CommunitySection from './components/HomePage/CommunitySection';
import FeaturesSection from './components/HomePage/FeaturesSection';
import NewsletterSection from './components/HomePage/NewsletterSection';
import OnchainInfoSection from './components/HomePage/OnchainInfoSection';
import FAQSection from './components/HomePage/FAQSection';
import Footer from './components/HomePage/Footer';
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
        url: 'https://stackedpoker.io/',
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
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ["poker, online poker, Texas Hold'em, card game, multiplayer"],
};

const HomePage: React.FC = () => {
    return (
        <>
            <CoinGecko />
            <Box w="100vw">
                <VStack spacing={0} align="stretch" height={'fit-content'}>
                    <Flex
                        alignItems={'center'}
                        height={'var(--full-vh)'}
                        width="100%"
                    >
                        <HomeSection />
                    </Flex>
                    <CommunitySection />
                    <NewsletterSection />
                    <FeaturesSection />
                    <OnchainInfoSection />
                    <FAQSection />
                    <Footer />
                </VStack>
            </Box>
        </>
    );
};

export default HomePage;
