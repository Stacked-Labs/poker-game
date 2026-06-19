'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const VOTE_WINDOW_MS = 10_000;

/**
 * Passive "players are deciding to run it twice" indicator shown on the felt during
 * the RIT vote window. Eligible voters get the actionable prompt in the footer
 * (RunItTwicePrompt); this covers everyone else — folded players and spectators — so
 * the whole table understands why the runout is paused.
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

    const [remainingMs, setRemainingMs] = useState(0);
    useEffect(() => {
        if (!isVoting) {
            setRemainingMs(0);
            return;
        }
        const deadline = game?.ritVoteDeadline ?? 0;
        const update = () => setRemainingMs(Math.max(deadline - Date.now(), 0));
        update();
        const interval = setInterval(update, 200);
        return () => clearInterval(interval);
    }, [game?.ritVoteDeadline, isVoting]);

    if (!game || !isVoting || isEligibleVoter) {
        return null;
    }

    const votes = game.ritVotes ?? {};
    const votedCount = eligible.filter(
        (pn) => typeof votes[pn] === 'boolean'
    ).length;
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const progressPct = Math.max(
        0,
        Math.min((remainingMs / VOTE_WINDOW_MS) * 100, 100)
    );

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
            maxW="90%"
        >
            <Box
                bg="rgba(11, 20, 48, 0.85)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="12px"
                px={{ base: 3, md: 4 }}
                py={{ base: 1.5, md: 2 }}
                boxShadow="0 10px 24px rgba(0,0,0,0.28)"
                textAlign="center"
            >
                <Text
                    color="white"
                    fontWeight="bold"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    textTransform="uppercase"
                    letterSpacing="0.02em"
                >
                    Deciding to run it twice… {seconds}s
                </Text>
                <Text fontSize="2xs" color="whiteAlpha.800" mt={0.5}>
                    {votedCount}/{eligible.length} voted
                </Text>
                <Box
                    mt={1}
                    width="100%"
                    h="4px"
                    bg="whiteAlpha.300"
                    borderRadius="full"
                    overflow="hidden"
                >
                    <Box
                        h="100%"
                        width={`${progressPct}%`}
                        bg={progressPct <= 30 ? 'red.400' : 'brand.green'}
                        transition="width 0.15s linear"
                    />
                </Box>
            </Box>
        </Flex>
    );
};

export default RunItTwiceWaiting;
