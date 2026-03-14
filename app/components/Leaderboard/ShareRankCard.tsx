'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Text,
    VStack,
    Icon,
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
            <Button
                size="sm"
                leftIcon={<Icon as={FaShare} />}
                borderRadius="10px"
                onClick={onOpen}
                bg="card.lightGray"
                color="text.primary"
                border="1px solid"
                borderColor="rgba(12, 21, 49, 0.15)"
                fontWeight="bold"
                _hover={{ bg: 'card.lightGray', borderColor: 'brand.green', color: 'brand.green' }}
                _dark={{ bg: 'whiteAlpha.100', color: 'white', borderColor: 'whiteAlpha.200', _hover: { bg: 'whiteAlpha.200', borderColor: 'brand.green', color: 'brand.green' } }}
                transition="all 0.2s ease"
                w="full"
            >
                Share Rank
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(8px)" bg="rgba(11, 20, 48, 0.65)" />
                <ModalContent
                    bg="card.white"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="card.hero"
                    p={1}
                    mx={4}
                >
                    <ModalBody pt={1} pb={1} px={1}>
                        <VStack spacing={1} align="center">

                            {/* ── Shareable card ─────────────────────────────── */}
                            <Box
                                ref={cardRef}
                                w="100%"
                                h="210px"
                                borderRadius="8px"
                                position="relative"
                                overflow="hidden"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {/* Full-bleed background — no gradient overlay */}
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

                                {/* ── Stats pill — top-left ── */}
                                <div style={{
                                    position: 'absolute',
                                    top: 10, left: 14,
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,244,248,0.92) 100%)',
                                    borderRadius: 12,
                                    padding: '10px 14px 9px',
                                    border: '1px solid rgba(54,163,123,0.35)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 24px rgba(54,163,123,0.08)',
                                    minWidth: 118,
                                }}>
                                    {/* Points */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 7 }}>
                                        <span style={{ color: '#36A37B', fontSize: 32, fontWeight: 900, lineHeight: 1 }}>
                                            {points.toLocaleString()}
                                        </span>
                                        <span style={{ color: '#36A37B', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', opacity: 0.75 }}>
                                            PTS
                                        </span>
                                    </div>
                                    {/* Spade divider */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(54,163,123,0.4), transparent)' }} />
                                        <span style={{ fontSize: 9, color: 'rgba(54,163,123,0.6)', lineHeight: 1 }}>♠</span>
                                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(54,163,123,0.4))' }} />
                                    </div>
                                    {/* Address + domain */}
                                    <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.04em', marginBottom: 2 }}>
                                        {truncated}
                                    </div>
                                    <div style={{ color: 'rgba(0,0,0,0.35)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                        stackedpoker.io
                                    </div>
                                </div>

                                {/* ── Tier chip top-right ── */}
                                <div style={{
                                    position: 'absolute',
                                    top: 10, right: 14,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '4px 11px', borderRadius: 20,
                                    background: 'rgba(0,0,0,0.62)',
                                    border: `1.5px solid ${tier.color}`,
                                    boxShadow: `0 0 10px ${tier.color}55`,
                                }}>
                                    <Icon as={TIER_ICON[tier.name]} color={tier.color} boxSize="11px" style={{ filter: `drop-shadow(0 0 4px ${tier.color})` }} />
                                    <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', textShadow: `0 0 8px ${tier.color}` }}>{tier.label}</span>
                                </div>

                                {/* ── Rank — bottom-left, floating on image ── */}
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
                                        color: '#000000', fontSize: 13, fontWeight: 600, paddingBottom: 5,
                                        textShadow: '0 1px 3px rgba(255,255,255,0.3)',
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

                            {/* ── Action buttons ─────────────────────────────── */}
                            <HStack spacing={1} w="full" px={0}>
                                <Button
                                    leftIcon={<Icon as={FaXTwitter} />}
                                    bg="#000000"
                                    color="white"
                                    border="none"
                                    borderRadius="6px"
                                    size="sm"
                                    flex={1}
                                    fontWeight="bold"
                                    isLoading={sharing}
                                    loadingText="Sharing…"
                                    onClick={handleShareX}
                                    _dark={{ bg: '#000000', border: 'none' }}
                                    _hover={{ opacity: 0.85 }}
                                    transition="opacity 0.15s ease"
                                >
                                    Share on X
                                </Button>

                                <Button
                                    leftIcon={<Icon as={FaTelegram} />}
                                    bg="#229ED9"
                                    color="white"
                                    border="none"
                                    borderRadius="6px"
                                    size="sm"
                                    flex={1}
                                    fontWeight="bold"
                                    onClick={() => window.open(telegramUrl, '_blank', 'noopener,noreferrer')}
                                    _dark={{ bg: '#229ED9', border: 'none' }}
                                    _hover={{ opacity: 0.85 }}
                                    transition="opacity 0.15s ease"
                                >
                                    Telegram
                                </Button>

                                <Button
                                    leftIcon={<Icon as={FaDownload} />}
                                    bg="card.lightGray"
                                    color="text.primary"
                                    border="none"
                                    borderRadius="6px"
                                    size="sm"
                                    flex={1}
                                    onClick={handleDownload}
                                    _dark={{ bg: 'charcoal.600', color: 'white', border: 'none' }}
                                    _hover={{ opacity: 0.75 }}
                                    transition="opacity 0.15s ease"
                                >
                                    Download
                                </Button>
                            </HStack>

                            {desktopHint && (
                                <Text fontSize="xs" color="text.muted" textAlign="center">
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
