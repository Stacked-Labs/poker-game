'use client';

import { Box, Button, Icon } from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { HiChevronDown } from 'react-icons/hi2';

const MotionBox = motion(Box);

const haloPulse = keyframes`
    0%   { transform: scale(0.94); opacity: 0; }
    40%  { transform: scale(1);    opacity: 0.55; }
    100% { transform: scale(1.22); opacity: 0; }
`;

type ScrollIndicatorProps = {
    isBroadcast?: boolean;
};

const ScrollIndicator = ({ isBroadcast = false }: ScrollIndicatorProps) => {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);

    const handleClick = () => {
        const homeSection = document.querySelector('.home-section');
        const next = homeSection?.nextElementSibling as HTMLElement | null;
        if (next) {
            next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    };

    return (
        <Box
            position="absolute"
            bottom={{ base: '24px', md: '36px' }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
        >
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                style={{ opacity }}
                position="relative"
                display="inline-flex"
            >
                {/* Single tight breathing halo behind the pill */}
                <Box
                    position="absolute"
                    inset="-3px"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="brand.lightGray"
                    _dark={{ borderColor: 'bg.charcoal' }}
                    animation={
                        isBroadcast
                            ? 'none'
                            : `${haloPulse} 2.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`
                    }
                    pointerEvents="none"
                />

                <Button
                    aria-label="Scroll to next section"
                    onClick={handleClick}
                    height="44px"
                    px={6}
                    borderRadius="full"
                    bg="brand.lightGray"
                    color="brand.darkNavy"
                    border="none"
                    fontWeight="700"
                    fontSize="11px"
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                    boxShadow="0 8px 22px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
                    display="inline-flex"
                    alignItems="center"
                    gap={2.5}
                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    position="relative"
                    _hover={{
                        bg: 'brand.lightGray',
                        transform: 'translateY(-2px)',
                        boxShadow:
                            '0 12px 28px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                        filter: 'brightness(1.04)',
                    }}
                    _active={{
                        transform: 'translateY(0) scale(0.97)',
                    }}
                    _focusVisible={{
                        outline: '2px solid',
                        outlineColor: 'brand.pink',
                        outlineOffset: '4px',
                    }}
                    _dark={{
                        bg: 'bg.charcoal',
                        color: 'white',
                        boxShadow:
                            '0 8px 22px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
                        _hover: {
                            bg: 'bg.charcoal',
                            transform: 'translateY(-2px)',
                            boxShadow:
                                '0 12px 28px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
                            filter: 'brightness(1.25)',
                        },
                    }}
                >
                    More below
                    <MotionBox
                        animate={isBroadcast ? { y: 0 } : { y: [0, 3, 0] }}
                        transition={
                            isBroadcast
                                ? { duration: 0 }
                                : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                        }
                        display="inline-flex"
                        alignItems="center"
                    >
                        <Icon as={HiChevronDown} boxSize={4} />
                    </MotionBox>
                </Button>
            </MotionBox>
        </Box>
    );
};

export default ScrollIndicator;
