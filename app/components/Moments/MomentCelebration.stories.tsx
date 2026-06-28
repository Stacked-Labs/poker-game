import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import MomentCelebration from './MomentCelebration';
import type { MomentParams } from '@/app/lib/moments';

// Quiet moments (tierup / milestone) surface as the non-blocking chip; win/rankup auto-open the
// modal. The modal embeds the OG share card — in Storybook that image 404s (no Next API), so the
// card area shows a neutral placeholder; the real card renders via /api/og/* on the dev server.
const TIER_UP: MomentParams = { type: 'tierup', tierLabel: 'Gold' };
const MILESTONE: MomentParams = { type: 'milestone', hands: 10000 };
const WIN: MomentParams = { type: 'win', tournamentId: 1, tournamentName: 'Sunday Major', position: 1 };

const meta: Meta<typeof MomentCelebration> = {
    title: 'Moments/Celebration',
    component: MomentCelebration,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box minH="100vh" bg="bg.default">
                <Story />
            </Box>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof MomentCelebration>;

export const QuietChip: Story = { args: { moment: TIER_UP } };
export const MilestoneChip: Story = { args: { moment: MILESTONE } };
export const WinModal: Story = { args: { moment: WIN } };
