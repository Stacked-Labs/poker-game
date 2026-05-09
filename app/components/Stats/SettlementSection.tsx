'use client';

import { Text, Flex, Box, Badge, HStack, VStack } from '@chakra-ui/react';
import { StatusDot } from './Primitives';
import type { SettlementHealthResponse } from '../../stats/types';

// ── Settlement Health ──────────────────────────────────────────────────────────

export const SettlementSection = ({ data }: { data: SettlementHealthResponse | null }) => {
    const ok = !data || data.pending_count === 0;
    return (
        <>
            <Flex align="center" gap={3} mb={data && data.pending_count > 0 ? 4 : 0}>
                <StatusDot ok={ok} />
                <Text
                    fontSize="2xl"
                    fontWeight="extrabold"
                    color={ok ? 'brand.green' : 'brand.pink'}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {data?.pending_count ?? 0}
                </Text>
                <Text fontSize="sm" color="text.secondary" _dark={{ color: 'whiteAlpha.700' }}>stuck settlements</Text>
                {ok && (
                    <Badge
                        bg="bg.greenTint"
                        color="brand.green"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        fontWeight="bold"
                    >
                        All Clear
                    </Badge>
                )}
                {data?.timestamp && (
                    <Text fontSize="xs" color="text.secondary" ml="auto" _dark={{ color: 'whiteAlpha.600' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>{new Date(data.timestamp).toLocaleString()}</Text>
                )}
            </Flex>

            {data && data.pending_count > 0 && (
                <VStack align="stretch" gap={3} mt={2}>
                    {data.pending_settlements.map((ps, i) => (
                        <Box
                            key={i}
                            bg="card.lightGray"
                            borderRadius="10px"
                            p={4}
                            border="1px solid"
                            borderColor="brand.pink"
                            _dark={{ bg: 'whiteAlpha.50' }}
                        >
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text
                                    fontSize="sm"
                                    fontFamily="monospace"
                                    color="text.secondary"
                                    noOfLines={1}
                                    _dark={{ color: 'whiteAlpha.700' }}
                                >
                                    {ps.table}
                                </Text>
                                <Badge
                                    bg={
                                        ps.thirdweb_status === 'mined'
                                            ? 'brand.green'
                                            : ps.thirdweb_status === 'errored'
                                                ? 'brand.pink'
                                                : 'brand.yellow'
                                    }
                                    color={ps.thirdweb_status === 'errored' || ps.thirdweb_status === 'mined' ? 'white' : 'brand.darkNavy'}
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                    fontWeight={700}
                                >
                                    {ps.thirdweb_status ?? 'unknown'}
                                </Badge>
                            </Flex>
                            <HStack gap={4} fontSize="sm">
                                <Text color="text.secondary" _dark={{ color: 'whiteAlpha.700' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>Hand #{ps.hand_id}</Text>
                                <Text color="text.secondary" _dark={{ color: 'whiteAlpha.700' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>{ps.player_count} players</Text>
                            </HStack>
                            {ps.thirdweb_error && (
                                <Text fontSize="xs" color="brand.pink" mt={2}>{ps.thirdweb_error}</Text>
                            )}
                        </Box>
                    ))}
                </VStack>
            )}
        </>
    );
};
