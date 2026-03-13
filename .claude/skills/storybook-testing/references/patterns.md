# Story Patterns Reference

## 1. Prop-driven component (the standard case)

```typescript
// DepositSuccessToast.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import DepositSuccessToast from './DepositSuccessToast';

const meta = {
    title: 'Toasts/DepositSuccessToast',
    component: DepositSuccessToast,
    tags: ['autodocs'],
    argTypes: {
        amount: {
            control: { type: 'number', min: 0, step: 1 },
            description: 'USDC amount deposited',
        },
        onClose: { action: 'closed' },
    },
    args: {
        amount: 100,
        onClose: () => {},
    },
} satisfies Meta<typeof DepositSuccessToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeDeposit: Story = {
    args: { amount: 10000 },
};

export const SmallDeposit: Story = {
    args: { amount: 1 },
};
```

## 2. Zustand store–driven component

Pattern: capture initial state at module load, restore in `beforeEach`, then set custom state per story.

```typescript
// SessionPointsBadge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import SessionPointsBadge from './SessionPointsBadge';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

// Capture at module load — used as the clean reset baseline
const initialState = usePointsAnimationStore.getState();

const meta = {
    title: 'NavBar/SessionPointsBadge',
    component: SessionPointsBadge,
    tags: ['autodocs'],
    // Restore to clean state before every story
    beforeEach: () => {
        usePointsAnimationStore.setState(initialState, true);
    },
    // Dark background — badge is designed for a dark navbar
    decorators: [
        (Story) => (
            <div style={{ background: '#060812', padding: '24px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SessionPointsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cold: Story = {
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 0 }, false);
    },
};

export const Warm: Story = {
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 75 }, false);
    },
};

export const Hot: Story = {
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 250 }, false);
    },
};

export const Overcharge: Story = {
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 600 }, false);
    },
};
```

## 3. Triggering animations / store actions in stories

Use a `render` wrapper with a button to let the reviewer manually fire animations:

```typescript
export const WithDeltaAnimation: Story = {
    render: () => {
        const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
        return (
            <div style={{ background: '#060812', padding: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <SessionPointsBadge />
                <button onClick={() => triggerPoints(25)}>+25 pts</button>
            </div>
        );
    },
};
```

## 4. Component with modal (useDisclosure inside)

Use `render` and `useDisclosure`-aware wrapper, or just let Storybook render it inline — the modal will open on button click.

```typescript
// ShareRankCard.stories.tsx
export const BronzeTier: Story = {
    args: {
        rank: 45,
        points: 120,
        address: '0xabc123...4567',
        total: 200,
    },
};

export const GoldTier: Story = {
    args: {
        rank: 3,
        points: 8500,
        address: '0xdef456...89ab',
        total: 200,
    },
};
```

## 5. Activity feed with mock data (bypassing API gate)

`PointsActivityFeed` is gated to `pathname === '/'`. Override pathname in story parameters and mock the fetch:

```typescript
export const WithActiveEvent: Story = {
    parameters: {
        nextjs: {
            navigation: { pathname: '/' },
        },
        // Mock fetch response via msw or just bypass by rendering the inner UI directly
    },
};
```

Alternatively, extract the inner `<Box>` rendering into a testable sub-component and story that directly.

## 6. Forcing dark mode for a single story

```typescript
import { DarkMode } from '@chakra-ui/react';

export const DarkVariant: Story = {
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
    ],
};
```

## 7. argTypes patterns for this repo

```typescript
argTypes: {
    // Rank number — slider
    rank: {
        control: { type: 'number', min: 1, max: 500 },
        description: 'Player rank on the leaderboard',
    },
    // Tier selection — radio
    tier: {
        control: { type: 'radio' },
        options: ['bronze', 'silver', 'gold', 'diamond'],
    },
    // Wallet address — text
    address: {
        control: 'text',
        description: 'Full EVM wallet address (0x...)',
    },
    // Callbacks — log to Actions panel, no control widget
    onClose: {
        action: 'onClose',
        control: false,
    },
}
```

## 8. setState flag: merge vs replace

```typescript
usePointsAnimationStore.setState({ sessionTotal: 200 }, false); // MERGE — safe for partial updates
usePointsAnimationStore.setState(initialState, true);            // REPLACE — full reset to known state
```

Always use `true` (replace) when resetting in `beforeEach`. Use `false` (merge) when only changing one field per story.
