'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    HStack,
    Text,
    VStack,
    Icon,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import { FaShare, FaDownload, FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaXTwitter, FaTelegram, FaMedal } from 'react-icons/fa6';
import { getTier, TIER_EMOJI } from './tierUtils';
import type { IconType } from 'react-icons';

const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

interface ShareRankCardProps {
    rank: number;
    points: number;
    address: string;
    total: number;
}

// Rank suffix helper
function ordinalSuffix(n: number) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

const ShareRankCard: React.FC<ShareRankCardProps> = ({ rank, points, address, total }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cardRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = useState(false);
    const [desktopHint, setDesktopHint] = useState(false);
    const [bgSrc, setBgSrc] = useState('/video/bgplaceholder.webp');
    const [logoSrc, setLogoSrc] = useState('/IconLogo.png');

    // Preload images as base64 data URLs so html-to-image can inline them
    useEffect(() => {
        if (!isOpen) return;
        const toDataUrl = async (path: string) => {
            const res = await fetch(path);
            const blob = await res.blob();
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        };
        Promise.all([
            toDataUrl('/video/bgplaceholder.webp'),
            toDataUrl('/IconLogo.png'),
        ]).then(([bg, logo]) => {
            setBgSrc(bg);
            setLogoSrc(logo);
        });
    }, [isOpen]);

    const tier = getTier(rank, total);
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const suffix = ordinalSuffix(rank);
    const shareText = `I'm ranked #${rank} on @stacked_poker with ${points.toLocaleString()} pts! ${TIER_EMOJI[tier.name]} ${tier.label} tier. Play on-chain poker on Base. 🃏`;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('https://stackedpoker.io')}&text=${encodeURIComponent(shareText)}`;

    const captureBlob = async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
        return (await fetch(dataUrl)).blob();
    };

    const triggerDownload = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `stacked-rank-${rank}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleShareX = async () => {
        setSharing(true);
        setDesktopHint(false);
        try {
            const blob = await captureBlob();
            if (!blob) return;
            const file = new File([blob], `stacked-rank-${rank}.png`, { type: 'image/png' });

            // Mobile: native share sheet passes the image directly into X
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    text: shareText,
                });
            } else {
                // Desktop fallback: download image + open tweet composer
                triggerDownload(blob);
                window.open(tweetUrl, '_blank', 'noopener,noreferrer');
                setDesktopHint(true);
            }
        } catch (err) {
            // User cancelled share — ignore
            if (err instanceof Error && err.name !== 'AbortError') {
                // Something else went wrong — still open the tweet
                window.open(tweetUrl, '_blank', 'noopener,noreferrer');
            }
        } finally {
            setSharing(false);
        }
    };

    const handleDownload = async () => {
        const blob = await captureBlob();
        if (blob) triggerDownload(blob);
    };

    return (
        <>
            <IconButton
                aria-label="Share rank"
                icon={<Icon as={FaShare} boxSize="13px" />}
                size="xs"
                variant="unstyled"
                onClick={onOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="text.secondary"
                opacity={0.5}
                _hover={{ opacity: 1, color: 'brand.green' }}
                _dark={{ color: 'whiteAlpha.500', _hover: { opacity: 1, color: 'brand.green' } }}
                transition="all 0.2s ease"
                minW="auto"
                h="auto"
                p={1}
            />

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(8px)" bg="rgba(11, 20, 48, 0.65)" />
                <ModalContent
                    bg="card.white"
                    borderRadius="20px"
                    boxShadow="0 24px 48px rgba(0,0,0,0.25)"
                    _dark={{ boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
                    p={0}
                    mx={4}
                    overflow="hidden"
                >
                    <ModalBody p={2}>
                        <VStack spacing={0} align="center">

                            {/* ── Shareable card ─────────────────────────────── */}
                            <Box
                                ref={cardRef}
                                w="100%"
                                h="210px"
                                borderRadius="14px"
                                position="relative"
                                overflow="hidden"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {/* Full-bleed background */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={bgSrc}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center 30%',
                                    }}
                                />

                                {/* Bottom gradient for rank readability */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '50%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
                                    pointerEvents: 'none',
                                }} />

                                {/* ── Points + address — top-left, frosted pill ── */}
                                <div style={{
                                    position: 'absolute',
                                    top: 12, left: 12,
                                    background: 'rgba(0, 0, 0, 0.55)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    borderRadius: 14,
                                    padding: '10px 16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 3 }}>
                                        <span style={{
                                            color: '#fff',
                                            fontSize: 34,
                                            fontWeight: 900,
                                            lineHeight: 1,
                                            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                                        }}>
                                            {points.toLocaleString()}
                                        </span>
                                        <span style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: 10,
                                            fontWeight: 800,
                                            letterSpacing: '0.12em',
                                        }}>
                                            PTS
                                        </span>
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: 10,
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.04em',
                                    }}>
                                        ♠ {truncated}
                                    </div>
                                </div>

                                {/* ── Tier chip — top-right ── */}
                                <div style={{
                                    position: 'absolute',
                                    top: 14, right: 14,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '5px 13px', borderRadius: 20,
                                    background: 'rgba(0,0,0,0.62)',
                                    border: `1.5px solid ${tier.color}`,
                                    boxShadow: `0 0 10px ${tier.color}55`,
                                }}>
                                    <Icon as={TIER_ICON[tier.name]} color={tier.color} boxSize="12px" style={{ filter: `drop-shadow(0 0 4px ${tier.color})` }} />
                                    <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textShadow: `0 0 8px ${tier.color}` }}>{tier.label}</span>
                                </div>

                                {/* ── Rank — bottom-left ── */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 14, left: 16,
                                    display: 'flex', alignItems: 'baseline', gap: 4,
                                }}>
                                    <span style={{
                                        color: '#FDC51D', fontSize: 20, fontWeight: 900, lineHeight: 1,
                                        textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                                    }}>#</span>
                                    <span style={{
                                        color: '#FDC51D', fontSize: 54, fontWeight: 900, lineHeight: 1, letterSpacing: '-3px',
                                        textShadow: '0 2px 12px rgba(0,0,0,0.55)',
                                    }}>
                                        {rank}
                                    </span>
                                    <span style={{
                                        color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, paddingBottom: 5,
                                        textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                                    }}>
                                        {suffix} place
                                    </span>
                                </div>

                                {/* ── Logo — bottom-right ── */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 14, right: 14,
                                    display: 'flex', alignItems: 'center', gap: 7,
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={logoSrc} alt="Stacked" style={{ width: 20, height: 20, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }} />
                                    <span style={{
                                        color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                        textShadow: '0 1px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)',
                                    }}>
                                        STACKED POKER
                                    </span>
                                </div>
                            </Box>

                            {/* ── Actions — icon row ─────────────────────────── */}
                            <HStack spacing={0} w="full" pt={3} pb={1} justify="center">
                                <VStack
                                    as="button"
                                    spacing={1}
                                    flex={1}
                                    py={2}
                                    cursor="pointer"
                                    opacity={0.7}
                                    _hover={{ opacity: 1 }}
                                    transition="opacity 0.15s ease"
                                    onClick={handleShareX}
                                >
                                    <Icon as={FaXTwitter} boxSize="20px" color="text.primary" />
                                    <Text fontSize="2xs" color="text.secondary" fontWeight="medium">
                                        {sharing ? 'Sharing…' : 'Post'}
                                    </Text>
                                </VStack>

                                <Box w="1px" h="28px" bg="border.lightGray" opacity={0.5} _dark={{ opacity: 0.2 }} />

                                <VStack
                                    as="button"
                                    spacing={1}
                                    flex={1}
                                    py={2}
                                    cursor="pointer"
                                    opacity={0.7}
                                    _hover={{ opacity: 1 }}
                                    transition="opacity 0.15s ease"
                                    onClick={() => window.open(telegramUrl, '_blank', 'noopener,noreferrer')}
                                >
                                    <Icon as={FaTelegram} boxSize="20px" color="#229ED9" />
                                    <Text fontSize="2xs" color="text.secondary" fontWeight="medium">
                                        Send
                                    </Text>
                                </VStack>

                                <Box w="1px" h="28px" bg="border.lightGray" opacity={0.5} _dark={{ opacity: 0.2 }} />

                                <VStack
                                    as="button"
                                    spacing={1}
                                    flex={1}
                                    py={2}
                                    cursor="pointer"
                                    opacity={0.7}
                                    _hover={{ opacity: 1 }}
                                    transition="opacity 0.15s ease"
                                    onClick={handleDownload}
                                >
                                    <Icon as={FaDownload} boxSize="18px" color="text.secondary" />
                                    <Text fontSize="2xs" color="text.secondary" fontWeight="medium">
                                        Save
                                    </Text>
                                </VStack>
                            </HStack>

                            {desktopHint && (
                                <Text fontSize="xs" color="text.secondary" textAlign="center" pt={1}>
                                    Image downloaded — attach it to your tweet! 🃏
                                </Text>
                            )}

                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ShareRankCard;
