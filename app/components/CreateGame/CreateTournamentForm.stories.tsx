import type { Meta, StoryObj } from '@storybook/react';
import { Box, Container } from '@chakra-ui/react';
import { expect, userEvent, within } from 'storybook/test';
import CreateTournamentForm from './CreateTournamentForm';

// A start time comfortably in the future, formatted for <input type="datetime-local">.
function futureLocal(hoursAhead = 24): string {
    const d = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const noop = () => {};

const meta = {
    title: 'CreateGame/CreateTournamentForm',
    component: CreateTournamentForm,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        nextjs: { appDirectory: true },
    },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
                <Container maxW="container.md" px={{ base: 3, md: 6 }}>
                    <Story />
                </Container>
            </Box>
        ),
    ],
} satisfies Meta<typeof CreateTournamentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

async function selectRealMoney(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    const realMoney = canvas.getByRole('radio', { name: /real money/i });
    await userEvent.click(realMoney);
    await expect(realMoney).toBeChecked();
}

// Default: Free Play is preselected; no stakes section, green accent.
export const FreePlay: Story = {
    args: {
        onSubmit: noop,
    },
};

// Real Money with a buy-in but no guarantee. Submit reads "Create tournament".
export const RealMoney: Story = {
    args: {
        onSubmit: noop,
    },
    play: async ({ canvasElement }) => {
        await selectRealMoney(canvasElement);
    },
};

// Real Money with a guarantee — surfaces the host-exposure + earnings copy
// and the "Create & fund guarantee" submit label.
export const RealMoneyWithGuarantee: Story = {
    args: {
        onSubmit: noop,
    },
    play: async ({ canvasElement }) => {
        await selectRealMoney(canvasElement);
        const canvas = within(canvasElement);
        const guarantee = canvas.getByPlaceholderText('0');
        await userEvent.clear(guarantee);
        await userEvent.type(guarantee, '500');
        await expect(canvas.getByText(/USDC GTD/i)).toBeInTheDocument();
        await expect(
            canvas.getByText(/you earn ~0\.75% of winnings/i)
        ).toBeInTheDocument();
    },
};

// Private tournament: Advanced is expanded and an access code makes it invite-only.
export const Private: Story = {
    args: {
        onSubmit: noop,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const advanced = canvas.getByRole('button', { name: /advanced/i });
        await userEvent.click(advanced);
        const code = canvas.getByPlaceholderText(
            /leave blank for open registration/i
        );
        await userEvent.type(code, 'PENTHOUSE2026');
        await expect(
            canvas.getByText(/this tournament is\s+private/i)
        ).toBeInTheDocument();
    },
};

// Funding step: the guarantee deposit is in flight on-chain.
export const FundingStep: Story = {
    args: {
        onSubmit: noop,
        isSubmitting: true,
        fundPhase: 'depositing',
    },
    play: async ({ canvasElement }) => {
        await selectRealMoney(canvasElement);
        // Seed a valid future start so the funding state reads as a real submit.
        const start = canvasElement.querySelector<HTMLInputElement>(
            'input[type="datetime-local"]'
        );
        if (start) {
            await userEvent.type(start, futureLocal());
        }
    },
};
