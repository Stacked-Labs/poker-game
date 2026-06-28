import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTier } from '../../../components/Leaderboard/tierUtils';
import { tierHex } from '../../../components/Profile/ProfileOgCard';
import { isMomentType, momentBadge } from '../../../lib/moments';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

// Warm light brand palette — same canon as ProfileOgCard / the tournament card, so every
// share unfurl reads as one light, penthouse-not-casino surface. No Chakra (satori has none).
const NAVY = '#0B1430';
const MUTED = '#6B7488';
const GREEN = '#36A37B';

function ordinalSuffix(n: number) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const rank = Math.max(1, parseInt(sp.get('r') || '0', 10) || 1);
    const points = Math.max(0, parseInt(sp.get('p') || '0', 10) || 0);
    const total = Math.max(rank, parseInt(sp.get('t') || '0', 10) || rank);

    // Optional Share-Moment ribbon (Viral §5 / #359): a celebratory banner stamped over the same
    // status card for rank-up / new-tier / hands-milestone shares.
    const mParam = sp.get('m');
    const handsParam = parseInt(sp.get('hands') || '0', 10) || 0;
    const momentBanner = isMomentType(mParam) ? momentBadge(mParam, handsParam) : null;

    const tier = getTier(rank, total);
    const tHex = tierHex(tier.name); // on-brand tier ramp, NOT getTier().color (stale lavender)
    const suffix = ordinalSuffix(rank);
    const origin = req.nextUrl.origin;
    const logoUrl = `${origin}/IconLogo.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    padding: '56px 60px',
                    background: 'linear-gradient(150deg, #FAF9F6 0%, #ECEEF5 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Penthouse signature — the on-brand texture move instead of a casino-floor photo. */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: -40,
                        right: 80,
                        fontSize: 320,
                        lineHeight: 1,
                        color: NAVY,
                        opacity: 0.05,
                        transform: 'rotate(-12deg)',
                        display: 'flex',
                    }}
                >
                    ♠
                </div>

                {/* Share-Moment ribbon (top-center) — solid green, drawn mark, never an emoji. */}
                {momentBanner && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 18,
                                padding: '18px 56px',
                                borderRadius: '0 0 28px 28px',
                                background: GREEN,
                                boxShadow: '0 8px 24px rgba(11,20,48,0.18)',
                            }}
                        >
                            <div
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    transform: 'rotate(45deg)',
                                    display: 'flex',
                                }}
                            />
                            <span
                                style={{
                                    color: '#ffffff',
                                    fontSize: 52,
                                    fontWeight: 900,
                                    letterSpacing: '0.06em',
                                }}
                            >
                                {momentBanner}
                            </span>
                        </div>
                    </div>
                )}

                {/* Points pill (top-left) */}
                <div
                    style={{
                        position: 'absolute',
                        top: momentBanner ? 120 : 56,
                        left: 60,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 14,
                        padding: '22px 38px',
                        borderRadius: 28,
                        background: 'rgba(11,20,48,0.05)',
                        border: '1px solid rgba(11,20,48,0.08)',
                    }}
                >
                    <span style={{ color: NAVY, fontSize: 92, fontWeight: 900, lineHeight: 1 }}>
                        {points.toLocaleString()}
                    </span>
                    <span
                        style={{
                            color: MUTED,
                            fontSize: 28,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                        }}
                    >
                        PTS
                    </span>
                </div>

                {/* Tier chip (top-right) — drawn glyph in the tier color, matching ProfileOgCard. */}
                <div
                    style={{
                        position: 'absolute',
                        top: momentBanner ? 128 : 64,
                        right: 60,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 30px',
                        borderRadius: 48,
                        background: 'rgba(11,20,48,0.05)',
                        border: `3px solid ${tHex}`,
                    }}
                >
                    <div
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 5,
                            background: tHex,
                            transform: 'rotate(45deg)',
                            display: 'flex',
                        }}
                    />
                    <span style={{ color: NAVY, fontSize: 34, fontWeight: 800 }}>{tier.label}</span>
                </div>

                {/* Rank (bottom-left) — navy hero figure, tier-colored hash, muted place. */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 56,
                        left: 60,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 10,
                    }}
                >
                    <span style={{ color: tHex, fontSize: 64, fontWeight: 900, lineHeight: 1 }}>#</span>
                    <span
                        style={{
                            color: NAVY,
                            fontSize: 176,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: '-8px',
                        }}
                    >
                        {rank}
                    </span>
                    <span style={{ color: MUTED, fontSize: 36, fontWeight: 600, paddingBottom: 16 }}>
                        {suffix} place
                    </span>
                </div>

                {/* Brand mark (bottom-right) */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 60,
                        right: 60,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}
                >
                    <span style={{ color: MUTED, fontSize: 26, fontWeight: 700 }}>stackedpoker.io</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" width={52} height={52} style={{ objectFit: 'contain' }} />
                </div>
            </div>
        ),
        {
            width: WIDTH,
            height: HEIGHT,
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
            },
        },
    );
}
