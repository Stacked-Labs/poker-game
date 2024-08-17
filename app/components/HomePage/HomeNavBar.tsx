import { Button, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';
import Web3Button from '../Web3Button';

interface HomeNavBarProps {
    homeRef: React.RefObject<HTMLElement>;
    socialsRef: React.RefObject<HTMLElement>;
    faqsRef: React.RefObject<HTMLElement>;
    roadmapRef: React.RefObject<HTMLElement>;
    activeSection: string;
}

const logoImage = '/logo.png';

const HomeNavBar: React.FC<HomeNavBarProps> = ({
    homeRef,
    socialsRef,
    faqsRef,
    roadmapRef,
}) => {
    const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <Flex
            width={'100%'}
            paddingX={4}
            paddingY={2}
            justifyContent={'space-between'}
            alignItems={'center'}
            zIndex={999999}
            position={'fixed'}
            top={0}
            bg={'gray.200'}
        >
            <Flex alignItems={'center'} gap={2} fontSize={'x-large'}>
                <Image
                    alt={`Logo Image`}
                    src={logoImage}
                    width={'100%'}
                    style={{ objectFit: 'contain' }}
                />
                <Text color={'white'} fontFamily={'Knewave'} fontSize={'4xl'}>
                    Stacked
                </Text>
            </Flex>

            <Flex
                bg={'gray.200'}
                textTransform={'uppercase'}
                gap={10}
                alignItems={'center'}
            >
                <Button
                    variant={'navButton'}
                    onClick={() => scrollToSection(socialsRef)}
                >
                    Socials
                </Button>
                <Button
                    variant={'navButton'}
                    onClick={() => scrollToSection(faqsRef)}
                >
                    FAQs
                </Button>
                <Button
                    variant={'navButton'}
                    onClick={() => scrollToSection(roadmapRef)}
                >
                    Road Map
                </Button>
                <Button
                    variant={'navButton'}
                    onClick={() => scrollToSection(homeRef)}
                >
                    Support
                </Button>
                <Web3Button width="200px" />
            </Flex>
        </Flex>
    );
};

export default HomeNavBar;
