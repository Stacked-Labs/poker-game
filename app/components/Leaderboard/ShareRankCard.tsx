'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    Icon,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import { FaShare, FaTwitter, FaDownload } from 'react-icons/fa';
import { getTier, TIER_EMOJI } from './tierUtils';

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
    const tweetText = `I'm ranked #${rank} on @stacked_poker with ${points.toLocaleString()} pts! ${TIER_EMOJI[tier.name]} ${tier.label} tier. Play on-chain poker on Base. 🃏`;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

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
                    text: tweetText,
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
                variant="outline"
                leftIcon={<Icon as={FaShare} />}
                borderColor="border.lightGray"
                color="text.secondary"
                borderRadius="10px"
                fontWeight="medium"
                onClick={onOpen}
                _hover={{ borderColor: 'brand.green', color: 'brand.green' }}
                transition="all 0.2s ease"
                w="full"
            >
                Share Rank
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(8px)" bg="rgba(11, 20, 48, 0.7)" />
                <ModalContent
                    bg="card.white"
                    borderRadius="24px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="0 32px 64px rgba(12, 21, 49, 0.2)"
                    p={5}
                >
                    <ModalCloseButton color="text.secondary" top={4} right={4} />
                    <ModalBody pt={6} pb={4} px={0}>
                        <VStack spacing={5}>

                            {/* ── Shareable card ─────────────────────────────── */}
                            <Box
                                ref={cardRef}
                                w="400px"
                                h="224px"
                                borderRadius="18px"
                                position="relative"
                                overflow="hidden"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {/* Poker-table background */}
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
                                        objectPosition: 'center 35%',
                                    }}
                                />

                                {/* Dark gradient vignette for readability */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(135deg, rgba(11,20,48,0.90) 0%, rgba(11,20,48,0.55) 55%, rgba(11,20,48,0.80) 100%)',
                                }} />

                                {/* Green glow bottom-left */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: -20,
                                    left: -20,
                                    width: 160,
                                    height: 160,
                                    borderRadius: '50%',
                                    background: 'rgba(54, 163, 123, 0.30)',
                                    filter: 'blur(50px)',
                                }} />

                                {/* Pink glow top-right */}
                                <div style={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: 'rgba(235, 11, 92, 0.18)',
                                    filter: 'blur(40px)',
                                }} />

                                {/* ── Content layer ── */}
                                <div style={{ position: 'relative', height: '100%', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                                    {/* Top row: logo + tier */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {/* Logo + wordmark */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={logoSrc}
                                                alt="Stacked"
                                                style={{ width: 28, height: 28, objectFit: 'contain' }}
                                            />
                                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
                                                STACKED POKER
                                            </span>
                                        </div>

                                        {/* Tier chip */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '4px 10px',
                                            borderRadius: 20,
                                            background: `${tier.color}22`,
                                            border: `1px solid ${tier.color}66`,
                                        }}>
                                            <span style={{ fontSize: 14 }}>{TIER_EMOJI[tier.name]}</span>
                                            <span style={{ color: tier.color, fontSize: 12, fontWeight: 700 }}>
                                                {tier.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle: big rank */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                                        <span style={{ color: 'white', fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: '-2px' }}>
                                            #{rank}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                                            {suffix} place
                                        </span>
                                    </div>

                                    {/* Bottom row: points + address + url */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <div style={{ color: '#36A37B', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                                                {points.toLocaleString()} pts
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3, fontFamily: 'monospace' }}>
                                                {truncated}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.05em' }}>
                                                stackedpoker.io
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 1 }}>
                                                Base Testnet
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Box>

                            {/* ── Action buttons ─────────────────────────────── */}
                            <VStack spacing={2} w="full" px={1}>
                                <Button
                                    leftIcon={<Icon as={FaTwitter} />}
                                    bg="#000000"
                                    color="white"
                                    borderRadius="12px"
                                    w="full"
                                    fontWeight="bold"
                                    isLoading={sharing}
                                    loadingText="Preparing…"
                                    onClick={handleShareX}
                                    _hover={{ bg: '#1a1a1a', transform: 'translateY(-1px)' }}
                                    transition="all 0.2s ease"
                                >
                                    Share on X
                                </Button>

                                {/* Desktop hint — shown after fallback triggers */}
                                {desktopHint && (
                                    <Text fontSize="xs" color="text.secondary" textAlign="center" px={2}>
                                        Image downloaded — attach it to your tweet! 🃏
                                    </Text>
                                )}

                                <Button
                                    leftIcon={<Icon as={FaDownload} />}
                                    variant="outline"
                                    borderColor="border.lightGray"
                                    color="text.secondary"
                                    borderRadius="12px"
                                    w="full"
                                    fontSize="sm"
                                    onClick={handleDownload}
                                    _hover={{ borderColor: 'brand.navy', color: 'brand.navy' }}
                                    transition="all 0.2s ease"
                                >
                                    Download Image
                                </Button>
                            </VStack>

                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ShareRankCard;
