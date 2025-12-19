'use client';

import {
    Divider,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
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
    SuggestionBar,
} from '@giphy/react-components';
import {
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useContext,
    useState,
} from 'react';
import { GifID, IGif } from '@giphy/js-types';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

const SdkKey: string = process.env.GIPHY_SDK_KEY ?? '';
const gf = new GiphyFetch(SdkKey);

const GifPicker = ({
    onSendGif,
}: {
    onSendGif: (url: string) => void;
}) => {
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
            <Divider h={10} />
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

const StickerPicker = ({
    onSendGif,
}: {
    onSendGif: (url: string) => void;
}) => {
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
                    noLink
                    hideAttribution
                />
            ) : null}
            <Grid
                width={250}
                columns={3}
                fetchGifs={fetchDefaultVariations}
                onGifClick={setGif}
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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage(prev => (prev ? prev + emojiData.emoji : emojiData.emoji));
    };

    return (
        <SearchContextManager apiKey={SdkKey}>
            <Popover>
                <PopoverTrigger>
                    <IconButton
                        icon={<PiCirclesFour />}
                        aria-label={'Media button'}
                    />
                </PopoverTrigger>
                <PopoverContent border={'none'}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody bg={'card.white'}>
                        <Tabs>
                            <TabList>
                                <Tab>GIFs</Tab>
                                <Tab>Stickers</Tab>
                                <Tab>Emoji</Tab>
                            </TabList>

                            <TabPanels width={400} height={400} overflow={'auto'}>
                                <TabPanel>
                                    <GifPicker onSendGif={onSendGif} />
                                </TabPanel>
                                <TabPanel>
                                    <StickerPicker onSendGif={onSendGif} />
                                </TabPanel>
                                <TabPanel>
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        theme={colorMode && 'light' ? Theme.LIGHT : Theme.DARK}
                                        height={350}
                                        width={'100%'}
                                        style={{
                                            background: 'none',
                                            border: 'none'
                                        }}
                                        lazyLoadEmojis
                                    />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </SearchContextManager>
    );
};

export default MediaButton;
