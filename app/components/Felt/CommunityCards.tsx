import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Box, Flex } from '@chakra-ui/react';
import React, { useContext } from 'react';
import CardComponent from '../Card';

const CommunityCards = () => {
    const { appState } = useContext(AppContext);
    const communityCards = appState.game?.communityCards;
    const isGameStarted = appState.game?.running;

    const cards = [0, 1, 2, 3, 4];

    if (communityCards && isGameStarted) {
        return (
            <Flex width={{ base: '100%', md: '80%' }} height={'100%'} gap={3}>
                {cards.map((num, i) => (
                    <Box key={i} flex={1} height={{ base: 50, md: 'auto' }}>
                        {appState.game?.communityCards[num] ? (
                            <CardComponent
                                card={appState.game.communityCards[num]}
                                placeholder={false}
                                folded={false}
                                hidden={false}
                            />
                        ) : (
                            <CardComponent
                                card="placeholder"
                                placeholder={true}
                                folded={false}
                                hidden={false}
                            />
                        )}
                    </Box>
                ))}
            </Flex>
        );
    }

    return null;
};

export default CommunityCards;
