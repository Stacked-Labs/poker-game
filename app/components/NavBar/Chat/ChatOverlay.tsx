'use client';

import { Box, Flex, Text, useMediaQuery } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { tokenizeMessage } from '@/app/utils/chatTokenizer';
import { useEmotesData } from '@/app/hooks/useEmotesData';
import MessageRenderer from './MessageRenderer';
import { getColorForUsername } from '@/app/utils/chatColors';

type OverlayMessage = {
    id: number;
    name: string;
    message: string;
};

const FADE_DURATION_MS = 10000;

const fadeMessage = keyframes`
    0% { opacity: 0; transform: translateY(6px); }
    12% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; }
    100% { opacity: 0; }
`;

const ChatOverlay = () => {
    const { appState } = useContext(AppContext);
    const [isLandscape] = useMediaQuery('(orientation: landscape)');
    const [isLargerScreen] = useMediaQuery('(min-width: 770px)');
    const [items, setItems] = useState<OverlayMessage[]>([]);
    const prevLengthRef = useRef(0);
    const timeoutsRef = useRef<Map<number, number>>(new Map());
    const { emotesByName, emotesByNameLower, ensureLoaded } = useEmotesData();

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    useEffect(() => {
        const messages = appState.messages;

        if (messages.length < prevLengthRef.current) {
            prevLengthRef.current = messages.length;
            setItems([]);
            timeoutsRef.current.forEach((timeout) =>
                window.clearTimeout(timeout)
            );
            timeoutsRef.current.clear();
            return;
        }

        if (messages.length === prevLengthRef.current) {
            return;
        }

        const startIndex = prevLengthRef.current;
        const newMessages = messages.slice(startIndex);
        prevLengthRef.current = messages.length;

        setItems((prev) => [
            ...prev,
            ...newMessages.map((message, idx) => ({
                id: startIndex + idx,
                name: message.name,
                message: message.message,
            })),
        ]);

        newMessages.forEach((_message, idx) => {
            const id = startIndex + idx;
            const timeout = window.setTimeout(() => {
                setItems((prev) => prev.filter((item) => item.id !== id));
                timeoutsRef.current.delete(id);
            }, FADE_DURATION_MS);
            timeoutsRef.current.set(id, timeout);
        });
    }, [appState.messages]);

    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach((timeout) =>
                window.clearTimeout(timeout)
            );
            timeoutsRef.current.clear();
        };
    }, []);

    const shouldShow =
        isLandscape &&
        appState.chatOverlayEnabled &&
        !appState.isChatOpen &&
        items.length > 0;

    if (!shouldShow) {
        return null;
    }

    const overlayWidth = isLargerScreen ? '20%' : '100%';

    return (
        <Box
            position="absolute"
            right={{ base: 1, md: 4 }}
            bottom="calc(100% + 8px)"
            width={overlayWidth}
            maxW={overlayWidth}
            pointerEvents="none"
            zIndex={3}
            sx={{
                '@media (orientation: portrait)': {
                    display: 'none',
                },
            }}
        >
            <Flex
                direction="column"
                gap={2}
                p={0}
                bg="transparent"
                borderRadius="0"
                boxShadow="none"
                backdropFilter="none"
                maxH={{ base: '120px', md: '160px' }}
                overflow="hidden"
                justifyContent="flex-end"
            >
                {items.map((item) => {
                    const userColor = getColorForUsername(item.name);
                    return (
                        <Box
                            key={item.id}
                            opacity={0}
                            animation={`${fadeMessage} ${FADE_DURATION_MS}ms ease-in-out forwards`}
                        >
                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                lineHeight="1.35"
                                color={userColor}
                                whiteSpace="break-spaces"
                                opacity={0.8}
                            >
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    mr={2}
                                    color={userColor}
                                >
                                    {item.name}:
                                </Text>
                                <MessageRenderer
                                    tokens={tokenizeMessage(
                                        item.message,
                                        emotesByName,
                                        emotesByNameLower
                                    )}
                                    textColor={userColor}
                                    mentionColor={userColor}
                                />
                            </Text>
                        </Box>
                    );
                })}
            </Flex>
        </Box>
    );
};

export default ChatOverlay;
