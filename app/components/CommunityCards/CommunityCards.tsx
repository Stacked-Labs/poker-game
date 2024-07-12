import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Card } from '@/app/interfaces';
import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useContext } from 'react';
import CardComponent from '../Card';

const CommunityCards = () => {
    const { appState } = useContext(AppContext);
    const communityCards = appState.game?.communityCards;
    const isGameStarted = appState.game?.running;

    if (communityCards && isGameStarted) {
        return (
            <Flex gap={2}>
                {communityCards.map((card: Card, index: number) => {
                    return (
                        <Box
                            key={index}
                            position={'relative'}
                            width={'100%'}
                            aspectRatio={[9 / 12, 9 / 16]}
                        >
                            <CardComponent card={card} hidden={card == '0'} />
                        </Box>
                    );
                })}
            </Flex>
        );
    }

    return null;
};

export default CommunityCards;
