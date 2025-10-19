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
import { HOTKEY_BACK, HOTKEY_RAISE } from './constants';

const RaiseInputBox = ({
    isCurrentTurn,
    showRaise,
    setShowRaise,
}: {
    isCurrentTurn: boolean | null;
    showRaise: boolean;
    setShowRaise: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const gameIsPaused = appState.game?.paused || false;

    const maxRaise = 100;

    const [inputValue, setInputValue] = useState<number>(0);
    const [sliderValue, setSliderValue] = useState<number>(0);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement;
            if (
                (active &&
                    (active.tagName === 'INPUT' ||
                        active.tagName === 'TEXTAREA' ||
                        (active as HTMLElement).isContentEditable)) ||
                gameIsPaused ||
                !isCurrentTurn
            ) {
                return;
            }
            const key = e.key.toLowerCase();
            console.log('index.tsx: ' + key);

            if (key === HOTKEY_BACK) {
                setShowRaise(false);
                e.preventDefault();
            }
            if (key === HOTKEY_RAISE) {
                if (
                    !gameIsPaused &&
                    isCurrentTurn &&
                    inputValue >= minRaise &&
                    inputValue <= currentStack + currentBet
                ) {
                    handleSubmitRaise(
                        appState.username,
                        inputValue - currentBet
                    );
                    e.preventDefault();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameIsPaused, appState.clientID, appState.game?.action]);

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
            <Flex flex={1} gap={2} justifyContent={'flex-end'}>
                <ActionButton
                    text={'Back'}
                    color="white"
                    clickHandler={() => setShowRaise(false)}
                    isDisabled={!isCurrentTurn || gameIsPaused}
                    hotkey={HOTKEY_BACK.slice(0, 3)}
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
                        gameIsPaused ||
                        !isCurrentTurn ||
                        inputValue < minRaise ||
                        inputValue > currentStack + currentBet
                    }
                    hotkey={HOTKEY_RAISE}
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
            className="raise-input-box"
        >
            {/* ======= MOBILE / TABLET LAYOUT (≤ lg) ======= */}
            <Flex
                direction="column"
                gap={{ base: 1.5, sm: 2 }}
                width="100%"
                display={{ base: 'flex', lg: 'none' }}
                position="relative"
                className="raise-mobile-wrapper"
            >
                {/* Row 1 – pot-size quick buttons */}
                <Flex
                    gap={2}
                    wrap="wrap"
                    justifyContent="space-between"
                    className="raise-pot-buttons-row"
                >
                    <Button
                        variant={'raiseActionButton'}
                        flex={1}
                        minW={0}
                        isDisabled={gameIsPaused || !isCurrentTurn}
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
                        flex={1}
                        minW={0}
                        isDisabled={gameIsPaused || !isCurrentTurn}
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
                        flex={1}
                        minW={0}
                        isDisabled={gameIsPaused || !isCurrentTurn}
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
                        flex={1}
                        minW={0}
                        isDisabled={gameIsPaused || !isCurrentTurn}
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
                        flex={1}
                        minW={0}
                        isDisabled={gameIsPaused || !isCurrentTurn}
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

                {/* Row 2 – amount display + Back + Raise buttons */}
                <Flex gap={2} width="100%" className="raise-actions-row">
                    {/* Amount */}
                    <Box
                        bg={'charcoal.800'}
                        rounded={'lg'}
                        flex={1}
                        p={1}
                        textAlign="center"
                        overflow={'hidden'}
                        display="flex"
                        alignItems="center"
                        minH={{ base: '36px', sm: '40px' }}
                        maxH={{ base: '44px', sm: '48px' }}
                    >
                        <Input
                            bg={'charcoal.600'}
                            border={'none'}
                            fontSize={{ base: '13px', sm: '14px' }}
                            size={'sm'}
                            width={'100%'}
                            height={'100%'}
                            type="number"
                            value={inputValue}
                            min={minRaise}
                            max={maxRaise}
                            onChange={handleInputChange}
                            focusBorderColor={'gray.300'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                            py={{ base: 1, sm: 1.5 }}
                        />
                    </Box>

                    {/* Back */}
                    <Flex flex={1}>
                        <ActionButton
                            text={'Back'}
                            color="white"
                            clickHandler={() => setShowRaise(false)}
                            isDisabled={!isCurrentTurn || gameIsPaused}
                            hotkey={HOTKEY_BACK.slice(0, 3)}
                            className="mobile-back"
                        />
                    </Flex>

                    {/* Raise */}
                    <Flex flex={1}>
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
                                gameIsPaused ||
                                !isCurrentTurn ||
                                inputValue < minRaise ||
                                inputValue > currentStack + currentBet
                            }
                            hotkey={HOTKEY_RAISE}
                            className="mobile-raise"
                        />
                    </Flex>
                </Flex>

                {/* Vertical slider overlay – absolute positioned */}
                <Box
                    position="absolute"
                    bottom="100px"
                    right={0}
                    height={{ base: '400px', sm: '260px' }}
                    width={{ base: '60px', sm: '70px' }}
                    display={{ base: 'flex', lg: 'none' }}
                    flexDirection="column"
                    bg={'charcoal.600'}
                    rounded={'lg'}
                    overflow={'hidden'}
                    zIndex={20}
                    className="raise-vertical-slider"
                >
                    <Flex
                        bg={'charcoal.400'}
                        p={1}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <LuPlus />
                    </Flex>
                    <Slider
                        orientation="vertical"
                        aria-label="raise-slider-mobile-vertical"
                        flex={1}
                        size="lg"
                        value={sliderValue}
                        max={maxRaise}
                        min={minRaise}
                        onChange={handleSliderChange}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Flex
                        bg={'charcoal.400'}
                        p={1}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <LuMinus />
                    </Flex>
                </Box>
            </Flex>

            <Flex
                direction={{
                    base: 'column-reverse',
                    md: 'column-reverse',
                    lg: 'row',
                }}
                gap={1}
                display={{ base: 'none', lg: 'flex' }}
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
                        className="raise-bet-container"
                    >
                        <Text
                            whiteSpace={'nowrap'}
                            p={1}
                            fontSize={{ base: 'xs', md: 'sm' }}
                            display={{ base: 'none', md: 'block' }}
                        >
                            Your Bet
                        </Text>
                        <Input
                            bg={'charcoal.600'}
                            border={'white'}
                            fontSize={{ base: 'xs', md: 'xl' }}
                            mb={1}
                            size={{ base: 'xs', md: 'md' }}
                            type="number"
                            value={inputValue}
                            min={minRaise}
                            max={maxRaise}
                            onChange={handleInputChange}
                            focusBorderColor={'gray.300'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                            className="raise-bet-input"
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
                    overflow={'hidden'}
                    maxW={'95vw'}
                    className="raise-slider-container"
                >
                    <Flex flex={1} gap={2} p={2}>
                        <Button
                            variant={'raiseActionButton'}
                            isDisabled={gameIsPaused || !isCurrentTurn}
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
                            isDisabled={gameIsPaused || !isCurrentTurn}
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
                            isDisabled={gameIsPaused || !isCurrentTurn}
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
                            isDisabled={gameIsPaused || !isCurrentTurn}
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
                            isDisabled={gameIsPaused || !isCurrentTurn}
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
                            isDisabled={!isCurrentTurn || gameIsPaused}
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
            <Box display={{ base: 'none', lg: 'inline-flex' }} ml={'auto'}>
                {actionButtons()}
            </Box>
        </Flex>
    );
};

export default RaiseInputBox;
