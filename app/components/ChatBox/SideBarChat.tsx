import {
  Box,
  IconButton,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Chatbox from './ChatBox';

export default function SideBarChat() {
  const { isOpen, onToggle } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);

  const handleSendMessage = (message: string) => {
    console.log(`Sending message: ${message}`);
  };

  const [isLargerScreen] = useMediaQuery('(min-width: 770px)');

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
      onAnimationStart={() => setHidden(false)}
      onAnimationComplete={() => setHidden(!isOpen)}
    >
      <IconButton
        icon={isOpen ? <FaChevronRight /> : <FaChevronLeft />}
        onClick={onToggle}
        aria-label={'Open Chat Box'}
        border={'none'}
        position={{ base: 'fixed', sm: 'absolute' }}
        right={!isLargerScreen ? 0 : ''}
        left={isLargerScreen ? 0 : ''}
        top={0}
        bottom={0}
        padding={{ base: 4, sm: 2 }}
        height={{ base: 'fit-content', sm: '100%' }}
        color={'lightGray'}
        _hover={{ background: 'none' }}
        _active={{ background: 'none', outline: 'none' }}
        _focus={{ outline: 'none', boxShadow: 'none' }}
      ></IconButton>
      {isOpen && (
        <Box marginLeft={{ base: 0, sm: '50px' }} height={'100%'}>
          <Chatbox onSendMessage={handleSendMessage} />
        </Box>
      )}
    </Box>
  );
}
