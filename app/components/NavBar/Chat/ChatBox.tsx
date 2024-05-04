import { Box, Input, IconButton, Text, Flex } from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import { useContext, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendMessage } from '@/app/hooks/server_actions';

const Chatbox = () => {
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
            >
                {appState.appState.messages.map((msg, index) => (
                    <Text key={index}>
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

            <Box
                display="flex"
                alignItems="center"
                color={'white'}
                width={'95%'}
            >
                <Input
                    bgColor={'charcoal.600'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    _placeholder={{ opacity: 0.4, color: 'white' }}
                    focusBorderColor="themeColor"
                    placeholder="Enter message"
                    marginRight={2}
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
                    disabled={username === null || username === ''}
                />
            </Box>
        </Flex>
    );
};

export default Chatbox;
