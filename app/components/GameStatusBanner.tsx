'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import { SocketContext } from '../contexts/WebSocketProvider';
import { useFormatAmount } from '../hooks/useFormatAmount';
import {
    Box,
    Flex,
    Icon,
    Text,
    Spinner,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { MdPause, MdWarning, MdCheckCircle } from 'react-icons/md';
import { FaPlay } from 'react-icons/fa6';
import { FiClock, FiChevronsUp, FiCoffee } from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import useIsTableOwner from '../hooks/useIsTableOwner';
import { useLevelCountdown } from '../hooks/useLevelCountdown';
import { sendResumeGameCommand } from '../hooks/server_actions';

// ── Cycling copy for pending settlement ──────────────────────────────
const PENDING_MESSAGES = [
    'Settling on chain…',
    'Confirming transactions…',
    'Writing results…',
    'Almost there…',
];
const RECOVERY_SUBTEXT_MESSAGES = [
    'Resuming automatically',
    'Funds are safe on-chain',
    'No action needed',
    'Auto-resume when it lands',
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
    | 'settlement-recovery'
    | 'settled'
    | 'settlement-failed'
    | 'paused'
    | 'pausing'
    | 'break'
    | 'pending-blinds'
    | 'tournament-clock'
    | null;

const GameStatusBanner = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const isOwner = useIsTableOwner();
    const { format, mode: displayMode } = useFormatAmount();

    const handleResume = () => {
        if (!socket) return;
        sendResumeGameCommand(socket);
    };
    const formatBlinds = displayMode === 'bb'
        ? (v: number) => v.toLocaleString('en-US')
        : format;

    const isPaused = appState.game?.paused;
    const isPendingPause = appState.game?.pendingPause;
    const settlementStatus = appState.settlementStatus;
    const pendingBlinds = appState.game?.pendingBlinds;
    const tournamentClock = appState.tournamentLive?.clock ?? null;
    const prefersReducedMotion = usePrefersReducedMotion();
    const countdown = useLevelCountdown(tournamentClock);

    // Whether the ambient tournament UI (clock / break) should show at all: only
    // while the local player is still in and the event isn't over (otherwise the
    // result card owns the space).
    const tournamentActive =
        !!tournamentClock &&
        !appState.tournamentLive?.myResult &&
        !appState.tournamentLive?.completed;
    const onBreak = tournamentActive && tournamentClock?.onBreak === true;

    // Precedence (highest → lowest): the settlement states and an explicit table
    // pause win over the rest break — a table still settling its last hand shows
    // the settlement message first, then the break. The break in turn outranks the
    // ambient tournament clock and pending-blinds. (Plan §7.4.)
    // settlement-recovery takes priority: paused + pending means the background watcher
    // is polling and the table will auto-resume — don't show the generic pause banner.
    let mode: BannerMode = null;
    if (isPaused && settlementStatus === 'pending' && !isOwner) mode = 'settlement-recovery';
    else if (settlementStatus === 'pending') mode = 'settling';
    else if (settlementStatus === 'success') mode = 'settled';
    else if (settlementStatus === 'failed') mode = 'settlement-failed';
    else if (isPaused) mode = 'paused';
    else if (isPendingPause) mode = 'pausing';
    else if (onBreak) mode = 'break';
    else if (pendingBlinds) mode = 'pending-blinds';
    else if (tournamentActive)
        // Once the local player is out (or the event is over), the result card
        // takes over — don't keep an ambient clock running behind it.
        mode = 'tournament-clock';

    // ── Cycling message index for settling ──
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

    // ── Elapsed counter for settlement-recovery ──
    const [elapsedSec, setElapsedSec] = useState(0);
    const recoveryStartRef = useRef<number | null>(null);
    const elapsedTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Cycling subtext for settlement-recovery ──
    const [recoveryMsgIndex, setRecoveryMsgIndex] = useState(0);
    const recoveryMsgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (mode === 'settlement-recovery') {
            setRecoveryMsgIndex(0);
            recoveryMsgIntervalRef.current = setInterval(() => {
                setRecoveryMsgIndex((prev) => (prev + 1) % RECOVERY_SUBTEXT_MESSAGES.length);
            }, MESSAGE_INTERVAL_MS);
        } else {
            setRecoveryMsgIndex(0);
            if (recoveryMsgIntervalRef.current) clearInterval(recoveryMsgIntervalRef.current);
        }
        return () => {
            if (recoveryMsgIntervalRef.current) clearInterval(recoveryMsgIntervalRef.current);
        };
    }, [mode]);

    useEffect(() => {
        if (mode === 'settlement-recovery') {
            recoveryStartRef.current = Date.now();
            setElapsedSec(0);
            elapsedTickRef.current = setInterval(() => {
                if (recoveryStartRef.current == null) return;
                setElapsedSec(Math.floor((Date.now() - recoveryStartRef.current) / 1000));
            }, 1000);
        } else {
            recoveryStartRef.current = null;
            setElapsedSec(0);
            if (elapsedTickRef.current) clearInterval(elapsedTickRef.current);
        }
        return () => {
            if (elapsedTickRef.current) clearInterval(elapsedTickRef.current);
        };
    }, [mode]);

    // Brief "blinds up" flash when the level advances.
    const [blindsUpFlash, setBlindsUpFlash] = useState(false);
    const prevLevelRef = useRef<number | null>(null);
    const levelNumber = tournamentClock?.levelNumber ?? null;
    useEffect(() => {
        if (levelNumber == null) {
            prevLevelRef.current = null;
            return;
        }
        if (prevLevelRef.current != null && levelNumber > prevLevelRef.current) {
            setBlindsUpFlash(true);
            prevLevelRef.current = levelNumber;
            const t = setTimeout(() => setBlindsUpFlash(false), 2000);
            return () => clearTimeout(t);
        }
        prevLevelRef.current = levelNumber;
    }, [levelNumber]);

    if (!mode) return null;

    const lastMinute =
        countdown.remainingMs > 0 && countdown.remainingMs <= 60_000;
    // "Break coming" hint during the level immediately before a break: the server
    // tells us how many wall-clock seconds remain until the break, and the next
    // break follows the current level. Show it only in the final minute so it
    // doesn't crowd the normal "blinds up" copy.
    const secondsToNextBreak = tournamentClock?.secondsToNextBreak;
    const nextBreakAfterLevel = tournamentClock?.nextBreakAfterLevel;
    const breakComing =
        mode === 'tournament-clock' &&
        secondsToNextBreak != null &&
        secondsToNextBreak > 0 &&
        nextBreakAfterLevel != null &&
        tournamentClock != null &&
        nextBreakAfterLevel === tournamentClock.levelNumber &&
        lastMinute;
    // The break countdown label/remaining (when on break) comes from the same
    // hook, which switches to the break remainder while onBreak.
    const breakLabel = countdown.label;
    // While on a break the server freezes levelNumber at the just-completed level,
    // so play resumes into the next one. Do NOT derive this from nextBreakAfterLevel:
    // during a break that field points at the NEXT future break boundary (and is 0 on
    // the final break), which would show a wrong/nonsensical resume level.
    const nextLevelAfterBreak = (tournamentClock?.levelNumber ?? 0) + 1;

    return (
        <Box
            data-testid="game-status-banner"
            className="game-status-banner"
            position="absolute"
            top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
            left="50%"
            transform="translateX(-50%)"
            // Ambient felt-band status pill: it must sit BEHIND the seat furniture.
            // Nothing between here and the table's stacking root creates a stacking
            // context, so this z-index competes directly with the seat dealer button +
            // bet bubbles (z-index 5). It was 990 and painted the pill over the bottom
            // seat's chips on tight / mobile layouts. Kept above the community cards
            // and RIT boards (z 1–2) so it still reads over the felt.
            zIndex={4}
            textAlign="center"
            pointerEvents={isOwner && (mode === 'paused' || mode === 'pausing') ? 'auto' : 'none'}
            userSelect="none"
        >
            {/* ── Settlement pending (fast path) ────────── */}
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

            {/* ── Settlement recovery (paused + pending) ── */}
            {mode === 'settlement-recovery' && (
                <Flex
                    key="settlement-recovery"
                    direction="column"
                    align="center"
                    gap={0.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.9}
                    animation={`${fadeIn} 300ms ease-out`}
                    role="status"
                >
                    <Flex align="center" gap={1.5}>
                        <Spinner size="xs" color="orange.300" speed="0.9s" thickness="2px" />
                        <Text
                            fontSize={{ base: 'xs', md: 'sm' }}
                            fontWeight="700"
                            letterSpacing="0.04em"
                            lineHeight="1"
                            color="orange.200"
                        >
                            Settling on-chain… · {elapsedSec}s
                        </Text>
                    </Flex>
                    <Text
                        key={recoveryMsgIndex}
                        fontSize="xs"
                        fontWeight="500"
                        letterSpacing="0.03em"
                        lineHeight="1"
                        color="whiteAlpha.400"
                        animation={`${textSwap} ${MESSAGE_INTERVAL_MS}ms ease-in-out`}
                    >
                        {RECOVERY_SUBTEXT_MESSAGES[recoveryMsgIndex]}
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
                    data-testid={isOwner ? 'game-paused-banner' : undefined}
                    align="center"
                    justifyContent="center"
                    gap={isOwner ? 1.5 : 1}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    pl={{ base: 2.5, md: 3 }}
                    pr={isOwner ? { base: 1, md: 1 } : { base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={isOwner ? 0.9 : 0.7}
                    animation={`${fadeIn} 300ms ease-out`}
                    role={isOwner ? 'status' : undefined}
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
                    {isOwner && (
                        <OwnerPauseAction
                            mode={mode}
                            onClick={handleResume}
                        />
                    )}
                </Flex>
            )}

            {/* ── Rest break (above clock/pending-blinds, below pause) ── */}
            {mode === 'break' && tournamentClock && (
                <Flex
                    key="break"
                    data-testid="game-break-banner"
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={0.9}
                    animation={
                        prefersReducedMotion
                            ? undefined
                            : `${fadeIn} 300ms ease-out`
                    }
                    role="status"
                >
                    <Icon
                        as={FiCoffee}
                        boxSize={{ base: 3.5, md: 4 }}
                        color="brand.yellow"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color="brand.yellow"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        On break — {breakLabel} · Level {nextLevelAfterBreak}{' '}
                        next
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

            {/* ── Tournament clock (ambient; lowest priority) ── */}
            {mode === 'tournament-clock' && tournamentClock && (
                <Flex
                    key="tournament-clock"
                    align="center"
                    justifyContent="center"
                    gap={1.5}
                    whiteSpace="nowrap"
                    bg="blackAlpha.200"
                    backdropFilter="blur(8px)"
                    borderRadius="full"
                    px={{ base: 2.5, md: 3 }}
                    py={{ base: 1, md: 1.5 }}
                    opacity={blindsUpFlash || lastMinute ? 0.95 : 0.7}
                    animation={
                        prefersReducedMotion
                            ? undefined
                            : lastMinute && !blindsUpFlash
                              ? `${pulse} 1.4s ease-in-out infinite`
                              : `${fadeIn} 300ms ease-out`
                    }
                    role="status"
                >
                    <Icon
                        as={
                            blindsUpFlash
                                ? FiChevronsUp
                                : breakComing
                                  ? FiCoffee
                                  : FiClock
                        }
                        boxSize={{ base: 3.5, md: 4 }}
                        color={
                            blindsUpFlash || lastMinute
                                ? 'brand.yellow'
                                : 'whiteAlpha.700'
                        }
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="700"
                        letterSpacing="0.04em"
                        lineHeight="1"
                        color={
                            blindsUpFlash || lastMinute
                                ? 'brand.yellow'
                                : 'whiteAlpha.700'
                        }
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {blindsUpFlash
                            ? `Blinds up · ${tournamentClock.sb.toLocaleString(
                                  'en-US'
                              )}/${tournamentClock.bb.toLocaleString('en-US')}`
                            : breakComing
                              ? `Break in ${countdown.label}`
                              : lastMinute
                                ? `Blinds up in ${countdown.label}`
                                : `Level ${
                                      tournamentClock.levelNumber + 1
                                  } in ${countdown.label}`}
                    </Text>
                </Flex>
            )}
        </Box>
    );
};

export default GameStatusBanner;

interface OwnerPauseActionProps {
    mode: 'paused' | 'pausing';
    onClick: () => void;
}

const OwnerPauseAction = ({ mode, onClick }: OwnerPauseActionProps) => {
    const isResume = mode === 'paused';
    const accent = isResume ? 'brand.green' : 'brand.pink';
    return (
        <Flex
            as="button"
            type="button"
            data-testid={isResume ? 'resume-game-btn' : 'cancel-pause-btn'}
            onClick={onClick}
            align="center"
            gap={1}
            h={{ base: '20px', md: '22px' }}
            px={{ base: 2, md: 2.5 }}
            borderRadius="full"
            bg="whiteAlpha.100"
            color="whiteAlpha.800"
            fontSize={{ base: '2xs', md: 'xs' }}
            fontWeight={800}
            letterSpacing="0.04em"
            lineHeight="1"
            transition="background 120ms ease, color 120ms ease, transform 120ms ease"
            _hover={{ bg: 'whiteAlpha.200', color: accent }}
            _active={{ transform: 'translateY(1px)', bg: 'whiteAlpha.300' }}
            _focusVisible={{ boxShadow: `0 0 0 2px var(--chakra-colors-${isResume ? 'brand-green' : 'brand-pink'})` }}
            pointerEvents="auto"
        >
            {isResume && (
                <Icon as={FaPlay} boxSize="7px" color="currentColor" aria-hidden />
            )}
            <Text as="span" color="inherit">
                {isResume ? 'Resume' : 'Cancel'}
            </Text>
        </Flex>
    );
};
