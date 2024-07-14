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
    const shortEthAddress = player?.address
        ? `${player.address.slice(0, 2)}...${player.address.slice(-2)}`
        : '0x00...00';

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left'] | 'row' | 'column'
            >;
        };
    } = {
        1: { bottom: '-25%', flexDirection: 'row' },
        2: { bottom: '-25%', flexDirection: 'row' },
        3: { bottom: '-25%', flexDirection: 'row' },
        4: { right: '-25%', flexDirection: 'column' },
        5: { left: '-25%', flexDirection: 'column' },
        6: { right: '-25%', flexDirection: 'column' },
        7: { left: '-25%', flexDirection: 'column' },
        8: { top: '-20%', flexDirection: 'row' },
        9: { top: '-20%', flexDirection: 'row' },
        10: { top: '-20%', flexDirection: 'row' },
    };

    const defaultPosition = { top: '100%', flexDirection: 'row' };
    const chipPosition = chipPositions[player?.seatID || 4] || defaultPosition;

    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            width={'80%'}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Flex
                position={'absolute'}
                gap={1}
                key="betbox"
                alignItems={'center'}
                {...chipPosition}
            >
                {appState.game.running &&
                    appState.game.dealer == player.position && (
                        <Text
                            mx={3}
                            my={3}
                            h="1.75rem"
                            w="2rem"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="50%"
                            bg="white"
                            color="purple.800"
                            fontSize="xl"
                            fontWeight="bold"
                            display="flex"
                        >
                            D
                        </Text>
                    )}
                {player.bet !== 0 && (
                    <Text
                        className="flex items-center justify-center"
                        h="2rem"
                        w="3rem"
                        borderRadius="1.5rem"
                        bg="amber.300"
                        fontSize="xl"
                        fontWeight="semibold"
                        color="zinc.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={'gray'}
                    >
                        {player.bet}
                    </Text>
                )}
            </Flex>
            <Flex position={'absolute'} justifyContent={'center'} gap={1}>
                {appState.game.running &&
                    player.cards.map((card: Card, index: number) => {
                        return (
                            <Box width={'50%'} aspectRatio={1 / 1} key={index}>
                                <CardComponent
                                    card={card}
                                    hidden={appState.clientID !== player.uuid}
                                />
                            </Box>
                        );
                    })}
            </Flex>
            <Flex
                direction={'column'}
                bg={'gray.50'}
                borderRadius={12}
                width={'100%'}
                paddingX={3}
                paddingY={1}
                height={'70px'}
                zIndex={2}
                justifySelf={'flex-end'}
                justifyContent={'center'}
                alignItems={'center'}
                alignSelf={'flex-end'}
                mb={2}
            >
                <HStack spacing={2}>
                    <Text fontWeight={'bold'} color={'gray.300'}>
                        {player.username}
                    </Text>
                    <Text fontSize={'14px'} color={'gray.300'}>
                        {shortEthAddress}
                    </Text>
                </HStack>
                <Text color={'gray.300'}>{player.stack}</Text>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
