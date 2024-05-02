import React from 'react';
import { Box, Flex, Text, Image } from '@chakra-ui/react';
import { User } from '../interfaces';

//GetPlayer info and seat index
// Seat index used for determining chip bet positions
const TakenSeatButton = ({ player }: { player: User; seatId: number }) => {
    const shortEthAddress = `${player.address.slice(
        0,
        4
    )}...${player.address.slice(-2)}`;

    const Card1 = '/cards/png/2_of_clubs.png';
    const Card2 = '/cards/png/2_of_diamonds.png';

    return (
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
                <Text fontWeight={'bold'} fontSize={['14px', '16px', '24px']}>
                    {player.username}
                </Text>
                <Text fontSize={['14px', '16px', '24px']}>{player.amount}</Text>
            </Box>
        </Flex>
    );
};

export default TakenSeatButton;
