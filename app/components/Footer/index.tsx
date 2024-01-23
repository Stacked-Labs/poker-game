import { Flex } from '@chakra-ui/react';
import React from 'react';
import ActionButton from './ActionButton';

const Footer = () => {
	return (
		<Flex justifyContent={'end'} gap={3}>
			<ActionButton text="Call" isFold={false} />
			<ActionButton text="Raise" isFold={false} />
			<ActionButton text="Check" isFold={false} />
			<ActionButton text="Fold" isFold={true} />
		</Flex>
	);
};

export default Footer;
