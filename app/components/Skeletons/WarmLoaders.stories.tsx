'use client';

import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import BoardTable from '@/app/components/StatsHub/BoardTable';
import ProfileSkeleton from '@/app/components/Profile/ProfileSkeleton';
import BoardRowsSkeleton from './BoardRowsSkeleton';
import { QuestsSectionView } from '@/app/components/Leaderboard/QuestsSection';

// LOAD-1 showcase: the shared warm-skeleton loaders replacing the bare
// brand.green spinners on the Stats Hub. Review light + dark.
const meta = {
    title: 'Skeletons/WarmLoaders',
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Frame = ({ children, maxW = '760px' }: { children: ReactNode; maxW?: string }) => (
    <Box bg="bg.default" minH="100vh" p={{ base: 4, md: 8 }}>
        <Box maxW={maxW} mx="auto">
            {children}
        </Box>
    </Box>
);

export const StatsHubBoard: Story = {
    name: 'Stats Hub board — loading (was a bare spinner)',
    render: () => (
        <Frame>
            <BoardTable data={null} loading />
        </Frame>
    ),
};

export const Quests: Story = {
    name: 'Quests — loading (was a bare spinner)',
    render: () => (
        <Frame maxW="440px">
            <QuestsSectionView
                quests={[]}
                totalQuestPoints={0}
                loading
                isQuestLocked={() => false}
                onClaim={() => {}}
            />
        </Frame>
    ),
};

export const Profile: Story = {
    name: 'Profile — loading (recipe source, now shared)',
    render: () => <ProfileSkeleton />,
};

export const Rows: Story = {
    name: 'BoardRowsSkeleton (raw silhouette)',
    render: () => (
        <Frame maxW="560px">
            <Box bg="card.white" borderRadius="20px" boxShadow="card.lift" py={3} px={2}>
                <BoardRowsSkeleton rows={6} />
            </Box>
        </Frame>
    ),
};
