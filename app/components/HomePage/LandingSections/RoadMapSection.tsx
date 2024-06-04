import { Text, VStack } from '@chakra-ui/react';
import React from 'react';

const RoadMapSection = () => {
    return (
        <VStack
            bg={'green.500'}
            flex={1}
            height={'60%'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Text>Road Map Here!</Text>
            <Text
                size={'lg'}
                fontSize="6xl"
                textTransform={'uppercase'}
                fontWeight={'bolder'}
            >
                Road Map
            </Text>
        </VStack>
    );
};

export default RoadMapSection;
