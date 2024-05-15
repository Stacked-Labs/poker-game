import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import TitleText from '../TitleText';

const HomeSection = () => {
    return (
        <Flex direction={'column'} height={'fit-content'} width={'100%'}>
            <Flex
                direction="column"
                backgroundColor="#ffe6e6"
                border="1px solid red"
                borderTopWidth="3px"
                borderRadius={'10px'}
                padding="10px"
                marginTop="150px"
                marginBottom={'20px'}
            >
                <Text fontSize={'16px'} color={'red.500'}>
                    <strong>Note:</strong> This is currently a work-in-progress
                    passion project. We're constantly adding new features and
                    improving the experience. Follow @XYZ on X for updates.
                </Text>
            </Flex>
            <TitleText text={'What is This?'} />
            <Text fontSize={'18px'}>
                This is a web app designed to help you organize a game of poker
                as fast as possible, all while putting magic internet coins (aka
                Crypto) on the line.
            </Text>
            <Text fontSize={'18px'}>
                1. Connect your Web3 wallet (Metamask, Coinbase, etc.).
            </Text>
            <Text fontSize={'18px'}>
                2. Click "Play Now" to generate a link.
            </Text>
            <Text fontSize={'18px'}>3. Share the link with fellow apes.</Text>
            <Text fontSize={'18px'}>4. Gamble</Text>
        </Flex>
    );
};

export default HomeSection;
