'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Image } from '@chakra-ui/react';
import type { Card as CardType } from '../interfaces';

type cardProps = {
    card: CardType;
    placeholder: boolean;
    folded: boolean;
    highlighted?: boolean;
};

const cardToString = (card: string) => {
    if (card === '?') {
        return '?';
    }
    const c = Number.parseInt(card);
    // Return early if parsing fails
    if (isNaN(c)) {
        return '?';
    }
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
    // Return '?' if either rank or suit is invalid
    if (!rankChar || !suitChar) {
        return '?';
    }
    return rankChar + suitChar;
};

const getCardPhoto = (card: string): string | null => {
    // Return null for placeholder or invalid cards
    if (card === '?' || card.length < 2) {
        return null;
    }
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
        J: 'jack',
        Q: 'queen',
        K: 'king',
        A: 'ace',
    };
    const suitMap: { [key: string]: string } = {
        C: 'clubs',
        D: 'diamonds',
        H: 'hearts',
        S: 'spades',
    };
    const rank = card[0];
    const suit = card[1];
    const rankStr = rankMap[rank];
    const suitStr = suitMap[suit];
    // Return null if either rank or suit is undefined/invalid
    if (!rankStr || !suitStr) {
        return null;
    }
    // Prefer WebP for drastic size reduction; PNG remains as fallback if needed elsewhere
    return `/cards/webp/${rankStr}_of_${suitStr}.webp`;
};

const cardPhotoBack = '/cards/webp/back_of_card.webp';

const CardImage = ({
    cardPhoto,
    folded,
    altText,
    highlighted = false,
}: {
    cardPhoto: string;
    folded: boolean;
    altText: string;
    highlighted?: boolean;
}) => {
    return (
        <Box
            width={'100%'}
            height={'100%'}
            position={'relative'}
            className="card-image-box"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius={'10%'}
        >
            <Image
                borderRadius={'10%'}
                position={'absolute'}
                alt={altText}
                src={cardPhoto}
                loading="eager"
                decoding="async"
                width="100%"
                draggable="false"
                style={{
                    objectFit: 'contain',
                    filter: folded ? 'brightness(50%)' : 'none',
                    boxShadow: highlighted
                        ? '0 0 3px 2px rgba(255, 215, 0, 0.9), 0 0 10px rgba(255, 215, 0, 0.85)'
                        : 'none',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            />
        </Box>
    );
};

const Card = ({
    card,
    placeholder,
    folded,
    highlighted = false,
}: cardProps) => {
    const [flipState, setFlipState] = useState<'back' | 'flipping' | 'front'>(
        'back'
    );
    const cardString = cardToString(card);
    const cardPhoto = getCardPhoto(cardString);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        // Reset and clear any queued timeouts when card/placeholder changes
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setFlipState('back');

        if (placeholder) {
            return;
        }

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

        // Preload and decode the front image before flipping, with a safe fallback
        if (cardPhoto) {
            let started = false;
            const fallbackId = setTimeout(() => {
                if (!started) {
                    startFlip();
                    started = true;
                }
            }, 700);
            timersRef.current.push(fallbackId);

            const img: HTMLImageElement | null =
                typeof window !== 'undefined' ? new window.Image() : null;
            if (img) {
                img.src = cardPhoto;
                const maybeDecode = img as HTMLImageElement as unknown as {
                    decode?: () => Promise<void>;
                };
                if (typeof maybeDecode.decode === 'function') {
                    maybeDecode.decode!()
                        .then(() => {
                            if (!started) {
                                clearTimeout(fallbackId);
                                startFlip();
                                started = true;
                            }
                        })
                        .catch(() => {
                            if (!started) {
                                startFlip();
                                started = true;
                            }
                        });
                } else {
                    startFlip();
                }
            } else {
                if (!started) {
                    startFlip();
                    started = true;
                }
            }
        } else {
            startFlip();
        }

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [card, placeholder, cardPhoto]);

    if (cardString == '2\u0000') {
        return null;
    }

    if (card == '0') {
        return (
            <CardImage
                altText="Card Back"
                cardPhoto={cardPhotoBack}
                folded={folded}
                highlighted={highlighted}
            />
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
        <Flex
            justifyContent="center"
            position="relative"
            cursor={placeholder ? 'pointer' : 'default'}
            width={'100%'}
            height={'100%'}
            opacity={placeholder ? 0 : 1}
            sx={{
                perspective: '1000px',
                isolation: 'isolate',
                contain: 'layout paint',
            }}
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
                {flipState === 'front' ? (
                    <CardImage
                        altText={`Card ${cardString}`}
                        cardPhoto={cardPhoto ?? ''}
                        folded={folded}
                        highlighted={highlighted}
                    />
                ) : (
                    <CardImage
                        altText="Card Back"
                        cardPhoto={cardPhotoBack}
                        folded={folded}
                        highlighted={false}
                    />
                )}
            </Box>
        </Flex>
    );
};

const MemoizedCard = React.memo(Card);
export default MemoizedCard;
