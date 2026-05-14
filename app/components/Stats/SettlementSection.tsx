'use client';

import { useRef, useState } from 'react';
import {
    Text,
    Flex,
    Box,
    Badge,
    HStack,
    VStack,
    Button,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogCloseButton,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Icon,
    useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { StatusDot } from './Primitives';
import type { SettlementHealthResponse } from '../../stats/types';

// ── Settlement Health ──────────────────────────────────────────────────────────

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const fmtMin = (v: number) => v < 1 ? `${Math.round(v * 60)}s` : `${v.toFixed(1)}m`;

interface SettlementSectionProps {
    data: SettlementHealthResponse | null;
    onClear?: (tableName: string) => Promise<void>;
}

export const SettlementSection = ({ data, onClear }: SettlementSectionProps) => {
    const [clearing, setClearing] = useState<string | null>(null);
    const [pendingTable, setPendingTable] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const ok = !data || data.pending_count === 0;
    const lat = data?.latency;
    const hasLatency = lat && (lat.avg_settle_minutes > 0 || lat.slow_settlements > 0);

    const requestClear = (tableName: string) => {
        setPendingTable(tableName);
        onOpen();
    };

    const handleConfirm = async () => {
        if (!onClear || !pendingTable) return;
        onClose();
        setClearing(pendingTable);
        try {
            await onClear(pendingTable);
        } finally {
            setClearing(null);
            setPendingTable(null);
        }
    };

    const handleCancel = () => {
        onClose();
        setPendingTable(null);
    };

    return (
        <>
            <Flex align="center" gap={3} mb={hasLatency || (data && data.pending_count > 0) ? 4 : 0}>
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

            {hasLatency && (
                <HStack
                    gap={6}
                    mb={data && data.pending_count > 0 ? 4 : 0}
                    px={4}
                    py={3}
                    bg="card.lightGray"
                    borderRadius="10px"
                    _dark={{ bg: 'whiteAlpha.50' }}
                    flexWrap="wrap"
                >
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" _dark={{ color: 'whiteAlpha.600' }}>Avg settle time</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMin(lat!.avg_settle_minutes)}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" _dark={{ color: 'whiteAlpha.600' }}>Max settle time</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMin(lat!.max_settle_minutes)}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium" _dark={{ color: 'whiteAlpha.600' }}>Slow (&gt;5 min)</Text>
                        <Text fontSize="lg" fontWeight="extrabold" color={lat!.slow_settlements > 0 ? 'brand.pink' : 'text.primary'} sx={{ fontVariantNumeric: 'tabular-nums' }}>{lat!.slow_settlements}</Text>
                    </Box>
                    <Text fontSize="xs" color="text.secondary" ml="auto" alignSelf="center" _dark={{ color: 'whiteAlpha.500' }}>last 7 days</Text>
                </HStack>
            )}

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
                            <Flex justify="space-between" align="center">
                                <HStack gap={4} fontSize="sm">
                                    <Text color="text.secondary" _dark={{ color: 'whiteAlpha.700' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>Hand #{ps.hand_id}</Text>
                                    <Text color="text.secondary" _dark={{ color: 'whiteAlpha.700' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>{ps.player_count} players</Text>
                                </HStack>
                                {onClear && (
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        color="brand.pink"
                                        _hover={{ bg: 'rgba(235,11,92,0.08)' }}
                                        _dark={{ _hover: { bg: 'rgba(235,11,92,0.15)' } }}
                                        isLoading={clearing === ps.table}
                                        loadingText="Clearing"
                                        onClick={() => requestClear(ps.table)}
                                        fontWeight="semibold"
                                        borderRadius="6px"
                                        flexShrink={0}
                                    >
                                        Force Clear
                                    </Button>
                                )}
                            </Flex>
                            {ps.thirdweb_error && (
                                <Text fontSize="xs" color="brand.pink" mt={2}>{ps.thirdweb_error}</Text>
                            )}
                        </Box>
                    ))}
                </VStack>
            )}

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={handleCancel}
                isCentered
            >
                <AlertDialogOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(8px)" />
                <AlertDialogContent
                    bg="card.white"
                    borderRadius="24px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)"
                    animation={`${slideUp} 0.3s ease-out`}
                    overflow="hidden"
                    maxW="400px"
                    mx={4}
                >
                    <AlertDialogCloseButton
                        color="text.secondary"
                        size="md"
                        top="14px"
                        right="14px"
                        borderRadius="full"
                        _hover={{ bg: 'card.lightGray' }}
                    />

                    <AlertDialogHeader pt={8} pb={2} px={8} display="flex" flexDirection="column" alignItems="center" gap={3}>
                        <Box
                            p={3}
                            borderRadius="full"
                            bg="rgba(235,11,92,0.1)"
                            _dark={{ bg: 'rgba(235,11,92,0.2)' }}
                        >
                            <Icon as={FaExclamationTriangle} boxSize={6} color="brand.pink" />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold" color="text.primary" letterSpacing="-0.02em" textAlign="center">
                            Are you sure?
                        </Text>
                    </AlertDialogHeader>

                    <AlertDialogBody px={8} pb={2} pt={0}>
                        <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" color="text.secondary" textAlign="center" lineHeight="tall">
                                100% POSITIVE you&apos;ve checked everything?
                            </Text>

                            <HStack
                                justify="center"
                                bg="card.lightGray"
                                borderRadius="10px"
                                px={4}
                                py={2.5}
                                _dark={{ bg: 'whiteAlpha.50' }}
                            >
                                <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="brand.pink" noOfLines={1}>
                                    {pendingTable}
                                </Text>
                            </HStack>

                            <HStack
                                bg="rgba(235,11,92,0.08)"
                                _dark={{ bg: 'rgba(235,11,92,0.15)' }}
                                borderRadius="10px"
                                px={4}
                                py={3}
                                spacing={3}
                                align="start"
                            >
                                <Text fontSize="xs" color="text.secondary" lineHeight="tall">
                                    This removes the stuck settlement record so the table can resume.{' '}
                                    <Text as="span" fontWeight="bold" color="brand.pink">Only clear if you are certain.</Text>
                                </Text>
                            </HStack>
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter px={8} pb={8} pt={4} gap={3}>
                        <Button
                            ref={cancelRef}
                            onClick={handleCancel}
                            flex={1}
                            h="44px"
                            fontSize="sm"
                            fontWeight="bold"
                            borderRadius="12px"
                            bg="card.lightGray"
                            color="text.secondary"
                            border="none"
                            _hover={{ bg: 'border.lightGray', transform: 'translateY(-1px)' }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.2s ease"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            flex={1}
                            h="44px"
                            fontSize="sm"
                            fontWeight="bold"
                            borderRadius="12px"
                            bg="brand.pink"
                            color="white"
                            border="none"
                            _hover={{ bg: 'brand.pink', transform: 'translateY(-1px)', boxShadow: '0 10px 20px rgba(235,11,92,0.3)' }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.2s ease"
                        >
                            Yes, Force Clear
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
