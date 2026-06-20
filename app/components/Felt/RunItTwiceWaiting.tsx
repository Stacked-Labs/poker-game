'use client';

import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const VOTE_WINDOW_MS = 10_000;

/**
 * Passive "the table is deciding to run it twice" indicator shown on the felt during the
 * RIT vote window. Eligible voters get the actionable prompt in the footer
 * (RunItTwicePrompt); this covers everyone else — folded players and spectators — so the
 * whole table understands why the runout is paused. Shares the prompt's visual language
 * (frosted panel, two-card glyph, draining green→amber→red timer) but is read-only.
 */
const RunItTwiceWaiting = () => {
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const isVoting = (game?.ritPhase ?? 0) === 1;

    const localPlayer = game?.players?.find((p) => p.uuid === appState.clientID);
    const eligible = game?.ritEligiblePlayers ?? [];
    const isEligibleVoter = Boolean(
        localPlayer && eligible.includes(localPlayer.position)
    );
    const deadline = game?.ritVoteDeadline ?? 0;

    // Re-render on a cadence; time values derive from the deadline at render so the first
    // frame already shows the true remaining time (no 0s flash).
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isVoting || isEligibleVoter) return;
        const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 200);
        return () => clearInterval(id);
    }, [isVoting, isEligibleVoter]);

    // The server vote window is operator-tunable and only the deadline is broadcast, so
    // use the largest remaining we've seen as the effective window for the bar.
    const remainingMs = isVoting ? Math.max(deadline - Date.now(), 0) : 0;
    const windowRef = useRef(0);
    if (remainingMs > windowRef.current) windowRef.current = remainingMs;
    const windowMs = windowRef.current || VOTE_WINDOW_MS;

    if (!game || !isVoting || isEligibleVoter) {
        return null;
    }

    const votes = game.ritVotes ?? {};
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const progressPct = Math.max(
        0,
        Math.min((remainingMs / windowMs) * 100, 100)
    );
    const urgent = progressPct <= 30;
    const barColor = urgent
        ? 'red.400'
        : progressPct <= 55
          ? 'brand.yellow'
          : 'brand.green';
    const barGlow = urgent
        ? 'rgba(245, 101, 101, 0.55)'
        : progressPct <= 55
          ? 'rgba(253, 197, 29, 0.5)'
          : 'rgba(54, 163, 123, 0.5)';

    return (
        <Flex
            position="absolute"
            top={{ base: 1, md: 2 }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={5}
            pointerEvents="none"
            justify="center"
            width="max-content"
            maxW="92%"
        >
            <Flex
                direction="column"
                gap={1.5}
                px={{ base: 3, md: 3.5 }}
                py={{ base: 2, md: 2.5 }}
                borderRadius="14px"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="linear-gradient(180deg, rgba(17,28,56,0.92), rgba(9,16,38,0.94))"
                sx={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
                boxShadow="0 12px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)"
            >
                <Flex align="center" gap={2}>
                    {/* Two-card glyph — echoes the dual board. */}
                    <Box
                        position="relative"
                        w="18px"
                        h="15px"
                        flexShrink={0}
                        aria-hidden
                    >
                        <Box
                            position="absolute"
                            left="1px"
                            top="2px"
                            w="10px"
                            h="12.5px"
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
                            w="10px"
                            h="12.5px"
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
                        letterSpacing="0.05em"
                        whiteSpace="nowrap"
                    >
                        Deciding to run it twice
                    </Text>
                    {/* One dot per all-in voter — fills green as each decides. */}
                    <HStack spacing={1} flexShrink={0} aria-label="votes in">
                        {eligible.map((pn) => {
                            const voted = typeof votes[pn] === 'boolean';
                            return (
                                <Box
                                    key={pn}
                                    w="7px"
                                    h="7px"
                                    borderRadius="full"
                                    bg={voted ? 'brand.green' : 'transparent'}
                                    border="1.5px solid"
                                    borderColor={
                                        voted ? 'brand.green' : 'whiteAlpha.500'
                                    }
                                    boxShadow={
                                        voted
                                            ? '0 0 6px rgba(54,163,123,0.6)'
                                            : 'none'
                                    }
                                    transition="background-color 0.2s, border-color 0.2s, box-shadow 0.2s"
                                />
                            );
                        })}
                    </HStack>
                    <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        fontWeight={800}
                        color={urgent ? 'red.300' : 'whiteAlpha.600'}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        whiteSpace="nowrap"
                        transition="color 0.3s ease"
                    >
                        {seconds}s
                    </Text>
                </Flex>

                {/* Draining timer line — same green→amber→red language as the prompt. */}
                <Box
                    width="100%"
                    minW="200px"
                    h="3.5px"
                    bg="whiteAlpha.150"
                    borderRadius="full"
                    position="relative"
                >
                    <Box
                        position="absolute"
                        left={0}
                        top={0}
                        h="100%"
                        width={`${progressPct}%`}
                        bg={barColor}
                        borderRadius="full"
                        boxShadow={`0 0 8px ${barGlow}`}
                        transition="width 0.2s linear, background-color 0.4s ease"
                    />
                </Box>
            </Flex>
        </Flex>
    );
};

export default RunItTwiceWaiting;
