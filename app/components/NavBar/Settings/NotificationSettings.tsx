'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Switch,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import { FiBell, FiInfo, FiSmartphone } from 'react-icons/fi';
import { useActiveAccount } from 'thirdweb/react';
import { usePushReminders } from '@/app/hooks/usePushReminders';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
} from '@/app/hooks/server_actions';

// Notification preferences & push controls (Viral §6 / #363). The one place a user controls
// notifications: enable/disable push (wires the real subscribe + unsubscribe paths from
// usePushReminders), toggle per-event delivery (tournament reminders today), and an honest read of
// the browser's permission state + the iOS-PWA constraint. Calm copy, no dark patterns — a
// real-money product earns trust by being quiet.

function Hint({ icon, children }: { icon: typeof FiInfo; children: React.ReactNode }) {
    return (
        <HStack
            spacing={2}
            align="start"
            bg="card.lightGray"
            _dark={{ bg: 'rgba(255,255,255,0.04)' }}
            borderRadius="10px"
            px={3}
            py={2}
        >
            <Icon as={icon} color="text.secondary" boxSize="14px" mt="2px" flexShrink={0} />
            <Text fontSize="xs" color="text.secondary">
                {children}
            </Text>
        </HStack>
    );
}

function Row({
    title,
    desc,
    isChecked,
    isDisabled,
    isBusy,
    onChange,
    testId,
}: {
    title: string;
    desc: string;
    isChecked: boolean;
    isDisabled?: boolean;
    isBusy?: boolean;
    onChange: (next: boolean) => void;
    testId?: string;
}) {
    return (
        <HStack justify="space-between" align="center" spacing={3} opacity={isDisabled ? 0.5 : 1}>
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text fontSize="sm" fontWeight={600} color="text.primary">
                    {title}
                </Text>
                <Text fontSize="xs" color="text.secondary">
                    {desc}
                </Text>
            </VStack>
            {isBusy ? (
                <Spinner size="sm" color="brand.green" />
            ) : (
                <Switch
                    colorScheme="green"
                    isChecked={isChecked}
                    isDisabled={isDisabled}
                    onChange={(e) => onChange(e.target.checked)}
                    data-testid={testId}
                />
            )}
        </HStack>
    );
}

export default function NotificationSettings() {
    const account = useActiveAccount();
    const toast = useToastHelper();
    const {
        isSupported,
        isIOSNonPWA,
        permission,
        isSubscribed,
        isLoading: pushBusy,
        requestPermission,
        unsubscribe,
    } = usePushReminders();

    const [remindersOn, setRemindersOn] = useState(true);
    const [pushPref, setPushPref] = useState(true);
    const [prefsLoading, setPrefsLoading] = useState(false);
    const [savingReminders, setSavingReminders] = useState(false);

    useEffect(() => {
        if (!account?.address) return;
        let cancelled = false;
        setPrefsLoading(true);
        getNotificationPreferences()
            .then((p) => {
                if (cancelled) return;
                setPushPref(p.push_enabled);
                setRemindersOn(p.events?.tournament_reminders ?? true);
            })
            .finally(() => {
                if (!cancelled) setPrefsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [account?.address]);

    const blockedByBrowser = !isSupported || isIOSNonPWA || permission === 'denied';
    // "Push on" = the browser is subscribed AND the user hasn't turned the global pref off.
    const pushOn = isSubscribed && pushPref;

    const handlePushToggle = async (next: boolean) => {
        if (next) {
            const result = await requestPermission();
            if (result !== 'granted') {
                toast.error('Notifications not enabled', 'Your browser declined the permission.');
                return;
            }
            await updateNotificationPreferences({ push_enabled: true });
            setPushPref(true);
            toast.success('Notifications on', "We'll only ping you about what you choose below.");
        } else {
            await unsubscribe();
            await updateNotificationPreferences({ push_enabled: false });
            setPushPref(false);
            toast.success('Notifications off', "You won't receive any push notifications.");
        }
    };

    const handleRemindersToggle = async (next: boolean) => {
        setRemindersOn(next); // optimistic
        setSavingReminders(true);
        const res = await updateNotificationPreferences({ events: { tournament_reminders: next } });
        setSavingReminders(false);
        if (!res) {
            setRemindersOn(!next); // revert
            toast.error('Could not save', 'Please try again.');
        }
    };

    return (
        <VStack spacing={3} align="stretch">
            <HStack spacing={2} align="center">
                <Icon as={FiBell} color="brand.green" boxSize={4} />
                <Text fontSize="sm" fontWeight={700} color="text.primary">
                    Notifications
                </Text>
            </HStack>

            {!isSupported && (
                <Hint icon={FiInfo}>This browser doesn’t support push notifications.</Hint>
            )}
            {isSupported && isIOSNonPWA && (
                <Hint icon={FiSmartphone}>
                    On iPhone &amp; iPad, add Stacked to your home screen first — tap Share, then “Add
                    to Home Screen” — to turn on notifications.
                </Hint>
            )}
            {isSupported && !isIOSNonPWA && permission === 'denied' && (
                <Hint icon={FiInfo}>
                    Notifications are blocked in your browser settings. Re-enable them there to turn
                    these on.
                </Hint>
            )}

            <Box
                borderWidth="1px"
                borderColor="border.lightGray"
                _dark={{ borderColor: 'rgba(255,255,255,0.12)' }}
                borderRadius="12px"
                p={3}
            >
                <VStack spacing={3} align="stretch">
                    <Row
                        title="Push notifications"
                        desc="Turn on to let Stacked send you the alerts you pick below."
                        isChecked={pushOn}
                        isDisabled={blockedByBrowser}
                        isBusy={pushBusy}
                        onChange={handlePushToggle}
                        testId="toggle-push"
                    />
                    <Box h="1px" bg="border.lightGray" _dark={{ bg: 'rgba(255,255,255,0.08)' }} />
                    <Row
                        title="Tournament reminders"
                        desc="A heads-up before a tournament you’ve registered for starts."
                        isChecked={pushOn && remindersOn}
                        isDisabled={blockedByBrowser || !pushOn || prefsLoading}
                        isBusy={savingReminders}
                        onChange={handleRemindersToggle}
                        testId="toggle-tournament-reminders"
                    />
                </VStack>
            </Box>

            <Text fontSize="2xs" color="text.secondary">
                We’ll only ping you about what you choose here — nothing else.
            </Text>
        </VStack>
    );
}
