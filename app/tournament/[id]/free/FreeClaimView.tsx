'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Container,
    Flex,
    HStack,
    VStack,
    Text,
    Heading,
    Spinner,
    Checkbox,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { FiGift, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePushReminders } from '@/app/hooks/usePushReminders';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    getFreeTicketPreview,
    redeemFreeEntry,
    type FreeTicketPreview,
} from '@/app/hooks/server_actions';
import WalletButton from '@/app/components/WalletButton';

function usdc(base?: number | null): string {
    return ((base ?? 0) / 1_000_000).toLocaleString('en-US', {
        maximumFractionDigits: 0,
    });
}

function formatStart(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const STATE_COPY: Record<string, { title: string; body: string }> = {
    full: {
        title: 'This event is full',
        body: 'Every free seat has been claimed. Keep an eye out for the next drop.',
    },
    started: {
        title: 'Registration has closed',
        body: 'This event has already started — free entry is no longer available.',
    },
    used: {
        title: 'This invite was already used',
        body: 'Each bring-a-friend code works once. Ask your host for the public link.',
    },
    invalid: {
        title: 'This code isn’t valid',
        body: 'Double-check the link, or ask whoever shared it for a fresh one.',
    },
    disabled: {
        title: 'No free entry here',
        body: 'This event isn’t offering free tickets.',
    },
};

export default function FreeClaimView({ id, code }: { id: number; code: string }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isSupported, requestPermission } = usePushReminders();
    const { success, error } = useToastHelper();

    const [preview, setPreview] = useState<FreeTicketPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [remindMe, setRemindMe] = useState(true);

    const load = useCallback(async () => {
        const p = await getFreeTicketPreview(id, code);
        setPreview(p);
        setLoading(false);
    }, [id, code]);

    useEffect(() => {
        load();
    }, [load]);

    const onClaim = async () => {
        setClaiming(true);
        try {
            await redeemFreeEntry(id, code);
            setClaimed(true);
            success('You’re in!', 'Your free seat is locked.');
            if (remindMe && isSupported) {
                requestPermission().catch(() => {});
            }
        } catch (e) {
            // The backend returns a friendly message (full / already-claimed / self-claim / …).
            error('Couldn’t claim', e instanceof Error ? e.message : 'Please try again.');
            load(); // refresh state (e.g. now full)
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="70vh">
                <Spinner size="lg" color="brand.green" />
            </Flex>
        );
    }

    const t = preview?.tournament;
    const state = preview?.free_entry.state ?? 'invalid';
    const pool = t ? Math.max(t.prize_pool_usdc ?? 0, t.guarantee_usdc ?? 0) : 0;

    // Terminal/unavailable states.
    if (!preview || (state !== 'available' && !claimed)) {
        const copy = STATE_COPY[state] ?? STATE_COPY.invalid;
        return (
            <Container maxW="container.sm" py={16}>
                <VStack spacing={4} textAlign="center">
                    <Text fontSize="5xl">🎟</Text>
                    <Heading size="md" color="text.primary">
                        {copy.title}
                    </Heading>
                    <Text color="text.secondary">{copy.body}</Text>
                    {t && (
                        <Button variant="outline" onClick={() => router.push(`/tournament/${id}`)}>
                            View {t.name}
                        </Button>
                    )}
                </VStack>
            </Container>
        );
    }

    // Success state.
    if (claimed) {
        return (
            <Container maxW="container.sm" py={16}>
                <VStack spacing={5} textAlign="center">
                    <Icon as={FiCheckCircle} boxSize={14} color="brand.green" />
                    <Heading size="lg" color="text.primary">
                        You’re in, free of charge
                    </Heading>
                    <Text color="text.secondary">
                        Your seat in <b>{t?.name}</b> is locked. We’ll see you at the felt.
                    </Text>
                    <Button
                        size="lg"
                        colorScheme="green"
                        onClick={() => router.push(`/tournament/${id}`)}
                    >
                        Go to the tournament
                    </Button>
                </VStack>
            </Container>
        );
    }

    // Available — the pre-sign-in / claim surface.
    return (
        <Container maxW="container.sm" py={{ base: 8, md: 14 }}>
            <VStack spacing={6} align="stretch">
                <VStack spacing={2} textAlign="center">
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                        <HStack spacing={1.5}>
                            <Icon as={FiGift} />
                            <Text>Free entry applied</Text>
                        </HStack>
                    </Badge>
                    <Heading size="lg" color="text.primary">
                        {t?.name}
                    </Heading>
                    {t?.scheduled_start_at && (
                        <HStack color="text.secondary" fontSize="sm">
                            <Icon as={FiClock} />
                            <Text>{formatStart(t.scheduled_start_at)}</Text>
                        </HStack>
                    )}
                </VStack>

                {/* Prize pool — the hook */}
                <Box
                    borderRadius="2xl"
                    p={6}
                    textAlign="center"
                    bgGradient="linear(to-br, brand.green, brand.darkNavy)"
                    color="white"
                >
                    <Text fontSize="xs" letterSpacing="widest" opacity={0.85}>
                        PRIZE POOL
                    </Text>
                    <Heading size="2xl">${usdc(pool)}</Heading>
                    <Text mt={1} fontSize="sm" opacity={0.9}>
                        Your first bullet is on the house — no buy-in.
                    </Text>
                </Box>

                {/* Re-buy clarity */}
                <Text fontSize="sm" color="text.secondary" textAlign="center">
                    Heads up: if you bust and want back in, a re-buy is a real USDC buy-in.
                    Free entry covers your first bullet only.
                </Text>

                {/* Reminder opt-out (default ON) */}
                {isSupported && (
                    <Checkbox
                        isChecked={remindMe}
                        onChange={(e) => setRemindMe(e.target.checked)}
                        colorScheme="green"
                        alignSelf="center"
                    >
                        Remind me before it starts
                    </Checkbox>
                )}

                {/* CTA */}
                {isAuthenticated ? (
                    <Button
                        size="lg"
                        colorScheme="green"
                        onClick={onClaim}
                        isLoading={claiming}
                        loadingText="Locking your seat…"
                    >
                        Lock my free seat
                    </Button>
                ) : (
                    <VStack spacing={2}>
                        <Text fontSize="sm" color="text.secondary">
                            One tap to sign in and lock your seat.
                        </Text>
                        <WalletButton />
                    </VStack>
                )}
            </VStack>
        </Container>
    );
}
