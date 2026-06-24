'use client';

import {
    Button,
    Flex,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRouter } from 'next/navigation';
import useToastHelper from '../../hooks/useToastHelper';
import {
    getMyTournamentRegistrations,
    getTournamentLeaderboard,
    listTournaments,
    type Tournament,
    unregisterFromTournament,
} from '../../hooks/server_actions';
import { formatUsdc } from './tournamentFormat';
import { USDC_BLUE, USDC_LOGO } from './types';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import { usePendingTournamentTxs } from '../../hooks/usePendingTournamentTxs';
import { useSignInPrompt } from '../../hooks/useSignInPrompt';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import { useTournamentReminderStore } from '../../stores/tournamentReminders';
import RegistrationConfirmationModal from '../Tournament/RegistrationConfirmationModal';
import TournamentRegisterModal from '../Tournament/TournamentRegisterModal';
import TournamentLobbyCard from './TournamentLobbyCard';
import TournamentsEmptyState from './TournamentsEmptyState';
import { PAGE_SIZE } from './types';

// Lobby ordering: lead with the most actionable tournaments. Registering (join
// now) first, then live (watch / late-reg), then upcoming, then finished and
// cancelled. Joinable groups sort by soonest start; finished by most recent.
function statusRank(status: string): number {
    switch (status) {
        case 'registration':
            return 0;
        case 'running':
            return 1;
        case 'pending':
            return 2;
        case 'completed':
            return 3;
        case 'emergency_refund':
            return 4;
        case 'cancelled':
            return 5;
        default:
            return 6;
    }
}

function timeMs(iso?: string): number {
    if (!iso) return NaN;
    return new Date(iso).getTime();
}

function lateRegStillOpen(t: Tournament, now: number): boolean {
    return (
        t.status === 'running' &&
        (t.late_reg_levels ?? 0) > 0 &&
        now < timeMs(t.late_reg_close_at)
    );
}

function compareLobbyTournaments(
    a: Tournament,
    b: Tournament,
    now: number
): number {
    const rankDiff = statusRank(a.status) - statusRank(b.status);
    if (rankDiff !== 0) return rankDiff;

    // Registering / upcoming: soonest scheduled start first (undated last).
    if (a.status === 'registration' || a.status === 'pending') {
        const sa = timeMs(a.scheduled_start_at);
        const sb = timeMs(b.scheduled_start_at);
        const na = Number.isNaN(sa) ? Infinity : sa;
        const nb = Number.isNaN(sb) ? Infinity : sb;
        if (na !== nb) return na - nb;
        return (b.registered_count ?? 0) - (a.registered_count ?? 0);
    }

    // Live: still-joinable (late reg open) first, then most recently started.
    if (a.status === 'running') {
        const la = lateRegStillOpen(a, now) ? 0 : 1;
        const lb = lateRegStillOpen(b, now) ? 0 : 1;
        if (la !== lb) return la - lb;
        const sa = timeMs(a.started_at ?? a.scheduled_start_at) || 0;
        const sb = timeMs(b.started_at ?? b.scheduled_start_at) || 0;
        return sb - sa;
    }

    // Finished / cancelled / refunding: most recent first.
    const ea = timeMs(a.ended_at ?? a.scheduled_start_at) || 0;
    const eb = timeMs(b.ended_at ?? b.scheduled_start_at) || 0;
    return eb - ea;
}

export default function TournamentsList() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
    const [finishPos, setFinishPos] = useState<Record<number, number>>({});
    // The just-registered tournament whose "You're in." confirmation is open.
    const [confirmTour, setConfirmTour] = useState<Tournament | null>(null);
    const toast = useToastHelper();
    const toastRef = useRef(toast);
    toastRef.current = toast;
    const account = useActiveAccount();
    const myWallet = account?.address;
    const myWalletRef = useRef(myWallet);
    myWalletRef.current = myWallet;
    const { isSignedIn, promptSignIn } = useSignInPrompt();
    const router = useRouter();

    const openCreate = () => router.push('/create-game?type=tournament');

    const [goToTableLoadingId, setGoToTableLoadingId] = useState<number | null>(
        null
    );
    const [fundingTournament, setFundingTournament] =
        useState<Tournament | null>(null);
    const [registerTournament, setRegisterTournament] =
        useState<Tournament | null>(null);
    const [cryptoUnregisterTournament, setCryptoUnregisterTournament] =
        useState<Tournament | null>(null);

    const {
        pending: pendingTxs,
        add: addPendingTx,
        remove: removePendingTx,
        getForTournament: getPendingTx,
        explorerUrl: pendingExplorerUrl,
    } = usePendingTournamentTxs();

    // Poll registrations while there are pending on-chain txs waiting to sync
    useEffect(() => {
        if (pendingTxs.length === 0 || !myWallet) return;
        const id = setInterval(async () => {
            try {
                const data = await getMyTournamentRegistrations();
                const synced = new Set(data.tournament_ids);
                setRegisteredIds(synced);
                // Clear pending items that have now landed in the DB
                pendingTxs.forEach((tx) => {
                    if (tx.type === 'register' && synced.has(tx.tournamentId)) {
                        removePendingTx(tx.tournamentId, 'register');
                    }
                    if (
                        tx.type === 'unregister' &&
                        !synced.has(tx.tournamentId)
                    ) {
                        removePendingTx(tx.tournamentId, 'unregister');
                    }
                });
            } catch {
                /* ignore */
            }
        }, 3000);
        return () => clearInterval(id);
    }, [pendingTxs, myWallet, removePendingTx]);

    const isMyTournament = (t: Tournament) =>
        registeredIds.has(t.id) ||
        (!!myWallet && t.host_wallet.toLowerCase() === myWallet.toLowerCase());

    const now = Date.now();
    const visibleTournaments = tournaments
        .filter((t) => {
            // Hide pending (not yet open for registration) unless it's yours
            if (t.status === 'pending') return isMyTournament(t);
            return true;
        })
        .sort((a, b) => compareLobbyTournaments(a, b, now));

    const handleViewOverview = (id: number) => {
        router.push(`/tournament/${id}`);
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tournamentsData, regsData] = await Promise.all([
                listTournaments({ limit: PAGE_SIZE, offset: 0 }),
                myWalletRef.current
                    ? getMyTournamentRegistrations()
                    : Promise.resolve({ tournament_ids: [], finish_pos: {} }),
            ]);
            setTournaments(tournamentsData.tournaments ?? []);
            setTotalCount(tournamentsData.total_count ?? 0);
            setRegisteredIds(new Set(regsData.tournament_ids));
            setFinishPos(regsData.finish_pos ?? {});
        } catch {
            toastRef.current.error('Failed to load tournaments');
        } finally {
            setIsLoading(false);
        }
    }, []); // wallet + toast accessed via refs — intentionally excluded from deps

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            const data = await listTournaments({
                limit: PAGE_SIZE,
                offset: tournaments.length,
            });
            // De-dupe by id: a tournament whose status changed between pages could
            // shift ranks and reappear; keep the first (freshest) copy.
            setTournaments((prev) => {
                const seen = new Set(prev.map((t) => t.id));
                return [
                    ...prev,
                    ...(data.tournaments ?? []).filter((t) => !seen.has(t.id)),
                ];
            });
            setTotalCount(data.total_count ?? 0);
        } catch {
            toastRef.current.error('Failed to load more tournaments');
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        load();
    }, [load]);

    // load() already fetches registrations for the wallet present at mount.
    // Only refetch when the wallet actually changes afterwards (connect/swap),
    // so we don't duplicate the initial registrations request.
    const didInitialRegLoadRef = useRef(false);
    useEffect(() => {
        if (!didInitialRegLoadRef.current) {
            didInitialRegLoadRef.current = true;
            return;
        }
        if (!myWallet) return;
        getMyTournamentRegistrations()
            .then((data) => {
                setRegisteredIds(new Set(data.tournament_ids));
                setFinishPos(data.finish_pos ?? {});
            })
            .catch(() => {});
    }, [myWallet]);

    const isCryptoTournament = (t: Tournament) => !!t.contract_address;

    // Every register path (crypto / Free Play, public / password-gated) runs
    // through the one shared modal, which owns the on-chain or server register.
    const handleRegister = async (id: number) => {
        // Not signed in → take them straight through the sign-in flow (connect
        // + SIWE) rather than dead-ending on a "connect your wallet" toast.
        if (!isSignedIn) {
            promptSignIn();
            return;
        }
        const t = tournaments.find((x) => x.id === id);
        if (!t) return;
        setRegisterTournament(t);
    };

    const handleUnregister = async (id: number) => {
        const t = tournaments.find((x) => x.id === id);
        if (!t) return;
        if (isCryptoTournament(t)) {
            setCryptoUnregisterTournament(t);
            return;
        }
        setActionLoading(true);
        try {
            await unregisterFromTournament(id);
            setRegisteredIds((prev) => {
                const next = new Set(Array.from(prev));
                next.delete(id);
                const ids = Array.from(next);
                const byId: Record<number, Tournament | undefined> = {};
                ids.forEach((rid) => {
                    byId[rid] = tournaments.find((t) => t.id === rid);
                });
                useTournamentReminderStore
                    .getState()
                    .updateRegistrations(ids, byId);
                return next;
            });
            toast.info('Unregistered');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to unregister';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFundGuarantee = (id: number) => {
        const t = tournaments.find((x) => x.id === id);
        if (t) setFundingTournament(t);
    };

    const handleGoToTable = async (id: number) => {
        if (!myWallet) {
            toast.warning('Connect your wallet to go to your table');
            return;
        }
        setGoToTableLoadingId(id);
        try {
            const data = await getTournamentLeaderboard(id);
            const entry = (data?.players ?? []).find(
                (p: { wallet: string; table_index: number }) =>
                    p.wallet.toLowerCase() === myWallet.toLowerCase()
            );
            if (!entry) {
                toast.error("You're not seated in this tournament");
                return;
            }
            router.push(
                `/table/tournament-${id}-table-${entry.table_index + 1}`
            );
        } catch {
            toast.error('Could not find your table');
        } finally {
            setGoToTableLoadingId(null);
        }
    };

    return (
        <VStack align="stretch" spacing={6} w="full">
            {isLoading ? (
                <Flex justify="center" py={12}>
                    <Spinner color="brand.green" size="lg" />
                </Flex>
            ) : visibleTournaments.length === 0 ? (
                <TournamentsEmptyState onCreate={openCreate} />
            ) : (
                <>
                    <SimpleGrid
                        columns={{ base: 1, sm: 2, lg: 3 }}
                        spacing={{ base: 3, md: 4 }}
                    >
                        {visibleTournaments.map((t, index) => (
                            <TournamentLobbyCard
                                key={t.id}
                                index={index}
                                tournament={t}
                                myWallet={myWallet}
                                isSignedIn={isSignedIn}
                                onRegister={handleRegister}
                                onUnregister={handleUnregister}
                                onGoToTable={handleGoToTable}
                                onViewOverview={handleViewOverview}
                                onFundGuarantee={handleFundGuarantee}
                                onCardClick={handleViewOverview}
                                registeredIds={registeredIds}
                                isEliminated={(finishPos[t.id] ?? 0) > 0}
                                isLoading={actionLoading}
                                isGoingToTable={goToTableLoadingId === t.id}
                                pendingTx={getPendingTx(t.id)}
                                explorerUrl={pendingExplorerUrl}
                            />
                        ))}
                    </SimpleGrid>

                    {tournaments.length < totalCount && (
                        <Flex justify="center" pt={2}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLoadMore}
                                isLoading={isLoadingMore}
                                loadingText="Loading…"
                            >
                                Load more
                            </Button>
                        </Flex>
                    )}
                </>
            )}

            <FundGuaranteeModal
                tournament={fundingTournament}
                onClose={() => setFundingTournament(null)}
                onSuccess={() => {
                    setFundingTournament(null);
                    load();
                }}
            />

            <TournamentRegisterModal
                tournament={registerTournament}
                onClose={() => setRegisterTournament(null)}
                onSuccess={(id, txHash) => {
                    setRegisteredIds((prev) => {
                        const n = new Set(Array.from(prev));
                        n.add(id);
                        return n;
                    });
                    const justRegistered =
                        tournaments.find((t) => t.id === id) ?? null;
                    // Upsert so other registered tournaments survive; poll reconciles.
                    useTournamentReminderStore
                        .getState()
                        .upsertTournament(justRegistered ?? undefined);
                    setConfirmTour(justRegistered);
                    if (txHash && registerTournament?.chain) {
                        addPendingTx({
                            tournamentId: id,
                            txHash,
                            type: 'register',
                            chainName: registerTournament.chain,
                        });
                    }
                    setRegisterTournament(null);
                }}
            />

            <CryptoUnregisterModal
                tournament={cryptoUnregisterTournament}
                onClose={() => setCryptoUnregisterTournament(null)}
                onSuccess={(id, txHash) => {
                    setRegisteredIds((prev) => {
                        const n = new Set(Array.from(prev));
                        n.delete(id);
                        return n;
                    });
                    if (txHash && cryptoUnregisterTournament?.chain) {
                        addPendingTx({
                            tournamentId: id,
                            txHash,
                            type: 'unregister',
                            chainName: cryptoUnregisterTournament.chain,
                        });
                    }
                    setCryptoUnregisterTournament(null);
                }}
            />

            {confirmTour && (
                <RegistrationConfirmationModal
                    tournament={confirmTour}
                    isOpen={!!confirmTour}
                    onClose={() => setConfirmTour(null)}
                />
            )}
        </VStack>
    );
}

// ─── Fund Guarantee Modal ────────────────────────────────────────────────────

interface FundGuaranteeModalProps {
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function FundGuaranteeModal({
    tournament: t,
    onClose,
    onSuccess,
}: FundGuaranteeModalProps) {
    const toast = useToastHelper();
    const chainConfig = t?.chain ? CHAIN_CONFIG[t.chain] : undefined;

    const { fundAndOpen, status, error, isLoading, reset } =
        useFundTournamentGuarantee(
            t?.id,
            t?.contract_address,
            chainConfig?.chain,
            chainConfig?.usdc,
            t?.guarantee_usdc ?? 0
        );

    const statusLabel: Record<string, string> = {
        checking: 'Checking funding…',
        approving: 'Approving USDC…',
        depositing: 'Depositing guarantee…',
    };

    const handleFund = async () => {
        const ok = await fundAndOpen();
        if (ok) {
            toast.success('Guarantee funded — registration opens shortly');
            onSuccess();
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={!!t} onClose={handleClose} isCentered>
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.6)"
                backdropFilter="blur(6px)"
            />
            <ModalContent
                bg="card.white"
                color="text.primary"
                borderRadius="16px"
                mx={4}
                boxShadow="card.lift"
            >
                <ModalHeader
                    fontSize="xl"
                    fontWeight={800}
                    letterSpacing="-0.02em"
                    color="text.primary"
                    pb={2}
                >
                    Fund Guarantee
                </ModalHeader>
                <ModalCloseButton
                    color="text.secondary"
                    borderRadius="full"
                    _hover={{ bg: 'card.lightGray', color: 'text.primary' }}
                />
                <ModalBody>
                    <VStack spacing={4} py={2}>
                        <Text
                            fontSize="sm"
                            color="text.secondary"
                            textAlign="center"
                        >
                            Deposit the guarantee to secure the prize pool. Any
                            unused amount is returned to you when the tournament
                            starts.
                        </Text>
                        <HStack spacing={2} align="center">
                            <Image
                                src={USDC_LOGO}
                                alt=""
                                boxSize="28px"
                                flexShrink={0}
                            />
                            <Text
                                fontSize="2xl"
                                fontWeight="bold"
                                color={USDC_BLUE}
                                lineHeight={1}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                ${formatUsdc(t?.guarantee_usdc ?? 0, { decimals: (t?.guarantee_usdc ?? 0) < 5_000_000 ? 2 : 0 })}
                            </Text>
                            <Text
                                fontSize="md"
                                fontWeight="semibold"
                                color="text.muted"
                            >
                                USDC GTD
                            </Text>
                        </HStack>
                        {status === 'error' && error && (
                            <Text
                                fontSize="xs"
                                color="red.400"
                                textAlign="center"
                            >
                                {error}
                            </Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter pt={2}>
                    <VStack w="full" spacing={2.5}>
                        <Button
                            variant="tactilePrimary"
                            w="full"
                            minH="48px"
                            isLoading={isLoading}
                            loadingText={statusLabel[status] ?? 'Processing…'}
                            isDisabled={status === 'success'}
                            onClick={handleFund}
                        >
                            Approve &amp; Fund $
                            {formatUsdc(t?.guarantee_usdc ?? 0, { decimals: (t?.guarantee_usdc ?? 0) < 5_000_000 ? 2 : 0 })} GTD
                        </Button>
                        <Button
                            variant="tactileGhost"
                            w="full"
                            minH="44px"
                            isDisabled={isLoading}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── CryptoUnregisterModal ────────────────────────────────────────────────────

interface CryptoUnregisterModalProps {
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: (id: number, txHash?: string) => void;
}

export function CryptoUnregisterModal({
    tournament: t,
    onClose,
    onSuccess,
}: CryptoUnregisterModalProps) {
    const { unregister, status, error, isLoading, reset } =
        useRegisterForTournament(t ?? undefined);
    const toast = useToastHelper();

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleUnregister = async () => {
        if (!t) return;
        const { ok, txHash } = await unregister();
        if (ok) {
            toast.info('Unregistered — refund processing on-chain');
            onSuccess(t.id, txHash);
        }
    };

    return (
        <Modal isOpen={!!t} onClose={handleClose} isCentered size="sm">
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.6)"
                backdropFilter="blur(6px)"
            />
            <ModalContent
                bg="card.white"
                color="text.primary"
                borderRadius="16px"
                mx={4}
                boxShadow="card.lift"
            >
                <ModalHeader
                    fontSize="xl"
                    fontWeight={800}
                    letterSpacing="-0.02em"
                    color="text.primary"
                    pb={2}
                >
                    Unregister from Tournament
                </ModalHeader>
                <ModalCloseButton
                    color="text.secondary"
                    borderRadius="full"
                    _hover={{ bg: 'card.lightGray', color: 'text.primary' }}
                />
                <ModalBody pb={2}>
                    <VStack spacing={2} align="stretch">
                        <Text fontSize="sm">
                            Your buy-in will be refunded on-chain after the
                            transaction confirms.
                        </Text>
                        {error && (
                            <Text fontSize="sm" color="red.400">
                                {error}
                            </Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter pt={2}>
                    <VStack w="full" spacing={2.5}>
                        <Button
                            variant="tactileDestructive"
                            w="full"
                            minH="48px"
                            onClick={handleUnregister}
                            isLoading={isLoading}
                            loadingText="Unregistering…"
                        >
                            Confirm Unregister
                        </Button>
                        <Button
                            variant="tactileGhost"
                            w="full"
                            minH="44px"
                            onClick={handleClose}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
