'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { LuRabbit } from 'react-icons/lu';
import CardComponent from '../Card';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SoundContext } from '@/app/contexts/SoundProvider';
import type {
    AppState,
    Card as CardType,
    CardBackVariant,
    Game,
} from '@/app/interfaces';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const makeGame = (): Game => ({
    running: true,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 1,
    communityCards: [0, 0, 0, 0, 0] as unknown as CardType[],
    stage: 0,
    betting: true,
    config: { maxBuyIn: 10_000, bb: 20, sb: 10, rabbitHuntEnabled: true },
    players: [],
    pots: [],
    minRaise: 40,
    readyCount: 0,
    paused: false,
    actionDeadline: 0,
});

const makeAppState = (
    cardBackDesign: CardBackVariant = 'classic-blue'
): AppState => ({
    messages: [],
    logs: [],
    username: 'sb.eth',
    clientID: 'sb',
    address: '0x',
    table: 'sb',
    game: makeGame(),
    volume: 0,
    chatSoundEnabled: false,
    chatOverlayEnabled: false,
    fourColorDeckEnabled: false,
    cardBackDesign,
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: false,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: false,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
});

const silentSound = { play: () => {}, stop: () => {}, isReady: () => true };

const Providers: React.FC<{
    children: React.ReactNode;
    cardBack?: CardBackVariant;
}> = ({ children, cardBack = 'classic-blue' }) => (
    <AppContext.Provider
        value={{ appState: makeAppState(cardBack), dispatch: () => null }}
    >
        <SoundContext.Provider value={silentSound}>
            {children}
        </SoundContext.Provider>
    </AppContext.Provider>
);

const CardBackFrame: React.FC<{
    width: number;
    children?: React.ReactNode;
}> = ({ width, children }) => (
    <Box position="relative" width={`${width}px`} sx={{ aspectRatio: '3 / 4' }}>
        <CardComponent
            card={'0' as unknown as CardType}
            placeholder={false}
            folded={false}
        />
        {children && (
            <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                userSelect="none"
                borderRadius="10%"
                overflow="hidden"
            >
                {children}
            </Box>
        )}
    </Box>
);

// ─── Enlarged folded-corner with rabbit ─────────────────────────────────────
// Fold size controls: triangle covers the top-right corner, with a rabbit
// icon sitting on the exposed area, rotated -45° to follow the diagonal fold.
// Color is the only variable we're iterating on.

type FoldColor = {
    fill: string; // triangle background (prefer transparent dark tints)
    icon: string; // rabbit color
    shadowDiag?: string;
    backdrop?: string; // optional backdrop-filter
    iconGlow?: string; // optional drop-shadow for icon legibility
};

const FoldedCorner: React.FC<{ color: FoldColor; foldPct?: number }> = ({
    color,
    foldPct = 38,
}) => {
    const w = `${foldPct}%`;
    // Max icon size ≈ foldPct/2 (bbox bottom-left on hypotenuse). Foldpct
    // bumped to 38 so the rabbit can grow ~50% without escaping the triangle.
    const iconSize = foldPct * 0.4;
    const iconOffset = foldPct * 0.1;
    return (
        <Box position="absolute" inset={0}>
            {/* Triangle of the fold — transparent tint layered atop the card back */}
            <Box
                position="absolute"
                top={0}
                right={0}
                w={w}
                sx={{
                    aspectRatio: '1 / 1',
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                    background: color.fill,
                    backdropFilter: color.backdrop ?? 'blur(1px)',
                }}
            />
            {/* Crease / fold shadow along the diagonal */}
            <Box
                position="absolute"
                top={0}
                right={0}
                w={w}
                sx={{
                    aspectRatio: '1 / 1',
                    background: `linear-gradient(to bottom left, transparent 47%, ${color.shadowDiag ?? 'rgba(0,0,0,0.55)'} 48%, ${color.shadowDiag ?? 'rgba(0,0,0,0.55)'} 52%, transparent 53%)`,
                }}
            />
            {/* Rabbit icon — upright, centered within the triangle */}
            <Box
                position="absolute"
                top={`${iconOffset}%`}
                right={`${iconOffset}%`}
                w={`${iconSize}%`}
                sx={{ aspectRatio: '1 / 1' }}
                color={color.icon}
                display="flex"
                alignItems="center"
                justifyContent="center"
                filter={color.iconGlow}
            >
                <LuRabbit size="100%" />
            </Box>
        </Box>
    );
};

// ─── Color variants ─────────────────────────────────────────────────────────
// Every variant is subtle enough to feel like a quiet flag, not a stamp.

const VARIANTS: Array<{
    id: string;
    label: string;
    blurb: string;
    color: FoldColor;
}> = [
    {
        id: 'v1',
        label: 'V1. Dark tint + white 70%',
        blurb: 'Black tint @ 55%. Rabbit in white at 70% opacity — overlay feel, blends into the shadow instead of stamping on top.',
        color: {
            fill: 'rgba(0, 0, 0, 0.55)',
            icon: 'rgba(255, 255, 255, 0.5)',
        },
    },
    {
        id: 'v2',
        label: 'V2. Dark tint + white 40%',
        blurb: 'Same dark tint, rabbit even quieter. Feels fully embedded in the shadow.',
        color: {
            fill: 'rgba(0, 0, 0, 0.55)',
            icon: 'rgba(255, 255, 255, 0.4)',
        },
    },
    {
        id: 'v3',
        label: 'V3. Deep navy tint + ivory 45%',
        blurb: 'Brand navy tint instead of pure black. Warm ivory rabbit washed into the shadow.',
        color: {
            fill: 'rgba(11, 20, 48, 0.65)',
            icon: 'rgba(236, 238, 245, 0.45)',
        },
    },
    {
        id: 'v4',
        label: 'V4. Gradient shadow + white 55%',
        blurb: 'Darkest at the corner, fades toward the crease — reads like real shadow cast by the lifted flap.',
        color: {
            fill: 'linear-gradient(225deg, rgba(0,0,0,0.7), rgba(0,0,0,0.25))',
            icon: 'rgba(255, 255, 255, 0.55)',
        },
    },
    {
        id: 'v5',
        label: 'V5. Dark tint + pink-tinted white 50%',
        blurb: 'Dark corner. Rabbit has a faint pink wash — hint of brand without a color stamp.',
        color: {
            fill: 'rgba(0, 0, 0, 0.55)',
            icon: 'rgba(255, 210, 225, 0.5)',
        },
    },
    {
        id: 'v6',
        label: 'V6. Pink-wash dark + white 50%',
        blurb: 'Dark tint with subtle pink diagonal — brand DNA bleeds in without dominating. Rabbit near-dissolved.',
        color: {
            fill: 'linear-gradient(135deg, rgba(235, 11, 92, 0.22), rgba(0,0,0,0.6))',
            icon: 'rgba(255, 255, 255, 0.5)',
        },
    },
];

const CARD_BACKS: CardBackVariant[] = [
    'classic-blue',
    'bitcoin',
    'ethereum',
    'base',
    'usdc',
];

// ─── Felt ───────────────────────────────────────────────────────────────────
const Felt: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
        bg="#1B5E3F"
        bgGradient="radial(#2A7A52, #134029)"
        p="24px 32px"
        borderRadius="100px"
        boxShadow="inset 0 0 40px rgba(0,0,0,0.45)"
        display="inline-block"
    >
        {children}
    </Box>
);

// ─── Stories ────────────────────────────────────────────────────────────────
const meta: Meta = {
    title: 'Felt/RabbitHuntOverlayOptions',
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'table',
            values: [{ name: 'table', value: '#0a1f14' }],
        },
    },
};
export default meta;
type Story = StoryObj;

// 1. MATRIX — each color variant × each card back
export const ColorMatrix: Story = {
    render: () => (
        <VStack spacing={5} align="stretch" p={6}>
            <Text color="gray.100" fontSize="md" fontWeight="700">
                Folded-corner + rabbit — color exploration × card backs
            </Text>
            <HStack spacing={4} pl="260px" pb={2}>
                {CARD_BACKS.map((back) => (
                    <Text
                        key={back}
                        w="92px"
                        color="gray.400"
                        fontSize="xs"
                        textAlign="center"
                        textTransform="capitalize"
                    >
                        {back}
                    </Text>
                ))}
            </HStack>
            {VARIANTS.map((v) => (
                <HStack
                    key={v.id}
                    spacing={4}
                    align="center"
                    pt={3}
                    borderTop="1px solid"
                    borderColor="whiteAlpha.100"
                >
                    <VStack w="260px" align="start" spacing={1} pr={2}>
                        <Text color="gray.100" fontSize="sm" fontWeight="600">
                            {v.label}
                        </Text>
                        <Text
                            color="gray.400"
                            fontSize="xs"
                            lineHeight="1.4"
                        >
                            {v.blurb}
                        </Text>
                    </VStack>
                    {CARD_BACKS.map((back) => (
                        <Box key={back} w="92px">
                            <Providers cardBack={back}>
                                <CardBackFrame width={92}>
                                    <FoldedCorner color={v.color} />
                                </CardBackFrame>
                            </Providers>
                        </Box>
                    ))}
                </HStack>
            ))}
        </VStack>
    ),
};

// 2. Parade — each variant across all card backs on felt
const Parade: React.FC<{ variantId: string }> = ({ variantId }) => {
    const v = VARIANTS.find((x) => x.id === variantId)!;
    return (
        <VStack spacing={4} align="center">
            <Text color="gray.100" fontSize="sm" fontWeight="600">
                {v.label}
            </Text>
            <Text
                color="gray.400"
                fontSize="xs"
                maxW="520px"
                textAlign="center"
            >
                {v.blurb}
            </Text>
            <Felt>
                <HStack spacing={3}>
                    {CARD_BACKS.map((back) => (
                        <VStack key={back} spacing={2}>
                            <Providers cardBack={back}>
                                <CardBackFrame width={80}>
                                    <FoldedCorner color={v.color} />
                                </CardBackFrame>
                            </Providers>
                            <Text
                                color="gray.400"
                                fontSize="xs"
                                textTransform="capitalize"
                            >
                                {back}
                            </Text>
                        </VStack>
                    ))}
                </HStack>
            </Felt>
        </VStack>
    );
};

export const Parade_V1_MutedRose: Story = {
    render: () => <Parade variantId="v1" />,
};
export const Parade_V2_SoftAmber: Story = {
    render: () => <Parade variantId="v2" />,
};
export const Parade_V3_Ivory: Story = {
    render: () => <Parade variantId="v3" />,
};
export const Parade_V4_Slate: Story = {
    render: () => <Parade variantId="v4" />,
};
export const Parade_V5_Wine: Story = {
    render: () => <Parade variantId="v5" />,
};
export const Parade_V6_PinkFaded: Story = {
    render: () => <Parade variantId="v6" />,
};

// 3. Fold-size scan — dial in how big the fold should be (using muted rose)
export const FoldSizeScan: Story = {
    render: () => {
        const v = VARIANTS[0];
        const folds = [24, 28, 32, 36, 42];
        return (
            <Providers>
                <VStack spacing={4} align="center" p={4}>
                    <Text color="gray.100" fontSize="sm" fontWeight="600">
                        Fold-size exploration — using {v.label}
                    </Text>
                    <HStack spacing={5} align="end">
                        {folds.map((f) => (
                            <VStack key={f} spacing={2}>
                                <CardBackFrame width={110}>
                                    <FoldedCorner
                                        color={v.color}
                                        foldPct={f}
                                    />
                                </CardBackFrame>
                                <Text color="gray.400" fontSize="xs">
                                    {f}%
                                </Text>
                            </VStack>
                        ))}
                    </HStack>
                </VStack>
            </Providers>
        );
    },
};

// 4. Size scale per variant
const SizeScale: React.FC<{ variantId: string }> = ({ variantId }) => {
    const v = VARIANTS.find((x) => x.id === variantId)!;
    const sizes = [48, 64, 80, 110, 160];
    return (
        <Providers>
            <VStack spacing={4} align="center" p={4}>
                <Text color="gray.100" fontSize="sm" fontWeight="600">
                    {v.label} — size scale
                </Text>
                <HStack spacing={5} align="end">
                    {sizes.map((s) => (
                        <VStack key={s} spacing={2}>
                            <CardBackFrame width={s}>
                                <FoldedCorner color={v.color} />
                            </CardBackFrame>
                            <Text color="gray.400" fontSize="xs">
                                {s}px
                            </Text>
                        </VStack>
                    ))}
                </HStack>
            </VStack>
        </Providers>
    );
};

export const Scale_V1: Story = { render: () => <SizeScale variantId="v1" /> };
export const Scale_V2: Story = { render: () => <SizeScale variantId="v2" /> };
export const Scale_V3: Story = { render: () => <SizeScale variantId="v3" /> };
export const Scale_V4: Story = { render: () => <SizeScale variantId="v4" /> };
export const Scale_V5: Story = { render: () => <SizeScale variantId="v5" /> };
export const Scale_V6: Story = { render: () => <SizeScale variantId="v6" /> };
