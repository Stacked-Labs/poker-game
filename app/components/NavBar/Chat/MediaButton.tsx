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
import { PiCirclesFour } from 'react-icons/pi';
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
                top={2}
                zIndex={2}
                flex={1}
                height="48px"
                bg="input.lightGray"
                color="text.secondary"
                border="none"
                borderRadius="12px"
                fontSize="md"
                fontWeight="light"
                px={4}
                mb={4}
                boxShadow={'lg'}
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

    const handleEmojiClick = (emoji: any) => {
        setMessage((prev) => (prev ? prev + emoji.native : emoji.native));
    };

    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <IconButton
                        icon={<PiCirclesFour size={28} />}
                        aria-label={'Send GIFs, stickers, emojis'}
                        size="lg"
                        height="48px"
                        width="48px"
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
                    />
                </PopoverTrigger>
                <PopoverContent
                    borderWidth={2}
                    borderColor={'input.lightGray'}
                    boxShadow={'lg'}
                >
                    <PopoverArrow border={'none'} boxShadow={'lg'} />
                    <PopoverBody bg={'card.white'} py={3}>
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
                                justifyContent={'center'}
                                gap={{ base: 1, md: 2 }}
                                bg="card.lightGray"
                                p={{ base: 2, md: 3 }}
                                borderRadius="20px"
                                flexWrap={{ base: 'nowrap', sm: 'wrap' }}
                                overflowX="auto"
                                flex={1}
                                boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                                sx={{
                                    '&::-webkit-scrollbar': {
                                        height: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        bg: 'card.white',
                                        borderRadius: 'full',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bg: 'text.secondary',
                                        borderRadius: 'full',
                                        _hover: {
                                            bg: 'brand.pink',
                                        },
                                    },
                                }}
                            >
                                <Tab
                                    minW="fit-content"
                                    px={{ base: 3, md: 4 }}
                                    py={2}
                                    _hover={{
                                        bg: 'input.white',
                                        color: 'brand.green',
                                        boxShadow:
                                            '0 4px 8px rgba(54, 163, 123, 0.2)',
                                    }}
                                    _selected={{
                                        bg: 'brand.green',
                                        color: 'text.white !important',
                                        boxShadow:
                                            '0 4px 12px rgba(54, 163, 123, 0.3)',
                                        '& *': {
                                            color: 'text.white !important',
                                        },
                                    }}
                                    borderRadius="12px"
                                    fontWeight="bold"
                                    fontSize={{
                                        base: 'xs',
                                        sm: 'sm',
                                        md: 'md',
                                    }}
                                    transition="all 0.2s ease"
                                    color={'text.primary'}
                                >
                                    GIFs
                                </Tab>
                                <Tab
                                    minW="fit-content"
                                    px={{ base: 3, md: 4 }}
                                    py={2}
                                    _hover={{
                                        bg: 'input.white',
                                        color: 'brand.green',
                                        boxShadow:
                                            '0 4px 8px rgba(54, 163, 123, 0.2)',
                                    }}
                                    _selected={{
                                        bg: 'brand.green',
                                        color: 'text.white !important',
                                        boxShadow:
                                            '0 4px 12px rgba(54, 163, 123, 0.3)',
                                        '& *': {
                                            color: 'text.white !important',
                                        },
                                    }}
                                    borderRadius="12px"
                                    fontWeight="bold"
                                    fontSize={{
                                        base: 'xs',
                                        sm: 'sm',
                                        md: 'md',
                                    }}
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
                                >
                                    <GifPicker
                                        onSendGif={onSendGif}
                                        scrollParentRef={scrollParentRef}
                                    />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <Flex
                                        justifyContent={'center'}
                                        width={'100%'}
                                        pt={2}
                                    >
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleEmojiClick}
                                            theme={
                                                colorMode === 'light'
                                                    ? 'light'
                                                    : 'dark'
                                            }
                                            perLine={6}
                                            sx={{
                                                background: 'red',
                                            }}
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
