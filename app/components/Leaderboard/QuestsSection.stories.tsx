'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { QuestsSectionView } from './QuestsSection';
import type { QuestItem } from '@/app/hooks/server_actions';

// QuestsSection's data path uses thirdweb + AuthContext + a backend
// fetch. These stories target the presentational shell with mock
// QuestItem[] so every state — locked, active, completed,
// community-input, claiming — is reviewable without a backend.

const QUESTS: Record<string, QuestItem> = {
    follow_x: {
        id: 'follow_x',
        title: 'Follow Stacked on X',
        points: 250,
        completed: false,
    },
    create_table: {
        id: 'create_table',
        title: 'Create your first table',
        points: 500,
        completed: false,
    },
    join_telegram: {
        id: 'join_telegram',
        title: 'Join the Telegram',
        points: 150,
        completed: false,
        actionUrl: 'https://t.me/stacked',
    },
    join_discord: {
        id: 'join_discord',
        title: 'Join the Discord',
        points: 150,
        completed: false,
        actionUrl: 'https://discord.gg/stacked',
    },
    community_join: {
        id: 'community_join',
        title: 'Collab Community',
        points: 300,
        completed: false,
    },
};

const ALL_QUESTS_FRESH: QuestItem[] = [
    { ...QUESTS.follow_x },
    { ...QUESTS.create_table },
    { ...QUESTS.join_telegram, actionUrl: QUESTS.join_telegram.actionUrl },
    { ...QUESTS.join_discord, actionUrl: QUESTS.join_discord.actionUrl },
    { ...QUESTS.community_join },
];

const MIXED_QUESTS: QuestItem[] = [
    { ...QUESTS.follow_x, completed: true },
    { ...QUESTS.create_table, prerequisite: 'x_linked' },
    { ...QUESTS.join_telegram, completed: true, actionUrl: QUESTS.join_telegram.actionUrl },
    { ...QUESTS.join_discord, actionUrl: QUESTS.join_discord.actionUrl },
    { ...QUESTS.community_join },
];

const ALL_COMPLETED: QuestItem[] = ALL_QUESTS_FRESH.map((q) => ({ ...q, completed: true }));

function StagedSurface({ children }: { children: React.ReactNode }) {
    const bg = useColorModeValue('#ECEEF5', '#191919');
    return (
        <Box bg={bg} minH="100vh" p={{ base: 4, md: 8 }}>
            <Box maxW="400px">{children}</Box>
        </Box>
    );
}

const noopClaim = async () => {};

const meta = {
    title: 'Leaderboard/QuestsSection',
    component: QuestsSectionView,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    "Quests panel shown beneath the PlayerCard on the leaderboard. Stories cover every panel state — loading, fresh, mixed (some locked/claimable/completed), all-completed, and community-code-prefilled.",
            },
        },
    },
    decorators: [
        (Story) => (
            <StagedSurface>
                <Story />
            </StagedSurface>
        ),
    ],
} satisfies Meta<typeof QuestsSectionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
    name: 'Loading (initial fetch)',
    args: {
        quests: [],
        totalQuestPoints: 0,
        loading: true,
        isQuestLocked: () => false,
        onClaim: noopClaim,
    },
};

export const FreshUser: Story = {
    name: 'Fresh user (nothing claimed)',
    args: {
        quests: ALL_QUESTS_FRESH,
        totalQuestPoints: 0,
        loading: false,
        isQuestLocked: (q) =>
            q.prerequisite === 'x_linked' || q.id === 'create_table',
        onClaim: noopClaim,
    },
};

export const Mixed: Story = {
    name: 'Mixed (locked, claimable, completed)',
    args: {
        quests: MIXED_QUESTS,
        totalQuestPoints: 400,
        loading: false,
        isQuestLocked: (q) =>
            q.prerequisite === 'x_linked' || q.id === 'create_table',
        onClaim: noopClaim,
    },
};

export const AllCompleted: Story = {
    name: 'Every quest claimed',
    args: {
        quests: ALL_COMPLETED,
        totalQuestPoints: 1350,
        loading: false,
        isQuestLocked: () => false,
        onClaim: noopClaim,
    },
};

export const CommunityCodePrefilled: Story = {
    name: 'Community code prefilled (auto-claim flow)',
    args: {
        quests: ALL_QUESTS_FRESH,
        totalQuestPoints: 0,
        loading: false,
        communityCode: 'POKERBROS',
        isQuestLocked: (q) =>
            q.prerequisite === 'x_linked' || q.id === 'create_table',
        onClaim: noopClaim,
    },
};
