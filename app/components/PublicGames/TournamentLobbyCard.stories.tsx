import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TournamentLobbyCard from './TournamentLobbyCard';
import {
    MOCK_MY_WALLET,
    completed,
    freePlayOpen,
    hostNeedsToFund,
    privateFreePlay,
    realMoneyOpen,
    runningEliminated,
    runningPlaying,
} from './mockTournaments';

const noop = () => {};

const meta = {
    title: 'PublicGames/TournamentLobbyCard',
    component: TournamentLobbyCard,
    tags: ['autodocs'],
    parameters: { nextjs: { appDirectory: true } },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="420px">
                <Story />
            </Box>
        ),
    ],
    args: {
        onRegister: noop,
        onUnregister: noop,
        onGoToTable: noop,
        onViewOverview: noop,
        onFundGuarantee: noop,
        onCardClick: noop,
        registeredIds: new Set<number>(),
        explorerUrl: () => 'https://sepolia.basescan.org/tx/0xpending',
    },
} satisfies Meta<typeof TournamentLobbyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Real money, registration open, guaranteed pool, viewer not registered.
export const RealMoneyOpen: Story = {
    args: { tournament: realMoneyOpen },
};

// Free play freeroll, open for registration.
export const FreePlayOpen: Story = {
    args: { tournament: freePlayOpen },
};

// Real money, viewer is registered (shows "Registered" + Unregister).
export const Registered: Story = {
    args: {
        tournament: realMoneyOpen,
        myWallet: MOCK_MY_WALLET,
        registeredIds: new Set<number>([realMoneyOpen.id]),
    },
};

// Private free play (lock badge; registering opens a passcode prompt when wired).
export const PrivateFreePlay: Story = {
    args: { tournament: privateFreePlay },
};

// Viewer is the host of a pending tournament that still needs its guarantee funded.
export const HostNeedsToFund: Story = {
    args: { tournament: hostNeedsToFund, myWallet: MOCK_MY_WALLET },
};

// Tournament is live, viewer is still in (shows "You're in" + My table + Standings).
export const RunningPlaying: Story = {
    args: {
        tournament: runningPlaying,
        myWallet: MOCK_MY_WALLET,
        registeredIds: new Set<number>([runningPlaying.id]),
    },
};

// Tournament is live, viewer busted out (shows "Eliminated" + Standings only).
export const RunningEliminated: Story = {
    args: {
        tournament: runningEliminated,
        myWallet: MOCK_MY_WALLET,
        registeredIds: new Set<number>([runningEliminated.id]),
        isEliminated: true,
    },
};

// Finished and settled on-chain, prize pool shown, final standings available.
export const Completed: Story = {
    args: { tournament: completed },
};

// On-chain register tx confirmed but the indexer hasn't caught up yet.
export const SyncingRegistration: Story = {
    args: {
        tournament: realMoneyOpen,
        myWallet: MOCK_MY_WALLET,
        pendingTx: {
            tournamentId: realMoneyOpen.id,
            txHash: '0xpending',
            type: 'register',
            chainName: 'base',
        },
    },
};

// Host branding: custom background banner + logo (community-hosted look).
export const BrandedWithBanner: Story = {
    args: {
        tournament: {
            ...realMoneyOpen,
            id: 9901,
            name: 'Degen Collective Invitational',
            logo_url: '/IconLogo.png',
            banner_url: '/video/bgplaceholder-1920x1080.png',
        },
    },
};

// Host branding: logo only (no background uploaded).
export const BrandedLogoOnly: Story = {
    args: {
        tournament: {
            ...realMoneyOpen,
            id: 9902,
            name: 'Night Owls League',
            logo_url: '/IconMain.png',
        },
    },
};
