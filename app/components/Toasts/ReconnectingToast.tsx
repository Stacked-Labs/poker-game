'use client';

import {
    Box,
    Button,
    CloseButton,
    Flex,
    Icon,
    Text,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdWifiTethering } from 'react-icons/md';

// Calm left-to-right sweep for the indeterminate progress track. A single, gentle
// motion source (no pulsing/scale) keeps the moment reassuring rather than alarming.
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
    const iconColor = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const iconBg = useColorModeValue(
        'rgba(253, 197, 29, 0.14)',
        'rgba(253, 197, 29, 0.16)'
    );
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.10)'
    );

    const handleReconnect = () => {
        if (onReconnectNow) onReconnectNow();
        else window.location.reload();
    };

    return (
        <Box
            role="status"
            aria-live="polite"
            aria-atomic
            bg="card.white"
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="14px"
            boxShadow="0 12px 32px rgba(11, 20, 48, 0.18)"
            p={4}
            position="relative"
            overflow="hidden"
            maxW="380px"
            w="100%"
        >
            <CloseButton
                aria-label="Dismiss"
                size="sm"
                onClick={onClose}
                position="absolute"
                top={2}
                right={2}
                color="text.muted"
                _hover={{ color: 'text.primary', bg: 'card.lightGray' }}
            />

            <Flex align="center" gap={3} pr={6}>
                <Flex
                    align="center"
                    justify="center"
                    flexShrink={0}
                    boxSize="38px"
                    borderRadius="full"
                    bg={iconBg}
                >
                    <Icon
                        as={MdWifiTethering}
                        boxSize={5}
                        color={iconColor}
                        aria-hidden
                    />
                </Flex>

                <Box minW={0}>
                    <Text
                        fontWeight="bold"
                        fontSize="md"
                        lineHeight="short"
                        color="text.primary"
                    >
                        Reconnecting to the table…
                    </Text>
                    <Text
                        fontSize="sm"
                        lineHeight="short"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Hang tight, your seat is being held and your chips stay
                        safe on-chain.
                    </Text>
                </Box>
            </Flex>

            {/* Indeterminate progress: a moving segment while reconnecting; a static
                low-opacity track when the player prefers reduced motion. */}
            <Box
                mt={3}
                h="3px"
                borderRadius="full"
                bg={trackBg}
                position="relative"
                overflow="hidden"
                aria-hidden
            >
                {prefersReducedMotion ? (
                    <Box
                        position="absolute"
                        inset={0}
                        bg="brand.yellow"
                        opacity={0.5}
                    />
                ) : (
                    <Box
                        position="absolute"
                        top={0}
                        bottom={0}
                        w="45%"
                        borderRadius="full"
                        bg="brand.yellow"
                        animation={`${sweep} 1.5s ease-in-out infinite`}
                    />
                )}
            </Box>

            <Flex justify="flex-end" mt={3}>
                <Button
                    variant="tactileOutline"
                    size="sm"
                    onClick={handleReconnect}
                >
                    Reconnect now
                </Button>
            </Flex>
        </Box>
    );
};

export default ReconnectingToast;
