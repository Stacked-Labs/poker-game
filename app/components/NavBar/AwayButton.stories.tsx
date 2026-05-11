'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import AwayButton from './AwayButton';
import LeaveButton from './LeaveButton';

const meta = {
    title: 'NavBar/AwayButton',
    component: AwayButton,
    tags: ['autodocs'],
    args: {
        isAway: false,
        sitOutNextHand: false,
        readyNextHand: false,
        handleReturnReady: () => {},
        handleSitOutNext: () => {},
        handleCancelRejoin: () => {},
    },
    argTypes: {
        isAway: { control: 'boolean' },
        sitOutNextHand: { control: 'boolean' },
        readyNextHand: { control: 'boolean' },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Sit-out / away toggle. Four states: idle, sit-out queued (playing), away, away with rejoin queued.',
            },
        },
    },
    decorators: [
        (Story: React.FC) => (
            <div style={{ padding: 16 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof AwayButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** State 4 — Playing, normal. Idle chrome chip. */
export const Idle: Story = {
    name: 'Idle (playing, no request)',
};

/** State 3 — Playing, sit-out queued. Solid pink chip. */
export const SitOutQueued: Story = {
    name: 'Sit-out next hand queued',
    args: { sitOutNextHand: true },
};

/** State 2 — Away, no rejoin queued. Solid green chip ("I'm back"). */
export const Away: Story = {
    name: 'Away (no rejoin queued)',
    args: { isAway: true },
};

/** State 1 — Away, rejoin queued. Solid green chip ("Cancel rejoin"). */
export const AwayRejoinQueued: Story = {
    name: 'Away + rejoin queued',
    args: { isAway: true, readyNextHand: true },
};

const Label = ({ children }: { children: React.ReactNode }) => (
    <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.03em"
        textTransform="uppercase"
        color="text.secondary"
        textAlign="center"
        maxW="120px"
    >
        {children}
    </Text>
);

const Cell = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <VStack spacing={2} align="center">
        {children}
        <Label>{label}</Label>
    </VStack>
);

/**
 * Gallery — all six toggle states side-by-side for visual comparison.
 * Includes both AwayButton (4 states) and LeaveButton (2 active states).
 */
export const AllStatesGallery: Story = {
    name: 'All states — gallery',
    render: () => (
        <VStack align="flex-start" spacing={6}>
            <Text fontWeight={700}>AwayButton</Text>
            <HStack spacing={6} align="flex-start">
                <Cell label="Idle (playing)">
                    <AwayButton
                        isAway={false}
                        sitOutNextHand={false}
                        readyNextHand={false}
                        handleReturnReady={() => {}}
                        handleSitOutNext={() => {}}
                        handleCancelRejoin={() => {}}
                    />
                </Cell>
                <Cell label="Sit-out queued">
                    <AwayButton
                        isAway={false}
                        sitOutNextHand={true}
                        readyNextHand={false}
                        handleReturnReady={() => {}}
                        handleSitOutNext={() => {}}
                        handleCancelRejoin={() => {}}
                    />
                </Cell>
                <Cell label="Away (no rejoin)">
                    <AwayButton
                        isAway={true}
                        sitOutNextHand={false}
                        readyNextHand={false}
                        handleReturnReady={() => {}}
                        handleSitOutNext={() => {}}
                        handleCancelRejoin={() => {}}
                    />
                </Cell>
                <Cell label="Away + rejoin queued">
                    <AwayButton
                        isAway={true}
                        sitOutNextHand={false}
                        readyNextHand={true}
                        handleReturnReady={() => {}}
                        handleSitOutNext={() => {}}
                        handleCancelRejoin={() => {}}
                    />
                </Cell>
            </HStack>

            <Text fontWeight={700} pt={4}>
                LeaveButton
            </Text>
            <HStack spacing={6} align="flex-start">
                <Cell label="Idle">
                    <LeaveButton
                        isUserSeated={true}
                        isLeaveRequested={false}
                        handleLeaveTable={() => {}}
                    />
                </Cell>
                <Cell label="Leave queued">
                    <LeaveButton
                        isUserSeated={true}
                        isLeaveRequested={true}
                        handleLeaveTable={() => {}}
                    />
                </Cell>
                <Cell label="Settlement stuck">
                    <LeaveButton
                        isUserSeated={true}
                        isLeaveRequested={false}
                        settlementStuck={true}
                        handleLeaveTable={() => {}}
                    />
                </Cell>
            </HStack>
        </VStack>
    ),
};
