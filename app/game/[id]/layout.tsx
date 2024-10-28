'use client';

import React, { useContext, useEffect, useState } from 'react';
import Navbar from '@/app/components/NavBar';
import { CircularProgress, Flex } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const GameLayout: React.FC = ({
    children,
}: React.PropsWithChildren<object>) => {
    useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const duration = 300;

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            const newProgress = Math.min((elapsedTime / duration) * 100, 100);

            setProgress(newProgress);

            if (elapsedTime >= duration + 1000) {
                setLoading(false);
            } else {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);

        return () => {};
    }, []);

    if (loading) {
        return (
            <Flex
                justify="center"
                align="center"
                w="100vw"
                h="100vh"
                position="fixed"
                backgroundColor="white"
                zIndex={999}
            >
                <CircularProgress
                    value={progress}
                    isIndeterminate={false}
                    color="grey"
                    size="100px"
                />
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
        </Flex>
    );
};

export default GameLayout;
