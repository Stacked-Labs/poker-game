'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import { Box, Flex, Icon, Text, Spinner } from '@chakra-ui/react';
import { MdWarning, MdCheckCircle } from 'react-icons/md';
import { keyframes } from '@emotion/react';

// ── Cycling copy for the pending state ───────────────────────────────
const PENDING_MESSAGES = [
    'Settling on chain…',
    'Confirming transactions…',
    'Writing results…',
    'Almost there…',
];
const MESSAGE_INTERVAL_MS = 3000;

// ── Keyframes ────────────────────────────────────────────────────────
const textSwap = keyframes`
    0%   { opacity: 0; transform: translateY(6px); }
    12%  { opacity: 1; transform: translateY(0); }
    88%  { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-6px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.9; }
    50%      { opacity: 1; }
`;

const SettlementBanner = () => {
    const { appState } = useContext(AppContext);
    const status = appState.settlementStatus;

    // ── Cycling message index for pending state ──
    const [msgIndex, setMsgIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (status === 'pending') {
            setMsgIndex(0);
            intervalRef.current = setInterval(() => {
                setMsgIndex((prev) => (prev + 1) % PENDING_MESSAGES.length);
            }, MESSAGE_INTERVAL_MS);
        } else {
            setMsgIndex(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [status]);

    // ── Pending ──────────────────────────────────────────────────────
    if (status === 'pending') {
        return (
            <Box
                className="settlement-banner"
                position="absolute"
                top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={990}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
                role="status"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    color="whiteAlpha.700"
                    opacity={0.85}
                    mixBlendMode="multiply"
                    whiteSpace="nowrap"
                >
                    <Spinner
                        size="xs"
                        color="whiteAlpha.700"
                        speed="0.9s"
                        thickness="2px"
                    />
                    <Text
                        key={msgIndex}
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="900"
                        letterSpacing={{ base: '0.01em', md: '0.02em' }}
                        lineHeight="1"
                        color="whiteAlpha.700"
                        animation={`${textSwap} ${MESSAGE_INTERVAL_MS}ms ease-in-out`}
                    >
                        {PENDING_MESSAGES[msgIndex]}
                    </Text>
                </Flex>
            </Box>
        );
    }

    // ── Success ──────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <Box
                className="settlement-banner"
                position="absolute"
                top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={990}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
                role="status"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={0}
                    color="whiteAlpha.700"
                    opacity={0.85}
                    mixBlendMode="multiply"
                    whiteSpace="nowrap"
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="900"
                        letterSpacing={{ base: '0.01em', md: '0.02em' }}
                        lineHeight="1"
                        color="whiteAlpha.700"
                    >
                        Settled
                    </Text>
                    <Icon
                        as={MdCheckCircle}
                        boxSize={{ base: 3, md: 5 }}
                        color="whiteAlpha.700"
                        aria-hidden
                    />
                </Flex>
            </Box>
        );
    }

    // ── Failed ───────────────────────────────────────────────────────
    if (status === 'failed') {
        return (
            <Box
                className="settlement-banner"
                position="absolute"
                top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={990}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
                role="alert"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.600"
                    backdropFilter="blur(10px)"
                    borderRadius="full"
                    px={{ base: 3, md: 4 }}
                    py={{ base: 1.5, md: 2 }}
                    border="1px solid"
                    borderColor="red.500"
                    boxShadow="0 0 12px rgba(229, 62, 62, 0.25)"
                    animation={`${pulse} 2.5s ease-in-out infinite`}
                >
                    <Icon
                        as={MdWarning}
                        boxSize={{ base: 3.5, md: 4 }}
                        color="red.400"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="bold"
                        color="red.300"
                        letterSpacing="0.02em"
                    >
                        Settlement Failed
                    </Text>
                </Flex>
            </Box>
        );
    }

    return null;
};

export default SettlementBanner;
