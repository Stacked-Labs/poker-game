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

    if (isGameRunning && pots.length > 0 && pots[0].amount > 0) {
        return (
            <Flex
                padding={2}
                sx={{
                    backgroundColor: 'rgba(16, 100, 50, 0.12)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    // Ensure no background override
                    bg: 'transparent',
                }}
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
                justifyContent={'center'}
                alignItems={'center'}
                gap={1}
                position={'absolute'}
                top={{ base: '-8', md: '-6', lg: '-6' }}
                left={'50%'}
                transform={'translateX(-50%)'}
                pointerEvents={'none'}
                zIndex={999}
            >
                {pots.map((pot, index) => {
                    if (pot.amount !== 0) {
                        return (
                            <>
                                <Flex
                                    position={'absolute'}
                                    top={{ base: -3, lg: -4, '2xl': -6 }}
                                    right={-2}
                                >
                                    {game.pots[index] &&
                                    game.pots[index].amount != pot.amount ? (
                                        <Box
                                            paddingX={'2'}
                                            borderRadius={999}
                                            sx={{
                                                backgroundColor: 'rgba(12, 80, 40, 0.15)',
                                                backdropFilter: 'blur(10px) saturate(180%)',
                                                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.3)',
                                                // Ensure no background override
                                                bg: 'transparent',
                                            }}
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
                                                    fontWeight={'medium'}
                                                    fontSize={{
                                                        xl: '17px',
                                                        lg: '16px',
                                                        md: '14px',
                                                        base: '10px',
                                                    }}
                                                    color={'white'}
                                                >
                                                    {game.pots[index].amount}
                                                </Text>
                                            </Text>
                                        </Box>
                                    ) : (
                                        <Text>&nbsp;</Text>
                                    )}
                                </Flex>
                                {index === 0 && (
                                    <Text
                                        fontSize={{
                                            xl: '22px',
                                            lg: '20px',
                                            md: '16px',
                                            base: '12px',
                                        }}
                                        fontWeight="extrabold"
                                        color="white"
                                        textAlign="center"
                                    >
                                        {pot.amount}
                                    </Text>
                                )}
                            </>
                        );
                    }
                })}
                <Flex
                    gap={2}
                    alignItems="center"
                    position="absolute"
                    bottom={{
                        base: '-14px',
                    }}
                    zIndex={3}
                    width={'fit-content'}
                    justifyContent={'center'}
                    alignContent={'center'}
                >
                    {pots.map(
                        (pot, index) =>
                            pot.amount !== 0 &&
                            index > 0 && (
                                <Flex
                                    bg="yellow.400"
                                    px={2}
                                    borderRadius={999}
                                    gap={1}
                                    width="fit-content"
                                    marginBottom={1}
                                    key={`pot-${index}-${index}`}
                                >
                                    <Text
                                        fontSize={{
                                            base: '9px',
                                            lg: '11px',
                                        }}
                                        fontWeight="bold"
                                        color="black"
                                        whiteSpace="nowrap"
                                    >
                                        SP{index}: {pot.amount}
                                    </Text>
                                </Flex>
                            )
                    )}
                </Flex>
            </Flex>
        );
    }

    return null;
};

export default Pot;
