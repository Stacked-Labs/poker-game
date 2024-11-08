import { Flex } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = () => {
    return (
        <Flex
            direction={'column'}
            height={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            gap={2}
        >
            <Flex
                height="30px"
                width={'100%'}
                alignItems={'end'}
                justifyContent={'center'}
            >
                <Pot />
            </Flex>
            <CommunityCards />
        </Flex>
    );
};

export default Felt;
