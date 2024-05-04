import React from 'react';
import {
    Box,
    Flex,
    Text,
    Image,
    ResponsiveValue,
    PositionProps,
    HStack,
} from '@chakra-ui/react';
import { Player } from '../interfaces';

const TakenSeatButton = ({ player }: { player: Player }) => {
    const shortEthAddress = player?.address
        ? `${player.address.slice(0, 2)}...${player.address.slice(-2)}`
        : '0x00...00';

    const Card1 = '/cards/png/2_of_clubs.png';
    const Card2 = '/cards/png/2_of_diamonds.png';

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left'] | 'row' | 'column'
            >;
        };
    } = {
        1: { bottom: '-35%', flexDirection: 'row' },
        2: { bottom: '-35%', flexDirection: 'row' },
        3: { bottom: '-35%', flexDirection: 'row' },
        4: { right: '-15%', flexDirection: 'column' },
        5: { left: '-15%', flexDirection: 'column' },
        6: { right: '-15%', flexDirection: 'column' },
        7: { left: '-15%', flexDirection: 'column' },
        8: { top: '-38%', flexDirection: 'row' },
        9: { top: '-38%', flexDirection: 'row' },
        10: { top: '-38%', flexDirection: 'row' },
    };

    const defaultPosition = { top: '100%', flexDirection: 'row' };
    const chipPosition = chipPositions[player?.seatID || 4] || defaultPosition;

    return (
        <Flex
            width={'100%'}
            position={'relative'}
            top={8}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Flex
                position={'absolute'}
                gap={1}
                alignItems={'center'}
                {...chipPosition}
            >
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
            <Box width={'80%'} position={'relative'}>
                <Flex
                    position={'absolute'}
                    justifyContent={'center'}
                    marginBottom={0}
                    gap={1}
                    top={-20}
                >
                    <Box bg={'blue'} width={'50%'} aspectRatio={1 / 1}>
                        <Image
                            alt="Card 1"
                            src={Card1}
                            flex={1}
                            width={'100%'}
                            style={{ objectFit: 'contain' }}
                            mr={1}
                        />
                    </Box>
                    <Box bg={'blue'} width={'50%'} aspectRatio={1 / 1}>
                        <Image
                            alt="Card 2"
                            src={Card2}
                            flex={1}
                            width={'100%'}
                            style={{ objectFit: 'contain' }}
                            mr={1}
                        />
                    </Box>
                </Flex>
                <Flex
                    direction={'column'}
                    bg={'gray.50'}
                    borderRadius={12}
                    position={'absolute'}
                    width={'100%'}
                    paddingX={3}
                    paddingY={1}
                    height={'75px'}
                    top={-8}
                    zIndex={2}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <HStack spacing={2}>
                        <Text fontWeight={'bold'}>{player.username}</Text>
                        <Text fontSize={'14px'} color={'gray.300'}>
                            {shortEthAddress}
                        </Text>
                    </HStack>
                    <Text>{player.stack}</Text>
                </Flex>
            </Box>
        </Flex>
    );
};

export default TakenSeatButton;
