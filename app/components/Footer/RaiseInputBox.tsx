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
    useCallback,
} from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import ActionButton from './ActionButton';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { playerRaise } from '@/app/hooks/server_actions';
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

    // Calculate game-dependent values with safe defaults
    const bigBlind = appState.game?.config.bb || 0;
    const smallBlind = appState.game?.config.sb || 0;
    const currentBet =
        appState.game?.players[appState.game?.action || 0]?.bet || 0;
    const currentStack =
        appState.game?.players[appState.game?.action || 0]?.stack || 0;
    const playerBets = appState.game?.players.map((player) => player.bet) || [];
    const maxBet = playerBets.length > 0 ? Math.max(...playerBets) : 0;
    const minRaise = maxBet + (appState.game?.minRaise || 0);
    const maxTotalBet = currentStack + currentBet;
    const minAllowedBet = Math.min(minRaise, maxTotalBet);
    const sliderMinValue = minAllowedBet || 0;

    const currentPot =
        appState.game?.pots.length != 0
            ? appState.game?.pots[0].amount || 0
            : bigBlind + smallBlind;

    const potBet = 2 * maxBet + currentPot - currentBet;

    const potPortion = (pot: number, fraction: number) => {
        return Math.ceil(pot * fraction);
    };

    const betValidator = (
        bet: number,
        minRaiseTarget: number,
        maxBetAllowed: number
    ) => {
        let validatedBet = bet;

        if (maxBetAllowed <= minRaiseTarget) {
            validatedBet = maxBetAllowed;
        } else if (bet < minRaiseTarget) {
            validatedBet = minRaiseTarget;
        }

        if (validatedBet > maxBetAllowed) {
            validatedBet = maxBetAllowed;
        }

        return validatedBet;
    };

    // All hooks must be called before any early returns
    const [betValue, setBetValue] = useState<number>(sliderMinValue);
    const [betInput, setBetInput] = useState<string>(sliderMinValue.toString());

    // Update both slider and input from controls (buttons/slider), clamped
    const setBetFromControl = useCallback(
        (value: number) => {
            isTypingRef.current = false;
            const validated = betValidator(value, minRaise, maxTotalBet);
            setBetValue(validated);
            setBetInput(validated.toString());
        },
        [maxTotalBet, minRaise]
    );

    const half =
        appState.game?.pots.length != 0 ? potPortion(potBet, 0.5) : minRaise;
    const threeQuarter =
        appState.game?.pots.length != 0
            ? potPortion(potBet, 0.75)
            : Math.ceil(bigBlind * 2.5);

    const full = appState.game?.pots.length != 0 ? potBet : bigBlind * 3;
    const allIn = maxTotalBet;

    const handleSubmitRaise = useCallback(
        (targetBet: number) => {
            if (socket) {
                playerRaise(socket, targetBet);
            }
            setShowRaise(false);
        },
        [socket, setShowRaise]
    );

    const desktopInputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const isTypingRef = useRef(false);

    useEffect(() => {
        if (showRaise && desktopInputRef.current) {
            desktopInputRef.current.focus();
        }
    }, [showRaise]);

    // Helper to check if any input is currently focused
    const isInputFocused = () => {
        const active = document.activeElement;
        return (
            active === desktopInputRef.current ||
            active === mobileInputRef.current
        );
    };

    // Helper to get the current effective bet value for validation/submission
    // Uses betInput if input is focused (user is typing), otherwise uses betValue
    // Not using useCallback to avoid stale closures - this is called in render
    const getCurrentBetValue = (): number => {
        if (isInputFocused()) {
            const parsed = parseFloat(betInput);
            return isNaN(parsed) ? 0 : parsed;
        }
        return betValue;
    };

    useEffect(() => {
        // Keep local value in sync if min/max boundaries shift (e.g., pots update)
        // NEVER clamp while user is typing or input is focused - allow intermediate invalid values
        if (isTypingRef.current || !appState.game || isInputFocused()) {
            return;
        }

        // Only clamp if value is out of bounds and input is not focused
        // This allows users to type intermediate values like "2" when typing "23"
        if (betValue < sliderMinValue) {
            setBetFromControl(sliderMinValue);
        } else if (betValue > maxTotalBet) {
            setBetFromControl(maxTotalBet);
        }
    }, [
        betValue,
        maxTotalBet,
        setBetFromControl,
        sliderMinValue,
        appState.game,
    ]);

    useEffect(() => {
        if (!showRaise || !isCurrentTurn || gameIsPaused || !appState.game) {
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            const isEditableElement =
                active &&
                (active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable);
            const isRaiseInput =
                isEditableElement && active.closest('.raise-input-box');

            if (isEditableElement && !isRaiseInput) {
                return;
            }

            const key = e.key.toLowerCase();

            if (key === HOTKEY_BACK) {
                setShowRaise(false);
                e.preventDefault();
                return;
            }

            const currentValue = getCurrentBetValue();
            if (
                key === HOTKEY_RAISE &&
                currentValue >= minAllowedBet &&
                currentValue <= maxTotalBet
            ) {
                handleSubmitRaise(currentValue);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        showRaise,
        isCurrentTurn,
        gameIsPaused,
        betInput,
        betValue,
        minAllowedBet,
        maxTotalBet,
        handleSubmitRaise,
        setShowRaise,
        appState.game,
    ]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        isTypingRef.current = true;

        // Only update the input text while typing - don't update betValue
        // This allows users to type intermediate invalid values like "2" when typing "23"
        setBetInput(raw);

        // Don't update betValue here - it will be validated on blur
        // This prevents clamping from interrupting typing
    };

    const handleSliderChange = (value: number) => {
        setBetFromControl(value);
    };

    const handleInputOnBlur = () => {
        const parsed = parseFloat(betInput);
        const validatedBet = betValidator(
            isNaN(parsed) ? sliderMinValue : parsed,
            minRaise,
            maxTotalBet
        );

        // Snap to boundaries only on blur to avoid mid-typing jumps
        setBetFromControl(validatedBet);
        isTypingRef.current = false;
    };

    const handleDecreaseRaise = () => {
        const newValue = betValidator(
            betValue - bigBlind,
            minRaise,
            maxTotalBet
        );
        setBetFromControl(newValue);
    };

    const handleIncreaseRaise = () => {
        const newValue = betValidator(
            betValue + bigBlind,
            minRaise,
            maxTotalBet
        );
        setBetFromControl(newValue);
    };

    const actionButtons = () => {
        return (
            <Flex
                className="raise-action-buttons-group"
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
                    clickHandler={() => {
                        const currentValue = getCurrentBetValue();
                        handleSubmitRaise(currentValue);
                    }}
                    isDisabled={
                        gameIsPaused ||
                        !isCurrentTurn ||
                        getCurrentBetValue() < minAllowedBet ||
                        getCurrentBetValue() > maxTotalBet
                    }
                    hotkey={HOTKEY_RAISE}
                />
            </Flex>
        );
    };

    // Early return after all hooks are declared
    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            gap={2}
            color={'white'}
            className="raise-input-box"
            zIndex={100}
            height="100%"
            width="100%"
            position="relative"
            sx={{
                '@media (orientation: portrait)': {
                    flexDirection: 'column',
                    alignItems: 'center',
                },
                '@media (orientation: landscape)': {
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'flex-end',
                },
            }}
        >
            {/* ======= PORTRAIT LAYOUT ======= */}
            <Flex
                direction="row"
                gap="0.5cqw"
                width="100%"
                height="100%"
                position="relative"
                className="raise-portrait-wrapper"
                zIndex={9999}
                sx={{
                    '@media (orientation: portrait)': {
                        display: 'flex',
                    },
                    '@media (orientation: landscape)': {
                        display: 'none',
                    },
                }}
            >
                <Box
                    className="raise-portrait-amount-box"
                    bg={'brand.darkNavy'}
                    rounded={'lg'}
                    flex={1}
                    position="absolute"
                    bottom={'70px'}
                    p="0.5cqh"
                    textAlign="center"
                    overflow={'hidden'}
                    display="flex"
                    alignItems="center"
                    minH="5cqh"
                    border="2px solid"
                    borderColor="brand.navy"
                >
                    <Input
                        className="raise-portrait-bet-input"
                        ref={mobileInputRef}
                        bg={'brand.navy'}
                        border={'none'}
                        fontSize="8cqw"
                        size={'sm'}
                        width={'100%'}
                        height={'100%'}
                        type="number"
                        inputMode="numeric"
                        value={betInput}
                        min={sliderMinValue}
                        max={maxTotalBet}
                        onChange={handleInputChange}
                        onFocus={() => {
                            isTypingRef.current = true;
                        }}
                        focusBorderColor={'brand.green'}
                        textAlign={'center'}
                        onBlur={handleInputOnBlur}
                        py="1cqh"
                        color="white"
                        fontWeight="bold"
                    />
                </Box>
                {/* pot-size quick buttons in two rows, two buttons each, right-aligned in landscape */}
                <Flex
                    direction="column"
                    gap="0.5cqw"
                    className="raise-portrait-pot-buttons"
                    alignItems="stretch"
                    sx={{
                        '@media (orientation: landscape)': {
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 'auto',
                            alignItems: 'flex-end',
                            zIndex: 2,
                        },
                    }}
                >
                    <Flex
                        gap="0.5cqw"
                        width="100%"
                        justifyContent={{ base: 'stretch', lg: 'flex-end' }}
                    >
                        <Button
                            variant={'raiseActionButton'}
                            flex={1}
                            minW={0}
                            isDisabled={gameIsPaused || !isCurrentTurn}
                            onClick={() =>
                                setBetFromControl(
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
                                setBetFromControl(
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
                    </Flex>
                    <Flex
                        gap="0.5cqw"
                        width="100%"
                        justifyContent={{ base: 'stretch', lg: 'flex-end' }}
                    >
                        <Button
                            variant={'raiseActionButton'}
                            flex={1}
                            minW={0}
                            isDisabled={gameIsPaused || !isCurrentTurn}
                            onClick={() =>
                                setBetFromControl(
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
                                setBetFromControl(
                                    betValidator(allIn, minRaise, maxTotalBet)
                                )
                            }
                        >
                            All In
                        </Button>
                    </Flex>
                </Flex>

                {/* Row 2 – amount display + Back + Raise buttons */}
                <Flex
                    gap="1cqw"
                    width="100%"
                    className="raise-portrait-actions-row"
                    height="100%"
                >
                    {/* Amount */}

                    {/* Back */}
                    <Flex className="raise-portrait-back-wrapper" flex={1}>
                        <ActionButton
                            text={'Back'}
                            color="white"
                            clickHandler={() => setShowRaise(false)}
                            isDisabled={!isCurrentTurn || gameIsPaused}
                            hotkey={HOTKEY_BACK.slice(0, 3)}
                            className="portrait-back"
                        />
                    </Flex>

                    {/* Raise */}
                    <Flex className="raise-portrait-raise-wrapper" flex={1}>
                        <ActionButton
                            text={'Raise'}
                            color="green"
                            clickHandler={() => {
                                const currentValue = getCurrentBetValue();
                                handleSubmitRaise(currentValue);
                            }}
                            isDisabled={
                                gameIsPaused ||
                                !isCurrentTurn ||
                                getCurrentBetValue() < minAllowedBet ||
                                getCurrentBetValue() > maxTotalBet
                            }
                            hotkey={HOTKEY_RAISE}
                            className="portrait-raise"
                        />
                    </Flex>
                </Flex>

                {/* Vertical slider overlay – absolute positioned */}
                <Box
                    position="absolute"
                    bottom="70px"
                    right={0}
                    height={{ base: '400px', sm: '350px' }}
                    width={{ base: '60px', sm: '60px' }}
                    flexDirection="column"
                    bg="rgba(51, 68, 121, 0.6)"
                    rounded={'lg'}
                    overflow={'hidden'}
                    zIndex={10000}
                    border="2px solid"
                    borderColor="rgba(51, 68, 121, 0.8)"
                    className="raise-portrait-vertical-slider"
                    transition="all 0.2s ease-in-out"
                    _hover={{
                        bg: 'rgba(51, 68, 121, 0.9)',
                        borderColor: 'brand.darkNavy',
                    }}
                    sx={{
                        '@media (orientation: portrait)': {
                            display: 'flex',
                        },
                        '@media (orientation: landscape)': {
                            display: 'none',
                        },
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
                        value={betValue}
                        max={maxTotalBet}
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

            {/* ======= LANDSCAPE LAYOUT ======= */}
            <Flex
                className="raise-landscape-wrapper"
                flexDirection="row"
                gap="0.3cqw"
                alignItems="stretch"
                sx={{
                    '@media (orientation: portrait)': {
                        display: 'none',
                    },
                    '@media (orientation: landscape)': {
                        display: 'flex',
                    },
                }}
            >
                <Flex
                    className="raise-landscape-bet-row"
                    gap="0.3cqw"
                    justifyContent="flex-end"
                >
                    <Box
                        bg={'brand.darkNavy'}
                        width={'fit-content'}
                        textAlign={'center'}
                        rounded={'lg'}
                        px="0.5cqw"
                        py="0.5cqh"
                        flex={1}
                        height={'100%'}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        alignItems="center"
                        border="2px solid"
                        borderColor="brand.navy"
                        className="raise-landscape-bet-container"
                    >
                        <Text
                            whiteSpace={'nowrap'}
                            fontSize="1cqw"
                            color="white"
                            fontWeight="bold"
                        >
                            Bet
                        </Text>
                        <Input
                            bg={'brand.navy'}
                            border={'2px solid'}
                            borderColor="brand.green"
                            fontSize={{ base: 'xs', sm: 'sm', md: 'lg' }}
                            size={{ base: 'xs', md: 'md' }}
                            type="number"
                            inputMode="numeric"
                            value={betInput}
                            min={sliderMinValue}
                            max={maxTotalBet}
                            onChange={handleInputChange}
                            onFocus={() => {
                                isTypingRef.current = true;
                            }}
                            focusBorderColor={'brand.green'}
                            textAlign={'center'}
                            onBlur={handleInputOnBlur}
                            color="white"
                            fontWeight="bold"
                            className="raise-landscape-bet-input"
                            ref={desktopInputRef}
                            mt={'auto'}
                            width="100%"
                            height="100%"
                        />
                    </Box>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    bg={'brand.darkNavy'}
                    rounded={'lg'}
                    flex={1}
                    justifyContent={'center'}
                    overflow={'hidden'}
                    maxW={'60cqw'}
                    border="2px solid"
                    borderColor="brand.navy"
                    className="raise-landscape-slider-container"
                >
                    <Flex
                        className="raise-landscape-pot-buttons"
                        flex={1}
                        height="60%"
                        gap="0.3cqw"
                        p="0.3cqw"
                    >
                        <Button
                            variant={'raiseActionButton'}
                            isDisabled={gameIsPaused || !isCurrentTurn}
                            onClick={() =>
                                setBetFromControl(
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
                                setBetFromControl(
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
                                setBetFromControl(
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
                                setBetFromControl(
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
                                setBetFromControl(
                                    betValidator(allIn, minRaise, maxTotalBet)
                                )
                            }
                        >
                            All In
                        </Button>
                    </Flex>
                    <Flex
                        className="raise-landscape-slider-track"
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
                            p="0.3cqw"
                            color="white"
                            onClick={handleDecreaseRaise}
                        >
                            <LuMinus />
                        </Button>
                        <Slider
                            aria-label="raise-slider-landscape"
                            marginX="0.5cqw"
                            value={betValue}
                            max={maxTotalBet}
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
                    className="raise-landscape-actions-wrapper"
                    ml="0.5cqw"
                    alignItems="stretch"
                >
                    {actionButtons()}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default RaiseInputBox;
