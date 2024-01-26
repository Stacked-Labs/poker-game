'use client';

import {
	Box,
	Button,
	Flex,
	FormControl,
	Input,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Text,
} from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import ActionButton from './ActionButton';
import { LuMinus, LuPlus } from 'react-icons/lu';

const Footer = () => {
	const [showRaise, setShowRaise] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<number>(0);
	const [sliderValue, setSliderValue] = useState<number>(0);

	const handleRaiseOnClick = () => {
		setShowRaise(true);
	};

	const handleSubmitRaise = () => {
		console.log('call raise backend');
	};

	const handleInputChange = (e: any) => {
		const value = parseInt(e.target.value, 10);
		setInputValue(value);
		setSliderValue(value);
	};

	const handleSliderChange = (value: number) => {
		setInputValue(value);
		setSliderValue(value);
	};

	return (
		<Flex justifyContent={'end'} gap={3}>
			{showRaise ? (
				<Flex width={'50%'} gap={2} alignItems={'center'}>
					<Box
						width={'fit-content'}
						textAlign={'center'}
						bg={'grey'}
						p={2}
						rounded={'lg'}
					>
						<Text whiteSpace={'nowrap'}>Your Bet</Text>
						<Input
							type="number"
							value={inputValue}
							min={0}
							max={100}
							onChange={handleInputChange}
						/>
					</Box>
					<Box
						bg={'grey'}
						p={2}
						rounded={'lg'}
						height={'100%'}
						flex={1}
						justifyContent={'space-between'}
					>
						<Flex height={'50%'} gap={2}>
							<Button>Min Raise</Button>
							<Button>1/2 Pot</Button>
							<Button>3/4 Pot</Button>
							<Button>Pot</Button>
							<Button>All In</Button>
						</Flex>
						<Flex alignItems={'center'} flex={1} height={'50%'}>
							<LuMinus />
							<Slider
								aria-label="slider-ex-1"
								marginX={3}
								defaultValue={0}
								value={sliderValue}
								onChange={(value) => handleSliderChange(value)}
							>
								<SliderTrack>
									<SliderFilledTrack />
								</SliderTrack>
								<SliderThumb />
							</Slider>
							<LuPlus />
						</Flex>
					</Box>
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
			) : (
				<Flex gap={2}>
					<ActionButton
						text={'Call'}
						color="green"
						clickHandler={handleRaiseOnClick}
					/>
					<ActionButton
						text={'Raise'}
						color="green"
						clickHandler={handleRaiseOnClick}
					/>
					<ActionButton
						text={'Check'}
						color="green"
						clickHandler={handleRaiseOnClick}
					/>
					<ActionButton
						text={'Fold'}
						color="red"
						clickHandler={handleRaiseOnClick}
					/>
				</Flex>
			)}
		</Flex>
	);
};

export default Footer;
