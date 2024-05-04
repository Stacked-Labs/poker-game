import { Card } from '@/app/interfaces';
import { getCommunityCards } from '@/app/utils/communityCards';
import { Box, Flex, Image } from '@chakra-ui/react';
import React from 'react';

const CommunityCards = () => {
    const communityCards = getCommunityCards();

    return (
        <Flex gap={2}>
            {communityCards.map((communityCard: Card, index: number) => {
                return (
                    <Box
                        key={index}
                        position={'relative'}
                        width={'100%'}
                        aspectRatio={[9 / 12, 9 / 16]}
                    >
                        <Image
                            src={`/cards/png/${communityCard.value}_of_${communityCard.type}.png`}
                            alt={`${communityCard.value}_of_${communityCard.type}`}
                            width={100}
                            height={'auto'}
                            objectFit="contain"
                        />
                    </Box>
                );
            })}
        </Flex>
    );
};

export default CommunityCards;
