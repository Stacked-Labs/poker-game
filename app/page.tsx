import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeSection from './components/HomePage/HomeSection';
import CommunitySection from './components/HomePage/CommunitySection';
import FeaturesSection from './components/HomePage/FeaturesSection';
import HostToEarnSection from './components/HomePage/HostToEarnSection';
import NewsletterSection from './components/HomePage/NewsletterSection';
import YourTableVaultSection from './components/HomePage/YourTableVaultSection';
import CustomChipValueSection from './components/HomePage/CustomChipValueSection';
import FAQSection from './components/HomePage/FAQSection';
import ComparisonSection from './components/HomePage/ComparisonSection';
import Footer from './components/HomePage/Footer';
import FloatingDecor from './components/HomePage/FloatingDecor';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import BackToTopButton from './components/HomePage/BackToTopButton';

const CoinGecko = dynamic(
    () => import('./components/HomePage/CoinGecko'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'Stacked Poker — Play Texas Hold\'em with USDC on Base. No Signup.',
    description:
        'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no KYC, no account.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Stacked Poker — Play Texas Hold\'em with USDC on Base. No Signup.',
        description:
            'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no KYC, no account.',
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
        title: 'Stacked Poker — Play Texas Hold\'em with USDC on Base. No Signup.',
        description:
            'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no KYC, no account.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ["poker, online poker, Texas Hold'em, USDC, Base, crypto poker, no signup, no KYC"],
    alternates: {
        canonical: 'https://stackedpoker.io/',
    },
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
                    <Box
                        position="relative"
                        bg="bg.default"
                        overflow="hidden"
                    >
                        <FloatingDecor scale="page" />
                        <Box position="relative" zIndex={1}>
                            <CommunitySection />
                            <ComparisonSection />
                            <FeaturesSection />
                            <HostToEarnSection />
                            <CustomChipValueSection />
                            <YourTableVaultSection />
                            <FAQSection />
                            <NewsletterSection />
                            <Footer />
                        </Box>
                    </Box>
                </VStack>
            </Box>
            <BackToTopButton />
        </>
    );
};

export default HomePage;
