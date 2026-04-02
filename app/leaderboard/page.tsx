'use client';

import React, { useEffect, useState } from 'react';
import { Flex, Stack, Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import LeaderboardTable, { LeaderboardEntry } from '@/app/components/Leaderboard/LeaderboardTable';
import PlayerCard from '@/app/components/Leaderboard/PlayerCard';
import FloatingDecor from '@/app/components/HomePage/FloatingDecor';
import Footer from '@/app/components/HomePage/Footer';
import { getLeaderboard, getPlayerStats, getReferralInfo } from '@/app/hooks/server_actions';
import { useActiveAccount } from 'thirdweb/react';
import type { UserStats } from '@/app/components/Leaderboard/StatsSection';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const LeaderboardPage: React.FC = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [playerEntry, setPlayerEntry] = useState<LeaderboardEntry | undefined>(undefined);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<UserStats>({ gamesCreated: 0, gamesPlayed: 0 });
    const [referralInfo, setReferralInfo] = useState<{
        count: number;
        multiplier: number;
        nextTier: { required: number; multiplier: number } | null;
        hasReferrer: boolean;
    } | undefined>(undefined);
    const account = useActiveAccount();

    useEffect(() => {
        let cancelled = false;

        getLeaderboard(account?.address).then((res) => {
            if (!cancelled) {
                setEntries(res.leaderboard);
                setPlayerEntry(res.player ?? undefined);
                setTotal(res.total);
            }
        });
        if (account?.address) {
            getPlayerStats(account.address).then((res) => {
                if (!cancelled) {
                    setStats({ gamesCreated: res.tablesCreated, gamesPlayed: res.tablesPlayed });
                }
            });
            getReferralInfo(account.address).then((res) => {
                if (!cancelled) setReferralInfo(res);
            });
        }

        return () => { cancelled = true; };
    }, [account?.address]);

    // Compute progress-to-next-rank props
    const playerRank = playerEntry?.rank;
    const playerPoints = playerEntry?.points ?? 0;
    const playerAbove = playerRank != null
        ? entries.find((e) => e.rank === playerRank - 1)
        : undefined;
    const pointsToNext = playerAbove != null
        ? Math.max(0, playerAbove.points - playerPoints)
        : undefined;
    const nextRank = playerAbove?.rank;
    const nextPoints = playerAbove?.points;

    return (
        <Box
            minH="100vh"
            bg="bg.default"
            pt={{ base: 24, md: 28 }}
            px={{ base: 4, md: 6 }}
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />

            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '8%', md: '6%' }}
                right={{ base: '-15%', md: '5%' }}
                w={{ base: '220px', md: '320px' }}
                h={{ base: '220px', md: '320px' }}
                borderRadius="full"
                bg="brand.pink"
                opacity={0.12}
                filter="blur(90px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '6%', md: '10%' }}
                left={{ base: '-10%', md: '6%' }}
                w={{ base: '200px', md: '300px' }}
                h={{ base: '200px', md: '300px' }}
                borderRadius="full"
                bg="brand.green"
                opacity={0.12}
                filter="blur(80px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />

            <Flex
                justify="center"
                align="flex-start"
                position="relative"
                zIndex={1}
            >
                <Stack
                    direction={{ base: 'column', lg: 'row' }}
                    spacing={{ base: 6, lg: 8 }}
                    align={{ base: 'stretch', lg: 'flex-start' }}
                    maxW="1400px"
                    width="100%"
                    animation={`${fadeIn} 0.5s ease-out`}
                >
                    <Box w="full" maxW={{ base: '100%', lg: '400px' }}>
                        <PlayerCard
                            rank={playerEntry?.rank}
                            points={playerEntry?.points}
                            stats={{ ...stats, handsPlayed: playerEntry?.handsPlayed }}
                            referralInfo={referralInfo}
                            pointsToNext={pointsToNext}
                            nextRank={nextRank}
                            nextPoints={nextPoints}
                            total={total}
                        />
                    </Box>
                    <Box flex="1" w="full">
                        <LeaderboardTable
                            data={entries}
                            currentAddress={account?.address}
                            total={total}
                        />
                    </Box>
                </Stack>
            </Flex>

            <Box position="relative" zIndex={1} mt={{ base: 12, md: 16 }}>
                <Footer />
            </Box>
        </Box>
    );
};

export default LeaderboardPage;
