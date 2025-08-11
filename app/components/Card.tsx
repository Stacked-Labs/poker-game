import React, { useState, useEffect } from 'react';
import { Box, Flex, Image } from '@chakra-ui/react';
import { Card as CardType } from '../interfaces';

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

    const c = parseInt(card);

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

    return `/cards/png/${rankStr}_of_${suitStr}.png`;
};

const cardPhotoBack = '/cards/png/back_of_card.png';

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
                width="100%"
                draggable="false"
                style={{
                    objectFit: 'contain',
                    filter: folded ? 'brightness(50%)' : 'none',
                    boxShadow: highlighted
                        ? '0 0 3px 2px rgba(255, 215, 0, 0.9), 0 0 10px rgba(255, 215, 0, 0.85)'
                        : 'none',
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
    const [isFlipped, setIsFlipped] = useState(false);
    const cardString = cardToString(card);
    const cardPhoto = getCardPhoto(cardString);

    useEffect(() => {
        setIsFlipped(false);

        if (!placeholder) {
            setTimeout(() => setIsFlipped(true), 300);
        }
    }, [card, placeholder]);

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

    return (
        <Flex
            justifyContent="center"
            position="relative"
            cursor={placeholder ? 'pointer' : 'default'}
            sx={{
                perspective: '500px',
                '& > div': {
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    MozTransformStyle: 'preserve-3d',
                },
            }}
            width={'100%'}
            height={'100%'}
            opacity={placeholder ? 0 : 1}
        >
            <Box
                width={'100%'}
                height={'100%'}
                position={'relative'}
                sx={{
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    MozTransformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                <Box
                    position={'absolute'}
                    width="100%"
                    height="100%"
                    sx={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        MozBackfaceVisibility: 'hidden',
                    }}
                >
                    <CardImage
                        altText="Card Back"
                        cardPhoto={cardPhotoBack}
                        folded={folded}
                        highlighted={highlighted}
                    />
                </Box>
                <Box
                    position={'absolute'}
                    width="100%"
                    height="100%"
                    sx={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        MozBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <CardImage
                        altText={`Card ${cardString}`}
                        cardPhoto={cardPhoto ?? ''}
                        folded={folded}
                        highlighted={highlighted}
                    />
                </Box>
            </Box>
        </Flex>
    );
};

const MemoizedCard = React.memo(Card);

export default MemoizedCard;
