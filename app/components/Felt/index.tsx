import { Flex } from '@chakra-ui/react';
import React from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';
import PauseBanner from '../PauseBanner';
import SettlementBanner from '../SettlementBanner';

const Felt = ({ activePotIndex }: { activePotIndex: number | null }) => {
    return (
        <Flex
            className="felt-container"
            height={'auto'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            position={'relative'}
            sx={{
                '@media (orientation: portrait)': {
                    width: '90%',
                },
            }}
            gap={{ base: 1, md: 2, lg: 3 }}
        >
            <Pot activePotIndex={activePotIndex} />
            <CommunityCards activePotIndex={activePotIndex} />
            <PauseBanner />
            <SettlementBanner />
        </Flex>
    );
};
export default Felt;
