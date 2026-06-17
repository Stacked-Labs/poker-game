import type { Meta, StoryObj } from '@storybook/react';
import { Box, Container } from '@chakra-ui/react';
import TournamentsEmptyState from './TournamentsEmptyState';

const meta = {
    title: 'PublicGames/TournamentsEmptyState',
    component: TournamentsEmptyState,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <Story />
                </Container>
            </Box>
        ),
    ],
} satisfies Meta<typeof TournamentsEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// The honest empty state, no fabricated tournaments.
export const Default: Story = {};

// With a click handler instead of a link (e.g. opening the create flow in place).
export const WithCreateHandler: Story = {
    args: { onCreate: () => {} },
};
