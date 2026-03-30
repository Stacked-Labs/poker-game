'use client';

import { Box, CloseButton, Flex, Icon, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaCoins } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import {
    TOAST_BANNER_ANIMATION_MS,
    TOAST_BANNER_DURATION_MS,
} from '@/app/utils/toastDefaults';

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-100%); opacity: 0; }
`;

const scanLines = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 100%; }
`;

type Props = {
    amount: number;
    onClose: () => void;
    formatAmount?: (n: number) => string;
    isCrypto?: boolean;
};

export default function DepositSuccessToast({ amount, onClose, formatAmount, isCrypto }: Props) {
    const [isClosing, setIsClosing] = useState(false);
    const [displayAmount, setDisplayAmount] = useState(0);
    const closeTimeoutRef = useRef<number | null>(null);
    const animRef = useRef<ReturnType<typeof animate> | null>(null);

    const animationMs = TOAST_BANNER_ANIMATION_MS;
    const animation = isClosing
        ? `${slideUp} ${animationMs}ms ease-out forwards`
        : `${slideDown} ${animationMs}ms ease-out forwards`;

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => onClose(), animationMs);
    };

    // Counter animation
    useEffect(() => {
        const controls = animate(0, amount, {
            duration: 0.8,
            ease: 'easeOut',
            onUpdate: (v) => setDisplayAmount(Math.round(v)),
        });
        animRef.current = controls;
        return () => controls.stop();
    }, [amount]);

    // Auto close
    useEffect(() => {
        closeTimeoutRef.current = window.setTimeout(handleClose, TOAST_BANNER_DURATION_MS);
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatted = formatAmount
        ? formatAmount(displayAmount)
        : displayAmount.toLocaleString('en-US');

    return (
        <Box
            width="100%"
            bg="brand.green"
            color="white"
            boxShadow="0 10px 22px rgba(0,0,0,0.18), 0 0 20px rgba(54,163,123,0.35), inset 0 0 30px rgba(54,163,123,0.1)"
            animation={animation}
            position="relative"
            willChange="transform, opacity"
            overflow="hidden"
            sx={{
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                        'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
                    backgroundSize: '100% 4px',
                    animation: `${scanLines} 4s linear infinite`,
                    pointerEvents: 'none',
                },
            }}
        >
            <Flex
                align="center"
                justify="center"
                width="100%"
                px={{ base: 4, md: 6 }}
                py={2.5}
                gap={4}
            >
                {/* Icon */}
                <Box
                    position="absolute"
                    left={{ base: 4, md: 6 }}
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize="18px"
                    lineHeight={1}
                >
                    <Icon as={FaCoins} boxSize={5} />
                </Box>

                <Box minWidth={0} textAlign="center" px="44px">
                    <Text
                        fontWeight="bold"
                        fontSize={{ base: 'md', md: 'lg' }}
                        lineHeight="short"
                        color="inherit"
                        letterSpacing="0.04em"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {isCrypto ? `$${formatted} USDC` : `${formatted} chips`} loaded
                    </Text>
                    <Text
                        fontSize="2xs"
                        opacity={0.6}
                        lineHeight="short"
                        color="inherit"
                        letterSpacing="0.06em"
                        mt={0}
                    >
                        Good Luck &amp; Have Fun
                    </Text>
                </Box>

                <CloseButton
                    aria-label="Close notification"
                    onClick={handleClose}
                    size="sm"
                    borderRadius="full"
                    position="absolute"
                    right={{ base: 4, md: 6 }}
                    top="50%"
                    transform="translateY(-50%)"
                    color="inherit"
                    _hover={{ bg: 'rgba(255,255,255,0.16)' }}
                />
            </Flex>
        </Box>
    );
}
