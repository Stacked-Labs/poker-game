'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Text,
    VStack,
    Icon,
    IconButton,
    Stack,
    useColorModeValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import { FaShare, FaDownload, FaGem, FaCrown, FaAward, FaBolt, FaTimes } from 'react-icons/fa';
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

// Solid tactile button tones for the share-action row.
const X_TONE = { bg: '#0F1419', bgPress: '#000000', edge: '#000000' };
const TG_TONE = { bg: '#0088CC', bgPress: '#0077B5', edge: '#006A9D' };

interface SolidShareButtonProps {
    onClick?: () => void;
    leftIcon: React.ReactElement;
    bg: string;
    bgPress: string;
    edge: string;
    color: string;
    children: React.ReactNode;
    flex?: number | string;
}

const ShareActionButton: React.FC<SolidShareButtonProps> = ({
    onClick,
    leftIcon,
    bg,
    bgPress,
    edge,
    color,
    children,
    flex,
}) => (
    <Button
        onClick={onClick}
        leftIcon={leftIcon}
        flex={flex}
        height="44px"
        borderRadius="10px"
        fontWeight={700}
        fontSize="sm"
        letterSpacing="0.02em"
        color={color}
        bg={bg}
        border="none"
        boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${edge}`}
        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
        _hover={{ bg }}
        _active={{
            bg: bgPress,
            transform: 'translateY(2px)',
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${edge}`,
        }}
    >
        {children}
    </Button>
);

interface ChromeShareButtonProps {
    onClick?: () => void;
    leftIcon: React.ReactElement;
    children: React.ReactNode;
    flex?: number | string;
}

const ChromeShareButton: React.FC<ChromeShareButtonProps> = ({
    onClick,
    leftIcon,
    children,
    flex,
}) => {
    const bg = useColorModeValue('#F2F4FA', 'rgba(255,255,255,0.06)');
    const bgHover = useColorModeValue('#E8EBF4', 'rgba(255,255,255,0.10)');
    const bgPress = useColorModeValue('#DCE0EC', 'rgba(255,255,255,0.14)');
    const edge = useColorModeValue('#C9CEDC', 'rgba(0,0,0,0.45)');
    const fg = useColorModeValue('text.primary', 'whiteAlpha.900');
    return (
        <Button
            onClick={onClick}
            leftIcon={leftIcon}
            flex={flex}
            height="44px"
            borderRadius="10px"
            fontWeight={700}
            fontSize="sm"
            letterSpacing="0.02em"
            color={fg}
            bg={bg}
            border="none"
            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${edge}`}
            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
            _hover={{ bg: bgHover }}
            _active={{
                bg: bgPress,
                transform: 'translateY(2px)',
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${edge}`,
            }}
        >
            {children}
        </Button>
    );
};

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
    const suffix = ordinalSuffix(rank);
    const shareText = `I'm ranked #${rank} on @stacked_poker with ${points.toLocaleString()} pts! ${TIER_EMOJI[tier.name]} ${tier.label} tier. Play on-chain poker on Base. 🃏`;

    // Per-rank share URL that unfurls into our preview image via Twitter Cards.
    // X's intent/tweet has no media param, so we share an empty-text tweet whose
    // URL the platform auto-expands to a summary_large_image card.
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://stackedpoker.io';
    const shareUrl = `${origin}/rank/${address}?r=${rank}&p=${points}&t=${total}`;
    const tweetUrl = `https://x.com/intent/tweet?text=&url=${encodeURIComponent(shareUrl)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

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
        // Open the tab synchronously inside the click so Safari doesn't block it;
        // the desktop branch points it at the X composer once the capture resolves.
        // The native-share branch closes it instead.
        const tab = window.open('', '_blank');
        setSharing(true);
        try {
            const blob = await captureBlob();
            if (!blob) {
                tab?.close();
                return;
            }
            const file = new File([blob], `stacked-rank-${rank}.png`, { type: 'image/png' });

            // Mobile: native share sheet passes the image directly into X (no prefilled text)
            if (navigator.canShare?.({ files: [file] })) {
                tab?.close();
                await navigator.share({ files: [file] });
            } else {
                // Desktop: X intent has no media param, so we open an empty
                // composer pointed at /rank/<address>?... which unfurls into the
                // same preview image via Twitter Cards.
                if (tab) tab.location.href = tweetUrl;
                else window.open(tweetUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (err) {
            // User cancelled share — ignore
            if (err instanceof Error && err.name !== 'AbortError') {
                // Something else went wrong — still open the tweet
                if (tab) tab.location.href = tweetUrl;
                else window.open(tweetUrl, '_blank', 'noopener,noreferrer');
            } else {
                tab?.close();
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
                icon={<Icon as={FaShare} boxSize="14px" />}
                size="xs"
                variant="unstyled"
                onClick={onOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="text.secondary"
                opacity={0.6}
                bg="transparent"
                border="none"
                borderRadius="full"
                _hover={{ opacity: 1, color: 'brand.green' }}
                _focus={{ boxShadow: 'none' }}
                _focusVisible={{
                    boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)',
                }}
                _dark={{
                    color: 'whiteAlpha.600',
                    _hover: { opacity: 1, color: 'brand.green' },
                }}
                transition="opacity 80ms ease, color 80ms ease"
                minW="auto"
                h="auto"
                p={1.5}
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
                    <ModalBody p={3}>
                        <VStack spacing={3} align="stretch">

                            {/* ── Title row ───────────────────────────────────── */}
                            <HStack justify="space-between" align="center" w="full" px={1}>
                                <Text
                                    color="text.primary"
                                    fontSize="md"
                                    fontWeight={700}
                                    letterSpacing="-0.01em"
                                >
                                    Share your rank
                                </Text>
                                <IconButton
                                    aria-label="Close"
                                    icon={<Icon as={FaTimes} boxSize="12px" />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={onClose}
                                    bg="transparent"
                                    border="none"
                                    color="text.secondary"
                                    borderRadius="full"
                                    _focus={{ boxShadow: 'none' }}
                                    _focusVisible={{
                                        boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)',
                                    }}
                                    _hover={{
                                        bg: 'card.lightGray',
                                        color: 'text.primary',
                                    }}
                                    _dark={{
                                        color: 'whiteAlpha.700',
                                        _hover: {
                                            bg: 'rgba(255,255,255,0.08)',
                                            color: 'whiteAlpha.900',
                                        },
                                    }}
                                />
                            </HStack>

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

                            {/* ── Actions — tactile chip row ──────────────────── */}
                            <Stack
                                direction={{ base: 'column', sm: 'row' }}
                                spacing={2}
                                w="full"
                            >
                                <ShareActionButton
                                    onClick={handleShareX}
                                    leftIcon={<Icon as={FaXTwitter} boxSize="14px" />}
                                    bg={X_TONE.bg}
                                    bgPress={X_TONE.bgPress}
                                    edge={X_TONE.edge}
                                    color="white"
                                    flex={1}
                                >
                                    {sharing ? 'Sharing…' : 'Post on X'}
                                </ShareActionButton>
                                <ShareActionButton
                                    onClick={() => window.open(telegramUrl, '_blank', 'noopener,noreferrer')}
                                    leftIcon={<Icon as={FaTelegram} boxSize="14px" />}
                                    bg={TG_TONE.bg}
                                    bgPress={TG_TONE.bgPress}
                                    edge={TG_TONE.edge}
                                    color="white"
                                    flex={1}
                                >
                                    Send
                                </ShareActionButton>
                                <ChromeShareButton
                                    onClick={handleDownload}
                                    leftIcon={<Icon as={FaDownload} boxSize="13px" />}
                                    flex={1}
                                >
                                    Save image
                                </ChromeShareButton>
                            </Stack>

                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ShareRankCard;
