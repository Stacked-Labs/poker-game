'use client';

import {
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
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    createTournament,
    listTournaments,
    registerForTournament,
    startTournament,
    type Tournament,
    unregisterFromTournament,
} from '../../hooks/server_actions';
import TournamentCard from './TournamentCard';

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
    const toast = useToast({ position: 'top-right', duration: 4000, isClosable: true });
    const account = useActiveAccount();
    const myWallet = account?.address;

    const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();

    // Password registration state
    const [pendingRegId, setPendingRegId] = useState<number | null>(null);
    const [passwordCode, setPasswordCode] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await listTournaments();
            setTournaments(data.tournaments ?? []);
        } catch {
            toast({ title: 'Failed to load tournaments', status: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleRegister = async (id: number) => {
        if (!myWallet) {
            toast({ title: 'Connect your wallet first', status: 'warning' });
            return;
        }
        const t = tournaments.find((x) => x.id === id);
        // Password-protected tournament: show inline password modal.
        if (t?.has_password) {
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
            toast({ title: 'Registered!', status: 'success' });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Registration failed';
            toast({ title: msg, status: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!pendingRegId) return;
        if (!passwordCode.trim()) {
            toast({ title: 'Enter the tournament password', status: 'warning' });
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
        setActionLoading(true);
        try {
            await unregisterFromTournament(id);
            setRegisteredIds((prev) => {
                const next = new Set(Array.from(prev));
                next.delete(id);
                return next;
            });
            toast({ title: 'Unregistered', status: 'info' });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to unregister';
            toast({ title: msg, status: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleStart = async (id: number) => {
        setActionLoading(true);
        try {
            await startTournament(id);
            toast({ title: 'Tournament started!', status: 'success' });
            await load();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to start';
            toast({ title: msg, status: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <VStack align="stretch" spacing={6} w="full">
            <Flex justify="space-between" align="center">
                <Heading as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="extrabold"
                    letterSpacing="-0.01em" color="text.primary">
                    Tournaments
                </Heading>
                {myWallet && (
                    <Button size="sm" colorScheme="green" onClick={openCreate}>
                        + Create
                    </Button>
                )}
            </Flex>

            {isLoading ? (
                <Flex justify="center" py={12}>
                    <Spinner color="brand.green" size="lg" />
                </Flex>
            ) : tournaments.length === 0 ? (
                <Box py={12} textAlign="center">
                    <Text color="text.secondary" fontSize="sm">
                        No tournaments yet. Be the first to create one!
                    </Text>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                    {tournaments.map((t) => (
                        <TournamentCard
                            key={t.id}
                            tournament={t}
                            myWallet={myWallet}
                            onRegister={handleRegister}
                            onUnregister={handleUnregister}
                            onStart={handleStart}
                            registeredIds={registeredIds}
                            isLoading={actionLoading}
                        />
                    ))}
                </SimpleGrid>
            )}

            <CreateTournamentModal
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onCreated={load}
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

interface CreateTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateTournamentModal({ isOpen, onClose, onCreated }: CreateTournamentModalProps) {
    const [isFreePlay, setIsFreePlay] = useState(true);
    const [chain, setChain] = useState('base-sepolia');
    const [buyInUsdc, setBuyInUsdc] = useState('10');
    const [minPlayers, setMinPlayers] = useState('2');
    const [maxPlayers, setMaxPlayers] = useState('9');
    const [blindStructure, setBlindStructure] = useState('turbo');
    const [scheduledAt, setScheduledAt] = useState('');
    const [passwordCode, setPasswordCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast({ position: 'top-right', duration: 4000, isClosable: true });

    const handleCreate = async () => {
        if (!scheduledAt) {
            toast({ title: 'Start time is required', status: 'warning' });
            return;
        }
        if (!isFreePlay) {
            const buyIn = parseFloat(buyInUsdc);
            if (isNaN(buyIn) || buyIn <= 0) {
                toast({ title: 'Buy-in must be greater than 0', status: 'warning' });
                return;
            }
        }
        setIsLoading(true);
        try {
            let passwordCodeHash: string | undefined;
            if (passwordCode.trim()) {
                passwordCodeHash = await hashPasswordCode(passwordCode.trim());
            }

            await createTournament({
                min_entries: parseInt(minPlayers, 10),
                max_entries: parseInt(maxPlayers, 10),
                buy_in_usdc: isFreePlay ? 0 : Math.round(parseFloat(buyInUsdc) * 1_000_000),
                scheduled_start_at: new Date(scheduledAt).toISOString(),
                is_free_play: isFreePlay,
                blind_structure: blindStructure,
                chain: isFreePlay ? undefined : chain,
                password_code_hash: passwordCodeHash,
            });
            toast({ title: 'Tournament created!', status: 'success' });
            onCreated();
            onClose();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create tournament';
            toast({ title: msg, status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Tournament</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
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
                            </>
                        )}

                        <FormControl>
                            <FormLabel fontSize="sm">Blind structure</FormLabel>
                            <Select
                                value={blindStructure}
                                onChange={(e) => setBlindStructure(e.target.value)}
                                size="sm"
                            >
                                <option value="turbo">Turbo (10-min levels)</option>
                                <option value="regular">Regular (20-min levels)</option>
                                <option value="deep">Deep stack (30-min levels)</option>
                            </Select>
                        </FormControl>

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
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} size="sm">
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        size="sm"
                        isLoading={isLoading}
                        onClick={handleCreate}
                    >
                        {isFreePlay ? 'Create free-play tournament' : 'Deploy & create'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
