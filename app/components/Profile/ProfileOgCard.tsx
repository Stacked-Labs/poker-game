// Pure markup for the per-profile OG share card (1200×630), shared by the edge
// ImageResponse route and a Storybook preview. No Chakra / no theme tokens (satori
// has neither) — literal light-mode hexes only, matching the homepage light look.

const NAVY = '#0B1430';
const MUTED = '#6B7488';
const USDC_BLUE = '#2775CA'; // 4.68:1 on the light ground = AA pass

// Tier light-mode colors (theme.ts tier.* defaults; gold uses yellowDark to read on light).
const TIER_HEX: Record<string, string> = {
    diamond: '#5E86B0',
    gold: '#B78900',
    silver: '#7C8699',
    bronze: '#A8703F',
    iron: '#5F6470',
};
export function tierHex(tier: string): string {
    return TIER_HEX[tier.toLowerCase()] ?? TIER_HEX.iron;
}

export interface ProfileOgCardProps {
    name: string;
    handle: string;
    tier: string;
    rank: number;
    hasAvatar: boolean;
    avatar: string;
    /** Formatted host-earnings figure ("$720") or null to show the stats line instead. */
    earnings: string | null;
    statsLine: string;
    logoUrl: string;
    usdcLogoUrl: string;
}

export default function ProfileOgCard({
    name,
    handle,
    tier,
    rank,
    hasAvatar,
    avatar,
    earnings,
    statsLine,
    logoUrl,
    usdcLogoUrl,
}: ProfileOgCardProps) {
    const tHex = tierHex(tier);
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                padding: '56px 60px',
                background: 'linear-gradient(150deg, #FAF9F6 0%, #ECEEF5 100%)',
                fontFamily: 'sans-serif',
            }}
        >
            {/* Penthouse signature — the on-brand texture move instead of a stock photo. */}
            <div
                style={{
                    position: 'absolute',
                    bottom: -30,
                    right: 70,
                    fontSize: 300,
                    lineHeight: 1,
                    color: NAVY,
                    opacity: 0.05,
                    transform: 'rotate(-12deg)',
                    display: 'flex',
                }}
            >
                ♠
            </div>

            {/* Header: lockup + tier chip */}
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
                        gap: 14,
                        padding: '12px 26px',
                        borderRadius: 40,
                        background: 'rgba(11,20,48,0.05)',
                        border: `2px solid ${tHex}`,
                    }}
                >
                    {/* Drawn tier glyph (a diamond) in the tier color — never an emoji. */}
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
                    <span style={{ color: NAVY, fontSize: 30, fontWeight: 800 }}>
                        {tier}
                        {rank > 0 ? ` · #${rank}` : ''}
                    </span>
                </div>
            </div>

            {/* Identity: avatar + name + handle */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 28,
                    marginTop: 52,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        borderRadius: hasAvatar ? 999 : 24,
                        border: `4px solid ${tHex}`,
                        padding: 0,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={avatar}
                        alt=""
                        width={128}
                        height={128}
                        style={{
                            width: 128,
                            height: 128,
                            borderRadius: hasAvatar ? 999 : 20,
                            objectFit: 'cover',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span
                        style={{
                            color: NAVY,
                            fontSize: 64,
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}
                    >
                        {name}
                    </span>
                    <span style={{ color: MUTED, fontSize: 30, fontWeight: 600 }}>
                        {handle}
                    </span>
                </div>
            </div>

            {/* Bottom: host earnings (the recruit hook) or the stats line, + logo/url */}
            <div
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {earnings ? (
                        <>
                            <span
                                style={{
                                    color: MUTED,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Hosting
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={usdcLogoUrl}
                                    alt=""
                                    width={44}
                                    height={44}
                                    style={{ objectFit: 'contain' }}
                                />
                                <span
                                    style={{
                                        color: USDC_BLUE,
                                        fontSize: 72,
                                        fontWeight: 800,
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                    }}
                                >
                                    {earnings}
                                </span>
                            </div>
                            <span style={{ color: MUTED, fontSize: 24, fontWeight: 500 }}>
                                25% of the platform fee
                            </span>
                        </>
                    ) : (
                        <span style={{ color: MUTED, fontSize: 32, fontWeight: 600 }}>
                            {statsLine}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ color: MUTED, fontSize: 26, fontWeight: 700 }}>
                        stackedpoker.io
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" width={52} height={52} />
                </div>
            </div>
        </div>
    );
}
