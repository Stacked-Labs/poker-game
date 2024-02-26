import { Card } from '@/app/interfaces';
import { getCommunityCards } from '@/app/utils/communityCards';
import { Box, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';

const CommunityCards = () => {
	const communityCards = getCommunityCards();

	return (
		<Flex gap={2}>
			{communityCards.map((communityCard: Card, index: number) => {
				return (
					<Box
						key={index}
						position={'relative'}
						width={{ base: 50, xl: 90 }}
						aspectRatio={[9 / 12, 9 / 16]}
					>
						<Image
							src={`/cards/png/${communityCard.value}_of_${communityCard.type}.png`}
							alt={`${communityCard.value}_of_${communityCard.type}`}
							objectFit="contain"
							fill
						/>
					</Box>
				);
			})}
		</Flex>
	);
};

export default CommunityCards;
