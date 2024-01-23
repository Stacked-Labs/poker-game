'use client';

import { Button } from '@chakra-ui/react';
import React from 'react';

const ActionButton = ({ text, isFold }: { text: string; isFold: boolean }) => {
	const handleCallOnClick = () => {
		console.log('call!');
	};

	const handleRaiseOnClick = () => {
		console.log('raise!');
	};

	const handleCheckOnClick = () => {
		console.log('check!');
	};

	const handleFoldOnClick = () => {
		console.log('fold!');
	};

	let clickHandler;
	switch (text) {
		case 'Call':
			clickHandler = handleCallOnClick;
			break;
		case 'Raise':
			clickHandler = handleRaiseOnClick;
			break;
		case 'Check':
			clickHandler = handleCheckOnClick;
			break;
		case 'Fold':
			clickHandler = handleFoldOnClick;
			break;
		default:
			clickHandler = () => {
				console.log('Unknown action!');
			};
	}

	return (
		<Button
			color={isFold ? 'red' : 'green'}
			borderColor={isFold ? 'red' : 'green'}
			borderBottomWidth={4}
			padding={8}
			textTransform={'uppercase'}
			onClick={clickHandler}
		>
			{text}
		</Button>
	);
};

export default ActionButton;
