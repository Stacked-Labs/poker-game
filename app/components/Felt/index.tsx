import { Flex } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = () => {
    return (
        <Flex
            height={'100%'}
            width={'100%'}
            direction={'column'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Flex
                height={'30%'}
                width={'40%'}
                justifyContent={'center'}
                alignItems={'center'}
                mb={'2.4vh'}
            >
                <Pot />
            </Flex>
            
            <CommunityCards />
        </Flex>
    );
};
export default Felt;
