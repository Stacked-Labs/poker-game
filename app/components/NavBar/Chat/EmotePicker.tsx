'use client';

import {
    Box,
    Flex,
    IconButton,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Text,
    Tooltip,
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

const SECTION_HEADING_PROPS = {
    fontSize: '2xs',
    fontWeight: 800,
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    color: 'text.secondary',
};

const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease, border-color 80ms ease';

const EmotePicker = ({
    onSelectEmote,
    isDisabled,
    trigger,
    columns = 5,
    maxHeight = { base: '420px', md: '470px' },
    width = { base: '320px', md: '420px' },
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

    const handlePick = useCallback(
        (emote: Emote) => {
            addRecentEmoteId(emote.id);
            onSelectEmote(emote);
            onClose();
        },
        [addRecentEmoteId, onSelectEmote, onClose]
    );

    const renderEmoteTile = (emote: Emote) => (
        <Tooltip
            key={emote.id}
            label={`:${emote.name}:`}
            placement="top"
            hasArrow
            openDelay={250}
        >
            <Box
                as="button"
                aria-label={`Send ${emote.name}`}
                onClick={() => handlePick(emote)}
                position="relative"
                p={1}
                borderRadius="10px"
                width="100%"
                height={{ base: '52px', md: '60px' }}
                bg="transparent"
                transition={TACTILE_TRANSITION}
                _hover={{ bg: 'card.lightGray' }}
                _active={{
                    bg: 'card.lightGray',
                    transform: 'translateY(1px)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)',
                }}
                _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'brand.green',
                    outlineOffset: '2px',
                }}
            >
                <Box
                    as="img"
                    src={emote.url}
                    alt={emote.name}
                    height={{ base: '32px', md: '40px' }}
                    minWidth={{ base: '32px', md: '40px' }}
                    width="auto"
                    display="inline-block"
                    verticalAlign="middle"
                    loading="lazy"
                    decoding="async"
                />
            </Box>
        </Tooltip>
    );

    const showEmptyPanel = filteredEmotes.length === 0;
    const emptyTitle = emotesError
        ? 'Emotes failed to load'
        : emotesLoading
          ? 'Loading emotes'
          : search
            ? 'No matches'
            : 'No emotes yet';
    const emptyBody = emotesError
        ? 'Check your connection and try opening the picker again.'
        : emotesLoading
          ? 'Hang tight — fetching the set.'
          : search
            ? `Nothing matches “${search.trim()}”. Try a shorter query.`
            : 'Pop back in once emotes are available.';

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
                        icon={<FiSmile size={20} />}
                        aria-label="Open emote picker"
                        variant="tactileChrome"
                        size="lg"
                        height="44px"
                        width="44px"
                        minW="44px"
                        borderRadius="12px"
                        isDisabled={isDisabled}
                    />
                )}
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    bg="card.white"
                    border="1px solid"
                    borderColor="border.lightGray"
                    borderRadius="14px"
                    boxShadow="card.lift"
                    width={width}
                    maxW="calc(100vw - 16px)"
                    zIndex={1500}
                    _focus={{ outline: 'none', boxShadow: 'card.lift' }}
                    {...popoverContentProps}
                >
                    <PopoverArrow
                        bg="card.white"
                        boxShadow="card.lift"
                        {...popoverArrowProps}
                    />
                    <PopoverBody
                        bg="card.white"
                        p={3}
                        borderRadius="14px"
                        {...popoverBodyProps}
                    >
                        {showSearch && (
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search emotes"
                                height="40px"
                                bg="input.lightGray"
                                color="text.primary"
                                border="1px solid"
                                borderColor="border.lightGray"
                                borderRadius="10px"
                                fontSize="sm"
                                fontWeight="medium"
                                px={3}
                                mb={3}
                                transition={TACTILE_TRANSITION}
                                _placeholder={{ color: 'text.muted' }}
                                _hover={{
                                    borderColor: 'border.lightGray',
                                    bg: 'input.white',
                                }}
                                _focus={{
                                    bg: 'input.white',
                                    borderColor: 'border.lightGray',
                                    boxShadow: 'chat.inputFocus',
                                }}
                            />
                        )}
                        <Box
                            ref={scrollRef}
                            maxH={maxHeight}
                            overflowY="auto"
                            overscrollBehavior="contain"
                            sx={{
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': { display: 'none' },
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
                            {recentEmotes.length > 0 && (
                                <>
                                    <Text {...SECTION_HEADING_PROPS} mb={2}>
                                        Recent
                                    </Text>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={`repeat(${columns}, 1fr)`}
                                        gap={1.5}
                                        mb={3}
                                    >
                                        {recentEmotes.map(renderEmoteTile)}
                                    </Box>
                                </>
                            )}

                            {visibleEmotes.length > 0 && (
                                <>
                                    <Text {...SECTION_HEADING_PROPS} mb={2}>
                                        {recentEmotes.length > 0
                                            ? 'All emotes'
                                            : 'Emotes'}
                                    </Text>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={`repeat(${columns}, 1fr)`}
                                        gap={1.5}
                                    >
                                        {visibleEmotes.map(renderEmoteTile)}
                                    </Box>
                                </>
                            )}

                            {showEmptyPanel && (
                                <Flex
                                    direction="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={6}
                                    px={4}
                                    bg="card.lightGray"
                                    borderRadius="14px"
                                    border="1px dashed"
                                    borderColor="border.lightGray"
                                    gap={1.5}
                                >
                                    {emotesLoading && (
                                        <Spinner
                                            size="sm"
                                            color="text.muted"
                                            mb={1}
                                        />
                                    )}
                                    <Text
                                        fontWeight="bold"
                                        fontSize="sm"
                                        color="text.secondary"
                                    >
                                        {emptyTitle}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color="text.muted"
                                        textAlign="center"
                                    >
                                        {emptyBody}
                                    </Text>
                                </Flex>
                            )}

                            {filteredEmotes.length > visibleEmotes.length && (
                                <Text
                                    color="text.secondary"
                                    fontSize="2xs"
                                    fontWeight={700}
                                    letterSpacing="0.08em"
                                    textTransform="uppercase"
                                    textAlign="center"
                                    mt={3}
                                >
                                    Scroll for more
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
