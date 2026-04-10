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
  0%   { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(54, 163, 123, 0); }
  100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ── shared responsive sizing (matches ActionButton scale) ─────────────── */
const portraitButton = {
    borderRadius: '10px',
    padding: '2%',
    fontSize: '3cqw',
    flex: 1,
    height: 'auto',
    minHeight: '8cqh',
    maxHeight: '100%',
    flexShrink: 1,
};

const landscapeButton = {
    borderRadius: '10px',
    padding: '0.5% 1.5%',
    fontSize: '1cqw',
    height: '100%',
    flexShrink: 0,
};

/* ── shared glass + shimmer pseudo-elements ────────────────────────────── */
const glassPseudos = (shimmerRef: typeof shimmer, glassOpacity = 0.06) => ({
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: `linear-gradient(to bottom, rgba(255,255,255,${glassOpacity}), transparent)`,
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
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        backgroundSize: '200% 100%',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
    },
    '&:hover::after': {
        opacity: 1,
        animation: `${shimmerRef} 1.5s ease-in-out infinite`,
    },
});

/* ── shared framer-motion spring presets ───────────────────────────────── */
const hoverSpring = {
    y: -2,
    scale: 1.03,
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
};
const tapSpring = {
    scale: 0.95,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 15 },
};

/* ── wrapper Flex — identical to FooterWithActionButtons layout ────────── */
const footerFlexSx = {
    '@media (orientation: portrait)': {
        justifyContent: 'space-between',
        gap: '1%',
        padding: '1%',
        height: '100%',
        maxHeight: '70px',
        minHeight: '50px',
    },
    '@media (orientation: landscape)': {
        justifyContent: 'flex-end',
        gap: '0.8%',
        height: '100%',
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
        return (
            <Flex
                className="away-rejoin-footer"
                alignItems="center"
                overflow="visible"
                bg="transparent"
                width="100%"
                position="relative"
                zIndex={1}
                sx={footerFlexSx}
            >
                {/* Status indicator */}
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
                        '@media (orientation: portrait)': portraitButton,
                        '@media (orientation: landscape)': {
                            ...landscapeButton,
                            minWidth: '7cqw',
                            maxWidth: '12cqw',
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

                {/* Cancel — fold-colour ghost */}
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
                    whileHover={hoverSpring}
                    whileTap={tapSpring}
                    _hover={{
                        bg: 'rgba(235, 11, 92, 0.18)',
                        borderColor: 'rgba(235, 11, 92, 0.75)',
                        boxShadow:
                            '0 8px 24px rgba(235, 11, 92, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                    transition="box-shadow 0.3s ease, background 0.3s ease"
                    sx={{
                        '@media (orientation: portrait)': {
                            ...portraitButton,
                            maxWidth: '30%',
                        },
                        '@media (orientation: landscape)': {
                            ...landscapeButton,
                            minWidth: '7cqw',
                            maxWidth: '12cqw',
                        },
                        ...glassPseudos(shimmer),
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
            alignItems="center"
            overflow="visible"
            bg="transparent"
            width="100%"
            position="relative"
            zIndex={1}
            sx={footerFlexSx}
        >
            <MotionButton
                data-testid="rejoin-footer-btn"
                bg="brand.green"
                bgGradient="linear-gradient(135deg, rgba(54, 163, 123, 1) 0%, rgba(45, 135, 99, 1) 100%)"
                color="white"
                border="1.5px solid"
                borderColor="rgba(54, 163, 123, 0.6)"
                fontWeight="bold"
                letterSpacing="0.04em"
                textTransform="uppercase"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleReturnReady(socket, info)}
                animation={
                    prefersReducedMotion
                        ? undefined
                        : `${pulseGlow} 2s ease-out infinite`
                }
                whileHover={hoverSpring}
                whileTap={tapSpring}
                _hover={{
                    boxShadow:
                        '0 8px 24px rgba(54, 163, 123, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                transition="box-shadow 0.3s ease, background 0.3s ease"
                sx={{
                    '@media (orientation: portrait)': portraitButton,
                    '@media (orientation: landscape)': {
                        ...landscapeButton,
                        minWidth: '7cqw',
                        maxWidth: '12cqw',
                    },
                    ...glassPseudos(shimmer, 0.15),
                }}
            >
                <Icon as={FaUserCheck} boxSize={{ base: 5, md: 6 }} mr={2} />
                {"I'm Back"}
            </MotionButton>
        </Flex>
    );
};

export default AwayRejoinFooter;
