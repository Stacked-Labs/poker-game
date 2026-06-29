'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text } from '@chakra-ui/react';
import TournamentReminderBanner from './TournamentReminderBanner';
import { useTournamentReminderStore } from '../../stores/tournamentReminders';
import { AuthContext } from '../../contexts/AuthContext';
import type { Tournament } from '../../hooks/server_actions';
import { makeTournament, fromNow, MINUTE } from './reminderStoryMocks';

const MOCK_WALLET = '0x1111111111111111111111111111111111111111';

// Seeds the reminder store with mock registrations on mount and clears on
// unmount, so each story renders the banner against its own set.
function StoreSeeder({
    tournaments,
    children,
}: {
    tournaments: Tournament[];
    children: React.ReactNode;
}) {
    React.useEffect(() => {
        const ids = tournaments.map((t) => t.id);
        const byId: Record<number, Tournament> = {};
        for (const t of tournaments) byId[t.id] = t;
        useTournamentReminderStore.getState().updateRegistrations(ids, byId);
        return () => useTournamentReminderStore.getState().clear();
    }, [tournaments]);
    return <>{children}</>;
}

const makeDecorator = (tournaments: Tournament[]) => {
    const Wrapper = (Story: React.FC) => (
        <AuthContext.Provider
            value={
                {
                    isAuthenticated: true,
                    userAddress: MOCK_WALLET,
                } as unknown as React.ContextType<typeof AuthContext>
            }
        >
            <Box position="relative" minH="320px" bg="bg.default">
                <Box p={6} pt="92px">
                    <Text fontSize="sm" color="text.muted">
                        App content. The reminder strip pins to the top under the
                        nav on desktop, and to the bottom on mobile.
                    </Text>
                </Box>
                <StoreSeeder tournaments={tournaments}>
                    <Story />
                </StoreSeeder>
            </Box>
        </AuthContext.Provider>
    );
    Wrapper.displayName = 'ReminderBannerStoryWrapper';
    return Wrapper;
};

const meta = {
    title: 'Tournament/Reminders/ReminderBanner',
    component: TournamentReminderBanner,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TournamentReminderBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartingSoon: Story = {
    name: 'Single — starting soon',
    decorators: [
        makeDecorator([
            makeTournament({ scheduled_start_at: fromNow(12 * MINUTE) }),
        ]),
    ],
};

export const FinalMinute: Story = {
    name: 'Single — final minute (mm:ss)',
    decorators: [
        makeDecorator([
            makeTournament({ scheduled_start_at: fromNow(40_000) }),
        ]),
    ],
};

export const RunningSeatLink: Story = {
    name: 'Single — running (Take your seat)',
    decorators: [
        makeDecorator([
            makeTournament({
                name: 'Turbo Bounty',
                status: 'running',
                scheduled_start_at: fromNow(-5 * MINUTE),
                late_reg_close_at: fromNow(20 * MINUTE),
            }),
        ]),
    ],
};

export const MultipleApproaching: Story = {
    name: 'Multiple — most urgent + N more',
    decorators: [
        makeDecorator([
            makeTournament({
                id: 1,
                name: 'Turbo Bounty',
                scheduled_start_at: fromNow(8 * MINUTE),
            }),
            makeTournament({
                id: 2,
                name: 'Friday Freezeout',
                scheduled_start_at: fromNow(25 * MINUTE),
            }),
            makeTournament({
                id: 3,
                name: 'Sunday Deepstack',
                scheduled_start_at: fromNow(70 * MINUTE),
            }),
        ]),
    ],
};
