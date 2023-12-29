// HomeCard.js
import React from 'react';
import { Flex, Button, IconButton } from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaInstagram } from 'react-icons/fa';

const HomeCard = () => {
	return (
		<Flex
			position="absolute"
			top="30%"
			left="17%"
			direction="column"
			justify="center"
			align="center"
			height="40%"
			borderRadius={32}
			width="66%"
			bgColor="gray.100"
		>
			<Button size="lg" mb={4} w={200} h={20}>
				Play Now
			</Button>
			<Button size="lg" mb={4} w={200} h={20}>
				Connect
			</Button>
			<Flex
				direction="row"
				justify="center"
				align="center"
				gap={12}
				position={'absolute'}
				bottom={8}
				left={0}
				right={0}
			>
				<IconButton
					aria-label="X"
					variant="social"
					icon={<RiTwitterXLine color="white" size={36} />}
					w={12}
					h={12}
					size="lg"
				/>
				<IconButton
					aria-label="Discord"
					variant="social"
					icon={<FaDiscord color="white" size={36} />}
					size="lg"
				/>
				<IconButton
					aria-label="Instagram"
					variant="social"
					icon={<FaInstagram color="white" size={36} />}
					size="lg"
				/>
			</Flex>
		</Flex>
	);
};

export default HomeCard;
