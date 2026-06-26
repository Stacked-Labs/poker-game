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
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    buildMomentOgUrl,
    buildMomentShareUrl,
    isAutoPromptMoment,
    momentCopy,
    type MomentParams,
} from '@/app/lib/moments';

// Celebratory Share-Moment prompt (Viral §5 / #358). A single, reusable, dismissable celebration:
// the highest-emotion moments (won, ranked up, deep run) auto-open the modal; the quieter ones
// (new tier, hands milestone) get an unobtrusive toast with a Share action instead — a reward, never
// a nag. Pass a freshly-detected `moment` (or null); the component fires once per distinct moment.

function origin(): string {
    return typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://stackedpoker.io';
}

function momentSignature(m: MomentParams): string {
    return [m.type, m.rank, m.tierLabel, m.hands, m.tournamentId, m.position].join(':');
}

export default function MomentCelebration({ moment }: { moment: MomentParams | null }) {
    const toast = useToastHelper();
    const [active, setActive] = useState<MomentParams | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        if (!moment) return;
        const sig = momentSignature(moment);
        if (shownRef.current === sig) return; // already surfaced this exact moment
        shownRef.current = sig;

        if (isAutoPromptMoment(moment.type)) {
            setActive(moment);
            setIsOpen(true);
        } else {
            // Quiet share: a dismissable toast that opens the full card on demand.
            const copy = momentCopy(moment);
            toast.success(copy.heading, copy.sub);
            setActive(moment);
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

    return (
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
    );
}
