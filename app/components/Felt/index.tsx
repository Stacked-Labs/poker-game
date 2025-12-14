import { Flex } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = ({ activePotIndex }: { activePotIndex: number | null }) => {
    return (
        <Flex
            className="felt-container"
            height={'auto'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            position={'relative'}
            gap={{ base: 1, md: 2, lg: 3 }}
        >
            <Pot activePotIndex={activePotIndex} />
            <CommunityCards activePotIndex={activePotIndex} />
        </Flex>
    );
};
export default Felt;
