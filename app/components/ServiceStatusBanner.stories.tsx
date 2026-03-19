import type { Meta, StoryObj } from '@storybook/react';
import { DarkMode } from '@chakra-ui/react';
import ServiceStatusBanner from './ServiceStatusBanner';

/**
 * Mock fetch to return a specific platform status.
 * The component fetches `/api/status` on mount — we intercept globally.
 */
function mockFetch(platform: string) {
    globalThis.fetch = async () =>
        new Response(JSON.stringify({ platform }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
}

function mockFetchError() {
    globalThis.fetch = async () => {
        throw new Error('Network error');
    };
}

const meta = {
    title: 'Components/ServiceStatusBanner',
    component: ServiceStatusBanner,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof ServiceStatusBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Service is degraded — modal appears (light mode). */
export const Degraded: Story = {
    beforeEach: () => {
        mockFetch('degraded');
    },
};

/** Service is degraded — modal in dark mode. */
export const DegradedDark: Story = {
    beforeEach: () => {
        mockFetch('degraded');
    },
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
    ],
};

/** Service is operational — nothing renders. */
export const Operational: Story = {
    beforeEach: () => {
        mockFetch('operational');
    },
};

/** Network error — component fails silently, nothing renders. */
export const NetworkError: Story = {
    beforeEach: () => {
        mockFetchError();
    },
};
