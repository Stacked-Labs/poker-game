'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Text,
    VStack,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { FiBell } from 'react-icons/fi';
import type { Tournament } from '../../hooks/server_actions';
import { formatTournamentStart } from '../PublicGames/tournamentFormat';
import { usePushReminders } from '../../hooks/usePushReminders';
import AddToGoogleCalendarButton from './AddToGoogleCalendarButton';
import TournamentCountdownDisplay from './TournamentCountdownDisplay';

interface RegistrationConfirmationModalProps {
    tournament: Tournament;
    isReentry?: boolean;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// The single locked "You're in." slide-up. Shown only after a registration
// success, never on page load. Hosts both reminder offers: web push as the
// loud primary, Add to calendar as an always-present quiet secondary so no
// player (including web-only iOS) is left without a way to remember the start.
export default function RegistrationConfirmationModal({
    tournament,
    isReentry = false,
    isOpen,
    onClose,
    onSuccess,
}: RegistrationConfirmationModalProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const {
        isSupported,
        isIOSNonPWA,
        permission,
        isSubscribed,
        isLoading,
        requestPermission,
    } = usePushReminders();

    const [reminderOn, setReminderOn] = useState(false);
    const [showDeniedLine, setShowDeniedLine] = useState(false);

    const handleClose = () => {
        onSuccess?.();
        onClose();
    };

    const handleTurnOn = async () => {
        const result = await requestPermission();
        if (result === 'granted') {
            setReminderOn(true);
            setShowDeniedLine(false);
        } else {
            // Denied is a quiet, non-error outcome: the calendar option still
            // covers them, so we nudge there instead of toasting a failure.
            setShowDeniedLine(true);
        }
    };

    const startLabel = formatTournamentStart(tournament.scheduled_start_at);
    const heading = isReentry ? "You're back in." : "You're in.";

    // "On" requires both permission and a live subscription. A returning player
    // whose subscription was dropped (permission still granted) drops back to
    // the "Turn on" path so they can re-subscribe instead of seeing a false
    // "Reminders are on". reminderOn covers the just-subscribed turn this session.
    const isOn = reminderOn || (permission === 'granted' && isSubscribed);
    const showPrimary = isSupported && !isOn;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            isCentered={false}
            motionPreset={prefersReducedMotion ? 'none' : 'slideInBottom'}
            aria-labelledby="reg-confirm-title"
            aria-describedby="reg-confirm-start"
        >
            <ModalOverlay bg="rgba(11, 20, 48, 0.6)" backdropFilter="blur(6px)" />
            <ModalContent
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                m={0}
                w="full"
                maxW="full"
                maxH="90vh"
                overflowY="auto"
                bg="reminder.surface"
                color="text.primary"
                borderTopWidth="1px"
                borderTopColor="reminder.border"
                borderTopRadius="16px"
                borderBottomRadius={0}
                boxShadow="card.lift"
            >
                <ModalBody px={{ base: 5, md: 6 }} pt={3} pb={{ base: 6, md: 7 }}>
                    <Box
                        w="36px"
                        h="4px"
                        borderRadius="full"
                        bg="reminder.chipBorder"
                        mx="auto"
                        mb={4}
                        aria-hidden
                    />
                    <VStack align="stretch" spacing={5} maxW="480px" mx="auto">
                        <Box>
                            <Flex align="center" gap={2.5}>
                                <Flex
                                    align="center"
                                    justify="center"
                                    boxSize={9}
                                    borderRadius="full"
                                    bg="reminder.soonBg"
                                    boxShadow="inset 0 0 0 1px rgba(54,163,123,0.35), inset 0 1px 0 rgba(255,255,255,0.22)"
                                    flexShrink={0}
                                >
                                    <Icon
                                        as={MdCheckCircle}
                                        boxSize={5}
                                        color="reminder.soonText"
                                        aria-hidden
                                    />
                                </Flex>
                                <Text
                                    id="reg-confirm-title"
                                    fontSize="2xl"
                                    fontWeight={800}
                                    letterSpacing="-0.02em"
                                    lineHeight="1.05"
                                    color="text.primary"
                                >
                                    {heading}
                                </Text>
                            </Flex>
                            <Flex
                                mt={3}
                                align="center"
                                gap={2}
                                wrap="wrap"
                            >
                                <TournamentCountdownDisplay
                                    scheduledStartAt={tournament.scheduled_start_at}
                                    lateRegCloseAt={tournament.late_reg_close_at}
                                    size="sm"
                                />
                                <Text
                                    id="reg-confirm-start"
                                    fontSize="sm"
                                    color="text.secondary"
                                >
                                    {tournament.name} · {startLabel}
                                </Text>
                            </Flex>
                        </Box>

                        {isOn ? (
                            <Flex
                                role="status"
                                aria-live="polite"
                                align="center"
                                gap={2}
                                minH="44px"
                                px={3}
                                borderRadius="12px"
                                bg="reminder.soonBg"
                            >
                                <Icon
                                    as={FiBell}
                                    boxSize={4}
                                    color="reminder.soonText"
                                    aria-hidden
                                />
                                <Text fontSize="sm" fontWeight={700} color="text.primary">
                                    Reminders are on. We will ping you before it starts.
                                </Text>
                            </Flex>
                        ) : isIOSNonPWA ? (
                            <Box>
                                <Text fontSize="sm" fontWeight={700} color="text.primary">
                                    Add Stacked to your home screen to get reminders.
                                </Text>
                                <Text mt={1} fontSize="sm" color="text.secondary">
                                    Tap Share, then Add to Home Screen. For now, put the
                                    start on your calendar below so you never miss it.
                                </Text>
                            </Box>
                        ) : showPrimary ? (
                            <Box>
                                <Button
                                    variant="tactilePrimary"
                                    w="full"
                                    minH="48px"
                                    leftIcon={<Icon as={FiBell} boxSize={4} aria-hidden />}
                                    isLoading={isLoading}
                                    loadingText="Turning on"
                                    onClick={handleTurnOn}
                                    _focusVisible={{ boxShadow: 'outline' }}
                                >
                                    Turn on reminders
                                </Button>
                                {showDeniedLine && (
                                    <Text
                                        role="status"
                                        aria-live="polite"
                                        mt={2}
                                        fontSize="sm"
                                        color="text.secondary"
                                    >
                                        Notifications are off. Add it to your calendar
                                        instead.
                                    </Text>
                                )}
                            </Box>
                        ) : (
                            <Text fontSize="sm" color="text.secondary">
                                Add the start to your calendar so you never miss it.
                            </Text>
                        )}

                        <AddToGoogleCalendarButton tournament={tournament} />

                        <Button
                            variant="tactileGhost"
                            w="full"
                            minH="44px"
                            color="text.muted"
                            fontWeight={600}
                            _hover={{ color: 'text.primary' }}
                            onClick={handleClose}
                        >
                            Done
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
