import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeSection from './components/HomePage/HomeSection';
import CommunitySection from './components/HomePage/CommunitySection';
import FeaturesSection from './components/HomePage/FeaturesSection';
import HostToEarnSection from './components/HomePage/HostToEarnSection';
import UpcomingTournamentsSection from './components/HomePage/UpcomingTournamentsSection';
import YourTableVaultSection from './components/HomePage/YourTableVaultSection';
import CustomChipValueSection from './components/HomePage/CustomChipValueSection';
import FAQSection from './components/HomePage/FAQSection';
import FinalCtaSection from './components/HomePage/FinalCtaSection';
import ComparisonSection from './components/HomePage/ComparisonSection';
import Footer from './components/HomePage/Footer';
import FloatingDecor from './components/HomePage/FloatingDecor';
import { Metadata } from 'next';
import BroadcastMotion from './components/HomePage/BroadcastMotion';
import BackToTopButton from './components/HomePage/BackToTopButton';
import { listTournaments, type Tournament } from './hooks/server_actions';

export const metadata: Metadata = {
    title: 'Stacked Poker — Play Texas Hold\'em with USDC on Base. No Signup.',
    description:
        'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no account.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Stacked Poker — Play Texas Hold\'em with USDC on Base. No Signup.',
        description:
            'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no account.',
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
            'Play Texas Hold\'em in your browser with friends. Free play, or real stakes in USDC on Base. No downloads, no account.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ["poker, online poker, Texas Hold'em, USDC, Base, crypto poker, no signup"],
    alternates: {
        canonical: 'https://stackedpoker.io/',
    },
};

interface HomePageProps {
    searchParams: Promise<{ broadcast?: string }>;
}

// Server-fetch the upcoming-tournaments list so its cards render in the SSR HTML
// for crawlers and social unfurls (the client component still refreshes and
// personalizes after mount). The tournament fetch is data-cached ~30s, and
// time-boxed + caught so a slow or down backend never delays this
// conversion-critical page. On timeout/failure we return null (distinct from a
// genuine empty list) so the client falls back to its skeleton, then fills the
// module in.
async function fetchUpcomingTournaments(): Promise<Tournament[] | null> {
    try {
        const data = await Promise.race([
            listTournaments({ revalidate: 30 }),
            new Promise<{ tournaments: Tournament[]; total_count: number }>(
                (_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 800)
            ),
        ]);
        return data.tournaments ?? [];
    } catch {
        return null;
    }
}

const HomePage = async ({ searchParams }: HomePageProps) => {
    // Lighter "broadcast mode" (?broadcast=1) for the 24/7 livestream worker: skip
    // the autoplay video + hero animations so the homepage renders stably in
    // headless software-GL Chromium. Normal visitors are unaffected.
    const isBroadcast = (await searchParams)?.broadcast === '1';
    const initialTournaments = await fetchUpcomingTournaments();
    const content = (
        <>
            <Box w="100vw">
                <VStack spacing={0} align="stretch" height={'fit-content'}>
                    <Flex
                        alignItems={'center'}
                        height={'var(--full-vh)'}
                        width="100%"
                    >
                        <HomeSection isBroadcast={isBroadcast} />
                    </Flex>
                    <Box
                        position="relative"
                        bg="bg.default"
                        overflow="hidden"
                    >
                        <FloatingDecor scale="page" />
                        <Box position="relative" zIndex={1}>
                            <UpcomingTournamentsSection
                                initialTournaments={initialTournaments}
                            />
                            <CommunitySection />
                            <FeaturesSection isBroadcast={isBroadcast} />
                            <ComparisonSection />
                            <HostToEarnSection />
                            <CustomChipValueSection />
                            <YourTableVaultSection />
                            <FAQSection />
                            <FinalCtaSection />
                            <Footer />
                        </Box>
                    </Box>
                </VStack>
            </Box>
            {!isBroadcast && <BackToTopButton />}
        </>
    );

    // In broadcast mode, force-disable all Framer Motion animations server-side so the
    // reveal-on-scroll sections (FAQ etc.) render at their visible final state instead of
    // staying hidden, and the page doesn't thrash software-GL Chromium while the stream
    // auto-scrolls. Done here (not in providers) because this is where `broadcast` is
    // known server-side, so the SSR HTML is already correct.
    return isBroadcast ? <BroadcastMotion>{content}</BroadcastMotion> : content;
};

export default HomePage;
