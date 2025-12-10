'use client';

import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Pulse animation matching TakenSeatButton style - brand green
const pulseGreen = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(54, 163, 123, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(54, 163, 123, 0);
  }
`;

// Fade in animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Staggered line animations
const lineFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
`;

const ScrollIndicator = () => {
    const handleClick = () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth',
        });
    };

    // Widths for the lines below
    const lines = [
        { width: { base: '120px', md: '160px', lg: '200px' }, delay: '0.15s' },
        { width: { base: '60px', md: '80px', lg: '100px' }, delay: '0.3s' },
    ];

    const segmentWidth = { base: '40px', md: '60px', lg: '80px' };

    return (
        <VStack
            position="absolute"
            bottom={{ base: '10px' }}
            left={0}
            right={0}
            mx="auto"
            width="fit-content"
            spacing={{ base: 1, md: 2 }}
            cursor="pointer"
            onClick={handleClick}
            animation={`${fadeInUp} 0.8s ease-out 1s forwards`}
            opacity={0}
            zIndex={10}
            _hover={{
                '& .indicator-line': {
                    bg: 'brand.green',
                    boxShadow: '0 0 12px rgba(54, 163, 123, 0.8)',
                },
                transform: 'scale(1.02)',
            }}
            transition="transform 0.3s ease"
        >
            {/* First row: Line - Text - Line */}
            <Flex
                alignItems="center"
                gap={4}
                animation={`${lineFloat} 2.5s ease-in-out infinite`}
            >
                {/* Left Line Segment */}
                <Box
                    className="indicator-line"
                    width={segmentWidth}
                    height={{ base: '4px', md: '5px', lg: '6px' }}
                    bg="brand.green"
                    borderRadius="full"
                    animation={`${pulseGreen} 2s ease-in-out infinite`}
                />

                <Heading
                    fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
                    fontWeight="extrabold"
                    color="brand.green"
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                    mx={2}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    Learn More
                </Heading>

                {/* Right Line Segment */}
                <Box
                    className="indicator-line"
                    width={segmentWidth}
                    height={{ base: '4px', md: '5px', lg: '6px' }}
                    bg="brand.green"
                    borderRadius="full"
                    animation={`${pulseGreen} 2s ease-in-out infinite`}
                />
            </Flex>

            {/* Second line */}
            <Box
                className="indicator-line"
                width={lines[0].width}
                height={{ base: '4px', md: '5px', lg: '6px' }}
                bg="brand.green"
                borderRadius="full"
                animation={`${pulseGreen} 2s ease-in-out 0.15s infinite, ${lineFloat} 2.5s ease-in-out 0.2s infinite`}
            />

            {/* Third line */}
            <Box
                className="indicator-line"
                width={lines[1].width}
                height={{ base: '4px', md: '5px', lg: '6px' }}
                bg="brand.green"
                borderRadius="full"
                animation={`${pulseGreen} 2s ease-in-out 0.3s infinite, ${lineFloat} 2.5s ease-in-out 0.4s infinite`}
            />
        </VStack>
    );
};

export default ScrollIndicator;
