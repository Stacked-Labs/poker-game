'use client';

import {
    Text,
    Flex,
    Box,
    Tooltip,
    Badge,
    HStack,
    VStack,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import Link from 'next/link';
import EmergencyWithdrawAllButton from '../EmergencyWithdrawAllButton';
import { CHAIN_CONFIG, defaultChain } from '../../thirdwebclient';
import { Card, StatusDot } from './Primitives';
import type { AdminTablesResponse } from '../../stats/types';

interface TablesTabProps {
    tables: AdminTablesResponse | null;
    tablesTs: string;
    filteredTables: NonNullable<AdminTablesResponse['tables']>;
    search: string;
    setSearch: (v: string) => void;
    typeFilter: 'all' | 'crypto' | 'free';
    setTypeFilter: (v: 'all' | 'crypto' | 'free') => void;
    tablesChain: 'base-sepolia' | 'base' | 'all';
    setTablesChain: (v: 'base-sepolia' | 'base' | 'all') => void;
}

const tabularNums = { fontVariantNumeric: 'tabular-nums' as const };

const SummaryDivider = () => (
    <Box
        w="1px"
        h="40px"
        bg="border.lightGray"
        _dark={{ bg: 'rgba(255,255,255,0.10)' }}
        aria-hidden
    />
);

const InlineDivider = () => (
    <Box
        w="1px"
        h="20px"
        bg="border.lightGray"
        _dark={{ bg: 'rgba(255,255,255,0.10)' }}
        mx={1}
        aria-hidden
    />
);

const cellBorder = {
    borderColor: 'border.lightGray',
    _dark: { borderColor: 'rgba(255,255,255,0.08)' },
} as const;

export const TablesTab = ({
    tables,
    tablesTs,
    filteredTables,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    tablesChain,
    setTablesChain,
}: TablesTabProps) => {
    return (
        <Card
            title="Tables"
            subtitle={new Date(tablesTs).toLocaleString()}
        >
            {/* Summary */}
            <HStack gap={6} mb={5} flexWrap="wrap">
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary" sx={tabularNums} lineHeight={1.1}>{tables?.total_count ?? 0}</Text>
                    <Text fontSize="xs" color="text.secondary" mt={0.5}>Total</Text>
                </VStack>
                <SummaryDivider />
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="extrabold" color="brand.green" sx={tabularNums} lineHeight={1.1}>{tables?.tables.filter((t) => t.is_active).length ?? 0}</Text>
                    <Text fontSize="xs" color="text.secondary" mt={0.5}>Active</Text>
                </VStack>
                <SummaryDivider />
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary" sx={tabularNums} lineHeight={1.1}>{tables?.tables.filter((t) => t.in_memory).length ?? 0}</Text>
                    <Text fontSize="xs" color="text.secondary" mt={0.5}>In Memory</Text>
                </VStack>
                <SummaryDivider />
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="extrabold" color="text.primary" sx={tabularNums} lineHeight={1.1}>{tables?.tables.filter((t) => t.is_crypto).length ?? 0}</Text>
                    <Text fontSize="xs" color="text.secondary" mt={0.5}>Crypto</Text>
                </VStack>
            </HStack>

            {/* Filter + search */}
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={4} gap={{ base: 3, md: 4 }} flexWrap="wrap" direction={{ base: 'column', md: 'row' }}>
                <HStack gap={2} flexWrap="wrap" rowGap={2}>
                    {([
                        { key: 'all',    label: 'All' },
                        { key: 'crypto', label: 'Crypto' },
                        { key: 'free',   label: 'Free' },
                    ] as const).map(({ key, label }) => {
                        const active = typeFilter === key;
                        return (
                            <Box
                                key={key}
                                as="button"
                                type="button"
                                px={3}
                                py={1.5}
                                borderRadius="full"
                                fontSize="sm"
                                fontWeight={700}
                                letterSpacing="0.02em"
                                cursor="pointer"
                                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease, border-color 80ms ease"
                                bg={active ? 'brand.pink' : 'card.lightGray'}
                                color={active ? 'white' : 'text.secondary'}
                                border="1px solid"
                                borderColor={active ? 'brand.pink' : 'transparent'}
                                boxShadow={active ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #950839' : 'none'}
                                _hover={
                                    active
                                        ? { bg: 'brand.pink' }
                                        : {
                                              bg: 'border.lightGray',
                                              color: 'text.primary',
                                              _dark: { bg: 'rgba(255,255,255,0.08)' },
                                          }
                                }
                                _active={
                                    active
                                        ? {
                                              bg: 'brand.pinkDark',
                                              transform: 'translateY(1px)',
                                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                                          }
                                        : { transform: 'translateY(1px)' }
                                }
                                _focusVisible={{
                                    outline: 'none',
                                    boxShadow: active
                                        ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #950839, 0 0 0 3px rgba(235, 11, 92, 0.35)'
                                        : '0 0 0 3px rgba(235, 11, 92, 0.35)',
                                }}
                                onClick={() => setTypeFilter(key)}
                            >
                                {label}
                            </Box>
                        );
                    })}
                    {typeFilter !== 'free' && <InlineDivider />}
                    {typeFilter !== 'free' && (
                        <>
                            {([
                                { key: 'all' as const,          label: 'All Networks' },
                                { key: 'base' as const,         label: 'Mainnet' },
                                { key: 'base-sepolia' as const, label: 'Testnet' },
                            ]).map(({ key, label }) => {
                                const active = tablesChain === key;
                                return (
                                    <Box
                                        key={key}
                                        as="button"
                                        type="button"
                                        px={3}
                                        py={1.5}
                                        borderRadius="full"
                                        fontSize="sm"
                                        fontWeight={700}
                                        letterSpacing="0.02em"
                                        cursor="pointer"
                                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease, border-color 80ms ease"
                                        bg={active ? 'brand.green' : 'card.lightGray'}
                                        color={active ? 'white' : 'text.secondary'}
                                        border="1px solid"
                                        borderColor={active ? 'brand.green' : 'transparent'}
                                        boxShadow={active ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #22674E' : 'none'}
                                        _hover={
                                            active
                                                ? { bg: 'brand.green' }
                                                : {
                                                      bg: 'border.lightGray',
                                                      color: 'text.primary',
                                                      _dark: { bg: 'rgba(255,255,255,0.08)' },
                                                  }
                                        }
                                        _active={
                                            active
                                                ? {
                                                      bg: 'brand.greenDark',
                                                      transform: 'translateY(1px)',
                                                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                                                  }
                                                : { transform: 'translateY(1px)' }
                                        }
                                        _focusVisible={{
                                            outline: 'none',
                                            boxShadow: active
                                                ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #22674E, 0 0 0 3px rgba(54, 163, 123, 0.40)'
                                                : '0 0 0 3px rgba(54, 163, 123, 0.40)',
                                        }}
                                        onClick={() => setTablesChain(key)}
                                    >
                                        {label}
                                    </Box>
                                );
                            })}
                        </>
                    )}
                </HStack>
                <Input
                    placeholder="Search by name or wallet address…"
                    size="sm"
                    maxW={{ base: '100%', md: '280px' }}
                    borderRadius="8px"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg="input.lightGray"
                    color="text.primary"
                    border="1px solid"
                    borderColor="transparent"
                    _placeholder={{ color: 'text.secondary', opacity: 0.7, _dark: { color: 'whiteAlpha.500', opacity: 1 } }}
                    _hover={{ borderColor: 'border.lightGray', _dark: { borderColor: 'rgba(255,255,255,0.12)' } }}
                    _focus={{
                        boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.20)',
                        bg: 'card.white',
                        borderColor: 'brand.pink',
                    }}
                    _focusVisible={{
                        boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.20)',
                        borderColor: 'brand.pink',
                    }}
                />
            </Flex>

            {/* Table */}
            <TableContainer>
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr>
                            <Th color="text.secondary" {...cellBorder} pl={0}>Status</Th>
                            <Th color="text.secondary" {...cellBorder}>Name</Th>
                            <Th color="text.secondary" {...cellBorder}>Type</Th>
                            <Th color="text.secondary" {...cellBorder}>Network</Th>
                            <Th color="text.secondary" {...cellBorder} isNumeric>Blinds</Th>
                            <Th color="text.secondary" {...cellBorder} isNumeric>Players</Th>
                            <Th color="text.secondary" {...cellBorder} isNumeric>WS</Th>
                            <Th color="text.secondary" {...cellBorder}>Created</Th>
                            <Th color="text.secondary" {...cellBorder}>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredTables.length > 0 ? (
                            filteredTables.map((t) => (
                                <Tr
                                    key={t.name}
                                    transition="background 0.15s"
                                    _hover={{
                                        bg: 'rgba(51, 68, 121, 0.04)',
                                        _dark: { bg: 'rgba(255, 255, 255, 0.04)' },
                                    }}
                                >
                                    <Td {...cellBorder} pl={0}>
                                        <Tooltip label={t.is_active ? 'Active' : 'Inactive'} hasArrow>
                                            <Box display="inline-block">
                                                <StatusDot ok={t.is_active} />
                                            </Box>
                                        </Tooltip>
                                    </Td>
                                    <Td {...cellBorder} maxW="220px">
                                        <Tooltip label={t.name} hasArrow placement="top">
                                            <Link href={`/table/${t.name}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Text
                                                    fontSize="xs"
                                                    fontFamily="monospace"
                                                    color="text.primary"
                                                    noOfLines={1}
                                                    _hover={{ color: 'brand.pink' }}
                                                    transition="color 0.15s"
                                                >
                                                    {t.name.length > 22 ? `${t.name.slice(0, 10)}…${t.name.slice(-8)}` : t.name}
                                                </Text>
                                            </Link>
                                        </Tooltip>
                                        {t.is_crypto && t.owner_wallet && (
                                            <Tooltip label={t.owner_wallet} hasArrow placement="top">
                                                <Text
                                                    fontSize="2xs"
                                                    fontFamily="monospace"
                                                    color="text.secondary"
                                                    _dark={{ color: 'text.muted' }}
                                                    noOfLines={1}
                                                    mt={0.5}
                                                    sx={tabularNums}
                                                >
                                                    {`${t.owner_wallet.slice(0, 6)}…${t.owner_wallet.slice(-4)}`}
                                                </Text>
                                            </Tooltip>
                                        )}
                                    </Td>
                                    <Td {...cellBorder}>
                                        <HStack gap={1}>
                                            {t.is_crypto && (
                                                <Badge bg="brand.green" color="white" fontSize="xs" px={2} borderRadius="full" textTransform="none" fontWeight={700}>Crypto</Badge>
                                            )}
                                            {t.in_memory && (
                                                <Badge
                                                    bg="brand.yellow"
                                                    color="brand.darkNavy"
                                                    _dark={{ bg: 'brand.yellowDark', color: 'white' }}
                                                    fontSize="xs"
                                                    px={2}
                                                    borderRadius="full"
                                                    textTransform="none"
                                                    fontWeight={700}
                                                >
                                                    Memory
                                                </Badge>
                                            )}
                                            {!t.is_crypto && (
                                                <Badge
                                                    bg="card.lightGray"
                                                    color="text.secondary"
                                                    fontSize="xs"
                                                    px={2}
                                                    borderRadius="full"
                                                    textTransform="none"
                                                    fontWeight={700}
                                                >
                                                    Free
                                                </Badge>
                                            )}
                                        </HStack>
                                    </Td>
                                    <Td {...cellBorder}>
                                        {t.chain ? (
                                            <Badge
                                                bg={t.chain === 'base' ? 'brand.green' : 'card.lightGray'}
                                                color={t.chain === 'base' ? 'white' : 'text.secondary'}
                                                fontSize="xs"
                                                px={2}
                                                borderRadius="full"
                                                textTransform="none"
                                                fontWeight={700}
                                            >
                                                {t.chain === 'base' ? 'Mainnet' : 'Testnet'}
                                            </Badge>
                                        ) : (
                                            <Text fontSize="xs" color="text.secondary">—</Text>
                                        )}
                                    </Td>
                                    <Td {...cellBorder} isNumeric>
                                        <Text fontSize="xs" fontFamily="monospace" color="text.secondary" sx={tabularNums}>
                                            {t.blinds.sb ?? '?'}/{t.blinds.bb ?? '?'}
                                        </Text>
                                    </Td>
                                    <Td {...cellBorder} isNumeric>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color={t.player_count > 0 ? 'brand.green' : 'text.secondary'}
                                            sx={tabularNums}
                                        >
                                            {t.player_count}
                                        </Text>
                                    </Td>
                                    <Td {...cellBorder} isNumeric>
                                        <Text fontSize="sm" color="text.secondary" sx={tabularNums}>{t.ws_connections}</Text>
                                    </Td>
                                    <Td {...cellBorder}>
                                        <Text fontSize="xs" color="text.secondary" sx={tabularNums}>
                                            {new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </Td>
                                    <Td {...cellBorder}>
                                        {t.is_crypto && t.is_active && (
                                            <EmergencyWithdrawAllButton contractAddress={t.name} chain={CHAIN_CONFIG[t.chain ?? '']?.chain ?? defaultChain} />
                                        )}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={9} textAlign="center" py={12} {...cellBorder}>
                                    <VStack gap={1.5}>
                                        <Text fontSize="sm" fontWeight={700} color="text.primary">No tables found</Text>
                                        <Text fontSize="xs" color="text.secondary">Try a different filter or search term.</Text>
                                    </VStack>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Card>
    );
};
