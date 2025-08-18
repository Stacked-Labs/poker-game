'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import type { Card as CardType } from '../interfaces';

type CardProps = {
    card: CardType;
    placeholder: boolean;
    folded: boolean;
    highlighted?: boolean;
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

// Suit symbols and colors
const suitConfig = {
    C: { symbol: '♣', color: '#000000' }, // Clubs - Black
    D: { symbol: '♦', color: '#FF0000' }, // Diamonds - Red
    H: { symbol: '♥', color: '#FF0000' }, // Hearts - Red
    S: { symbol: '♠', color: '#000000' }, // Spades - Black
};

// (Suit paths not needed currently since we render suit symbols as text)

const cardToString = (card: string) => {
    if (card === '?') return '?';

    const c = Number.parseInt(card);
    if (isNaN(c)) return '?';

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
}: {
    rank: string;
    suit: string;
    folded?: boolean;
    highlighted?: boolean;
}) => {
    const suitInfo = suitConfig[suit as keyof typeof suitConfig];
    const isRed = suit === 'D' || suit === 'H';

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 32"
            style={{
                filter:
                    `${folded ? 'brightness(50%)' : ''} ${highlighted ? 'drop-shadow(0 0 2px rgba(255, 215, 0, 1))' : ''}`.trim() ||
                    'none',
                display: 'block',
            }}
        >
            {/* Card background */}
            <rect
                width="24"
                height="32"
                rx="2"
                ry="2"
                fill="#FFFFFF"
                stroke={highlighted ? '#FFD700' : '#000000'}
                strokeWidth={'0.5'}
            />

            {/* Top left rank and suit - vertically aligned and compact */}
            <text
                x="3"
                y="8"
                fontSize="8"
                fontWeight="bold"
                fill={isRed ? '#FF0000' : '#000000'}
                fontFamily="Arial, sans-serif"
            >
                {rank}
            </text>

            {/* Suit under rank - bigger and aligned */}
            <text
                x="3"
                y="13.5"
                fontSize="8"
                fill={suitInfo.color}
                fontFamily="serif"
            >
                {suitInfo.symbol}
            </text>

            {/* Large centered suit - bigger with less white space */}
            <text
                x="12"
                y="22"
                fontSize="22"
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

const CardBack = ({ highlighted = false }: { highlighted?: boolean }) => (
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 32"
        style={{
            filter: highlighted
                ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 1))'
                : 'none',
            display: 'block',
        }}
    >
        {/* Card background - darkish red */}
        <rect
            width="24"
            height="32"
            rx="2"
            ry="2"
            fill="#8B0000"
            stroke={highlighted ? '#FFD700' : '#000000'}
            strokeWidth={'0.5'}
        />

        {/* Card back pattern - darker red overlay */}
        <rect
            x="2"
            y="2"
            width="20"
            height="28"
            rx="1"
            ry="1"
            fill="#660000"
            opacity="0.4"
        />

        {/* Texture pattern - diagonal lines */}
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
                    stroke="#A52A2A"
                    strokeWidth="0.5"
                    opacity="0.3"
                />
                <line
                    x1="4"
                    y1="0"
                    x2="0"
                    y2="4"
                    stroke="#A52A2A"
                    strokeWidth="0.5"
                    opacity="0.3"
                />
            </pattern>
        </defs>

        {/* Apply texture */}
        <rect
            x="2"
            y="2"
            width="20"
            height="28"
            rx="1"
            ry="1"
            fill="url(#cardTexture)"
        />

        {/* Brand name "Stacked" woven into the texture */}
        <text
            x="12"
            y="16"
            fontSize="3"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            opacity="1"
            fontWeight="bold"
        >
            STACKED
        </text>

        {/* Subtle border inset to add depth */}
        <rect
            x="2.75"
            y="2.75"
            width="18.5"
            height="26.5"
            rx="1"
            ry="1"
            fill="none"
            stroke="#5a0000"
            strokeWidth="0.5"
            opacity="0.6"
        />
    </svg>
);

const SVGCard = ({
    card,
    placeholder,
    folded,
    highlighted = false,
}: CardProps) => {
    const [flipState, setFlipState] = useState<'back' | 'flipping' | 'front'>(
        'back'
    );
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
        setFlipState('back');

        if (placeholder) return;

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
    }, [card, placeholder]);

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
                    <CardBack highlighted={highlighted} />
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
                    />
                ) : (
                    <CardBack highlighted={highlighted} />
                )}
            </Box>
        </Box>
    );
};

const MemoizedSVGCard = React.memo(SVGCard);
export default MemoizedSVGCard;
