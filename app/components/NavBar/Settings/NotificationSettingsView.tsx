'use client';

import React from 'react';
import { Box, HStack, VStack, Text, Switch, Icon, Spinner } from '@chakra-ui/react';
import { FiInfo, FiSmartphone } from 'react-icons/fi';

// Presentational notification preferences (Viral §6 / #363). Pure render — the container owns the
// push subscription + saved-preference state. The parent Settings tab supplies the section header,
// so this is just the calm card of controls (the in-game Settings modal is transparent+blur, so the
// card must carry its own opaque surface).

function Hint({ icon, children }: { icon: typeof FiInfo; children: React.ReactNode }) {
    return (
        <HStack spacing={2} align="start" bg="bg.pillNeutral" borderRadius="10px" px={3} py={2}>
            <Icon as={icon} color="text.secondary" boxSize="14px" mt="2px" flexShrink={0} aria-hidden />
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
        <HStack justify="space-between" align="center" spacing={3} opacity={isDisabled ? 0.55 : 1}>
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

export interface NotificationSettingsViewProps {
    isSupported: boolean;
    isIOSNonPWA: boolean;
    permission: NotificationPermission;
    pushOn: boolean;
    remindersOn: boolean;
    pushBusy: boolean;
    savingReminders: boolean;
    prefsLoading: boolean;
    onPushToggle: (next: boolean) => void;
    onRemindersToggle: (next: boolean) => void;
}

export default function NotificationSettingsView({
    isSupported,
    isIOSNonPWA,
    permission,
    pushOn,
    remindersOn,
    pushBusy,
    savingReminders,
    prefsLoading,
    onPushToggle,
    onRemindersToggle,
}: NotificationSettingsViewProps) {
    const blockedByBrowser = !isSupported || isIOSNonPWA || permission === 'denied';

    return (
        <VStack spacing={2} align="stretch">
            {!isSupported && (
                <Hint icon={FiInfo}>This browser doesn’t support push notifications.</Hint>
            )}
            {isSupported && isIOSNonPWA && (
                <Hint icon={FiSmartphone}>
                    On iPhone &amp; iPad, add Stacked to your home screen to enable notifications. Tap
                    Share, then “Add to Home Screen”.
                </Hint>
            )}
            {isSupported && !isIOSNonPWA && permission === 'denied' && (
                <Hint icon={FiInfo}>
                    Notifications are blocked in your browser settings. Re-enable them there to turn
                    these on.
                </Hint>
            )}

            <Box
                bg="card.white"
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="card.lift"
            >
                <VStack spacing={3} align="stretch">
                    <Row
                        title="Push notifications"
                        desc="Turn on to let Stacked send you the alerts you pick below."
                        isChecked={pushOn}
                        isDisabled={blockedByBrowser}
                        isBusy={pushBusy}
                        onChange={onPushToggle}
                        testId="toggle-push"
                    />
                    <Box h="1px" bg="border.lightGray" />
                    <Row
                        title="Tournament reminders"
                        desc="A heads-up before a tournament you’ve registered for starts."
                        isChecked={pushOn && remindersOn}
                        isDisabled={blockedByBrowser || !pushOn || prefsLoading}
                        isBusy={savingReminders}
                        onChange={onRemindersToggle}
                        testId="toggle-tournament-reminders"
                    />
                </VStack>
            </Box>

            <Text fontSize="2xs" color="text.secondary">
                We’ll only ping you about what you choose here, nothing else.
            </Text>
        </VStack>
    );
}
