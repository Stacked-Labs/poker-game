import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Card } from '@/app/interfaces';
import { Box, Flex } from '@chakra-ui/react';
import React, { useContext } from 'react';
import CardComponent from '../Card';

const CommunityCards = () => {
    const { appState } = useContext(AppContext);
    const communityCards = appState.game?.communityCards;
    const isGameStarted = appState.game?.running;

    if (communityCards && isGameStarted) {
        return (
            <Flex justifyContent={'center'}>
                <Flex width={'80%'} gap={3}>
                    {communityCards.map((card: Card, index: number) => {
                        return (
                            <Box key={index}>
                                <CardComponent
                                    card={card}
                                    hidden={card == '0'}
                                />
                            </Box>
                        );
                    })}
                </Flex>
            </Flex>
        );
    }

    return null;
};

export default CommunityCards;
