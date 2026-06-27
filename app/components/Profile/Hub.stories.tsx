import type { Meta, StoryObj } from '@storybook/react';
import { ThirdwebProvider } from 'thirdweb/react';
import { Box, Button, Icon } from '@chakra-ui/react';
import { FiShare2, FiChevronDown } from 'react-icons/fi';
import { FaShareAlt } from 'react-icons/fa';
import { GiPokerHand, GiTrophyCup, GiCardAceSpades } from 'react-icons/gi';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { FiPercent } from 'react-icons/fi';
import { blo } from 'blo';
import type { QuestItem } from '@/app/hooks/server_actions';
import ProfileHub from './ProfileHub';
import ProfileHero from './ProfileHero';
import RankLadderInline from './RankLadderInline';
import ConnectXStrip from './ConnectXStrip';
import StatLedger, { type StatItem } from './StatLedger';
import RecentLedger, { type Activity } from './RecentLedger';
import HostingScorecard from './HostingScorecard';
import RecruitStrip from './RecruitStrip';
import ProfileSkeleton from './ProfileSkeleton';
import { QuestsSectionView } from '../Leaderboard/QuestsSection';
import ReferralCodeSection from '../Leaderboard/ReferralCodeSection';
import { tierFromString } from '../Leaderboard/tierUtils';

const ADDR = '0x1234567890abcdef1234567890abcdef12345678';
const noop = () => {};

const ShareStub = (
    <Button variant="tactileNeutral" size="sm" minH={{ base: '44px', md: '36px' }} width={{ base: 'full', md: 'auto' }} leftIcon={<Icon as={FiShare2} />} rightIcon={<Icon as={FiChevronDown} />}>
        Share
    </Button>
);
const RankShareStub = (
    <Button variant="tactileGhost" size="sm" aria-label="Share rank" leftIcon={<Icon as={FaShareAlt} />}>
        Share
    </Button>
);

const QUESTS: QuestItem[] = [
    { id: 'follow_x', title: 'Follow Stacked on X', points: 100, completed: false, actionUrl: 'https://x.com' },
    { id: 'create_table', title: 'Host your first table', points: 250, completed: false },
    { id: 'join_telegram', title: 'Join the Telegram', points: 100, completed: true, actionUrl: 'https://t.me' },
    { id: 'verify_sbt', title: 'Verify your NFT badge', points: 500, completed: false, hasNft: true },
];

const STATS: StatItem[] = [
    { key: 'hands', label: 'Hands', value: '18,402', icon: GiPokerHand, tooltip: 'Total hands played', headline: true },
    { key: 'wins', label: 'Wins', value: '6', icon: FaCrown, tooltip: 'First-place finishes', headline: true },
    { key: 'best', label: 'Best finish', value: '1st', icon: FaMedal, tooltip: 'Highest placement', headline: true, podium: true },
    { key: 'entered', label: 'Tournaments', value: '44', icon: GiTrophyCup, tooltip: 'Bought in' },
    { key: 'final', label: 'Final tables', value: '11', icon: GiCardAceSpades, tooltip: 'Reached final table' },
    { key: 'winrate', label: 'Win rate', value: '14%', icon: FiPercent, tooltip: 'Won ÷ entered' },
];

const RECENT: Activity[] = [
    { type: 'hosted', id: 1, name: 'Friday Night Freezeout', entrants: 38, endedAt: null, status: 'Running', buyInUsdc: 25_000_000, format: 'standard_mtt' },
    { type: 'result', id: 2, name: 'Sunday Major', finishPosition: 1, prizeUsdc: 540_000_000, endedAt: '2026-06-25T20:00:00Z', buyInUsdc: 50_000_000, fieldSize: 212, format: 'standard_mtt' },
    { type: 'result', id: 3, name: '$5 Turbo', finishPosition: 3, prizeUsdc: 60_000_000, endedAt: '2026-06-23T20:00:00Z', buyInUsdc: 5_000_000, fieldSize: 96, format: 'turbo' },
    { type: 'hosted', id: 4, name: 'Wednesday Deepstack', entrants: 22, endedAt: '2026-06-20T20:00:00Z', status: 'Completed', buyInUsdc: 10_000_000 },
    { type: 'result', id: 5, name: 'Midnight Hyper', finishPosition: 14, prizeUsdc: 0, endedAt: '2026-06-18T20:00:00Z', buyInUsdc: 0, fieldSize: 48, format: 'hyper' },
];


interface HubArgs {
    isOwn: boolean;
    tierName: string;
    rank: number;
    unlinkedX?: boolean;
    thin?: boolean;
}

function buildHub(a: HubArgs) {
    const tier = tierFromString(a.tierName);
    const ranked = a.rank > 0;
    const hero = (
        <ProfileHero
            name={a.isOwn ? 'Mike Dawson' : 'goldrush'}
            tier={tier}
            rank={a.rank}
            points={4820}
            avatarUrl={blo(ADDR as `0x${string}`)}
            hasAvatar={false}
            xUsername={a.unlinkedX ? null : 'mikedawson'}
            address={ADDR}
            host={{ usdc: 1_240_000_000, available: !a.thin, hasActivity: !a.thin }}
            rankLadderSlot={
                a.isOwn && ranked ? (
                    <RankLadderInline rank={a.rank} points={4820} tier={tier} pointsToNext={180} nextRank={a.rank - 1} shareSlot={RankShareStub} />
                ) : undefined
            }
            shareSlot={ShareStub}
        />
    );
    return (
        <ProfileHub
            isOwn={a.isOwn}
            hero={hero}
            connectX={a.isOwn && a.unlinkedX ? <ConnectXStrip onConnect={noop} /> : null}
            quests={a.isOwn ? <QuestsSectionView quests={QUESTS} totalQuestPoints={200} loading={false} isQuestLocked={(q) => q.id === 'create_table'} onClaim={noop} /> : null}
            referral={a.isOwn ? <ReferralCodeSection referralInfo={{ count: 3, multiplier: 1.2, nextTier: { required: 5, multiplier: 1.3 }, hasReferrer: false, myCode: 'mikedawson' }} /> : null}
            record={a.thin ? null : <StatLedger stats={STATS} />}
            recent={a.thin ? null : <RecentLedger items={RECENT} />}
            hosting={a.thin ? null : <HostingScorecard tablesHosted={12} tournamentsHosted={4} isOwn={a.isOwn} name="goldrush" />}
            recruit={<RecruitStrip isOwn={a.isOwn} />}
        />
    );
}

const meta: Meta = {
    title: 'Profile/Hub',
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <Box bg="bg.default" minH="100vh">
                    <Story />
                </Box>
            </ThirdwebProvider>
        ),
    ],
};
export default meta;
type Story = StoryObj;

export const OwnRich: Story = { render: () => buildHub({ isOwn: true, tierName: 'diamond', rank: 12 }) };
export const OwnUnlinkedX: Story = { render: () => buildHub({ isOwn: true, tierName: 'diamond', rank: 12, unlinkedX: true }) };
export const OwnThin: Story = { render: () => buildHub({ isOwn: true, tierName: 'iron', rank: 0, unlinkedX: true, thin: true }) };
export const PublicRich: Story = { render: () => buildHub({ isOwn: false, tierName: 'gold', rank: 8 }) };
export const GoldTierCollision: Story = { render: () => buildHub({ isOwn: false, tierName: 'gold', rank: 8 }) };
export const Loading: Story = { render: () => <ProfileSkeleton /> };
