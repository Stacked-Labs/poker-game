'use client';

import {
    Badge,
    Box,
    Button,
    Flex,
    HStack,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import type { Tournament } from '../../hooks/server_actions';

interface TournamentCardProps {
    tournament: Tournament;
    myWallet?: string;
    onRegister: (id: number) => void;
    onUnregister: (id: number) => void;
    onStart: (id: number) => void;
    registeredIds: Set<number>;
    isLoading?: boolean;
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

function formatStartTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export default function TournamentCard({
    tournament: t,
    myWallet,
    onRegister,
    onUnregister,
    onStart,
    registeredIds,
    isLoading,
}: TournamentCardProps) {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const borderColor = useColorModeValue('rgba(11,20,48,0.08)', 'rgba(255,255,255,0.08)');
    const mutedColor = useColorModeValue('text.muted', 'text.muted');

    const isRegistered = registeredIds.has(t.id);
    const isHost = myWallet && t.host_wallet.toLowerCase() === myWallet.toLowerCase();
    const canStart = isHost && t.status === 'registration';
    const canRegister = t.status === 'registration' && !isRegistered && !isHost;
    const canUnregister = t.status === 'registration' && isRegistered && !isHost;

    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';
    const buyInLabel = t.is_free_play ? 'Free play' : `${(t.buy_in_usdc / 1_000_000).toFixed(2)} USDC`;

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
            _hover={{ borderColor: 'brand.green', transition: 'border-color 150ms ease' }}
        >
            <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="flex-start">
                    <VStack align="start" spacing={0.5} minW={0}>
                        <Text fontWeight="bold" fontSize="md" color="text.primary" noOfLines={1}>
                            {t.is_free_play ? 'Free-Play MTT' : `MTT — ${buyInLabel}`}
                        </Text>
                        <Text fontSize="xs" color={mutedColor} textTransform="capitalize">
                            {blindLabel} blinds · NLH
                        </Text>
                    </VStack>
                    <Badge
                        colorScheme={statusColor(t.status)}
                        borderRadius="full"
                        px={2}
                        py="2px"
                        fontSize="2xs"
                        textTransform="capitalize"
                        flexShrink={0}
                    >
                        {t.status}
                    </Badge>
                </HStack>

                <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                    <Text>Players</Text>
                    <Text fontWeight="semibold" color="text.primary">
                        {t.min_entries}–{t.max_entries}
                    </Text>
                </Flex>

                <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                    <Text>Starts</Text>
                    <Text fontWeight="semibold" color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatStartTime(t.scheduled_start_at)}
                    </Text>
                </Flex>

                {t.guarantee_usdc > 0 && (
                    <Flex justify="space-between" fontSize="xs" color={mutedColor}>
                        <Text>Guarantee</Text>
                        <Text fontWeight="semibold" color="brand.green">
                            ${(t.guarantee_usdc / 1_000_000).toFixed(0)} GTD
                        </Text>
                    </Flex>
                )}

                <HStack spacing={2} pt={1}>
                    {canRegister && (
                        <Button
                            size="sm"
                            colorScheme="green"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onRegister(t.id)}
                        >
                            Register
                        </Button>
                    )}
                    {canUnregister && (
                        <Button
                            size="sm"
                            variant="outline"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onUnregister(t.id)}
                        >
                            Unregister
                        </Button>
                    )}
                    {canStart && (
                        <Button
                            size="sm"
                            colorScheme="blue"
                            flex={1}
                            isLoading={isLoading}
                            onClick={() => onStart(t.id)}
                        >
                            Start tournament
                        </Button>
                    )}
                    {isRegistered && t.status === 'registration' && !isHost && (
                        <Text fontSize="xs" color="brand.green" fontWeight="semibold">
                            ✓ Registered
                        </Text>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
}
