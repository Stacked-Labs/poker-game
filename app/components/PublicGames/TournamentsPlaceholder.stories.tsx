import type { Meta, StoryObj } from '@storybook/react';
import { Box, Container } from '@chakra-ui/react';
import TournamentsPlaceholder from './TournamentsPlaceholder';

const meta = {
    title: 'PublicGames/TournamentsPlaceholder',
    component: TournamentsPlaceholder,
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
} satisfies Meta<typeof TournamentsPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
