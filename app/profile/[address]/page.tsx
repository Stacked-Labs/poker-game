import type { Metadata } from 'next';
import { getPlayerProfile } from '@/app/hooks/server_actions';
import { playerDisplayName } from '@/app/utils/address';
import ProfileView from './ProfileView';

const SITE = 'https://stackedpoker.io';

interface PageProps {
    params: Promise<{ address: string }>;
}

// SEO + link-unfurl tags. The OG image is the per-profile share card (#347).
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { address } = await params;
    const profile = await getPlayerProfile(address);

    const name = profile
        ? playerDisplayName(
              profile.identity.x_username
                  ? `@${profile.identity.x_username}`
                  : null,
              profile.address,
              profile.identity.x_display_name
          )
        : address;

    const title = profile
        ? `${name} · ${profile.tier} · Rank #${profile.rank || '—'} — Stacked Poker`
        : `${name} — Stacked Poker`;
    const description = profile
        ? `${profile.stats.hands_played.toLocaleString()} hands · ${profile.stats.tournaments_entered} tournaments · ${profile.stats.tournaments_won} wins on Stacked Poker.`
        : 'Player profile on Stacked Poker. Onchain poker on Base.';
    const ogUrl = `${SITE}/api/og/profile?address=${encodeURIComponent(address)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: 'Stacked Poker',
            type: 'profile',
            url: `${SITE}/profile/${address}`,
            images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogUrl],
        },
    };
}

export default async function ProfilePage({ params }: PageProps) {
    const { address } = await params;
    return <ProfileView address={address} />;
}
