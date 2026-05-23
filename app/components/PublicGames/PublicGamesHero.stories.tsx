import type { Meta, StoryObj } from '@storybook/react';
import { Box, Container } from '@chakra-ui/react';
import PublicGamesHero from './PublicGamesHero';
import { MOCK_GAMES } from './mockGames';

const meta = {
    title: 'PublicGames/PublicGamesHero',
    component: PublicGamesHero,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        nextjs: { appDirectory: true },
    },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <Story />
                </Container>
            </Box>
        ),
    ],
} satisfies Meta<typeof PublicGamesHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: { games: MOCK_GAMES, totalCount: MOCK_GAMES.length },
};

export const Loading: Story = {
    args: { games: [], totalCount: null },
};

export const Empty: Story = {
    args: { games: [], totalCount: 0 },
};

export const SingleTable: Story = {
    args: { games: [MOCK_GAMES[0]], totalCount: 1 },
};

export const AllFreePlay: Story = {
    args: {
        games: MOCK_GAMES.filter((g) => !g.is_crypto),
        totalCount: MOCK_GAMES.filter((g) => !g.is_crypto).length,
    },
};
