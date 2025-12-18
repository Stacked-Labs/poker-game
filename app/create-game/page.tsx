import GameSettingLeftSide from '../components/CreateGame/GameSettingLeftSide';
import Head from 'next/head';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Poker Game - Stacked Poker',
    description:
        'Create your own online poker table to play Texas Hold\'em and other variants for free or with crypto on Stacked Poker. Fast setup, customizable blinds, exclusive invite code, no sign up required.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Create Poker Game - Stacked Poker',
        description:
            'Set up your private online poker game in seconds. Choose table stakes, variants, and invite friends to play for free or with crypto. No account needed.',
        url: 'https://stackedpoker.io/create-game',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/create_preview.png',
                width: 1200,
                height: 630,
                alt: 'Create Poker Game - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Create Poker Game - Stacked Poker',
        description:
            'Launch a poker table and invite friends. Customize buy-ins, choose free or crypto play, and host Texas Hold\'em or your favorite variant easily.',
        images: ['https://stackedpoker.io/previews/create_preview.png'],
    },
    keywords: ["poker, online poker, Texas Hold'em, card game, multiplayer, create game"]
};

const CreateGamePage: React.FC = () => {
    return (
        <>
            <Head>
                <link
                    rel="preconnect"
                    href="https://challenges.cloudflare.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://challenges.cloudflare.com"
                />
            </Head>
            <Box
                minHeight="var(--full-vh)"
                position="relative"
                overflow="hidden"
                bg="bg.default"
            >
                {/* Main Content */}
                <Flex
                    flex="1"
                    justifyContent="center"
                    position="relative"
                    zIndex={1}
                    minHeight="var(--full-vh)"
                >
                    <GameSettingLeftSide />
                </Flex>
            </Box>
        </>
    );
};

export default CreateGamePage;
