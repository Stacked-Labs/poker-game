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
    ruby: {
        bg: '#2D0A1B',
        overlay: '#5C1A3A',
        border: '#5C1A3A',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
            >
                <rect x="3" y="0" width="3" height="3" fill="none" stroke="#D4A843" strokeWidth="0.4" opacity="0.2" transform="rotate(45, 4.5, 1.5)" />
                <rect x="0" y="3" width="3" height="3" fill="none" stroke="#D4A843" strokeWidth="0.4" opacity="0.2" transform="rotate(45, 1.5, 4.5)" />
            </pattern>
        ),
    },
    emerald: {
        bg: '#0A2A1B',
        overlay: '#1A4D35',
        border: '#1A4D35',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
            >
                <rect x="1" y="1" width="6" height="6" rx="1.5" ry="1.5" fill="none" stroke="#2DD4A8" strokeWidth="0.4" opacity="0.18" />
                <rect x="2.5" y="2.5" width="3" height="3" rx="0.75" ry="0.75" fill="none" stroke="#2DD4A8" strokeWidth="0.3" opacity="0.12" />
            </pattern>
        ),
    },
    midnight: {
        bg: '#12121E',
        overlay: '#2A2A3E',
        border: '#2A2A3E',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
            >
                <circle cx="2" cy="2" r="0.5" fill="#C0C0C0" opacity="0.15" />
            </pattern>
        ),
    },
    royal: {
        bg: '#1A0A2E',
        overlay: '#3A1A5E',
        border: '#3A1A5E',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
            >
                <line x1="3" y1="0" x2="3" y2="6" stroke="#D4A843" strokeWidth="0.3" opacity="0.15" />
                <line x1="0" y1="3" x2="6" y2="3" stroke="#D4A843" strokeWidth="0.3" opacity="0.15" />
                <circle cx="3" cy="3" r="1" fill="none" stroke="#D4A843" strokeWidth="0.4" opacity="0.18" />
            </pattern>
        ),
    },
    ocean: {
        bg: '#0A1A2E',
        overlay: '#153050',
        border: '#153050',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="8"
                height="4"
            >
                <path d="M0 2 Q2 0 4 2 Q6 4 8 2" fill="none" stroke="#38BDF8" strokeWidth="0.4" opacity="0.18" />
            </pattern>
        ),
    },
    amber: {
        bg: '#2A1A0A',
        overlay: '#4D3220',
        border: '#4D3220',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
            >
                <circle cx="3" cy="3" r="2" fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.18" />
                <circle cx="0" cy="0" r="2" fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.18" />
                <circle cx="6" cy="0" r="2" fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.18" />
                <circle cx="0" cy="6" r="2" fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.18" />
                <circle cx="6" cy="6" r="2" fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.18" />
            </pattern>
        ),
    },
    gold: {
        bg: '#2E2A0A',
        overlay: '#504A1A',
        border: '#504A1A',
        pattern: (patternId) => (
            <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width="5"
                height="5"
            >
                <line x1="0" y1="0" x2="5" y2="5" stroke="#F0D060" strokeWidth="0.4" opacity="0.18" />
                <line x1="5" y1="0" x2="0" y2="5" stroke="#F0D060" strokeWidth="0.4" opacity="0.18" />
            </pattern>
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
    const design = cardBackDesigns[variant];
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
