'use client';

import React, { useContext, useEffect, useState } from 'react';
import Navbar from '@/app/components/NavBar';
import {
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import LobbyBanner from '@/app/components/LobbyBanner';

const GameLayout: React.FC = ({
    children,
}: React.PropsWithChildren<object>) => {
    useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        // Simplified loading logic - just a short delay for better UX
        onOpen();

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [onOpen]);

    if (loading) {
        return (
            <Flex
                justify="center"
                align="center"
                w="100vw"
                h="100vh"
                position="fixed"
                backgroundColor="gray.200"
                zIndex={999}
            >
                <VStack spacing={4}>
                    <Spinner
                        size="xl"
                        color="red"
                        thickness="4px"
                        speed="0.8s"
                    />
                    <Text color="white" fontSize="lg" fontWeight="bold">
                        Loading game...
                    </Text>
                </VStack>
            </Flex>
        );
    }

    return (
        <Flex
            direction="column"
            w="100vw"
            h="100vh"
            zIndex="auto"
            transformOrigin="center center"
            bg={'gray.200'}
        >
            <Navbar />
            {children}
            <Footer />

            <Modal isOpen={isOpen} onClose={() => {}} isCentered size={'sm'}>
                <LobbyBanner />
            </Modal>
        </Flex>
    );
};

export default GameLayout;
