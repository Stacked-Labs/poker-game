'use client';

import { Box, Icon, Text, useBreakpointValue } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { type ReactNode } from 'react';

type FloatingDecorProps = {
    density?: 'minimal' | 'light' | 'dense';
};

type DecorItem = {
    key: string;
    level: 1 | 2 | 3;
    top: string;
    left: string;
    opacity?: number;
    float: number;
    rotate: number;
    duration: number;
    delay?: number;
    render: ReactNode;
};

const MotionBox = motion(Box);

const FloatingDecor = ({ density = 'light' }: FloatingDecorProps) => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
    const levelMap = { minimal: 1, light: 2, dense: 3 };
    const level = levelMap[density];

    if (isMobile) return null;

    const items: DecorItem[] = [
        {
            key: 'suit-spade',
            level: 1,
            top: '12%',
            left: '10%',
            opacity: 0.28,
            float: 6,
            rotate: 8,
            duration: 4.6,
            render: (
                <Text fontSize={{ base: '24px', md: '30px' }} color="brand.navy">
                    ♠
                </Text>
            ),
        },
        {
            key: 'suit-heart',
            level: 1,
            top: '18%',
            left: '88%',
            opacity: 0.28,
            float: 6,
            rotate: -8,
            duration: 4.2,
            render: (
                <Text fontSize={{ base: '24px', md: '30px' }} color="brand.pink">
                    ♥
                </Text>
            ),
        },
        {
            key: 'suit-club',
            level: 1,
            top: '64%',
            left: '12%',
            opacity: 0.26,
            float: 7,
            rotate: 6,
            duration: 4.8,
            render: (
                <Text fontSize={{ base: '24px', md: '30px' }} color="brand.green">
                    ♣
                </Text>
            ),
        },
        {
            key: 'suit-diamond',
            level: 2,
            top: '72%',
            left: '84%',
            opacity: 0.26,
            float: 7,
            rotate: -6,
            duration: 5.2,
            render: (
                <Text fontSize={{ base: '24px', md: '30px' }} color="brand.yellow">
                    ♦
                </Text>
            ),
        },
        {
            key: 'eth-icon',
            level: 2,
            top: '30%',
            left: '70%',
            opacity: 0.25,
            float: 8,
            rotate: 6,
            duration: 5,
            render: (
                <Icon
                    as={SiEthereum}
                    boxSize={{ base: '30px', md: '39px' }}
                    color="brand.navy"
                />
            ),
        },
        {
            key: 'btc-icon',
            level: 2,
            top: '48%',
            left: '86%',
            opacity: 0.25,
            float: 7,
            rotate: -6,
            duration: 5.4,
            render: (
                <Icon
                    as={SiBitcoin}
                    boxSize={{ base: '30px', md: '39px' }}
                    color="brand.yellow"
                />
            ),
        },
        {
            key: 'base-logo',
            level: 2,
            top: '58%',
            left: '28%',
            opacity: 0.24,
            float: 7,
            rotate: 8,
            duration: 5.6,
            render: (
                <Box
                    w={{ base: '42px', md: '51px' }}
                    h={{ base: '42px', md: '51px' }}
                    bgImage="url('/networkLogos/base-logo.png')"
                    bgRepeat="no-repeat"
                    bgPosition="center"
                    bgSize="contain"
                    filter="grayscale(0.1)"
                />
            ),
        },
        {
            key: 'usdc-chip',
            level: 2,
            top: '26%',
            left: '36%',
            opacity: 0.26,
            float: 6,
            rotate: -6,
            duration: 5.8,
            render: (
                <Box
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg="blue.500"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    boxShadow="0 8px 18px rgba(51, 68, 121, 0.25)"
                >
                    USDC
                </Box>
            ),
        },
        {
            key: 'usdt-chip',
            level: 3,
            top: '80%',
            left: '56%',
            opacity: 0.26,
            float: 6,
            rotate: 6,
            duration: 6.2,
            render: (
                <Box
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg="brand.green"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    boxShadow="0 8px 18px rgba(54, 163, 123, 0.25)"
                >
                    USDT
                </Box>
            ),
        },
    ];

    return (
        <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
            {items
                .filter((item) => item.level <= level)
                .map((item) => (
                    <MotionBox
                        key={item.key}
                        position="absolute"
                        top={item.top}
                        left={item.left}
                        opacity={item.opacity ?? 0.25}
                        transform="translate(-50%, -50%)"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      y: [0, -item.float, 0],
                                      rotate: [0, item.rotate, 0],
                                  }
                        }
                        transition={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      duration: item.duration,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                      delay: item.delay ?? 0,
                                  }
                        }
                    >
                        {item.render}
                    </MotionBox>
                ))}
        </Box>
    );
};

export default FloatingDecor;
