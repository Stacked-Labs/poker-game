'use client';

import { useEffect, useState } from 'react';
import { Button, Container, Heading, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { blo } from 'blo';
import { useActiveAccount } from 'thirdweb/react';
import { GiPokerHand, GiTrophyCup, GiCardAceSpades } from 'react-icons/gi';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { FiPercent, FiUserPlus } from 'react-icons/fi';
import {
    getPlayerProfile,
    getLeaderboard,
    getReferralInfo,
    type PlayerProfile,
} from '@/app/hooks/server_actions';
import { playerDisplayName } from '@/app/utils/address';
import { tierFromString } from '@/app/components/Leaderboard/tierUtils';
import { useAuth } from '@/app/contexts/AuthContext';
import { useConnectX } from '@/app/hooks/useConnectX';
import { useRankHistory } from '@/app/hooks/useRankHistory';
import QuestsSection from '@/app/components/Leaderboard/QuestsSection';
import ReferralCodeSection from '@/app/components/Leaderboard/ReferralCodeSection';
import ShareRankCard from '@/app/components/Leaderboard/ShareRankCard';
import ProfileHub from '@/app/components/Profile/ProfileHub';
import ProfileHero, { type HostLedger } from '@/app/components/Profile/ProfileHero';
import RankLadderInline from '@/app/components/Profile/RankLadderInline';
import ConnectXStrip from '@/app/components/Profile/ConnectXStrip';
import StatLedger, { type StatItem } from '@/app/components/Profile/StatLedger';
import RecentLedger, { type Activity, ordinal } from '@/app/components/Profile/RecentLedger';
import HostingScorecard from '@/app/components/Profile/HostingScorecard';
import RecruitStrip from '@/app/components/Profile/RecruitStrip';
import ProfileSkeleton from '@/app/components/Profile/ProfileSkeleton';
import ProfileShareButton from './ProfileShareButton';

interface RankProgress {
    pointsToNext: number | null;
    nextRank: number | null;
    total: number;
}

export default function ProfileView({ address }: { address: string }) {
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<RankProgress | null>(null);
    const [referral, setReferral] = useState<
        Awaited<ReturnType<typeof getReferralInfo>> | null
    >(null);

    const account = useActiveAccount();
    const { isAuthenticated, xUsername } = useAuth();
    const { connectX, isConnecting } = useConnectX();

    const isOwn =
        !!account?.address &&
        !!profile &&
        account.address.toLowerCase() === profile.address.toLowerCase();

    // Confetti owner for the hub (namespaced so the leaderboard can't consume the climb).
    const { improved, previousRank } = useRankHistory(
        isOwn ? profile?.address : undefined,
        isOwn ? profile?.rank : undefined,
        'profile-hub'
    );

    useEffect(() => {
        let active = true;
        setLoading(true);
        getPlayerProfile(address)
            .then((p) => active && setProfile(p))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [address]);

    const showEngagement = isOwn && isAuthenticated;

    // Own-only engagement fetches: rank progress (from the leaderboard) + referral info.
    useEffect(() => {
        if (!showEngagement || !profile) return;
        let active = true;
        Promise.all([getLeaderboard(profile.address), getReferralInfo(profile.address)])
            .then(([lb, ref]) => {
                if (!active) return;
                const above = lb.leaderboard.find((e) => e.rank === profile.rank - 1);
                setProgress({
                    pointsToNext: above ? Math.max(0, above.points - profile.points) : null,
                    nextRank: above?.rank ?? null,
                    total: lb.total,
                });
                setReferral(ref);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [showEngagement, profile]);

    if (loading) return <ProfileSkeleton />;

    if (!profile) {
        return (
            <Container maxW="container.md" py={16}>
                <VStack spacing={4}>
                    <Heading size="md" color="text.primary">
                        Player not found
                    </Heading>
                    <Button as={NextLink} href="/leaderboard" variant="tactileNeutral">
                        View the leaderboard
                    </Button>
                </VStack>
            </Container>
        );
    }

    const { identity, stats } = profile;
    const name = playerDisplayName(
        identity.x_username ? `@${identity.x_username}` : null,
        profile.address,
        identity.x_display_name
    );
    const tier = tierFromString(profile.tier);
    const hasAvatar = !!identity.avatar_url;
    const avatar = identity.avatar_url || blo(profile.address as `0x${string}`);
    const isRanked = profile.rank > 0;
    const hostActivity = stats.tables_hosted > 0 || stats.tournaments_hosted > 0;

    const host: HostLedger = {
        usdc: profile.host_earnings.usdc,
        available: profile.host_earnings.available,
        hasActivity: hostActivity,
    };

    // Play record (tournament + lifetime depth). Hosting counts live in HostingScorecard,
    // points in the rank ladder/pill, referrals in the referral module for own — no dup.
    const winRate =
        stats.tournaments_entered > 0
            ? Math.round((stats.tournaments_won / stats.tournaments_entered) * 100)
            : 0;
    const statCandidates: (StatItem & { include: boolean })[] = [
        { key: 'hands', label: 'Hands', value: stats.hands_played.toLocaleString(), icon: GiPokerHand, tooltip: 'Total hands you have played on Stacked', headline: true, include: stats.hands_played > 0 },
        { key: 'wins', label: 'Wins', value: stats.tournaments_won.toLocaleString(), icon: FaCrown, tooltip: 'First-place tournament finishes', headline: true, include: stats.tournaments_won > 0 },
        { key: 'best', label: 'Best finish', value: stats.best_finish > 0 ? ordinal(stats.best_finish) : '—', icon: FaMedal, tooltip: 'Your highest tournament placement to date', headline: true, podium: stats.best_finish >= 1 && stats.best_finish <= 3, include: stats.best_finish > 0 },
        { key: 'entered', label: 'Tournaments', value: stats.tournaments_entered.toLocaleString(), icon: GiTrophyCup, tooltip: 'Tournaments you have bought into', include: stats.tournaments_entered > 0 },
        { key: 'final', label: 'Final tables', value: stats.final_tables.toLocaleString(), icon: GiCardAceSpades, tooltip: 'Times you reached the final table', include: stats.final_tables > 0 },
        { key: 'winrate', label: 'Win rate', value: `${winRate}%`, icon: FiPercent, tooltip: 'Tournaments won ÷ tournaments entered', include: stats.tournaments_entered > 0 && stats.tournaments_won > 0 },
        { key: 'refs', label: 'Referrals', value: profile.referrals_count.toLocaleString(), icon: FiUserPlus, tooltip: 'Friends who joined with your code', include: !isOwn && profile.referrals_count > 0 },
    ];
    const statItems: StatItem[] = statCandidates
        .filter((s) => s.include)
        .map(({ include: _i, ...rest }) => rest);

    const recent: Activity[] = [
        ...profile.recent.results.map(
            (r): Activity => ({ type: 'result', id: r.tournament_id, name: r.name, finishPosition: r.finish_position, prizeUsdc: r.prize_usdc, endedAt: r.ended_at, buyInUsdc: r.buy_in_usdc, fieldSize: r.field_size, format: r.format })
        ),
        ...profile.recent.hosted.map(
            (h): Activity => ({ type: 'hosted', id: h.tournament_id, name: h.name, entrants: h.entrants, endedAt: h.ended_at, status: h.status, buyInUsdc: h.buy_in_usdc, format: h.format })
        ),
    ]
        .sort((a, b) => {
            if (a.endedAt === null && b.endedAt === null) return 0;
            if (a.endedAt === null) return -1;
            if (b.endedAt === null) return 1;
            return b.endedAt.localeCompare(a.endedAt);
        })
        .slice(0, 10);

    const rankLadder =
        isOwn && isRanked ? (
            <RankLadderInline
                rank={profile.rank}
                points={profile.points}
                tier={tier}
                pointsToNext={progress?.pointsToNext ?? null}
                nextRank={progress?.nextRank ?? null}
                improved={improved}
                previousRank={previousRank}
                loading={progress === null}
                shareSlot={
                    <ShareRankCard
                        rank={profile.rank}
                        points={profile.points}
                        address={profile.address}
                        total={progress?.total ?? 0}
                    />
                }
            />
        ) : undefined;

    return (
        <ProfileHub
            isOwn={isOwn}
            hero={
                <ProfileHero
                    name={name}
                    tier={tier}
                    rank={profile.rank}
                    points={profile.points}
                    avatarUrl={avatar}
                    hasAvatar={hasAvatar}
                    xUsername={identity.x_username}
                    address={profile.address}
                    host={host}
                    rankLadderSlot={rankLadder}
                    shareSlot={
                        <ProfileShareButton
                            address={profile.address}
                            name={name}
                            tier={profile.tier}
                            rank={profile.rank}
                            isOwn={isOwn}
                            width={{ base: 'full', md: 'auto' }}
                        />
                    }
                />
            }
            connectX={
                showEngagement && !xUsername ? (
                    <ConnectXStrip isConnecting={isConnecting} onConnect={connectX} />
                ) : null
            }
            quests={showEngagement ? <QuestsSection tablesCreated={stats.tables_hosted} /> : null}
            referral={
                showEngagement ? (
                    <ReferralCodeSection referralInfo={referral ?? undefined} />
                ) : null
            }
            record={<StatLedger stats={statItems} />}
            recent={recent.length > 0 ? <RecentLedger items={recent} /> : null}
            hosting={
                hostActivity ? (
                    <HostingScorecard
                        tablesHosted={stats.tables_hosted}
                        tournamentsHosted={stats.tournaments_hosted}
                        isOwn={isOwn}
                        name={name}
                    />
                ) : null
            }
            recruit={<RecruitStrip isOwn={isOwn} />}
        />
    );
}
