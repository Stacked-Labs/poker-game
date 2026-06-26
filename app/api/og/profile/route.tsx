import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { blo } from 'blo';
import { TIER_EMOJI } from '../../../components/Leaderboard/tierUtils';
import { playerDisplayName, shortenAddress } from '../../../utils/address';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

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

// Per-profile share card (Viral §1 / #347), 1200×630. Reuses the rank-card layout language:
// branded dark background, tier chip, big rank, and — the recruitment hook — host earnings.
export async function GET(req: NextRequest) {
    const address = (req.nextUrl.searchParams.get('address') || '').trim();
    const origin = req.nextUrl.origin;
    const bgUrl = `${origin}/video/bgplaceholder.webp`;
    const logoUrl = `${origin}/IconLogo.png`;

    const profile = address ? await fetchProfile(address) : null;
    const name = profile
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
    const handle = profile?.identity.x_username
        ? `@${profile.identity.x_username}`
        : shortenAddress(profile?.address || address);
    const tier = profile?.tier || 'Unranked';
    const rank = profile?.rank || 0;
    const avatar =
        profile?.identity.avatar_url ||
        (profile?.address
            ? blo(profile.address as `0x${string}`)
            : blo(`0x${'0'.repeat(40)}` as `0x${string}`));
    const earnings =
        profile && profile.host_earnings.available
            ? `$${Math.round(profile.host_earnings.usdc / 1_000_000).toLocaleString()} earned hosting`
            : null;
    const statsLine = profile
        ? `${profile.stats.hands_played.toLocaleString()} hands · ${profile.stats.tournaments_entered} tournaments · ${profile.stats.tournaments_won} wins`
        : 'On-chain poker on Base';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    background: '#0B1430',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={bgUrl}
                    alt=""
                    width={WIDTH}
                    height={HEIGHT}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 30%',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        background:
                            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.45) 100%)',
                    }}
                />

                {/* Tier chip (top-right) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 44,
                        right: 44,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 32px',
                        borderRadius: 48,
                        background: 'rgba(0,0,0,0.62)',
                        border: '4px solid #A78BFA',
                    }}
                >
                    <span style={{ fontSize: 34 }}>
                        {TIER_EMOJI[tier.toLowerCase()] ?? '🃏'}
                    </span>
                    <span style={{ color: '#fff', fontSize: 34, fontWeight: 800 }}>
                        {tier}
                        {rank > 0 ? ` · #${rank}` : ''}
                    </span>
                </div>

                {/* Identity (avatar + name + handle) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 56,
                        left: 56,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 28,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={avatar}
                        alt=""
                        width={132}
                        height={132}
                        style={{
                            width: 132,
                            height: 132,
                            borderRadius: 999,
                            border: '4px solid rgba(255,255,255,0.5)',
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span
                            style={{
                                color: '#fff',
                                fontSize: 64,
                                fontWeight: 900,
                                lineHeight: 1,
                            }}
                        >
                            {name}
                        </span>
                        <span
                            style={{
                                color: 'rgba(255,255,255,0.72)',
                                fontSize: 30,
                                fontWeight: 600,
                            }}
                        >
                            {handle}
                        </span>
                    </div>
                </div>

                {/* Host earnings (the recruitment hook) + headline stats (bottom-left) */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 52,
                        left: 56,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }}
                >
                    {earnings && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '16px 30px',
                                borderRadius: 22,
                                background: 'rgba(54,163,123,0.92)',
                            }}
                        >
                            <span style={{ fontSize: 34 }}>🎟</span>
                            <span style={{ color: '#fff', fontSize: 42, fontWeight: 900 }}>
                                {earnings}
                            </span>
                        </div>
                    )}
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.92)',
                            fontSize: 34,
                            fontWeight: 600,
                        }}
                    >
                        {statsLine}
                    </span>
                </div>

                {/* Logo + URL (bottom-right) */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 48,
                        right: 48,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.78)',
                            fontSize: 26,
                            fontWeight: 700,
                        }}
                    >
                        stackedpoker.io
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" width={56} height={56} />
                </div>
            </div>
        ),
        { width: WIDTH, height: HEIGHT }
    );
}
