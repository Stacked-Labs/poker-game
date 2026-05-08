'use client';

import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Icon,
    IconButton,
    Stack,
    Text,
} from '@chakra-ui/react';
import {
    FiSettings,
    FiMessageSquare,
    FiLogOut,
    FiMenu,
} from 'react-icons/fi';
import {
    IoVolumeHigh,
    IoVolumeMute,
} from 'react-icons/io5';
import { FaUserCheck, FaCoffee, FaCoins, FaPause, FaPlay } from 'react-icons/fa';

/**
 * Design Spike — Group C: Table Chrome buttons
 *
 * Compares 4 directions for the table NavBar chrome surface (settings,
 * volume, chat, away, leave, withdraw, pause/play, burger). These are
 * *utility, not action* — they should read as secondary chrome, not as
 * primary CTAs.
 *
 * Directions:
 *   A) Baseline    — current `gameSettingsButton` variant + ad-hoc inline
 *                    styles (glass blur + hover lift + glow shadow + scale press)
 *   B) Tactile     — Group A/B port at chrome scale: 1px edge, snap 80ms
 *                    press, no hover lift. Recognizable as "the same family
 *                    as the action buttons" — but quieter.
 *   C) Ghost       — even quieter: transparent bg, only icon visible, hover
 *                    fills bg subtly. No edge, no shadow. For chrome that
 *                    really shouldn't shout.
 *   D) Felt-Inset  — buttons recessed into the felt. Good when chrome should
 *                    feel like physical inlays in the table rather than
 *                    floating chips.
 *
 * Toggle states (active vs inactive — e.g. Away requested, Leave requested,
 * Volume muted) are shown in DEDICATED rows so we can verify each direction
 * handles the inverted-look case.
 *
 * Delete this file after the user decides.
 */

// ─── App backdrop — matches the real page bg in light + dark mode.
// Uses the `bg.default` semantic token from app/theme.ts so the spike
// shows buttons against the *actual* page background users see, not a
// fabricated felt color. Toggle light/dark via the Storybook toolbar.
const AppBackdrop = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => {
    return (
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
};

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

// All chrome IconButtons share the same fixed dimensions in NavBar
const CHROME_DIMS = { w: '48px', h: '48px', radius: '12px' };

// ────────────────────────────────────────────────────────────────────────
// A. BASELINE — current gameSettingsButton + ad-hoc inline styles
// ────────────────────────────────────────────────────────────────────────
const baselineChromeBase = {
    bg: 'btn.lightGray',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'transparent',
    borderRadius: CHROME_DIMS.radius,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    _hover: {
        bg: 'brand.navy',
        color: 'white',
        transform: 'translateY(-2px)',
        boxShadow:
            '0 8px 24px rgba(51, 68, 121, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    _active: { transform: 'translateY(0) scale(0.97)' },
};

const BaselineChrome = ({
    icon,
    label,
    isActive,
    activeTone = 'green',
}: {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    activeTone?: 'green' | 'pink' | 'yellow';
}) => {
    const activeMap = {
        green: { bg: 'brand.green', glow: 'rgba(54,163,123,0.4)' },
        pink: { bg: 'brand.pink', glow: 'rgba(235,11,92,0.4)' },
        yellow: { bg: 'brand.yellow', glow: 'rgba(253,197,29,0.4)' },
    };
    const a = activeMap[activeTone];
    return (
        <IconButton
            aria-label={label}
            icon={<Icon as={icon} boxSize={5} />}
            w={CHROME_DIMS.w}
            h={CHROME_DIMS.h}
            {...baselineChromeBase}
            {...(isActive
                ? {
                      bg: a.bg,
                      color: 'white',
                      _hover: {
                          bg: a.bg,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${a.glow}`,
                      },
                  }
                : {})}
        />
    );
};

const BaselineWithdraw = () => (
    <Button
        leftIcon={<Icon as={FaCoins} boxSize={4} />}
        h={CHROME_DIMS.h}
        bg="brand.yellow"
        color="white"
        border="none"
        borderRadius={CHROME_DIMS.radius}
        fontWeight="semibold"
        fontSize="sm"
        _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(253, 197, 29, 0.4)',
        }}
        transition="all 0.2s ease"
    >
        Withdraw
    </Button>
);

// ────────────────────────────────────────────────────────────────────────
// B. TACTILE — Group A/B port at chrome scale
//
// Same family as primary actions but quieter: lower-contrast bg, 1px edge
// (matches chrome's 40-48px scale), snap 80ms press. Active toggle states
// flip to brand color with the chip mechanic preserved.
// ────────────────────────────────────────────────────────────────────────
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease';

const TactileChrome = ({
    icon,
    label,
    isActive,
    activeTone = 'green',
}: {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    activeTone?: 'green' | 'pink' | 'yellow';
}) => {
    const activeMap = {
        green: { bg: 'brand.green', dark: 'brand.greenDark', edge: '#22674E' },
        pink: { bg: 'brand.pink', dark: 'brand.pinkDark', edge: '#950839' },
        yellow: {
            bg: 'brand.yellow',
            dark: 'brand.yellowDark',
            edge: '#7E5F00',
        },
    };
    const a = activeMap[activeTone];

    if (isActive) {
        // Active toggles: solid brand fill — works on either page bg.
        return (
            <IconButton
                aria-label={label}
                icon={<Icon as={icon} boxSize={5} />}
                w={CHROME_DIMS.w}
                h={CHROME_DIMS.h}
                bg={a.bg}
                color="white"
                border="none"
                borderRadius={CHROME_DIMS.radius}
                boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${a.edge}`}
                transition={TACTILE_TRANSITION}
                _hover={{ bg: a.bg }}
                _active={{
                    bg: a.dark,
                    transform: 'translateY(2px)',
                    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${a.edge}`,
                }}
            />
        );
    }

    // Inactive — mode-aware so the chip is visible on both light page bg
    // (#EDEDED) and dark page bg (#191919).
    return (
        <IconButton
            aria-label={label}
            icon={<Icon as={icon} boxSize={5} />}
            w={CHROME_DIMS.w}
            h={CHROME_DIMS.h}
            bg="rgba(0,0,0,0.05)"
            color="text.secondary"
            border="1px solid"
            borderColor="rgba(0,0,0,0.10)"
            borderRadius={CHROME_DIMS.radius}
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.50), 0 1px 0 rgba(0,0,0,0.10)"
            transition={TACTILE_TRANSITION}
            _hover={{
                bg: 'rgba(0,0,0,0.08)',
                borderColor: 'rgba(0,0,0,0.18)',
            }}
            _active={{
                bg: 'rgba(0,0,0,0.12)',
                transform: 'translateY(1px)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), 0 0 0 transparent',
            }}
            _dark={{
                bg: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.85)',
                borderColor: 'rgba(255,255,255,0.14)',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)',
                _hover: {
                    bg: 'rgba(255,255,255,0.10)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.20)',
                },
                _active: {
                    bg: 'rgba(0,0,0,0.20)',
                    transform: 'translateY(1px)',
                    boxShadow:
                        'inset 0 1px 2px rgba(0,0,0,0.30), 0 0 0 transparent',
                },
            }}
        />
    );
};

// Withdraw is a brand.yellow chip — it's the same on both modes, but the
// color value is solid and contrasts fine against either page bg.
const TactileWithdraw = () => (
    <Button
        leftIcon={<Icon as={FaCoins} boxSize={4} />}
        h={CHROME_DIMS.h}
        bg="brand.yellow"
        color="#1A1A1A"
        border="none"
        borderRadius={CHROME_DIMS.radius}
        fontWeight={700}
        fontSize="sm"
        letterSpacing="0.02em"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 0 #7E5F00"
        transition={TACTILE_TRANSITION}
        _hover={{ bg: 'brand.yellow' }}
        _active={{
            bg: 'brand.yellowDark',
            transform: 'translateY(2px)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #7E5F00',
        }}
    >
        Withdraw
    </Button>
);

// ────────────────────────────────────────────────────────────────────────
// C. GHOST — transparent bg, icon-only
//
// For chrome that should be invisible until needed. No edge, no shadow,
// no border in the resting state. Hover fills a subtle bg. Active toggle
// states get a soft tinted bg (not full brand fill).
// ────────────────────────────────────────────────────────────────────────
const GhostChrome = ({
    icon,
    label,
    isActive,
    activeTone = 'green',
}: {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    activeTone?: 'green' | 'pink' | 'yellow';
}) => {
    const activeMap = {
        green: {
            bg: 'rgba(54,163,123,0.18)',
            color: 'brand.green',
            hover: 'rgba(54,163,123,0.26)',
        },
        pink: {
            bg: 'rgba(235,11,92,0.18)',
            color: 'brand.pink',
            hover: 'rgba(235,11,92,0.26)',
        },
        yellow: {
            bg: 'rgba(253,197,29,0.18)',
            color: 'brand.yellow',
            hover: 'rgba(253,197,29,0.26)',
        },
    };
    const a = activeMap[activeTone];

    return (
        <IconButton
            aria-label={label}
            icon={<Icon as={icon} boxSize={5} />}
            w={CHROME_DIMS.w}
            h={CHROME_DIMS.h}
            bg={isActive ? a.bg : 'transparent'}
            color={isActive ? a.color : 'text.muted'}
            border="none"
            borderRadius={CHROME_DIMS.radius}
            boxShadow="none"
            transition="background-color 100ms ease, color 100ms ease"
            _hover={{
                bg: isActive ? a.hover : 'rgba(0,0,0,0.06)',
                color: isActive ? a.color : 'text.primary',
            }}
            _active={{
                bg: isActive ? a.hover : 'rgba(0,0,0,0.10)',
            }}
            _dark={{
                color: isActive ? a.color : 'rgba(255,255,255,0.65)',
                _hover: {
                    bg: isActive ? a.hover : 'rgba(255,255,255,0.08)',
                    color: isActive ? a.color : 'white',
                },
                _active: {
                    bg: isActive ? a.hover : 'rgba(255,255,255,0.14)',
                },
            }}
        />
    );
};

// Ghost-Withdraw uses brand.yellow border + text — readable on both modes
// since brand.yellow is high-contrast against both #EDEDED and #191919.
const GhostWithdraw = () => (
    <Button
        leftIcon={<Icon as={FaCoins} boxSize={4} />}
        h={CHROME_DIMS.h}
        bg="transparent"
        color="brand.yellowDark"
        border="1px solid"
        borderColor="rgba(183,137,0,0.50)"
        borderRadius={CHROME_DIMS.radius}
        fontWeight={700}
        fontSize="sm"
        letterSpacing="0.02em"
        transition="background-color 100ms ease, border-color 100ms ease"
        _hover={{
            bg: 'rgba(253,197,29,0.10)',
            borderColor: 'rgba(183,137,0,0.80)',
        }}
        _active={{ bg: 'rgba(253,197,29,0.18)' }}
        _dark={{
            color: 'brand.yellow',
            borderColor: 'rgba(253,197,29,0.40)',
            _hover: {
                bg: 'rgba(253,197,29,0.10)',
                borderColor: 'rgba(253,197,29,0.65)',
            },
            _active: { bg: 'rgba(253,197,29,0.18)' },
        }}
    >
        Withdraw
    </Button>
);

// ────────────────────────────────────────────────────────────────────────
// D. FELT-INSET — recessed into the felt
//
// Chrome chips that feel embedded in the table cloth. Inner shadow gives
// the recessed look; subtle outer glow in the tone color when active.
// Press = pop out briefly.
// ────────────────────────────────────────────────────────────────────────
const FeltInsetChrome = ({
    icon,
    label,
    isActive,
    activeTone = 'green',
}: {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    activeTone?: 'green' | 'pink' | 'yellow';
}) => {
    const activeMap = {
        green: { core: 'brand.green', glow: 'rgba(54,163,123,0.45)' },
        pink: { core: 'brand.pink', glow: 'rgba(235,11,92,0.45)' },
        yellow: { core: 'brand.yellow', glow: 'rgba(253,197,29,0.45)' },
    };
    const a = activeMap[activeTone];

    if (isActive) {
        return (
            <IconButton
                aria-label={label}
                icon={<Icon as={icon} boxSize={5} />}
                w={CHROME_DIMS.w}
                h={CHROME_DIMS.h}
                bg={a.core}
                color={activeTone === 'yellow' ? '#1A1A1A' : 'white'}
                border="1px solid rgba(0,0,0,0.4)"
                borderRadius="10px"
                boxShadow={`
                    inset 0 1px 0 rgba(255,255,255,0.18),
                    inset 0 -2px 4px rgba(0,0,0,0.22),
                    0 0 12px ${a.glow}
                `}
                transition="transform 100ms ease, box-shadow 100ms ease"
                _hover={{
                    boxShadow: `
                        inset 0 1px 0 rgba(255,255,255,0.22),
                        inset 0 -2px 4px rgba(0,0,0,0.18),
                        0 0 18px ${a.glow}
                    `,
                }}
                _active={{
                    transform: 'translateY(-1px)',
                    boxShadow: `
                        inset 0 1px 0 rgba(255,255,255,0.10),
                        0 4px 10px rgba(0,0,0,0.4),
                        0 0 6px ${a.glow}
                    `,
                }}
            />
        );
    }

    // Inactive — recessed look via inner shadow. Mode-aware so the recess
    // reads on both page bgs (light = darker indent, dark = darker indent
    // both work when contrast is set right).
    return (
        <IconButton
            aria-label={label}
            icon={<Icon as={icon} boxSize={5} />}
            w={CHROME_DIMS.w}
            h={CHROME_DIMS.h}
            bg="rgba(0,0,0,0.06)"
            color="text.secondary"
            border="1px solid rgba(0,0,0,0.10)"
            borderRadius="10px"
            boxShadow="inset 0 2px 4px rgba(0,0,0,0.12), inset 0 -1px 0 rgba(255,255,255,0.50)"
            transition="all 100ms ease"
            _hover={{
                bg: 'rgba(0,0,0,0.10)',
                color: 'text.primary',
                borderColor: 'rgba(0,0,0,0.18)',
            }}
            _active={{
                bg: 'rgba(0,0,0,0.14)',
                boxShadow:
                    'inset 0 3px 6px rgba(0,0,0,0.18), inset 0 -1px 0 rgba(255,255,255,0.40)',
            }}
            _dark={{
                bg: 'rgba(0,0,0,0.25)',
                color: 'rgba(255,255,255,0.80)',
                borderColor: 'rgba(0,0,0,0.5)',
                boxShadow:
                    'inset 0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05)',
                _hover: {
                    bg: 'rgba(0,0,0,0.18)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.20)',
                },
                _active: {
                    bg: 'rgba(0,0,0,0.32)',
                    boxShadow:
                        'inset 0 2px 3px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.04)',
                },
            }}
        />
    );
};

const FeltInsetWithdraw = () => (
    <Button
        leftIcon={<Icon as={FaCoins} boxSize={4} />}
        h={CHROME_DIMS.h}
        bg="brand.yellow"
        color="#1A1A1A"
        border="1px solid rgba(0,0,0,0.4)"
        borderRadius="10px"
        fontWeight={700}
        fontSize="sm"
        letterSpacing="0.02em"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -2px 4px rgba(0,0,0,0.22), 0 0 12px rgba(253,197,29,0.40)"
        transition="transform 100ms ease, box-shadow 100ms ease"
        _hover={{
            boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -2px 4px rgba(0,0,0,0.18), 0 0 18px rgba(253,197,29,0.50)',
        }}
        _active={{
            transform: 'translateY(-1px)',
            boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 10px rgba(0,0,0,0.4), 0 0 6px rgba(253,197,29,0.40)',
        }}
    >
        Withdraw
    </Button>
);

// ─── Composition ────────────────────────────────────────────────────────
type Direction = {
    key: 'baseline' | 'tactile' | 'ghost' | 'felt-inset';
    title: string;
    note: string;
};
const DIRECTIONS: Direction[] = [
    {
        key: 'baseline',
        title: 'A · Baseline (current)',
        note: 'gameSettingsButton variant — glass blur + lift + glow',
    },
    {
        key: 'tactile',
        title: 'B · Tactile (Group A/B port)',
        note: 'same family as actions, but quieter — 1px edge, snap press',
    },
    {
        key: 'ghost',
        title: 'C · Ghost',
        note: 'transparent until needed — no edge, no shadow, soft hover fill',
    },
    {
        key: 'felt-inset',
        title: 'D · Felt-Inset',
        note: 'recessed into the felt — chrome as physical inlays',
    },
];

const Chrome = ({
    dir,
    icon,
    label,
    isActive,
    activeTone,
}: {
    dir: Direction['key'];
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    activeTone?: 'green' | 'pink' | 'yellow';
}) => {
    const props = { icon, label, isActive, activeTone };
    if (dir === 'baseline') return <BaselineChrome {...props} />;
    if (dir === 'tactile') return <TactileChrome {...props} />;
    if (dir === 'ghost') return <GhostChrome {...props} />;
    return <FeltInsetChrome {...props} />;
};

const WithdrawChrome = ({ dir }: { dir: Direction['key'] }) => {
    if (dir === 'baseline') return <BaselineWithdraw />;
    if (dir === 'tactile') return <TactileWithdraw />;
    if (dir === 'ghost') return <GhostWithdraw />;
    return <FeltInsetWithdraw />;
};

const NavBarRow = ({ dir }: { dir: Direction['key'] }) => (
    <HStack spacing={2}>
        <Chrome dir={dir} icon={FiMenu} label="Menu" />
        <Chrome dir={dir} icon={FiSettings} label="Settings" />
        <Chrome dir={dir} icon={FaCoffee} label="Sit out next" />
        <Chrome
            dir={dir}
            icon={FaPause}
            label="Pause"
            isActive
            activeTone="yellow"
        />
        <Box flex={1} />
        <Chrome dir={dir} icon={IoVolumeHigh} label="Volume" />
        <Chrome
            dir={dir}
            icon={FiLogOut}
            label="Leave"
            isActive
            activeTone="pink"
        />
        <Chrome dir={dir} icon={FiMessageSquare} label="Chat" />
        <WithdrawChrome dir={dir} />
    </HStack>
);

const ToggleStatesRow = ({ dir }: { dir: Direction['key'] }) => (
    <Stack spacing={3}>
        <HStack spacing={3}>
            <Text fontSize="xs" color="text.muted" minW="100px">
                Volume mute → high
            </Text>
            <Chrome dir={dir} icon={IoVolumeMute} label="Volume muted" />
            <Chrome dir={dir} icon={IoVolumeHigh} label="Volume high" />
        </HStack>
        <HStack spacing={3}>
            <Text fontSize="xs" color="text.muted" minW="100px">
                Away states
            </Text>
            <Chrome dir={dir} icon={FaCoffee} label="Sit out next hand" />
            <Chrome
                dir={dir}
                icon={FaCoffee}
                label="Sit out queued"
                isActive
                activeTone="pink"
            />
            <Chrome
                dir={dir}
                icon={FaUserCheck}
                label="I'm back"
                isActive
                activeTone="green"
            />
        </HStack>
        <HStack spacing={3}>
            <Text fontSize="xs" color="text.muted" minW="100px">
                Leave / Pause
            </Text>
            <Chrome dir={dir} icon={FiLogOut} label="Leave (idle)" />
            <Chrome
                dir={dir}
                icon={FiLogOut}
                label="Leave queued"
                isActive
                activeTone="pink"
            />
            <Chrome
                dir={dir}
                icon={FaPause}
                label="Game paused"
                isActive
                activeTone="yellow"
            />
            <Chrome
                dir={dir}
                icon={FaPlay}
                label="Resume"
                isActive
                activeTone="green"
            />
        </HStack>
    </Stack>
);

// ─── Stories ────────────────────────────────────────────────────────────
const meta: Meta = {
    title: 'Design Spikes / Group C — Table Chrome',
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

/** Full NavBar row (settings, volume, chat, away, leave, withdraw, pause, burger) — best for "what does the table chrome look like in context." */
export const NavBarChrome: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Table NavBar — settings / volume / chat / away / leave /
                withdraw / pause / burger
            </RowHeader>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="Table NavBar — landscape">
                            <NavBarRow dir={dir.key} />
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Toggle/active states — verifies each direction can express "on" vs "off" cleanly (Volume, Away, Leave, Pause/Resume). */
export const ToggleStates: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Toggle states — chrome that flips between idle and active
            </RowHeader>
            <Text fontSize="xs" color="text.muted" mb={4}>
                Volume cycles 4 levels, Away has 4 states (incl. queued
                rejoin), Leave toggles between idle and queued, Pause/Resume
                toggle the game state. Each direction needs to express
                &quot;on&quot; vs &quot;off&quot; without ambiguity.
            </Text>
            <Stack spacing={6}>
                {DIRECTIONS.map((dir) => (
                    <DirectionBlock key={dir.key} dir={dir}>
                        <AppBackdrop label="Toggle states">
                            <ToggleStatesRow dir={dir.key} />
                        </AppBackdrop>
                    </DirectionBlock>
                ))}
            </Stack>
        </Container>
    ),
};

/** Compact 4-up grid for fastest at-a-glance comparison. */
export const SideBySide: Story = {
    render: () => (
        <Container>
            <RowHeader>
                Compact side-by-side — fastest direction comparison
            </RowHeader>
            <Flex gap={4} wrap="wrap">
                {DIRECTIONS.map((dir) => (
                    <Box key={dir.key} flex="1 1 460px" minW="460px">
                        <DirectionBlock dir={dir}>
                            <AppBackdrop label={dir.key}>
                                <Stack spacing={3}>
                                    <NavBarRow dir={dir.key} />
                                    <ToggleStatesRow dir={dir.key} />
                                </Stack>
                            </AppBackdrop>
                        </DirectionBlock>
                    </Box>
                ))}
            </Flex>
        </Container>
    ),
};
