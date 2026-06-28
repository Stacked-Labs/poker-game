import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TournamentInviteCardView from './TournamentInviteCardView';

const meta: Meta<typeof TournamentInviteCardView> = {
    title: 'Tournament/InviteCard',
    component: TournamentInviteCardView,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="bg.default" p={{ base: 4, md: 8 }} maxW="600px" mx="auto">
                <Story />
            </Box>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof TournamentInviteCardView>;

export const PlainOnly: Story = { args: { tournamentId: 42, myCode: 'mikedawson', loading: false } };
export const WithFreeSeats: Story = {
    args: { tournamentId: 42, myCode: 'mikedawson', loading: false, freeSeats: ['AB12CD', 'EF34GH'] },
};
export const NoCode: Story = { args: { tournamentId: 42, myCode: null, loading: false } };
export const Loading: Story = { args: { tournamentId: 42, myCode: null, loading: true } };
