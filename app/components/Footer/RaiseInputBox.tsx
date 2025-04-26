'use client';

import {
    Input,
    Flex,
    Button,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box,
    Text,
} from '@chakra-ui/react';
import React, { ChangeEvent, useContext, useState, useEffect } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import ActionButton from './ActionButton';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendLog, playerRaise } from '@/app/hooks/server_actions';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const RaiseInputBox = ({
    action,
    showRaise,
    setShowRaise,
}: {
    action: boolean;
    showRaise: boolean;
    setShowRaise: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    const maxRaise = 100;

    const [inputValue, setInputValue] = useState<number>(0);
    const [sliderValue, setSliderValue] = useState<number>(0);

    if (!appState.game) {
        return null;
    }

    const bigBlind = appState.game.config.bb;
    const smallBlind = appState.game.config.sb;
    const currentBet = appState.game.players[appState.game.action].bet; // active player's bet
    const currentStack = appState.game.players[appState.game.action].stack; // active player's stack
    const playerBets = appState.game.players.map((player) => player.bet); // array of all players' bets
    const maxBet = Math.max(...playerBets); // largest bet out of all player's bets
    const minRaise = maxBet + appState.game.minRaise;

    const currentPot =
        appState.game.pots.length != 0
            ? appState.game.pots[0].amount
            : bigBlind + smallBlind;

    const potBet = 3 * maxBet + currentPot - maxBet;

    const potPortion = (pot: number, fraction: number) => {
        return Math.ceil(pot * fraction);
    };

    const betValidator = (bet: number, minRaise: number, stack: number) => {
        if (bet < minRaise) {
            setSliderValue(minRaise);
            return minRaise;
        } else if (bet > stack) {
            setSliderValue(stack);
            return stack;
        } else {
            setSliderValue(bet);
            return bet;
        }
    };

    const half =
        appState.game.pots.length != 0 ? potPortion(potBet, 0.5) : minRaise;
    const threeQuarter =
        appState.game.pots.length != 0
            ? potPortion(potBet, 0.75)
            : Math.ceil(bigBlind * 2.5);

    const full = appState.game.pots.length != 0 ? potBet : bigBlind * 3;
    const allIn = currentStack + currentBet;

    const handleSubmitRaise = (user: string | null, amount: number) => {
        if (socket) {
            const raiseMessage = `${user} raises ${amount}`;
            sendLog(socket, raiseMessage);
            playerRaise(socket, amount);
        }
        setShowRaise(!showRaise);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setInputValue(value);
        setSliderValue(value);
    };

    const handleSliderChange = (value: number) => {
        setInputValue(value);
        setSliderValue(value);
    };

    const handleInputOnBlur = () => {
        if (inputValue > maxRaise || inputValue < minRaise) {
            setInputValue(maxRaise);
        }
    };

    const actionButtons = () => {
        return (
            <Flex flex={1} gap={2}>
                <ActionButton
                    text={'Back'}
                    color="white"
                    clickHandler={() => setShowRaise(false)}
                    isDisabled={!action}
                />
                <ActionButton
                    text={'Raise'}
                    color="green"
                    clickHandler={() =>
                        handleSubmitRaise(
                            appState.username,
                            inputValue - currentBet
                        )
                    }
                    isDisabled={
                        inputValue < minRaise ||
                        inputValue > currentStack + currentBet
                    }
                />
            </Flex>
        );
    };

    return (
        <Flex
            gap={2}
            direction={{ base: 'column', md: 'row' }}
            alignItems={'center'}
            color={'white'}
        >
            <Flex
                direction={{
                    base: 'column-reverse',
                    md: 'column-reverse',
                    lg: 'row',
                }}
                gap={2}
            >
                <Flex gap={2} justifyContent={{ base: 'end' }}>
                    <Box
                        bg={'charcoal.800'}
                        width={'fit-content'}
                        textAlign={'center'}
                        rounded={'lg'}
                        px={1}
                        flex={1}
                        height={'100%'}
                    >
                        <Text whiteSpace={'nowrap'} p={1} fontSize={'sm'}>
                            Your Bet
                        </Text>
                        <Input
                            bg={'charcoal.600'}
                            border={'white'}
                            fontSize={{ base: 'small', md: 'xl' }}
                            mb={1}
                            type="number"
                            value={inputValue}
                            min={minRaise}
                            max={maxRaise}
                            onChange={handleInputChange}
                            focusBorderColor={'gray.300'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                        />
                    </Box>
                    <Box display={{ base: 'inline-flex', lg: 'none' }} flex={2}>
                        {actionButtons()}
                    </Box>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    bg={'charcoal.800'}
                    rounded={'lg'}
                    flex={1}
                    justifyContent={'center'}
                    overflow={'hdden'}
                    maxW={'95vw'}
                >
                    <Flex flex={1} gap={2} p={2}>
                        <Button
                            variant={'raiseActionButton'}
                            onClick={() =>
                                setInputValue(
                                    betValidator(
                                        minRaise,
                                        minRaise,
                                        currentStack + currentBet
                                    )
                                )
                            }
                        >
                            Min
                        </Button>
                        <Button
                            variant={'raiseActionButton'}
                            onClick={() =>
                                setInputValue(
                                    betValidator(
                                        half,
                                        minRaise,
                                        currentStack + currentBet
                                    )
                                )
                            }
                        >
                            1/2 Pot
                        </Button>
                        <Button
                            variant={'raiseActionButton'}
                            onClick={() =>
                                setInputValue(
                                    betValidator(
                                        threeQuarter,
                                        minRaise,
                                        currentStack + currentBet
                                    )
                                )
                            }
                        >
                            3/4 Pot
                        </Button>
                        <Button
                            variant={'raiseActionButton'}
                            onClick={() =>
                                setInputValue(
                                    betValidator(
                                        full,
                                        minRaise,
                                        currentStack + currentBet
                                    )
                                )
                            }
                        >
                            Pot
                        </Button>
                        <Button
                            variant={'raiseActionButton'}
                            onClick={() =>
                                setInputValue(
                                    betValidator(
                                        allIn,
                                        minRaise,
                                        currentStack + currentBet
                                    )
                                )
                            }
                        >
                            All In
                        </Button>
                    </Flex>
                    <Flex
                        alignItems={'center'}
                        flex={1}
                        bg={'charcoal.600'}
                        roundedBottom={'lg'}
                        overflow={'hidden'}
                    >
                        <Flex
                            bg={'charcoal.400'}
                            height={'100%'}
                            alignItems={'center'}
                            p={1}
                        >
                            <LuMinus />
                        </Flex>
                        <Slider
                            aria-label="slider-ex-1"
                            marginX={3}
                            defaultValue={0}
                            value={sliderValue}
                            max={maxRaise}
                            min={minRaise}
                            onChange={(value: number) =>
                                handleSliderChange(value)
                            }
                            isDisabled={!action}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                        <Flex
                            bg={'charcoal.400'}
                            height={'100%'}
                            alignItems={'center'}
                            p={1}
                        >
                            <LuPlus />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
            <Box display={{ base: 'none', lg: 'inline-flex' }}>
                {actionButtons()}
            </Box>
        </Flex>
    );
};

export default RaiseInputBox;
