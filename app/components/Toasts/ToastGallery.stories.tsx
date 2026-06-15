'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Text } from '@chakra-ui/react';
import ToastBanner, { type ToastBannerVariant } from './ToastBanner';
import ReconnectingToast from './ReconnectingToast';
import DepositSuccessToast from './DepositSuccessToast';

// One page that shows every toast variant and state at once, using the real
// in-app copy. Handy for a quick visual pass in light and dark mode.
const meta = {
    title: 'Toasts/Gallery',
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

function Caption({ children }: { children: React.ReactNode }) {
    return (
        <Text
            fontSize="2xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="text.muted"
            mt={4}
            mb={1}
            px={2}
        >
            {children}
        </Text>
    );
}

function Banner(props: {
    variant: ToastBannerVariant;
    title: string;
    description?: string;
}) {
    return (
        <Box mb={1.5}>
            <ToastBanner
                {...props}
                onClose={noop}
                autoCloseMs={0}
                animationMs={0}
            />
        </Box>
    );
}

export const Gallery: Story = {
    render: () => (
        <Box bg="card.lightGray" minH="100vh" py={4}>
            <Stack spacing={0} maxW="760px" mx="auto">
                <Text
                    fontSize="lg"
                    fontWeight="extrabold"
                    color="text.primary"
                    px={2}
                >
                    Toast system — variants &amp; states
                </Text>

                <Caption>Success — title only</Caption>
                <Banner variant="success" title="Platform fee claimed!" />
                <Banner variant="success" title="Address copied" />

                <Caption>Success — with description</Caption>
                <Banner
                    variant="success"
                    title="Guarantee funded"
                    description="Registration is open!"
                />

                <Caption>Error — title only</Caption>
                <Banner variant="error" title="Connection unavailable" />

                <Caption>Error — with description</Caption>
                <Banner
                    variant="error"
                    title="Could not register"
                    description="Please try again."
                />
                <Banner
                    variant="error"
                    title="Not enough ETH for gas"
                    description="Add a little ETH on Base to your wallet to cover the network fee, then try again."
                />

                <Caption>Warning — with description</Caption>
                <Banner
                    variant="warning"
                    title="Request cancelled"
                    description="You dismissed the request in your wallet."
                />
                <Banner
                    variant="warning"
                    title="Signature needed"
                    description="You must sign the message to use the app."
                />

                <Caption>Warning — title only</Caption>
                <Banner variant="warning" title="Connect wallet to register" />

                <Caption>Info — title only</Caption>
                <Banner variant="info" title="You're away" />
                <Banner variant="info" title="Blind change queued" />

                <Caption>Info — with description</Caption>
                <Banner
                    variant="info"
                    title="Game paused"
                    description="The Host paused the game."
                />

                <Caption>Error — long copy (wrap / truncation test)</Caption>
                <Banner
                    variant="error"
                    title="Unable to join table: the game has already started and no seats are available"
                    description="Please try another table or wait for the next hand to begin"
                />

                <Caption>Custom — deposit success (animated count-up)</Caption>
                <Box maxW="380px" mx="auto" w="100%" mb={2}>
                    <DepositSuccessToast
                        amount={100}
                        onClose={noop}
                        isCrypto={false}
                    />
                </Box>

                <Caption>Reconnecting — full-width banner (persistent)</Caption>
                <Box w="100%">
                    <ReconnectingToast onClose={noop} onReconnectNow={noop} />
                </Box>
            </Stack>
        </Box>
    ),
};
