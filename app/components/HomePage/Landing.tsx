'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import HomeNavBar from './HomeNavBar';
import HomeSection from './LandingSections/HomeSection';
import FAQsSection from './LandingSections/FAQsSection';
import SocialsSection from './LandingSections/SocialsSection';
import RoadMapSection from './LandingSections/RoadMapSection';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';

const Landing = () => {
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    if (appState.table && socket) {
        router.push(`/game/${appState.table}`);
    }

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
        <Box w="100vw" bgColor={'gray.200'}>
            <HomeNavBar
                homeRef={homeRef}
                socialsRef={socialsRef}
                faqsRef={faqsRef}
                roadmapRef={roadmapRef}
                activeSection={activeSection}
            />

            <VStack height={'fit-content'}>
                <Flex ref={socialsRef} alignItems={'center'} height={'100vh'}>
                    <HomeSection />
                </Flex>
                <Flex ref={socialsRef} alignItems={'center'} height={'100vh'}>
                    <SocialsSection />
                </Flex>
                <Flex ref={faqsRef} alignItems={'center'} height={'100vh'}>
                    <FAQsSection />
                </Flex>
                <Flex ref={roadmapRef} alignItems={'center'} height={'100vh'}>
                    <RoadMapSection />
                </Flex>
            </VStack>
        </Box>
    );
};

export default Landing;
