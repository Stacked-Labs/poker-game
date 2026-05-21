'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Text } from '@chakra-ui/react';
import SeatStatusChip from './SeatStatusChip';
import { getSeatStatus, type SeatStatusKind } from '../lib/seatStatus';
import type { Player } from '../interfaces';

const meta = {
    title: 'Components / SeatStatusChip',
    component: SeatStatusChip,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Single meta-state chip for a seated player. Replaces four previously-overlapping badges (Offline / Away / Sitting out / Leaving) with one slot driven by a precedence rule in `getSeatStatus`. Anchor: top-right of the player-info box. Icon-only at `base`, icon + label at `md+`.',
            },
        },
    },
    argTypes: {
        kind: {
            control: 'select',
            options: [
                'none',
                'offline',
                'leaving',
                'sittingOut',
                'joining',
                'away',
            ] satisfies SeatStatusKind[],
        },
    },
    decorators: [
        (Story) => (
            <Flex
                bg="bg.default"
                minH="100vh"
                align="center"
                justify="center"
                p={10}
            >
                <SeatStandIn>
                    <Story />
                </SeatStandIn>
            </Flex>
        ),
    ],
} satisfies Meta<typeof SeatStatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stand-in for the seat's `player-info-container` Flex — same relative anchor the chip uses in production. */
function SeatStandIn({ children }: { children: React.ReactNode }) {
    return (
        <Box
            position="relative"
            bg="brand.darkNavy"
            borderRadius={4}
            border="2px solid"
            borderColor="brand.darkNavy"
            px={3}
            py={2}
            minW="180px"
        >
            <Text color="gray.400" fontWeight="bold">
                player_one
            </Text>
            <Text color="white" fontWeight="bold" fontSize="lg">
                500
            </Text>
            {children}
        </Box>
    );
}

export const Offline: Story = { args: { kind: 'offline' } };
export const Leaving: Story = { args: { kind: 'leaving' } };
export const SittingOut: Story = { args: { kind: 'sittingOut' } };
export const Joining: Story = { args: { kind: 'joining' } };
export const Away: Story = { args: { kind: 'away' } };
export const None: Story = { args: { kind: 'none' } };

/**
 * Drives the chip through `getSeatStatus` from `Player` flags so the precedence rule
 * (`offline > leaving > sittingOut > joining > away > none`) can be verified by toggling args.
 */
type PrecedenceArgs = {
    isOnline: boolean;
    leaveAfterHand: boolean;
    sitOutNextHand: boolean;
    ready: boolean;
    readyNextHand: boolean;
    stack: number;
    iconOnly: boolean;
    inHand: boolean;
};

export const Precedence: StoryObj<PrecedenceArgs> = {
    argTypes: {
        isOnline: { control: 'boolean' },
        leaveAfterHand: { control: 'boolean' },
        sitOutNextHand: { control: 'boolean' },
        ready: { control: 'boolean' },
        readyNextHand: { control: 'boolean' },
        stack: { control: { type: 'number', min: 0 } },
        iconOnly: { control: 'boolean' },
        inHand: { control: 'boolean' },
    },
    args: {
        isOnline: true,
        leaveAfterHand: false,
        sitOutNextHand: false,
        ready: true,
        readyNextHand: false,
        stack: 500,
        iconOnly: false,
        inHand: false,
    },
    render: (args) => {
        const player = {
            username: 'player_one',
            uuid: 'uuid',
            address: '0x0',
            position: 1,
            seatID: 1,
            ready: args.ready,
            in: args.inHand,
            called: false,
            left: false,
            totalBuyIn: 0,
            stack: args.stack,
            bet: 0,
            totalBet: 0,
            cards: [],
            readyNextHand: args.readyNextHand,
            sitOutNextHand: args.sitOutNextHand,
            leaveAfterHand: args.leaveAfterHand,
            isOnline: args.isOnline,
        } satisfies Player;
        const status = getSeatStatus(player);
        return (
            <Flex direction="column" gap={3} align="center">
                <SeatStandIn>
                    <SeatStatusChip kind={status.kind} iconOnly={args.iconOnly} />
                </SeatStandIn>
                <Text color="gray.400" fontSize="sm">
                    resolved: <b>{status.kind}</b>
                </Text>
            </Flex>
        );
    },
};
