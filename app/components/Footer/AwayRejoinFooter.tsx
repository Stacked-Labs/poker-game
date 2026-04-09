'use client';

import { useContext } from 'react';
import { Flex, Button, Text, Spinner, Icon } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { FaUserCheck } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    handleReturnReady,
    handleCancelRejoin,
} from '@/app/hooks/useTableOptions';

const MotionButton = motion(Button);

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(54, 163, 123, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(54, 163, 123, 0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const sharedButtonSx = {
    '@media (orientation: portrait)': {
        borderRadius: '10px',
        padding: '2%',
        fontSize: '3cqw',
        flex: 1,
        height: 'auto',
        minHeight: '8cqh',
        maxHeight: '100%',
        flexShrink: 1,
    },
    '@media (orientation: landscape)': {
        borderRadius: '10px',
        padding: '0.5% 1.5%',
        fontSize: '1cqw',
        height: '100%',
        flexShrink: 0,
    },
};

const AwayRejoinFooter = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const { info } = useToastHelper();
    const prefersReducedMotion = useReducedMotion();

    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const readyNextHand = localPlayer?.readyNextHand;

    if (readyNextHand) {
        // "Rejoining next hand..." state
        return (
            <Flex
                className="away-rejoin-footer"
                alignItems="center"
                gap="1%"
                p="1%"
                height="auto"
                maxHeight={{ base: '70px', md: '100px' }}
                minHeight={{ base: '50px', md: '70px' }}
                overflow="hidden"
                zIndex={1}
                width="100%"
                sx={{
                    '@media (orientation: portrait)': {
                        justifyContent: 'space-between',
                    },
                    '@media (orientation: landscape)': {
                        justifyContent: 'flex-end',
                    },
                }}
            >
                {/* Status indicator — styled like a loading ActionButton */}
                <Flex
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    bg="rgba(54, 163, 123, 0.06)"
                    border="1.5px dashed"
                    borderColor="brand.green"
                    color="brand.green"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    position="relative"
                    overflow="hidden"
                    sx={{
                        ...sharedButtonSx,
                        '@media (orientation: portrait)': {
                            ...sharedButtonSx['@media (orientation: portrait)'],
                        },
                        '@media (orientation: landscape)': {
                            ...sharedButtonSx['@media (orientation: landscape)'],
                            minWidth: '10cqw',
                            maxWidth: '18cqw',
                        },
                    }}
                >
                    <Spinner
                        size="sm"
                        color="brand.green"
                        speed="1s"
                        flexShrink={0}
                    />
                    <Text
                        color="brand.green"
                        fontWeight="bold"
                        fontSize="inherit"
                        letterSpacing="inherit"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Rejoining next hand...
                    </Text>
                </Flex>

                {/* Cancel — fold-family colour, ghost treatment */}
                <MotionButton
                    data-testid="cancel-rejoin-btn"
                    bg="rgba(235, 11, 92, 0.1)"
                    color="rgba(235, 11, 92, 0.9)"
                    border="1.5px solid"
                    borderColor="rgba(235, 11, 92, 0.5)"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    position="relative"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => handleCancelRejoin(socket, info)}
                    whileHover={{
                        y: -2,
                        scale: 1.03,
                        transition: { type: 'spring', stiffness: 400, damping: 17 },
                    }}
                    whileTap={{
                        scale: 0.95,
                        y: 0,
                        transition: { type: 'spring', stiffness: 500, damping: 15 },
                    }}
                    _hover={{
                        bg: 'rgba(235, 11, 92, 0.18)',
                        borderColor: 'rgba(235, 11, 92, 0.75)',
                        boxShadow: '0 8px 24px rgba(235, 11, 92, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                    transition="box-shadow 0.3s ease, background 0.3s ease"
                    sx={{
                        ...sharedButtonSx,
                        '@media (orientation: portrait)': {
                            ...sharedButtonSx['@media (orientation: portrait)'],
                            maxWidth: '30%',
                        },
                        '@media (orientation: landscape)': {
                            ...sharedButtonSx['@media (orientation: landscape)'],
                            minWidth: '5cqw',
                            maxWidth: '10cqw',
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)',
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                            backgroundSize: '200% 100%',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none',
                        },
                        '&:hover::after': {
                            opacity: 1,
                            animation: `${shimmer} 1.5s ease-in-out infinite`,
                        },
                    }}
                >
                    Cancel
                </MotionButton>
            </Flex>
        );
    }

    // "I'm Back" state
    return (
        <Flex
            className="away-rejoin-footer"
            justifyContent="center"
            alignItems="center"
            gap={3}
            p={2}
            height="auto"
            maxHeight={{ base: '70px', md: '100px' }}
            minHeight={{ base: '50px', md: '70px' }}
            overflow="hidden"
            zIndex={1}
        >
            <MotionButton
                data-testid="rejoin-footer-btn"
                bg="brand.green"
                bgGradient="linear-gradient(135deg, rgba(54, 163, 123, 1) 0%, rgba(45, 135, 99, 1) 100%)"
                color="white"
                border="1.5px solid"
                borderColor="rgba(54, 163, 123, 0.6)"
                borderRadius="12px"
                fontWeight="bold"
                letterSpacing="0.04em"
                textTransform="uppercase"
                fontSize={{ base: 'md', md: 'lg' }}
                px={{ base: 8, md: 12 }}
                py={{ base: 3, md: 4 }}
                height="auto"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleReturnReady(socket, info)}
                animation={
                    prefersReducedMotion
                        ? undefined
                        : `${pulseGlow} 2s ease-out infinite`
                }
                whileHover={{
                    y: -2,
                    scale: 1.03,
                    transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                    },
                }}
                whileTap={{
                    scale: 0.95,
                    y: 0,
                    transition: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 15,
                    },
                }}
                _hover={{
                    boxShadow:
                        '0 8px 24px rgba(54, 163, 123, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
                transition="box-shadow 0.3s ease, background 0.3s ease"
                sx={{
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background:
                            'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
                        backgroundSize: '200% 100%',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                    },
                    '&:hover::after': {
                        opacity: 1,
                        animation: `${shimmer} 1.5s ease-in-out infinite`,
                    },
                    '@media (orientation: portrait)': {
                        width: '100%',
                        maxWidth: '100%',
                        flex: 1,
                    },
                    '@media (orientation: landscape)': {
                        width: 'auto',
                        minWidth: '200px',
                    },
                }}
            >
                <Icon as={FaUserCheck} boxSize={{ base: 5, md: 6 }} mr={2} />
                {"I'm Back"}
            </MotionButton>
        </Flex>
    );
};

export default AwayRejoinFooter;
