import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTournament } from '../../../hooks/server_actions';
import {
    getStatusDescriptor,
    getTournamentMoney,
    isFreePlay,
    type StatusTone,
    type TournamentMoneyDisplay,
} from '../../../components/PublicGames/tournamentFormatPure';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;
const BAND_HEIGHT = 280;

// Warm light brand palette — kept in sync with app/theme.ts brand tokens so the
// share card matches the home/create/table previews.
const NAVY = '#0B1430';
const NAVY_SOFT = '#334479';
const GREEN = '#36A37B';
const GREEN_DARK = '#2A8463';
const YELLOW_DARK = '#B78900';
const MUTED = '#6B7488';

// Status pill styling per tone (light surface).
const STATUS_STYLE: Record<StatusTone, { bg: string; border: string; fg: string }> = {
    open: { bg: 'rgba(54,163,123,0.12)', border: GREEN, fg: GREEN_DARK },
    live: { bg: 'rgba(54,163,123,0.12)', border: GREEN, fg: GREEN_DARK },
    refund: { bg: 'rgba(253,197,29,0.16)', border: '#FDC51D', fg: YELLOW_DARK },
    done: { bg: 'rgba(51,68,121,0.10)', border: 'rgba(51,68,121,0.35)', fg: NAVY_SOFT },
    cancelled: { bg: 'rgba(235,11,92,0.10)', border: 'rgba(235,11,92,0.45)', fg: '#C00A4D' },
    setup: { bg: 'rgba(51,68,121,0.10)', border: 'rgba(51,68,121,0.35)', fg: NAVY_SOFT },
};

const MAX_NAME_LENGTH = 54;

export async function GET(req: NextRequest) {
    const id = parseInt(req.nextUrl.searchParams.get('id') || '', 10);
    const origin = req.nextUrl.origin;
    const logoUrl = `${origin}/IconLogo.png`;
    const usdcLogoUrl = `${origin}/usdc-logo.png`;
    const baseLogoUrl = `${origin}/networkLogos/base-logo.png`;

    let name = 'Tournament';
    let money: TournamentMoneyDisplay = { label: 'Buy-in', value: '$0', usdc: true };
    let statusLabel = 'Open';
    let statusTone: StatusTone = 'open';
    let entries = '';
    let bannerUrl: string | undefined;

    if (Number.isFinite(id)) {
        try {
            const { tournament: t } = await getTournament(id);
            name =
                t.name ||
                (isFreePlay(t) ? 'Free-play tournament' : 'No-limit Hold’em');
            money = getTournamentMoney(t);
            const status = getStatusDescriptor(t.status);
            statusLabel = status.label;
            statusTone = status.tone;
            const showCount = t.status === 'registration' || t.status === 'pending';
            entries = showCount
                ? `${(t.registered_count ?? 0).toLocaleString()} / ${t.max_entries.toLocaleString()} registered`
                : `${(t.registered_count ?? 0).toLocaleString()} ${(t.registered_count ?? 0) === 1 ? 'entry' : 'entries'}`;
            bannerUrl = t.banner_url || undefined;
        } catch {
            // Backend lookup failed — fall through to the generic placeholder.
        }
    }

    const displayName =
        name.length > MAX_NAME_LENGTH
            ? `${name.slice(0, MAX_NAME_LENGTH - 1).trimEnd()}…`
            : name;
    const status = STATUS_STYLE[statusTone];
    const suffixColor = statusTone === 'refund' ? YELLOW_DARK : GREEN;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(150deg, #FAF9F6 0%, #ECEEF5 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Banner band (top) */}
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        width: '100%',
                        height: BAND_HEIGHT,
                        overflow: 'hidden',
                        borderBottom: '1px solid rgba(11,20,48,0.08)',
                    }}
                >
                    {bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={bannerUrl}
                            alt=""
                            width={WIDTH}
                            height={BAND_HEIGHT}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background:
                                    'linear-gradient(135deg, #334479 0%, #0B1430 100%)',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                alt=""
                                width={120}
                                height={120}
                                style={{ objectFit: 'contain', opacity: 0.9 }}
                            />
                        </div>
                    )}

                    {/* Soft fade into the panel for a seamless seam */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 64,
                            display: 'flex',
                            background:
                                'linear-gradient(to top, rgba(236,238,245,0.85) 0%, rgba(236,238,245,0) 100%)',
                        }}
                    />
                </div>

                {/* Info panel (bottom) */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '32px 60px 44px',
                    }}
                >
                    {/* Header: lockup + status pill */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                alt=""
                                width={44}
                                height={44}
                                style={{ objectFit: 'contain' }}
                            />
                            <span
                                style={{
                                    color: NAVY,
                                    fontSize: 30,
                                    fontWeight: 800,
                                    letterSpacing: '0.12em',
                                }}
                            >
                                STACKED
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 26px',
                                borderRadius: 40,
                                background: status.bg,
                                border: `2px solid ${status.border}`,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 24,
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: status.fg,
                                }}
                            >
                                {statusLabel}
                            </span>
                        </div>
                    </div>

                    {/* Tournament name */}
                    <span
                        style={{
                            marginTop: 26,
                            color: NAVY,
                            fontSize: 60,
                            fontWeight: 800,
                            letterSpacing: '-0.015em',
                            lineHeight: 1.04,
                        }}
                    >
                        {displayName}
                    </span>

                    {/* Bottom row: money hero + meta/badges */}
                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Money */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span
                                style={{
                                    color: MUTED,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {money.label}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                {money.usdc && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={usdcLogoUrl}
                                        alt=""
                                        width={48}
                                        height={48}
                                        style={{ objectFit: 'contain' }}
                                    />
                                )}
                                <span
                                    style={{
                                        color: money.usdc ? NAVY : GREEN_DARK,
                                        fontSize: 78,
                                        fontWeight: 800,
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                    }}
                                >
                                    {money.value}
                                </span>
                                {money.suffix && (
                                    <span
                                        style={{
                                            color: suffixColor,
                                            fontSize: 28,
                                            fontWeight: 800,
                                            letterSpacing: '0.04em',
                                            paddingBottom: 6,
                                        }}
                                    >
                                        {money.suffix}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Meta + trust badges */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 18,
                            }}
                        >
                            {entries && (
                                <span
                                    style={{
                                        color: NAVY_SOFT,
                                        fontSize: 28,
                                        fontWeight: 700,
                                    }}
                                >
                                    {entries}
                                </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Badge iconUrl={baseLogoUrl} label="On Base" />
                                <Badge iconUrl={usdcLogoUrl} label="USDC" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

function Badge({ iconUrl, label }: { iconUrl: string; label: string }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 18px',
                borderRadius: 40,
                background: '#FFFFFF',
                border: '1px solid rgba(11,20,48,0.10)',
                boxShadow: '0 1px 3px rgba(11,20,48,0.06)',
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={iconUrl}
                alt=""
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
            />
            <span style={{ color: NAVY, fontSize: 22, fontWeight: 700 }}>{label}</span>
        </div>
    );
}
