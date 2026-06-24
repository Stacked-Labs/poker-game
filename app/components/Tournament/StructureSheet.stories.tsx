import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { Box } from '@chakra-ui/react';
import StructureSheet from './StructureSheet';
import { breakEveryNLevels } from '../PublicGames/blindStructures';

const meta = {
    title: 'Tournament/Detail/StructureSheet',
    component: StructureSheet,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="640px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof StructureSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TurboRunning: Story = {
    args: {
        blindStructure: 'turbo',
        startingStack: 10_000,
        lateRegLevels: 3,
        currentLevel: 7,
    },
};

export const DeepRegistration: Story = {
    args: {
        blindStructure: 'deep',
        startingStack: 30_000,
        lateRegLevels: 2,
        currentLevel: null,
    },
};

export const Hyper: Story = {
    args: {
        blindStructure: 'hyper',
        startingStack: 10_000,
        lateRegLevels: 3,
        currentLevel: 4,
    },
};

export const Collapsed: Story = {
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
        defaultOpen: false,
    },
};

// Detail-page "summary" mode: a plain-language title + four scannable facts, with
// the full level table tucked behind "View all levels". Collapsed by default.
export const Summary: Story = {
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
        summary: true,
        defaultOpen: false,
    },
};

// Same summary card, but with the full ladder expanded (the "View all levels"
// state) so the break rows + late-reg marker are visible at a glance.
export const SummaryExpanded: Story = {
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
        summary: true,
        defaultOpen: true,
    },
};

// ── Rest breaks ──────────────────────────────────────────────────────────

// Regular: break after every 3rd level (60 min / 20-min levels) → rows 3, 6, 9…
export const RegularWithBreaks: Story = {
    name: 'Regular — break rows (after L3, L6, L9…)',
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
    },
};

// Hyper: break after every 12th level (60 min / 5-min levels). The defined
// ladder is 15 levels, so exactly one break row shows (after L12).
export const HyperWithBreaks: Story = {
    name: 'Hyper — break row (after L12)',
    args: {
        blindStructure: 'hyper',
        startingStack: 10_000,
        lateRegLevels: 3,
        currentLevel: null,
    },
};

// Live break highlight: the tournament is on the break that follows L6 (Regular),
// so that break row gets the green "On break · Level 7 next" treatment.
export const RegularLiveBreak: Story = {
    name: 'Regular — live break highlight (after L6)',
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: 6,
        onBreak: true,
    },
};

// Cadence-mirror guard: the frontend mirror MUST match the backend rule for all
// four presets (Hyper 12 / Turbo 6 / Regular 3 / Deep 2). If the mirror ever
// drifts from poker-server/tournament/blind_structures.go this play function
// fails loudly. (Plan §7.3.)
export const CadenceMirrorMatchesBackend: Story = {
    name: 'Cadence mirror = backend (12 / 6 / 3 / 2)',
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
    },
    play: async () => {
        await expect(breakEveryNLevels('hyper')).toBe(12);
        await expect(breakEveryNLevels('turbo')).toBe(6);
        await expect(breakEveryNLevels('regular')).toBe(3);
        await expect(breakEveryNLevels('deep')).toBe(2);
    },
};
