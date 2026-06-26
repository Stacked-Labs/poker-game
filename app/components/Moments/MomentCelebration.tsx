'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import {
    buildMomentOgUrl,
    buildMomentShareUrl,
    isAutoPromptMoment,
    momentCopy,
    type MomentParams,
} from '@/app/lib/moments';

// Celebratory Share-Moment prompt (Viral §5 / #358). A single, reusable, dismissable celebration
// that fires once per distinct moment. Two surfaces, picked so the prompt is always a reward and
// never an interruption:
//   • Auto-modal — only where it can't interrupt play: a completed-tournament win, and the status
//     rank-up (which surfaces on the leaderboard, not at a live table).
//   • Non-blocking Share chip — a small, dismissable affordance for the quiet moments (new tier,
//     hands milestone) AND for a deep run, which fires mid-hand at a live final table where a
//     focus-trapping modal would block gameplay. The chip opens the same share card on tap.

function origin(): string {
    return typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://stackedpoker.io';
}

function momentSignature(m: MomentParams): string {
    return [m.type, m.rank, m.tierLabel, m.hands, m.tournamentId, m.position].join(':');
}

export default function MomentCelebration({ moment }: { moment: MomentParams | null }) {
    const [active, setActive] = useState<MomentParams | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [chipOpen, setChipOpen] = useState(false);
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        if (!moment) return;
        const sig = momentSignature(moment);
        if (shownRef.current === sig) return; // already surfaced this exact moment
        shownRef.current = sig;

        setActive(moment);
        // Auto-open the full celebration only where it can't interrupt play. A deep run fires while
        // the player is still seated at a live final table, so it (and the quiet moments) gets the
        // non-blocking chip instead of a focus-trapping modal.
        if (isAutoPromptMoment(moment.type) && moment.type !== 'deeprun') {
            setIsOpen(true);
        } else {
            setChipOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moment]);

    if (!active) return null;

    const ogUrl = buildMomentOgUrl(origin(), active);
    const shareUrl = buildMomentShareUrl(origin(), active);
    const copy = momentCopy(active);
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(copy.shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(copy.shareText)}`;

    const close = () => setIsOpen(false);
    const openFromChip = () => {
        setChipOpen(false);
        setIsOpen(true);
    };

    return (
        <>
            {/* Non-blocking quiet affordance: a small, dismissable chip that never traps focus or
                covers the table — it just offers the share card on demand (deep run / tier / milestone). */}
            {chipOpen && !isOpen && (
                <Box
                    position="fixed"
                    zIndex={1400}
                    bottom={{ base: 4, md: 6 }}
                    left={{ base: 4, md: 'auto' }}
                    right={{ base: 4, md: 6 }}
                    maxW="sm"
                    bg="card.white"
                    _dark={{ bg: 'gray.800' }}
                    borderRadius="14px"
                    boxShadow="0 12px 32px rgba(0,0,0,0.22)"
                    p={3}
                >
                    <HStack spacing={3} align="center">
                        <Text fontSize="xl" aria-hidden>
                            🎉
                        </Text>
                        <VStack align="start" spacing={0} flex={1} minW={0}>
                            <Text color="text.primary" fontSize="sm" fontWeight={700} noOfLines={1}>
                                {copy.heading}
                            </Text>
                            <Text color="text.secondary" fontSize="xs" noOfLines={1}>
                                {copy.sub}
                            </Text>
                        </VStack>
                        <Button
                            size="sm"
                            height="34px"
                            borderRadius="9px"
                            fontWeight={700}
                            color="white"
                            bg="brand.green"
                            _hover={{ filter: 'brightness(0.95)' }}
                            _active={{ filter: 'brightness(0.9)' }}
                            onClick={openFromChip}
                        >
                            Share
                        </Button>
                        <IconButton
                            aria-label="Dismiss"
                            icon={<Icon as={FaTimes} boxSize="10px" />}
                            size="xs"
                            variant="ghost"
                            onClick={() => setChipOpen(false)}
                            color="text.secondary"
                            borderRadius="full"
                            _dark={{ color: 'whiteAlpha.700' }}
                        />
                    </HStack>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={close} isCentered size="md">
            <ModalOverlay backdropFilter="blur(8px)" bg="rgba(11, 20, 48, 0.65)" />
            <ModalContent
                bg="card.white"
                borderRadius="20px"
                boxShadow="0 24px 48px rgba(0,0,0,0.25)"
                _dark={{ boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
                mx={4}
                overflow="hidden"
            >
                <ModalBody p={3}>
                    <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start" px={1}>
                            <VStack align="start" spacing={0}>
                                <Text color="text.primary" fontSize="lg" fontWeight={800} letterSpacing="-0.01em">
                                    {copy.heading}
                                </Text>
                                <Text color="text.secondary" fontSize="sm">
                                    {copy.sub}
                                </Text>
                            </VStack>
                            <IconButton
                                aria-label="Close"
                                icon={<Icon as={FaTimes} boxSize="12px" />}
                                size="sm"
                                variant="ghost"
                                onClick={close}
                                color="text.secondary"
                                borderRadius="full"
                                _focusVisible={{ boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)' }}
                                _dark={{ color: 'whiteAlpha.700' }}
                            />
                        </HStack>

                        {/* The actual share card (the OG image the link will unfurl into). */}
                        <Box borderRadius="14px" overflow="hidden" bg="card.lightGray" position="relative">
                            <Image
                                src={ogUrl}
                                alt={copy.heading}
                                w="100%"
                                style={{ aspectRatio: '1200 / 630' }}
                                objectFit="cover"
                                loading="eager"
                            />
                        </Box>

                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} w="full">
                            <Button
                                as="a"
                                href={tweetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                leftIcon={<Icon as={FaXTwitter} boxSize="14px" />}
                                flex={1}
                                height="44px"
                                borderRadius="10px"
                                fontWeight={700}
                                color="white"
                                bg="#0F1419"
                                _hover={{ bg: '#000000' }}
                                _active={{ bg: '#000000' }}
                            >
                                Post on X
                            </Button>
                            <Button
                                as="a"
                                href={telegramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                leftIcon={<Icon as={FaTelegram} boxSize="14px" />}
                                flex={1}
                                height="44px"
                                borderRadius="10px"
                                fontWeight={700}
                                color="white"
                                bg="#0088CC"
                                _hover={{ bg: '#0077B5' }}
                                _active={{ bg: '#0077B5' }}
                            >
                                Send
                            </Button>
                        </Stack>

                        <Button variant="ghost" size="sm" onClick={close} color="text.secondary">
                            Maybe later
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    );
}
