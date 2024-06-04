import { Flex, VStack } from '@chakra-ui/react';
import React from 'react';
import { FaDiscord, FaFacebook, FaTwitter } from 'react-icons/fa';
import SocialsBox from '../SocialsBox';
import TitleText from '../TitleText';

const SocialsSection = () => {
    return (
        <VStack width={'100%'}>
            <TitleText text={'Talk to us!'} />
            <Flex gap={10} marginTop={50}>
                <SocialsBox
                    logo={FaFacebook}
                    text={'/poker-game'}
                    link={'https://www.facebook.com/'}
                />
                <SocialsBox
                    logo={FaTwitter}
                    text={'/poker-game'}
                    link={'https://www.twitter.com/'}
                />
                <SocialsBox
                    logo={FaDiscord}
                    text={'/poker-game-discord'}
                    link={'https://www.discord.com/'}
                />
            </Flex>
        </VStack>
    );
};

export default SocialsSection;
