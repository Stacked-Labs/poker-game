import React from 'react';
import {
    Box,
    Flex,
    Text,
    Image,
    Circle,
    ResponsiveValue,
} from '@chakra-ui/react';
import { Player } from '../interfaces';
import { useAppState } from '../contexts/AppStoreProvider';

//GetPlayer info and seat index
// Seat index used for determining chip bet positions
const TakenSeatButton = ({ player }: { player: Player }) => {
    const shortEthAddress = `${player.address.slice(
        0,
        4
    )}...${player.address.slice(-2)}`;

    const Card1 = '/cards/png/2_of_clubs.png';
    const Card2 = '/cards/png/2_of_diamonds.png';

    const { appState } = useAppState();

    console.log('Player Info: ', player);

    //TODO Adjust position of chips later on
    const getChipPosition = (seatID: number) => {
        switch (seatID) {
            case 1:
                return {
                    right: '60%',
                    top: '-45%',
                    flexDirection: 'row' as ResponsiveValue<'row' | 'column'>,
                };
            case 2:
                return {
                    right: '30%',
                    top: '-40%',
                    flexDirection: 'row' as ResponsiveValue<'row' | 'column'>,
                };
            case 3:
                return {
                    right: '-20%',
                    top: '20%',
                    flexDirection: 'column' as ResponsiveValue<
                        'row' | 'column'
                    >,
                };
            case 4:
                return {
                    right: '30%',
                    bottom: '-40%',
                    flexDirection: 'row' as ResponsiveValue<'row' | 'column'>,
                };
            case 5:
                return {
                    right: '60%',
                    bottom: '-40%',
                    flexDirection: 'row' as ResponsiveValue<'row' | 'column'>,
                };
            case 6:
                return {
                    left: '-23%',
                    top: '15%',
                    flexDirection: 'column' as ResponsiveValue<
                        'row' | 'column'
                    >,
                };
            default:
                return {};
        }
    };

    //TODO: Need to add player seatIds
    const chipPosition = getChipPosition(player.seatID || 4);

    /*
     *   TODO implement cards from the player and display them
     */
    return (
        <Flex
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            direction={'column'}
        >
            <Flex {...chipPosition}>
                {/* 
                TODO: uncomment this and do the necessary dealer checks
                {appState.game.running && appState.game.dealer == player.position && ( */}
                <Flex
                    mx={3} // Margin x-axis
                    my={3} // Margin y-axis
                    h="1.75rem" // 7 * 0.25 = 1.75rem
                    w="2rem" // 8 * 0.25 = 2rem
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="50%" // Creates a circle or rounded shape
                    bg="white"
                    color="purple.800"
                    fontSize="xl"
                    fontWeight="bold"
                    display="flex"
                >
                    D
                </Flex>

                {player.bet && player.bet !== 0 && (
                    <Text
                        className="flex items-center justify-center"
                        h="2rem" // 8 * 0.25 = 2rem
                        w="3rem" // 12 * 0.25 = 3rem
                        borderRadius="1.5rem" // 3xl rounded equivalent
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
            <Flex
                w={['100%', '150px', '150px', '100%']}
                h={['100px', '150px', '170px', '70%']}
                bgColor="gray.50"
                direction={'row'}
                justifyItems={'center'}
                alignItems={'center'}
                gap={4}
                p={2}
            >
                <Box id="cards" display="flex">
                    <Image
                        alt="Card 1"
                        src={Card1}
                        height={'100%'}
                        maxHeight={'150px'}
                        objectFit="cover"
                        mr={1}
                    />
                    <Image
                        alt="Card 2"
                        src={Card2}
                        height={'100%'}
                        maxHeight={'150px'}
                        objectFit="cover"
                    />
                </Box>
                <Box display="column" alignItems={'flex-end'}>
                    <Text fontSize={['14px', '16px', '24px']}>
                        {shortEthAddress}
                    </Text>
                    <Text
                        fontWeight={'bold'}
                        fontSize={['14px', '16px', '24px']}
                    >
                        {player.username}
                    </Text>
                    <Text fontSize={['14px', '16px', '24px']}>
                        {player.stack}
                    </Text>
                </Box>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
