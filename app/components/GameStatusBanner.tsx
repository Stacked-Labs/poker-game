'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import { useFormatAmount } from '../hooks/useFormatAmount';
import { Box, Flex, Icon, Text, Spinner } from '@chakra-ui/react';
import { MdPause, MdWarning, MdCheckCircle } from 'react-icons/md';
import { keyframes } from '@emotion/react';

// ── Cycling copy for pending settlement ──────────────────────────────
const PENDING_MESSAGES = [
    'Settling on chain…',
    'Confirming transactions…',
    'Writing results…',
    'Almost there…',
];
const MESSAGE_INTERVAL_MS = 3000;

// ── Keyframes ────────────────────────────────────────────────────────
const fadeIn = keyframes`
    from { transform: translateY(4px); }
    to   { transform: translateY(0); }
`;

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

type BannerMode =
    | 'settling'
    | 'settled'
    | 'settlement-failed'
    | 'paused'
    | 'pausing'
    | 'pending-blinds'
    | null;

const GameStatusBanner = () => {
    const { appState } = useContext(AppContext);
    const { format, mode: displayMode } = useFormatAmount();
    const formatBlinds = displayMode === 'bb'
        ? (v: number) => v.toLocaleString('en-US')
        : format;

    const isPaused = appState.game?.paused;
    const isPendingPause = appState.game?.pendingPause;
    const settlementStatus = appState.settlementStatus;
    const pendingBlinds = appState.game?.pendingBlinds;

    let mode: BannerMode = null;
    if (settlementStatus === 'pending') mode = 'settling';
    else if (settlementStatus === 'success') mode = 'settled';
    else if (settlementStatus === 'failed') mode = 'settlement-failed';
    else if (isPaused) mode = 'paused';
    else if (isPendingPause) mode = 'pausing';
    else if (pendingBlinds) mode = 'pending-blinds';

    // ── Cycling message index for pending settlement ──
    const [msgIndex, setMsgIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (mode === 'settling') {
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
    }, [mode]);

    if (!mode) return null;

    return (
        <Box
            data-testid="game-status-banner"
            className="game-status-banner"
            position="absolute"
            top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={990}
            textAlign="center"
            pointerEvents="none"
            userSelect="none"
        >
            {/* ── Settlement pending ─────────────────────── */}
            {mode === 'settling' && (
                <Flex
                    key="settling"
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.7}
                    animation={`${fadeIn} 300ms ease-out`}
                    role="status"
                >
                    <Spinner
                        size="xs"
                        color="whiteAlpha.700"
                        speed="0.9s"
                        thickness="2px"
                    />
                    <Text
                        key={msgIndex}
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="whiteAlpha.700"
                        animation={`${textSwap} ${MESSAGE_INTERVAL_MS}ms ease-in-out`}
                    >
                        {PENDING_MESSAGES[msgIndex]}
                    </Text>
                </Flex>
            )}

            {/* ── Settlement success ─────────────────────── */}
            {mode === 'settled' && (
                <Flex
                    key="settled"
                    align="center"
                    justifyContent="center"
                    gap={1}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.7}
                    animation={`${fadeIn} 300ms ease-out`}
                    role="status"
                >
                    <Icon
                        as={MdCheckCircle}
                        boxSize={{ base: 3.5, md: 4 }}
                        color="whiteAlpha.700"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="whiteAlpha.700"
                    >
                        Settled
                    </Text>
                </Flex>
            )}

            {/* ── Settlement failed ──────────────────────── */}
            {mode === 'settlement-failed' && (
                <Flex
                    key="failed"
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    border="1px solid"
                    borderColor="red.500"
                    boxShadow="0 0 12px rgba(229, 62, 62, 0.25)"
                    animation={`${fadeIn} 300ms ease-out, ${pulse} 2.5s ease-in-out 300ms infinite`}
                    role="alert"
                >
                    <Icon
                        as={MdWarning}
                        boxSize={{ base: 3.5, md: 4 }}
                        color="red.400"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="red.300"
                    >
                        Settlement Failed
                    </Text>
                </Flex>
            )}

            {/* ── Paused / Pausing ──────────────────────── */}
            {(mode === 'paused' || mode === 'pausing') && (
                <Flex
                    key="pause"
                    align="center"
                    justifyContent="center"
                    gap={1}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.7}
                    animation={`${fadeIn} 300ms ease-out`}
                >
                    <Icon
                        as={MdPause}
                        boxSize={{ base: 4, md: 5 }}
                        color="whiteAlpha.700"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="whiteAlpha.700"
                    >
                        {mode === 'paused'
                            ? 'Game Paused'
                            : 'Pausing after this hand…'}
                    </Text>
                </Flex>
            )}

            {/* ── Pending blinds (lowest priority) ────────── */}
            {mode === 'pending-blinds' && pendingBlinds && (
                <Flex
                    key="pending-blinds"
                    align="center"
                    justifyContent="center"
                    gap={1}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.7}
                    animation={`${fadeIn} 300ms ease-out`}
                    role="status"
                >
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="whiteAlpha.700"
                    >
                        NEXT HAND: {formatBlinds(pendingBlinds.sb)}/{formatBlinds(pendingBlinds.bb)}
                    </Text>
                </Flex>
            )}
        </Box>
    );
};

export default GameStatusBanner;
