import Table from '@/app/components/Table';
import { Flex } from '@chakra-ui/react';

export async function generateMetadata({ params }: { params: { id: string } }) {
    const url = `https://stackedpoker.io/table/${params.id}`;
    return {
        title: 'Poker Table - Stacked Poker',
        description:
            "Play Texas Hold'em online with friends for free or crypto! Join your private poker table, enjoy real-time multiplayer action, and experience the excitement of the game – no downloads or sign-up required.",
        icons: {
            icon: '/favicon.ico',
        },
        openGraph: {
            title: 'Play Poker Table - Stacked Poker',
            description:
                "Jump into a live poker table on Stacked Poker. Play Hold'em online with your friends or others, manage your seat, and view the action real-time.",
            url,
            siteName: 'Stacked Poker',
            images: [
                {
                    url: 'https://stackedpoker.io/previews/table_preview.png',
                    width: 1200,
                    height: 630,
                    alt: 'Table Game - Stacked Poker',
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            title: 'Poker Table - Stacked Poker',
            description:
                "Join a poker table and play Hold'em online privately or with the public. No account needed to start playing right away.",
            images: ['https://stackedpoker.io/previews/table_preview.png'],
        },
        keywords: [
            'poker table',
            'online poker',
            "Texas Hold'em",
            'multiplayer poker',
            'poker with friends',
            'real-time poker',
            'crypto poker',
            'card game'
        ]
    };
}

const TablePage = ({ params }: { params: { id: string } }) => {
    return (
        <Flex
            className="game-page-container"
            flex={1}
            minHeight={0}
            overflow="hidden"
            justifyContent={'center'}
            position={'relative'}
            bg={'transparent'}
        >
            <Table tableId={params.id} />
        </Flex>
    );
};

export default TablePage;
