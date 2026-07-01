import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Text } from '@chakra-ui/react';
import SeatName from './SeatName';

// SeatName in a realistic seat name-slot (~86px). Idle overflowing names fade at
// the edge; the active seat marquees the full name. Short names show in full with
// no treatment. (The marquee is time-based — a screenshot catches one frame.)

const NAME_SLOT = '86px';

function Slot({
    label,
    active = false,
    href = null,
    long,
}: {
    label: string;
    active?: boolean;
    href?: string | null;
    long?: boolean;
}) {
    return (
        <Flex direction="column" gap={2} align="flex-start">
            <Flex
                bg={active ? 'white' : 'brand.darkNavy'}
                border="2px solid"
                borderColor={active ? '#334479' : 'brand.darkNavy'}
                borderRadius={4}
                px={2}
                py={1}
                align="center"
                gap={2}
                width="150px"
            >
                <Box boxSize="40px" borderRadius="4px" bg="#2f7d5b" flexShrink={0} />
                <Flex direction="column" minWidth={0} flex={1}>
                    <Box width={NAME_SLOT}>
                        <SeatName
                            label={label}
                            href={href}
                            active={active}
                            color={active ? 'gray.500' : 'gray.400'}
                            fontSize="13px"
                        />
                    </Box>
                    <Text
                        fontWeight="bold"
                        fontSize="16px"
                        color={active ? 'brand.darkNavy' : 'white'}
                        lineHeight={1}
                    >
                        33,460
                    </Text>
                </Flex>
            </Flex>
            <Text fontSize="11px" color="gray.500">
                {active ? 'ACTIVE (marquee)' : 'idle (fade edge)'}
                {long ? ' — overflows' : ''}
            </Text>
        </Flex>
    );
}

const meta = {
    title: 'Components/SeatName',
    component: SeatName,
    parameters: { layout: 'centered' },
} satisfies Meta<typeof SeatName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
    render: () => (
        <Flex direction="column" gap={7} p={6} bg="#0d1424">
            <Slot label="alice.eth" />
            <Slot label="@KaloyanMitev00" href="https://x.com/x" long />
            <Slot label="@KaloyanMitev00" href="https://x.com/x" long active />
            <Slot label="Kaloyan Mitev the Magnificent" long />
            <Slot label="Kaloyan Mitev the Magnificent" long active />
        </Flex>
    ),
};

export const IdleFade: Story = {
    render: () => <Slot label="@KaloyanMitev00" href="https://x.com/x" long />,
};

export const ActiveMarquee: Story = {
    render: () => (
        <Slot label="@KaloyanMitev00" href="https://x.com/x" long active />
    ),
};
