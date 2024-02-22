import { Card } from '@/app/interfaces';
import { getCommunityCards } from '@/app/utils/communityCards';
import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

const CommunityCards = () => {
	const communityCards = getCommunityCards();

	return (
		<Flex gap={2}>
			{communityCards.map((communityCard: Card, index: number) => {
				return (
					<Box key={index} bg={'red.200'}>
						{communityCard.value}
						{communityCard.type}
					</Box>
				);
			})}
		</Flex>
	);
};

export default CommunityCards;
