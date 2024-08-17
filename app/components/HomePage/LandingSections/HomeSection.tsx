import { Box, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';
import HomeCard from '../HomeCard';

const HomeSection = () => {
    return (
        <Flex
            width={'100vw'}
            alignItems={'center'}
            position={'relative'}
            justifyItems={'flex-start'}
        >
            <Image
                alt={'Background Photo'}
                src={'/bg.png'}
                width={'100%'}
                position={'absolute'}
                transform={'scale(1.5)'}
            />
            <Box flex={1} zIndex={3}>
                <HomeCard />
            </Box>
            <Box flex={1} zIndex={3}>
                <Text
                    textTransform={'uppercase'}
                    fontFamily={'Luckiest Guy'}
                    fontSize={'7xl'}
                >
                    Your crypto poker arena
                </Text>
                <Text
                    textTransform={'uppercase'}
                    fontFamily={`'Libre Barcode 39 Text', system-ui`}
                    fontSize={'4xl'}
                >
                    HOST AND PLAY FOR ANY ERC20
                </Text>
            </Box>
        </Flex>
    );
};

export default HomeSection;
