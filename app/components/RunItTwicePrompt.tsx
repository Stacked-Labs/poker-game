'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendRITVote } from '@/app/hooks/server_actions';
import ActionButton from './Footer/ActionButton';

const VOTE_WINDOW_MS = 10_000;

const RunItTwicePrompt = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const game = appState.game;
    const localPlayer = game?.players?.find(
        (p) => p.uuid === appState.clientID
    );

    const eligiblePlayerNums = game?.ritEligiblePlayers ?? [];
    const localPosition = localPlayer?.position ?? -1;
    const isEligible = eligiblePlayerNums.includes(localPosition);
    const isVoting = (game?.ritPhase ?? 0) === 1;
    const deadline = game?.ritVoteDeadline ?? 0;

    // Re-render on a fixed cadence while voting; the time values are derived from the
    // deadline at render (below), not stored — so the first voting frame already shows
    // the true remaining time instead of flashing 0s.
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isVoting || !isEligible) return;
        const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 200);
        return () => clearInterval(id);
    }, [isVoting, isEligible]);

    // The server vote window is operator-tunable (POKER_RIT_VOTE_WINDOW) and only the
    // deadline is broadcast, so use the largest remaining we've observed as the effective
    // window for the progress fill — it adapts to whatever the server window actually is.
    const remainingMs = isVoting ? Math.max(deadline - Date.now(), 0) : 0;
    const windowRef = useRef(0);
    if (remainingMs > windowRef.current) windowRef.current = remainingMs;
    const windowMs = windowRef.current || VOTE_WINDOW_MS;

    if (!game || !localPlayer || !isEligible || !isVoting) {
        return null;
    }

    const localVote = (game.ritVotes ?? {})[localPosition];
    const hasSubmittedVote = typeof localVote === 'boolean';
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const progressPct = Math.max(
        0,
        Math.min((remainingMs / windowMs) * 100, 100)
    );
    const urgent = progressPct <= 30;
    // Each vote button wears a "fuse": a tone-colored ring around its perimeter that burns
    // down (depletes clockwise) as the window closes. The lit arc glows; the spent arc
    // fades to the plain outline, so the button's own border reads as a burning fuse.
    const voteButtons = [
        {
            tone: 'green',
            label: 'Yes',
            vote: true,
            testId: 'rit-vote-yes',
            lit: '#7BE6BE',
            glow: 'rgba(54, 163, 123, 0.85)',
        },
        {
            tone: 'red',
            label: 'No',
            vote: false,
            testId: 'rit-vote-no',
            lit: '#FF7BA6',
            glow: 'rgba(235, 11, 92, 0.85)',
        },
    ];

    return (
        // The footer slot is justify flex-end (landscape) so this whole unit sits at the
        // right like the action row; in portrait it fills the width. The buttons get the
        // same spacing as Raise/Call/Fold and a floating label/countdown above.
        <Flex
            position="relative"
            alignItems="stretch"
            height="100%"
            gap={{ base: '8px', md: '10px' }}
            sx={{
                '@media (orientation: landscape)': { width: 'auto' },
                '@media (orientation: portrait)': { flex: 1, width: '100%' },
            }}
        >
            {/* Label + countdown, above the buttons (spans their width). */}
            <Flex
                position="absolute"
                left={0}
                right={0}
                bottom="calc(100% + 6px)"
                align="center"
                gap={1.5}
                pointerEvents="none"
                sx={{
                    '@media (orientation: portrait)': {
                        bottom: 'calc(100% + 4px)',
                    },
                }}
            >
                <Box
                    position="relative"
                    w="16px"
                    h="14px"
                    flexShrink={0}
                    aria-hidden
                >
                    <Box
                        position="absolute"
                        left="1px"
                        top="2px"
                        w="9px"
                        h="11px"
                        borderRadius="2px"
                        bg="whiteAlpha.300"
                        border="1px solid"
                        borderColor="whiteAlpha.400"
                        transform="rotate(-9deg)"
                    />
                    <Box
                        position="absolute"
                        right="0"
                        top="1px"
                        w="9px"
                        h="11px"
                        borderRadius="2px"
                        bg="white"
                        transform="rotate(7deg)"
                        boxShadow="0 1px 2px rgba(0,0,0,0.5)"
                    />
                </Box>
                <Text
                    color="white"
                    fontWeight={800}
                    fontSize={{ base: '2xs', md: 'xs' }}
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    whiteSpace="nowrap"
                    sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.75)' }}
                >
                    Run It Twice?
                </Text>
                <Box flex={1} minW="10px" />
                <Text
                    fontWeight={800}
                    fontSize={{ base: '2xs', md: 'xs' }}
                    color={urgent ? 'red.300' : 'whiteAlpha.700'}
                    sx={{
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: '0 1px 3px rgba(0,0,0,0.75)',
                    }}
                    whiteSpace="nowrap"
                >
                    {hasSubmittedVote ? 'Waiting' : `${seconds}s`}
                </Text>
            </Flex>

            {/* Each YES/NO is the footer ActionButton in subtle outline mode (tone border
                + text), wrapped with a perimeter fuse that burns down around its edge. */}
            {voteButtons.map((b) => (
                <Box
                    key={b.testId}
                    position="relative"
                    display="flex"
                    alignItems="stretch"
                    sx={{
                        '@media (orientation: landscape)': { width: 'auto' },
                        '@media (orientation: portrait)': { flex: 1 },
                    }}
                >
                    <ActionButton
                        text={b.label}
                        color={b.tone}
                        outline
                        testId={b.testId}
                        hotkey=""
                        isDisabled={!socket || hasSubmittedVote}
                        clickHandler={() =>
                            socket && sendRITVote(socket, b.vote)
                        }
                    />
                    {/* Perimeter fuse — a 2px ring (conic-gradient masked to the border)
                        lit for the remaining %, glowing; the spent arc falls back to the
                        plain outline so the edge reads as a burning fuse. */}
                    {!hasSubmittedVote && (
                        <Box
                            position="absolute"
                            top="-1px"
                            left="-1px"
                            right="-1px"
                            bottom="-1px"
                            borderRadius="11px"
                            pointerEvents="none"
                            zIndex={11}
                            sx={{
                                padding: '2px',
                                background: `conic-gradient(${b.lit} ${progressPct}%, transparent ${progressPct}%)`,
                                WebkitMask:
                                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                filter: `drop-shadow(0 0 ${urgent ? '5px' : '3px'} ${b.glow})`,
                                transition: 'background 0.25s linear',
                            }}
                        />
                    )}
                </Box>
            ))}
        </Flex>
    );
};

export default RunItTwicePrompt;
