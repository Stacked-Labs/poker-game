'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Text } from '@chakra-ui/react';
import ConnectXPrompt from './ConnectXPrompt';

const meta = {
    title: 'Components / ConnectXPrompt',
    component: ConnectXPrompt,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Compact pill-shaped prompt that floats above a seated avatar to nudge the local player to link X. Single-row: label, X-brand tactile button, dismiss. Surface uses card.white with hairline outline + soft shadow so both color modes work. The X button matches the recipe in Settings/ConnectXSection so all X buttons in the app feel like one component.',
            },
        },
    },
    args: {
        isOpen: true,
        onConnect: () => {},
        onDismiss: () => {},
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
                <Box position="relative">
                    <Story />
                    {/* Stand-in avatar — what the prompt floats above in production. */}
                    <Flex
                        w="56px"
                        h="56px"
                        borderRadius="6px"
                        bg="brand.green"
                        align="center"
                        justify="center"
                        boxShadow="0 0 0 2px rgba(255,255,255,0.2)"
                    >
                        <Text color="white" fontWeight={800} fontSize="lg">
                            DI
                        </Text>
                    </Flex>
                </Box>
            </Flex>
        ),
    ],
} satisfies Meta<typeof ConnectXPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default open state floating above a stand-in avatar. Toggle color mode in the toolbar to verify both themes. */
export const Default: Story = {};
