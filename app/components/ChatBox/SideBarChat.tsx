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

export default function SideBarChat() {
  const { isOpen, onToggle } = useDisclosure();

  const handleSendMessage = (message: string) => {
    console.log(`Sending message: ${message}`);
  };

  const [isLargerScreen] = useMediaQuery('(min-width: 1025px)');

  return (
    <Box
      as={motion.div}
      initial={false}
      animate={{ width: isOpen ? (!isLargerScreen ? '100%' : 500) : 50 }}
      background={isOpen ? 'black' : 'none'}
      overflow={'hidden'}
      whiteSpace={'nowrap'}
      position={'absolute'}
      right={'0'}
      height={'100%'}
      top={'0'}
    >
      <IconButton
        icon={isOpen ? <IoMdClose /> : <IoChatbox />}
        onClick={onToggle}
        aria-label={'Open Chat Box'}
        border={'none'}
        position={'absolute'}
        right={3}
        top={3}
        fontSize={isOpen ? '24' : '30'}
        _hover={{ background: 'none' }}
        _active={{ background: 'none', outline: 'none' }}
        _focus={{ outline: 'none', boxShadow: 'none' }}
      ></IconButton>
      {isOpen && (
        <Box height={'100%'}>
          <Chatbox onSendMessage={handleSendMessage} />
        </Box>
      )}
    </Box>
  );
}
