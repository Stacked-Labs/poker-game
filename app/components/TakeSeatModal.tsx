import React, { useState } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const SeatModal = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [nickname, setNickname] = useState('');
	const [valueAmount, setValueAmount] = useState('');

	const handleNicknameChange = (e: any) => setNickname(e.target.value);
	const handleValueChange = (e: any) => setValueAmount(e.target.value);

	const connectDiscord = () => {
		// Implement Discord connection logic
	};

	const connectWeb3 = () => {
		// Implement web3 connection logic
	};

	return (
		<>
			<Button onClick={onOpen}>Take a Seat</Button>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent
					as={motion.div}
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					exit={{ scale: 0.9 }}
				>
					<ModalHeader>Take a Seat</ModalHeader>
					<ModalBody>
						<Input
							placeholder="Nickname"
							value={nickname}
							onChange={handleNicknameChange}
							mb={3}
						/>
						<Input
							placeholder="Value Amount"
							type="number"
							value={valueAmount}
							onChange={handleValueChange}
						/>
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={connectDiscord}>
							Connect with Discord
						</Button>
						<Button colorScheme="teal" onClick={connectWeb3}>
							Connect with Web3
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default SeatModal;
