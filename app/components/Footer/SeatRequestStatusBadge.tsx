'use client';

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { cancelSeatRequest } from '@/app/hooks/server_actions';
import { Button, Flex, Text, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { keyframes } from '@emotion/react';
import { FaCheck } from 'react-icons/fa';

const MotionFlex = motion(Flex);

const subtlePulse = keyframes`
    0%, 100% { box-shadow: 0 4px 12px rgba(54, 163, 123, 0.3); }
    50%      { box-shadow: 0 4px 20px rgba(54, 163, 123, 0.5); }
`;

const shimmer = keyframes`
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

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

const SeatRequestStatusBadge = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    // Accepted state takes priority — "Joining Next Hand" indicator
    if (appState.seatAccepted) {
        return (
            <MotionFlex
                alignItems="center"
                justifyContent="center"
                gap={2}
                bg="rgba(54, 163, 123, 0.06)"
                bgGradient="linear-gradient(135deg, rgba(54, 163, 123, 0.12) 0%, rgba(54, 163, 123, 0.04) 100%)"
                color="brand.green"
                border="1.5px dashed"
                borderColor="brand.green"
                fontWeight="bold"
                letterSpacing="0.04em"
                textTransform="uppercase"
                position="relative"
                overflow="hidden"
                animation={`${subtlePulse} 2s ease-in-out infinite`}
                whileHover={hoverSpring}
                whileTap={tapSpring}
                transition="box-shadow 0.3s ease, background 0.3s ease"
                sx={{
                    '@media (orientation: portrait)': portraitButton,
                    '@media (orientation: landscape)': {
                        ...landscapeButton,
                        minWidth: '14cqw',
                        maxWidth: '22cqw',
                    },
                    ...glassPseudos(shimmer),
                }}
            >
                <FaCheck color="inherit" />
                <Text
                    color="brand.green"
                    fontSize="inherit"
                    fontWeight="bold"
                    letterSpacing="inherit"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    Joining Next Hand
                </Text>
                <Text color="brand.green" opacity={0.8} fontSize="inherit" whiteSpace="nowrap">
                    (Seat {appState.seatAccepted.seatId})
                </Text>
                {appState.seatAccepted.queued && (
                    <Spinner size="sm" color="brand.green" speed="1s" ml={1} flexShrink={0} />
                )}
            </MotionFlex>
        );
    }

    // Pending state — cancel button
    if (
        !socket ||
        !appState.clientID ||
        typeof appState.seatRequested !== 'number'
    ) {
        return null;
    }

    // Owners should never see "cancel seat request"
    if (appState.isTableOwner) {
        return null;
    }

    return (
        <Button
            variant="tactileDestructive"
            data-testid="cancel-seat-request"
            onClick={() => cancelSeatRequest(socket)}
            textTransform="uppercase"
            letterSpacing="0.04em"
            sx={{
                '@media (orientation: portrait)': {
                    ...portraitButton,
                    maxWidth: '50%',
                },
                '@media (orientation: landscape)': {
                    ...landscapeButton,
                    minWidth: '7cqw',
                    maxWidth: '12cqw',
                },
            }}
        >
            <Text as="span" fontSize="inherit" fontWeight="bold" color="inherit">
                Cancel Request ({appState.seatRequested})
            </Text>
        </Button>
    );
};

export default SeatRequestStatusBadge;
