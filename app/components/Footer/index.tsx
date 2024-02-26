'use client';

import {
    Box,
    Button,
    Flex,
    Input,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
} from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import ActionButton from './ActionButton';
import { LuMinus, LuPlus } from 'react-icons/lu';

const Footer = () => {
    const maxRaise = 100;
    const minRaise = 0;

    const [showRaise, setShowRaise] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<number>(0);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [isInputFocus, setIsInputFocus] = useState<boolean>(false);

    const handleRaiseOnClick = () => {
        setShowRaise(true);
    };

    const handleSubmitRaise = () => {
        console.log('call raise backend');
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

        setIsInputFocus(false);
    };

    return (
        <Flex justifyContent={'end'} gap={3} p={2}>
            {showRaise ? (
                <Flex gap={2} alignItems={'center'}>
                    <Box
                        bg={'charcoal.800'}
                        width={'fit-content'}
                        textAlign={'center'}
                        rounded={'lg'}
                        px={0.5}
                        flex={1}
                    >
                        <Text whiteSpace={'nowrap'} p={1} fontSize={'sm'}>
                            Your Bet
                        </Text>
                        <Input
                            bg={'charcoal.600'}
                            border={'white'}
                            fontSize={'xl'}
                            mb={1}
                            type="number"
                            value={inputValue}
                            min={minRaise}
                            max={maxRaise}
                            onChange={handleInputChange}
                            focusBorderColor={'gray.300'}
                            textAlign={'center'}
                            onFocus={() => setIsInputFocus(true)}
                            onBlur={handleInputOnBlur}
                        />
                    </Box>
                    <Flex
                        flexDirection={'column'}
                        bg={'charcoal.800'}
                        rounded={'lg'}
                        flex={1}
                        justifyContent={'space-between'}
                        height={'100%'}
                        overflow={'hdden'}
                    >
                        <Flex flex={1} gap={2} p={2}>
                            <Button variant={'raiseActionButton'}>
                                Min Raise
                            </Button>
                            <Button variant={'raiseActionButton'}>
                                1/2 Pot
                            </Button>
                            <Button variant={'raiseActionButton'}>
                                3/4 Pot
                            </Button>
                            <Button variant={'raiseActionButton'}>Pot</Button>
                            <Button variant={'raiseActionButton'}>
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
                                isDisabled={isInputFocus}
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
                    <Flex flex={1} gap={2}>
                        <ActionButton
                            text={'Back'}
                            color="white"
                            clickHandler={() => setShowRaise(false)}
                        />
                        <ActionButton
                            text={'Raise'}
                            color="green"
                            clickHandler={handleSubmitRaise}
                        />
                    </Flex>
                </Flex>
            ) : (
                <Flex gap={2}>
                    <ActionButton
                        text={'Call'}
                        color="green"
                        clickHandler={() => console.log('Call Clicked')}
                    />
                    <ActionButton
                        text={'Raise'}
                        color="green"
                        clickHandler={handleRaiseOnClick}
                    />
                    <ActionButton
                        text={'Check'}
                        color="green"
                        clickHandler={() => console.log('Check Clicked')}
                    />
                    <ActionButton
                        text={'Fold'}
                        color="red"
                        clickHandler={() => console.log('Fold Clicked')}
                    />
                </Flex>
            )}
        </Flex>
    );
};

export default Footer;
