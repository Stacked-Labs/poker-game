import React, { FC, FormEvent, useEffect, useState } from 'react';
import {
	Button,
	Box,
	Icon,
	Modal,
	Tooltip,
	VStack,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	FormControl,
	FormLabel,
	Input,
	useDisclosure,
	Spinner,
	Center,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/ethers/react';
import { useAccount } from 'wagmi';
import TakeSeatModal from './TakeSeatModal';
import { User } from '../interfaces';

const MotionButton = motion(Button);

interface TakenSeatButtonProps {
	player: User;
}

const TakenSeatButton: React.FC<TakenSeatButtonProps> = ({ player }) => {
	const [isLoading, setIsLoading] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<MotionButton
				width="100%"
				h="80%"
				color="gray.200"
				bgColor="gray.50"
				onClick={onOpen}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				isLoading={isLoading}
				textColor="white"
				borderRadius={10}
				spinner={<Spinner color="green.100" size="lg" />}
				border="2px dashed white"
				// fontSize={['2xl', '3xl', '4xl']}
				fontFamily="sans-serif"
			>
				taken
			</MotionButton>

			<TakeSeatModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default TakenSeatButton;
