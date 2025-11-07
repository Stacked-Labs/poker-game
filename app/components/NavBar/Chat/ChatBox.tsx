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
        <Flex flexDirection="column" gap={0} height="100%" bg="card.white">
            {/* Chat Header */}
            <Flex
                align="center"
                justify="space-between"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                bg="transparent"
            >
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="text.secondary"
                    fontFamily="heading"
                >
                    Chat
                </Text>
                <IconButton
                    onClick={onToggle}
                    icon={<IoClose />}
                    aria-label="Close Chat Box"
                    size="md"
                    bg="transparent"
                    color="text.secondary"
                    border="none"
                    borderRadius="8px"
                    _hover={{
                        bg: 'card.lightGray',
                    }}
                    _active={{ bg: 'rgba(51, 68, 121, 0.1)' }}
                    _focus={{ outline: 'none', boxShadow: 'none' }}
                />
            </Flex>

            {/* Messages Area */}
            <Box
                flex={1}
                overflowY="auto"
                px={4}
                py={3}
                bg="transparent"
                css={{
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(51, 68, 121, 0.2)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(51, 68, 121, 0.3)',
                    },
                }}
            >
                {appState.appState.messages.map((msg, index) => (
                    <Box
                        key={index}
                        mb={3}
                        p={3}
                        borderRadius="12px"
                        bg="input.lightGray"
                        transition="all 0.2s ease"
                        _hover={{
                            bg: "card.lightGray",
                        }}
                    >
                        <Text
                            color="text.secondary"
                            fontSize="md"
                            whiteSpace="break-spaces"
                            lineHeight="1.5"
                        >
                            <Text
                                as="span"
                                color={getColorForUsername(msg.name)}
                                fontWeight="bold"
                                mr={1}
                            >
                                {msg.name}:
                            </Text>
                            {msg.message}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Input Area */}
            <Box
                px={4}
                py={3}
                borderTop="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                bg="transparent"
            >
                <Flex gap={2} alignItems="center">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={handleKeyPress}
                        disabled={!username && !clientID}
                        flex={1}
                        height="48px"
                        bg="input.lightGray"
                        color="text.secondary"
                        border="none"
                        borderRadius="12px"
                        fontSize="md"
                        fontWeight="light"
                        px={4}
                        _placeholder={{
                            color: "text.secondary",
                        }}
                        _focus={{
                            bg: 'input.white',
                            boxShadow: '0 0 0 2px rgba(51, 68, 121, 0.2)',
                        }}
                        _disabled={{
                            opacity: 0.6,
                            cursor: 'not-allowed',
                        }}
                        transition="all 0.2s ease"
                    />
                    <IconButton
                        icon={<IoIosSend size={28} />}
                        onClick={handleSendMessage}
                        aria-label="Send Message"
                        disabled={!username && !clientID}
                        size="lg"
                        height="48px"
                        width="48px"
                        bg="brand.green"
                        color="white"
                        border="none"
                        borderRadius="12px"
                        _hover={{
                            bg: 'brand.green',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(54, 163, 123, 0.4)',
                        }}
                        _active={{
                            transform: 'translateY(0)',
                        }}
                        _disabled={{
                            opacity: 0.5,
                            cursor: 'not-allowed',
                        }}
                        transition="all 0.2s ease"
                    />
                </Flex>
            </Box>
        </Flex>
    );
};

export default Chatbox;
