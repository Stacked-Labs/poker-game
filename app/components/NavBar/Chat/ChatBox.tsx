'use client'

import {
    Box,
    Input,
    IconButton,
    Text,
    Flex,
    Tooltip,
    Icon,
} from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import {
    forwardRef,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
} from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendMessage } from '@/app/hooks/server_actions';
import { IoClose } from 'react-icons/io5';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useEmotesData } from '@/app/hooks/useEmotesData';
import { tokenizeMessage } from '@/app/utils/chatTokenizer';
import MessageRenderer from './MessageRenderer';
import EmotePicker from './EmotePicker';
import { FiEye, FiEyeOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getColorForUsername } from '@/app/utils/chatColors';

const ChatScroller = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>((props, ref) => (
    <Box
        ref={ref}
        {...props}
        sx={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        }}
    />
));

ChatScroller.displayName = 'ChatScroller';

const Chatbox = ({
    onToggle,
    shouldAutoFocus = false,
}: {
    onToggle: () => void;
    shouldAutoFocus?: boolean;
}) => {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState<string>('');
    const { appState, dispatch } = useContext(AppContext);
    const { username, clientID } = appState;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);
    const {
        emotesByName,
        emotesByNameLower,
        isLoading: emotesLoading,
        error: emoteError,
        ensureLoaded,
        addRecentEmoteId,
    } = useEmotesData();
    const [autocompleteOpen, setAutocompleteOpen] = useState(false);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompleteIndex, setAutocompleteIndex] = useState(0);
    const [autocompleteRange, setAutocompleteRange] = useState<{
        start: number;
        end: number;
    } | null>(null);

    const emoteList = useMemo(() => Object.values(emotesByName), [emotesByName]);
    const filteredEmotes = useMemo(() => {
        if (!autocompleteOpen) return [];
        const query = autocompleteQuery.trim().toLowerCase();
        if (!query) {
            return emoteList.slice(0, 40);
        }
        return emoteList
            .filter((emote) => emote.name.toLowerCase().startsWith(query))
            .slice(0, 40);
    }, [autocompleteOpen, autocompleteQuery, emoteList]);

    useEffect(() => {
        if (!shouldAutoFocus) {
            return;
        }

        if ((username || clientID) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [username, clientID, shouldAutoFocus]);

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    // Auto-scroll to bottom when chat opens
    useEffect(() => {
        if (!appState.isChatOpen) return;

        if (virtuosoRef.current && appState.messages.length > 0) {
            virtuosoRef.current.scrollToIndex({
                index: appState.messages.length - 1,
                align: 'end',
                behavior: 'smooth',
            });
        }
    }, [appState.isChatOpen, appState.messages.length]);

    const handleUpdateAutocomplete = (
        value: string,
        cursorPosition?: number | null
    ) => {
        const cursor = cursorPosition ?? value.length;
        const lastColon = value.lastIndexOf(':', cursor - 1);
        if (lastColon === -1) {
            setAutocompleteOpen(false);
            return;
        }

        const prevChar = value[lastColon - 1];
        if (lastColon > 0 && prevChar && !/\s/.test(prevChar)) {
            setAutocompleteOpen(false);
            return;
        }

        const segment = value.slice(lastColon + 1, cursor);
        if (segment.includes(' ') || segment.includes('\n')) {
            setAutocompleteOpen(false);
            return;
        }

        setAutocompleteOpen(true);
        setAutocompleteQuery(segment);
        setAutocompleteRange({ start: lastColon, end: cursor });
        setAutocompleteIndex(0);
    };

    const handleInsertEmote = (
        emoteName: string,
        range?: { start: number; end: number }
    ) => {
        const inputEl = inputRef.current;
        const cursor = inputEl?.selectionStart ?? message.length;
        const insertion = `:${emoteName}: `;
        const start = range?.start ?? cursor;
        const end = range?.end ?? cursor;
        const nextValue = `${message.slice(0, start)}${insertion}${message.slice(
            end
        )}`;

        setMessage(nextValue);
        setAutocompleteOpen(false);

        requestAnimationFrame(() => {
            if (!inputEl) return;
            const nextCursor = start + insertion.length;
            inputEl.focus();
            inputEl.setSelectionRange(nextCursor, nextCursor);
        });
    };

    const handleSendMessage = () => {
        console.log(appState);

        if (socket && message.trim() !== '') {
            const tokens = tokenizeMessage(
                message,
                emotesByName,
                emotesByNameLower
            );
            tokens.forEach((token) => {
                if (token.type === 'emote') {
                    addRecentEmoteId(token.id);
                }
            });
            sendMessage(socket, message);
            setMessage('');
            setAutocompleteOpen(false);
            setAutocompleteQuery('');
            setAutocompleteRange(null);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (autocompleteOpen && filteredEmotes.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setAutocompleteIndex((prev) =>
                    prev + 1 >= filteredEmotes.length ? 0 : prev + 1
                );
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setAutocompleteIndex((prev) =>
                    prev - 1 < 0 ? filteredEmotes.length - 1 : prev - 1
                );
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                const selected = filteredEmotes[autocompleteIndex];
                if (selected && autocompleteRange) {
                    handleInsertEmote(selected.name, autocompleteRange);
                }
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setAutocompleteOpen(false);
                return;
            }
        }

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
                borderColor="chat.border"
                bg="transparent"
                position="sticky"
                top={0}
                zIndex={10}
            >
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="text.secondary"
                    fontFamily="heading"
                >
                    Chat
                </Text>
                <Flex align="center" gap={2}>
                    <Tooltip
                        label={
                            appState.chatOverlayEnabled
                                ? 'Chat overlay on'
                                : 'Chat overlay off'
                        }
                        placement="top"
                    >
                        <IconButton
                            icon={
                                <Icon
                                    as={
                                        appState.chatOverlayEnabled
                                            ? FiEye
                                            : FiEyeOff
                                    }
                                    boxSize={4}
                                />
                            }
                            aria-label={
                                appState.chatOverlayEnabled
                                    ? 'Chat overlay on'
                                    : 'Chat overlay off'
                            }
                            size="sm"
                            bg="transparent"
                            color="text.secondary"
                            border="none"
                            borderRadius="8px"
                            _hover={{ bg: 'card.lightGray' }}
                            _active={{ bg: 'rgba(51, 68, 121, 0.1)' }}
                            _focus={{ outline: 'none', boxShadow: 'none' }}
                            onClick={() => {
                                const nextState = !appState.chatOverlayEnabled;
                                dispatch({
                                    type: 'setChatOverlayEnabled',
                                    payload: nextState,
                                });
                                if (nextState && appState.isChatOpen) {
                                    onToggle();
                                }
                            }}
                            sx={{
                                '@media (orientation: portrait)': {
                                    display: 'none',
                                },
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        label={
                            appState.chatSoundEnabled
                                ? 'Chat sound on'
                                : 'Chat sound muted'
                        }
                        placement="top"
                    >
                        <IconButton
                            icon={
                                <Icon
                                    as={
                                        appState.chatSoundEnabled
                                            ? FiVolume2
                                            : FiVolumeX
                                    }
                                    boxSize={4}
                                />
                            }
                            aria-label={
                                appState.chatSoundEnabled
                                    ? 'Chat sound on'
                                    : 'Chat sound muted'
                            }
                            size="sm"
                            bg="transparent"
                            color="text.secondary"
                            border="none"
                            borderRadius="8px"
                            _hover={{ bg: 'card.lightGray' }}
                            _active={{ bg: 'rgba(51, 68, 121, 0.1)' }}
                            _focus={{ outline: 'none', boxShadow: 'none' }}
                            onClick={() =>
                                dispatch({
                                    type: 'setChatSoundEnabled',
                                    payload: !appState.chatSoundEnabled,
                                })
                            }
                        />
                    </Tooltip>
                    <IconButton
                        onClick={onToggle}
                        icon={<IoClose size={20} />}
                        aria-label="Close Chat Box"
                        size="md"
                        bg="transparent"
                        color="brand.pink"
                        border="none"
                        borderRadius="8px"
                        _hover={{
                            bg: 'card.lightGray',
                        }}
                        _active={{ bg: 'rgba(51, 68, 121, 0.1)' }}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                    />
                </Flex>
            </Flex>

            {/* Messages Area */}
            <Box flex={1} overflow="hidden" bg="transparent">
                <Virtuoso
                    ref={virtuosoRef}
                    data={appState.messages}
                    overscan={200}
                    followOutput={
                        appState.isChatOpen ? 'smooth' : false
                    }
                    style={{ height: '100%' }}
                    components={{ Scroller: ChatScroller }}
                    itemContent={(index, msg) => {
                        const tokens = tokenizeMessage(
                            msg.message,
                            emotesByName,
                            emotesByNameLower
                        );
                        return (
                            <Box
                                key={`${msg.timestamp}-${index}`}
                                mb={0}
                                width="100%"
                                py={{ base: 2, md: 3 }}
                                px={{ base: 4, md: 6 }}
                                borderRadius="0"
                                bg={
                                    index % 2 === 0
                                        ? 'chat.rowEven'
                                        : 'chat.rowOdd'
                                }
                                transition="all 0.2s ease"
                                _hover={{
                                    bg:
                                        index % 2 === 0
                                            ? 'chat.rowEvenHover'
                                            : 'chat.rowOddHover',
                                }}
                            >
                                <Text
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    whiteSpace="break-spaces"
                                    lineHeight={{ base: '1.5', md: '1.6' }}
                                    display="block"
                                    width="100%"
                                >
                                    <Text
                                        as="span"
                                        color={getColorForUsername(msg.name)}
                                        fontWeight="bold"
                                        mr={{ base: 2, md: 3 }}
                                    >
                                        {msg.name}:
                                    </Text>
                                    <MessageRenderer tokens={tokens} />
                                </Text>
                            </Box>
                        );
                    }}
                />
            </Box>

            {/* Input Area */}
            <Box
                px={4}
                py={3}
                borderTop="1px solid"
                borderColor="chat.border"
                bg="transparent"
            >
                <Flex gap={2} alignItems="center">
                    <Input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleUpdateAutocomplete(
                                e.target.value,
                                e.target.selectionStart
                            );
                        }}
                        placeholder="Type a message..."
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                            const target = e.target as HTMLInputElement;
                            handleUpdateAutocomplete(
                                target.value,
                                target.selectionStart
                            );
                        }}
                        onKeyUp={(e) => {
                            const target = e.currentTarget;
                            handleUpdateAutocomplete(
                                target.value,
                                target.selectionStart
                            );
                        }}
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
                            color: 'text.secondary',
                        }}
                        _focus={{
                            bg: 'input.white',
                            boxShadow: 'var(--chakra-shadows-chat-inputFocus)',
                        }}
                        _disabled={{
                            opacity: 0.6,
                            cursor: 'not-allowed',
                        }}
                        transition="all 0.2s ease"
                    />
                    <EmotePicker
                        onSelectEmote={(emote) =>
                            handleInsertEmote(emote.name)
                        }
                        isDisabled={!username && !clientID}
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
                {autocompleteOpen && (
                    <Box
                        mt={2}
                        bg="card.white"
                        border="1px solid"
                        borderColor="chat.border"
                        borderRadius="12px"
                        boxShadow="lg"
                        maxH={{ base: '180px', md: '200px' }}
                        overflowY="scroll"
                        sx={{
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        {filteredEmotes.length > 0 ? (
                            filteredEmotes.map((emote, idx) => (
                                <Tooltip
                                    key={emote.id}
                                    label={`:${emote.name}:`}
                                    placement="right"
                                    hasArrow
                                >
                                    <Flex
                                        align="center"
                                        gap={2}
                                        px={3}
                                        py={2}
                                        cursor="pointer"
                                        bg={
                                            idx === autocompleteIndex
                                                ? 'chat.rowEven'
                                                : 'transparent'
                                        }
                                        _hover={{ bg: 'chat.rowEvenHover' }}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            if (!autocompleteRange) return;
                                            handleInsertEmote(
                                                emote.name,
                                                autocompleteRange
                                            );
                                        }}
                                    >
                                        <Box
                                            as="img"
                                            src={emote.url}
                                            alt={emote.name}
                                            height={{
                                                base: '24px',
                                                md: '28px',
                                            }}
                                            minWidth={{
                                                base: '24px',
                                                md: '28px',
                                            }}
                                            width="auto"
                                            display="inline-block"
                                            verticalAlign="middle"
                                        />
                                        <Text
                                            fontSize={{ base: 'sm', md: 'md' }}
                                            color="text.secondary"
                                        >
                                            {emote.name}
                                        </Text>
                                    </Flex>
                                </Tooltip>
                            ))
                        ) : (
                            <Box px={3} py={2}>
                                <Text fontSize="sm" color="text.secondary">
                                    {emoteError
                                        ? 'Emotes failed to load.'
                                        : emotesLoading
                                            ? 'Loading emotes...'
                                            : 'No emotes found.'}
                                </Text>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Flex>
    );
};

export default Chatbox;
