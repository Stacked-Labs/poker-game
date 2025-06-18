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
                                position="relative"
                            >
                                {game.pots[index] &&
                                game.pots[index].amount != pot.amount ? (
                                    <Flex
                                        bg="green.700"
                                        px={2}
                                        borderRadius={999}
                                        alignItems="flex-end"
                                        position="absolute"
                                        top={{ base: -2, lg: -2 }}
                                        left={{
                                            base: '50%',
                                            md: 'auto',
                                        }}
                                        right={{ base: 'auto', md: -2 }}
                                        transform={{
                                            base: 'translateX(-50%)',
                                            md: 'none',
                                        }}
                                        gap={1}
                                        width="fit-content"
                                        zIndex={1}
                                    >
                                        <Text
                                            fontSize={{
                                                base: '8px',
                                                lg: '10px',
                                            }}
                                            color="white"
                                        >
                                            total
                                        </Text>
                                        <Text
                                            as="span"
                                            color="white"
                                            fontWeight="medium"
                                            fontSize={{
                                                base: '10px',
                                                lg: '12px',
                                            }}
                                            pb={0}
                                        >
                                            {game.pots[0].amount}
                                        </Text>
                                    </Flex>
                                ) : (
                                    <Text>&nbsp;</Text>
                                )}
                                {index < 1 && (
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
                                )}
                                {index > 0 && (
                                    <Flex
                                        bg="yellow.400"
                                        px={2}
                                        borderRadius={999}
                                        alignItems="center"
                                        position="absolute"
                                        bottom={{
                                            base: '-20px',
                                            lg: '-22px',
                                            xl: '-24px',
                                        }}
                                        left={{
                                            base: '50%',
                                            md: 'auto',
                                        }}
                                        right={{ base: 'auto', md: 2 }}
                                        transform={{
                                            base: 'translateX(-50%)',
                                            md: 'none',
                                        }}
                                        gap={1}
                                        width="fit-content"
                                        zIndex={3}
                                        marginBottom={1}
                                    >
                                        <Text
                                            fontSize={{
                                                base: '9px',
                                                lg: '11px',
                                            }}
                                            fontWeight="bold"
                                            color="black"
                                        >
                                            {pot.amount}
                                        </Text>
                                    </Flex>
                                )}
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
