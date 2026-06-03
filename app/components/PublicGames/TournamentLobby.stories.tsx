import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Container, SimpleGrid, VStack } from '@chakra-ui/react';
import FormatTabs, { type GameFormat } from './FormatTabs';
import TournamentLobbyCard from './TournamentLobbyCard';
import TournamentsEmptyState from './TournamentsEmptyState';
import { MOCK_MY_WALLET, MOCK_TOURNAMENTS } from './mockTournaments';

const noop = () => {};

// The whole tournaments lobby surface: the prominent format tab over the
// money-led card grid (or the true empty state).
function LobbySection({ empty = false }: { empty?: boolean }) {
    const [format, setFormat] = useState<GameFormat>('tournaments');
    const registeredIds = new Set<number>([2, 5, 7]);

    return (
        <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                <VStack align="stretch" spacing={{ base: 5, md: 6 }}>
                    <FormatTabs
                        format={format}
                        onChange={setFormat}
                        tournamentCount={empty ? undefined : MOCK_TOURNAMENTS.length}
                    />
                    {empty ? (
                        <TournamentsEmptyState onCreate={noop} />
                    ) : (
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, lg: 3 }}
                            spacing={{ base: 3, md: 4 }}
                        >
                            {MOCK_TOURNAMENTS.map((t, i) => (
                                <TournamentLobbyCard
                                    key={t.id}
                                    tournament={t}
                                    index={i}
                                    myWallet={MOCK_MY_WALLET}
                                    registeredIds={registeredIds}
                                    isEliminated={t.id === 7}
                                    onRegister={noop}
                                    onUnregister={noop}
                                    onGoToTable={noop}
                                    onViewOverview={noop}
                                    onFundGuarantee={noop}
                                    onCardClick={noop}
                                    explorerUrl={() => 'https://basescan.org/tx/0x'}
                                />
                            ))}
                        </SimpleGrid>
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

// The same surface with no tournaments scheduled.
export const Empty: Story = { args: { empty: true } };
