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
                bottom={{ base: '12px', md: '30px' }}
                left={0}
                right={0}
                mx="auto"
                width="fit-content"
                spacing={1}
                cursor="pointer"
                onClick={handleClick}
                style={{ opacity, y: translateY }}
                zIndex={10}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                _hover={{
                    transform: 'scale(1.05)',
                }}
            >
                <VStack spacing={0}>
                    <Text
                        fontSize={{ base: '10px', md: 'xl' }}
                        fontWeight="extrabold"
                        color="brand.green"
                        letterSpacing="0.2em"
                        textTransform="uppercase"
                        mb={0}
                    >
                        Learn More
                    </Text>

                    <MotionBox
                        animate={{
                            y: [0, 5, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        fontWeight="extrabold"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <HiChevronDown
                            size={20}
                            color="var(--chakra-colors-brand-green)"
                            style={{ fontWeight: 900 }}
                        />
                    </MotionBox>
                </VStack>
            </MotionVStack>
        </>
    );
};

export default ScrollIndicator;
