import { Flex } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = () => {
    return (
        <Flex
            className="community-cards"
            height={'100%'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            position={'relative'}
            gap={{ base: 1, md: 2, lg: 3 }}
        >
            <Pot />
            <CommunityCards />
        </Flex>
    );
};
export default Felt;
