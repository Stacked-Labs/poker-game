'use client';

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Box } from '@chakra-ui/react';
import type { Card as CardType, CardBackVariant } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';

type CardProps = {
    card: CardType;
    placeholder: boolean;
    folded: boolean;
    highlighted?: boolean;
    dimmed?: boolean;
    skipAnimation?: boolean; // Skip flip animation for enemy players
    onFlipStart?: () => void;
};

// Card rank mapping
const rankMap: { [key: string]: string } = {
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    T: '10',
    J: 'J',
    Q: 'Q',
    K: 'K',
    A: 'A',
};

// Suit symbols and colors - Saturated for better visibility
const suitConfigDefault = {
    C: { symbol: '♣', color: '#000000' }, // Clubs - Black
    D: { symbol: '♦', color: '#DC143C' }, // Diamonds - Crimson Red
    H: { symbol: '♥', color: '#DC143C' }, // Hearts - Crimson Red
    S: { symbol: '♠', color: '#000000' }, // Spades - Black
};

const suitConfigFourColor = {
    C: { symbol: '♣', color: '#1F8A4C' }, // Clubs - Green
    D: { symbol: '♦', color: '#1E6BD6' }, // Diamonds - Blue
    H: { symbol: '♥', color: '#DC143C' }, // Hearts - Red
    S: { symbol: '♠', color: '#000000' }, // Spades - Black
};

// (Suit paths not needed currently since we render suit symbols as text)

const cardToString = (card: CardType) => {
    if (card === '?' || card === 'placeholder') return '?';

    const c =
        typeof card === 'number' ? card : Number.parseInt(String(card), 10);
    if (Number.isNaN(c)) return '?';

    const rank = (c >> 8) & 0x0f;
    const suit = c & 0xf000;

    const numToCharRanks = [
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'T',
        'J',
        'Q',
        'K',
        'A',
    ];
    const numToCharSuits = new Map();
    numToCharSuits.set(0x8000, 'C');
    numToCharSuits.set(0x4000, 'D');
    numToCharSuits.set(0x2000, 'H');
    numToCharSuits.set(0x1000, 'S');

    const rankChar = numToCharRanks[rank];
    const suitChar = numToCharSuits.get(suit);

    if (!rankChar || !suitChar) return '?';
    return rankChar + suitChar;
};

const SVGCardFace = ({
    rank,
    suit,
    folded = false,
    highlighted = false,
    dimmed = false,
    fourColorDeckEnabled = false,
}: {
    rank: string;
    suit: string;
    folded?: boolean;
    highlighted?: boolean;
    dimmed?: boolean;
    fourColorDeckEnabled?: boolean;
}) => {
    const suitInfo =
        (fourColorDeckEnabled
            ? suitConfigFourColor[suit as keyof typeof suitConfigFourColor]
            : suitConfigDefault[suit as keyof typeof suitConfigDefault]) ??
        suitConfigDefault.S;
    const rankColor = fourColorDeckEnabled
        ? suitInfo.color
        : suit === 'D' || suit === 'H'
          ? '#DC143C'
          : '#000000';

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 32"
            style={{
                display: 'block',
                filter:
                    [
                        folded || (dimmed && !highlighted)
                            ? 'brightness(50%)'
                            : '',
                        highlighted
                            ? 'drop-shadow(0 0 3px rgba(253, 197, 29, 1)) drop-shadow(0 0 6px rgba(253, 197, 29, 0.6))'
                            : '',
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || 'none',
            }}
        >
            {/* Card background */}
            <rect
                width="24"
                height="32"
                rx="2.5"
                ry="2.5"
                fill="#FFFFFF"
                stroke={highlighted ? '#FDC51D' : '#334479'}
                strokeWidth={highlighted ? '0.75' : '0.5'}
            />

            {/* Top left rank */}
            <text
                x="2"
                y="10"
                fontSize="10"
                fontWeight="700"
                fill={rankColor}
                fontFamily="var(--font-poppins), sans-serif"
            >
                {rank}
            </text>

            {/* Large centered suit - positioned right under the rank */}
            <text
                x="12"
                y="18"
                fontSize="18"
                fill={suitInfo.color}
                fontFamily="serif"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {suitInfo.symbol}
            </text>
        </svg>
    );
};

type CardBackDesignConfig = {
    bg: string;
    overlay: string;
    border: string;
    pattern: (patternId: string) => React.ReactNode;
    logo?: React.ReactNode;
};

const cardBackDesigns: Record<CardBackVariant, CardBackDesignConfig> = {
    classic: {
        bg: '#0B1430',
        overlay: '#334479',
        border: '#334479',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
            >
                <line x1="0" y1="0" x2="4" y2="4" stroke="#36A37B" strokeWidth="0.5" opacity="0.15" />
                <line x1="4" y1="0" x2="0" y2="4" stroke="#EB0B5C" strokeWidth="0.5" opacity="0.15" />
            </pattern>
        ),
    },
    bitcoin: {
        bg: '#3D2200',
        overlay: '#5C3500',
        border: '#F7931A',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
            >
                <line x1="0" y1="0" x2="6" y2="6" stroke="#F7931A" strokeWidth="0.4" opacity="0.15" />
                <line x1="6" y1="0" x2="0" y2="6" stroke="#F7931A" strokeWidth="0.4" opacity="0.15" />
                <circle cx="3" cy="3" r="0.4" fill="#F7931A" opacity="0.18" />
                <circle cx="0" cy="0" r="0.3" fill="#F7931A" opacity="0.1" />
                <circle cx="6" cy="6" r="0.3" fill="#F7931A" opacity="0.1" />
            </pattern>
        ),
        logo: (
            <g transform="translate(6.5, 10.5) scale(0.34)" opacity="0.4">
                {/* Official Bitcoin ₿ logo — 32×32 origin */}
                <path fill="#FFF" fillRule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" />
            </g>
        ),
    },
    ethereum: {
        bg: '#222244',
        overlay: '#3A3A6E',
        border: '#627EEA',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
            >
                <path d="M3 0 L6 3 L3 6 L0 3Z" fill="none" stroke="#627EEA" strokeWidth="0.35" opacity="0.15" />
                <path d="M3 1.5 L4.5 3 L3 4.5 L1.5 3Z" fill="none" stroke="#8CA0EF" strokeWidth="0.25" opacity="0.1" />
            </pattern>
        ),
        logo: (
            <g transform="translate(6.5, 10.5) scale(0.34)" opacity="0.4">
                {/* Official Ethereum diamond logo — 32×32 origin */}
                <g fill="#FFF" fillRule="nonzero">
                    <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                    <path d="M16.498 4L9 16.22l7.498-3.35z" />
                    <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
                    <path d="M16.498 27.995v-6.028L9 17.616z" />
                    <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
                    <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
                </g>
            </g>
        ),
    },
    base: {
        bg: '#002052',
        overlay: '#003D99',
        border: '#1A6BFF',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
            >
                <circle cx="4" cy="4" r="2.5" fill="none" stroke="#3B82F6" strokeWidth="0.35" opacity="0.14" />
                <circle cx="0" cy="0" r="1.5" fill="none" stroke="#3B82F6" strokeWidth="0.25" opacity="0.1" />
                <circle cx="8" cy="0" r="1.5" fill="none" stroke="#3B82F6" strokeWidth="0.25" opacity="0.1" />
                <circle cx="0" cy="8" r="1.5" fill="none" stroke="#3B82F6" strokeWidth="0.25" opacity="0.1" />
                <circle cx="8" cy="8" r="1.5" fill="none" stroke="#3B82F6" strokeWidth="0.25" opacity="0.1" />
            </pattern>
        ),
        logo: (
            <image
                href="/networkLogos/base-logo.png"
                x="7"
                y="11"
                width="10"
                height="10"
                opacity="0.45"
            />
        ),
    },
    usdc: {
        bg: '#102D52',
        overlay: '#1D4A7A',
        border: '#2775CA',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="5"
                height="5"
            >
                <circle cx="2.5" cy="2.5" r="1.5" fill="none" stroke="#2775CA" strokeWidth="0.3" opacity="0.12" />
                <circle cx="0" cy="0" r="0.8" fill="none" stroke="#2775CA" strokeWidth="0.25" opacity="0.08" />
                <circle cx="5" cy="0" r="0.8" fill="none" stroke="#2775CA" strokeWidth="0.25" opacity="0.08" />
                <circle cx="0" cy="5" r="0.8" fill="none" stroke="#2775CA" strokeWidth="0.25" opacity="0.08" />
                <circle cx="5" cy="5" r="0.8" fill="none" stroke="#2775CA" strokeWidth="0.25" opacity="0.08" />
            </pattern>
        ),
        logo: (
            <g transform="translate(7, 11) scale(0.005)" opacity="0.4">
                {/* Official USDC logo — 2000×2000 origin, scaled to ~10×10 in card viewBox */}
                <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff" />
                <path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff" />
                <circle cx="1000" cy="1000" r="950" fill="none" stroke="#fff" strokeWidth="60" opacity="0.3" />
            </g>
        ),
    },
};

const CardBack = ({
    highlighted = false,
    dimmed = false,
    folded = false,
    variant = 'classic',
    idSuffix = '',
}: {
    highlighted?: boolean;
    dimmed?: boolean;
    folded?: boolean;
    variant?: CardBackVariant;
    idSuffix?: string;
}) => {
    const design = cardBackDesigns[variant] ?? cardBackDesigns.classic;
    const patternId = `cardTexture-${variant}${idSuffix}`;

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 32"
            style={{
                display: 'block',
                filter:
                    [
                        folded || (dimmed && !highlighted)
                            ? 'brightness(50%)'
                            : '',
                        highlighted
                            ? 'drop-shadow(0 0 3px rgba(253, 197, 29, 1)) drop-shadow(0 0 6px rgba(253, 197, 29, 0.6))'
                            : '',
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || 'none',
            }}
        >
            {/* Card background */}
            <rect
                width="24"
                height="32"
                rx="2.5"
                ry="2.5"
                fill={design.bg}
                stroke={highlighted ? '#FDC51D' : design.border}
                strokeWidth={highlighted ? '0.75' : '0.5'}
            />

            {/* Overlay for depth */}
            <rect
                x="2"
                y="2"
                width="20"
                height="28"
                rx="1.5"
                ry="1.5"
                fill={design.overlay}
                opacity="0.3"
            />

            {/* Texture pattern */}
            <defs>{design.pattern(patternId)}</defs>

            {/* Apply texture */}
            <rect
                x="2"
                y="2"
                width="20"
                height="28"
                rx="1.5"
                ry="1.5"
                fill={`url(#${patternId})`}
            />

            {/* Centered logo (crypto designs) */}
            {design.logo}

            {/* Subtle border inset */}
            <rect
                x="2.75"
                y="2.75"
                width="18.5"
                height="26.5"
                rx="1.5"
                ry="1.5"
                fill="none"
                stroke={design.border}
                strokeWidth="0.5"
                opacity="0.4"
            />
        </svg>
    );
};

const SVGCard = ({
    card,
    placeholder,
    folded,
    highlighted = false,
    dimmed = false,
    skipAnimation = false,
    onFlipStart,
}: CardProps) => {
    const { appState } = useContext(AppContext);
    const fourColorDeckEnabled = appState.fourColorDeckEnabled;
    const cardBackDesign = appState.cardBackDesign;
    const [flipState, setFlipState] = useState<'back' | 'flipping' | 'front'>(
        'back'
    );
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const prevCardStringRef = useRef<string | null>(null);
    const onFlipStartRef = useRef<CardProps['onFlipStart']>(onFlipStart);

    const cardString = useMemo(() => cardToString(card), [card]);
    const cardData = useMemo(() => {
        if (cardString === '?' || cardString.length < 2) return null;
        const rank = cardString[0];
        const suit = cardString[1];
        return { rank: rankMap[rank] || rank, suit };
    }, [cardString]);

    useEffect(() => {
        onFlipStartRef.current = onFlipStart;
    }, [onFlipStart]);

    useEffect(() => {
        // Reset and clear any queued timeouts when card/placeholder changes
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        const prevCardString = prevCardStringRef.current;
        const hasPrev = prevCardString !== null;
        const cardChanged = !hasPrev || prevCardString !== cardString;
        prevCardStringRef.current = cardString;

        if (placeholder) {
            setFlipState('back');
            return;
        }

        // If skipAnimation is true, show front immediately without animation
        // Also skip animation if the effective card value did not change (e.g. back → back)
        if (skipAnimation || (hasPrev && !cardChanged)) {
            setFlipState('front');
            return;
        }

        // Otherwise, start with back and animate
        setFlipState('back');

        const startFlip = () => {
            // Start the flip animation after 300ms
            timersRef.current.push(
                setTimeout(() => {
                    onFlipStartRef.current?.();
                    setFlipState('flipping');
                    // Switch to front face at the perfect midpoint (150ms)
                    timersRef.current.push(
                        setTimeout(() => {
                            setFlipState('front');
                        }, 150)
                    );
                }, 300)
            );
        };

        // Start flip immediately for SVG cards (no image loading needed)
        startFlip();

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [cardString, placeholder, skipAnimation]);

    if (cardString === '2\u0000') return null;

    if (card === '0') {
        return (
            <Box
                width="100%"
                sx={{ aspectRatio: '3 / 4', perspective: '1000px' }}
                position="relative"
                borderRadius="10%"
                overflow="hidden"
            >
                <Box width="100%" height="100%">
                    <CardBack
                        highlighted={highlighted}
                        dimmed={dimmed}
                        folded={folded}
                        variant={cardBackDesign}
                    />
                </Box>
            </Box>
        );
    }

    const getTransform = () => {
        switch (flipState) {
            case 'back':
                return 'scaleX(1) rotateY(0deg)';
            case 'flipping':
                return 'scaleX(0.05) rotateY(-90deg)';
            case 'front':
                return 'scaleX(1) rotateY(0deg)';
            default:
                return 'scaleX(1) rotateY(0deg)';
        }
    };

    return (
        <Box
            width="100%"
            sx={{ aspectRatio: '3 / 4', perspective: '1000px' }}
            position="relative"
            cursor={placeholder ? 'pointer' : 'default'}
            opacity={placeholder ? 0 : 1}
            borderRadius="10%"
            overflow="hidden"
            p={0}
            m={0}
            display="flex"
            alignItems="flex-start"
        >
            <Box
                width="100%"
                height="100%"
                sx={{
                    transform: getTransform(),
                    transition:
                        'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transformOrigin: 'center',
                    willChange: 'transform',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                }}
            >
                {flipState === 'front' && cardData ? (
                    <SVGCardFace
                        rank={cardData.rank}
                        suit={cardData.suit}
                        folded={folded}
                        highlighted={highlighted}
                        dimmed={dimmed}
                        fourColorDeckEnabled={fourColorDeckEnabled}
                    />
                ) : (
                    <CardBack
                        highlighted={highlighted}
                        dimmed={dimmed}
                        folded={folded}
                        variant={cardBackDesign}
                    />
                )}
            </Box>
        </Box>
    );
};

const MemoizedSVGCard = React.memo(SVGCard);
export { CardBack };
export default MemoizedSVGCard;
