import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { blo } from 'blo';
import ProfileOgCard from './ProfileOgCard';

const ADDR = '0x1234567890abcdef1234567890abcdef12345678';

// The OG card is a fixed 1200×630 artifact (literal hexes, light-only) — render at true size.
const meta: Meta<typeof ProfileOgCard> = {
    title: 'Profile/OgCard',
    component: ProfileOgCard,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box w="1200px" h="630px">
                <Story />
            </Box>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof ProfileOgCard>;

const base = {
    logoUrl: '/IconLogo.png',
    usdcLogoUrl: '/usdc-logo.png',
    avatar: blo(ADDR as `0x${string}`),
    hasAvatar: false,
};

export const HostEarnings: Story = {
    args: {
        ...base,
        name: 'Mike Dawson',
        handle: '@mikedawson',
        tier: 'Diamond',
        rank: 3,
        earnings: '$1,240',
        statsLine: '18,402 hands · 44 tournaments · 6 wins',
    },
};

export const GoldNoEarnings: Story = {
    args: {
        ...base,
        name: 'goldrush',
        handle: '@goldrush',
        tier: 'Gold',
        rank: 8,
        earnings: null,
        statsLine: '4,120 hands · 12 tournaments · 2 wins',
    },
};

export const Fallback: Story = {
    args: {
        ...base,
        name: '0x1234…5678',
        handle: '0x1234…5678',
        tier: 'Unranked',
        rank: 0,
        earnings: null,
        statsLine: 'Your table. Your money.',
    },
};
