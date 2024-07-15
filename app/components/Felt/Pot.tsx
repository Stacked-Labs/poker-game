'use client';

import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppStoreProvider';
import { Pot as PotType } from '../../interfaces';
import { Box, Flex, Text } from '@chakra-ui/react';

const initialPot: PotType[] = [
    {
        topShare: 0,
        amount: 0,
        eligiblePlayerNums: [],
        winningPlayerNums: [],
        winningHand: [],
        winningScore: 0,
    },
];

const Pot = () => {
    const { appState } = useContext(AppContext);
    const isGameStarted = appState.game?.running;
    const game = appState.game;
    const [stage, setStage] = useState(game?.stage);
    const [pots, setPots] = useState(initialPot);

    if (!game || !game.pots) {
        return null;
    }

    if (game.stage != stage) {
        setStage(game.stage);

        if (game.stage == 2) {
            setPots(initialPot);
        } else {
            setPots(game.pots);
        }
    }

    if (isGameStarted) {
        return (
            <Flex justifyContent={'center'} textAlign={'center'}>
                <Box bg={'green.700'} padding={2} borderRadius={999}>
                    {pots.map((pot, index) => (
                        <Flex key={index} position={'relative'}>
                            <Box position={'absolute'} top={-5} right={-75}>
                                {game.pots[index] &&
                                game.pots[index].amount != pot.amount ? (
                                    <Text color={'green.800'}>
                                        Total: {game.pots[index].amount}
                                    </Text>
                                ) : (
                                    <Text>&nbsp;</Text>
                                )}
                            </Box>
                            <Box paddingX={'10'}>
                                <Text fontSize={'2xl'} fontWeight={'bolder'}>
                                    {pot.amount}
                                </Text>
                            </Box>
                        </Flex>
                    ))}
                </Box>
            </Flex>
        );
    }

    return null;
};

export default Pot;
