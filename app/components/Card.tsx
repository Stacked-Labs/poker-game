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
                y="8"
                fontSize="9"
                fontWeight="700"
                fill={rankColor}
                fontFamily="var(--font-teko), 'Teko', sans-serif"
            >
                {rank}
            </text>

            {/* Suit under rank — centered in left column */}
            <text
                x="4.2"
                y="14"
                fontSize="7"
                fill={suitInfo.color}
                fontFamily="serif"
                textAnchor="middle"
            >
                {suitInfo.symbol}
            </text>

            {/* Large suit — centered */}
            <text
                x="13.5"
                y="20"
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
    border: string;
    pattern: (patternId: string) => React.ReactNode;
    centerpiece?: React.ReactNode;
};

// Quiet repeating motifs shared by the classic + crypto decks.
const diamondLatticePattern = (patternId: string, opacity = 0.18) => (
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="3" height="3">
        <path
            d="M1.5 0 L3 1.5 L1.5 3 L0 1.5 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.18"
            opacity={opacity}
        />
    </pattern>
);

const dotsGridPattern = (
    patternId: string,
    color = '#FFFFFF',
    opacity = 0.14
) => (
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="2" height="2">
        <circle cx="1" cy="1" r="0.22" fill={color} opacity={opacity} />
    </pattern>
);

const cardBackDesigns: Record<CardBackVariant, CardBackDesignConfig> = {
    // ── Classic poker-room decks ─────────────────────────────────────────
    'classic-red': {
        bg: '#8B1A2B',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },
    'classic-blue': {
        bg: '#1B3A6B',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },
    'classic-green': {
        bg: '#1F5C3F',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },
    'classic-black': {
        bg: '#1A1A1F',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id, '#FFFFFF', 0.18),
    },
    'classic-burgundy': {
        bg: '#5C1626',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },
    'classic-teal': {
        bg: '#0E5E6B',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },
    'classic-purple': {
        bg: '#3E1E6B',
        border: '#FFFFFF',
        pattern: (id) => diamondLatticePattern(id),
    },

    // ── Crypto network decks ─────────────────────────────────────────────
    bitcoin: {
        bg: '#F7931A',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id),
        centerpiece: (
            <g transform="translate(5.5, 9.5) scale(0.40)" opacity="0.95">
                <path
                    fill="#FFFFFF"
                    d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
                />
            </g>
        ),
    },
    ethereum: {
        bg: '#627EEA',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id),
        centerpiece: (
            <g transform="translate(5.5, 9.5) scale(0.40)" opacity="0.95">
                <g fill="#FFFFFF">
                    <path opacity="0.7" d="M16.498 4v8.87l7.497 3.35z" />
                    <path d="M16.498 4L9 16.22l7.498-3.35z" />
                    <path opacity="0.7" d="M16.498 21.968v6.027L24 17.616z" />
                    <path d="M16.498 27.995v-6.028L9 17.616z" />
                    <path opacity="0.3" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
                    <path opacity="0.7" d="M9 16.22l7.498 4.353v-7.701z" />
                </g>
            </g>
        ),
    },
    base: {
        bg: '#1A6BFF',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id),
        centerpiece: (
            // Base brand mark: white disc with a flat bottom slab.
            <g transform="translate(7, 11)" opacity="0.95">
                <circle cx="5" cy="5" r="4.6" fill="#FFFFFF" />
                <rect x="0.4" y="4.4" width="9.2" height="1.2" fill="#1A6BFF" />
            </g>
        ),
    },
    usdc: {
        bg: '#2775CA',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id),
        centerpiece: (
            <g transform="translate(7, 11)" opacity="0.95">
                <circle cx="5" cy="5" r="4.6" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
                <text
                    x="5"
                    y="5.3"
                    fontSize="6.5"
                    fontWeight="700"
                    fill="#FFFFFF"
                    fontFamily="var(--font-teko), 'Teko', sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    $
                </text>
            </g>
        ),
    },

    // ── Crypto-culture decks (illustrated) ───────────────────────────────
    pepe: {
        bg: '#1F4019',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id, '#FFFFFF', 0.10),
        centerpiece: (
            <g>
                <ellipse
                    cx="12"
                    cy="17"
                    rx="6"
                    ry="5.2"
                    fill="#84B355"
                    stroke="#1F4019"
                    strokeWidth="0.35"
                />
                <circle cx="9" cy="14.6" r="1.7" fill="#FFFFFF" stroke="#1F4019" strokeWidth="0.25" />
                <circle cx="15" cy="14.6" r="1.7" fill="#FFFFFF" stroke="#1F4019" strokeWidth="0.25" />
                <circle cx="9" cy="14.7" r="0.55" fill="#000000" />
                <circle cx="15" cy="14.7" r="0.55" fill="#000000" />
                <circle cx="11" cy="17.2" r="0.18" fill="#1F4019" />
                <circle cx="13" cy="17.2" r="0.18" fill="#1F4019" />
                <path
                    d="M 7 19 Q 12 21.6 17 19 Q 12 20 7 19 Z"
                    fill="#B85A8E"
                    stroke="#1F4019"
                    strokeWidth="0.25"
                />
                <text
                    x="20.5"
                    y="8.6"
                    fontSize="3"
                    fontWeight="800"
                    fill="#FFFFFF"
                    fontFamily="var(--font-teko), 'Teko', sans-serif"
                    textAnchor="end"
                    letterSpacing="0.05em"
                    opacity="0.85"
                >
                    GM
                </text>
            </g>
        ),
    },
    moon: {
        bg: '#0E1740',
        border: '#FFFFFF',
        pattern: (id) => dotsGridPattern(id, '#FFFFFF', 0.08),
        centerpiece: (
            <g>
                <circle cx="6" cy="8" r="0.22" fill="#FFFFFF" />
                <circle cx="18.5" cy="9" r="0.18" fill="#FFFFFF" />
                <circle cx="5.5" cy="22" r="0.20" fill="#FFFFFF" />
                <circle cx="19" cy="24.5" r="0.22" fill="#FFFFFF" />
                <circle cx="14" cy="6.5" r="0.16" fill="#FFFFFF" />
                <circle cx="16" cy="11" r="3.2" fill="#F5E9C8" />
                <circle cx="14.7" cy="10" r="2.7" fill="#0E1740" />
                <path
                    d="M 7.5 23.5 Q 11 18.5 14 13.5"
                    stroke="#FFFFFF"
                    strokeWidth="0.35"
                    fill="none"
                    opacity="0.55"
                    strokeDasharray="0.8 0.6"
                />
                <g transform="translate(8.5 22) rotate(-50)">
                    <path d="M 0 -1.7 L 0.7 0.5 L 0 1.7 L -0.7 0.5 Z" fill="#FFFFFF" />
                    <path d="M -0.7 0.4 L -1.4 1.0 L -0.6 1.4 Z" fill="#EB0B5C" />
                    <path d="M 0.7 0.4 L 1.4 1.0 L 0.6 1.4 Z" fill="#EB0B5C" />
                    <path d="M -0.5 1.7 L 0 2.8 L 0.5 1.7 Z" fill="#FDC51D" />
                </g>
            </g>
        ),
    },
    rekt: {
        bg: '#0F0F14',
        border: '#EB0B5C',
        pattern: (id) => dotsGridPattern(id, '#EB0B5C', 0.10),
        centerpiece: (
            <g>
                <path
                    d="M 12 9 Q 6.8 9 6.8 14.2 L 6.8 18.4 Q 6.8 19.4 7.8 19.4 L 9.4 19.4 L 9.4 21.4 L 10.9 21.4 L 10.9 19.6 L 13.1 19.6 L 13.1 21.4 L 14.6 21.4 L 14.6 19.4 L 16.2 19.4 Q 17.2 19.4 17.2 18.4 L 17.2 14.2 Q 17.2 9 12 9 Z"
                    fill="#FFFFFF"
                />
                <path d="M 8.4 13.2 L 10.4 15.2 M 10.4 13.2 L 8.4 15.2" stroke="#0F0F14" strokeWidth="0.45" />
                <path d="M 13.6 13.2 L 15.6 15.2 M 15.6 13.2 L 13.6 15.2" stroke="#0F0F14" strokeWidth="0.45" />
                <path d="M 12 16.2 L 11.4 17.6 L 12.6 17.6 Z" fill="#0F0F14" />
                <path d="M 12 19.6 L 12 21.4" stroke="#0F0F14" strokeWidth="0.3" />
                <text
                    x="12"
                    y="26.4"
                    fontSize="3"
                    fontWeight="800"
                    fill="#EB0B5C"
                    fontFamily="var(--font-teko), 'Teko', sans-serif"
                    textAnchor="middle"
                    letterSpacing="0.18em"
                >
                    REKT
                </text>
            </g>
        ),
    },
};

const CardBack = ({
    highlighted = false,
    dimmed = false,
    folded = false,
    variant = 'classic-blue',
    idSuffix = '',
}: {
    highlighted?: boolean;
    dimmed?: boolean;
    folded?: boolean;
    variant?: CardBackVariant;
    idSuffix?: string;
}) => {
    const design = cardBackDesigns[variant] ?? cardBackDesigns['classic-blue'];
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
            <defs>{design.pattern(patternId)}</defs>

            {/* Card body */}
            <rect
                width="24"
                height="32"
                rx="2.5"
                ry="2.5"
                fill={design.bg}
                stroke={highlighted ? '#FDC51D' : design.border}
                strokeWidth={highlighted ? '0.75' : '0.4'}
                strokeOpacity={highlighted ? 1 : 0.65}
            />

            {/* Pattern fill across the body */}
            <rect
                x="0.5"
                y="0.5"
                width="23"
                height="31"
                rx="2"
                ry="2"
                fill={`url(#${patternId})`}
            />

            {/* Centerpiece (logo / illustration) */}
            {design.centerpiece}

            {/* Double hairline border — classic poker-deck signature */}
            <rect
                x="1.6"
                y="1.6"
                width="20.8"
                height="28.8"
                rx="1.7"
                ry="1.7"
                fill="none"
                stroke={design.border}
                strokeWidth="0.3"
                opacity="0.55"
            />
            <rect
                x="2.4"
                y="2.4"
                width="19.2"
                height="27.2"
                rx="1.3"
                ry="1.3"
                fill="none"
                stroke={design.border}
                strokeWidth="0.16"
                opacity="0.35"
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
export { CardBack, SVGCardFace };
export default MemoizedSVGCard;
