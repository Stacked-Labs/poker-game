'use client';

import { Box, VStack, Text } from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi2';

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

const ScrollIndicator = () => {
    const { scrollY } = useScroll();

    // Fade out as we scroll down.
    // Start at 1, reach 0 after scrolling 500px
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);
    const translateY = useTransform(scrollY, [0, 500], [0, -100]);

    const handleClick = () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {/* Subtle floating blend at the very bottom */}
            <MotionBox
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height="100px"
                bgGradient="linear(to-t, bg.scrollIndicator 0%, bg.scrollIndicatorMid 40%, transparent 100%)"
                style={{ opacity }}
                pointerEvents="none"
                zIndex={0}
            />
            <MotionVStack
                position="absolute"
                bottom={{ base: '16px', md: '32px' }}
                left={0}
                right={0}
                mx="auto"
                width="fit-content"
                spacing={0}
                cursor="pointer"
                onClick={handleClick}
                style={{ opacity, y: translateY }}
                zIndex={10}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                sx={{
                    transition:
                        'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    _hover: {
                        transform: 'scale(1.08)',
                    },
                }}
            >
                <VStack spacing={0}>
                    <Text
                        fontSize={{ base: '9px', md: 'xs' }}
                        fontWeight="bold"
                        color="brand.green"
                        letterSpacing="0.25em"
                        textTransform="uppercase"
                        mb={0.5}
                        opacity={0.85}
                    >
                        Learn More
                    </Text>

                    <MotionBox
                        animate={{
                            y: [0, 4, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <HiChevronDown
                            size={16}
                            color="var(--chakra-colors-brand-green)"
                        />
                    </MotionBox>
                </VStack>
            </MotionVStack>
        </>
    );
};

export default ScrollIndicator;
