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

    if (!isGameRunning) {
        return null;
    }

    const hasTotal = game.pots[0]?.amount > 0;
    const hasSidepot = pots[1]?.amount > 0;

    return (
        <Flex justifyContent="flex" textAlign="justify" position="relative">
            {/* Both the total and sidepot pill exists */}
            {hasTotal && hasSidepot && (
                <>
                    <Flex
                        bg="green.700"
                        px={2}
                        borderRadius={999}
                        alignItems="flex-end"
                        position="absolute"
                        top={{ base: -2, lg: -3 }}
                        left={{ base: '50%', md: 'auto' }}
                        right={{ base: 'auto', md: -2 }}
                        transform={{ base: 'translateX(-50%)', md: 'none' }}
                        gap={1}
                        width="fit-content"
                        zIndex={1}
                    >
                        <Text
                            fontSize={{ base: '8px', lg: '10px' }}
                            color="white"
                        >
                            total
                        </Text>
                        <Text
                            as="span"
                            color="white"
                            fontWeight="medium"
                            fontSize={{ base: '10px', lg: '12px' }}
                            pb={0}
                        >
                            {game.pots[0].amount}
                        </Text>
                    </Flex>

                    <Flex
                        position="absolute"
                        top={{ base: -9, lg: -10 }}
                        left={{ base: '50%', md: 'auto' }}
                        right={{ base: 'auto', md: -2 }}
                        transform={{ base: 'translateX(-50%)', md: 'none' }}
                        bg="yellow.400"
                        p={2}
                        borderRadius="full"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            fontSize={{ base: '10px', lg: '12px' }}
                            fontWeight="bold"
                            color="black"
                            lineHeight="1"
                        >
                            {pots[1].amount}
                        </Text>
                    </Flex>
                </>
            )}

            {/* Only the sidepot pill exists */}
            {!hasTotal && hasSidepot && (
                <Flex
                    bg="yellow.400"
                    px={2}
                    borderRadius={999}
                    alignItems="center"
                    position="absolute"
                    top={{ base: -2, lg: -3 }}
                    left={{ base: '50%', md: 'auto' }}
                    right={{ base: 'auto', md: -2 }}
                    transform={{ base: 'translateX(-50%)', md: 'none' }}
                    gap={1}
                    width="fit-content"
                    zIndex={1}
                >
                    <Text
                        fontSize={{ base: '10px', lg: '12px' }}
                        fontWeight="bold"
                        color="black"
                    >
                        {pots[1].amount}
                    </Text>
                </Flex>
            )}

            {/* Only the total pill exists */}
            {hasTotal && !hasSidepot && (
                <Flex
                    bg="green.700"
                    px={2}
                    borderRadius={999}
                    alignItems="flex-end"
                    position="absolute"
                    top={{ base: -2, lg: -3 }}
                    left={{ base: '50%', md: 'auto' }}
                    right={{ base: 'auto', md: -2 }}
                    transform={{ base: 'translateX(-50%)', md: 'none' }}
                    gap={1}
                    width="fit-content"
                    zIndex={1}
                >
                    <Text fontSize={{ base: '8px', lg: '10px' }} color="white">
                        total
                    </Text>
                    <Text
                        as="span"
                        color="white"
                        fontWeight="medium"
                        fontSize={{ base: '10px', lg: '12px' }}
                        pb={0}
                    >
                        {game.pots[0].amount}
                    </Text>
                </Flex>
            )}

            {pots[0] && (
                <Flex
                    bg="green.600"
                    width={{ xl: '140px', lg: '115px', base: '90px' }}
                    borderRadius={999}
                    justifyContent="center"
                >
                    <Text
                        fontSize={{ lg: 'lg', md: 'm', base: 'xs' }}
                        color="white"
                        fontWeight="bold"
                        zIndex={3}
                        py={1.5}
                    >
                        {pots[0].amount}
                    </Text>
                </Flex>
            )}
        </Flex>
    );
};

export default Pot;
