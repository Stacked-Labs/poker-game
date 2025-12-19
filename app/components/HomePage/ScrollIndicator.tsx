'use client';

import { Box, Flex, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi2';

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

const ScrollIndicator = () => {
    const { scrollY } = useScroll();
    const bgColor = useColorModeValue('white', '#191919');
    const midColor = useColorModeValue(
        'rgba(255, 255, 255, 0.5)',
        'rgba(25, 25, 25, 0.5)'
    );

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
                bgGradient={`linear(to-t, ${bgColor} 0%, ${midColor} 40%, transparent 100%)`}
                style={{ opacity }}
                pointerEvents="none"
                zIndex={0}
            />
            <MotionVStack
                position="absolute"
                bottom={{ base: '20px', md: '30px' }}
                left={0}
                right={0}
                mx="auto"
                width="fit-content"
                spacing={2}
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
                        fontSize="xs"
                        fontWeight="black"
                        color="brand.green"
                        letterSpacing="0.3em"
                        textTransform="uppercase"
                        mb={1}
                    >
                        Learn More
                    </Text>

                    <MotionBox
                        animate={{
                            y: [0, 8, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <HiChevronDown
                            size={24}
                            color="var(--chakra-colors-brand-green)"
                        />
                    </MotionBox>
                </VStack>
            </MotionVStack>
        </>
    );
};

export default ScrollIndicator;
