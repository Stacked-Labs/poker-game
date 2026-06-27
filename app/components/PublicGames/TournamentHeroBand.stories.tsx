import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TournamentHeroBand from './TournamentHeroBand';
import { MOCK_TOURNAMENTS, completed } from './mockTournaments';

const meta = {
    title: 'PublicGames/TournamentHeroBand',
    component: TournamentHeroBand,
    tags: ['autodocs'],
    parameters: { nextjs: { appDirectory: true } },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="1120px">
                <Story />
            </Box>
        ),
    ],
    args: { onSeeAll: () => {} },
} satisfies Meta<typeof TournamentHeroBand>;

export default meta;
type Story = StoryObj<typeof meta>;

// Filters MOCK_TOURNAMENTS to the fillable ones and ranks them: a live
// late-reg event, then registration events likeliest to fire. Shows the
// Free-Play tag distinct from real-money USDC framing.
export const OpenNow: Story = { args: { tournaments: MOCK_TOURNAMENTS } };

// Nothing fillable → the band renders nothing (no dead slab above the lobby).
export const NothingFillable: Story = { args: { tournaments: [completed] } };
