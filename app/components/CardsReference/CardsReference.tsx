'use client';

import React from 'react';
import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import Card, { CardBack } from '../Card';
import { AppContext } from '../../contexts/AppStoreProvider';
import type { AppState, Card as CardType, CardBackVariant } from '../../interfaces';

// ─── Card encoding ───────────────────────────────────────────────────────────
// A card is encoded as (rankIndex << 8) | suitMask:
//   rankIndex: 0..12 → '2'..'A'
//   suitMask:  0x8000 Clubs · 0x4000 Diamonds · 0x2000 Hearts · 0x1000 Spades
const SUIT_MASK = { S: 0x1000, H: 0x2000, D: 0x4000, C: 0x8000 } as const;

const encodeCard = (rankIndex: number, suit: keyof typeof SUIT_MASK): CardType =>
    ((rankIndex << 8) | SUIT_MASK[suit]) as unknown as CardType;

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SUITS: { key: keyof typeof SUIT_MASK; name: string; glyph: string }[] = [
    { key: 'S', name: 'Spades', glyph: '♠' },
    { key: 'H', name: 'Hearts', glyph: '♥' },
    { key: 'D', name: 'Diamonds', glyph: '♦' },
    { key: 'C', name: 'Clubs', glyph: '♣' },
];

const CARD_BACKS: { title: string; decks: { variant: CardBackVariant; label: string }[] }[] = [
    {
        title: 'Classic',
        decks: [
            { variant: 'classic-blue', label: 'Blue (default)' },
            { variant: 'classic-red', label: 'Red' },
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
            { variant: 'pepe', label: 'Pepe' },
            { variant: 'moon', label: 'Moon-shot' },
            { variant: 'rekt', label: 'Rekt' },
        ],
    },
];

// The live <Card /> reads `fourColorDeckEnabled` + `cardBackDesign` from context.
// We override context per-section so both decks render regardless of the
// viewer's own setting.
const DeckContext = ({
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

const CARD_W = { base: '44px', sm: '52px', md: '58px' };

const CardTile = ({
    rankIndex,
    suit,
    label,
}: {
    rankIndex: number;
    suit: keyof typeof SUIT_MASK;
    label: string;
}) => (
    <VStack spacing={1.5}>
        <Box w={CARD_W}>
            <Card
                card={encodeCard(rankIndex, suit)}
                placeholder={false}
                folded={false}
                skipAnimation
            />
        </Box>
        <Text fontSize="2xs" fontWeight={600} color="text.muted" fontFamily="mono">
            {label}
        </Text>
    </VStack>
);

const SuitRow = ({ suit }: { suit: (typeof SUITS)[number] }) => (
    <Box>
        <Text
            fontSize="xs"
            fontWeight={800}
            letterSpacing="0.10em"
            textTransform="uppercase"
            color="text.secondary"
            mb={2.5}
        >
            {suit.glyph} {suit.name}
        </Text>
        <Flex gap={{ base: 2, md: 3 }} wrap="wrap">
            {RANKS.map((rank, i) => (
                <CardTile
                    key={rank}
                    rankIndex={i}
                    suit={suit.key}
                    label={`${rank}${suit.glyph}`}
                />
            ))}
        </Flex>
    </Box>
);

const Panel = ({
    title,
    desc,
    children,
}: {
    title: string;
    desc: string;
    children: React.ReactNode;
}) => (
    <Box
        bg="card.heroInnerBg"
        borderRadius="20px"
        border="1px solid"
        borderColor="border.lightGray"
        p={{ base: 5, md: 8 }}
    >
        <VStack spacing={0.5} align="start" mb={6}>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={800} color="text.primary">
                {title}
            </Text>
            <Text fontSize="sm" color="text.secondary">
                {desc}
            </Text>
        </VStack>
        {children}
    </Box>
);

const DeckPanel = ({
    title,
    desc,
    fourColor,
}: {
    title: string;
    desc: string;
    fourColor: boolean;
}) => (
    <Panel title={title} desc={desc}>
        <DeckContext fourColor={fourColor}>
            <VStack spacing={6} align="stretch">
                {SUITS.map((s) => (
                    <SuitRow key={s.key} suit={s} />
                ))}
            </VStack>
        </DeckContext>
    </Panel>
);

const CardBacksPanel = () => (
    <Panel
        title="Card backs"
        desc="Every shipping deck back. Players choose one in Settings → Display. Classic Blue is the default."
    >
        <VStack spacing={7} align="stretch">
            {CARD_BACKS.map((group) => (
                <Box key={group.title}>
                    <Text
                        fontSize="xs"
                        fontWeight={800}
                        letterSpacing="0.10em"
                        textTransform="uppercase"
                        color="text.secondary"
                        mb={3}
                    >
                        {group.title}
                    </Text>
                    <Flex gap={{ base: 3, md: 4 }} wrap="wrap">
                        {group.decks.map((d) => (
                            <VStack key={d.variant} spacing={2}>
                                <Box w={CARD_W} sx={{ borderRadius: '10%', overflow: 'hidden' }}>
                                    <CardBack variant={d.variant} idSuffix={`-cards-page-${d.variant}`} />
                                </Box>
                                <Text fontSize="2xs" fontWeight={600} color="text.muted">
                                    {d.label}
                                </Text>
                            </VStack>
                        ))}
                    </Flex>
                </Box>
            ))}
        </VStack>
    </Panel>
);

const CardsReference: React.FC = () => (
    <VStack spacing={{ base: 6, md: 8 }} align="stretch" maxW="1100px" mx="auto" w="100%">
        <VStack spacing={1} align="start">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="text.primary">
                Card Reference
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="text.secondary" maxW="640px">
                Every card we render in-game, drawn live from the production card component — the
                full 52-card deck in both color modes, plus all card backs. A reference index for
                design work.
            </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 6, md: 8 }}>
            <DeckPanel
                title="Two-color deck"
                desc="Default. Clubs & spades black, hearts & diamonds red."
                fourColor={false}
            />
            <DeckPanel
                title="Four-color deck"
                desc="Clubs green, diamonds blue, hearts red, spades black."
                fourColor={true}
            />
        </SimpleGrid>

        <CardBacksPanel />
    </VStack>
);

export default CardsReference;
