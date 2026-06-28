'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import FreeTicketsPanelView from './FreeTicketsPanelView';
import type {
    FreeTicketCode,
    FreeTicketsPanelData,
} from '../../hooks/server_actions';

const publicCode: FreeTicketCode = {
    id: 1,
    code: 'FRIDAY',
    code_type: 'public',
    source_tag: null,
    max_claims: null,
    claims_count: 38,
    claim_path: '/tournament/1284/free?c=FRIDAY',
    share_url: 'https://stackedpoker.io/tournament/1284/free?c=FRIDAY',
};

const taggedX: FreeTicketCode = {
    id: 2,
    code: 'FRIDAY-X',
    code_type: 'tagged',
    source_tag: 'x',
    max_claims: null,
    claims_count: 12,
    claim_path: '/tournament/1284/free?c=FRIDAY-X&src=x',
    share_url: 'https://stackedpoker.io/tournament/1284/free?c=FRIDAY-X&src=x',
};

const taggedDiscord: FreeTicketCode = {
    ...taggedX,
    id: 3,
    code: 'FRIDAY-DISCORD',
    source_tag: 'discord',
    claims_count: 9,
    claim_path: '/tournament/1284/free?c=FRIDAY-DISCORD&src=discord',
    share_url:
        'https://stackedpoker.io/tournament/1284/free?c=FRIDAY-DISCORD&src=discord',
};

const base: FreeTicketsPanelData = {
    enabled: true,
    cap: 100,
    infinite: false,
    codes_per_claimer: 3,
    max_entries: 180,
    codes: [publicCode, taggedX, taggedDiscord],
    claimed: 38,
    registered: 30,
    played: 22,
    codes_in_circulation: 54,
};

const meta = {
    title: 'Tournament/FreeEntry/FreeTicketsPanel',
    component: FreeTicketsPanelView,
    tags: ['autodocs'],
    // The panel is a flat sub-section of the Host-controls card; wrap it in a
    // representative card surface so the story shows it in context.
    decorators: [
        (Story) => (
            <Box
                maxW="560px"
                p={6}
                borderRadius="16px"
                bg="card.white"
                _dark={{ bg: 'card.darkNavy' }}
            >
                <Story />
            </Box>
        ),
    ],
    args: {
        rowBg: 'bg.pillNeutral',
        copiedId: null,
        creatingTag: null,
        onCopy: () => {},
        onAddTag: () => {},
    },
} satisfies Meta<typeof FreeTicketsPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capped: Story = {
    name: 'Capped, with tagged links',
    args: { data: base },
};

export const NearCap: Story = {
    name: 'Near cap',
    args: { data: { ...base, claimed: 96 } },
};

export const Infinite: Story = {
    args: {
        data: { ...base, infinite: true, cap: 0, codes: [publicCode] },
    },
};

export const FreshNoTags: Story = {
    name: 'Fresh — public link only',
    args: {
        data: { ...base, claimed: 0, played: 0, codes: [publicCode], codes_in_circulation: 1 },
    },
};
