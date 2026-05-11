import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTier, TIER_EMOJI } from '../../../components/Leaderboard/tierUtils';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

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

    const tier = getTier(rank, total);
    const suffix = ordinalSuffix(rank);
    const origin = req.nextUrl.origin;
    const bgUrl = `${origin}/video/bgplaceholder.webp`;
    const logoUrl = `${origin}/IconLogo.png`;

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

                {/* Bottom readability gradient */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        display: 'flex',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                    }}
                />

                {/* Points pill (top-left) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 36,
                        left: 40,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 14,
                        padding: '24px 40px',
                        borderRadius: 28,
                        background: 'rgba(0,0,0,0.55)',
                    }}
                >
                    <span
                        style={{
                            color: '#fff',
                            fontSize: 96,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        {points.toLocaleString()}
                    </span>
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 28,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                        }}
                    >
                        PTS
                    </span>
                </div>

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
                        border: `4px solid ${tier.color}`,
                    }}
                >
                    <span style={{ fontSize: 36 }}>{TIER_EMOJI[tier.name]}</span>
                    <span
                        style={{
                            color: '#ffffff',
                            fontSize: 36,
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                        }}
                    >
                        {tier.label}
                    </span>
                </div>

                {/* Rank (bottom-left) */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 48,
                        left: 48,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 10,
                    }}
                >
                    <span
                        style={{
                            color: '#FDC51D',
                            fontSize: 56,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        #
                    </span>
                    <span
                        style={{
                            color: '#FDC51D',
                            fontSize: 168,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: '-8px',
                        }}
                    >
                        {rank}
                    </span>
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.92)',
                            fontSize: 36,
                            fontWeight: 600,
                            paddingBottom: 14,
                        }}
                    >
                        {suffix} place
                    </span>
                </div>

                {/* Logo + wordmark (bottom-right) */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 48,
                        right: 48,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt=""
                        width={56}
                        height={56}
                        style={{ objectFit: 'contain' }}
                    />
                    <span
                        style={{
                            color: '#ffffff',
                            fontSize: 30,
                            fontWeight: 700,
                            letterSpacing: '0.10em',
                        }}
                    >
                        STACKED POKER
                    </span>
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
