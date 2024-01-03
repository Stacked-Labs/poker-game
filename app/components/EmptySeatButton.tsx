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
	Text,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { FaDiscord, FaWallet } from 'react-icons/fa';
import { AiOutlineDisconnect } from 'react-icons/ai';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/ethers/react';
import { EmptySeatButtonProps } from '../interfaces';
import { useCurrentUser } from '../contexts/currentUserContext';
import { useAccount, useDisconnect } from 'wagmi';

const MotionButton = motion(Button);

const EmptySeatButton: FC<EmptySeatButtonProps> = ({
	seats,
	handleSetSeats,
	seatIndex,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { open: openWeb3Modal } = useWeb3Modal();
	const { open: openWeb3ModalState } = useWeb3ModalState();
	const { isDisconnected } = useAccount();
	const { disconnect } = useDisconnect();

	const [buttonType, setButtonType] = useState('discord' || 'connect');

	const [name, setName] = useState('');
	const [amount, setAmount] = useState(0);

	const { currentUser, setCurrentUser } = useCurrentUser();

	const handleResetSeats = (index: number) => {
		setCurrentUser({ name: '', amount: 0, seatedAt: null });

		const newSeats = [...seats];
		newSeats[index] = {
			player: null,
		};

		handleSetSeats(newSeats);
	};

	const handleSeats = (index: number) => {
		const newSeats = [...seats];

		if (
			currentUser.name !== '' &&
			currentUser.seatedAt !== null &&
			index !== currentUser.seatedAt
		) {
			newSeats[index] = {
				player: { name: currentUser.name, earnings: currentUser.amount },
			};
			newSeats[currentUser.seatedAt] = { player: null };
			setCurrentUser({ ...currentUser, seatedAt: index });
		} else {
			newSeats[index] = {
				player: { name: name, earnings: amount },
			};
			setCurrentUser({ name, amount, seatedAt: index });
		}

		handleSetSeats(newSeats);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (buttonType === 'discord') {
			handleDiscordButtonClick(seatIndex);
		} else if (buttonType === 'connect') {
			handleConnectButtonClick(seatIndex);
		}
	};

	const handleOpenModal = () => {
		setIsLoading(true);
		onOpen();
	};

	const handleCloseModal = () => {
		setIsLoading(false);
		onClose();
	};

	const handleConnectButtonClick = (index: number) => {
		openWeb3Modal();
		if (!isDisconnected) {
			handleSeats(index);
		}
		onClose();
	};

	const handleDiscordButtonClick = (index: number) => {
		handleSeats(index);
		handleCloseModal();
	};

	const handleTransferButtonClicked = () => {
		handleSeats(seatIndex);
		handleCloseModal();
	};

	const handleDisconnectButtonClick = () => {
		if (currentUser.seatedAt) {
			if (!isDisconnected) {
				disconnect();
			}

			handleResetSeats(currentUser.seatedAt);
			handleCloseModal();
		}
	};

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

	useEffect(() => {
		if (!openWeb3ModalState) {
			setIsLoading(false);
		}
	}, [openWeb3ModalState]);

	return (
		<>
			<MotionButton
				width={['100%', '250px', '300px']}
				height={['40px', '65px']}
				color="gray.200"
				bgColor="gray.50"
				onClick={handleOpenModal}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				isLoading={isLoading}
				textColor="white"
				borderRadius={40}
				spinner={<Spinner color="green.100" size="lg" />}
				border="2px dashed white"
				fontSize={['4xl', '5xl', '6xl']}
				fontFamily="sans-serif"
			>
				{seatIndex === currentUser.seatedAt ? currentUser.name : '🪑'}
			</MotionButton>

			{!currentUser.seatedAt ? (
				<Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
					<ModalOverlay />
					<ModalContent bgColor="gray.100">
						{/* Set modal background color */}
						<ModalHeader color="#f2f2f2" textAlign="center">
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
						<form onSubmit={handleSubmit}>
							<ModalBody w="100%">
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
											// required
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
											// required
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
										leftIcon={<Icon as={FaDiscord} color="white" />}
										bg="#7289DA"
										color="white"
										_hover={{
											borderColor: 'white',
											borderWidth: '2px',
										}}
										type="submit"
										onClick={() => setButtonType('discord')}
									>
										Discord
									</Button>
									<Button
										size="lg"
										mb={4}
										w={'80%'}
										h={12}
										leftIcon={<Icon as={FaWallet} color="white" />}
										bg="green.500" // Replace with a specific green color from theme if available
										color="white"
										_hover={{
											borderColor: 'white',
											borderWidth: '2px',
										}}
										type="submit"
										onClick={() => setButtonType('connect')}
									>
										Connect
									</Button>
								</VStack>
							</ModalFooter>
						</form>
					</ModalContent>
				</Modal>
			) : (
				<Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
					<ModalOverlay />
					<ModalContent bgColor="gray.100">
						<ModalCloseButton color={'#f2f2f2'} size="42px" padding={2} />
						<ModalBody w="100%" marginTop="42px">
							<Center>
								<Text fontSize="xl">{currentUser.name}</Text>
							</Center>
						</ModalBody>
						<ModalFooter>
							<VStack w={'100%'}>
								{seatIndex !== currentUser.seatedAt ? (
									<Button
										size="lg"
										mb={4}
										w={'80%'}
										h={12}
										leftIcon={<Icon as={AiOutlineDisconnect} color="white" />}
										bg="blue.500" // Replace with a specific green color from theme if available
										color="white"
										_hover={{
											borderColor: 'white',
											borderWidth: '2px',
										}}
										onClick={handleTransferButtonClicked}
									>
										Transfer
									</Button>
								) : (
									<Button
										size="lg"
										mb={4}
										w={'80%'}
										h={12}
										leftIcon={<Icon as={AiOutlineDisconnect} color="white" />}
										bg="red.500" // Replace with a specific green color from theme if available
										color="white"
										_hover={{
											borderColor: 'white',
											borderWidth: '2px',
										}}
										onClick={handleDisconnectButtonClick}
									>
										Disconnect
									</Button>
								)}
							</VStack>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</>
	);
};

export default EmptySeatButton;
