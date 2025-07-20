import { Box, Input, IconButton, Text, Flex } from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import { useContext, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendMessage } from '@/app/hooks/server_actions';
import { IoClose } from 'react-icons/io5';

function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((c) => c + c)
            .join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function colorDistance(
    rgb1: [number, number, number],
    rgb2: [number, number, number]
): number {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

function getRandomHexColor(): string {
    const forbiddenColors = ['#121212', '#ffffff']; // background
    const forbiddenRGBs = forbiddenColors.map(hexToRgb);
    const minDistance = 80; // tweak as needed for contrast
    let color = '';
    let attempts = 0;
    do {
        const hex = Math.floor(Math.random() * 0xffffff).toString(16);
        color = `#${hex.padStart(6, '0')}`;
        const rgb = hexToRgb(color);
        attempts++;
        // forbidden colors and those too close to each other
    } while (
        forbiddenRGBs.some(
            (forbidden) =>
                colorDistance(hexToRgb(color), forbidden) < minDistance
        ) &&
        attempts < 20
    );
    return color;
}

const usernameColorMap: Record<string, string> = {};
function getColorForUsername(username: string): string {
    if (!usernameColorMap[username]) {
        usernameColorMap[username] = getRandomHexColor();
    }
    return usernameColorMap[username];
}

const Chatbox = ({ onToggle }: { onToggle: () => void }) => {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState('');
    const appState = useContext(AppContext);
    const { username, clientID } = appState.appState;

    const handleSendMessage = () => {
        console.log(appState.appState);

        if (socket && message != '') {
            sendMessage(socket, message);
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
                    <Text
                        key={index}
                        whiteSpace={'break-spaces'}
                        fontSize={'lg'}
                        mb={2}
                        lineHeight="1.5"
                        textStyle={'nowrap'}
                    >
                        <Text
                            as={'span'}
                            color={getColorForUsername(msg.name)}
                            fontWeight={'bold'}
                            fontSize={'lg'}
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
                    marginRight={3}
                    onKeyDown={handleKeyPress}
                    disabled={!username && !clientID}
                    fontSize={'lg'}
                    height={'50px'}
                    padding={4}
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
                    size={'lg'}
                    height={'50px'}
                    width={'50px'}
                    disabled={!username && !clientID}
                />
            </Box>
        </Flex>
    );
};

export default Chatbox;
