import {
  Box,
  Input,
  IconButton,
  Text,
  Flex,
  useMediaQuery,
} from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import { useState } from 'react';
import { useCurrentUser } from '../../contexts/currentUserContext';

interface Message {
  id: number;
  text: string;
  sender: string;
}

interface ChatboxProps {
  onSendMessage: (message: string) => void;
}

const Chatbox: React.FC<ChatboxProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { currentUser } = useCurrentUser();

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: currentUser.name,
      };

      setMessages([...messages, newMessage]);
      onSendMessage(`${currentUser.name}: ${message}`);
      setMessage('');
    }
  };

  const [isLargerScreen] = useMediaQuery('(min-width: 770px)');

  return (
    <Flex
      flexDirection={'column'}
      width={'100%'}
      alignItems={'center'}
      paddingY={3}
      gap={4}
      height={'100%'}
    >
      <Box
        width="95%"
        flex={1}
        height={'100%'}
        overflowY="auto"
        color={'lightGray'}
        marginTop={isLargerScreen ? 0 : 8}
      >
        {messages.map((msg) => (
          <Text key={msg.id}>
            <Text as={'span'} color={'green'} fontWeight={'bold'}>
              {msg.sender}
            </Text>
            :{' '}
            <Text
              as={'span'}
              maxWidth="100%"
              style={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
            >
              {msg.text}
            </Text>
          </Text>
        ))}
      </Box>

      <Box display="flex" alignItems="center" color={'white'} width={'95%'}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          _placeholder={{ opacity: 0.4, color: 'white' }}
          focusBorderColor="themeColor"
          placeholder="Enter message"
          marginRight={2}
          // disabled={currentUser.name === '' && currentUser.seatedAt === null}
        />
        <IconButton
          icon={<IoIosSend />}
          onClick={handleSendMessage}
          aria-label="Send"
          colorScheme="themeColor"
          variant="solid"
          border={'none'}
          _hover={{ color: 'themeColor' }}
          // disabled={currentUser.name === '' && currentUser.seatedAt === null}
        />
      </Box>
    </Flex>
  );
};

export default Chatbox;
