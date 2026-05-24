'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { MdEventSeat } from 'react-icons/md';
import { getColorForUsername } from '@/app/utils/chatColors';

type Row = {
    name: string;
    message: string;
    timestamp: string;
    isSeated: boolean;
};

const ROWS: Row[] = [
    { name: 'vitalik', message: 'gg wp', timestamp: '14:02', isSeated: true },
    { name: 'doge', message: 'nice river', timestamp: '14:03', isSeated: false },
    { name: 'satoshi', message: 'all in baby', timestamp: '14:04', isSeated: true },
    { name: 'cz', message: 'snap call', timestamp: '14:05', isSeated: true },
    { name: 'sbf', message: 'i fold (allegedly)', timestamp: '14:06', isSeated: false },
    {
        name: 'kanye',
        message:
            'longer message to see how the timestamp sits next to wrapped text across multiple lines without any vertical drift in the alignment',
        timestamp: '14:07',
        isSeated: true,
    },
    { name: 'doge', message: 'wow such bluff', timestamp: '14:08', isSeated: false },
    { name: 'vitalik', message: 'ty', timestamp: '14:09', isSeated: true },
];

// Mirrors ChatBox.tsx itemContent so timestamp placement can be
// reviewed without booting WebSocket / AppContext / emotes.
function ChatRow({ msg, index }: { msg: Row; index: number }) {
    return (
        <Box
            width="100%"
            py={{ base: 2, md: 3 }}
            px={{ base: 4, md: 6 }}
            bg={index % 2 === 0 ? 'chat.rowEven' : 'chat.rowOdd'}
            transition="background-color 80ms ease"
            _hover={{
                bg: index % 2 === 0 ? 'chat.rowEvenHover' : 'chat.rowOddHover',
            }}
        >
            <Text
                fontSize={{ base: 'sm', md: 'sm' }}
                whiteSpace="break-spaces"
                lineHeight={{ base: '1.5', md: '1.55' }}
                display="block"
                width="100%"
                color="text.primary"
            >
                {msg.timestamp && (
                    <Text
                        as="span"
                        color="text.muted"
                        fontSize="xs"
                        fontWeight="normal"
                        mr={2}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        aria-label={`sent at ${msg.timestamp}`}
                    >
                        {msg.timestamp}
                    </Text>
                )}
                <Text
                    as="span"
                    color={getColorForUsername(msg.name)}
                    fontWeight="bold"
                    mr={2}
                >
                    {msg.isSeated && (
                        <Icon
                            as={MdEventSeat}
                            boxSize={3.5}
                            mr={1}
                            verticalAlign="middle"
                            display="inline"
                        />
                    )}
                    {msg.name}:
                </Text>
                <Text as="span">{msg.message}</Text>
            </Text>
        </Box>
    );
}

function Stage({ children }: { children: React.ReactNode }) {
    const pageBg = useColorModeValue('#ECEEF5', '#0B1430');
    const panelBg = useColorModeValue('white', 'gray.900');
    const panelBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
    return (
        <Box bg={pageBg} minH="100vh" p={{ base: 4, md: 8 }}>
            <Box
                maxW="420px"
                mx="auto"
                bg={panelBg}
                borderRadius="16px"
                border="1px solid"
                borderColor={panelBorder}
                overflow="hidden"
            >
                {children}
            </Box>
        </Box>
    );
}

const meta = {
    title: 'Chat/MessageRow (timestamps)',
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Visual confirmation of the leading `HH:MM` timestamp added to chat rows. Mirrors the markup inside ChatBox.tsx itemContent without booting WebSocket / AppContext / emotes.',
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Stage>
            {ROWS.map((msg, i) => (
                <ChatRow key={`${msg.timestamp}-${i}`} msg={msg} index={i} />
            ))}
        </Stage>
    ),
};

export const NarrowMobile: Story = {
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
    },
    render: () => (
        <Stage>
            {ROWS.map((msg, i) => (
                <ChatRow key={`${msg.timestamp}-${i}`} msg={msg} index={i} />
            ))}
        </Stage>
    ),
};

export const WithoutTimestamp: Story = {
    name: 'Legacy (no timestamp field)',
    render: () => (
        <Stage>
            {ROWS.map((msg, i) => (
                <ChatRow
                    key={i}
                    msg={{ ...msg, timestamp: '' }}
                    index={i}
                />
            ))}
        </Stage>
    ),
};
