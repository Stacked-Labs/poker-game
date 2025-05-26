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
            <Flex
                width={{ 
                    base: '100%', 
                    sm: '95%', 
                    md: '90%', 
                    lg: '85%' 
                }}
                height={{
                    base: '70%',
                    sm: '75%',
                    md: '80%',
                    lg: '85%'
                }}
                gap={{
                    base: '4%',
                    sm: '5%',
                    md: '6%',
                    lg: '8%'
                }}
                justifyContent={'center'}
                alignItems="center"
            >
                {cards.map((num, i) => (
                    <Box
                        key={i}
                        flex={1}
                        height={{
                            base: '40px',
                            sm: '45px',
                            md: '50px',
                            lg: 'auto'
                        }}
                        justifyContent={'center'}
                        transform={{
                            base: 'scale(1.2)',
                            sm: 'scale(1.3)',
                            md: 'scale(1.4)',
                            lg: 'scale(1.5)'
                        }}
                        transition="transform 0.2s ease-in-out"
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
            </Flex>
        );
    }

    return null;
};

export default CommunityCards;
