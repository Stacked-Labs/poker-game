import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Box, Flex } from '@chakra-ui/react';
import React, { useContext } from 'react';
import CardComponent from '../Card';

const CommunityCards = () => {
    const { appState } = useContext(AppContext);
    const communityCards = appState.game?.communityCards;
    const isGameRunning = appState.game?.running;

    const cards = [0, 1, 2, 3, 4];

    if (!isGameRunning) {
        return null;
    }

    if (communityCards && isGameRunning) {
        return (
            <>
                {cards.map((num, i) => (
                    <Box
                        key={i}
                        flex="1 1 20%"
                        maxW={{ base: '15%', md: '20%', lg: '18%' }}
                        display="flex"
                        height="100%"
                    >
                        {appState.game?.communityCards[num] ? (
                            <CardComponent
                                card={appState.game.communityCards[num]}
                                placeholder={false}
                                folded={false}
                            />
                        ) : (
                            <CardComponent
                                card="placeholder"
                                placeholder={true}
                                folded={false}
                            />
                        )}
                    </Box>
                ))}
            </>
        );
    }

    return null;
};

export default CommunityCards;
