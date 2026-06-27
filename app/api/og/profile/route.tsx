import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { blo } from 'blo';
import { playerDisplayName, shortenAddress } from '../../../utils/address';
import ProfileOgCard from '../../../components/Profile/ProfileOgCard';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_NAME_LENGTH = 20;

interface ProfilePayload {
    address: string;
    identity: {
        x_username?: string;
        x_display_name?: string;
        avatar_url?: string;
    };
    rank: number;
    tier: string;
    stats: {
        hands_played: number;
        tournaments_entered: number;
        tournaments_won: number;
    };
    host_earnings: { usdc: number; available: boolean };
}

async function fetchProfile(address: string): Promise<ProfilePayload | null> {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    try {
        const res = await fetch(`${base}/api/players/${address}/profile`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return (await res.json()) as ProfilePayload;
    } catch {
        return null;
    }
}

// Per-profile share card (Viral §1 / #347), 1200×630, light-true. Identity is the protagonist
// (status leads); the host-earnings line is the single USDC-blue moment and the quiet recruit hook.
export async function GET(req: NextRequest) {
    const address = (req.nextUrl.searchParams.get('address') || '').trim();
    const origin = req.nextUrl.origin;

    const profile = address ? await fetchProfile(address) : null;
    const rawName = profile
        ? playerDisplayName(
              profile.identity.x_username
                  ? `@${profile.identity.x_username}`
                  : null,
              profile.address,
              profile.identity.x_display_name
          )
        : address
          ? shortenAddress(address)
          : 'Player';
    const name =
        rawName.length > MAX_NAME_LENGTH
            ? `${rawName.slice(0, MAX_NAME_LENGTH - 1).trimEnd()}…`
            : rawName;
    const handle = profile?.identity.x_username
        ? `@${profile.identity.x_username}`
        : shortenAddress(profile?.address || address);
    const showEarnings =
        !!profile && profile.host_earnings.available && profile.host_earnings.usdc > 0;
    const earnings = showEarnings
        ? `$${Math.round(profile!.host_earnings.usdc / 1_000_000).toLocaleString()}`
        : null;
    const statsLine = profile
        ? `${profile.stats.hands_played.toLocaleString()} hands · ${profile.stats.tournaments_entered} tournaments · ${profile.stats.tournaments_won} wins`
        : 'Your table. Your money.';

    return new ImageResponse(
        (
            <ProfileOgCard
                name={name}
                handle={handle}
                tier={profile?.tier || 'Unranked'}
                rank={profile?.rank || 0}
                hasAvatar={!!profile?.identity.avatar_url}
                avatar={
                    profile?.identity.avatar_url ||
                    (profile?.address
                        ? blo(profile.address as `0x${string}`)
                        : blo(`0x${'0'.repeat(40)}` as `0x${string}`))
                }
                earnings={earnings}
                statsLine={statsLine}
                logoUrl={`${origin}/IconLogo.png`}
                usdcLogoUrl={`${origin}/usdc-logo.png`}
            />
        ),
        {
            width: WIDTH,
            height: HEIGHT,
            headers: {
                'Cache-Control':
                    'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
            },
        }
    );
}
