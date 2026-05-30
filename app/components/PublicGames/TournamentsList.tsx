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
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
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

export default function TournamentsList() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
    const toast = useToast({ position: 'top-right', duration: 4000, isClosable: true });
    const account = useActiveAccount();
    const myWallet = account?.address;

    const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();

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
        setActionLoading(true);
        try {
            await registerForTournament(id);
            setRegisteredIds((prev) => { const n = new Set(Array.from(prev)); n.add(id); return n; });
            toast({ title: 'Registered!', status: 'success' });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Registration failed';
            toast({ title: msg, status: 'error' });
        } finally {
            setActionLoading(false);
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
        </VStack>
    );
}

interface CreateTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateTournamentModal({ isOpen, onClose, onCreated }: CreateTournamentModalProps) {
    const [minPlayers, setMinPlayers] = useState('2');
    const [maxPlayers, setMaxPlayers] = useState('9');
    const [blindStructure, setBlindStructure] = useState('turbo');
    const [scheduledAt, setScheduledAt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast({ position: 'top-right', duration: 4000, isClosable: true });

    const handleCreate = async () => {
        if (!scheduledAt) {
            toast({ title: 'Start time is required', status: 'warning' });
            return;
        }
        setIsLoading(true);
        try {
            await createTournament({
                min_entries: parseInt(minPlayers, 10),
                max_entries: parseInt(maxPlayers, 10),
                buy_in_usdc: 0,
                scheduled_start_at: new Date(scheduledAt).toISOString(),
                is_free_play: true,
                blind_structure: blindStructure,
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
                        Create free-play tournament
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
