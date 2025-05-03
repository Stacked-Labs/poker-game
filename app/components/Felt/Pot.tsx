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
            <Flex justifyContent={'flex'} textAlign={'justify'}>
                {pots.map((pot, index) => {
                    if (pot.amount !== 0) {
                        return (
                            <Flex
                                bg={'green.600'}
                                padding={2}
                                width={{
                                    xl: '140px',
                                    lg: '115px',
                                    md: '90px',
                                    base: '64px',
                                }}
                                height={{
                                    xl: '36px',
                                    lg: '32px',
                                    md: '28px',
                                    base: '24px',
                                }}
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
                                                borderRadius={999}
                                            >
                                                <Text
                                                    fontSize={{
                                                        xl: '14px',
                                                        lg: '13px',
                                                        md: '12px',
                                                        base: '10px',
                                                    }}
                                                    color={'white'}
                                                >
                                                    total{' '}
                                                    <Text
                                                        as={'span'}
                                                        color={'blue'}
                                                        fontWeight={'medium'}
                                                        fontSize={{
                                                            xl: '17px',
                                                            lg: '16px',
                                                            md: '14px',
                                                            base: '13px',
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
                                    <Flex
                                        paddingX={'14'}
                                        justifyContent={'center'}
                                        mb={'10%'}
                                    >
                                        <Text
                                            fontSize={{
                                                xl: '17px',
                                                lg: '16px',
                                                md: '12px',
                                                base: '9px',
                                            }}
                                            color={'white'}
                                            fontWeight={'bold'}
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
