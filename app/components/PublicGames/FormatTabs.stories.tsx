import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import FormatTabs, { type GameFormat } from './FormatTabs';

function Interactive({ initial }: { initial: GameFormat }) {
    const [format, setFormat] = useState<GameFormat>(initial);
    return (
        <Box bg="card.lightGray" minH="240px" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                <FormatTabs format={format} onChange={setFormat} />
            </Container>
        </Box>
    );
}

const meta = {
    title: 'PublicGames/FormatTabs',
    component: FormatTabs,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
} satisfies Meta<typeof FormatTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CashSelected: Story = {
    render: () => <Interactive initial="cash" />,
};

export const TournamentsSelected: Story = {
    render: () => <Interactive initial="tournaments" />,
};
