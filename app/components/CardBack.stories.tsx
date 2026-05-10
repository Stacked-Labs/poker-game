'use client';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { CardBack } from './Card';
import type { CardBackVariant } from '../interfaces';

// All shipping decks, grouped the same way the Settings select groups them.
const groups: { title: string; decks: { variant: CardBackVariant; label: string }[] }[] = [
    {
        title: 'Classic',
        decks: [
            { variant: 'classic-red', label: 'Red' },
            { variant: 'classic-blue', label: 'Blue' },
            { variant: 'classic-green', label: 'Green' },
            { variant: 'classic-black', label: 'Black' },
            { variant: 'classic-burgundy', label: 'Burgundy' },
            { variant: 'classic-teal', label: 'Teal' },
            { variant: 'classic-purple', label: 'Purple' },
        ],
    },
    {
        title: 'Crypto',
        decks: [
            { variant: 'bitcoin', label: 'Bitcoin' },
            { variant: 'ethereum', label: 'Ethereum' },
            { variant: 'base', label: 'Base' },
            { variant: 'usdc', label: 'USDC' },
        ],
    },
    {
        title: 'Crypto culture',
        decks: [
            { variant: 'pepe', label: 'Pepe (gm)' },
            { variant: 'moon', label: 'Moon-shot' },
            { variant: 'rekt', label: 'Rekt' },
        ],
    },
];

const Tile = ({ variant, label }: { variant: CardBackVariant; label: string }) => {
    const tileBg = useColorModeValue('white', '#15161E');
    const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
    const labelColor = useColorModeValue('gray.800', 'gray.100');
    return (
        <VStack
            spacing={3}
            p={4}
            bg={tileBg}
            borderRadius="14px"
            border="1px solid"
            borderColor={border}
            minW="120px"
        >
            <Box w="90px" h="120px" sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                <CardBack variant={variant} idSuffix={`-story-${variant}`} />
            </Box>
            <Text fontSize="sm" fontWeight={700} color={labelColor}>
                {label}
            </Text>
        </VStack>
    );
};

const SectionHeader = ({ title }: { title: string }) => {
    const titleColor = useColorModeValue('gray.900', 'gray.100');
    return (
        <Text
            fontSize="xs"
            fontWeight={800}
            letterSpacing="0.12em"
            color={titleColor}
            textTransform="uppercase"
        >
            {title}
        </Text>
    );
};

const meta = {
    title: 'Components / CardBack',
    component: CardBack,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'All shipping card-back variants. Players pick one in Settings → Display → Card Back. Frame is shared (solid color body + double hairline border + quiet pattern); each deck supplies its own pattern + optional centerpiece.',
            },
        },
    },
} satisfies Meta<typeof CardBack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All decks, grouped — mirrors the Settings select. */
export const AllDecks: Story = {
    name: 'All decks',
    render: () => (
        <VStack spacing={6} align="stretch">
            {groups.map((g) => (
                <VStack key={g.title} spacing={3} align="stretch">
                    <SectionHeader title={g.title} />
                    <Flex gap={4} wrap="wrap">
                        {g.decks.map((d) => (
                            <Tile key={d.variant} variant={d.variant} label={d.label} />
                        ))}
                    </Flex>
                </VStack>
            ))}
        </VStack>
    ),
};

/** Larger preview for inspecting pattern + centerpiece detail. */
export const Detail: Story = {
    name: 'Detail (large)',
    render: () => {
        const all = groups.flatMap((g) => g.decks);
        return (
            <Flex gap={6} wrap="wrap">
                {all.map((d) => (
                    <VStack key={d.variant} spacing={2}>
                        <Box w="200px" h="267px" sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                            <CardBack variant={d.variant} idSuffix={`-detail-${d.variant}`} />
                        </Box>
                        <Text fontSize="sm" fontWeight={700}>
                            {d.label}
                        </Text>
                    </VStack>
                ))}
            </Flex>
        );
    },
};

/** Each deck shown on the green felt context. */
export const OnFelt: Story = {
    name: 'On felt',
    render: () => {
        const all = groups.flatMap((g) => g.decks);
        return (
            <Box
                p={8}
                borderRadius="16px"
                bgGradient="radial(ellipse at center, #1F8A6B 0%, #0F4A38 70%, #0A3328 100%)"
            >
                <Flex gap={4} wrap="wrap">
                    {all.map((d) => (
                        <VStack key={d.variant} spacing={2}>
                            <Box w="84px" h="112px" sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                                <CardBack variant={d.variant} idSuffix={`-felt-${d.variant}`} />
                            </Box>
                            <Text fontSize="xs" fontWeight={700} color="white">
                                {d.label}
                            </Text>
                        </VStack>
                    ))}
                </Flex>
            </Box>
        );
    },
};

/** Highlighted state — used when the card is the winning hand at showdown. */
export const Highlighted: Story = {
    name: 'States — highlighted / dimmed / folded',
    render: () => (
        <Flex gap={6} wrap="wrap">
            {(['classic-blue', 'bitcoin', 'pepe'] as CardBackVariant[]).map((v) => (
                <VStack key={v} spacing={3}>
                    <Text fontSize="xs" fontWeight={800} letterSpacing="0.10em" textTransform="uppercase">
                        {v}
                    </Text>
                    <Flex gap={4}>
                        {[
                            { label: 'Default', props: {} },
                            { label: 'Highlighted', props: { highlighted: true } },
                            { label: 'Dimmed', props: { dimmed: true } },
                            { label: 'Folded', props: { folded: true } },
                        ].map((s) => (
                            <VStack key={s.label} spacing={1}>
                                <Box w="80px" h="107px" sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                                    <CardBack variant={v} idSuffix={`-state-${v}-${s.label}`} {...s.props} />
                                </Box>
                                <Text fontSize="2xs">{s.label}</Text>
                            </VStack>
                        ))}
                    </Flex>
                </VStack>
            ))}
        </Flex>
    ),
};
