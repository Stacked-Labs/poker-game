'use client';

import { IconButton, Icon } from '@chakra-ui/react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from 'framer-motion';
import { HiArrowUp } from 'react-icons/hi2';
import { useState } from 'react';

const MotionBox = motion.div;

const BackToTopButton = () => {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        // Show button after scrolling down 400px
        if (latest > 400) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    });

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <MotionBox
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 100,
                    }}
                >
                    <IconButton
                        aria-label="Back to top"
                        icon={<Icon as={HiArrowUp} boxSize={5} />}
                        onClick={scrollToTop}
                        size="lg"
                        variant="tactileChrome"
                        borderRadius="full"
                        h="48px"
                        w="48px"
                        minW="48px"
                    />
                </MotionBox>
            )}
        </AnimatePresence>
    );
};

export default BackToTopButton;
