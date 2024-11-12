import React from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { Card as CardType } from '../interfaces';
import { relative } from 'path';

type cardProps = {
    card: CardType;
    placeholder: boolean;
    folded: boolean;
    hidden: boolean;
};

const cardToString = (card: string) => {
    if (card === '?') {
        return '?';
    }

    const c = parseInt(card);
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

    return numToCharRanks[rank] + numToCharSuits.get(suit);
};

const getCardPhoto = (card: string) => {
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

    return `/cards/png/${rankStr}_of_${suitStr}.png`;
};

const Card = ({ card, placeholder, folded, hidden }: cardProps) => {
    const cardString = cardToString(card);
    const cardPhoto = getCardPhoto(cardString);

    const cardBack = '/cards/png/back_of_card.png';

    if (placeholder) {
        return (
            <Flex justifyContent={'center'}>
                <Image
                    alt={`Card ${cardString}`}
                    src={cardBack}
                    width={{ base: '100%', lg: '90%' }}
                    style={{ objectFit: 'contain' }}
                    opacity={0}
                />
            </Flex>
        );
    }

    if (cardString == '2\u0000' || card == '0') {
        return null;
    }

    if (hidden) {
        if (folded) {
            return (
                <Flex justifyContent={'center'}>
                    <Flex position={'absolute'}></Flex>
                    <Image
                        alt={`Card ${cardString}`}
                        src={cardPhoto}
                        width={{ base: '100%', lg: '90%' }}
                        style={{ objectFit: 'contain' }}
                    />
                </Flex>
            );
        }
        return (
            <Flex justifyContent={'center'}>
                <Image
                    alt={`Hidden card`}
                    src={cardBack}
                    width={{ base: '100%', md: '90%' }}
                    style={{ objectFit: 'contain' }}
                />
            </Flex>
        );
    }

    if (folded) {
        return (
            <Flex justifyContent={'center'}>
                <Image
                    alt={`Card ${cardString}`}
                    src={cardPhoto}
                    width={{ base: '100%', lg: '90%' }}
                    style={{ objectFit: 'contain' }}
                    position={'relative'}
                />
                <Flex
                    position={'absolute'}
                    width={'100%'}
                    height={'100%'}
                    bg={'grey'}
                    opacity={0.5}
                ></Flex>
            </Flex>
        );
    }

    return (
        <Flex justifyContent={'center'}>
            <Image
                alt={`Card ${cardString}`}
                src={cardPhoto}
                width={{ base: '100%', lg: '90%' }}
                style={{ objectFit: 'contain' }}
            />
        </Flex>
    );
};

export default Card;
