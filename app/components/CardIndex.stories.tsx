'use client';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import Card, { CardBack } from './Card';
import { AppContext } from '../contexts/AppStoreProvider';
import type { AppState, Card as CardType } from '../interfaces';

// ─── Card encoding ───────────────────────────────────────────────────────────
// The game encodes a card as (rankIndex << 8) | suitMask, where:
//   rankIndex: 0..12 → '2'..'A'
//   suitMask:  0x8000 = Clubs, 0x4000 = Diamonds, 0x2000 = Hearts, 0x1000 = Spades
const SUIT_MASK = {
    S: 0x1000,
    H: 0x2000,
    D: 0x4000,
    C: 0x8000,
} as const;

const encodeCard = (rankIndex: number, suit: keyof typeof SUIT_MASK): CardType =>
    ((rankIndex << 8) | SUIT_MASK[suit]) as unknown as CardType;

// 2..A, in dealing order. Index is the rankIndex used above.
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SUITS: { key: keyof typeof SUIT_MASK; name: string; glyph: string }[] = [
    { key: 'S', name: 'Spades', glyph: '♠' },
    { key: 'H', name: 'Hearts', glyph: '♥' },
    { key: 'D', name: 'Diamonds', glyph: '♦' },
    { key: 'C', name: 'Clubs', glyph: '♣' },
];

// ─── Minimal AppContext fixture ──────────────────────────────────────────────
// The real <Card /> reads only `fourColorDeckEnabled` and `cardBackDesign`
// from context, so a partial appState is enough to drive both decks.
const DeckProvider = ({
    fourColor,
    children,
}: {
    fourColor: boolean;
    children: React.ReactNode;
}) => (
    <AppContext.Provider
        value={{
            appState: {
                fourColorDeckEnabled: fourColor,
                cardBackDesign: 'classic-blue',
            } as unknown as AppState,
            dispatch: () => null,
        }}
    >
        {children}
    </AppContext.Provider>
);

// ─── Single card cell ────────────────────────────────────────────────────────
const CARD_W = 60; // px — 13 across fits a desktop screenshot comfortably

const CardCell = ({
    rankIndex,
    suit,
    label,
}: {
    rankIndex: number;
    suit: keyof typeof SUIT_MASK;
    label: string;
}) => {
    const labelColor = useColorModeValue('gray.500', 'gray.400');
    return (
        <VStack spacing={1.5}>
            <Box w={`${CARD_W}px`}>
                <Card
                    card={encodeCard(rankIndex, suit)}
                    placeholder={false}
                    folded={false}
                    skipAnimation
                />
            </Box>
            <Text fontSize="2xs" fontWeight={600} color={labelColor} fontFamily="mono">
                {label}
            </Text>
        </VStack>
    );
};

// ─── A full 52-card deck, one suit per row ───────────────────────────────────
const DeckGrid = ({ fourColor }: { fourColor: boolean }) => {
    const suitLabelColor = useColorModeValue('gray.700', 'gray.200');
    return (
        <DeckProvider fourColor={fourColor}>
            <VStack spacing={5} align="stretch">
                {SUITS.map((s) => (
                    <Box key={s.key}>
                        <Text
                            fontSize="xs"
                            fontWeight={800}
                            letterSpacing="0.10em"
                            textTransform="uppercase"
                            color={suitLabelColor}
                            mb={2}
                        >
                            {s.glyph} {s.name}
                        </Text>
                        <Flex gap={3} wrap="wrap">
                            {RANKS.map((rank, rankIndex) => (
                                <CardCell
                                    key={rank}
                                    rankIndex={rankIndex}
                                    suit={s.key}
                                    label={`${rank}${s.glyph}`}
                                />
                            ))}
                        </Flex>
                    </Box>
                ))}
            </VStack>
        </DeckProvider>
    );
};

const SectionTitle = ({ children, sub }: { children: React.ReactNode; sub: string }) => {
    const titleColor = useColorModeValue('gray.900', 'gray.50');
    const subColor = useColorModeValue('gray.500', 'gray.400');
    return (
        <VStack spacing={0.5} align="start" mb={4}>
            <Text fontSize="lg" fontWeight={800} color={titleColor}>
                {children}
            </Text>
            <Text fontSize="sm" color={subColor}>
                {sub}
            </Text>
        </VStack>
    );
};

const Divider = () => {
    const c = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
    return <Box h="1px" bg={c} my={10} />;
};

const meta = {
    title: 'Reference / Card Index',
    component: Card,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Designer reference sheet: every card we render in-game, drawn from the live SVG `Card` component. Shows the full 52-card deck in both the default two-color deck and the four-color deck, plus the default card back. Screenshot any card here to use as a template. (For all card-back variants see Components → CardBack.)',
            },
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One page with the whole deck in both color modes plus the default back. */
export const AllCards: Story = {
    name: 'All cards',
    render: () => (
        <Box maxW="900px">
            <SectionTitle sub="Default deck — clubs & spades black, hearts & diamonds red.">
                Two-color deck
            </SectionTitle>
            <DeckGrid fourColor={false} />

            <Divider />

            <SectionTitle sub="Four-color deck — clubs green, diamonds blue, hearts red, spades black.">
                Four-color deck
            </SectionTitle>
            <DeckGrid fourColor={true} />

            <Divider />

            <SectionTitle sub="Shown face-down. Default is Classic Blue.">
                Default card back
            </SectionTitle>
            <Box w={`${CARD_W}px`} sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                <CardBack variant="classic-blue" idSuffix="-card-index-default" />
            </Box>
        </Box>
    ),
};
