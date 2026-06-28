'use client';

import React, { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { usePushReminders } from '@/app/hooks/usePushReminders';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
} from '@/app/hooks/server_actions';
import NotificationSettingsView from './NotificationSettingsView';

// Notification preferences & push controls (Viral §6 / #363). Container: wires the real subscribe +
// unsubscribe paths from usePushReminders, loads/saves per-event preferences, and reads the browser
// permission state, then hands the calm card off to the presentational view. No dark patterns — a
// real-money product earns trust by being quiet.

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
        <NotificationSettingsView
            isSupported={isSupported}
            isIOSNonPWA={isIOSNonPWA}
            permission={permission}
            pushOn={pushOn}
            remindersOn={remindersOn}
            pushBusy={pushBusy}
            savingReminders={savingReminders}
            prefsLoading={prefsLoading}
            onPushToggle={handlePushToggle}
            onRemindersToggle={handleRemindersToggle}
        />
    );
}
