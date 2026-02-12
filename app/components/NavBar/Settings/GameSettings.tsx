import { tableColors } from '@/app/utils/tableColors';
import {
    Box,
    Flex,
    Select,
    Text,
    Switch,
    HStack,
    Icon,
    useMediaQuery,
    VStack,
} from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';
import { IoMdSunny } from 'react-icons/io';
import { FiEye, FiEyeOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useColorMode } from '@chakra-ui/react';
import React, { useContext, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { CardBack } from '@/app/components/Card';
import type { CardBackVariant, DisplayMode } from '@/app/interfaces';

const cardBackColors: Record<CardBackVariant, string> = {
    classic: '#0B1430',
    ruby: '#2D0A1B',
    emerald: '#0A2A1B',
    midnight: '#12121E',
    royal: '#1A0A2E',
    ocean: '#0A1A2E',
    amber: '#2A1A0A',
    gold: '#2E2A0A',
};

const GameSettings = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { appState, dispatch } = useContext(AppContext);
    const [isPortrait] = useMediaQuery('(orientation: portrait)');
    const tableColorKey = localStorage.getItem('tableColorKey') ?? 'green';
    const [selectedColor, onColorChange] = useState<string>(tableColorKey);
    const suitPalette = appState.fourColorDeckEnabled
        ? {
              spade: '#000000',
              heart: '#DC143C',
              diamond: '#1E6BD6',
              club: '#1F8A4C',
          }
        : {
              spade: '#000000',
              heart: '#DC143C',
              diamond: '#DC143C',
              club: '#000000',
          };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        onColorChange(key);

        localStorage.setItem('tableColorKey', key);
        window.dispatchEvent(new Event('tableColorChanged'));
    };

    return (
        <VStack spacing={{ base: 2, md: 4 }} align="stretch">
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Table Color
                    </Text>
                    <Select
                        id="color-select"
                        value={selectedColor}
                        onChange={handleSelectChange}
                        variant="outline"
                        width={{ base: '52%', sm: '50%' }}
                        bg={tableColors[selectedColor].color}
                        color={
                            selectedColor == 'white'
                                ? 'brand.darkNavy'
                                : 'white'
                        }
                        fontWeight={'bold'}
                        sx={{
                            '& > option:checked': {
                                color: 'text.primary',
                                fontWeight: 'bold',
                            },
                            '& > option': {
                                bg: 'card.white',
                                color: 'text.primary',
                            },
                        }}
                        _hover={{
                            cursor: 'pointer',
                        }}
                        defaultValue={tableColorKey}
                    >
                        {tableColors &&
                            Object.entries(tableColors).map(([key]) => (
                                <option key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </option>
                            ))}
                    </Select>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Card Back
                    </Text>
                    <HStack spacing={{ base: 2, md: 3 }} flexShrink={0}>
                        <Box
                            width={{ base: '46px', md: '53px' }}
                            height={{ base: '61px', md: '71px' }}
                            flexShrink={0}
                        >
                            <CardBack
                                variant={appState.cardBackDesign}
                                idSuffix="-preview"
                            />
                        </Box>
                        <Select
                            value={appState.cardBackDesign}
                            onChange={(e) =>
                                dispatch({
                                    type: 'setCardBackDesign',
                                    payload: e.target
                                        .value as CardBackVariant,
                                })
                            }
                            variant="outline"
                            width={{ base: '120px', md: '140px' }}
                            bg={cardBackColors[appState.cardBackDesign]}
                            color="white"
                            fontWeight="bold"
                            sx={{
                                '& > option:checked': {
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                },
                                '& > option': {
                                    bg: 'card.white',
                                    color: 'text.primary',
                                },
                            }}
                            _hover={{ cursor: 'pointer' }}
                        >
                            <option value="classic">Classic</option>
                            <option value="ruby">Ruby</option>
                            <option value="emerald">Emerald</option>
                            <option value="midnight">Midnight</option>
                            <option value="royal">Royal</option>
                            <option value="ocean">Ocean</option>
                            <option value="amber">Amber</option>
                            <option value="gold">Gold</option>
                        </Select>
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Four Color Deck
                    </Text>
                    <HStack spacing={{ base: 1.5, md: 2 }} flexShrink={0}>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.heart}
                        >
                            ♥
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.spade}
                        >
                            ♠
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.diamond}
                        >
                            ♦
                        </Text>
                        <Text
                            as="span"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="bold"
                            color={suitPalette.club}
                        >
                            ♣
                        </Text>
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={appState.fourColorDeckEnabled}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                dispatch({
                                    type: 'setFourColorDeckEnabled',
                                    payload: nextValue,
                                });
                            }}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chip Display
                    </Text>
                    <Select
                        value={appState.displayMode}
                        onChange={(e) =>
                            dispatch({
                                type: 'setDisplayMode',
                                payload: e.target.value as DisplayMode,
                            })
                        }
                        variant="outline"
                        width={{ base: '52%', sm: '50%' }}
                        fontWeight="bold"
                        sx={{
                            '& > option:checked': {
                                color: 'text.primary',
                                fontWeight: 'bold',
                            },
                            '& > option': {
                                bg: 'card.white',
                                color: 'text.primary',
                            },
                        }}
                        _hover={{ cursor: 'pointer' }}
                    >
                        <option value="chips">Chips (1,500)</option>
                        <option value="bb">Big Blinds (150bb)</option>
                        {appState.game?.config?.crypto === true && (
                            <option value="usdc">USDC ($15.00)</option>
                        )}
                    </Select>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Theme
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                        <Icon
                            as={colorMode === 'light' ? IoMdSunny : FaMoon}
                            boxSize={{ base: 5, md: 6 }}
                            color="text.secondary"
                        />
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={colorMode === 'dark'}
                            onChange={toggleColorMode}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chat Overlay
                    </Text>
                    {isPortrait ? (
                        <HStack
                            spacing={2}
                            px={3}
                            py={1}
                            bg="card.lightGray"
                            borderRadius="full"
                            flexShrink={0}
                        >
                            <Icon
                                as={FiEyeOff}
                                boxSize={{ base: 4, md: 5 }}
                                color="text.secondary"
                            />
                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                fontWeight="semibold"
                                color="text.secondary"
                                whiteSpace="nowrap"
                            >
                                Disabled on portrait
                            </Text>
                        </HStack>
                    ) : (
                        <HStack spacing={3} flexShrink={0}>
                            <Icon
                                as={
                                    appState.chatOverlayEnabled
                                        ? FiEye
                                        : FiEyeOff
                                }
                                boxSize={{ base: 5, md: 6 }}
                                color="text.secondary"
                            />
                            <Switch
                                size={{ base: 'md', md: 'lg' }}
                                isChecked={appState.chatOverlayEnabled}
                                onChange={(event) => {
                                    const nextValue = event.target.checked;
                                    dispatch({
                                        type: 'setChatOverlayEnabled',
                                        payload: nextValue,
                                    });
                                }}
                                colorScheme="green"
                            />
                        </HStack>
                    )}
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 2.5, md: 3 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction="row"
                    justify={'space-between'}
                    align="center"
                    wrap="nowrap"
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                        flex={1}
                        minWidth={0}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Chat Notification Sound
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                        <Icon
                            as={
                                appState.chatSoundEnabled
                                    ? FiVolume2
                                    : FiVolumeX
                            }
                            boxSize={{ base: 5, md: 6 }}
                            color="text.secondary"
                        />
                        <Switch
                            size={{ base: 'md', md: 'lg' }}
                            isChecked={appState.chatSoundEnabled}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                dispatch({
                                    type: 'setChatSoundEnabled',
                                    payload: nextValue,
                                });
                            }}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
        </VStack>
    );
};

export default GameSettings;
