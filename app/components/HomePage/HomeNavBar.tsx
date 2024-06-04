import React from 'react';
import { Button, Flex } from '@chakra-ui/react';

interface HomeNavBarProps {
    homeRef: React.RefObject<HTMLElement>;
    socialsRef: React.RefObject<HTMLElement>;
    faqsRef: React.RefObject<HTMLElement>;
    roadmapRef: React.RefObject<HTMLElement>;
    activeSection: string;
}

const HomeNavBar: React.FC<HomeNavBarProps> = ({
    homeRef,
    socialsRef,
    faqsRef,
    roadmapRef,
    activeSection,
}) => {
    const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Flex
            bg={'gray.200'}
            position={'fixed'}
            top={0}
            justifyContent={'center'}
            gap={'4'}
            py={7}
            width="67%"
            zIndex={99}
        >
            <Button
                onClick={() => scrollToSection(homeRef)}
                bg={activeSection === 'home' ? 'green.500' : 'none'}
            >
                Home
            </Button>
            <Button
                onClick={() => scrollToSection(faqsRef)}
                bg={activeSection === 'faqs' ? 'green.500' : 'none'}
            >
                FAQs
            </Button>
            <Button
                onClick={() => scrollToSection(roadmapRef)}
                bg={activeSection === 'roadmap' ? 'green.500' : 'none'}
            >
                Road Map
            </Button>
            <Button
                onClick={() => scrollToSection(socialsRef)}
                bg={activeSection === 'socials' ? 'green.500' : 'none'}
            >
                Socials
            </Button>
        </Flex>
    );
};

export default HomeNavBar;
