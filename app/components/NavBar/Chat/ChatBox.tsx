import { Box, Input, IconButton, Text, Flex } from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import { useContext, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendMessage } from '@/app/hooks/server_actions';
import { IoClose } from 'react-icons/io5';

const Chatbox = ({ onToggle }: { onToggle: () => void }) => {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState('');
    const appState = useContext(AppContext);
    const username = appState.appState.username;

    const handleSendMessage = () => {
        console.log(appState.appState);

        if (socket && username && message != '') {
            sendMessage(socket, username, message);
            setMessage('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <Flex flexDirection={'column'} gap={4} height={'100%'} p={3}>
            <IconButton
                onClick={onToggle}
                icon={<IoClose />}
                width={'fit-content'}
                paddingX={3}
                aria-label={'Close Chat Box'}
                border={'none'}
                fontSize={'3xl'}
                color={'lightGray'}
                justifyContent={'start'}
                _hover={{ background: 'none' }}
                _active={{ background: 'none', outline: 'none' }}
                _focus={{ outline: 'none', boxShadow: 'none' }}
            />
            <Box flex={1} height={'100%'} overflowY="auto" color={'lightGray'}>
                {appState.appState.messages.map((msg, index) => (
                    <Text key={index} whiteSpace={'break-spaces'}>
                        <Text
                            as={'span'}
                            color={'themeColor'}
                            fontWeight={'bold'}
                        >
                            {msg.name}
                        </Text>
                        : {msg.message}
                    </Text>
                ))}
            </Box>

            <Box display="flex" alignItems="center" color={'white'}>
                <Input
                    bgColor={'charcoal.600'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    _placeholder={{ opacity: 0.4, color: 'white' }}
                    focusBorderColor="themeColor"
                    placeholder="Enter message"
                    marginRight={2}
                    onKeyDown={handleKeyPress}
                    disabled={username === null || username === ''}
                />
                <IconButton
                    icon={<IoIosSend />}
                    onClick={handleSendMessage}
                    aria-label="Send"
                    colorScheme="themeColor"
                    variant="solid"
                    border={'none'}
                    _hover={{ color: 'themeColor' }}
                    fontSize={'3xl'}
                    disabled={username === null || username === ''}
                />
            </Box>
        </Flex>
    );
};

export default Chatbox;
