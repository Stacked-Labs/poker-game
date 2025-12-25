'use client';

import {
    Box,
    Flex,
    Grid,
    IconButton,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorMode,
} from '@chakra-ui/react';
import { FiSmile } from 'react-icons/fi';
import {
    Dispatch,
    RefObject,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import useTenor, {
    TenorResult,
    TenorResponse,
    TENOR_ENDPOINT,
} from '@/app/hooks/useTenor';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

interface SlimTenorGif {
    id: string;
    description: string;
    previewGif: string;
    fullGif: string;
}

const slimTenorGifMapper = (data: TenorResponse): SlimTenorGif[] => {
    return data.results.map((gif: TenorResult) => ({
        id: gif.id ?? '',
        description: gif.content_description ?? '',
        previewGif: gif.media_formats?.tinygif?.url ?? '',
        fullGif: gif.media_formats?.gif?.url ?? '',
    }));
};

const GifPicker = ({
    onSendGif,
    scrollParentRef,
}: {
    onSendGif: (url: string) => void;
    scrollParentRef: RefObject<HTMLDivElement>;
}) => {
    const { fetchGifs } = useTenor();
    const [gifs, setGifs] = useState<SlimTenorGif[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [nextPos, setNextPos] = useState<string>('');
    const { ref, inView } = useInView({ threshold: 0 });

    const loadTrending = async () => {
        setLoading(true);

        const data: TenorResponse | null = await fetchGifs(
            TENOR_ENDPOINT.FEATURED
        );

        if (!data) return;

        setNextPos(data.next);
        const slimGifs = slimTenorGifMapper(data);
        setGifs(slimGifs);
        setLoading(false);
    };

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);

        const endpoint =
            search.length < 1 ? TENOR_ENDPOINT.FEATURED : TENOR_ENDPOINT.SEARCH;
        const query = search.length < 1 ? '' : search;
        const data = await fetchGifs(endpoint, query, nextPos);

        if (data) {
            setNextPos(data.next);
            const slimGifs = slimTenorGifMapper(data);
            setGifs((prev) => [...prev, ...slimGifs]);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        setGifs([]);
        setNextPos('');

        setTimeout(() => {
            if (scrollParentRef.current) {
                scrollParentRef.current.scrollTop = 0;
            }
        }, 0);

        if (search.length < 1) {
            loadTrending();
            return;
        }

        setLoading(true);
        const data = await fetchGifs(TENOR_ENDPOINT.SEARCH, search);

        if (data) {
            setNextPos(data.next);
            setGifs(slimTenorGifMapper(data));
        }
        setLoading(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        loadTrending();
    }, []);

    useEffect(() => {
        if (inView && nextPos !== '') {
            loadMore();
        }
    }, [inView]);

    return (
        <>
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Find a GIF"
                disabled={loading}
                position={'sticky'}
                top={1}
                zIndex={2}
                flex={1}
                height="36px"
                bg="input.lightGray"
                color="text.secondary"
                border="none"
                borderRadius="10px"
                fontSize="sm"
                fontWeight="light"
                px={3}
                mb={2}
                boxShadow={'sm'}
                _placeholder={{
                    color: 'text.primary',
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
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {gifs.map((gif: SlimTenorGif) => (
                    <Box
                        key={gif.id}
                        as="button"
                        onClick={() => onSendGif(gif.fullGif)}
                        position={'relative'}
                        p={1}
                        borderRadius="md"
                        width={100}
                        height={100}
                        mx={'auto'}
                        _hover={{ bg: 'gray.100' }}
                    >
                        <Image
                            src={gif.previewGif}
                            alt={gif.description}
                            objectFit="contain"
                            fill
                            unoptimized
                        />
                    </Box>
                ))}
            </Grid>
            <Box
                ref={ref}
                height={4}
                py={4}
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                {loading && <Spinner size="sm" />}
            </Box>
            {gifs.length === 0 && !loading && (
                <Text color={'text.secondary'}>No GIFs found</Text>
            )}
        </>
    );
};

const MediaButton = ({
    onSendGif,
    setMessage,
}: {
    onSendGif: (url: string) => void;
    setMessage: Dispatch<SetStateAction<string>>;
}) => {
    const { colorMode } = useColorMode();
    const scrollParentRef = useRef<HTMLDivElement>(null);

    const handleEmojiClick = (emoji: { native?: string }) => {
        if (!emoji.native) return;
        const emojiNative = emoji.native;
        setMessage((prev) => (prev ? prev + emojiNative : emojiNative));
    };

    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <IconButton
                        icon={<FiSmile size={22} />}
                        aria-label={'Send GIFs, stickers, emojis'}
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
                    />
                </PopoverTrigger>
                <PopoverContent
                    borderWidth={2}
                    borderColor={'input.lightGray'}
                    boxShadow={'lg'}
                >
                    <PopoverArrow border={'none'} boxShadow={'lg'} />
                    <PopoverBody bg={'card.white'} p={2}>
                        <Tabs
                            size={{ base: 'sm', md: 'md' }}
                            variant="soft-rounded"
                            colorScheme="green"
                            defaultIndex={0}
                            orientation="horizontal"
                            h="100%"
                            display="flex"
                            flexDirection="column"
                        >
                            <TabList
                                width="100%"
                                justifyContent="space-between"
                                alignItems="center"
                                bg="card.lightGray"
                                p="0px"
                                borderRadius="999px"
                                height="36px"
                                boxShadow="sm"
                            >
                                <Tab
                                    flex={1}
                                    height="32px"
                                    px={0}
                                    py={0}
                                    _hover={{
                                        bg: 'input.white',
                                        color: 'brand.green',
                                    }}
                                    _selected={{
                                        bg: 'brand.green',
                                        color: 'text.white !important',
                                        boxShadow:
                                            '0 6px 16px rgba(54, 163, 123, 0.28)',
                                        '& *': {
                                            color: 'text.white !important',
                                        },
                                    }}
                                    borderRadius="999px"
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    transition="all 0.2s ease"
                                    color={'text.primary'}
                                >
                                    GIFs
                                </Tab>
                                <Tab
                                    flex={1}
                                    height="32px"
                                    px={0}
                                    py={0}
                                    _hover={{
                                        bg: 'input.white',
                                        color: 'brand.green',
                                    }}
                                    _selected={{
                                        bg: 'brand.green',
                                        color: 'text.white !important',
                                        boxShadow:
                                            '0 6px 16px rgba(54, 163, 123, 0.28)',
                                        '& *': {
                                            color: 'text.white !important',
                                        },
                                    }}
                                    borderRadius="999px"
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    transition="all 0.2s ease"
                                    color={'text.primary'}
                                >
                                    Emoji
                                </Tab>
                            </TabList>

                            <TabPanels
                                width={400}
                                height={400}
                                overflow={'auto'}
                                sx={{
                                    '&::-webkit-scrollbar': {
                                        height: '6px',
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        bg: 'card.lightGray',
                                        borderRadius: 'full',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bg: 'card.lighterGray',
                                        borderRadius: 'full',
                                        _hover: {
                                            bg: 'brand.pink',
                                        },
                                    },
                                }}
                            >
                                <TabPanel
                                    ref={scrollParentRef}
                                    sx={{ scrollBehavior: 'smooth' }}
                                    p={1}
                                >
                                    <GifPicker
                                        onSendGif={onSendGif}
                                        scrollParentRef={scrollParentRef}
                                    />
                                </TabPanel>
                                <TabPanel>
                                    <Flex
                                        justifyContent={'center'}
                                        width={'100%'}
                                    >
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleEmojiClick}
                                            theme={
                                                colorMode === 'light'
                                                    ? 'light'
                                                    : 'dark'
                                            }
                                            perLine={8}
                                        />
                                    </Flex>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default MediaButton;
