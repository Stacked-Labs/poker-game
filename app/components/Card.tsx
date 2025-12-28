'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import type { Card as CardType } from '../interfaces';

type CardProps = {
    card: CardType;
    placeholder: boolean;
    folded: boolean;
    highlighted?: boolean;
    dimmed?: boolean;
    skipAnimation?: boolean; // Skip flip animation for enemy players
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
const suitConfig = {
    C: { symbol: '♣', color: '#000000' }, // Clubs - Black
    D: { symbol: '♦', color: '#DC143C' }, // Diamonds - Crimson Red (more saturated)
    H: { symbol: '♥', color: '#DC143C' }, // Hearts - Crimson Red (more saturated)
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
}: {
    rank: string;
    suit: string;
    folded?: boolean;
    highlighted?: boolean;
    dimmed?: boolean;
}) => {
    const suitInfo = suitConfig[suit as keyof typeof suitConfig];
    const isRed = suit === 'D' || suit === 'H';

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
                fontWeight="800"
                fill={isRed ? '#DC143C' : '#000000'}
                fontFamily="'Geist Sans', 'Poppins', sans-serif"
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

const CardBack = ({
    highlighted = false,
    dimmed = false,
    folded = false,
}: {
    highlighted?: boolean;
    dimmed?: boolean;
    folded?: boolean;
}) => (
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 32"
        style={{
            display: 'block',
            filter:
                [
                    folded || (dimmed && !highlighted) ? 'brightness(50%)' : '',
                    highlighted
                        ? 'drop-shadow(0 0 3px rgba(253, 197, 29, 1)) drop-shadow(0 0 6px rgba(253, 197, 29, 0.6))'
                        : '',
                ]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || 'none',
        }}
    >
        {/* Card background - brand dark navy */}
        <rect
            width="24"
            height="32"
            rx="2.5"
            ry="2.5"
            fill="#0B1430"
            stroke={highlighted ? '#FDC51D' : '#334479'}
            strokeWidth={highlighted ? '0.75' : '0.5'}
        />

        {/* Card back pattern - navy overlay for depth */}
        <rect
            x="2"
            y="2"
            width="20"
            height="28"
            rx="1.5"
            ry="1.5"
            fill="#334479"
            opacity="0.3"
        />

        {/* Texture pattern - diagonal lines with brand colors */}
        <defs>
            <pattern
                id="cardTexture"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
            >
                <line
                    x1="0"
                    y1="0"
                    x2="4"
                    y2="4"
                    stroke="#36A37B"
                    strokeWidth="0.5"
                    opacity="0.15"
                />
                <line
                    x1="4"
                    y1="0"
                    x2="0"
                    y2="4"
                    stroke="#EB0B5C"
                    strokeWidth="0.5"
                    opacity="0.15"
                />
            </pattern>
        </defs>

        {/* Apply texture */}
        <rect
            x="2"
            y="2"
            width="20"
            height="28"
            rx="1.5"
            ry="1.5"
            fill="url(#cardTexture)"
        />

        {/* Subtle border inset to add depth */}
        <rect
            x="2.75"
            y="2.75"
            width="18.5"
            height="26.5"
            rx="1.5"
            ry="1.5"
            fill="none"
            stroke="#334479"
            strokeWidth="0.5"
            opacity="0.4"
        />
    </svg>
);

const SVGCard = ({
    card,
    placeholder,
    folded,
    highlighted = false,
    dimmed = false,
    skipAnimation = false,
}: CardProps) => {
    const [flipState, setFlipState] = useState<'back' | 'flipping' | 'front'>(
        'back'
    );
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const prevCardStringRef = useRef<string | null>(null);

    const cardString = useMemo(() => cardToString(card), [card]);
    const cardData = useMemo(() => {
        if (cardString === '?' || cardString.length < 2) return null;
        const rank = cardString[0];
        const suit = cardString[1];
        return { rank: rankMap[rank] || rank, suit };
    }, [cardString]);

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
                    />
                ) : (
                    <CardBack
                        highlighted={highlighted}
                        dimmed={dimmed}
                        folded={folded}
                    />
                )}
            </Box>
        </Box>
    );
};

const MemoizedSVGCard = React.memo(SVGCard);
export default MemoizedSVGCard;
