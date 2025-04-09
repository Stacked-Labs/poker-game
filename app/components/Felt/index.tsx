import { Container } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';

const Felt = () => {
    return (
        <Container
            height={'100%'}
            width={'100%'}
            mr={0}
            alignItems={'center'}
            justifyContent={'center'}
            
        >
            <Container
                height="30px"
                width={'40%'}
                alignItems={'left'}
                justifyContent={'left'}
                mb={4}
                ml={130}
            >
                <Pot />
            </Container>
            
            <CommunityCards />
        </Container>
    );
};
export default Felt;
