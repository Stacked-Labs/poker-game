import { VStack } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = () => {
    return (
        <VStack gap={2}>
            <Pot />
            <CommunityCards />
        </VStack>
    );
};

export default Felt;
