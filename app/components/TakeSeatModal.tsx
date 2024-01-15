"use client"
import React, { useState, useContext } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	Input,
	Tooltip,
	Box, 
	FormControl,
	FormLabel,
	VStack,
	Center,
	HStack,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import Web3Button from './Web3Button';
import { useAccount } from 'wagmi';
import { MetaDispatchContext } from '../state';

interface TakeSeatModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const motionStyle: MotionStyle = {
	display: 'inline-block',
	// Use colors from the theme
	color: 'white',
};

// Motion variants for animation
const variants = {
	hover: { scale: 1.5, transition: { duration: 0.3 } }, // Scale up on hover
	initial: { scale: 1 }, // Initial scale
};

const TakeSeatModal = ({ isOpen, onClose }: TakeSeatModalProps) => {
	const [name, setName] = useState('');
	const [amount, setAmount] = useState(0);
	const { address } = useAccount();
	const dispatch = useContext(MetaDispatchContext);

	const connectDiscord = () => {
		// Implement Discord connection logic
	};

	const handleJoin = () => {
		dispatch({ type: 'SET_IS_USER_SITTING', payload: true });
		dispatch({ type: 'SET_USER', payload: { address, username: name, amount } });
		onClose();
	};

	return (
			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent bgColor="gray.100">
					{/* Set modal background color */}
					<ModalHeader color="#f2f2f2" textAlign="center" p={0}>
						<Tooltip
							label="All you need is a chip and a chair - Jack  Straus "
							fontSize="lg"
							placement="top"
						>
							<Box
								as={motion.div}
								style={motionStyle}
								variants={variants}
								initial="initial"
								whileHover="hover"
								fontSize="6xl"
							>
								🪑
							</Box>
						</Tooltip>
					</ModalHeader>
					<ModalCloseButton color={'#f2f2f2'} size="42px" padding={2} />
					<ModalBody w="100% " mt={-8}>
							<Center>
								<FormControl justifyContent={'center'} w="80%">
									<FormLabel color="#f2f2f2" fontSize={'4xl'}>
										🕵️
									</FormLabel>
									<Input
										border={'1.5px solid #f2f2f2'}
										placeholder="Name"
										onChange={(e) => setName(e.target.value)}
										_placeholder={{ color: 'white' }}
										color="white"
										required
									/>
									<FormLabel mt={4} color="#f2f2f2" fontSize={'4xl'}>
										💵
									</FormLabel>
									<Input
										border={'1.5px solid #f2f2f2'}
										placeholder="Amount"
										type="number"
										onChange={(e) => setAmount(parseInt(e.target.value))}
										_placeholder={{ color: 'white' }}
										color="white"
										required
									/>
								</FormControl>
							</Center>
						</ModalBody>
						<ModalFooter>
							<VStack w={'100%'}>
								<Button
									size="lg"
									mb={4}
									w={'80%'}
									h={12}
									leftIcon={<FaDiscord />}
									bg="#7289DA"
									color="white"
									_hover={{
										borderColor: 'white',
										borderWidth: '2px',
									}}
									type="submit"
								>
									Discord
								</Button>
								<Web3Button />
								<HStack width='80%' justifyContent={'flex-end'} mt={4}>
									<Button
										size="lg"
										mb={4}
										w={'fit-content'}
										h={12}
										isDisabled={name === '' || amount === 0 || address === null}
										bg="green.500"
										color="white"
										_hover={{
											borderColor: 'white',
											borderWidth: '2px',
										}}
										onClick={() => {handleJoin()}}
										type="submit"
									>
										Join
									</Button>
								</HStack>
							</VStack>
						</ModalFooter>
				</ModalContent>
			</Modal>
	);
};

export default TakeSeatModal;
