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
    Portal,
    useBreakpointValue,
    useDisclosure,
    type PopoverContentProps,
    type PopoverBodyProps,
    type PopoverArrowProps,
    type ResponsiveValue,
} from '@chakra-ui/react';
import { FiSmile } from 'react-icons/fi';
import {
    forwardRef,
    memo,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from 'react';
import { VirtuosoGrid, type VirtuosoGridHandle } from 'react-virtuoso';
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

type GridListProps = {
    style?: CSSProperties;
    children?: ReactNode;
};

const GridList = forwardRef<HTMLDivElement, GridListProps>(
    function GridList({ style, children }, ref) {
        return (
            <div
                ref={ref}
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(var(--ep-cols, 5), minmax(0, 1fr))',
                    gap: 6,
                    ...style,
                }}
            >
                {children}
            </div>
        );
    }
);

const GridItem = ({
    children,
    ...rest
}: {
    children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...rest} style={{ display: 'flex' }}>
        {children}
    </div>
);

type EmoteTileProps = {
    emote: Emote;
    onPick: (emote: Emote) => void;
    onHover: (name: string | null) => void;
};

const EmoteTile = memo(function EmoteTile({
    emote,
    onPick,
    onHover,
}: EmoteTileProps) {
    return (
        <Box
            as="button"
            aria-label={`Send ${emote.name}`}
            onClick={() => onPick(emote)}
            onMouseEnter={() => onHover(emote.name)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(emote.name)}
            onBlur={() => onHover(null)}
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
            <img
                src={emote.url}
                alt={emote.name}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                style={{
                    height: 40,
                    width: 'auto',
                    maxWidth: '100%',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />
        </Box>
    );
});

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
    const [hoveredName, setHoveredName] = useState<string | null>(null);
    const gridRef = useRef<VirtuosoGridHandle>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const handleOpen = useCallback(() => {
        if (isDisabled) return;
        ensureLoaded();
        onOpen();
    }, [ensureLoaded, isDisabled, onOpen]);

    const resolvedHeight = useBreakpointValue(
        typeof maxHeight === 'object' && maxHeight !== null
            ? (maxHeight as Record<string, string | number>)
            : { base: maxHeight as string | number }
    );

    const emotes = useMemo(() => {
        const list = Object.values(emotesByName);
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }, [emotesByName]);

    const filteredEmotes = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return emotes;
        return emotes.filter((emote) =>
            emote.name.toLowerCase().includes(query)
        );
    }, [emotes, search]);

    const recentEmotes = useMemo(
        () =>
            recentEmoteIds
                .map((id) => emotesById[id])
                .filter(Boolean)
                .slice(0, 10),
        [recentEmoteIds, emotesById]
    );

    useEffect(() => {
        gridRef.current?.scrollToIndex(0);
    }, [search]);

    const handlePick = useCallback(
        (emote: Emote) => {
            addRecentEmoteId(emote.id);
            onSelectEmote(emote);
            onClose();
        },
        [addRecentEmoteId, onSelectEmote, onClose]
    );

    const showRecents = recentEmotes.length > 0 && !search;
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

    const GridHeader = useCallback(
        () =>
            showRecents ? (
                <Box mb={3}>
                    <Text {...SECTION_HEADING_PROPS} mb={2}>
                        Recent
                    </Text>
                    <Box
                        display="grid"
                        gridTemplateColumns={`repeat(${columns}, minmax(0, 1fr))`}
                        gap={1.5}
                        mb={3}
                    >
                        {recentEmotes.map((emote) => (
                            <EmoteTile
                                key={emote.id}
                                emote={emote}
                                onPick={handlePick}
                                onHover={setHoveredName}
                            />
                        ))}
                    </Box>
                    <Text {...SECTION_HEADING_PROPS} mb={2}>
                        All emotes
                    </Text>
                </Box>
            ) : null,
        [showRecents, recentEmotes, columns, handlePick]
    );

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
                        height="48px"
                        width="48px"
                        minW="48px"
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
                                mb={2}
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
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            h="14px"
                            mb={1}
                            noOfLines={1}
                        >
                            {hoveredName ? `:${hoveredName}:` : ' '}
                        </Text>
                        {showEmptyPanel ? (
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
                        ) : (
                            <Box
                                height={resolvedHeight ?? '420px'}
                                overscrollBehavior="contain"
                                sx={{
                                    ['--ep-cols' as string]: String(columns),
                                }}
                            >
                                <VirtuosoGrid
                                    ref={gridRef}
                                    style={{ height: '100%' }}
                                    totalCount={filteredEmotes.length}
                                    overscan={400}
                                    components={{
                                        List: GridList,
                                        Item: GridItem,
                                        Header: GridHeader,
                                    }}
                                    itemContent={(index) => {
                                        const emote = filteredEmotes[index];
                                        if (!emote) return null;
                                        return (
                                            <EmoteTile
                                                emote={emote}
                                                onPick={handlePick}
                                                onHover={setHoveredName}
                                            />
                                        );
                                    }}
                                />
                            </Box>
                        )}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};

export default EmotePicker;
