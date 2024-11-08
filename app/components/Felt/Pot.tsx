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
                {pots.map((pot, index) => {
                    if (pot.amount !== 0) {
                        return (
                            <Flex
                                bg={'green.600'}
                                padding={2}
                                borderRadius={999}
                                key={index}
                                justifyContent={'center'}
                            >
                                <Flex position={'relative'} gap={1}>
                                    <Flex
                                        position={'absolute'}
                                        top={{ base: -3, lg: -4, '2xl': -6 }}
                                        right={-2}
                                    >
                                        {game.pots[index] &&
                                        game.pots[index].amount !=
                                            pot.amount ? (
                                            <Box
                                                bg={'green.700'}
                                                paddingX={'2'}
                                                borderRadius={99999}
                                            >
                                                <Text
                                                    fontSize={{
                                                        base: '8px',
                                                        md: '10px',
                                                        xl: 'small',
                                                        '2xl': 'medium',
                                                    }}
                                                >
                                                    total{' '}
                                                    <Text
                                                        as={'span'}
                                                        fontWeight={'medium'}
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'small',
                                                            xl: 'medium',
                                                            '2xl': 'large',
                                                        }}
                                                    >
                                                        {
                                                            game.pots[index]
                                                                .amount
                                                        }
                                                    </Text>
                                                </Text>
                                            </Box>
                                        ) : (
                                            <Text>&nbsp;</Text>
                                        )}
                                    </Flex>
                                    <Box paddingX={'16'}>
                                        <Text
                                            fontSize={{
                                                base: '10px',
                                                md: 'medium',
                                                xl: 'xl',
                                                '2xl': '2xl',
                                            }}
                                            fontWeight={'bolder'}
                                        >
                                            {pot.amount}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Flex>
                        );
                    }
                })}
            </Flex>
        );
    }

    return null;
};

export default Pot;
