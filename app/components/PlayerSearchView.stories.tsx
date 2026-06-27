import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import type { PlayerSearchResult } from '@/app/hooks/server_actions';
import PlayerSearchView from './PlayerSearchView';

const noop = () => {};

const RESULTS: PlayerSearchResult[] = [
    { wallet: '0x1111111111111111111111111111111111111111', x_username: 'mikedawson', x_display_name: 'Mike Dawson', rank: 3, tier: 'diamond' },
    { wallet: '0x2222222222222222222222222222222222222222', x_username: 'goldrush', x_display_name: 'goldrush', rank: 8, tier: 'gold' },
    { wallet: '0x3333333333333333333333333333333333333333', x_username: undefined, x_display_name: undefined, rank: 41, tier: 'silver' },
    { wallet: '0x4444444444444444444444444444444444444444', x_username: 'railbird', x_display_name: 'railbird', rank: 0, tier: 'iron' },
];

const meta: Meta<typeof PlayerSearchView> = {
    title: 'Profile/PlayerSearch',
    component: PlayerSearchView,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            // Headroom so the absolutely-positioned dropdown is visible in the canvas.
            <Box bg="bg.default" minH="420px" p={6}>
                <Story />
            </Box>
        ),
    ],
    args: {
        query: 'mi',
        active: -1,
        open: true,
        loading: false,
        maxW: '360px',
        onQueryChange: noop,
        onFocus: noop,
        onKeyDown: noop,
        onRowMouseEnter: noop,
        onRowClick: noop,
    },
};
export default meta;
type Story = StoryObj<typeof PlayerSearchView>;

export const Populated: Story = {
    args: { results: RESULTS },
};

export const KeyboardActive: Story = {
    args: { results: RESULTS, active: 1 },
};

export const Loading: Story = {
    args: { results: [], loading: true },
};

export const Empty: Story = {
    args: { query: 'zzz', results: [] },
};

export const Closed: Story = {
    args: { results: RESULTS, open: false, query: '' },
};
