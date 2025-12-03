'use client';

import React, { useContext, useState, useMemo, useEffect } from 'react';
import {
    Box,
    HStack,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    VStack,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { fetchTableLedger } from '@/app/hooks/server_actions';
import { LedgerResponse, LedgerEntry } from '@/app/interfaces';

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

const Ledger = () => {
    const { appState } = useContext(AppContext);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.abs(amount));
    };

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

    if (loading) {
        return (
            <Box>
                <Box
                    p={8}
                    textAlign="center"
                    bg="input.lightGray"
                    borderRadius="16px"
                >
                    <Spinner
                        size="xl"
                        color="brand.green"
                        thickness="4px"
                        speed="0.65s"
                    />
                    <Text mt={4} color="gray.600" fontWeight="medium">
                        Loading session data...
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {/* Summary Stats */}
            <HStack
                gap={4}
                mb={6}
                flexWrap="wrap"
                justify="space-around"
                bg={'card.white'}
                p={{ base: 4, md: 6 }}
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Stat textAlign="center">
                    <StatLabel
                        color="text.gray"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Total Buy-ins
                    </StatLabel>
                    <StatNumber
                        color="brand.green"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        {formatCurrency(totalBuyIns)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        All players
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel
                        color="text.gray"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Total Cash-outs
                    </StatLabel>
                    <StatNumber
                        color="brand.pink"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        {formatCurrency(totalCashOuts)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        Exits & Kicks
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel
                        color="text.gray"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Chips in Play
                    </StatLabel>
                    <StatNumber
                        color="brand.navy"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        {formatCurrency(totalChipsInPlay)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        Current Stacks
                    </StatHelpText>
                </Stat>
            </HStack>

            {/* Players Table */}
            <TableContainer
                bg={'card.white'}
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                overflowY="auto"
                maxH="500px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
                sx={{
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bg: 'input.lightGray',
                        borderRadius: 'full',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bg: 'text.secondary',
                        borderRadius: 'full',
                        _hover: {
                            bg: 'brand.pink',
                        },
                    },
                }}
            >
                <Table
                    variant="simple"
                    size={{ base: 'sm', md: 'md' }}
                    sx={{
                        borderCollapse: 'collapse',
                        borderSpacing: 0,
                        tr: {
                            borderBottom: '1px solid',
                            borderColor: 'gray.200',
                        },
                        'td, th': {
                            borderBottom: 'none',
                        },
                    }}
                >
                    <Thead
                        position="sticky"
                        top={0}
                        bg="card.lightGray"
                        zIndex={1}
                    >
                        <Tr>
                            <Th
                                color={'text.secondary'}
                                fontWeight="bold"
                                fontSize="xs"
                            >
                                PLAYER
                            </Th>
                            <Th
                                color={'brand.navy'}
                                fontWeight="bold"
                                fontSize="xs"
                                isNumeric
                            >
                                BUY-IN
                            </Th>
                            <Th
                                color={'text.secondary'}
                                fontWeight="bold"
                                fontSize="xs"
                                isNumeric
                            >
                                BUY-OUT
                            </Th>
                            <Th
                                color={'text.secondary'}
                                fontWeight="bold"
                                fontSize="xs"
                                isNumeric
                            >
                                STACK
                            </Th>
                            <Th
                                color={'text.secondary'}
                                fontWeight="bold"
                                fontSize="xs"
                                isNumeric
                            >
                                NET
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sessions.length === 0 ? (
                            <Tr>
                                <Td colSpan={5} textAlign="center" py={8}>
                                    <Text
                                        color="text.gray600"
                                        fontWeight="medium"
                                    >
                                        No session data yet
                                    </Text>
                                </Td>
                            </Tr>
                        ) : (
                            sessions.map((session) => (
                                <React.Fragment key={session.uuid}>
                                    <Tr
                                        onClick={() =>
                                            session.transactions.length > 0 &&
                                            toggleRow(session.uuid)
                                        }
                                        cursor={
                                            session.transactions.length > 0
                                                ? 'pointer'
                                                : 'default'
                                        }
                                        _hover={{
                                            bg:
                                                session.transactions.length > 0
                                                    ? 'input.lightGray'
                                                    : 'transparent',
                                        }}
                                        transition="all 0.2s ease"
                                        bg={
                                            expandedRows.has(session.uuid)
                                                ? 'input.lightGray'
                                                : 'transparent'
                                        }
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        <Td>
                                            <HStack spacing={3}>
                                                {session.transactions.length >
                                                0 ? (
                                                    <Icon
                                                        as={
                                                            expandedRows.has(
                                                                session.uuid
                                                            )
                                                                ? FiChevronUp
                                                                : FiChevronDown
                                                        }
                                                        boxSize={5}
                                                        color="brand.navy"
                                                        transition="all 0.2s ease"
                                                    />
                                                ) : (
                                                    <Box w={5} />
                                                )}
                                                <VStack
                                                    align="start"
                                                    spacing={1}
                                                    flex={1}
                                                >
                                                    <HStack>
                                                        <Text
                                                            fontWeight="bold"
                                                            color="text.secondary"
                                                        >
                                                            {session.username}
                                                        </Text>
                                                        {session.isActive && (
                                                            <Badge
                                                                bg="brand.green"
                                                                color="white"
                                                                fontSize="2xs"
                                                                px={2}
                                                                py={0.5}
                                                                borderRadius="4px"
                                                            >
                                                                ACTIVE
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        fontFamily="mono"
                                                    >
                                                        {truncateUuid(
                                                            session.uuid
                                                        )}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Td>
                                        <Td isNumeric>
                                            <Text
                                                fontWeight="semibold"
                                                color="brand.green"
                                            >
                                                {formatCurrency(
                                                    session.totalBuyIns
                                                )}
                                            </Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text
                                                fontWeight="semibold"
                                                color="brand.pink"
                                            >
                                                {formatCurrency(
                                                    session.totalBuyOuts
                                                )}
                                            </Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text
                                                fontWeight="bold"
                                                color="brand.navy"
                                            >
                                                {formatCurrency(
                                                    session.currentStack
                                                )}
                                            </Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text
                                                fontWeight="bold"
                                                color={
                                                    session.net >= 0
                                                        ? 'brand.green'
                                                        : 'brand.pink'
                                                }
                                            >
                                                {session.net >= 0 ? '+' : '-'}
                                                {formatCurrency(session.net)}
                                            </Text>
                                        </Td>
                                    </Tr>
                                    {/* Expandable transaction history */}
                                    {session.transactions.length > 0 &&
                                        expandedRows.has(session.uuid) &&
                                        session.transactions.map((tx) => (
                                            <Tr
                                                key={tx.id}
                                                bg="input.lightGray"
                                                transition="all 0.2s ease"
                                            >
                                                {/* PLAYER column - shows timestamp and badge */}
                                                <Td
                                                    position="relative"
                                                    _before={{
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '3px',
                                                        bg: 'brand.navy',
                                                    }}
                                                >
                                                    <HStack spacing={2}>
                                                        <Text
                                                            fontSize="xs"
                                                            color="gray.500"
                                                            fontStyle="italic"
                                                        >
                                                            {formatTime(
                                                                tx.timestamp
                                                            )}
                                                        </Text>
                                                        <Badge
                                                            bg={
                                                                tx.type ===
                                                                'buy-in'
                                                                    ? 'brand.green'
                                                                    : tx.type ===
                                                                        'buy-out'
                                                                      ? 'brand.pink'
                                                                      : 'brand.pink'
                                                            }
                                                            color="white"
                                                            fontSize="2xs"
                                                            px={2}
                                                            py={0.5}
                                                            borderRadius="4px"
                                                            textTransform="uppercase"
                                                            fontWeight="bold"
                                                        >
                                                            {tx.type}
                                                        </Badge>
                                                    </HStack>
                                                </Td>

                                                {/* BUY-IN column */}
                                                <Td isNumeric>
                                                    {tx.type === 'buy-in' ? (
                                                        <Text
                                                            fontWeight="bold"
                                                            color="brand.green"
                                                        >
                                                            {formatCurrency(
                                                                tx.amount
                                                            )}
                                                        </Text>
                                                    ) : (
                                                        <Text
                                                            color="gray.400"
                                                            fontSize="sm"
                                                        >
                                                            0.00
                                                        </Text>
                                                    )}
                                                </Td>

                                                {/* BUY-OUT column */}
                                                <Td isNumeric>
                                                    {tx.type === 'buy-out' ||
                                                    tx.type === 'kicked' ? (
                                                        <Text
                                                            fontWeight="bold"
                                                            color="brand.pink"
                                                        >
                                                            {formatCurrency(
                                                                tx.amount
                                                            )}
                                                        </Text>
                                                    ) : (
                                                        <Text
                                                            color="gray.400"
                                                            fontSize="sm"
                                                        >
                                                            0.00
                                                        </Text>
                                                    )}
                                                </Td>

                                                {/* STACK column */}
                                                <Td isNumeric>
                                                    <Text
                                                        color="gray.400"
                                                        fontSize="sm"
                                                    >
                                                        0.00
                                                    </Text>
                                                </Td>

                                                {/* NET column */}
                                                <Td isNumeric>
                                                    <Text
                                                        color="gray.400"
                                                        fontSize="sm"
                                                    >
                                                        0.00
                                                    </Text>
                                                </Td>
                                            </Tr>
                                        ))}
                                </React.Fragment>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Ledger;
