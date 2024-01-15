import {
	Box,
	IconButton,
	useDisclosure,
	useMediaQuery,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IoChatbox } from 'react-icons/io5';
import Chatbox from './ChatBox';
import { IoMdClose } from 'react-icons/io';
import { FC, useEffect } from 'react';

interface SideBarChatProps {
	handleOpen: (isOpen: boolean) => void;
}

const SideBarChat: FC<SideBarChatProps> = ({ handleOpen }) => {
	const { isOpen, onToggle } = useDisclosure();

	const handleSendMessage = (message: string) => {
		console.log(`Sending message: ${message}`);
	};

	const [isLargerScreen] = useMediaQuery('(min-width: 1025px)');

	useEffect(() => {
		handleOpen(isOpen);
	}, [isOpen, handleOpen]);

	return (
		<>
			<IconButton
				icon={isOpen ? <IoMdClose /> : <IoChatbox />}
				onClick={onToggle}
				aria-label={'Open Chat Box'}
				border={'none'}
				fontSize={isOpen ? '24' : '30'}
				_hover={{ background: 'none' }}
				_active={{ background: 'none', outline: 'none' }}
				_focus={{ outline: 'none', boxShadow: 'none' }}
				zIndex={isOpen ? 4 : 1}
			></IconButton>
			<Box
				as={motion.div}
				initial={false}
				animate={{ width: isOpen ? (!isLargerScreen ? '100%' : 500) : 0 }}
				background={isOpen ? 'black' : 'none'}
				overflow={'hidden'}
				whiteSpace={'nowrap'}
				position={'absolute'}
				right={'0'}
				height={'100%'}
				top={'0'}
				zIndex={2}
			>
				{isOpen && (
					<Box height={'100%'}>
						<Chatbox onSendMessage={handleSendMessage} />
					</Box>
				)}
			</Box>
		</>
	);
};

export default SideBarChat;
