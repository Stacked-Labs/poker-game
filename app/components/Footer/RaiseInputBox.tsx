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
import React, {
    ChangeEvent,
    useContext,
    useState,
    useEffect,
    useRef,
} from 'react';
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
                    inputValue >= minAllowedBet &&
                    inputValue <= maxTotalBet
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

    const desktopInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showRaise && desktopInputRef.current) {
            desktopInputRef.current.focus();
        }
    }, [showRaise]);

    useEffect(() => {
        if (!appState.game) {
            setSliderValue(0);
            return;
        }
        const activePlayer = appState.game.players[appState.game.action];
        setSliderValue(Math.max(inputValue - activePlayer.bet, 0));
    }, [appState.game, inputValue]);

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
    const maxTotalBet = currentStack + currentBet;
    const minAllowedBet = Math.min(minRaise, maxTotalBet);
    const sliderMinValue =
        maxTotalBet > minRaise
            ? Math.max(minRaise - currentBet, 0)
            : currentStack;

    const currentPot =
        appState.game.pots.length != 0
            ? appState.game.pots[0].amount
            : bigBlind + smallBlind;

    const potBet = 3 * maxBet + currentPot - maxBet;

    const potPortion = (pot: number, fraction: number) => {
        return Math.ceil(pot * fraction);
    };

    const betValidator = (bet: number, minRaise: number, stack: number) => {
        let validatedBet = bet;

        if (stack <= minRaise) {
            validatedBet = stack;
        } else if (bet < minRaise) {
            validatedBet = minRaise;
        }

        if (validatedBet > stack) {
            validatedBet = stack;
        }

        setSliderValue(Math.max(validatedBet - currentBet, 0));
        return validatedBet;
    };

    const half =
        appState.game.pots.length != 0 ? potPortion(potBet, 0.5) : minRaise;
    const threeQuarter =
        appState.game.pots.length != 0
            ? potPortion(potBet, 0.75)
            : Math.ceil(bigBlind * 2.5);

    const full = appState.game.pots.length != 0 ? potBet : bigBlind * 3;
    const allIn = maxTotalBet;

    const handleSubmitRaise = (user: string | null, amount: number) => {
        if (socket) {
            const raiseMessage = `${user} raises ${amount}`;
            sendLog(socket, raiseMessage);
            playerRaise(socket, amount);
        }
        setShowRaise(!showRaise);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = isNaN(e.target.valueAsNumber)
            ? 0
            : e.target.valueAsNumber;
        setSliderValue(value);
        setInputValue(value + currentBet);
    };

    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        setInputValue(value + currentBet);
    };

    const handleInputOnBlur = () => {
        const value = isNaN(sliderValue) ? sliderMinValue : sliderValue;
        const validatedBet = betValidator(
            value + currentBet,
            minRaise,
            maxTotalBet
        );
        setInputValue(validatedBet);
    };

    const handleDecreaseRaise = () => {
        const newValue = betValidator(
            inputValue - bigBlind,
            minRaise,
            maxTotalBet
        );
        setInputValue(newValue);
    };

    const handleIncreaseRaise = () => {
        const newValue = betValidator(
            inputValue + bigBlind,
            minRaise,
            maxTotalBet
        );
        setInputValue(newValue);
    };

    const actionButtons = () => {
        return (
            <Flex
                flex={1}
                gap={2}
                justifyContent={'flex-end'}
                alignItems={'stretch'}
            >
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
                        inputValue < minAllowedBet ||
                        inputValue > maxTotalBet
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
            alignItems={{ base: 'center', md: 'stretch' }}
            color={'white'}
            className="raise-input-box"
            zIndex={100}
            height="100%"
            position="relative"
        >
            {/* ======= MOBILE / TABLET LAYOUT (≤ lg) ======= */}
            <Flex
                direction="column"
                gap={{ base: 1, sm: 2 }}
                width="100%"
                height="100%"
                display={{ base: 'flex', lg: 'none' }}
                position="relative"
                className="raise-mobile-wrapper"
                zIndex={9999}
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
                                betValidator(minRaise, minRaise, maxTotalBet)
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
                                betValidator(half, minRaise, maxTotalBet)
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
                                    maxTotalBet
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
                                betValidator(full, minRaise, maxTotalBet)
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
                                betValidator(allIn, minRaise, maxTotalBet)
                            )
                        }
                    >
                        All In
                    </Button>
                </Flex>

                {/* Row 2 – amount display + Back + Raise buttons */}
                <Flex
                    gap={2}
                    width="100%"
                    className="raise-actions-row"
                    height="100%"
                >
                    {/* Amount */}
                    <Box
                        bg={'brand.darkNavy'}
                        rounded={'lg'}
                        flex={1}
                        p={1}
                        textAlign="center"
                        overflow={'hidden'}
                        display="flex"
                        alignItems="center"
                        minH={{ base: '40px', md: '48px' }}
                        border="2px solid"
                        borderColor="brand.navy"
                    >
                        <Input
                            bg={'brand.navy'}
                            border={'none'}
                            fontSize={{ base: '14px', sm: '15px', md: '16px' }}
                            size={'sm'}
                            width={'100%'}
                            height={'100%'}
                            type="number"
                            value={sliderValue}
                            min={sliderMinValue}
                            max={currentStack}
                            onChange={handleInputChange}
                            focusBorderColor={'brand.green'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                            py={{ base: 1.5, sm: 2 }}
                            color="white"
                            fontWeight="bold"
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
                                inputValue < minAllowedBet ||
                                inputValue > maxTotalBet
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
                    bg="rgba(51, 68, 121, 0.6)"
                    rounded={'lg'}
                    overflow={'hidden'}
                    zIndex={10000}
                    border="2px solid"
                    borderColor="rgba(51, 68, 121, 0.8)"
                    className="raise-vertical-slider"
                    transition="all 0.2s ease-in-out"
                    _hover={{
                        bg: 'rgba(51, 68, 121, 0.9)',
                        borderColor: 'brand.darkNavy',
                    }}
                >
                    <Button
                        bg="transparent"
                        height={'auto'}
                        minH={'auto'}
                        p={1}
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        onClick={handleIncreaseRaise}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                        borderRadius={0}
                        opacity={0.7}
                        transition="all 0.2s ease-in-out"
                        _hover={{
                            bg: 'rgba(51, 68, 121, 0.8)',
                            opacity: 1,
                        }}
                        _active={{
                            bg: 'rgba(51, 68, 121, 0.9)',
                        }}
                    >
                        <LuPlus />
                    </Button>
                    <Slider
                        orientation="vertical"
                        aria-label="raise-slider-mobile-vertical"
                        flex={1}
                        size="lg"
                        value={sliderValue}
                        max={currentStack}
                        min={sliderMinValue}
                        onChange={handleSliderChange}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                        colorScheme="green"
                    >
                        <SliderTrack bg="rgb(24, 31, 56, 0.8)">
                            <SliderFilledTrack bg="brand.green" />
                        </SliderTrack>
                        <SliderThumb borderColor="brand.green" />
                    </Slider>
                    <Button
                        bg="transparent"
                        height={'auto'}
                        minH={'auto'}
                        p={1}
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        onClick={handleDecreaseRaise}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                        borderRadius={0}
                        opacity={0.7}
                        transition="all 0.2s ease-in-out"
                        _hover={{
                            bg: 'rgba(51, 68, 121, 0.8)',
                            opacity: 1,
                        }}
                        _active={{
                            bg: 'rgba(51, 68, 121, 0.9)',
                        }}
                    >
                        <LuMinus />
                    </Button>
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
                alignItems="stretch"
            >
                <Flex gap={2} justifyContent={{ base: 'end' }}>
                    <Box
                        bg={'brand.darkNavy'}
                        width={'fit-content'}
                        textAlign={'center'}
                        rounded={'lg'}
                        px={2}
                        py={2}
                        flex={1}
                        height={'100%'}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        alignItems="center"
                        border="2px solid"
                        borderColor="brand.navy"
                        className="raise-bet-container"
                    >
                        <Text
                            whiteSpace={'nowrap'}
                            fontSize={{ base: 'sm', md: 'lg' }}
                            display={{ base: 'none', md: 'block' }}
                            color="white"
                            fontWeight="bold"
                        >
                            Bet
                        </Text>
                        <Input
                            bg={'brand.navy'}
                            border={'2px solid'}
                            borderColor="brand.green"
                            fontSize={{ base: 'xs', md: 'xl' }}
                            size={{ base: 'xs', md: 'md' }}
                            type="number"
                            value={
                                sliderValue > currentStack
                                    ? currentStack
                                    : sliderValue
                            }
                            min={sliderMinValue}
                            max={currentStack}
                            onChange={handleInputChange}
                            focusBorderColor={'brand.green'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                            color="white"
                            fontWeight="bold"
                            className="raise-bet-input"
                            ref={desktopInputRef}
                            mt={'auto'}
                            width="100%"
                        />
                    </Box>
                    <Box display={{ base: 'inline-flex', lg: 'none' }} flex={2}>
                        {actionButtons()}
                    </Box>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    bg={'brand.darkNavy'}
                    rounded={'lg'}
                    flex={1}
                    justifyContent={'center'}
                    overflow={'hidden'}
                    maxW={'95vw'}
                    border="2px solid"
                    borderColor="brand.navy"
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
                                        maxTotalBet
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
                                    betValidator(half, minRaise, maxTotalBet)
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
                                        maxTotalBet
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
                                    betValidator(full, minRaise, maxTotalBet)
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
                                    betValidator(allIn, minRaise, maxTotalBet)
                                )
                            }
                        >
                            All In
                        </Button>
                    </Flex>
                    <Flex
                        alignItems={'center'}
                        flex={1}
                        bg={'brand.navy'}
                        roundedBottom={'lg'}
                        overflow={'hidden'}
                    >
                        <Button
                            bg={'brand.darkNavy'}
                            height={'100%'}
                            alignItems={'center'}
                            p={1}
                            color="white"
                            onClick={handleDecreaseRaise}
                        >
                            <LuMinus />
                        </Button>
                        <Slider
                            aria-label="slider-ex-1"
                            marginX={3}
                            value={sliderValue}
                            max={currentStack}
                            min={sliderMinValue}
                            onChange={(value: number) =>
                                handleSliderChange(value)
                            }
                            isDisabled={!isCurrentTurn || gameIsPaused}
                            colorScheme="green"
                        >
                            <SliderTrack bg="brand.darkNavy">
                                <SliderFilledTrack bg="brand.green" />
                            </SliderTrack>
                            <SliderThumb borderColor="brand.green" />
                        </Slider>
                        <Button
                            bg={'brand.darkNavy'}
                            height={'100%'}
                            alignItems={'center'}
                            p={1}
                            color="white"
                            onClick={handleIncreaseRaise}
                        >
                            <LuPlus />
                        </Button>
                    </Flex>
                </Flex>
                <Flex
                    ml={2}
                    display={{ base: 'none', lg: 'flex' }}
                    alignItems="stretch"
                >
                    {actionButtons()}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default RaiseInputBox;
