'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeNavBar from './HomeNavBar';
import HomeSection from './LandingSections/HomeSection';
import FAQsSection from './LandingSections/FAQsSection';
import SocialsSection from './LandingSections/SocialsSection';
import RoadMapSection from './LandingSections/RoadMapSection';

const Landing = () => {
    const homeRef = useRef<HTMLDivElement>(null);
    const socialsRef = useRef<HTMLDivElement>(null);
    const faqsRef = useRef<HTMLDivElement>(null);
    const roadmapRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState<string>('home');

    const handleOnScroll = () => {
        const socialsOffset = socialsRef.current?.offsetTop || 0;
        const faqsOffset = faqsRef.current?.offsetTop || 0;
        const roadmapOffset = roadmapRef.current?.offsetTop || 0;

        const scrollPosition = window.scrollY + window.innerHeight / 2;

        if (scrollPosition >= roadmapOffset) {
            setActiveSection('roadmap');
        } else if (scrollPosition >= faqsOffset) {
            setActiveSection('faqs');
        } else if (scrollPosition >= socialsOffset) {
            setActiveSection('socials');
        } else {
            setActiveSection('home');
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleOnScroll);
        return () => window.removeEventListener('scroll', handleOnScroll);
    }, []);

    return (
        <Box bg={'gray.200'} height={'fit-content'}>
            <HomeNavBar
                homeRef={homeRef}
                socialsRef={socialsRef}
                faqsRef={faqsRef}
                roadmapRef={roadmapRef}
                activeSection={activeSection}
            />
            <VStack
                height={'fit-content'}
                spacing={4}
                align="stretch"
                paddingX={100}
            >
                <Flex ref={homeRef} alignItems={'center'} height={'100vh'}>
                    <HomeSection />
                </Flex>
                <Flex ref={faqsRef} alignItems={'center'} height={'100vh'}>
                    <FAQsSection />
                </Flex>
                <Flex ref={roadmapRef} alignItems={'center'} height={'100vh'}>
                    <RoadMapSection />
                </Flex>
                <Flex ref={socialsRef} alignItems={'center'} height={'100vh'}>
                    <SocialsSection />
                </Flex>
            </VStack>
        </Box>
    );
};

export default Landing;
