'use client';

import {
    Box,
    IconButton,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    Tooltip,
    useColorModeValue,
    Portal,
    useDisclosure,
    type PopoverContentProps,
    type PopoverBodyProps,
    type PopoverArrowProps,
    type ResponsiveValue,
} from '@chakra-ui/react';
import { FiSmile } from 'react-icons/fi';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    type ReactElement,
} from 'react';
import { useEmotesData } from '@/app/hooks/useEmotesData';
import type { Emote } from '@/app/stores/emotes';

const EmotePicker = ({
    onSelectEmote,
    isDisabled,
    trigger,
    columns = 5,
    maxHeight = { base: '420px', md: '470px' },
    width = { base: '360px', md: '420px' },
    showSearch = true,
    popoverContentProps,
    popoverBodyProps,
    popoverArrowProps,
}: {
    onSelectEmote: (emote: Emote) => void;
    isDisabled?: boolean;
    trigger?: ReactElement;
    columns?: number;
    maxHeight?: ResponsiveValue<string | number>;
    width?: ResponsiveValue<string | number>;
    showSearch?: boolean;
    popoverContentProps?: Partial<PopoverContentProps>;
    popoverBodyProps?: Partial<PopoverBodyProps>;
    popoverArrowProps?: Partial<PopoverArrowProps>;
}) => {
    const {
        emotesByName,
        emotesById,
        recentEmoteIds,
        isLoading: emotesLoading,
        error: emotesError,
        ensureLoaded,
        addRecentEmoteId,
    } = useEmotesData();
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(80);
    const scrollRef = useRef<HTMLDivElement>(null);
    const emoteHoverBg = useColorModeValue(
        'rgba(0, 0, 0, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    const emoteActiveBg = useColorModeValue(
        'rgba(0, 0, 0, 0.12)',
        'rgba(255, 255, 255, 0.14)'
    );
    const { isOpen, onOpen, onClose } = useDisclosure();
    const handleOpen = useCallback(() => {
        if (isDisabled) return;
        ensureLoaded();
        onOpen();
    }, [ensureLoaded, isDisabled, onOpen]);

    const emotes = useMemo(() => {
        const list = Object.values(emotesByName);
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }, [emotesByName]);
    const filteredEmotes = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return emotes;
        }
        return emotes.filter((emote) =>
            emote.name.toLowerCase().includes(query)
        );
    }, [emotes, search]);

    const visibleEmotes = useMemo(
        () => filteredEmotes.slice(0, visibleCount),
        [filteredEmotes, visibleCount]
    );

    const recentEmotes = useMemo(
        () =>
            recentEmoteIds
                .map((id) => emotesById[id])
                .filter(Boolean)
                .slice(0, 10),
        [recentEmoteIds, emotesById]
    );

    useEffect(() => {
        setVisibleCount(80);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [search, emotes.length]);

    return (
        <Popover
            isLazy
            lazyBehavior="unmount"
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={onClose}
        >
            <PopoverTrigger>
                {trigger ?? (
                    <IconButton
                        icon={<FiSmile size={22} />}
                        aria-label="Open emote picker"
                        size="lg"
                        height="48px"
                        width="48px"
                        bg="transparent"
                        color="text.secondary"
                        border="1px solid"
                        borderColor="chat.border"
                        borderRadius="12px"
                        _hover={{
                            bg: 'card.lightGray',
                            color: 'text.primary',
                        }}
                        _active={{
                            bg: 'card.lighterGray',
                        }}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                        _disabled={{
                            opacity: 0.5,
                            cursor: 'not-allowed',
                        }}
                        transition="background 0.15s ease, color 0.15s ease"
                        isDisabled={isDisabled}
                    />
                )}
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    borderWidth={2}
                    borderColor="input.lightGray"
                    boxShadow="lg"
                    width={width}
                    zIndex={1500}
                    {...popoverContentProps}
                >
                    <PopoverArrow
                        border="none"
                        boxShadow="lg"
                        {...popoverArrowProps}
                    />
                    <PopoverBody bg="card.white" p={2} {...popoverBodyProps}>
                        <Box
                            ref={scrollRef}
                            maxH={maxHeight}
                            overflowY="scroll"
                            overscrollBehavior="contain"
                            sx={{
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                            onScroll={() => {
                                const container = scrollRef.current;
                                if (!container) return;
                                const threshold = 120;
                                const isNearBottom =
                                    container.scrollTop +
                                        container.clientHeight +
                                        threshold >=
                                    container.scrollHeight;
                                if (isNearBottom) {
                                    setVisibleCount((prev) =>
                                        Math.min(
                                            prev + 80,
                                            filteredEmotes.length
                                        )
                                    );
                                }
                            }}
                        >
                            {showSearch && (
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search emotes"
                                    height="36px"
                                    bg="input.lightGray"
                                    color="text.secondary"
                                    border="none"
                                    borderRadius="10px"
                                    fontSize="sm"
                                    fontWeight="light"
                                    px={3}
                                    mb={3}
                                    _placeholder={{
                                        color: 'text.primary',
                                    }}
                                    _focus={{
                                        bg: 'input.white',
                                        boxShadow:
                                            'var(--chakra-shadows-chat-inputFocus)',
                                    }}
                                />
                            )}
                            {recentEmotes.length > 0 && (
                                <>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color="text.secondary"
                                        mb={2}
                                    >
                                        Recent
                                    </Text>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={`repeat(${columns}, 1fr)`}
                                        gap={1.5}
                                        mb={3}
                                    >
                                        {recentEmotes.map((emote) => (
                                            <Tooltip
                                                key={emote.id}
                                                label={`:${emote.name}:`}
                                                placement="top"
                                                hasArrow
                                            >
                                                <Box
                                                    as="button"
                                                    onClick={() => {
                                                        addRecentEmoteId(
                                                            emote.id
                                                        );
                                                        onSelectEmote(emote);
                                                        onClose();
                                                    }}
                                                    position="relative"
                                                    p={0.5}
                                                    borderRadius="md"
                                                    width="100%"
                                                    height={{
                                                        base: '56px',
                                                        md: '64px',
                                                    }}
                                                    _hover={{
                                                        bg: emoteHoverBg,
                                                    }}
                                                    _active={{
                                                        bg: emoteActiveBg,
                                                    }}
                                                >
                                                    <Box
                                                        as="img"
                                                        src={emote.url}
                                                        alt={emote.name}
                                                        height={{
                                                            base: '32px',
                                                            md: '40px',
                                                        }}
                                                        minWidth={{
                                                            base: '32px',
                                                            md: '40px',
                                                        }}
                                                        width="auto"
                                                        display="inline-block"
                                                        verticalAlign="middle"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </Box>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </>
                            )}
                            <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="text.secondary"
                                mb={2}
                            >
                                Other
                            </Text>
                            <Box
                                display="grid"
                                gridTemplateColumns={`repeat(${columns}, 1fr)`}
                                gap={0.5}
                            >
                                {visibleEmotes.map((emote) => (
                                    <Tooltip
                                        key={emote.id}
                                        label={`:${emote.name}:`}
                                        placement="top"
                                        hasArrow
                                    >
                                        <Box
                                            as="button"
                                            onClick={() => {
                                                addRecentEmoteId(emote.id);
                                                onSelectEmote(emote);
                                                onClose();
                                            }}
                                            position="relative"
                                            p={1}
                                            borderRadius="md"
                                            width="100%"
                                            height={{
                                                base: '56px',
                                                md: '64px',
                                            }}
                                            _hover={{ bg: emoteHoverBg }}
                                            _active={{ bg: emoteActiveBg }}
                                        >
                                            <Box
                                                as="img"
                                                src={emote.url}
                                                alt={emote.name}
                                                height={{
                                                    base: '32px',
                                                    md: '40px',
                                                }}
                                                minWidth={{
                                                    base: '32px',
                                                    md: '40px',
                                                }}
                                                width="auto"
                                                display="inline-block"
                                                verticalAlign="middle"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                            {filteredEmotes.length === 0 && (
                                <Text color="text.secondary" fontSize="sm">
                                    {emotesError
                                        ? 'Emotes failed to load.'
                                        : emotesLoading
                                          ? 'Loading emotes...'
                                          : 'No emotes found'}
                                </Text>
                            )}
                            {filteredEmotes.length > visibleEmotes.length && (
                                <Text
                                    color="text.secondary"
                                    fontSize="xs"
                                    mt={2}
                                >
                                    Scroll for more emotes
                                </Text>
                            )}
                            {filteredEmotes.length > 0 && (
                                <Text
                                    color="text.secondary"
                                    fontSize="xs"
                                    mt={1}
                                >
                                    Showing {visibleEmotes.length} of{' '}
                                    {filteredEmotes.length}
                                </Text>
                            )}
                        </Box>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};

export default EmotePicker;
