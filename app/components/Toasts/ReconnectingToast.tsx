'use client';

import {
    Box,
    CloseButton,
    Flex,
    Icon,
    Text,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdSync } from 'react-icons/md';

// Drops in from the top like the other banner toasts.
const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Calm left-to-right sweep along the bottom edge — a single, gentle motion source
// that signals "working" without the alarm of a pulse.
const sweep = keyframes`
  0%   { left: -45%; }
  100% { left: 100%; }
`;

interface ReconnectingToastProps {
    onClose: () => void;
    // Skip the backoff wait and reconnect immediately. Falls back to a full reload
    // when the live reconnect path is unavailable.
    onReconnectNow?: () => void;
}

const ReconnectingToast = ({
    onClose,
    onReconnectNow,
}: ReconnectingToastProps) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    const handleReconnect = () => {
        if (onReconnectNow) onReconnectNow();
        else window.location.reload();
    };

    return (
        <Box
            role="status"
            aria-live="polite"
            aria-atomic
            position="relative"
            overflow="hidden"
            width="100%"
            bg="brand.yellowDark"
            color="white"
            boxShadow="0 8px 18px rgba(0, 0, 0, 0.18)"
            animation={
                prefersReducedMotion ? undefined : `${slideDown} 180ms ease-out`
            }
        >
            <Flex
                align="center"
                gap={3}
                px={{ base: 4, md: 6 }}
                py={2.5}
                minH="48px"
            >
                <Icon as={MdSync} boxSize={5} flexShrink={0} aria-hidden />

                <Text
                    color="inherit"
                    fontWeight="bold"
                    fontSize="sm"
                    lineHeight="short"
                    noOfLines={1}
                    flex="1"
                    minW={0}
                >
                    Reconnecting to the table…
                </Text>

                <Box
                    as="button"
                    type="button"
                    onClick={handleReconnect}
                    flexShrink={0}
                    px={3}
                    h="28px"
                    borderRadius="full"
                    bg="whiteAlpha.400"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    lineHeight="1"
                    whiteSpace="nowrap"
                    transition="background 0.15s ease"
                    _hover={{ bg: 'whiteAlpha.500' }}
                    _active={{ bg: 'whiteAlpha.600' }}
                    _focusVisible={{
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.7)',
                    }}
                >
                    Reconnect now
                </Box>

                <CloseButton
                    aria-label="Dismiss"
                    size="sm"
                    onClick={onClose}
                    flexShrink={0}
                    color="white"
                    _hover={{ bg: 'whiteAlpha.300' }}
                />
            </Flex>

            {/* Indeterminate progress along the bottom edge; static when the player
                prefers reduced motion. */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="2px"
                overflow="hidden"
                aria-hidden
            >
                {prefersReducedMotion ? (
                    <Box position="absolute" inset={0} bg="whiteAlpha.500" />
                ) : (
                    <Box
                        position="absolute"
                        top={0}
                        bottom={0}
                        w="45%"
                        bg="whiteAlpha.800"
                        animation={`${sweep} 1.5s ease-in-out infinite`}
                    />
                )}
            </Box>
        </Box>
    );
};

export default ReconnectingToast;
