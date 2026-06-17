import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    VStack,
} from '@chakra-ui/react';
import type { PendingTournamentTx } from '../../hooks/usePendingTournamentTxs';
import type { Tournament } from '../../hooks/server_actions';
import FormatTabs, { type GameFormat } from './FormatTabs';
import TournamentLobbyCard from './TournamentLobbyCard';
import TournamentsEmptyState from './TournamentsEmptyState';
import {
    MOCK_MY_WALLET,
    MOCK_TOURNAMENTS,
    MOCK_TOURNAMENTS_SHOWCASE,
    brandedBannerLogo,
    brandedBannerLogoDeep,
    brandedBannerOnly,
    brandedCompleted,
    brandedLogoOnly,
    completed,
    freePlayOpen,
    hostNeedsToFund,
    privateFreePlay,
    realMoneyOpen,
    runningEliminated,
    runningPlaying,
} from './mockTournaments';

const noop = () => {};

// Per-card viewer state, keyed by tournament id, so a single grid can show the
// "you" perspective on several cards at once (registered, busted, syncing).
const REGISTERED_IDS = new Set<number>([
    realMoneyOpen.id,
    runningPlaying.id,
    runningEliminated.id,
]);
const ELIMINATED_IDS = new Set<number>([runningEliminated.id]);
const PENDING: Record<number, PendingTournamentTx> = {
    [brandedBannerLogoDeep.id]: {
        tournamentId: brandedBannerLogoDeep.id,
        txHash: '0xpending',
        type: 'register',
        chainName: 'base',
        submittedAt: 0,
    },
};

function LobbyCard({ t, index }: { t: Tournament; index: number }) {
    return (
        <TournamentLobbyCard
            tournament={t}
            index={index}
            myWallet={MOCK_MY_WALLET}
            registeredIds={REGISTERED_IDS}
            isEliminated={ELIMINATED_IDS.has(t.id)}
            pendingTx={PENDING[t.id]}
            onRegister={noop}
            onUnregister={noop}
            onGoToTable={noop}
            onViewOverview={noop}
            onFundGuarantee={noop}
            onCardClick={noop}
            explorerUrl={() => 'https://basescan.org/tx/0xpending'}
        />
    );
}

function LobbyGrid({ tournaments }: { tournaments: Tournament[] }) {
    return (
        <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={{ base: 3, md: 4 }}
        >
            {tournaments.map((t, i) => (
                <LobbyCard key={t.id} t={t} index={i} />
            ))}
        </SimpleGrid>
    );
}

// The whole tournaments lobby surface: the prominent format tab over the
// money-led card grid (or the true empty state).
function LobbySection({
    empty = false,
    tournaments = MOCK_TOURNAMENTS,
}: {
    empty?: boolean;
    tournaments?: Tournament[];
}) {
    const [format, setFormat] = useState<GameFormat>('tournaments');

    return (
        <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                <VStack align="stretch" spacing={{ base: 5, md: 6 }}>
                    <FormatTabs
                        format={format}
                        onChange={setFormat}
                        tournamentCount={empty ? undefined : tournaments.length}
                    />
                    {empty ? (
                        <TournamentsEmptyState onCreate={noop} />
                    ) : (
                        <LobbyGrid tournaments={tournaments} />
                    )}
                </VStack>
            </Container>
        </Box>
    );
}

const meta = {
    title: 'PublicGames/TournamentLobby',
    component: LobbySection,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
} satisfies Meta<typeof LobbySection>;

export default meta;
type Story = StoryObj<typeof meta>;

// The money-led card grid with a mix of states (open, registered, host, live, done).
export const Grid: Story = { args: { empty: false } };

// A fuller lobby: branded cards (uploaded banner + logo) sitting next to the
// generated default look, across all four types and every lifecycle state.
export const Showcase: Story = {
    args: { empty: false, tournaments: MOCK_TOURNAMENTS_SHOWCASE },
};

// The same surface with no tournaments scheduled.
export const Empty: Story = { args: { empty: true } };

// Branding paths grouped so a reviewer can compare them side by side: what a
// Host's uploaded art looks like vs. the generated default we fall back to.
const GROUPS: {
    title: string;
    blurb: string;
    tournaments: Tournament[];
}[] = [
    {
        title: 'Host uploaded a banner and a logo',
        blurb: 'Full-bleed banner strip with the logo tucked into its lower edge.',
        tournaments: [brandedBannerLogo, brandedBannerLogoDeep, brandedCompleted],
    },
    {
        title: 'Host uploaded a banner only',
        blurb: 'No logo, so the generated type mark fills the avatar slot on the banner.',
        tournaments: [brandedBannerOnly],
    },
    {
        title: 'Host uploaded a logo only',
        blurb: 'No banner, so the generated suit-wallpaper cover sits behind the logo.',
        tournaments: [brandedLogoOnly],
    },
    {
        title: 'No upload: generated default branding',
        blurb: 'Both generated: the suit-wallpaper cover and the type mark, in the type accent. One per type.',
        tournaments: [
            privateFreePlay, // hyper
            freePlayOpen, // turbo
            realMoneyOpen, // regular
            hostNeedsToFund, // deep
        ],
    },
    {
        title: 'Live and finished',
        blurb: 'Lifecycle states on the default look.',
        tournaments: [runningPlaying, runningEliminated, completed],
    },
];

export const BrandingMatrix: Story = {
    render: () => (
        <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
                    {GROUPS.map((g) => (
                        <VStack key={g.title} align="stretch" spacing={3}>
                            <Box>
                                <Heading
                                    size="sm"
                                    color="text.primary"
                                    letterSpacing="-0.01em"
                                >
                                    {g.title}
                                </Heading>
                                <Text fontSize="sm" color="text.muted" mt={1}>
                                    {g.blurb}
                                </Text>
                            </Box>
                            <LobbyGrid tournaments={g.tournaments} />
                        </VStack>
                    ))}
                </VStack>
            </Container>
        </Box>
    ),
};
