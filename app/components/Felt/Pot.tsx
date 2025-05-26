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
    const isGameRunning = appState.game?.running;
    const game = appState.game;
    const [stage, setStage] = useState(game?.stage);
    const [pots, setPots] = useState(initialPot);

    if (!game || !game.pots || !isGameRunning) {
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

    if (isGameRunning) {
        return (
            <Flex 
                justifyContent={'flex'} 
                textAlign={'justify'}
                gap={{ base: 1, sm: 2, md: 3 }}
            >
                {pots.map((pot, index) => {
                    if (pot.amount !== 0) {
                        return (
                            <Flex
                                bg={'green.600'}
                                padding={{
                                    base: 1,
                                    sm: 1.5,
                                    md: 2
                                }}
                                width={{
                                    base: '54px',
                                    sm: '64px',
                                    md: '90px',
                                    lg: '115px',
                                    xl: '140px'
                                }}
                                height={{
                                    base: '20px',
                                    sm: '24px',
                                    md: '28px',
                                    lg: '32px',
                                    xl: '36px'
                                }}
                                borderRadius={999}
                                key={index}
                                justifyContent={'center'}
                                alignItems="center"
                                position="relative"
                            >
                                <Flex position={'relative'} gap={1}>
                                    <Flex
                                        position={'absolute'}
                                        top={{
                                            base: -2,
                                            sm: -2.5,
                                            md: -3,
                                            lg: -4,
                                            xl: -6
                                        }}
                                        right={-2}
                                    >
                                        {game.pots[index] &&
                                        game.pots[index].amount != pot.amount ? (
                                            <Box
                                                bg={'green.700'}
                                                paddingX={{
                                                    base: 1,
                                                    sm: 1.5,
                                                    md: 2
                                                }}
                                                borderRadius={999}
                                                fontSize={{
                                                    base: '8px',
                                                    sm: '9px',
                                                    md: '10px',
                                                    lg: '11px',
                                                    xl: '12px'
                                                }}
                                            >
                                                {game.pots[index].amount - pot.amount}
                                            </Box>
                                        ) : null}
                                    </Flex>
                                    <Flex
                                        paddingX={{
                                            base: '8',
                                            sm: '10',
                                            md: '12',
                                            lg: '14'
                                        }}
                                        justifyContent={'center'}
                                        alignItems="center"
                                        width="100%"
                                    >
                                        <Text
                                            fontSize={{
                                                base: '8px',
                                                sm: '9px',
                                                md: '12px',
                                                lg: '16px',
                                                xl: '17px'
                                            }}
                                            color={'white'}
                                            fontWeight={'bold'}
                                            lineHeight="1"
                                        >
                                            {pot.amount}
                                        </Text>
                                    </Flex>
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
