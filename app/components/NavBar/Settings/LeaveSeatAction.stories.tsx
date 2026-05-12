'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, DarkMode } from '@chakra-ui/react';
import LeaveSeatAction from './LeaveSeatAction';

const meta = {
    title: 'Components/Settings/LeaveSeatAction',
    component: LeaveSeatAction,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box
                p={6}
                bg="card.white"
                minH="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Story />
            </Box>
        ),
    ],
    argTypes: {
        isLeaveRequested: {
            control: 'boolean',
            description:
                'When true, renders the solid pink "Cancel leave" chip. When false, the outline pink "Leave seat" idle state.',
        },
        settlementStuck: {
            control: 'boolean',
            description:
                'When true, disables the button and swaps the tooltip copy. Used while on-chain settlement is in flight.',
        },
        width: {
            control: 'text',
            description:
                'Optional width override. Defaults to auto (consumer-sized). Pass "100%" for full-width modal CTAs.',
        },
        height: {
            control: 'text',
            description:
                'Optional height override. Defaults to the card chip size; pass "56px" for full-width modal CTAs.',
        },
    },
    args: {
        onClick: () => undefined,
        isLeaveRequested: false,
        settlementStuck: false,
    },
} satisfies Meta<typeof LeaveSeatAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle "Leave seat" — pink outline. Default chip size (matches `WithdrawBalanceCard`). */
export const Idle: Story = {};

/** Queued "Cancel leave" — solid pink. Click again to cancel the leave-after-hand request. */
export const LeaveRequested: Story = {
    args: { isLeaveRequested: true },
};

/** Stuck — disabled while settlement is in progress. */
export const SettlementStuck: Story = {
    args: { settlementStuck: true },
};

/** Modal size — full-width 56px tall, the size used inside `WithdrawButton`'s modal footer. */
export const ModalSize: Story = {
    args: { width: '100%', height: '56px' },
    decorators: [
        (Story) => (
            <Box width="360px" bg="card.white" p={6}>
                <Story />
            </Box>
        ),
    ],
};

/** Modal size + queued — same setting but with leave already requested. */
export const ModalSizeLeaveRequested: Story = {
    args: { width: '100%', height: '56px', isLeaveRequested: true },
    decorators: [
        (Story) => (
            <Box width="360px" bg="card.white" p={6}>
                <Story />
            </Box>
        ),
    ],
};

/** Dark mode — verify visual parity. */
export const Dark: Story = {
    decorators: [
        (Story) => (
            <DarkMode>
                <Box p={6} bg="card.darkNavy" minH="80px" display="flex" alignItems="center" justifyContent="center">
                    <Story />
                </Box>
            </DarkMode>
        ),
    ],
};
