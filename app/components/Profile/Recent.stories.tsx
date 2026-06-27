import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import RecentLedger, { type Activity } from './RecentLedger';

const ENRICHED: Activity[] = [
    { type: 'hosted', id: 1, name: 'Friday Night Freezeout', entrants: 38, endedAt: null, status: 'Running', buyInUsdc: 25_000_000, format: 'standard_mtt' },
    { type: 'result', id: 2, name: 'Sunday Major', finishPosition: 1, prizeUsdc: 540_000_000, endedAt: '2026-06-25T20:00:00Z', buyInUsdc: 50_000_000, fieldSize: 212, format: 'standard_mtt' },
    { type: 'result', id: 3, name: '$5 Turbo', finishPosition: 3, prizeUsdc: 60_000_000, endedAt: '2026-06-23T20:00:00Z', buyInUsdc: 5_000_000, fieldSize: 96, format: 'turbo' },
    { type: 'hosted', id: 4, name: 'Wednesday Deepstack', entrants: 22, endedAt: '2026-06-20T20:00:00Z', status: 'Completed', buyInUsdc: 10_000_000 },
    { type: 'result', id: 5, name: 'Midnight Hyper', finishPosition: 14, prizeUsdc: 0, endedAt: '2026-06-18T20:00:00Z', buyInUsdc: 0, fieldSize: 48, format: 'hyper' },
];

// Today's contract (no buy-in/field/format) — the table must degrade gracefully.
const BARE: Activity[] = [
    { type: 'result', id: 2, name: 'Sunday Major', finishPosition: 1, prizeUsdc: 540_000_000, endedAt: '2026-06-25T20:00:00Z' },
    { type: 'result', id: 3, name: '$5 Turbo', finishPosition: 3, prizeUsdc: 60_000_000, endedAt: '2026-06-23T20:00:00Z' },
    { type: 'hosted', id: 4, name: 'Wednesday Deepstack', entrants: 22, endedAt: '2026-06-20T20:00:00Z', status: 'Completed' },
];

const meta: Meta<typeof RecentLedger> = {
    title: 'Profile/Recent',
    component: RecentLedger,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="bg.default" p={{ base: 4, md: 8 }} maxW="900px" mx="auto">
                <Story />
            </Box>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof RecentLedger>;

export const Enriched: Story = { args: { items: ENRICHED } };
export const BareContract: Story = { args: { items: BARE } };
export const PlayedOnly: Story = { args: { items: ENRICHED.filter((i) => i.type === 'result') } };
export const HostedOnly: Story = { args: { items: ENRICHED.filter((i) => i.type === 'hosted') } };
