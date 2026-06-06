import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TournamentTabPanel from './TournamentTabPanel';
import {
    MockAppStateProvider,
    makeTournamentLive,
    makeTournamentMeta,
    mockAppState,
} from './tournamentMocks';

const meta = {
    title: 'Tournament/InTable/TournamentTabPanel',
    component: TournamentTabPanel,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TournamentTabPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function Stage({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="card.lightGray" p={{ base: 3, md: 6 }} minH="100vh">
            <Box maxW="720px" mx="auto">
                {children}
            </Box>
        </Box>
    );
}

export const Running: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState()}>
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const FreePlay: Story = {
    render: () => (
        <MockAppStateProvider
            state={mockAppState({
                tournamentLive: makeTournamentLive({
                    meta: makeTournamentMeta({
                        name: 'Free Play Warmup',
                        isFreePlay: true,
                        chain: undefined,
                        contractAddress: undefined,
                        guaranteeUsdc: 0,
                        prizePoolUsdc: 0,
                        buyInUsdc: 0,
                    }),
                }),
            })}
        >
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};

export const NotConnected: Story = {
    render: () => (
        <MockAppStateProvider state={mockAppState({ tournamentLive: null })}>
            <Stage>
                <TournamentTabPanel />
            </Stage>
        </MockAppStateProvider>
    ),
};
