'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePushReminders } from '@/app/hooks/usePushReminders';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    getFreeTicketPreview,
    redeemFreeEntry,
    type FreeTicketPreview,
} from '@/app/hooks/server_actions';
import WalletButton from '@/app/components/WalletButton';
import FreeClaimScreen, {
    type ClaimTerminalVariant,
    type ReminderUi,
} from './FreeClaimScreen';

// Data container for the free-entry claim page: fetches the public preview,
// reads auth + push state, and drives the redeem flow. All rendering lives in
// the pure FreeClaimScreen so every state is reviewable in Storybook.
export default function FreeClaimView({
    id,
    code,
}: {
    id: number;
    code: string;
}) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isSupported, isIOSNonPWA, requestPermission } = usePushReminders();
    const { success, error } = useToastHelper();

    const [preview, setPreview] = useState<FreeTicketPreview | null>(null);
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>(
        'loading'
    );
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    // Set when redeem fails in a way we can speak to plainly (already in / self-claim).
    const [override, setOverride] = useState<ClaimTerminalVariant | null>(null);
    const [remindMe, setRemindMe] = useState(true);

    const load = useCallback(async () => {
        setLoadState('loading');
        try {
            const p = await getFreeTicketPreview(id, code);
            setPreview(p);
            setLoadState('ok');
        } catch {
            // Network / backend failure — distinct from a genuinely invalid code.
            setLoadState('error');
        }
    }, [id, code]);

    useEffect(() => {
        load();
    }, [load]);

    const onClaim = async () => {
        setClaiming(true);
        try {
            await redeemFreeEntry(id, code);
            setClaimed(true);
            success('You’re in', 'Your free seat is locked.');
            if (remindMe && isSupported) {
                requestPermission().catch(() => {});
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message.toLowerCase() : '';
            if (/already|registered|claimed/.test(msg)) {
                setOverride('registered');
            } else if (/own|self/.test(msg)) {
                setOverride('self_claim');
            } else {
                error(
                    'Couldn’t claim',
                    e instanceof Error ? e.message : 'Please try again.'
                );
                load(); // refresh state (e.g. now full)
            }
        } finally {
            setClaiming(false);
        }
    };

    if (loadState === 'loading') {
        return (
            <Flex justify="center" align="center" minH="70vh">
                <Spinner
                    size="lg"
                    color="brand.green"
                    aria-label="Loading your free entry"
                />
            </Flex>
        );
    }

    const goToTournament = () => router.push(`/tournament/${id}`);

    // Resolve which screen to show.
    const status = claimed
        ? 'success'
        : override
          ? override
          : loadState === 'error'
            ? 'error'
            : !preview
              ? 'invalid'
              : preview.free_entry.state;

    const t = preview?.tournament;
    const tournament = t
        ? {
              name: t.name,
              status: t.status,
              scheduled_start_at: t.scheduled_start_at,
              buy_in_usdc: t.buy_in_usdc,
              guarantee_usdc: t.guarantee_usdc,
              prize_pool_usdc: t.prize_pool_usdc,
          }
        : undefined;

    const reminder: ReminderUi =
        isSupported && !isIOSNonPWA
            ? { mode: 'checkbox', checked: remindMe, onChange: setRemindMe }
            : isIOSNonPWA
              ? { mode: 'ios' }
              : { mode: 'none' };

    return (
        <FreeClaimScreen
            status={status}
            tournament={tournament}
            isAuthenticated={isAuthenticated}
            claiming={claiming}
            reminder={reminder}
            onClaim={onClaim}
            walletSlot={<WalletButton />}
            onView={goToTournament}
            onRetry={load}
        />
    );
}
