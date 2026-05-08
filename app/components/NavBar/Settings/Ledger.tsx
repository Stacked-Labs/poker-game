'use client';

import React, { useContext, useState, useMemo, useEffect } from 'react';
import {
    Box,
    Flex,
    Grid,
    HStack,
    Icon,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
    FiArrowDownRight,
    FiArrowUpRight,
    FiChevronDown,
    FiSlash,
} from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { fetchTableLedger } from '@/app/hooks/server_actions';
import { LedgerResponse, LedgerEntry } from '@/app/interfaces';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import PlayerNameLink from '@/app/components/PlayerNameLink';

interface PlayerSession {
    uuid: string;
    username: string;
    totalBuyIns: number;
    totalBuyOuts: number;
    currentStack: number;
    net: number;
    isActive: boolean;
    transactions: FinancialEvent[];
}

interface FinancialEvent {
    id: number;
    timestamp: string;
    type: 'buy-in' | 'buy-out' | 'kicked';
    amount: number;
}

// ─── Animations ──────────────────────────────────────────────────────────
const pulseDot = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
`;

const skeletonShimmer = keyframes`
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
`;

// ─── Active dot — replaces solid green badge ─────────────────────────────
const ActiveDot = () => (
    <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg="brand.green"
        flexShrink={0}
        animation={`${pulseDot} 2s ease-in-out infinite`}
        boxShadow="0 0 0 2px rgba(54, 163, 123, 0.20)"
        aria-label="Active player"
    />
);

// ─── Smart NET cell — value + trend arrow + sign ─────────────────────────
const NetCell = ({
    net,
    formatCurrency,
}: {
    net: number;
    formatCurrency: (n: number) => string;
}) => {
    const positive = net > 0;
    const breakeven = net === 0;
    const color = breakeven
        ? 'text.muted'
        : positive
          ? 'brand.green'
          : 'brand.pink';
    return (
        <HStack spacing={1} justify="flex-end">
            {!breakeven && (
                <Icon
                    as={positive ? FiArrowUpRight : FiArrowDownRight}
                    boxSize="13px"
                    color={color}
                />
            )}
            <Text
                fontWeight={700}
                color={color}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                fontSize="sm"
            >
                {breakeven ? '—' : `${positive ? '+' : '−'}${formatCurrency(net)}`}
            </Text>
        </HStack>
    );
};

// ─── Transaction tone helper ─────────────────────────────────────────────
const TX_TONE: Record<
    FinancialEvent['type'],
    { label: string; color: string; bg: string; edge: string; icon: React.ElementType; sign: '+' | '−' }
> = {
    'buy-in': {
        label: 'Buy-in',
        color: 'brand.green',
        bg: 'bg.greenSubtle',
        edge: 'brand.green',
        icon: FiArrowUpRight,
        sign: '+',
    },
    'buy-out': {
        label: 'Cash-out',
        color: 'brand.pink',
        bg: 'rgba(235, 11, 92, 0.06)',
        edge: 'brand.pink',
        icon: FiArrowDownRight,
        sign: '−',
    },
    kicked: {
        label: 'Kicked',
        color: 'brand.pink',
        bg: 'rgba(235, 11, 92, 0.06)',
        edge: 'brand.pink',
        icon: FiSlash,
        sign: '−',
    },
};

// ─── Skeleton row (loading) ──────────────────────────────────────────────
const SkeletonRow = () => (
    <Flex
        bg="card.white"
        borderRadius="12px"
        border="1px solid"
        borderColor="border.lightGray"
        p={3}
        align="center"
        justify="space-between"
        animation={`${skeletonShimmer} 1.5s ease-in-out infinite`}
    >
        <HStack spacing={2.5}>
            <Box w="8px" h="8px" borderRadius="full" bg="card.lightGray" />
            <Stack spacing={1}>
                <Box
                    w="100px"
                    h="12px"
                    borderRadius="4px"
                    bg="card.lightGray"
                />
                <Box
                    w="60px"
                    h="9px"
                    borderRadius="3px"
                    bg="card.lightGray"
                />
            </Stack>
        </HStack>
        <Box w="60px" h="14px" borderRadius="4px" bg="card.lightGray" />
    </Flex>
);

// ─── Empty state panel ───────────────────────────────────────────────────
const EmptyPanel = () => (
    <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        py={6}
        px={4}
        bg="card.lightGray"
        borderRadius="16px"
        border="1px dashed"
        borderColor="border.lightGray"
        gap={1.5}
    >
        <Text fontWeight="bold" fontSize="sm" color="text.secondary">
            No session data yet
        </Text>
        <Text fontSize="xs" color="text.muted" textAlign="center">
            Player buy-ins and cash-outs will appear here as the game
            progresses.
        </Text>
    </Flex>
);

// ─── Stats ribbon ────────────────────────────────────────────────────────
const StatsRibbon = ({
    totalBuyIns,
    totalCashOuts,
    totalChipsInPlay,
    formatCurrency,
}: {
    totalBuyIns: number;
    totalCashOuts: number;
    totalChipsInPlay: number;
    formatCurrency: (n: number) => string;
}) => (
    <Box
        bg="card.white"
        p={4}
        borderRadius="12px"
        border="1px solid"
        borderColor="border.lightGray"
        boxShadow="card.lift"
    >
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {[
                {
                    label: 'Buy-ins',
                    value: formatCurrency(totalBuyIns),
                    sub: 'all players',
                    accent: false,
                },
                {
                    label: 'Cash-outs',
                    value: formatCurrency(totalCashOuts),
                    sub: 'exits & kicks',
                    accent: false,
                },
                {
                    label: 'In play',
                    value: formatCurrency(totalChipsInPlay),
                    sub: 'current stacks',
                    accent: true,
                },
            ].map((stat) => (
                <Stack key={stat.label} spacing={0.5}>
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        textTransform="uppercase"
                        letterSpacing="0.10em"
                        fontWeight={700}
                    >
                        {stat.label}
                    </Text>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight={700}
                        color={stat.accent ? 'brand.green' : 'text.primary'}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        lineHeight={1.1}
                    >
                        {stat.value}
                    </Text>
                    <Text fontSize="2xs" color="text.muted">
                        {stat.sub}
                    </Text>
                </Stack>
            ))}
        </Grid>
    </Box>
);

// ─── Mobile card — one player ────────────────────────────────────────────
const MobileSessionCard = ({
    session,
    expanded,
    onToggle,
    formatCurrency,
    formatTime,
    truncateUuid,
}: {
    session: PlayerSession;
    expanded: boolean;
    onToggle: () => void;
    formatCurrency: (n: number) => string;
    formatTime: (ts: string) => string;
    truncateUuid: (uuid: string) => string;
}) => {
    const hasTx = session.transactions.length > 0;
    const cashOutDisplay =
        session.totalBuyOuts > 0 ? formatCurrency(session.totalBuyOuts) : '—';

    return (
        <Stack spacing={0}>
            <Box
                as={hasTx ? 'button' : 'div'}
                bg="card.white"
                borderRadius={expanded ? '12px 12px 0 0' : '12px'}
                border="1px solid"
                borderColor="border.lightGray"
                borderBottom={expanded ? 'none' : '1px solid'}
                p={3}
                cursor={hasTx ? 'pointer' : 'default'}
                onClick={hasTx ? onToggle : undefined}
                textAlign="left"
                w="100%"
                transition="background-color 80ms ease"
                _hover={hasTx ? { bg: 'card.lightGray' } : undefined}
            >
                <Flex align="center" justify="space-between" mb={2.5}>
                    <HStack spacing={2.5}>
                        {session.isActive && <ActiveDot />}
                        <Stack spacing={0}>
                            <PlayerNameLink
                                username={session.username}
                                fontWeight={700}
                                color="text.primary"
                                fontSize="sm"
                            />
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                fontFamily="mono"
                            >
                                {truncateUuid(session.uuid)}
                            </Text>
                        </Stack>
                    </HStack>
                    <NetCell net={session.net} formatCurrency={formatCurrency} />
                </Flex>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                    <Stack spacing={0}>
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            fontWeight={700}
                        >
                            Buy-in
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatCurrency(session.totalBuyIns)}
                        </Text>
                    </Stack>
                    <Stack spacing={0}>
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            fontWeight={700}
                        >
                            Cash-out
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight={600}
                            color={
                                session.totalBuyOuts > 0
                                    ? 'text.primary'
                                    : 'text.muted'
                            }
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {cashOutDisplay}
                        </Text>
                    </Stack>
                    <Stack spacing={0}>
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            fontWeight={700}
                        >
                            Stack
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatCurrency(session.currentStack)}
                        </Text>
                    </Stack>
                </Grid>
            </Box>
            {expanded &&
                session.transactions.map((tx, i) => {
                    const tone = TX_TONE[tx.type];
                    const isLast = i === session.transactions.length - 1;
                    return (
                        <Box
                            key={tx.id}
                            bg={tone.bg}
                            borderLeft="2px solid"
                            borderLeftColor={tone.edge}
                            borderRight="1px solid"
                            borderRightColor="border.lightGray"
                            borderBottom={isLast ? '1px solid' : 'none'}
                            borderBottomColor="border.lightGray"
                            borderRadius={isLast ? '0 0 12px 12px' : undefined}
                            p={3}
                        >
                            <HStack
                                spacing={2.5}
                                pl={1}
                                justify="space-between"
                                flexWrap="wrap"
                            >
                                <HStack spacing={2}>
                                    <Icon
                                        as={tone.icon}
                                        boxSize="13px"
                                        color={tone.color}
                                    />
                                    <Text
                                        fontSize="xs"
                                        fontWeight={700}
                                        color={tone.color}
                                        textTransform="uppercase"
                                        letterSpacing="0.06em"
                                    >
                                        {tone.label}
                                    </Text>
                                    <Text fontSize="2xs" color="text.muted">
                                        {formatTime(tx.timestamp)}
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="sm"
                                    fontWeight={700}
                                    color={tone.color}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {tone.sign}
                                    {formatCurrency(tx.amount)}
                                </Text>
                            </HStack>
                        </Box>
                    );
                })}
        </Stack>
    );
};

// ─── Main component ──────────────────────────────────────────────────────
const Ledger = () => {
    const { appState } = useContext(AppContext);
    const { format } = useFormatAmount();
    const [loading, setLoading] = useState(true);
    const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Fetch ledger data when table changes
    useEffect(() => {
        const loadLedger = async () => {
            if (!appState.table) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await fetchTableLedger(appState.table);
                setLedgerData(data);
            } catch (error) {
                console.error('Failed to load ledger:', error);
                setLedgerData(null);
            } finally {
                setLoading(false);
            }
        };

        loadLedger();
    }, [appState.table]);

    // Transform ledger entries into player sessions
    const sessions = useMemo(() => {
        if (!ledgerData) return [];

        const playerMap = new Map<string, PlayerSession>();

        // Process all ledger entries
        if (!ledgerData.entries || !Array.isArray(ledgerData.entries)) {
            // No entries yet, but we still want to show active players if any
        } else {
            ledgerData.entries.forEach((entry: LedgerEntry) => {
            const {
                player_uuid,
                player_name,
                entry_type,
                amount,
                final_stack,
                event_id,
                timestamp,
            } = entry;

            if (!player_uuid) return;

            // Initialize player session if not exists
            if (!playerMap.has(player_uuid)) {
                playerMap.set(player_uuid, {
                    uuid: player_uuid,
                    username: player_name || 'Unknown',
                    totalBuyIns: 0,
                    totalBuyOuts: 0,
                    currentStack: 0,
                    net: 0,
                    isActive: false,
                    transactions: [],
                });
            }

            const session = playerMap.get(player_uuid)!;

            // Process buy-ins
            if (entry_type === 'buy_in' && amount) {
                const buyInAmount = parseFloat(amount);
                session.totalBuyIns += buyInAmount;
                session.transactions.push({
                    id: event_id,
                    timestamp,
                    type: 'buy-in',
                    amount: buyInAmount,
                });
            }

            // Process cash-outs (cash_out or forced_out)
            if (
                (entry_type === 'cash_out' || entry_type === 'forced_out') &&
                (final_stack || amount)
            ) {
                const cashOutAmount = parseFloat(final_stack || amount || '0');
                session.totalBuyOuts += cashOutAmount;
                session.currentStack = 0; // Player left/kicked, no current stack
                session.transactions.push({
                    id: event_id,
                    timestamp,
                    type: entry_type === 'forced_out' ? 'kicked' : 'buy-out',
                    amount: cashOutAmount,
                });
            }
            });
        }

        // Merge with active players from game state
        if (appState.game?.players) {
            appState.game.players.forEach((player) => {
                if (playerMap.has(player.uuid)) {
                    const session = playerMap.get(player.uuid)!;
                    session.currentStack = player.stack;
                    session.isActive = !player.left && player.in;
                    session.username = player.username || session.username;
                } else {
                    // Player is active but no ledger entries yet
                    playerMap.set(player.uuid, {
                        uuid: player.uuid,
                        username: player.username,
                        totalBuyIns: player.totalBuyIn || 0,
                        totalBuyOuts: 0,
                        currentStack: player.stack,
                        net: 0,
                        isActive: !player.left && player.in,
                        transactions: [],
                    });
                }
            });
        }

        // Calculate net for each session
        playerMap.forEach((session) => {
            session.net =
                session.totalBuyOuts +
                session.currentStack -
                session.totalBuyIns;
        });

        return Array.from(playerMap.values()).sort((a, b) => {
            // Sort by: active first, then by net descending
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return b.net - a.net;
        });
    }, [ledgerData, appState.game?.players]);

    // Calculate summary stats from ledger totals and game state
    const totalBuyIns = ledgerData?.totals?.buy_in
        ? parseFloat(ledgerData.totals.buy_in)
        : 0;
    const totalCashOuts = ledgerData?.totals?.cash_out
        ? parseFloat(ledgerData.totals.cash_out)
        : 0;
    // Calculate chips in play from sessions (includes all players with stacks, even if game hasn't started)
    const totalChipsInPlay = sessions.reduce(
        (sum, s) => sum + s.currentStack,
        0
    );

    const formatCurrency = (amount: number) => format(Math.abs(amount));

    const toggleRow = (uuid: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(uuid)) {
                newSet.delete(uuid);
            } else {
                newSet.add(uuid);
            }
            return newSet;
        });
    };

    const truncateUuid = (uuid: string) => {
        if (uuid.length <= 8) return uuid;
        return `${uuid.substring(0, 4)}...${uuid.substring(uuid.length - 4)}`;
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ─── Loading state ───────────────────────────────────────────────────
    if (loading) {
        return (
            <Stack spacing={{ base: 2, md: 4 }}>
                <Box
                    bg="card.white"
                    p={4}
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="card.lift"
                    animation={`${skeletonShimmer} 1.5s ease-in-out infinite`}
                >
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        {[0, 1, 2].map((i) => (
                            <Stack key={i} spacing={1}>
                                <Box
                                    w="48px"
                                    h="9px"
                                    borderRadius="3px"
                                    bg="card.lightGray"
                                />
                                <Box
                                    w="80px"
                                    h="20px"
                                    borderRadius="4px"
                                    bg="card.lightGray"
                                />
                                <Box
                                    w="60px"
                                    h="9px"
                                    borderRadius="3px"
                                    bg="card.lightGray"
                                />
                            </Stack>
                        ))}
                    </Grid>
                </Box>
                <Stack spacing={2}>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </Stack>
            </Stack>
        );
    }

    // ─── Empty state ─────────────────────────────────────────────────────
    if (sessions.length === 0) {
        return (
            <Stack spacing={{ base: 2, md: 4 }}>
                <StatsRibbon
                    totalBuyIns={totalBuyIns}
                    totalCashOuts={totalCashOuts}
                    totalChipsInPlay={totalChipsInPlay}
                    formatCurrency={formatCurrency}
                />
                <EmptyPanel />
            </Stack>
        );
    }

    return (
        <Stack spacing={{ base: 2, md: 4 }}>
            {/* Stats ribbon */}
            <StatsRibbon
                totalBuyIns={totalBuyIns}
                totalCashOuts={totalCashOuts}
                totalChipsInPlay={totalChipsInPlay}
                formatCurrency={formatCurrency}
            />

            {/* Mobile / portrait — card layout */}
            <Box display={{ base: 'block', md: 'none' }}>
                <Stack spacing={2}>
                    {sessions.map((session) => (
                        <MobileSessionCard
                            key={session.uuid}
                            session={session}
                            expanded={expandedRows.has(session.uuid)}
                            onToggle={() => toggleRow(session.uuid)}
                            formatCurrency={formatCurrency}
                            formatTime={formatTime}
                            truncateUuid={truncateUuid}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Desktop — table layout */}
            <Box display={{ base: 'none', md: 'block' }}>
                <Box
                    bg="card.white"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    overflow="hidden"
                    boxShadow="card.lift"
                    maxH="500px"
                    overflowY="auto"
                    sx={{
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bg: 'card.lightGray',
                            borderRadius: 'full',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bg: 'text.muted',
                            borderRadius: 'full',
                            _hover: {
                                bg: 'text.secondary',
                            },
                        },
                    }}
                >
                    <Table variant="simple" size="md">
                        <Thead
                            position="sticky"
                            top={0}
                            bg="card.lightGray"
                            zIndex={1}
                        >
                            <Tr>
                                <Th
                                    color="text.secondary"
                                    fontWeight={700}
                                    fontSize="2xs"
                                    letterSpacing="0.10em"
                                    py={3}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    Player
                                </Th>
                                <Th
                                    color="text.secondary"
                                    fontWeight={700}
                                    fontSize="2xs"
                                    letterSpacing="0.10em"
                                    isNumeric
                                    py={3}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    Buy-in
                                </Th>
                                <Th
                                    color="text.secondary"
                                    fontWeight={700}
                                    fontSize="2xs"
                                    letterSpacing="0.10em"
                                    isNumeric
                                    py={3}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    Cash-out
                                </Th>
                                <Th
                                    color="text.secondary"
                                    fontWeight={700}
                                    fontSize="2xs"
                                    letterSpacing="0.10em"
                                    isNumeric
                                    py={3}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    Stack
                                </Th>
                                <Th
                                    color="text.secondary"
                                    fontWeight={700}
                                    fontSize="2xs"
                                    letterSpacing="0.10em"
                                    isNumeric
                                    py={3}
                                    borderBottom="1px solid"
                                    borderColor="border.lightGray"
                                >
                                    Net
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sessions.map((session) => {
                                const hasTx = session.transactions.length > 0;
                                const isExpanded = expandedRows.has(
                                    session.uuid
                                );
                                const cashOutDisplay =
                                    session.totalBuyOuts > 0
                                        ? formatCurrency(session.totalBuyOuts)
                                        : '—';
                                return (
                                    <React.Fragment key={session.uuid}>
                                        <Tr
                                            onClick={() =>
                                                hasTx && toggleRow(session.uuid)
                                            }
                                            cursor={
                                                hasTx ? 'pointer' : 'default'
                                            }
                                            _hover={{
                                                bg: hasTx
                                                    ? 'card.lightGray'
                                                    : 'transparent',
                                            }}
                                            transition="background-color 80ms ease"
                                            bg={
                                                isExpanded
                                                    ? 'card.lightGray'
                                                    : 'transparent'
                                            }
                                            borderBottom="1px solid"
                                            borderColor="border.lightGray"
                                        >
                                            <Td py={3}>
                                                <HStack spacing={3}>
                                                    {hasTx ? (
                                                        <Icon
                                                            as={FiChevronDown}
                                                            boxSize={4}
                                                            color="text.muted"
                                                            transform={
                                                                isExpanded
                                                                    ? 'rotate(180deg)'
                                                                    : undefined
                                                            }
                                                            transition="transform 80ms ease"
                                                        />
                                                    ) : (
                                                        <Box w={4} />
                                                    )}
                                                    {session.isActive ? (
                                                        <ActiveDot />
                                                    ) : (
                                                        <Box w="8px" h="8px" />
                                                    )}
                                                    <Stack spacing={0}>
                                                        <PlayerNameLink
                                                            username={session.username}
                                                            fontWeight={700}
                                                            color="text.primary"
                                                            fontSize="sm"
                                                        />
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                            fontFamily="mono"
                                                        >
                                                            {truncateUuid(
                                                                session.uuid
                                                            )}
                                                        </Text>
                                                    </Stack>
                                                </HStack>
                                            </Td>
                                            <Td isNumeric>
                                                <Text
                                                    fontWeight={600}
                                                    color="text.primary"
                                                    sx={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                    fontSize="sm"
                                                >
                                                    {formatCurrency(
                                                        session.totalBuyIns
                                                    )}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <Text
                                                    fontWeight={
                                                        session.totalBuyOuts > 0
                                                            ? 600
                                                            : 400
                                                    }
                                                    color={
                                                        session.totalBuyOuts > 0
                                                            ? 'text.primary'
                                                            : 'text.muted'
                                                    }
                                                    sx={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                    fontSize="sm"
                                                >
                                                    {cashOutDisplay}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <Text
                                                    fontWeight={700}
                                                    color="text.primary"
                                                    sx={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                    fontSize="sm"
                                                >
                                                    {formatCurrency(
                                                        session.currentStack
                                                    )}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <NetCell
                                                    net={session.net}
                                                    formatCurrency={
                                                        formatCurrency
                                                    }
                                                />
                                            </Td>
                                        </Tr>
                                        {/* Expanded transactions — log line per tx, tone-matched bar */}
                                        {hasTx &&
                                            isExpanded &&
                                            session.transactions.map((tx) => {
                                                const tone = TX_TONE[tx.type];
                                                return (
                                                    <Tr
                                                        key={tx.id}
                                                        bg={tone.bg}
                                                    >
                                                        <Td
                                                            py={2.5}
                                                            colSpan={5}
                                                            position="relative"
                                                            _before={{
                                                                content: '""',
                                                                position:
                                                                    'absolute',
                                                                left: 0,
                                                                top: 0,
                                                                bottom: 0,
                                                                width: '2px',
                                                                bg: tone.edge,
                                                            }}
                                                        >
                                                            <HStack
                                                                spacing={3}
                                                                pl={8}
                                                                justify="space-between"
                                                                flexWrap="wrap"
                                                            >
                                                                <HStack
                                                                    spacing={
                                                                        2.5
                                                                    }
                                                                >
                                                                    <Icon
                                                                        as={
                                                                            tone.icon
                                                                        }
                                                                        boxSize="14px"
                                                                        color={
                                                                            tone.color
                                                                        }
                                                                    />
                                                                    <Text
                                                                        fontSize="xs"
                                                                        fontWeight={
                                                                            700
                                                                        }
                                                                        color={
                                                                            tone.color
                                                                        }
                                                                        textTransform="uppercase"
                                                                        letterSpacing="0.06em"
                                                                    >
                                                                        {
                                                                            tone.label
                                                                        }
                                                                    </Text>
                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="text.muted"
                                                                    >
                                                                        {formatTime(
                                                                            tx.timestamp
                                                                        )}
                                                                    </Text>
                                                                </HStack>
                                                                <Text
                                                                    fontSize="sm"
                                                                    fontWeight={
                                                                        700
                                                                    }
                                                                    color={
                                                                        tone.color
                                                                    }
                                                                    sx={{
                                                                        fontVariantNumeric:
                                                                            'tabular-nums',
                                                                    }}
                                                                >
                                                                    {tone.sign}
                                                                    {formatCurrency(
                                                                        tx.amount
                                                                    )}
                                                                </Text>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                    </React.Fragment>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Box>
        </Stack>
    );
};

export default Ledger;
