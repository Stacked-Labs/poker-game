'use client';

import React, { Fragment, useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppStoreProvider';
import { Pot as PotType } from '../../interfaces';
import { Box, Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';

const initialPot: PotType[] = [
    {
        topShare: 0,
        amount: 0,
        eligiblePlayerNums: [],
        winningPlayerNums: [],
        winningScore: 0,
    },
];

const pulsePotPrimary = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(253, 197, 29, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(253, 197, 29, 0); }
  100% { box-shadow: 0 0 0 0 rgba(253, 197, 29, 0); }
`;

const pulsePotSecondary = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.35); }
  70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

const Pot = ({ activePotIndex }: { activePotIndex: number | null }) => {
    const { appState } = useContext(AppContext);
    const { format } = useFormatAmount();
    const isGameRunning = appState.game?.running;
    const game = appState.game;
    const prefersReducedMotion = usePrefersReducedMotion();
    const pots = useMemo(() => {
        if (!game?.pots || game.stage === 2) return initialPot;
        return game.pots;
    }, [game?.pots, game?.stage]);
    const highlightIndex = useMemo(() => {
        if (
            typeof activePotIndex === 'number' &&
            activePotIndex >= 0 &&
            activePotIndex < (game?.pots?.length || 0)
        ) {
            return activePotIndex;
        }
        return null;
    }, [activePotIndex, game?.pots?.length]);

    if (!game || !game.pots || !isGameRunning) {
        return null;
    }

    if (isGameRunning && pots.length > 0 && pots[0].amount > 0) {
        const mainPotActive = highlightIndex === 0;
        const borderColor = mainPotActive
            ? 'brand.yellow'
            : 'rgba(255, 255, 255, 0.15)';
        const shadowColor = mainPotActive
            ? '0 10px 24px rgba(253, 197, 29, 0.35)'
            : '0 8px 32px rgba(31, 38, 135, 0.37)';
        const borderAnimation =
            mainPotActive && !prefersReducedMotion
                ? `${pulsePotPrimary} 2.4s ease-out infinite`
                : 'none';
        return (
            <Flex
                className="felt-pot"
                padding={2}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
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
                top={{ base: '-8', md: '-12', lg: '-12' }}
                left={'50%'}
                transform="translateX(-50%)"
                transition="transform 0.3s ease"
                pointerEvents={'none'}
                zIndex={999}
                border="1.5px solid"
                borderColor={borderColor}
                boxShadow={shadowColor}
                animation={borderAnimation}
            >
                {pots.map((pot, index) => {
                    if (pot.amount !== 0) {
                        return (
                            <Fragment key={`main-pot-${index}`}>
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
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.15)',
                                                backdropFilter: 'blur(2px) ',
                                                WebkitBackdropFilter:
                                                    'blur(2px) ',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow:
                                                    '0 4px 16px 0 rgba(31, 38, 135, 0.3)',
                                                // Ensure no background override
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
                                                    {format(game.pots[index].amount)}
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
                                        {format(pot.amount)}
                                    </Text>
                                )}
                            </Fragment>
                        );
                    }
                    return null;
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
                                    bg={
                                        highlightIndex === index
                                            ? 'brand.yellow'
                                            : 'yellow.400'
                                    }
                                    px={2}
                                    borderRadius={999}
                                    gap={1}
                                    width="fit-content"
                                    marginBottom={1}
                                    boxShadow={
                                        highlightIndex === index
                                            ? '0 2px 6px rgba(0, 0, 0, 0.25), 0 0 12px rgba(255, 213, 64, 0.65)'
                                            : '0 2px 6px rgba(0, 0, 0, 0.25)'
                                    }
                                    border="1px solid rgba(255, 255, 255, 0.2)"
                                    animation={
                                        highlightIndex === index &&
                                        !prefersReducedMotion
                                            ? `${pulsePotSecondary} 2s ease-out infinite`
                                            : 'none'
                                    }
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
                                        SP{index}: {format(pot.amount)}
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
