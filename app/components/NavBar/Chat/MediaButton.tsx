'use client';

import {
    Divider,
    Flex,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useColorMode,
} from '@chakra-ui/react';
import { PiCirclesFour } from 'react-icons/pi';
import { GiphyFetch } from '@giphy/js-fetch-api';
import {
    EmojiVariationsList,
    Grid,
    SearchBar,
    SearchContext,
    SearchContextManager,
} from '@giphy/react-components';
import {
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useContext,
    useState,
} from 'react';
import { GifID, IGif } from '@giphy/js-types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const SdkKey: string = process.env.NEXT_PUBLIC_GIPHY_SDK_KEY ?? '';
const gf = new GiphyFetch(SdkKey);

const GifPicker = ({ onSendGif }: { onSendGif: (url: string) => void }) => {
    const { fetchGifs, searchKey } = useContext(SearchContext);

    const handleOnClick = (
        gif: IGif,
        e: SyntheticEvent<HTMLElement, Event>
    ) => {
        e.preventDefault();

        const mediaUrl: string =
            gif.images.downsized_medium?.url ||
            gif.images.original?.url ||
            gif.images.fixed_height?.url ||
            gif.images.fixed_width?.url;

        onSendGif(mediaUrl);
    };

    return (
        <>
            <SearchBar />
            <Divider h={4} />
            <Grid
                key={searchKey}
                width={250}
                columns={3}
                fetchGifs={fetchGifs}
                onGifClick={handleOnClick}
                noLink
                hideAttribution
            />
        </>
    );
};

const StickerPicker = ({ onSendGif }: { onSendGif: (url: string) => void }) => {
    const { colorMode } = useColorMode();
    const [gif, setGif] = useState<IGif | null>(null);

    const fetchDefaultVariations = (offset: number) =>
        gf.emojiDefaultVariations({ offset });
    const fetchVariations = (id: GifID) => gf.emojiVariations(id);

    const handleOnClick = (gif: any, e: SyntheticEvent<HTMLElement, Event>) => {
        e.preventDefault();

        const mediaUrl: string =
            gif.images.downsized_medium?.url ||
            gif.images.original?.url ||
            gif.images.fixed_height?.url ||
            gif.images.fixed_width?.url;

        onSendGif(mediaUrl);
    };

    return (
        <>
            {gif ? (
                <EmojiVariationsList
                    fetchVariations={fetchVariations}
                    gif={gif}
                    gifHeight={100}
                    onGifClick={handleOnClick}
                    backgroundColor={'none'}
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        backgroundColor:
                            colorMode == 'light' ? 'white' : '#212121',
                        flex: 1,
                    }}
                    noLink
                    hideAttribution
                />
            ) : null}
            <Divider h={2} />
            <Grid
                width={250}
                columns={3}
                fetchGifs={fetchDefaultVariations}
                onGifClick={setGif}
                backgroundColor={'none'}
                noLink
                hideAttribution
            />
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

    const handleEmojiClick = (emoji: any) => {
        setMessage((prev) => (prev ? prev + emoji.native : emoji.native));
    };

    return (
        <>
            <SearchContextManager apiKey={SdkKey} shouldDefaultToTrending>
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
                                        Stickers
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
                                    <TabPanel>
                                        <GifPicker onSendGif={onSendGif} />
                                    </TabPanel>
                                    <TabPanel>
                                        <StickerPicker onSendGif={onSendGif} />
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
            </SearchContextManager>
        </>
    );
};

export default MediaButton;
