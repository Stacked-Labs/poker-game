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
    SimpleGrid,
    Spinner,
    Text,
    useColorModeValue,
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
    registerForTournament,
    type Tournament,
    unregisterFromTournament,
} from '../../hooks/server_actions';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import { usePendingTournamentTxs } from '../../hooks/usePendingTournamentTxs';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import TournamentLobbyCard from './TournamentLobbyCard';
import TournamentsEmptyState from './TournamentsEmptyState';

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

    const openCreate = () => router.push('/create-game?type=tournament');

    // Password registration state
    const [pendingRegId, setPendingRegId] = useState<number | null>(null);
    const [passwordCode, setPasswordCode] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const [goToTableLoadingId, setGoToTableLoadingId] = useState<number | null>(
        null
    );
    const [fundingTournament, setFundingTournament] =
        useState<Tournament | null>(null);
    const [cryptoRegisterTournament, setCryptoRegisterTournament] =
        useState<Tournament | null>(null);
    const [cryptoUnregisterTournament, setCryptoUnregisterTournament] =
        useState<Tournament | null>(null);
    const [filter, setFilter] = useState<'all' | 'mine'>('all');

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
                myWalletRef.current
                    ? getMyTournamentRegistrations()
                    : Promise.resolve({ tournament_ids: [], finish_pos: {} }),
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

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!myWallet) return;
        getMyTournamentRegistrations()
            .then((data) => {
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
            await registerForTournament(
                id,
                passwordCodeHash ? { passwordCodeHash } : undefined
            );
            setRegisteredIds((prev) => {
                const n = new Set(Array.from(prev));
                n.add(id);
                return n;
            });
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
            <Flex
                justify="space-between"
                align="center"
                gap={3}
                flexWrap="wrap"
            >
                <Heading
                    as="h2"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="extrabold"
                    letterSpacing="-0.01em"
                    color="text.primary"
                >
                    Tournaments
                </Heading>
                <HStack
                    spacing={2}
                    flex={1}
                    justify={{ base: 'flex-start', sm: 'center' }}
                >
                    <FilterTab
                        label="All"
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    />
                    <FilterTab
                        label="Mine"
                        count={myWallet ? mineCount : undefined}
                        active={filter === 'mine'}
                        onClick={() => {
                            if (!myWallet) {
                                toast.warning(
                                    'Connect your wallet to see your tournaments'
                                );
                                return;
                            }
                            setFilter('mine');
                        }}
                    />
                </HStack>
                <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                        if (!myWallet) {
                            toast.warning(
                                'Connect your wallet to create a tournament'
                            );
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
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        textAlign="center"
                        py={10}
                    >
                        You haven&apos;t created or registered for any
                        tournaments yet.
                    </Text>
                ) : (
                    <TournamentsEmptyState onCreate={openCreate} />
                )
            ) : (
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

            <FundGuaranteeModal
                tournament={fundingTournament}
                onClose={() => setFundingTournament(null)}
                onSuccess={() => {
                    setFundingTournament(null);
                    load();
                }}
            />

            <CryptoRegisterModal
                tournament={cryptoRegisterTournament}
                onClose={() => setCryptoRegisterTournament(null)}
                onSuccess={(id, txHash) => {
                    setRegisteredIds((prev) => {
                        const n = new Set(Array.from(prev));
                        n.add(id);
                        return n;
                    });
                    if (txHash && cryptoRegisterTournament?.chain) {
                        addPendingTx({
                            tournamentId: id,
                            txHash,
                            type: 'register',
                            chainName: cryptoRegisterTournament.chain,
                        });
                    }
                    setCryptoRegisterTournament(null);
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
                            <FormLabel fontSize="sm">
                                Enter the access code to register
                            </FormLabel>
                            <Input
                                ref={passwordInputRef}
                                size="sm"
                                type="password"
                                placeholder="Access code"
                                value={passwordCode}
                                onChange={(e) =>
                                    setPasswordCode(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                        handlePasswordSubmit();
                                }}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            mr={3}
                            size="sm"
                            onClick={() => setPendingRegId(null)}
                        >
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

// ─── Fund Guarantee Modal ────────────────────────────────────────────────────

interface FundGuaranteeModalProps {
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: () => void;
}

function FundGuaranteeModal({
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

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={!!t} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Fund Guarantee</ModalHeader>
                <ModalCloseButton />
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
                        <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color="brand.green"
                        >
                            ${((t?.guarantee_usdc ?? 0) / 1_000_000).toFixed(0)}{' '}
                            USDC GTD
                        </Text>
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
                <ModalFooter>
                    <Button
                        variant="ghost"
                        mr={3}
                        onClick={handleClose}
                        size="sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        size="sm"
                        isLoading={isLoading}
                        loadingText={statusLabel[status] ?? 'Processing…'}
                        isDisabled={status === 'success'}
                        onClick={handleFund}
                    >
                        Approve &amp; Fund $
                        {((t?.guarantee_usdc ?? 0) / 1_000_000).toFixed(0)} GTD
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── Filter Tab ──────────────────────────────────────────────────────────────

function FilterTab({
    label,
    count,
    active,
    onClick,
}: {
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
        state === 'pending'
            ? pendingBg
            : state === 'error'
              ? 'red.500'
              : 'brand.green';

    const labelColor =
        state === 'pending'
            ? 'text.secondary'
            : state === 'error'
              ? 'red.400'
              : 'text.primary';

    return (
        <HStack align="flex-start" spacing={3}>
            <VStack spacing={0} flexShrink={0} align="center" w="28px">
                <Flex
                    w="28px"
                    h="28px"
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
                        <Text
                            fontSize="xs"
                            color="white"
                            fontWeight="bold"
                            lineHeight={1}
                        >
                            ✓
                        </Text>
                    ) : state === 'error' ? (
                        <Text
                            fontSize="xs"
                            color="white"
                            fontWeight="bold"
                            lineHeight={1}
                        >
                            ✕
                        </Text>
                    ) : (
                        <Text
                            fontSize="xs"
                            color={pendingNumColor}
                            fontWeight="semibold"
                            lineHeight={1}
                        >
                            {stepNum}
                        </Text>
                    )}
                </Flex>
                {!isLast && (
                    <Box w="2px" flex={1} minH="20px" bg={lineColor} mt="2px" />
                )}
            </VStack>
            <VStack
                align="start"
                spacing={0.5}
                pb={isLast ? 0 : 5}
                pt="5px"
                minW={0}
            >
                <Text
                    fontSize="sm"
                    fontWeight={state === 'active' ? 'semibold' : 'normal'}
                    color={labelColor}
                    transition="color 200ms ease"
                >
                    {label}
                </Text>
                {sublabel && (
                    <Text fontSize="xs" color="text.secondary">
                        {sublabel}
                    </Text>
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

function CryptoRegisterModal({
    tournament: t,
    onClose,
    onSuccess,
}: CryptoRegisterModalProps) {
    const { register, status, error, isLoading, reset } =
        useRegisterForTournament(t ?? undefined);
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
                                <FormLabel fontSize="sm">
                                    Tournament password
                                </FormLabel>
                                <Input
                                    size="sm"
                                    placeholder="Enter password"
                                    value={passwordCode}
                                    onChange={(e) =>
                                        setPasswordCode(e.target.value)
                                    }
                                    isDisabled={isLoading}
                                />
                            </FormControl>
                        )}

                        {!showStepper && (
                            <Text fontSize="sm" color="text.secondary">
                                Buy-in:{' '}
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="brand.green"
                                >
                                    {buyInDisplay} USDC
                                </Text>{' '}
                                will be transferred on registration. Requires
                                two wallet confirmations.
                            </Text>
                        )}

                        {showStepper && (
                            <VStack align="stretch" spacing={0} pt={1}>
                                <TxStep
                                    stepNum={1}
                                    label="Approve USDC spend"
                                    sublabel={
                                        step1State === 'active'
                                            ? 'Check your wallet…'
                                            : undefined
                                    }
                                    state={step1State}
                                    isLast={false}
                                />
                                <TxStep
                                    stepNum={2}
                                    label="Register on-chain"
                                    sublabel={
                                        step2State === 'active'
                                            ? 'Check your wallet…'
                                            : undefined
                                    }
                                    state={step2State}
                                    isLast={true}
                                />
                            </VStack>
                        )}

                        {error && (
                            <Text fontSize="xs" color="red.400">
                                {error}
                            </Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="green"
                        onClick={handleRegister}
                        isLoading={isLoading}
                        loadingText={
                            status === 'approving'
                                ? 'Approving…'
                                : 'Registering…'
                        }
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

function CryptoUnregisterModal({
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
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Unregister from Tournament</ModalHeader>
                <ModalCloseButton />
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
                <ModalFooter gap={2}>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
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
