'use client';

import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Stack,
    Text,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

/**
 * Design Spike — Group B: Table Action buttons
 *
 * Compares the current debt (Baseline) against three replacement directions
 * side-by-side, on a felt-like surface so the buttons are seen in context.
 *
 * Surfaces represented in each row:
 *   1) Primary trio        — Bet / Call / Fold (ActionButton.tsx)
 *   2) Raise presets       — 1/2 Pot / Pot / All In (raiseActionButton variant)
 *   3) Blind obligations   — Wait BB / Post Now / Sit Out (BlindObligationControls.tsx)
 *
 * Directions:
 *   A) Baseline    — what's in the repo today (gradient + shimmer + glow + lift)
 *   B) Tactile     — direct port of Group A recipe, scaled for the felt surface
 *   C) Felt-Inset  — recessed into the felt (inner shadow); button "lives in" the table
 *                    instead of floating above it. Press = pops out briefly.
 *   D) Sharp       — flat color, hard edges, no shadow. Pure functional UI tool.
 *
 * Delete this file after the user decides.
 */

// ─── App backdrop — matches the real page bg in light + dark mode.
// Uses `bg.default` semantic token from app/theme.ts so the spike shows
// buttons against the *actual* page bg users see, not a fabricated felt.
// Toggle light/dark via the Storybook toolbar.
const AppBackdrop = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <Box
        bg="bg.default"
        borderRadius="14px"
        p={4}
        border="1px solid"
        borderColor="border.lightGray"
        boxShadow="0 12px 32px rgba(0,0,0,0.10)"
    >
        <Text
            fontSize="2xs"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            mb={3}
            fontWeight={700}
        >
            {label}
        </Text>
        {children}
    </Box>
);

const RowHeader = ({ children }: { children: React.ReactNode }) => (
    <Heading
        as="h3"
        fontSize="md"
        color="text.primary"
        mb={3}
        letterSpacing="-0.01em"
    >
        {children}
    </Heading>
);

// ────────────────────────────────────────────────────────────────────────
// A. BASELINE — the current debt, transcribed from ActionButton.tsx etc.
// ────────────────────────────────────────────────────────────────────────
const shimmer = keyframes`
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const BaselineActionButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'green' | 'pink' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        green: {
            bg: '#36A37B',
            grad: 'linear-gradient(135deg, #36A37B 0%, #2d8763 100%)',
            border: 'rgba(54,163,123,0.6)',
            glow: 'rgba(54,163,123,0.4)',
            color: 'white',
        },
        pink: {
            bg: '#EB0B5C',
            grad: 'linear-gradient(135deg, #EB0B5C 0%, #c9094c 100%)',
            border: 'rgba(235,11,92,0.6)',
            glow: 'rgba(235,11,92,0.4)',
            color: 'white',
        },
        neutral: {
            bg: '#334479',
            grad: 'linear-gradient(135deg, #334479 0%, #243059 100%)',
            border: 'rgba(255,255,255,0.18)',
            glow: 'rgba(51,68,121,0.4)',
            color: 'white',
        },
    }[tone];

    return (
        <Button
            bgGradient={palette.grad}
            color={palette.color}
            border="1.5px solid"
            borderColor={palette.border}
            borderRadius="10px"
            fontWeight="bold"
            letterSpacing="0.04em"
            textTransform="uppercase"
            fontSize="sm"
            height="40px"
            flex={1}
            isDisabled={isDisabled}
            position="relative"
            overflow="hidden"
            transition="box-shadow 0.3s ease, transform 0.2s ease"
            _hover={{
                transform: 'translateY(-2px) scale(1.03)',
                boxShadow: `0 8px 24px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
            _active={{ transform: 'scale(0.95)' }}
            sx={{
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background:
                        'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                    backgroundSize: '200% 100%',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                },
                '&:hover::after': {
                    opacity: 1,
                    animation: `${shimmer} 1.5s ease-in-out infinite`,
                },
            }}
        >
            {label}
        </Button>
    );
};

const BaselinePresetButton = ({
    label,
    isDisabled,
}: {
    label: string;
    isDisabled?: boolean;
}) => (
    <Button
        flex={1}
        height="32px"
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.03em"
        bg="rgba(51, 68, 121, 0.8)"
        color="white"
        border="1px solid rgba(255,255,255,0.08)"
        borderRadius="10px"
        backdropFilter="blur(8px)"
        isDisabled={isDisabled}
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
            bg: '#36A37B',
            transform: 'translateY(-2px)',
            boxShadow:
                '0 6px 16px rgba(54,163,123,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            borderColor: 'rgba(255,255,255,0.12)',
        }}
        _active={{ transform: 'translateY(0) scale(0.96)' }}
    >
        {label}
    </Button>
);

const BaselineBlindButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'yellow' | 'green' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        yellow: { bg: 'transparent', color: '#FDC51D', border: '#FDC51D' },
        green: { bg: '#36A37B', color: 'white', border: '#36A37B' },
        neutral: {
            bg: 'transparent',
            color: 'white',
            border: 'rgba(255,255,255,0.6)',
        },
    }[tone];
    return (
        <Button
            bg={palette.bg}
            color={palette.color}
            borderColor={palette.border}
            border="2px solid"
            borderRadius="10px"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            height="40px"
            flex={1}
            isDisabled={isDisabled}
            opacity={tone === 'yellow' ? 0.85 : 1}
            transition="all 0.2s"
            _hover={{
                bg:
                    tone === 'green'
                        ? '#2d8763'
                        : tone === 'yellow'
                          ? 'rgba(253,197,29,0.12)'
                          : 'rgba(255,255,255,0.06)',
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
            }}
            _active={{ transform: 'translateY(0)' }}
        >
            {label}
        </Button>
    );
};

// ────────────────────────────────────────────────────────────────────────
// B. TACTILE — direct port of Group A recipe, scaled for the felt surface
//
// Recipe at small scale: 1px edge instead of 2px, 10px radius, 0.03em
// letter-spacing at xs font sizes, snap 80ms easing, no hover lift, press
// translateY(2px) + edge collapse + bg shifts to *Dark.
// ────────────────────────────────────────────────────────────────────────
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease';

const TactileActionButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'green' | 'pink' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        green: { bg: '#36A37B', dark: '#2A8463', edge: '#22674E' },
        pink: { bg: '#EB0B5C', dark: '#C00A4D', edge: '#950839' },
        neutral: { bg: '#334479', dark: '#243059', edge: '#171F40' },
    }[tone];
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="sm"
            fontWeight={700}
            letterSpacing="0.02em"
            textTransform="uppercase"
            bg={palette.bg}
            color="white"
            border="none"
            borderRadius="10px"
            isDisabled={isDisabled}
            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${palette.edge}`}
            transition={TACTILE_TRANSITION}
            _hover={{ bg: palette.bg }}
            _active={{
                bg: palette.dark,
                transform: 'translateY(2px)',
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${palette.edge}`,
            }}
        >
            {label}
        </Button>
    );
};

const TactilePresetButton = ({
    label,
    isDisabled,
}: {
    label: string;
    isDisabled?: boolean;
}) => (
    <Button
        flex={1}
        height="32px"
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.03em"
        textTransform="uppercase"
        bg="rgba(255,255,255,0.06)"
        color="white"
        border="1px solid"
        borderColor="rgba(255,255,255,0.14)"
        borderRadius="8px"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)"
        isDisabled={isDisabled}
        transition={TACTILE_TRANSITION}
        _hover={{
            bg: 'rgba(255,255,255,0.10)',
            borderColor: 'rgba(255,255,255,0.20)',
        }}
        _active={{
            bg: 'rgba(0,0,0,0.20)',
            transform: 'translateY(1px)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 transparent',
        }}
    >
        {label}
    </Button>
);

const TactileBlindButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'yellow' | 'green' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        yellow: {
            bg: 'transparent',
            color: '#FDC51D',
            border: '#FDC51D',
            edge: '#B78900',
            hoverBg: 'rgba(253,197,29,0.12)',
            activeBg: 'rgba(253,197,29,0.18)',
        },
        green: {
            bg: '#36A37B',
            color: 'white',
            border: 'transparent',
            edge: '#22674E',
            hoverBg: '#36A37B',
            activeBg: '#2A8463',
        },
        neutral: {
            bg: 'transparent',
            color: 'white',
            border: 'rgba(255,255,255,0.5)',
            edge: 'rgba(0,0,0,0.4)',
            hoverBg: 'rgba(255,255,255,0.08)',
            activeBg: 'rgba(255,255,255,0.12)',
        },
    }[tone];
    const isOutline = tone !== 'green';
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.03em"
            textTransform="uppercase"
            bg={palette.bg}
            color={palette.color}
            border={isOutline ? '2px solid' : 'none'}
            borderColor={palette.border}
            borderRadius="10px"
            isDisabled={isDisabled}
            boxShadow={
                isOutline
                    ? `0 2px 0 ${palette.edge}`
                    : `inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${palette.edge}`
            }
            transition={TACTILE_TRANSITION}
            _hover={{ bg: palette.hoverBg }}
            _active={{
                bg: palette.activeBg,
                transform: 'translateY(2px)',
                boxShadow: `0 0 0 ${palette.edge}`,
            }}
        >
            {label}
        </Button>
    );
};

// ────────────────────────────────────────────────────────────────────────
// C. FELT-INSET — buttons recessed into the felt
//
// Inverted shadow: instead of floating above the table, buttons sit *in*
// the felt with a subtle rim + inner highlight. Press pops out briefly.
// Tone color emerges from within rather than being applied on top.
// ────────────────────────────────────────────────────────────────────────
const FeltInsetActionButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'green' | 'pink' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        green: { core: '#36A37B', glow: 'rgba(54,163,123,0.5)' },
        pink: { core: '#EB0B5C', glow: 'rgba(235,11,92,0.5)' },
        neutral: { core: '#334479', glow: 'rgba(51,68,121,0.4)' },
    }[tone];
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="sm"
            fontWeight={700}
            letterSpacing="0.04em"
            textTransform="uppercase"
            bg={palette.core}
            color="white"
            border="1px solid rgba(0,0,0,0.4)"
            borderRadius="8px"
            isDisabled={isDisabled}
            boxShadow={`
                inset 0 1px 0 rgba(255,255,255,0.18),
                inset 0 -2px 4px rgba(0,0,0,0.25),
                0 1px 0 rgba(255,255,255,0.04),
                0 0 12px ${palette.glow}
            `}
            transition="transform 100ms ease, box-shadow 100ms ease"
            _hover={{
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.22),
                    inset 0 -2px 4px rgba(0,0,0,0.2),
                    0 1px 0 rgba(255,255,255,0.06),
                    0 0 18px ${palette.glow}
                `,
            }}
            _active={{
                transform: 'translateY(-1px)',
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.10),
                    0 4px 10px rgba(0,0,0,0.4),
                    0 0 6px ${palette.glow}
                `,
            }}
        >
            {label}
        </Button>
    );
};

const FeltInsetPresetButton = ({
    label,
    isDisabled,
}: {
    label: string;
    isDisabled?: boolean;
}) => (
    <Button
        flex={1}
        height="32px"
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.03em"
        textTransform="uppercase"
        bg="rgba(0,0,0,0.25)"
        color="rgba(255,255,255,0.85)"
        border="1px solid rgba(0,0,0,0.5)"
        borderRadius="8px"
        boxShadow="inset 0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05)"
        isDisabled={isDisabled}
        transition="all 100ms ease"
        _hover={{
            bg: 'rgba(0,0,0,0.18)',
            color: 'white',
            borderColor: 'rgba(54,163,123,0.4)',
        }}
        _active={{
            bg: 'rgba(54,163,123,0.18)',
            color: 'white',
            boxShadow:
                'inset 0 2px 3px rgba(0,0,0,0.45), 0 0 0 1px rgba(54,163,123,0.4)',
        }}
    >
        {label}
    </Button>
);

const FeltInsetBlindButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'yellow' | 'green' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        yellow: { core: '#FDC51D', glow: 'rgba(253,197,29,0.4)' },
        green: { core: '#36A37B', glow: 'rgba(54,163,123,0.5)' },
        neutral: { core: '#334479', glow: 'rgba(51,68,121,0.35)' },
    }[tone];
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.04em"
            textTransform="uppercase"
            bg={palette.core}
            color={tone === 'yellow' ? '#1A1A1A' : 'white'}
            border="1px solid rgba(0,0,0,0.4)"
            borderRadius="8px"
            isDisabled={isDisabled}
            boxShadow={`
                inset 0 1px 0 rgba(255,255,255,0.18),
                inset 0 -2px 4px rgba(0,0,0,0.22),
                0 0 10px ${palette.glow}
            `}
            transition="transform 100ms ease, box-shadow 100ms ease"
            _hover={{
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.22),
                    inset 0 -2px 4px rgba(0,0,0,0.18),
                    0 0 16px ${palette.glow}
                `,
            }}
            _active={{
                transform: 'translateY(-1px)',
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.10),
                    0 4px 10px rgba(0,0,0,0.4)
                `,
            }}
        >
            {label}
        </Button>
    );
};

// ────────────────────────────────────────────────────────────────────────
// D. SHARP — flat color, hard edges, no shadow
//
// Pure functional UI tool. No skeuomorphism, no gradients, no glow. The
// fastest visual decoder for a fast-paced surface. Hover = bg swap only,
// press = momentary tone shift. Easy on motion-reduced users.
// ────────────────────────────────────────────────────────────────────────
const SharpActionButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'green' | 'pink' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        green: { bg: '#36A37B', hover: '#2A8463', press: '#22674E' },
        pink: { bg: '#EB0B5C', hover: '#C00A4D', press: '#950839' },
        neutral: { bg: '#334479', hover: '#243059', press: '#171F40' },
    }[tone];
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="sm"
            fontWeight={800}
            letterSpacing="0.06em"
            textTransform="uppercase"
            bg={palette.bg}
            color="white"
            border="none"
            borderRadius="4px"
            boxShadow="none"
            isDisabled={isDisabled}
            transition="background-color 60ms linear"
            _hover={{ bg: palette.hover }}
            _active={{ bg: palette.press }}
        >
            {label}
        </Button>
    );
};

const SharpPresetButton = ({
    label,
    isDisabled,
}: {
    label: string;
    isDisabled?: boolean;
}) => (
    <Button
        flex={1}
        height="32px"
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.05em"
        textTransform="uppercase"
        bg="transparent"
        color="rgba(255,255,255,0.85)"
        border="1px solid rgba(255,255,255,0.20)"
        borderRadius="4px"
        boxShadow="none"
        isDisabled={isDisabled}
        transition="background-color 60ms linear, border-color 60ms linear, color 60ms linear"
        _hover={{
            bg: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.35)',
            color: 'white',
        }}
        _active={{ bg: 'rgba(255,255,255,0.12)' }}
    >
        {label}
    </Button>
);

const SharpBlindButton = ({
    label,
    tone,
    isDisabled,
}: {
    label: string;
    tone: 'yellow' | 'green' | 'neutral';
    isDisabled?: boolean;
}) => {
    const palette = {
        yellow: {
            bg: 'transparent',
            color: '#FDC51D',
            border: '#FDC51D',
            hover: 'rgba(253,197,29,0.10)',
            press: 'rgba(253,197,29,0.18)',
        },
        green: {
            bg: '#36A37B',
            color: 'white',
            border: '#36A37B',
            hover: '#2A8463',
            press: '#22674E',
        },
        neutral: {
            bg: 'transparent',
            color: 'rgba(255,255,255,0.85)',
            border: 'rgba(255,255,255,0.30)',
            hover: 'rgba(255,255,255,0.06)',
            press: 'rgba(255,255,255,0.12)',
        },
    }[tone];
    return (
        <Button
            flex={1}
            height="40px"
            fontSize="xs"
            fontWeight={800}
            letterSpacing="0.06em"
            textTransform="uppercase"
            bg={palette.bg}
            color={palette.color}
            border="1px solid"
            borderColor={palette.border}
            borderRadius="4px"
            boxShadow="none"
            isDisabled={isDisabled}
            transition="background-color 60ms linear"
            _hover={{ bg: palette.hover }}
            _active={{ bg: palette.press }}
        >
            {label}
        </Button>
    );
};

// ─── Composition helpers ────────────────────────────────────────────────
type Direction = {
    key: 'baseline' | 'tactile' | 'felt-inset' | 'sharp';
    title: string;
    note: string;
};
const DIRECTIONS: Direction[] = [
    {
        key: 'baseline',
        title: 'A · Baseline (current)',
        note: 'gradient + shimmer + glow + lift — what ships today',
    },
    {
        key: 'tactile',
        title: 'B · Tactile (Group A port)',
        note: 'chip mechanic at table scale — 1px edge, 80ms snap press',
    },
    {
        key: 'felt-inset',
        title: 'C · Felt-Inset',
        note: 'recessed into felt — color glows from within, press pops out',
    },
    {
        key: 'sharp',
        title: 'D · Sharp',
        note: 'flat color, hard edges, no shadow — pure functional',
    },
];

const ActionTrioRow = ({ dir }: { dir: Direction['key'] }) => {
    const Cmp =
        dir === 'baseline'
            ? BaselineActionButton
            : dir === 'tactile'
              ? TactileActionButton
              : dir === 'felt-inset'
                ? FeltInsetActionButton
                : SharpActionButton;
    return (
        <HStack spacing={2} width="100%">
            <Cmp label="Bet $50" tone="green" />
            <Cmp label="Call $25" tone="neutral" />
            <Cmp label="Fold" tone="pink" />
        </HStack>
    );
};

const PresetRow = ({ dir }: { dir: Direction['key'] }) => {
    const Cmp =
        dir === 'baseline'
            ? BaselinePresetButton
            : dir === 'tactile'
              ? TactilePresetButton
              : dir === 'felt-inset'
                ? FeltInsetPresetButton
                : SharpPresetButton;
    return (
        <HStack spacing={1.5} width="100%">
            <Cmp label="1/2 Pot" />
            <Cmp label="3/4 Pot" />
            <Cmp label="Pot" />
            <Cmp label="All In" />
        </HStack>
    );
};

const BlindRow = ({ dir }: { dir: Direction['key'] }) => {
    const Cmp =
        dir === 'baseline'
            ? BaselineBlindButton
            : dir === 'tactile'
              ? TactileBlindButton
              : dir === 'felt-inset'
                ? FeltInsetBlindButton
                : SharpBlindButton;
    return (
        <HStack spacing={2} width="100%">
            <Cmp label="Wait for BB" tone="yellow" />
            <Cmp label="Post Now" tone="green" />
            <Cmp label="Sit Out" tone="neutral" />
        </HStack>
    );
};

// ─── Stories ────────────────────────────────────────────────────────────
const meta: Meta = {
    title: 'Design Spikes / Group B — Table Actions',
    parameters: {
        layout: 'fullscreen',
        backgrounds: { disable: true },
    },
};
export default meta;

type Story = StoryObj;

const Container = ({ children }: { children: React.ReactNode }) => (
    <Box p={6} maxW="1200px" mx="auto">
        {children}
    </Box>
);

const DirectionBlock = ({
    dir,
    children,
}: {
    dir: Direction;
    children: React.ReactNode;
}) => (
    <Stack spacing={2}>
        <Box>
            <Text fontSize="sm" fontWeight={700} color="text.primary">
                {dir.title}
            </Text>
            <Text fontSize="xs" color="text.muted">
                {dir.note}
            </Text>
        </Box>
        {children}
    </Stack>
);

/** Side-by-side comparison of all four directions for the primary trio. */
export const PrimaryActions: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Primary action trio — Bet / Call / Fold (ActionButton.tsx)
            </RowHeader>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="At the felt — landscape">
                            <ActionTrioRow dir={dir.key} />
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Raise preset chips (1/2 Pot, 3/4 Pot, Pot, All In) — the smaller row that lives above the slider. */
export const RaisePresets: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Raise presets — 1/2 Pot / 3/4 Pot / Pot / All In
                (raiseActionButton variant)
            </RowHeader>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="At the felt — preset row">
                            <PresetRow dir={dir.key} />
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Blind obligation controls (Wait BB / Post Now / Sit Out). */
export const BlindObligations: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Blind obligations — Wait for BB / Post Now / Sit Out
                (BlindObligationControls.tsx)
            </RowHeader>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="At the felt — blind decision">
                            <BlindRow dir={dir.key} />
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** All three surfaces stacked per direction — what a full table footer looks like. */
export const FullFooterPerDirection: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Full footer per direction — primary + presets + blinds stacked
            </RowHeader>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="Full table footer surface">
                            <Stack spacing={2}>
                                <ActionTrioRow dir={dir.key} />
                                <PresetRow dir={dir.key} />
                                <BlindRow dir={dir.key} />
                            </Stack>
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Disabled-state sanity check across all directions (verifies the baseStyle filter+pointerEvents fix from Group A). */
export const DisabledStates: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Disabled states — primary trio with isDisabled
            </RowHeader>
            <Text fontSize="xs" color="text.muted" mb={4}>
                Verifies that Group A&apos;s baseStyle treatment (filter +
                pointerEvents: none) reads correctly across the new directions
                without per-variant overrides. Hover them — chips should hold
                their muted color, not vanish.
            </Text>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="Disabled — hover should not ghost">
                            <HStack spacing={2}>
                                {dir.key === 'baseline' ? (
                                    <>
                                        <BaselineActionButton
                                            label="Bet"
                                            tone="green"
                                            isDisabled
                                        />
                                        <BaselineActionButton
                                            label="Call"
                                            tone="neutral"
                                            isDisabled
                                        />
                                        <BaselineActionButton
                                            label="Fold"
                                            tone="pink"
                                            isDisabled
                                        />
                                    </>
                                ) : dir.key === 'tactile' ? (
                                    <>
                                        <TactileActionButton
                                            label="Bet"
                                            tone="green"
                                            isDisabled
                                        />
                                        <TactileActionButton
                                            label="Call"
                                            tone="neutral"
                                            isDisabled
                                        />
                                        <TactileActionButton
                                            label="Fold"
                                            tone="pink"
                                            isDisabled
                                        />
                                    </>
                                ) : dir.key === 'felt-inset' ? (
                                    <>
                                        <FeltInsetActionButton
                                            label="Bet"
                                            tone="green"
                                            isDisabled
                                        />
                                        <FeltInsetActionButton
                                            label="Call"
                                            tone="neutral"
                                            isDisabled
                                        />
                                        <FeltInsetActionButton
                                            label="Fold"
                                            tone="pink"
                                            isDisabled
                                        />
                                    </>
                                ) : (
                                    <>
                                        <SharpActionButton
                                            label="Bet"
                                            tone="green"
                                            isDisabled
                                        />
                                        <SharpActionButton
                                            label="Call"
                                            tone="neutral"
                                            isDisabled
                                        />
                                        <SharpActionButton
                                            label="Fold"
                                            tone="pink"
                                            isDisabled
                                        />
                                    </>
                                )}
                            </HStack>
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Side-by-side compact view: one row per direction across all three surfaces. Best for fast comparison. */
export const SideBySide: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Compact side-by-side — fastest direction comparison
            </RowHeader>
            <Flex gap={4} wrap="wrap">
                {DIRECTIONS.map((dir) => (
                    <Box key={dir.key} flex="1 1 280px" minW="280px">
                        <DirectionBlock dir={dir}>
                            <AppBackdrop label={dir.key}>
                                <Stack spacing={2}>
                                    <ActionTrioRow dir={dir.key} />
                                    <PresetRow dir={dir.key} />
                                    <BlindRow dir={dir.key} />
                                </Stack>
                            </AppBackdrop>
                        </DirectionBlock>
                    </Box>
                ))}
            </Flex>
        </Container>
    ),
};
