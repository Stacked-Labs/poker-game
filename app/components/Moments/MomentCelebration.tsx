'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Skeleton,
    Stack,
    Text,
    usePrefersReducedMotion,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaTimes, FaStar } from 'react-icons/fa';
import { SocialIconButton } from '@/app/components/SocialIconButton';
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

// Arrival on the settle curve (DESIGN.md §5): a short rise + fade, no overshoot.
const chipIn = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

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
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const shownRef = useRef<string | null>(null);
    const reduceMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!moment) return;
        const sig = momentSignature(moment);
        if (shownRef.current === sig) return; // already surfaced this exact moment
        shownRef.current = sig;

        setActive(moment);
        setImgLoaded(false);
        setImgError(false);
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
                    border="1px solid"
                    borderColor="border.felt"
                    borderRadius="14px"
                    boxShadow="card.lift"
                    p={3}
                    animation={reduceMotion ? undefined : `${chipIn} 220ms cubic-bezier(0.16, 1, 0.3, 1)`}
                >
                    <HStack spacing={3} align="center">
                        <Icon
                            as={FaStar}
                            color="brand.yellowDark"
                            _dark={{ color: 'brand.yellow' }}
                            boxSize="20px"
                            flexShrink={0}
                            aria-hidden
                        />
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
                            variant="tactilePrimary"
                            onClick={openFromChip}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                        >
                            Share
                        </Button>
                        <IconButton
                            aria-label="Dismiss"
                            icon={<Icon as={FaTimes} boxSize="10px" />}
                            size="xs"
                            variant="tactileGhost"
                            onClick={() => setChipOpen(false)}
                            borderRadius="full"
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                        />
                    </HStack>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={close} isCentered size="md">
            <ModalOverlay backdropFilter="blur(8px)" bg="rgba(11, 20, 48, 0.65)" />
            <ModalContent
                bg="card.white"
                borderRadius="20px"
                boxShadow="card.lift"
                mx={4}
                overflow="hidden"
            >
                <ModalBody p={3}>
                    <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start" px={1}>
                            <VStack align="start" spacing={0}>
                                <Text color="text.primary" fontSize={{ base: 'xl', sm: '2xl' }} fontWeight={800} letterSpacing="-0.01em">
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
                                variant="tactileGhost"
                                onClick={close}
                                borderRadius="full"
                                _focusVisible={{ boxShadow: 'focus.ring' }}
                            />
                        </HStack>

                        {/* The actual share card (the OG image the link will unfurl into). */}
                        <Box
                            borderRadius="14px"
                            overflow="hidden"
                            bg="card.lightGray"
                            position="relative"
                            style={{ aspectRatio: '1200 / 630' }}
                        >
                            {!imgLoaded && !imgError && (
                                <Skeleton
                                    position="absolute"
                                    inset={0}
                                    startColor="card.lightGray"
                                    endColor="border.felt"
                                />
                            )}
                            {imgError ? (
                                <VStack position="absolute" inset={0} justify="center" spacing={2} px={4}>
                                    <Icon
                                        as={FaStar}
                                        color="brand.yellowDark"
                                        _dark={{ color: 'brand.yellow' }}
                                        boxSize="28px"
                                        aria-hidden
                                    />
                                    <Text color="text.primary" fontWeight={700} fontSize="md" textAlign="center" noOfLines={2}>
                                        {copy.heading}
                                    </Text>
                                </VStack>
                            ) : (
                                <Image
                                    src={ogUrl}
                                    alt={copy.heading}
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                    loading="eager"
                                    opacity={imgLoaded ? 1 : 0}
                                    transition="opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)"
                                    onLoad={() => setImgLoaded(true)}
                                    onError={() => setImgError(true)}
                                />
                            )}
                        </Box>

                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} w="full">
                            <Link href={tweetUrl} isExternal flex={1} _hover={{ textDecoration: 'none' }}>
                                <SocialIconButton
                                    tone="x"
                                    label="Post on X"
                                    w="full"
                                    height="44px"
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                />
                            </Link>
                            <Link href={telegramUrl} isExternal flex={1} _hover={{ textDecoration: 'none' }}>
                                <SocialIconButton
                                    tone="telegram"
                                    label="Send"
                                    w="full"
                                    height="44px"
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                />
                            </Link>
                        </Stack>

                        <Button variant="tactileGhost" size="sm" onClick={close} _focusVisible={{ boxShadow: 'focus.ring' }}>
                            Maybe later
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    );
}
