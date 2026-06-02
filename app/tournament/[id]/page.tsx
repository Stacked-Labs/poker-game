'use client';

import {
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';
import {
    getTournament,
    getTournamentClock,
    getTournamentLeaderboard,
    getMyTournamentRegistrations,
    type Tournament,
} from '../../hooks/server_actions';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import useToastHelper from '../../hooks/useToastHelper';
import { useClaimHostRake } from '../../hooks/useClaimHostRake';
import { useClaimRefund } from '../../hooks/useClaimRefund';
import { useOpenEmergencyRefund } from '../../hooks/useOpenEmergencyRefund';

function explorerBase(chain?: string): string {
    return chain === 'base' ? 'https://basescan.org' : 'https://sepolia.basescan.org';
}

function statusColor(status: string): string {
    switch (status) {
        case 'registration': return 'green';
        case 'running': return 'blue';
        case 'completed': return 'gray';
        case 'cancelled': return 'red';
        default: return 'gray';
    }
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function formatDuration(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    if (h > 0) return `${h}h ${m}m`;
    const s = Math.floor((ms % 60_000) / 1_000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface LeaderboardPlayer {
    uuid: string;
    wallet: string;
    stack: number;
    finish_pos: number;
    table_index: number;
    bullet_number: number;
    prize_usdc?: number;
}

export default function TournamentPage() {
    const params = useParams();
    const id = parseInt(params?.id as string, 10);
    const router = useRouter();
    const account = useActiveAccount();
    const myWallet = account?.address;
    const toast = useToastHelper();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [goToTableLoading, setGoToTableLoading] = useState(false);
    const [blindLevel, setBlindLevel] = useState<number | null>(null);

    const { register: registerOnChain, reenter: reenterOnChain, unregister: unregisterOnChain, status: registerStatus, error: registerError } = useRegisterForTournament(tournament ?? undefined);
    const isActionLoading = actionLoading || registerStatus === 'approving' || registerStatus === 'registering';

    const { pendingRake, claiming, claim: claimRake } = useClaimHostRake(
        tournament?.contract_address,
        tournament?.chain,
    );

    const refund = useClaimRefund(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.status,
    );

    const emergencyRefund = useOpenEmergencyRefund(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.advertised_end_at,
        tournament?.status,
    );

    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const borderColor = useColorModeValue('rgba(11,20,48,0.08)', 'rgba(255,255,255,0.08)');
    const mutedColor = useColorModeValue('text.muted', 'text.muted');
    const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

    const load = async () => {
        if (isNaN(id)) return;
        try {
            const [tData, lbData, regsData] = await Promise.all([
                getTournament(id),
                getTournamentLeaderboard(id),
                myWallet ? getMyTournamentRegistrations() : Promise.resolve({ tournament_ids: [], finish_pos: {} }),
            ]);
            setTournament(tData.tournament);
            if (lbData?.live === false && Array.isArray(lbData.results)) {
                // Completed tournament: map DB results to the unified player shape.
                setPlayers(lbData.results.map((r: { wallet_address: string; finish_position: number; prize_usdc: number }, i: number) => ({
                    uuid: r.wallet_address + i,
                    wallet: r.wallet_address,
                    stack: 0,
                    finish_pos: r.finish_position,
                    table_index: -1,
                    prize_usdc: r.prize_usdc,
                })));
            } else {
                setPlayers(lbData?.players ?? []);
            }
            setIsRegistered(new Set(regsData.tournament_ids).has(id));
            if (tData.tournament.status === 'running') {
                const clock = await getTournamentClock(id);
                setBlindLevel(clock?.level_number ?? null);
            }
        } catch {
            toast.error('Could not load tournament');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id, myWallet]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRegister = async (isReentry = false) => {
        if (!myWallet) { toast.warning('Connect wallet to register'); return; }
        setActionLoading(true);
        try {
            const result = isReentry ? await reenterOnChain() : await registerOnChain();
            if (!result.ok) {
                toast.error(result.error ?? (isReentry ? 'Re-entry failed' : 'Registration failed'));
            } else {
                toast.success(isReentry ? 'Re-entered!' : 'Registered!');
                // Optimistically update UI so buttons disappear immediately — for crypto
                // tournaments the indexer may take several seconds to sync the on-chain event.
                if (isReentry) {
                    setPlayers(prev => prev.map(p =>
                        myWallet && p.wallet.toLowerCase() === myWallet.toLowerCase()
                            ? { ...p, finish_pos: 0, bullet_number: (p.bullet_number ?? 1) + 1 }
                            : p
                    ));
                } else {
                    setIsRegistered(true);
                }
                load(); // background sync — don't await
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnregister = async () => {
        setActionLoading(true);
        try {
            const result = await unregisterOnChain();
            if (!result.ok) {
                toast.error(result.error ?? 'Unregister failed');
            } else {
                toast.success('Unregistered');
                setIsRegistered(false); // optimistic
                load(); // background sync
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleGoToTable = async () => {
        if (!myWallet) return;
        setGoToTableLoading(true);
        try {
            const data = await getTournamentLeaderboard(id);
            const entry = (data?.players ?? []).find(
                (p: LeaderboardPlayer) => p.wallet.toLowerCase() === myWallet.toLowerCase()
            );
            if (!entry) { toast.error("You're not seated in this tournament"); return; }
            router.push(`/table/tournament-${id}-table-${entry.table_index + 1}`);
        } catch {
            toast.error('Could not find your table');
        } finally {
            setGoToTableLoading(false);
        }
    };

    if (loading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="card.lightGray">
                <Spinner size="xl" color="brand.green" />
            </Flex>
        );
    }

    if (!tournament) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="card.lightGray">
                <Text color="text.muted">Tournament not found.</Text>
            </Flex>
        );
    }

    const t = tournament;
    const blindLabel = t.metadata?.blind_structure ? String(t.metadata.blind_structure) : 'turbo';
    const buyInLabel = t.is_free_play ? 'Free play' : `${(t.buy_in_usdc / 1_000_000).toFixed(2)} USDC`;
    const now = new Date();
    const lateRegCloseAt = new Date(t.late_reg_close_at);
    const scheduledStartAt = new Date(t.scheduled_start_at);
    const fiveMinBefore = new Date(scheduledStartAt.getTime() - 5 * 60 * 1000);
    const isLateRegOpen = t.status === 'running' && (t.late_reg_levels ?? 0) > 0 && now < lateRegCloseAt;
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateReg = isLateRegOpen && !isRegistered;
    const canUnregister = t.status === 'registration' && isRegistered && (t.is_free_play || now < fiveMinBefore);
    const tableSize = t.table_size || 9;

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finish_pos === 0 && b.finish_pos === 0) return b.stack - a.stack;
        if (a.finish_pos === 0) return -1;
        if (b.finish_pos === 0) return 1;
        return a.finish_pos - b.finish_pos;
    });

    const myPlayer = myWallet
        ? players.find(p => p.wallet.toLowerCase() === myWallet.toLowerCase())
        : null;
    const isEliminated = myPlayer ? myPlayer.finish_pos > 0 : false;
    const bulletsUsed = myPlayer?.bullet_number ?? 1;
    const canReenter = isLateRegOpen && isRegistered && isEliminated && t.reentry_allowed
        && bulletsUsed <= t.reentry_max;

    return (
        <Box minH="100vh" bg="card.lightGray" pt={{ base: 20, md: 24 }} pb={16}>
            <Container maxW="container.lg" px={{ base: 3, md: 6 }}>
                <VStack spacing={6} align="stretch">

                    {/* Header */}
                    <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={{ base: 4, md: 6 }}>
                        <VStack align="stretch" spacing={4}>
                            <Flex justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                                <VStack align="start" spacing={1}>
                                    <Heading fontSize={{ base: 'xl', md: '2xl' }} color="text.primary">
                                        {t.name || (t.is_free_play ? 'Free-Play MTT' : `MTT — ${buyInLabel}`)}
                                    </Heading>
                                    <HStack spacing={2} flexWrap="wrap">
                                        <Badge colorScheme={statusColor(t.status)} borderRadius="full" px={2} textTransform="capitalize">
                                            {t.status}
                                        </Badge>
                                        {isRegistered && t.status === 'registration' && (
                                            <Badge colorScheme="green" borderRadius="full" px={2}>Registered</Badge>
                                        )}
                                        {isRegistered && t.status === 'running' && !isEliminated && (
                                            <Badge colorScheme="blue" borderRadius="full" px={2}>Playing</Badge>
                                        )}
                                        {isRegistered && t.status === 'running' && isEliminated && (
                                            <Badge colorScheme="gray" borderRadius="full" px={2}>Out</Badge>
                                        )}
                                        <Text fontSize="xs" color={mutedColor} textTransform="capitalize">
                                            {blindLabel} blinds · NLH · {tableSize}-max
                                        </Text>
                                        {!t.is_free_play && t.chain && (
                                            <Badge colorScheme="purple" borderRadius="full" px={1.5} fontSize="2xs">
                                                {t.chain === 'base' ? 'Base' : 'Sepolia'}
                                            </Badge>
                                        )}
                                    </HStack>
                                </VStack>

                                <HStack spacing={2} flexWrap="wrap">
                                    {(canRegister || canLateReg) && (
                                        <Button
                                            size="sm"
                                            colorScheme={canLateReg ? 'yellow' : 'green'}
                                            isLoading={isActionLoading}
                                            loadingText={registerStatus === 'approving' ? 'Approving…' : 'Registering…'}
                                            onClick={() => handleRegister(false)}
                                        >
                                            {canLateReg ? 'Late Reg' : 'Register'}
                                        </Button>
                                    )}
                                    {canUnregister && (
                                        <Button size="sm" variant="outline" isLoading={isActionLoading} onClick={handleUnregister}>
                                            Unregister
                                        </Button>
                                    )}
                                    {t.status === 'running' && isRegistered && !isEliminated && (
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={goToTableLoading}
                                            loadingText="Finding table…"
                                            onClick={handleGoToTable}
                                        >
                                            My table
                                        </Button>
                                    )}
                                    {canReenter && (
                                        <Button
                                            size="sm"
                                            colorScheme="orange"
                                            isLoading={isActionLoading}
                                            loadingText={registerStatus === 'approving' ? 'Approving…' : 'Re-entering…'}
                                            onClick={() => handleRegister(true)}
                                        >
                                            Re-enter
                                        </Button>
                                    )}
                                    {!isRegistered && t.status === 'registration' && (
                                        <Text fontSize="xs" color={mutedColor} alignSelf="center">
                                            Connect wallet to register
                                        </Text>
                                    )}
                                </HStack>
                            </Flex>

                            {/* Contract link */}
                            {!t.is_free_play && t.contract_address && t.chain && (
                                <HStack spacing={2} fontSize="xs" color={mutedColor}>
                                    <Text>Contract:</Text>
                                    <Text
                                        as="a"
                                        href={`${explorerBase(t.chain)}/address/${t.contract_address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        fontFamily="mono"
                                        display="inline-flex"
                                        alignItems="center"
                                        gap="3px"
                                        color="brand.navy"
                                        _dark={{ color: 'brand.lightGray' }}
                                        _hover={{ color: 'brand.green', textDecoration: 'underline' }}
                                    >
                                        {t.contract_address.slice(0, 6)}…{t.contract_address.slice(-4)}
                                        <Icon as={FiExternalLink} boxSize="10px" />
                                    </Text>
                                </HStack>
                            )}

                            {/* Key stats row */}
                            <Flex gap={6} flexWrap="wrap" fontSize="sm">
                                <Box>
                                    <Text color={mutedColor} fontSize="xs">Players</Text>
                                    <Text fontWeight="semibold" color="text.primary">
                                        {t.registered_count ?? players.length}/{t.max_entries}
                                        <Text as="span" color={mutedColor} fontWeight="normal"> (min {t.min_entries})</Text>
                                    </Text>
                                </Box>
                                <Box>
                                    <Text color={mutedColor} fontSize="xs">Buy-in</Text>
                                    <Text fontWeight="semibold" color="text.primary">{buyInLabel}</Text>
                                </Box>
                                {t.starting_stack_bb > 0 && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Starting chips</Text>
                                        <Text fontWeight="semibold" color="text.primary">
                                            {(t.starting_stack ?? 10000).toLocaleString()} / {t.starting_stack_bb}BB
                                        </Text>
                                    </Box>
                                )}
                                {!t.is_free_play && t.fee_bps > 0 && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Fee</Text>
                                        <Text fontWeight="semibold" color="text.primary">{(t.fee_bps / 100).toFixed(0)}%</Text>
                                    </Box>
                                )}
                                {t.guarantee_usdc > 0 && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Guarantee</Text>
                                        <Text fontWeight="semibold" color="brand.green">
                                            ${(t.guarantee_usdc / 1_000_000).toFixed(0)} GTD
                                        </Text>
                                    </Box>
                                )}
                                <Box>
                                    <Text color={mutedColor} fontSize="xs">
                                        {t.status === 'registration' || t.status === 'pending' ? 'Starts' : 'Started'}
                                    </Text>
                                    <Text fontWeight="semibold" color="text.primary">
                                        {t.started_at ? formatTime(t.started_at) : formatTime(t.scheduled_start_at)}
                                    </Text>
                                </Box>
                                {t.status === 'running' && blindLevel !== null && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Blind level</Text>
                                        <Text fontWeight="semibold" color="text.primary">Level {blindLevel}</Text>
                                    </Box>
                                )}
                                {t.status === 'completed' && t.ended_at && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Ended</Text>
                                        <Text fontWeight="semibold" color="text.primary">{formatTime(t.ended_at)}</Text>
                                    </Box>
                                )}
                                {(t.late_reg_levels ?? 0) > 0 && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Late reg</Text>
                                        <Text fontWeight="semibold" color="text.primary">
                                            {t.late_reg_levels} level{t.late_reg_levels !== 1 ? 's' : ''}
                                            {isLateRegOpen && (
                                                <Text as="span" color="yellow.500"> · open</Text>
                                            )}
                                        </Text>
                                    </Box>
                                )}
                                {t.reentry_allowed && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Re-entry</Text>
                                        <Text fontWeight="semibold" color="text.primary">
                                            up to {t.reentry_max}×
                                        </Text>
                                    </Box>
                                )}
                                {isLateRegOpen && (
                                    <Box>
                                        <Text color={mutedColor} fontSize="xs">Late reg closes</Text>
                                        <Text fontWeight="semibold" color="yellow.500">{formatTime(t.late_reg_close_at)}</Text>
                                    </Box>
                                )}
                            </Flex>
                        </VStack>
                    </Box>

                    {/* Standings table */}
                    {sortedPlayers.length > 0 && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" overflow="hidden">
                            <Box px={{ base: 4, md: 6 }} pt={4} pb={2}>
                                <Heading fontSize="md" color="text.primary">
                                    {t.status === 'completed' ? 'Final standings' : 'Current standings'}
                                </Heading>
                            </Box>
                            <Box overflowX="auto">
                                <Table size="sm" variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th w="48px">#</Th>
                                            <Th>Player</Th>
                                            {t.status === 'running' && t.reentry_allowed && <Th isNumeric>Bullets</Th>}
                                            {t.status === 'running' && <Th isNumeric>Chips</Th>}
                                            {t.status === 'running' && <Th isNumeric>Table</Th>}
                                            {t.status === 'completed' && !t.is_free_play && <Th isNumeric>Prize</Th>}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {sortedPlayers.map((p, i) => {
                                            const rank = p.finish_pos === 0 ? i + 1 : p.finish_pos;
                                            const isOut = p.finish_pos > 0;
                                            const isMe = myWallet && p.wallet.toLowerCase() === myWallet.toLowerCase();
                                            return (
                                                <Tr
                                                    key={p.uuid}
                                                    bg={isMe ? 'brand.green10' : undefined}
                                                    _hover={{ bg: isMe ? 'brand.green10' : rowHoverBg }}
                                                    opacity={isOut && t.status !== 'completed' ? 0.55 : 1}
                                                >
                                                    <Td fontWeight="semibold" color={rank === 1 ? 'yellow.400' : 'text.primary'}>
                                                        {rank}
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Text fontSize="xs" color="text.primary" fontFamily="mono">
                                                                {p.wallet ? `${p.wallet.slice(0, 6)}…${p.wallet.slice(-4)}` : p.uuid.slice(0, 8)}
                                                            </Text>
                                                            {isMe && <Badge colorScheme="green" fontSize="2xs">you</Badge>}
                                                            {isOut && t.status === 'running' && <Badge colorScheme="gray" fontSize="2xs">out</Badge>}
                                                        </HStack>
                                                    </Td>
                                                    {t.status === 'running' && t.reentry_allowed && (
                                                        <Td isNumeric>
                                                            <Text fontSize="xs" color={mutedColor}>
                                                                {p.bullet_number ?? 1}
                                                            </Text>
                                                        </Td>
                                                    )}
                                                    {t.status === 'running' && (
                                                        <Td isNumeric>
                                                            <Text fontSize="xs" color={isOut ? 'text.muted' : 'text.primary'}>
                                                                {isOut ? '—' : p.stack.toLocaleString()}
                                                            </Text>
                                                        </Td>
                                                    )}
                                                    {t.status === 'running' && (
                                                        <Td isNumeric>
                                                            <Text fontSize="xs" color={mutedColor}>
                                                                {isOut ? '—' : `T${p.table_index + 1}`}
                                                            </Text>
                                                        </Td>
                                                    )}
                                                    {t.status === 'completed' && !t.is_free_play && (
                                                        <Td isNumeric>
                                                            <Text fontSize="xs" color={(p.prize_usdc ?? 0) > 0 ? 'brand.green' : mutedColor} fontWeight={(p.prize_usdc ?? 0) > 0 ? 'bold' : 'normal'}>
                                                                {(p.prize_usdc ?? 0) > 0 ? `$${((p.prize_usdc ?? 0) / 1_000_000).toFixed(2)}` : '—'}
                                                            </Text>
                                                        </Td>
                                                    )}
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    )}

                    {sortedPlayers.length === 0 && t.status === 'registration' && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={6} textAlign="center">
                            {(t.registered_count ?? 0) > 0 ? (
                                <Text color={mutedColor} fontSize="sm">
                                    {t.registered_count} player{t.registered_count !== 1 ? 's' : ''} registered — standings appear once the tournament starts.
                                </Text>
                            ) : (
                                <Text color={mutedColor} fontSize="sm">No players registered yet. Be the first!</Text>
                            )}
                        </Box>
                    )}

                    {/* Refund claim (cancelled / emergency refund) */}
                    {(t.status === 'cancelled' || t.status === 'emergency_refund') && !t.is_free_play && t.contract_address && myWallet && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={{ base: 4, md: 5 }}>
                            <VStack align="stretch" spacing={3}>
                                <HStack spacing={2}>
                                    <Badge colorScheme="red" borderRadius="full" px={2}>
                                        {t.status === 'emergency_refund' ? 'Emergency refund' : 'Tournament cancelled'}
                                    </Badge>
                                </HStack>
                                {refund.loading ? (
                                    <HStack spacing={2}><Spinner size="xs" /><Text fontSize="sm" color={mutedColor}>Checking eligibility…</Text></HStack>
                                ) : refund.alreadyClaimed ? (
                                    <Text fontSize="sm" color={mutedColor}>Your buy-in refund was already claimed.</Text>
                                ) : refund.eligible ? (
                                    <HStack spacing={3} flexWrap="wrap">
                                        <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                                            {refund.estimatedUsdc !== null
                                                ? `$${(Number(refund.estimatedUsdc) / 1_000_000).toFixed(2)} USDC refundable`
                                                : 'Pro-rata refund available'}
                                        </Text>
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            variant="outline"
                                            isLoading={refund.claiming}
                                            loadingText="Claiming…"
                                            onClick={async () => {
                                                const ok = await refund.claim();
                                                if (ok) toast.success('Refund claimed!');
                                                else toast.error(refund.error ?? 'Claim failed');
                                            }}
                                        >
                                            Claim refund
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Text fontSize="sm" color={mutedColor}>
                                        {myWallet ? 'You were not registered in this tournament.' : 'Connect wallet to check refund eligibility.'}
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {/* Host rake claim */}
                    {t.status === 'completed' && !t.is_free_play && t.contract_address && myWallet &&
                        myWallet.toLowerCase() === t.host_wallet?.toLowerCase() && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={{ base: 4, md: 5 }}>
                            <VStack align="stretch" spacing={3}>
                                <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" letterSpacing="wider">
                                    Your rake earnings
                                </Text>
                                {pendingRake === null ? (
                                    <HStack spacing={2}><Spinner size="xs" /><Text fontSize="sm" color={mutedColor}>Loading…</Text></HStack>
                                ) : pendingRake > BigInt(0) ? (
                                    <HStack spacing={3} flexWrap="wrap">
                                        <Text fontSize="sm" fontWeight="semibold" color="brand.green">
                                            ${(Number(pendingRake) / 1_000_000).toFixed(2)} USDC claimable
                                        </Text>
                                        <Button
                                            size="sm"
                                            colorScheme="green"
                                            isLoading={claiming}
                                            loadingText="Claiming…"
                                            onClick={async () => {
                                                const ok = await claimRake();
                                                if (ok) toast.success('Rake claimed!');
                                                else toast.error('Claim failed');
                                            }}
                                        >
                                            Claim
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Text fontSize="sm" color={mutedColor}>No rake to claim — already withdrawn.</Text>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {/* On-chain settlement info */}
                    {t.status === 'completed' && !t.is_free_play && t.contract_address && t.chain && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={{ base: 4, md: 5 }}>
                            <VStack align="stretch" spacing={2}>
                                <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" letterSpacing="wider">
                                    On-chain settlement
                                </Text>
                                {t.settlement_tx_hash ? (
                                    <HStack spacing={2} fontSize="sm">
                                        <Badge colorScheme="green" borderRadius="full" px={2}>Prizes distributed</Badge>
                                        <Text
                                            as="a"
                                            href={`${explorerBase(t.chain)}/tx/${t.settlement_tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            fontFamily="mono"
                                            fontSize="xs"
                                            display="inline-flex"
                                            alignItems="center"
                                            gap="3px"
                                            color="brand.navy"
                                            _dark={{ color: 'brand.lightGray' }}
                                            _hover={{ color: 'brand.green', textDecoration: 'underline' }}
                                        >
                                            {t.settlement_tx_hash.slice(0, 10)}…{t.settlement_tx_hash.slice(-8)}
                                            <Icon as={FiExternalLink} boxSize="10px" />
                                        </Text>
                                    </HStack>
                                ) : (
                                    <HStack spacing={2} fontSize="sm">
                                        <Badge colorScheme="orange" borderRadius="full" px={2}>Settlement pending</Badge>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Prize distribution is being processed on-chain.
                                        </Text>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {/* Emergency refund safety net */}
                    {t.status === 'running' && !t.is_free_play && t.contract_address && t.chain && (
                        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="14px" p={{ base: 4, md: 5 }}>
                            <VStack align="stretch" spacing={3}>
                                <HStack spacing={2}>
                                    <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" letterSpacing="wider">
                                        Safety net
                                    </Text>
                                    <Badge colorScheme="gray" borderRadius="full" px={1.5} fontSize="2xs">trustless</Badge>
                                </HStack>
                                {emergencyRefund.opened ? (
                                    <VStack align="start" spacing={1}>
                                        <Badge colorScheme="orange" borderRadius="full" px={2}>Emergency refunds enabled</Badge>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Players can now claim their buy-in back from the contract.
                                        </Text>
                                    </VStack>
                                ) : emergencyRefund.available ? (
                                    <VStack align="start" spacing={2}>
                                        <Text fontSize="sm" color="text.primary">
                                            This tournament has run past its advertised end time. If prizes have not been distributed,
                                            anyone can enable emergency refunds so players can recover their buy-ins directly from the contract.
                                        </Text>
                                        {emergencyRefund.error && (
                                            <Text fontSize="xs" color="red.400">{emergencyRefund.error}</Text>
                                        )}
                                        <Button
                                            size="sm"
                                            colorScheme="orange"
                                            variant="outline"
                                            isLoading={emergencyRefund.opening}
                                            loadingText="Submitting…"
                                            onClick={async () => {
                                                const ok = await emergencyRefund.open();
                                                if (ok) toast.success('Emergency refunds enabled — players can now claim.');
                                                else toast.error(emergencyRefund.error ?? 'Transaction failed');
                                            }}
                                        >
                                            Enable emergency refunds
                                        </Button>
                                    </VStack>
                                ) : (
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm" color="text.primary">
                                            If this tournament is not settled within 24 hours of its advertised end time, anyone will be
                                            able to enable emergency refunds so players can recover their buy-ins directly from the contract.
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Available in {formatDuration(emergencyRefund.msUntilAvailable)} · advertised end {formatTime(t.advertised_end_at)}
                                        </Text>
                                    </VStack>
                                )}
                            </VStack>
                        </Box>
                    )}

                    <Button variant="ghost" size="sm" color={mutedColor} alignSelf="flex-start" onClick={() => router.push('/public-games?format=tournaments')}>
                        ← All tournaments
                    </Button>
                </VStack>
            </Container>
        </Box>
    );
}
