'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Skeleton,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useActiveAccount } from 'thirdweb/react';
import {
    getMyTournamentRegistrations,
    listTournaments,
    type Tournament,
} from '../../hooks/server_actions';
import { useSignInPrompt } from '../../hooks/useSignInPrompt';
import TournamentLobbyCard from '../PublicGames/TournamentLobbyCard';

const MotionBox = motion(Box);

// Upcoming/live tournaments lead the marketing homepage: an "appointment" a
// logged-out visitor can countdown to and click into. Open-for-registration and
// live events come first ("not open yet" / pending and cancelled are filtered
// out); if there are fewer than three, recently-finished tournaments backfill the
// row so the module always reads as a full, lively schedule.
const UPCOMING_STATUSES = new Set(['registration', 'running']);
const MAX_CARDS = 3;

function timeMs(iso?: string): number {
    if (!iso) return NaN;
    return new Date(iso).getTime();
}

// Lead with the busiest events — most registered players first — so the homepage
// surfaces the tournaments with the most momentum. Ties break on soonest start
// (undated last) so the order is stable.
function byMostParticipants(a: Tournament, b: Tournament): number {
    const diff = (b.registered_count ?? 0) - (a.registered_count ?? 0);
    if (diff !== 0) return diff;
    const ta = timeMs(a.scheduled_start_at);
    const tb = timeMs(b.scheduled_start_at);
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
}

// Backfill order for finished events: most recently ended first, so the filler
// still feels current rather than digging up the oldest archive.
function byMostRecentlyFinished(a: Tournament, b: Tournament): number {
    const ea = timeMs(a.ended_at) || timeMs(a.scheduled_start_at);
    const eb = timeMs(b.ended_at) || timeMs(b.scheduled_start_at);
    if (Number.isNaN(ea) && Number.isNaN(eb)) return 0;
    if (Number.isNaN(ea)) return 1;
    if (Number.isNaN(eb)) return -1;
    return eb - ea;
}

// Up to MAX_CARDS cards. With zero genuinely upcoming/live events we return
// nothing so the section shows the "host your own" prompt rather than a row of
// purely finished tournaments. With at least one upcoming event, recently
// finished tournaments backfill the remaining slots so the row stays full.
function selectTournaments(all: Tournament[]): Tournament[] {
    const upcoming = all
        .filter((t) => UPCOMING_STATUSES.has(t.status))
        .sort(byMostParticipants);
    if (upcoming.length === 0) return [];
    const selected = upcoming.slice(0, MAX_CARDS);
    if (selected.length < MAX_CARDS) {
        const finished = all
            .filter((t) => t.status === 'completed')
            .sort(byMostRecentlyFinished);
        for (const t of finished) {
            if (selected.length >= MAX_CARDS) break;
            selected.push(t);
        }
    }
    return selected;
}

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5); }
    50%      { box-shadow: 0 0 0 4px rgba(54, 163, 123, 0); }
`;

interface UpcomingTournamentsSectionProps {
    // Server-fetched list for SSR / first paint, so crawlers and social unfurls
    // see real tournament cards instead of a client-only skeleton. The client
    // still refreshes and personalizes after mount. `null` means the server
    // fetch timed out or failed (distinct from an empty list): seed no cards and
    // let the client refetch, falling back to the skeleton meanwhile.
    initialTournaments?: Tournament[] | null;
}

const UpcomingTournamentsSection = ({
    initialTournaments,
}: UpcomingTournamentsSectionProps) => {
    const router = useRouter();
    const prefersReducedMotion = useReducedMotion();
    const account = useActiveAccount();
    const myWallet = account?.address;
    const { isSignedIn } = useSignInPrompt();
    const [tournaments, setTournaments] = useState<Tournament[] | null>(() =>
        initialTournaments ? selectTournaments(initialTournaments) : null
    );
    const [errored, setErrored] = useState(false);
    const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
    const [finishPos, setFinishPos] = useState<Record<number, number>>({});

    useEffect(() => {
        let cancelled = false;
        listTournaments()
            .then((data) => {
                if (cancelled) return;
                setTournaments(selectTournaments(data?.tournaments ?? []));
            })
            .catch(() => {
                // A failed client refresh must not wipe SSR-rendered cards —
                // only fall back to the empty/host prompt if we never had data.
                if (!cancelled && initialTournaments == null) setErrored(true);
            });
        return () => {
            cancelled = true;
        };
        // initialTournaments is SSR-stable (passed once), so this effectively
        // runs once on mount and refreshes the server-rendered list.
    }, [initialTournaments]);

    // Mirror the tournaments lobby: surface the signed-in player's own
    // registration / finish state on each card. Only fetch once a wallet is
    // connected; logged-out visitors just see the plain cards.
    useEffect(() => {
        if (!myWallet) {
            setRegisteredIds(new Set());
            setFinishPos({});
            return;
        }
        let cancelled = false;
        getMyTournamentRegistrations()
            .then((data) => {
                if (cancelled) return;
                setRegisteredIds(new Set(data.tournament_ids));
                setFinishPos(data.finish_pos ?? {});
            })
            .catch(() => {
                /* leave registration state empty on failure */
            });
        return () => {
            cancelled = true;
        };
    }, [myWallet]);

    // Every card interaction on the marketing module funnels to the tournament
    // page, where the real register / sign-in / standings flows live.
    const goToTournament = useCallback(
        (id: number) => router.push(`/tournament/${id}`),
        [router]
    );

    // A backend hiccup shouldn't leave a dead section on the marketing page —
    // fall back to the same "host your own" prompt the empty state uses.
    const isLoading = tournaments === null && !errored;
    const isEmpty = errored || (tournaments !== null && tournaments.length === 0);

    const fadeUp = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 22 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.2 },
              transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
              },
          };

    return (
        <Box
            as="section"
            id="upcoming-tournaments"
            py={{ base: 8, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <MotionBox {...fadeUp}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'start', md: 'end' }}
                        gap={4}
                        mb={{ base: 5, md: 10 }}
                    >
                        <VStack align="start" spacing={3}>
                            <HStack
                                spacing={2}
                                px={3}
                                py={1.5}
                                borderRadius="full"
                                bg="rgba(54, 163, 123, 0.10)"
                                border="1px solid"
                                borderColor="rgba(54, 163, 123, 0.24)"
                                _dark={{
                                    bg: 'rgba(54, 163, 123, 0.16)',
                                    borderColor: 'rgba(54, 163, 123, 0.30)',
                                }}
                            >
                                <Box
                                    w="7px"
                                    h="7px"
                                    borderRadius="full"
                                    bg="brand.green"
                                    animation={
                                        prefersReducedMotion
                                            ? undefined
                                            : `${dotPulse} 2s ease-in-out infinite`
                                    }
                                    aria-hidden
                                />
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    color="brand.green"
                                >
                                    On the schedule
                                </Text>
                            </HStack>
                            <Heading
                                as="h2"
                                fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                                fontWeight="extrabold"
                                lineHeight={0.95}
                                letterSpacing="-0.04em"
                                color="text.primary"
                            >
                                Next up at the table.
                            </Heading>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="text.secondary"
                                maxW="2xl"
                                fontWeight="medium"
                                lineHeight="tall"
                                opacity={0.85}
                            >
                                Tournaments are the standing invite. Catch the
                                next one before the clock runs out.
                            </Text>
                        </VStack>

                        {!isEmpty && (
                            <Button
                                as="a"
                                href="/public-games?format=tournaments"
                                variant="tactileOutline"
                                size="md"
                                rightIcon={<Icon as={FiArrowRight} />}
                                flexShrink={0}
                            >
                                All tournaments
                            </Button>
                        )}
                    </Flex>

                    {isLoading && <LoadingGrid />}

                    {isEmpty && <EmptyState />}

                    {!isLoading && !isEmpty && tournaments && (
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, lg: 3 }}
                            spacing={{ base: 3, md: 4 }}
                        >
                            {tournaments.map((t, index) => (
                                <TournamentLobbyCard
                                    key={t.id}
                                    index={index}
                                    tournament={t}
                                    myWallet={myWallet}
                                    isSignedIn={isSignedIn}
                                    registeredIds={registeredIds}
                                    isEliminated={(finishPos[t.id] ?? 0) > 0}
                                    onRegister={goToTournament}
                                    onUnregister={goToTournament}
                                    onGoToTable={goToTournament}
                                    onViewOverview={goToTournament}
                                    onCardClick={goToTournament}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </MotionBox>
            </Container>
        </Box>
    );
};

function LoadingGrid() {
    return (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
            {[0, 1, 2].map((i) => (
                <Skeleton
                    key={i}
                    borderRadius="14px"
                    h={{ base: '360px', md: '380px' }}
                    startColor="border.lightGray"
                    endColor="bg.surface"
                    speed={1.2}
                />
            ))}
        </SimpleGrid>
    );
}

function EmptyState() {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    return (
        <VStack
            spacing={5}
            textAlign="center"
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="16px"
            boxShadow="card.lift"
            px={{ base: 6, md: 10 }}
            py={{ base: 10, md: 14 }}
        >
            <VStack spacing={2}>
                <Heading
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="extrabold"
                    color="text.primary"
                    letterSpacing="-0.02em"
                >
                    No tournaments on the clock yet.
                </Heading>
                <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="text.secondary"
                    maxW="md"
                    lineHeight="tall"
                >
                    Be the host. Spin up your own tournament, set the buy-in, and
                    put a time on the board.
                </Text>
            </VStack>
            <Button
                as="a"
                href="/create-game?type=tournament"
                variant="tactilePrimary"
                size="lg"
                rightIcon={<Icon as={FiArrowRight} />}
            >
                Host your own tournament
            </Button>
        </VStack>
    );
}

export default UpcomingTournamentsSection;
