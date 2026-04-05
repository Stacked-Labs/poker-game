'use client';

import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendRITVote } from '@/app/hooks/server_actions';

const VOTE_WINDOW_MS = 10_000;

const RunItTwicePrompt = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const game = appState.game;
    const localPlayer = game?.players?.find((p) => p.uuid === appState.clientID);

    const eligiblePlayerNums = game?.ritEligiblePlayers ?? [];
    const localPosition = localPlayer?.position ?? -1;
    const isEligible = eligiblePlayerNums.includes(localPosition);
    const isVoting = (game?.ritPhase ?? 0) === 1;

    const [remainingMs, setRemainingMs] = useState(0);

    useEffect(() => {
        if (!isVoting || !isEligible) {
            setRemainingMs(0);
            return;
        }

        const deadline = game?.ritVoteDeadline ?? 0;
        const update = () => {
            setRemainingMs(Math.max(deadline - Date.now(), 0));
        };

        update();
        const interval = setInterval(update, 200);
        return () => clearInterval(interval);
    }, [game?.ritVoteDeadline, isEligible, isVoting]);

    const progressPct = useMemo(() => {
        if (!isVoting) return 0;
        return Math.max(0, Math.min((remainingMs / VOTE_WINDOW_MS) * 100, 100));
    }, [isVoting, remainingMs]);

    if (!game || !localPlayer || !isEligible || !isVoting) {
        return null;
    }

    const votes = game.ritVotes ?? {};
    const localVote = votes[localPosition];
    const hasSubmittedVote = typeof localVote === 'boolean';

    return (
        <Flex
            width="100%"
            alignItems="center"
            justifyContent="center"
            px={{ base: 2, md: 3 }}
            py={{ base: 1, md: 2 }}
        >
            <VStack
                width="100%"
                maxW="540px"
                spacing={2}
                bg="rgba(11, 20, 48, 0.85)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="14px"
                px={{ base: 3, md: 4 }}
                py={{ base: 2, md: 3 }}
                boxShadow="0 12px 28px rgba(0,0,0,0.28)"
            >
                <Text
                    color="white"
                    fontWeight="bold"
                    fontSize={{ base: 'md', md: 'lg' }}
                    textTransform="uppercase"
                    letterSpacing="0.02em"
                >
                    Run It Twice?
                </Text>

                <Box
                    width="100%"
                    h="8px"
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

                <Flex width="100%" gap={2}>
                    <Button
                        flex={1}
                        bg="brand.green"
                        color="white"
                        onClick={() => socket && sendRITVote(socket, true)}
                        isDisabled={!socket || hasSubmittedVote}
                    >
                        Yes
                    </Button>
                    <Button
                        flex={1}
                        bg="brand.pink"
                        color="white"
                        onClick={() => socket && sendRITVote(socket, false)}
                        isDisabled={!socket || hasSubmittedVote}
                    >
                        No
                    </Button>
                </Flex>

                {hasSubmittedVote && (
                    <Text fontSize="xs" color="whiteAlpha.800">
                        Vote submitted. Waiting for the others...
                    </Text>
                )}

                <VStack width="100%" spacing={1} align="start">
                    {eligiblePlayerNums
                        .filter((playerNum) => playerNum !== localPosition)
                        .map((playerNum) => {
                            const player = game.players.find(
                                (p) => p.position === playerNum
                            );
                            const hasVoted =
                                typeof votes[playerNum] === 'boolean';
                            return (
                                <Text
                                    key={`rit-vote-${playerNum}`}
                                    color={
                                        hasVoted
                                            ? 'green.200'
                                            : 'whiteAlpha.800'
                                    }
                                    fontSize="xs"
                                >
                                    {hasVoted
                                        ? `${player?.username ?? `Player ${playerNum}`} voted`
                                        : `Waiting for ${player?.username ?? `Player ${playerNum}`}...`}
                                </Text>
                            );
                        })}
                </VStack>
            </VStack>
        </Flex>
    );
};

export default RunItTwicePrompt;
