import React, { useContext } from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    PositionProps,
    HStack,
} from '@chakra-ui/react';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import CardComponent from './Card';

const TakenSeatButton = ({ player }: { player: Player }) => {
    const { appState } = useContext(AppContext);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left'] | 'row' | 'column'
            >;
        };
    } = {
        1: {
            bottom: { base: '-70%', md: '-35%', '2xl': '-30%' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'center', md: 'start' },
            justifyContent: { base: 'center' },
        },
        2: {
            bottom: { base: '0%', md: '-35%', '2xl': '-30%' },
            right: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        3: {
            bottom: { base: '0%', md: '-35%', '2xl': '-30%' },
            left: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        4: {
            top: { base: '0%', md: '40%', lg: '30%' },
            right: { base: '-105%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        5: {
            top: { base: '0%', md: '40%', lg: '30%' },
            left: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        6: {
            bottom: { base: '0%', md: '40%', lg: '23%' },
            right: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        7: {
            bottom: { base: '0%', md: '40%', lg: '23%' },
            left: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        8: {
            top: { base: '0%', md: '-25%', '2xl': '-28%' },
            right: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        9: {
            top: { base: '0%', md: '-25%', '2xl': '-28%' },
            left: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        10: {
            top: { base: '-45%', md: '-25%', '2xl': '-28%' },
            justifyContent: { base: 'center' },
        },
    };

    const defaultPosition = { top: '100%', flexDirection: 'row' };
    const chipPosition = chipPositions[player?.seatID || 4] || defaultPosition;

    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            width={{ base: 100, lg: 150, '2xl': 250 }}
            height={'100%'}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Flex
                position={'absolute'}
                key="betbox"
                {...chipPosition}
                width={'100%'}
                gap={2}
            >
                {appState.game.running &&
                    appState.game.dealer == player.position && (
                        <Text
                            fontWeight="semibold"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            bg="white"
                            color="black"
                            width={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            height={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            variant={'seatText'}
                            zIndex={3}
                        >
                            D
                        </Text>
                    )}
                {player.bet !== 0 && (
                    <Text
                        borderRadius="1.5rem"
                        px={4}
                        py={1}
                        w={'fit-content'}
                        bg="amber.300"
                        fontWeight="semibold"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={'gray'}
                        variant={'seatText'}
                        zIndex={3}
                    >
                        {player.bet}
                    </Text>
                )}
            </Flex>
            <Flex
                position={'absolute'}
                justifyContent={'center'}
                width={'90%'}
                height={'100%'}
                gap={0}
            >
                {appState.game.running &&
                    player.cards.map((card: Card, index: number) => {
                        return (
                            <Box flex={1} key={`${card}-${index}`}>
                                <CardComponent
                                    card={card}
                                    placeholder={false}
                                    folded={!player.in}
                                />
                            </Box>
                        );
                    })}
            </Flex>
            <Flex
                direction={'column'}
                bg={'gray.50'}
                borderRadius={12}
                width={'110%'}
                paddingX={4}
                paddingY={1}
                zIndex={2}
                justifySelf={'flex-end'}
                justifyContent={'center'}
                alignItems={'center'}
                alignSelf={'flex-end'}
            >
                <HStack spacing={2}>
                    <Text
                        variant={'seatText'}
                        fontWeight={'bold'}
                        color={'gray.300'}
                    >
                        {player.username}
                    </Text>
                    <Text variant={'seatText'} color={'gray.300'}>
                        {shortEthAddress}
                    </Text>
                </HStack>
                <Text color={'gray.300'} variant={'seatText'}>
                    {player.stack}
                </Text>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
