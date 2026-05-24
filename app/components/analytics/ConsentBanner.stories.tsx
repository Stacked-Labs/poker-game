'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, DarkMode, LightMode } from '@chakra-ui/react';
import { ConsentBanner } from './ConsentBanner';

const CONSENT_KEY = 'stacked_analytics_consent';

function clearConsent() {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CONSENT_KEY);
    }
}

function setStoredConsent(value: 'granted' | 'declined') {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(CONSENT_KEY, value);
    }
}

const FeltBackdrop: React.FC<{ children: React.ReactNode; dark?: boolean }> =
    ({ children, dark }) => (
        <Box
            position="fixed"
            inset={0}
            bgGradient={
                dark
                    ? 'radial-gradient(circle at 30% 20%, #1a2752 0%, #0b1430 55%, #060b1f 100%)'
                    : 'radial-gradient(circle at 30% 20%, #f4f1ff 0%, #e6ecf7 55%, #d9e1f2 100%)'
            }
        >
            {children}
        </Box>
    );

const meta = {
    title: 'Analytics/ConsentBanner',
    component: ConsentBanner,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Bottom-pinned consent prompt that gates PostHog event capture. Glassmorphism surface, chip-stack accent, slide-up entry. Reads localStorage on mount — stories reset the key in beforeEach so the banner always renders.',
            },
        },
    },
    decorators: [
        (Story: React.FC) => (
            <FeltBackdrop>
                <Story />
            </FeltBackdrop>
        ),
    ],
} satisfies Meta<typeof ConsentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default light-mode appearance — fresh visitor, no choice recorded. */
export const Light: Story = {
    beforeEach: () => {
        clearConsent();
    },
    decorators: [
        (Story) => (
            <LightMode>
                <Story />
            </LightMode>
        ),
        (Story) => (
            <FeltBackdrop>
                <Story />
            </FeltBackdrop>
        ),
    ],
};

/** Dark-mode (default app mode) — penthouse-at-3am feel. */
export const Dark: Story = {
    beforeEach: () => {
        clearConsent();
    },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
        (Story) => (
            <FeltBackdrop dark>
                <Story />
            </FeltBackdrop>
        ),
    ],
};

/** Narrow viewport — buttons stack full-width under the copy. */
export const Mobile: Story = {
    beforeEach: () => {
        clearConsent();
    },
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
    },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
        (Story) => (
            <FeltBackdrop dark>
                <Story />
            </FeltBackdrop>
        ),
    ],
};

/**
 * Consent already declined — nothing renders. Use this to confirm the
 * suppression path in case anyone touches the storage key contract.
 */
export const AlreadyDeclined: Story = {
    beforeEach: () => {
        setStoredConsent('declined');
    },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
        (Story) => (
            <FeltBackdrop dark>
                <Story />
            </FeltBackdrop>
        ),
    ],
};

/**
 * Consent already granted — also renders nothing. Same suppression contract
 * as AlreadyDeclined, separate story so the visual diff catches regressions
 * for either branch.
 */
export const AlreadyAccepted: Story = {
    beforeEach: () => {
        setStoredConsent('granted');
    },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
        (Story) => (
            <FeltBackdrop dark>
                <Story />
            </FeltBackdrop>
        ),
    ],
};
