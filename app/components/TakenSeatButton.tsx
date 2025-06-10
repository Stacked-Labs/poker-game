import React, { useContext } from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    PositionProps,
    HStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import CardComponent from './Card';

const pulseWhiteGlow = keyframes`
  0% { box-shadow: 0 0 6px 5px rgba(255, 255, 255, 0.6); }
  50% { box-shadow: 0 0 9px 6px rgba(255, 255, 255, 0.6); }
  100% { box-shadow: 0 0 6px 5px rgba(255, 255, 255, 0.6); }
`;

const pulseGoldGlow = keyframes`
  0% { box-shadow: 0 0 6px 5px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 9px 6px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 6px 5px rgba(255, 215, 0, 0.6); }
`;

const TakenSeatButton = ({
    player,
    isCurrentTurn,
    isWinner,
}: {
    player: Player;
    isCurrentTurn: boolean;
    isWinner: boolean;
}) => {
    const { appState } = useContext(AppContext);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left' | 'bottom'] | 'row' | 'column'
            >;
        };
    } = {
        1: {
            bottom: { base: '60%', sm: '50%', md: '40%', lg: '35%', xl: '30%', '2xl': '25%' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'center', md: 'start' },
            justifyContent: { base: 'center' },
        },
        2: {
            bottom: { base: '0%', sm: '-10%', md: '-25%', lg: '-30%', xl: '-30%', '2xl': '-25%' },
            right: { base: '-90%', sm: '-100%', md: '-5%', lg: '0%', xl: '0%', '2xl': '0%' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        3: {
            bottom: { base: '0%', sm: '-10%', md: '-25%', lg: '-30%', xl: '-30%', '2xl': '-25%' },
            left: { base: '-90%', sm: '-100%', md: '-5%', lg: '0%', xl: '0%', '2xl': '0%' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        4: {
            top: { base: '0%', sm: '10%', md: '30%', lg: '25%', xl: '20%', '2xl': '15%' },
            right: { base: '-85%', sm: '-95%', md: '-100%', lg: '-105%', xl: '-110%', '2xl': '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        5: {
            top: { base: '0%', sm: '10%', md: '30%', lg: '25%', xl: '20%', '2xl': '15%' },
            left: { base: '-85%', sm: '-95%', md: '-100%', lg: '-105%', xl: '-110%', '2xl': '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        6: {
            bottom: { base: '0%', sm: '10%', md: '30%', lg: '20%', xl: '15%', '2xl': '10%' },
            right: { base: '-85%', sm: '-95%', md: '-100%', lg: '-105%', xl: '-110%', '2xl': '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        7: {
            bottom: { base: '0%', sm: '10%', md: '30%', lg: '20%', xl: '15%', '2xl': '10%' },
            left: { base: '-85%', sm: '-95%', md: '-100%', lg: '-105%', xl: '-110%', '2xl': '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        8: {
            top: { base: '0%', sm: '-15%', md: '-20%', lg: '-25%', xl: '-28%', '2xl': '-30%' },
            right: { base: '-85%', sm: '-95%', md: '-5%', lg: '0%', xl: '0%', '2xl': '0%' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        9: {
            top: { base: '0%', sm: '-15%', md: '-20%', lg: '-25%', xl: '-28%', '2xl': '-30%' },
            left: { base: '-85%', sm: '-95%', md: '-5%', lg: '0%', xl: '0%', '2xl': '0%' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        10: {
            top: { base: '-35%', sm: '-30%', md: '-25%', lg: '-28%', xl: '-30%', '2xl': '-32%' },
            justifyContent: { base: 'center' },
        },
    };

    const defaultPosition = { top: '100%', flexDirection: 'row' };
    const chipPosition = chipPositions[player?.seatID || 4] || defaultPosition;

    const glowAnimation = isCurrentTurn
        ? `${pulseWhiteGlow} 2s ease-in-out 0.2s infinite`
        : isWinner
          ? `${pulseGoldGlow} 2s ease-in-out 0.5s infinite`
          : 'none';

    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            width={{ base: '26vw', sm: '23.5vw', md: '19.5vw', lg: '15.5vw', xl: '13vw', '2xl': '10.5vw' }}
            height={{ base: '100%', md: '100%' }}
            position={'relative'}
            direction={'column'}
            alignItems={'center'}
            justifyContent={'flex-end'}
        >
            <Flex
                position={'absolute'}
                key="betbox"
                {...chipPosition}
                width={'100%'}
                gap={{ base: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' }}
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
                            width={{ base: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem', xl: '2rem' }}
                            height={{ base: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem', xl: '2rem' }}
                            fontSize={{ base: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem', xl: '1rem' }}
                            variant={'seatText'}
                            zIndex={3}
                        >
                            D
                        </Text>
                    )}
                {player.bet !== 0 && (
                    <Text
                        borderRadius={{ base: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' }}
                        px={{ base: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' }}
                        py={{ base: '0.25rem', sm: '0.35rem', md: '0.4rem', lg: '0.5rem', xl: '0.6rem' }}
                        w={'fit-content'}
                        bg="amber.300"
                        fontWeight="semibold"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={'gray'}
                        fontSize={{ base: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem', xl: '1rem' }}
                        variant={'seatText'}
                        zIndex={3}
                    >
                        {player.bet}
                    </Text>
                )}
            </Flex>
            <Flex
                justifyContent={'center'}
                width={'100%'}
                gap={{ base: '0.15rem', sm: '0.3rem', md: '0.4rem', lg: '0.5rem', xl: '0.7rem' }}
                flex={1}
            >
                {appState.game.running &&
                    player.cards.map((card: Card, index: number) => {
                        return (
                            <Box flex={1} key={`${card}-${index}`} width={'50%'} maxW={'7.6rem'} aspectRatio={7/10}>
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
                bg={isCurrentTurn || isWinner ? 'white' : 'gray.800'}
                borderRadius={{ base: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' }}
                width={'100%'}
                paddingX={{ base: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' }}
                paddingY={{ base: '0.25rem', sm: '0.35rem', md: '0.4rem', lg: '0.5rem', xl: '0.6rem' }}
                zIndex={2}
                position={'absolute'}
                bottom={0}
                justifyContent={'center'}
                alignItems={'center'}
                animation={glowAnimation}
                transition={'all 0.5s ease-in-out'}
            >
                <HStack spacing={{ base: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem' }}>
                    <Text
                        variant={'seatText'}
                        fontWeight={'bold'}
                        fontSize={{ base: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem', xl: '1rem' }}
                        color={
                            isCurrentTurn || isWinner ? 'gray.700' : 'gray.50'
                        }
                    >
                        {player.username}
                    </Text>
                    <Text
                        variant={'seatText'}
                        fontSize={{ base: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem', xl: '1.1rem' }}
                        color={isCurrentTurn || isWinner ? 'gray.700' : 'gray.50'}
                    >
                       {player.stack}
                    </Text>
                </HStack>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
