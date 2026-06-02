'use client';

import {
    Badge,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Spinner,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRouter, useSearchParams } from 'next/navigation';
import useToastHelper from '../../hooks/useToastHelper';
import {
    createTournament,
    getMyTournamentRegistrations,
    getTournamentLeaderboard,
    listTournaments,
    registerForTournament,
    type Tournament,
    unregisterFromTournament,
} from '../../hooks/server_actions';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import { usePendingTournamentTxs } from '../../hooks/usePendingTournamentTxs';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import TournamentCard from './TournamentCard';
import TournamentsPlaceholder from './TournamentsPlaceholder';

// Minimal keccak256 via SubtleCrypto is not available for keccak.
// We derive it by encoding the string as UTF-8 and producing a deterministic
// hex via SHA-256 as the password hash sent to the backend.
// The backend stores this verbatim and compares on registration.
// For on-chain verification the frontend would call the contract directly using
// the ThirdWeb SDK; the backend hash is used only for server-side gating.
async function hashPasswordCode(code: string): Promise<string> {
    const enc = new TextEncoder().encode(code);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export default function TournamentsList() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
    const [finishPos, setFinishPos] = useState<Record<number, number>>({});
    const toast = useToastHelper();
    const toastRef = useRef(toast);
    toastRef.current = toast;
    const account = useActiveAccount();
    const myWallet = account?.address;
    const myWalletRef = useRef(myWallet);
    myWalletRef.current = myWallet;
    const router = useRouter();

    const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();
    const searchParams = useSearchParams();

    // Auto-open the create modal when arriving via ?action=create deep-link
    // (e.g. from the create-game page or HomeCard tournament button).
    const openCreateRef = useRef(openCreate);
    openCreateRef.current = openCreate;
    useEffect(() => {
        if (searchParams?.get('action') === 'create') {
            openCreateRef.current();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run once on mount

    // Password registration state
    const [pendingRegId, setPendingRegId] = useState<number | null>(null);
    const [passwordCode, setPasswordCode] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    // Overview modal state (legacy — Standings/Final standings now navigate to /tournament/[id])
    const [overviewTournamentId, setOverviewTournamentId] = useState<number | null>(null);
    const [overviewData, setOverviewData] = useState<Record<string, unknown> | null>(null);
    const overviewLoading = false;

    const [goToTableLoadingId, setGoToTableLoadingId] = useState<number | null>(null);
    const [fundingTournament, setFundingTournament] = useState<Tournament | null>(null);
    const [cryptoRegisterTournament, setCryptoRegisterTournament] = useState<Tournament | null>(null);
    const [cryptoUnregisterTournament, setCryptoUnregisterTournament] = useState<Tournament | null>(null);
    const [filter, setFilter] = useState<'all' | 'mine'>('all');

    const { pending: pendingTxs, add: addPendingTx, remove: removePendingTx, getForTournament: getPendingTx, explorerUrl: pendingExplorerUrl } = usePendingTournamentTxs();

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
                    if (tx.type === 'unregister' && !synced.has(tx.tournamentId)) {
                        removePendingTx(tx.tournamentId, 'unregister');
                    }
                });
            } catch { /* ignore */ }
        }, 3000);
        return () => clearInterval(id);
    }, [pendingTxs, myWallet, removePendingTx]);

    const isMyTournament = (t: Tournament) =>
        registeredIds.has(t.id) ||
        (!!myWallet && t.host_wallet.toLowerCase() === myWallet.toLowerCase());

    const visibleTournaments = tournaments.filter((t) => {
        if (filter === 'mine') return isMyTournament(t);
        // All tab: hide pending (not yet open for registration) unless it's yours
        if (t.status === 'pending') return isMyTournament(t);
        return true;
    });

    const mineCount = tournaments.filter(isMyTournament).length;

    const handleViewOverview = (id: number) => {
        router.push(`/tournament/${id}`);
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tournamentsData, regsData] = await Promise.all([
                listTournaments(),
                myWalletRef.current ? getMyTournamentRegistrations() : Promise.resolve({ tournament_ids: [], finish_pos: {} }),
            ]);
            setTournaments(tournamentsData.tournaments ?? []);
            setRegisteredIds(new Set(regsData.tournament_ids));
            setFinishPos(regsData.finish_pos ?? {});
        } catch {
            toastRef.current.error('Failed to load tournaments');
        } finally {
            setIsLoading(false);
        }
    }, []); // wallet + toast accessed via refs — intentionally excluded from deps

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!myWallet) return;
        getMyTournamentRegistrations()
            .then(data => {
                setRegisteredIds(new Set(data.tournament_ids));
                setFinishPos(data.finish_pos ?? {});
            })
            .catch(() => {});
    }, [myWallet]);

    const isCryptoTournament = (t: Tournament) => !!t.contract_address;

    const handleRegister = async (id: number) => {
        if (!myWallet) {
            toast.warning('Connect your wallet first');
            return;
        }
        const t = tournaments.find((x) => x.id === id);
        if (!t) return;
        if (isCryptoTournament(t)) {
            setCryptoRegisterTournament(t);
            return;
        }
        // Password-protected free-play tournament: show inline password modal.
        if (t.is_private && !t.contract_address) {
            setPendingRegId(id);
            setPasswordCode('');
            return;
        }
        await doRegister(id);
    };

    const doRegister = async (id: number, passwordCodeHash?: string) => {
        setActionLoading(true);
        try {
            await registerForTournament(id, passwordCodeHash ? { passwordCodeHash } : undefined);
            setRegisteredIds((prev) => { const n = new Set(Array.from(prev)); n.add(id); return n; });
            toast.success('Registered!');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Registration failed';
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!pendingRegId) return;
        if (!passwordCode.trim()) {
            toast.warning('Enter the tournament password');
            return;
        }
        setPasswordLoading(true);
        try {
            const hash = await hashPasswordCode(passwordCode.trim());
            await doRegister(pendingRegId, hash);
            setPendingRegId(null);
            setPasswordCode('');
        } finally {
            setPasswordLoading(false);
        }
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
            router.push(`/table/tournament-${id}-table-${entry.table_index + 1}`);
        } catch {
            toast.error('Could not find your table');
        } finally {
            setGoToTableLoadingId(null);
        }
    };

    return (
        <VStack align="stretch" spacing={6} w="full">
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Heading as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="extrabold"
                    letterSpacing="-0.01em" color="text.primary">
                    Tournaments
                </Heading>
                <HStack spacing={2} flex={1} justify={{ base: 'flex-start', sm: 'center' }}>
                    <FilterTab label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterTab
                        label="Mine"
                        count={myWallet ? mineCount : undefined}
                        active={filter === 'mine'}
                        onClick={() => {
                            if (!myWallet) { toast.warning('Connect your wallet to see your tournaments'); return; }
                            setFilter('mine');
                        }}
                    />
                </HStack>
                <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                        if (!myWallet) {
                            toast.warning('Connect your wallet to create a tournament');
                            return;
                        }
                        openCreate();
                    }}
                >
                    + Create
                </Button>
            </Flex>

            {isLoading ? (
                <Flex justify="center" py={12}>
                    <Spinner color="brand.green" size="lg" />
                </Flex>
            ) : visibleTournaments.length === 0 ? (
                filter === 'mine' ? (
                    <Text fontSize="sm" color="text.secondary" textAlign="center" py={10}>
                        You haven&apos;t created or registered for any tournaments yet.
                    </Text>
                ) : (
                    <TournamentsPlaceholder hideHeader />
                )
            ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                    {visibleTournaments.map((t) => (
                        <TournamentCard
                            key={t.id}
                            tournament={t}
                            myWallet={myWallet}
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
            )}

            <CreateTournamentModal
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onCreated={load}
            />

            <FundGuaranteeModal
                tournament={fundingTournament}
                onClose={() => setFundingTournament(null)}
                onSuccess={() => { setFundingTournament(null); load(); }}
            />

            <CryptoRegisterModal
                tournament={cryptoRegisterTournament}
                onClose={() => setCryptoRegisterTournament(null)}
                onSuccess={(id, txHash) => {
                    setRegisteredIds((prev) => { const n = new Set(Array.from(prev)); n.add(id); return n; });
                    if (txHash && cryptoRegisterTournament?.chain) {
                        addPendingTx({ tournamentId: id, txHash, type: 'register', chainName: cryptoRegisterTournament.chain });
                    }
                    setCryptoRegisterTournament(null);
                }}
            />

            <CryptoUnregisterModal
                tournament={cryptoUnregisterTournament}
                onClose={() => setCryptoUnregisterTournament(null)}
                onSuccess={(id, txHash) => {
                    setRegisteredIds((prev) => { const n = new Set(Array.from(prev)); n.delete(id); return n; });
                    if (txHash && cryptoUnregisterTournament?.chain) {
                        addPendingTx({ tournamentId: id, txHash, type: 'unregister', chainName: cryptoUnregisterTournament.chain });
                    }
                    setCryptoUnregisterTournament(null);
                }}
            />

            {/* Tournament overview modal */}
            <Modal
                isOpen={overviewTournamentId !== null}
                onClose={() => { setOverviewTournamentId(null); setOverviewData(null); }}
                isCentered
                size="lg"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tournament Standings</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4}>
                        {overviewLoading ? (
                            <Flex justify="center" py={8}><Spinner color="brand.green" /></Flex>
                        ) : overviewData ? (
                            <TournamentOverviewTable
                                data={overviewData as Record<string, unknown>}
                                isLive={Boolean(overviewData.live)}
                                myWallet={myWallet}
                                onGoToTable={(tableIdx) => {
                                    if (overviewTournamentId !== null) {
                                        router.push(`/table/tournament-${overviewTournamentId}-table-${tableIdx + 1}`);
                                    }
                                }}
                            />
                        ) : (
                            <Text fontSize="sm" color="text.secondary" textAlign="center" py={6}>
                                No player data available yet.
                            </Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Password entry modal */}
            <Modal
                isOpen={pendingRegId !== null}
                onClose={() => setPendingRegId(null)}
                isCentered
                initialFocusRef={passwordInputRef}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tournament Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel fontSize="sm">Enter the access code to register</FormLabel>
                            <Input
                                ref={passwordInputRef}
                                size="sm"
                                type="password"
                                placeholder="Access code"
                                value={passwordCode}
                                onChange={(e) => setPasswordCode(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} size="sm" onClick={() => setPendingRegId(null)}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="green"
                            size="sm"
                            isLoading={passwordLoading}
                            onClick={handlePasswordSubmit}
                        >
                            Register
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}

// Normalised row used by both live and final standings views.
interface StandingsRow {
    wallet: string;
    xUsername?: string;
    stack: number | null;     // null for completed tournaments (no live chip count)
    tableIndex: number | null;
    finishPos: number;        // 0 = still active, >0 = eliminated / final position
    prizeUsdc: number;        // 0 for free-play or not yet paid
}

function normaliseLeaderboardData(data: Record<string, unknown>): StandingsRow[] {
    if (data.live && Array.isArray(data.players)) {
        return (data.players as Array<{ wallet: string; stack: number; table_index: number; finish_pos: number; x_username?: string }>)
            .map(p => ({
                wallet: p.wallet,
                xUsername: p.x_username || undefined,
                stack: p.stack,
                tableIndex: p.table_index,
                finishPos: p.finish_pos ?? 0,
                prizeUsdc: 0,
            }));
    }
    if (Array.isArray(data.results)) {
        return (data.results as Array<{ wallet_address: string; finish_position: number; prize_usdc: number; x_username?: string }>)
            .map(r => ({
                wallet: r.wallet_address,
                xUsername: r.x_username || undefined,
                stack: null,
                tableIndex: null,
                finishPos: r.finish_position,
                prizeUsdc: r.prize_usdc ?? 0,
            }));
    }
    return [];
}

function TournamentOverviewTable({
    data,
    isLive,
    myWallet,
    onGoToTable,
}: {
    data: Record<string, unknown>;
    isLive: boolean;
    myWallet?: string;
    onGoToTable: (tableIdx: number) => void;
}) {
    const mutedColor = useColorModeValue('text.muted', 'text.muted');
    const highlightBg = useColorModeValue('green.50', 'whiteAlpha.100');
    const eliminatedBg = useColorModeValue('orange.50', 'orange.900');
    const eliminatedTextColor = useColorModeValue('orange.700', 'orange.200');

    const rows = normaliseLeaderboardData(data);
    if (!rows.length) {
        return <Text fontSize="sm" color="text.secondary" textAlign="center" py={6}>No player data available yet.</Text>;
    }

    const hasPrizes = rows.some(r => r.prizeUsdc > 0);

    const sorted = [...rows].sort((a, b) => {
        // Still-active players first (finishPos === 0), sorted by stack desc.
        // Eliminated players after, sorted by finishPos asc (1st = best).
        if (a.finishPos === 0 && b.finishPos === 0) return (b.stack ?? 0) - (a.stack ?? 0);
        if (a.finishPos === 0) return -1;
        if (b.finishPos === 0) return 1;
        return a.finishPos - b.finishPos;
    });

    const myRow = myWallet
        ? sorted.find(r => r.wallet.toLowerCase() === myWallet.toLowerCase())
        : null;
    const myEliminated = myRow && myRow.finishPos > 0;

    return (
        <VStack align="stretch" spacing={3}>
            {myEliminated && myRow && (
                <Flex
                    bg={eliminatedBg}
                    borderRadius="10px"
                    px={4}
                    py={3}
                    align="center"
                    justify="space-between"
                >
                    <Text fontSize="sm" fontWeight="bold" color={eliminatedTextColor}>
                        You finished #{myRow.finishPos}
                    </Text>
                    {myRow.prizeUsdc > 0 && (
                        <Badge colorScheme="green" fontSize="sm">
                            ${(myRow.prizeUsdc / 1_000_000).toFixed(2)} USDC
                        </Badge>
                    )}
                </Flex>
            )}
            <Table size="sm" variant="simple">
                <Thead>
                    <Tr>
                        <Th px={2} fontSize="2xs" color={mutedColor}>Place</Th>
                        <Th px={2} fontSize="2xs" color={mutedColor}>Player</Th>
                        {isLive && <Th px={2} fontSize="2xs" color={mutedColor} isNumeric>Chips</Th>}
                        {isLive && <Th px={2} fontSize="2xs" color={mutedColor}>Table</Th>}
                        {!isLive && hasPrizes && (
                            <Th px={2} fontSize="2xs" color={mutedColor} isNumeric>Prize</Th>
                        )}
                    </Tr>
                </Thead>
                <Tbody>
                    {sorted.map((p, i) => {
                        const isSelf = myWallet && p.wallet.toLowerCase() === myWallet.toLowerCase();
                        const isEliminated = p.finishPos > 0;
                        const placeLabel = isEliminated ? `#${p.finishPos}` : `${i + 1}`;
                        return (
                            <Tr key={p.wallet} bg={isSelf ? highlightBg : undefined} opacity={isEliminated && !isSelf ? 0.5 : 1}>
                                <Td px={2} fontSize="xs" fontWeight={isSelf ? 'bold' : 'normal'} color={isEliminated ? mutedColor : 'text.primary'}>
                                    {placeLabel}
                                </Td>
                                <Td px={2} fontSize="xs" maxW="140px">
                                    <HStack spacing={1}>
                                        <Text isTruncated fontWeight={isSelf ? 'bold' : 'normal'} color={isSelf ? 'brand.green' : 'text.primary'}>
                                            {p.xUsername ?? `${p.wallet.slice(0, 6)}…${p.wallet.slice(-4)}`}
                                        </Text>
                                        {isSelf && <Badge colorScheme="green" fontSize="2xs">you</Badge>}
                                    </HStack>
                                </Td>
                                {isLive && (
                                    <Td px={2} fontSize="xs" isNumeric fontWeight="semibold" color={isEliminated ? mutedColor : 'text.primary'}>
                                        {isEliminated ? '—' : (p.stack ?? 0).toLocaleString()}
                                    </Td>
                                )}
                                {isLive && (
                                    <Td px={2} fontSize="xs">
                                        {isEliminated || p.tableIndex === null ? (
                                            <Text color={mutedColor}>—</Text>
                                        ) : (
                                            <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => onGoToTable(p.tableIndex!)}>
                                                Table {p.tableIndex + 1}
                                            </Button>
                                        )}
                                    </Td>
                                )}
                                {!isLive && hasPrizes && (
                                    <Td px={2} fontSize="xs" isNumeric color={p.prizeUsdc > 0 ? 'brand.green' : mutedColor} fontWeight={p.prizeUsdc > 0 ? 'bold' : 'normal'}>
                                        {p.prizeUsdc > 0 ? `$${(p.prizeUsdc / 1_000_000).toFixed(2)}` : '—'}
                                    </Td>
                                )}
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </VStack>
    );
}

interface CreateTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateTournamentModal({ isOpen, onClose, onCreated }: CreateTournamentModalProps) {
    const [isFreePlay, setIsFreePlay] = useState(true);
    const [chain, setChain] = useState('base-sepolia');
    const [buyInUsdc, setBuyInUsdc] = useState('10');
    const [guaranteeUsdc, setGuaranteeUsdc] = useState('');
    const [minPlayers, setMinPlayers] = useState('2');
    const [maxPlayers, setMaxPlayers] = useState('9');
    const [blindStructure, setBlindStructure] = useState('turbo');
    const [lateRegLevels, setLateRegLevels] = useState(0);
    const [tableSize, setTableSize] = useState(9);
    const [tournamentName, setTournamentName] = useState('');
    const [reentryAllowed, setReentryAllowed] = useState(false);
    const [reentryMax, setReentryMax] = useState(1);
    const [scheduledAt, setScheduledAt] = useState('');
    const [passwordCode, setPasswordCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'fund'>('form');
    const [createdTournament, setCreatedTournament] = useState<Tournament | null>(null);
    const toast = useToastHelper();

    const guaranteeAmountMicro = guaranteeUsdc ? Math.round(parseFloat(guaranteeUsdc) * 1_000_000) : 0;
    const chainConfig = CHAIN_CONFIG[chain];

    const { fundAndOpen, status: fundStatus, error: fundError, isLoading: isFunding, reset: resetFund } =
        useFundTournamentGuarantee(
            createdTournament?.id,
            createdTournament?.contract_address,
            chainConfig?.chain,
            chainConfig?.usdc,
            guaranteeAmountMicro,
        );

    const fundStatusLabel: Record<string, string> = {
        approving: 'Approving USDC…',
        depositing: 'Depositing guarantee…',
        opening: 'Opening registration…',
    };

    const handleClose = () => {
        setStep('form');
        setCreatedTournament(null);
        setLateRegLevels(0);
        setTableSize(9);
        setTournamentName('');
        setReentryAllowed(false);
        setReentryMax(1);
        resetFund();
        onClose();
    };

    const handleCreate = async () => {
        if (!scheduledAt) {
            toast.warning('Start time is required');
            return;
        }
        const startMs = new Date(scheduledAt).getTime();
        if (isNaN(startMs) || startMs < Date.now() + 3 * 60 * 1000) {
            toast.warning('Start time must be at least 3 minutes in the future');
            return;
        }
        if (!isFreePlay) {
            const buyIn = parseFloat(buyInUsdc) || 0;
            const guarantee = parseFloat(guaranteeUsdc) || 0;
            if (buyIn === 0 && guarantee === 0) {
                toast.warning('Freeroll tournaments require a guarantee — set a prize pool amount');
                return;
            }
        }
        setIsLoading(true);
        try {
            let passwordCodeHash: string | undefined;
            if (passwordCode.trim()) {
                passwordCodeHash = await hashPasswordCode(passwordCode.trim());
            }

            const needsGuarantee = !isFreePlay && guaranteeUsdc && parseFloat(guaranteeUsdc) > 0;
            const result = await createTournament({
                name: tournamentName.trim() || undefined,
                min_entries: parseInt(minPlayers, 10),
                max_entries: parseInt(maxPlayers, 10),
                buy_in_usdc: isFreePlay ? 0 : Math.round(parseFloat(buyInUsdc) * 1_000_000),
                guarantee_usdc: needsGuarantee ? guaranteeAmountMicro : undefined,
                scheduled_start_at: new Date(scheduledAt).toISOString(),
                blind_structure: blindStructure,
                late_reg_levels: lateRegLevels,
                table_size: tableSize,
                reentry_allowed: reentryAllowed && lateRegLevels > 0,
                reentry_max: reentryAllowed && lateRegLevels > 0 ? reentryMax : undefined,
                chain: isFreePlay ? undefined : chain,
                password_code_hash: passwordCodeHash,
            });

            if (needsGuarantee && result.tournament.contract_address) {
                setCreatedTournament(result.tournament);
                setStep('fund');
            } else {
                toast.success('Tournament created!');
                onCreated();
                handleClose();
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create tournament';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFundAndOpen = async () => {
        const ok = await fundAndOpen();
        if (ok) {
            toast.success('Guarantee funded — registration is open!');
            onCreated();
            handleClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{step === 'fund' ? 'Fund Guarantee' : 'Create Tournament'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {step === 'fund' && createdTournament ? (
                        <VStack spacing={4} py={2}>
                            <Text fontSize="sm" color="text.secondary" textAlign="center">
                                Tournament deployed. Deposit the guarantee so players know the prize pool is secured.
                                Any unused portion is returned to you when the tournament starts.
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="brand.green">
                                ${(guaranteeAmountMicro / 1_000_000).toFixed(0)} USDC GTD
                            </Text>
                            {fundStatus === 'error' && fundError && (
                                <Text fontSize="xs" color="red.400" textAlign="center">{fundError}</Text>
                            )}
                        </VStack>
                    ) : (
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm">
                                Tournament name{' '}
                                <Text as="span" color="text.secondary" fontWeight="normal">(optional)</Text>
                            </FormLabel>
                            <Input
                                size="sm"
                                value={tournamentName}
                                onChange={(e) => setTournamentName(e.target.value)}
                                placeholder="e.g. Sunday Majors #1"
                                maxLength={80}
                            />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel fontSize="sm" mb={0} flex={1}>Free-play (no buy-in)</FormLabel>
                            <Switch
                                isChecked={isFreePlay}
                                onChange={(e) => setIsFreePlay(e.target.checked)}
                                colorScheme="green"
                            />
                        </FormControl>

                        {!isFreePlay && (
                            <>
                                <FormControl>
                                    <FormLabel fontSize="sm">Chain</FormLabel>
                                    <Select
                                        value={chain}
                                        onChange={(e) => setChain(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="base-sepolia">Base Sepolia (testnet)</option>
                                        <option value="base">Base (mainnet)</option>
                                    </Select>
                                </FormControl>
                                <HStack w="full" spacing={3}>
                                    <FormControl>
                                        <FormLabel fontSize="sm">Buy-in (USDC)</FormLabel>
                                        <Input
                                            size="sm"
                                            type="number"
                                            min={0.01}
                                            step={0.01}
                                            value={buyInUsdc}
                                            onChange={(e) => setBuyInUsdc(e.target.value)}
                                            placeholder="10.00"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">
                                            Guarantee{' '}
                                            <Text as="span" color="text.secondary" fontWeight="normal">(GTD, optional)</Text>
                                        </FormLabel>
                                        <Input
                                            size="sm"
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={guaranteeUsdc}
                                            onChange={(e) => setGuaranteeUsdc(e.target.value)}
                                            placeholder="0"
                                        />
                                    </FormControl>
                                </HStack>
                            </>
                        )}

                        <HStack w="full" spacing={3}>
                            <FormControl>
                                <FormLabel fontSize="sm">Blind structure</FormLabel>
                                <Select
                                    value={blindStructure}
                                    onChange={(e) => setBlindStructure(e.target.value)}
                                    size="sm"
                                >
                                    <option value="hyper">Hyper (5-min levels)</option>
                                    <option value="turbo">Turbo (10-min levels)</option>
                                    <option value="regular">Regular (20-min levels)</option>
                                    <option value="deep">Deep stack (30-min levels)</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Late registration</FormLabel>
                                <Select
                                    value={lateRegLevels}
                                    onChange={(e) => setLateRegLevels(parseInt(e.target.value, 10))}
                                    size="sm"
                                >
                                    <option value={0}>None</option>
                                    <option value={1}>1 blind level</option>
                                    <option value={2}>2 blind levels</option>
                                    <option value={3}>3 blind levels</option>
                                </Select>
                            </FormControl>
                        </HStack>

                        <HStack w="full" spacing={3}>
                            <FormControl>
                                <FormLabel fontSize="sm">Table size</FormLabel>
                                <Select
                                    value={tableSize}
                                    onChange={(e) => setTableSize(parseInt(e.target.value, 10))}
                                    size="sm"
                                >
                                    <option value={9}>9-max</option>
                                    <option value={8}>8-max</option>
                                    <option value={6}>6-max</option>
                                </Select>
                            </FormControl>
                            <FormControl flex={1} />
                        </HStack>

                        <HStack w="full" spacing={3} align="flex-end">
                            <FormControl display="flex" alignItems="center" flex={1}>
                                <FormLabel fontSize="sm" mb={0} flex={1}>
                                    Re-entries
                                    {lateRegLevels === 0 && (
                                        <Text as="span" fontSize="xs" color="text.secondary" ml={1}>(requires late reg)</Text>
                                    )}
                                </FormLabel>
                                <Switch
                                    isChecked={reentryAllowed}
                                    onChange={(e) => setReentryAllowed(e.target.checked)}
                                    colorScheme="green"
                                    isDisabled={lateRegLevels === 0}
                                />
                            </FormControl>
                            {reentryAllowed && lateRegLevels > 0 && (
                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm">Max re-entries</FormLabel>
                                    <Select
                                        value={reentryMax}
                                        onChange={(e) => setReentryMax(parseInt(e.target.value, 10))}
                                        size="sm"
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                    </Select>
                                </FormControl>
                            )}
                        </HStack>

                        <HStack w="full" spacing={3}>
                            <FormControl>
                                <FormLabel fontSize="sm">Min players</FormLabel>
                                <Input
                                    size="sm"
                                    type="number"
                                    min={2}
                                    max={100}
                                    value={minPlayers}
                                    onChange={(e) => setMinPlayers(e.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Max players</FormLabel>
                                <Input
                                    size="sm"
                                    type="number"
                                    min={2}
                                    max={1000}
                                    value={maxPlayers}
                                    onChange={(e) => setMaxPlayers(e.target.value)}
                                />
                            </FormControl>
                        </HStack>

                        <FormControl>
                            <FormLabel fontSize="sm">Scheduled start</FormLabel>
                            <Input
                                size="sm"
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">
                                Access code{' '}
                                <Text as="span" color="text.secondary" fontWeight="normal">
                                    (optional — leave blank for open registration)
                                </Text>
                            </FormLabel>
                            <Input
                                size="sm"
                                type="text"
                                placeholder="e.g. POKER2025"
                                value={passwordCode}
                                onChange={(e) => setPasswordCode(e.target.value)}
                            />
                        </FormControl>
                    </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose} size="sm">
                        {step === 'fund' ? 'Skip for now' : 'Cancel'}
                    </Button>
                    {step === 'fund' ? (
                        <Button
                            colorScheme="green"
                            size="sm"
                            isLoading={isFunding}
                            loadingText={fundStatusLabel[fundStatus] ?? 'Processing…'}
                            isDisabled={fundStatus === 'success'}
                            onClick={handleFundAndOpen}
                        >
                            Approve &amp; Fund ${(guaranteeAmountMicro / 1_000_000).toFixed(0)} GTD
                        </Button>
                    ) : (
                        <Button
                            colorScheme="green"
                            size="sm"
                            isLoading={isLoading}
                            onClick={handleCreate}
                        >
                            {isFreePlay ? 'Create free-play tournament' : 'Deploy & create'}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── Fund Guarantee Modal ────────────────────────────────────────────────────

interface FundGuaranteeModalProps {
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: () => void;
}

function FundGuaranteeModal({ tournament: t, onClose, onSuccess }: FundGuaranteeModalProps) {
    const toast = useToastHelper();
    const chainConfig = t?.chain ? CHAIN_CONFIG[t.chain] : undefined;

    const { fundAndOpen, status, error, isLoading, reset } = useFundTournamentGuarantee(
        t?.id,
        t?.contract_address,
        chainConfig?.chain,
        chainConfig?.usdc,
        t?.guarantee_usdc ?? 0,
    );

    const statusLabel: Record<string, string> = {
        approving: 'Approving USDC…',
        depositing: 'Depositing guarantee…',
        opening: 'Opening registration…',
    };

    const handleFund = async () => {
        const ok = await fundAndOpen();
        if (ok) {
            toast.success('Guarantee funded — registration is open!');
            onSuccess();
        }
    };

    const handleClose = () => { reset(); onClose(); };

    return (
        <Modal isOpen={!!t} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Fund Guarantee</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} py={2}>
                        <Text fontSize="sm" color="text.secondary" textAlign="center">
                            Deposit the guarantee to secure the prize pool. Any unused amount
                            is returned to you when the tournament starts.
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.green">
                            ${((t?.guarantee_usdc ?? 0) / 1_000_000).toFixed(0)} USDC GTD
                        </Text>
                        {status === 'error' && error && (
                            <Text fontSize="xs" color="red.400" textAlign="center">{error}</Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose} size="sm">Cancel</Button>
                    <Button
                        colorScheme="green"
                        size="sm"
                        isLoading={isLoading}
                        loadingText={statusLabel[status] ?? 'Processing…'}
                        isDisabled={status === 'success'}
                        onClick={handleFund}
                    >
                        Approve &amp; Fund ${((t?.guarantee_usdc ?? 0) / 1_000_000).toFixed(0)} GTD
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── Filter Tab ──────────────────────────────────────────────────────────────

function FilterTab({ label, count, active, onClick }: {
    label: string;
    count?: number;
    active: boolean;
    onClick: () => void;
}) {
    const activeBg = useColorModeValue('gray.900', 'white');
    const activeColor = useColorModeValue('white', 'gray.900');
    const idleBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const idleColor = useColorModeValue('text.secondary', 'text.secondary');
    const badgeIdleBg = useColorModeValue('gray.300', 'whiteAlpha.300');
    const hoverBg = useColorModeValue('gray.200', 'whiteAlpha.200');

    return (
        <Button
            size="xs"
            px={3}
            h="26px"
            borderRadius="full"
            bg={active ? activeBg : idleBg}
            color={active ? activeColor : idleColor}
            fontWeight={active ? 'semibold' : 'normal'}
            _hover={{ bg: active ? activeBg : hoverBg }}
            _active={{}}
            onClick={onClick}
        >
            {label}
            {count !== undefined && count > 0 && (
                <Badge
                    ml={1.5}
                    px={1.5}
                    py="1px"
                    borderRadius="full"
                    fontSize="2xs"
                    bg={active ? 'brand.green' : badgeIdleBg}
                    color={active ? 'white' : idleColor}
                >
                    {count}
                </Badge>
            )}
        </Button>
    );
}

// ─── TxStep — reusable visual step indicator ─────────────────────────────────

type TxStepState = 'pending' | 'active' | 'done' | 'error';

function TxStep({
    stepNum,
    label,
    sublabel,
    state,
    isLast,
}: {
    stepNum: number;
    label: string;
    sublabel?: string;
    state: TxStepState;
    isLast: boolean;
}) {
    const pendingBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const pendingNumColor = useColorModeValue('gray.500', 'whiteAlpha.500');
    const lineColor = useColorModeValue('gray.200', 'whiteAlpha.200');

    const circleBg =
        state === 'pending' ? pendingBg :
        state === 'error' ? 'red.500' :
        'brand.green';

    const labelColor =
        state === 'pending' ? 'text.secondary' :
        state === 'error' ? 'red.400' :
        'text.primary';

    return (
        <HStack align="flex-start" spacing={3}>
            <VStack spacing={0} flexShrink={0} align="center" w="28px">
                <Flex
                    w="28px" h="28px"
                    borderRadius="full"
                    bg={circleBg}
                    align="center"
                    justify="center"
                    flexShrink={0}
                    transition="background 200ms ease"
                >
                    {state === 'active' ? (
                        <Spinner size="xs" color="white" speed="0.9s" />
                    ) : state === 'done' ? (
                        <Text fontSize="xs" color="white" fontWeight="bold" lineHeight={1}>✓</Text>
                    ) : state === 'error' ? (
                        <Text fontSize="xs" color="white" fontWeight="bold" lineHeight={1}>✕</Text>
                    ) : (
                        <Text fontSize="xs" color={pendingNumColor} fontWeight="semibold" lineHeight={1}>{stepNum}</Text>
                    )}
                </Flex>
                {!isLast && (
                    <Box w="2px" flex={1} minH="20px" bg={lineColor} mt="2px" />
                )}
            </VStack>
            <VStack align="start" spacing={0.5} pb={isLast ? 0 : 5} pt="5px" minW={0}>
                <Text
                    fontSize="sm"
                    fontWeight={state === 'active' ? 'semibold' : 'normal'}
                    color={labelColor}
                    transition="color 200ms ease"
                >
                    {label}
                </Text>
                {sublabel && (
                    <Text fontSize="xs" color="text.secondary">{sublabel}</Text>
                )}
            </VStack>
        </HStack>
    );
}

// ─── CryptoRegisterModal ──────────────────────────────────────────────────────

interface CryptoRegisterModalProps {
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: (id: number, txHash?: string) => void;
}

function CryptoRegisterModal({ tournament: t, onClose, onSuccess }: CryptoRegisterModalProps) {
    const { register, status, error, isLoading, reset } = useRegisterForTournament(t ?? undefined);
    const toast = useToastHelper();
    const [passwordCode, setPasswordCode] = useState('');
    const lastProgressRef = useRef<'approving' | 'registering' | null>(null);

    useEffect(() => {
        if (status === 'approving' || status === 'registering') {
            lastProgressRef.current = status;
        }
    }, [status]);

    const handleClose = () => {
        reset();
        setPasswordCode('');
        lastProgressRef.current = null;
        onClose();
    };

    const handleRegister = async () => {
        if (!t) return;
        const code = t.is_private ? passwordCode.trim() : undefined;
        if (t.is_private && !code) {
            toast.warning('Enter the tournament password');
            return;
        }
        const { ok, txHash } = await register(code);
        if (ok) {
            toast.success('Registered! Your spot is confirmed on-chain.');
            onSuccess(t.id, txHash);
        }
    };

    const buyInDisplay = t ? `$${(t.buy_in_usdc / 1_000_000).toFixed(2)}` : '';
    const showStepper = status !== 'idle';

    let step1State: TxStepState = 'pending';
    let step2State: TxStepState = 'pending';

    if (status === 'approving') {
        step1State = 'active';
    } else if (status === 'registering') {
        step1State = 'done';
        step2State = 'active';
    } else if (status === 'success') {
        step1State = 'done';
        step2State = 'done';
    } else if (status === 'error') {
        if (lastProgressRef.current === 'registering') {
            step1State = 'done';
            step2State = 'error';
        } else {
            step1State = 'error';
        }
    }

    return (
        <Modal isOpen={!!t} onClose={handleClose} isCentered size="sm">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Register for Tournament</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={2}>
                    <VStack spacing={4} align="stretch">
                        {t?.is_private && !showStepper && (
                            <FormControl>
                                <FormLabel fontSize="sm">Tournament password</FormLabel>
                                <Input
                                    size="sm"
                                    placeholder="Enter password"
                                    value={passwordCode}
                                    onChange={(e) => setPasswordCode(e.target.value)}
                                    isDisabled={isLoading}
                                />
                            </FormControl>
                        )}

                        {!showStepper && (
                            <Text fontSize="sm" color="text.secondary">
                                Buy-in:{' '}
                                <Text as="span" fontWeight="bold" color="brand.green">{buyInDisplay} USDC</Text>
                                {' '}will be transferred on registration. Requires two wallet confirmations.
                            </Text>
                        )}

                        {showStepper && (
                            <VStack align="stretch" spacing={0} pt={1}>
                                <TxStep
                                    stepNum={1}
                                    label="Approve USDC spend"
                                    sublabel={step1State === 'active' ? 'Check your wallet…' : undefined}
                                    state={step1State}
                                    isLast={false}
                                />
                                <TxStep
                                    stepNum={2}
                                    label="Register on-chain"
                                    sublabel={step2State === 'active' ? 'Check your wallet…' : undefined}
                                    state={step2State}
                                    isLast={true}
                                />
                            </VStack>
                        )}

                        {error && (
                            <Text fontSize="xs" color="red.400">{error}</Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={handleClose} isDisabled={isLoading}>Cancel</Button>
                    <Button
                        size="sm"
                        colorScheme="green"
                        onClick={handleRegister}
                        isLoading={isLoading}
                        loadingText={status === 'approving' ? 'Approving…' : 'Registering…'}
                    >
                        {status === 'error' ? 'Retry' : 'Approve & Register'}
                    </Button>
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

function CryptoUnregisterModal({ tournament: t, onClose, onSuccess }: CryptoUnregisterModalProps) {
    const { unregister, status, error, isLoading, reset } = useRegisterForTournament(t ?? undefined);
    const toast = useToastHelper();

    const handleClose = () => { reset(); onClose(); };

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
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Unregister from Tournament</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={2}>
                    <VStack spacing={2} align="stretch">
                        <Text fontSize="sm">
                            Your buy-in will be refunded on-chain after the transaction confirms.
                        </Text>
                        {error && <Text fontSize="sm" color="red.400">{error}</Text>}
                    </VStack>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={handleClose} isDisabled={isLoading}>Cancel</Button>
                    <Button
                        size="sm"
                        colorScheme="red"
                        onClick={handleUnregister}
                        isLoading={isLoading}
                        loadingText="Unregistering…"
                    >
                        Confirm Unregister
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
