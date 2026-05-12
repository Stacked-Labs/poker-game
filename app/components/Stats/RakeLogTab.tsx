'use client';

import {
    Text,
    Flex,
    Box,
    Badge,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Spinner,
} from '@chakra-ui/react';
import { Card } from './Primitives';
import type { RakeLogResponse } from '../../stats/types';

interface RakeLogTabProps {
    rakeLog: RakeLogResponse | null;
    loading: boolean;
}

const thProps = {
    color: 'text.secondary',
    fontSize: 'xs' as const,
    borderColor: 'card.lightGray',
    _dark: { borderColor: 'whiteAlpha.200', color: 'whiteAlpha.700' },
};

const tdBorder = {
    borderColor: 'card.lightGray',
    _dark: { borderColor: 'whiteAlpha.100' },
};

const tabular = { fontVariantNumeric: 'tabular-nums' as const };

function fmtUsdc(units: number): string {
    return (units / 1_000_000).toFixed(6);
}

function fmtChips(chips: number): string {
    return (chips / 100).toFixed(2);
}

function chainColor(chain: string) {
    if (chain === 'base') return { bg: 'brand.green', color: 'white' };
    return { bg: 'brand.navy', color: 'white' };
}

export const RakeLogTab = ({ rakeLog, loading }: RakeLogTabProps) => {
    if (loading) {
        return (
            <Flex justify="center" py={16}>
                <Spinner size="lg" color="brand.green" thickness="3px" speed="0.7s" />
            </Flex>
        );
    }

    const entries = rakeLog?.entries ?? [];

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={4}>
                <Text fontSize="xs" color="text.secondary" _dark={{ color: 'whiteAlpha.600' }}>
                    {entries.length} rows · newest first · max 500
                </Text>
                {rakeLog && (
                    <Text fontSize="xs" color="text.secondary" _dark={{ color: 'whiteAlpha.500' }} sx={tabular}>
                        as of {new Date(rakeLog.timestamp).toLocaleString()}
                    </Text>
                )}
            </Flex>

            <Card title="hand_rake_log">
                {entries.length === 0 ? (
                    <Flex justify="center" py={10}>
                        <Text color="text.secondary" fontSize="sm" _dark={{ color: 'whiteAlpha.500' }}>
                            No rows found
                        </Text>
                    </Flex>
                ) : (
                    <TableContainer>
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th {...thProps} pl={0}>hand_id</Th>
                                    <Th {...thProps}>chain</Th>
                                    <Th {...thProps} isNumeric>rake_chips</Th>
                                    <Th {...thProps} isNumeric>platform_rake_usdc</Th>
                                    <Th {...thProps} isNumeric>settled_at</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {entries.map((e) => {
                                    const cc = chainColor(e.chain);
                                    return (
                                        <Tr key={e.hand_id} _hover={{ bg: 'rgba(0,0,0,0.02)', _dark: { bg: 'whiteAlpha.50' } }}>
                                            <Td
                                                fontSize="xs"
                                                fontFamily="mono"
                                                color="text.primary"
                                                {...tdBorder}
                                                pl={0}
                                                maxW="180px"
                                                sx={tabular}
                                            >
                                                {e.hand_id}
                                            </Td>
                                            <Td {...tdBorder}>
                                                <Badge bg={cc.bg} color={cc.color} fontSize="xs" px={1.5} borderRadius="full">
                                                    {e.chain}
                                                </Badge>
                                            </Td>
                                            <Td fontSize="xs" fontWeight="semibold" color="text.primary" {...tdBorder} isNumeric sx={tabular}>
                                                {fmtChips(e.rake_chips)}
                                            </Td>
                                            <Td fontSize="xs" fontWeight="semibold" color="brand.pink" {...tdBorder} isNumeric sx={tabular}>
                                                ${fmtUsdc(e.platform_rake_usdc)}
                                            </Td>
                                            <Td fontSize="xs" color="text.secondary" {...tdBorder} isNumeric sx={tabular}>
                                                <HStack justify="flex-end" gap={1}>
                                                    <Text>{new Date(e.settled_at).toLocaleDateString()}</Text>
                                                    <Text opacity={0.6}>{new Date(e.settled_at).toLocaleTimeString()}</Text>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </Box>
    );
};
