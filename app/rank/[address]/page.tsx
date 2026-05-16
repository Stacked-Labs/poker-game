import type { Metadata } from 'next';
import RankShareRedirect from './RankShareRedirect';

const SITE = 'https://stackedpoker.io';

type SearchParams = { r?: string; p?: string; t?: string };

interface PageProps {
    params: Promise<{ address: string }>;
    searchParams: Promise<SearchParams>;
}

function buildOgUrl({ r, p, t }: SearchParams) {
    const params = new URLSearchParams();
    if (r) params.set('r', r);
    if (p) params.set('p', p);
    if (t) params.set('t', t);
    return `${SITE}/api/og/rank?${params.toString()}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sp = await searchParams;
    const ogUrl = buildOgUrl(sp);
    const title = sp.r
        ? `Ranked #${sp.r} on Stacked Poker`
        : 'My rank on Stacked Poker';
    const description = 'On-chain poker on Base. Stablecoin buy-ins, smart-contract custody.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: 'Stacked Poker',
            type: 'website',
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

// We deliberately do NOT redirect server-side: a 307 means crawlers (Twitterbot
// etc.) never see the meta tags above, so the X card would fall back to the
// leaderboard's. Instead we render a real HTML body so crawlers parse the tags,
// and bounce real users client-side.
export default function RankSharePage() {
    return <RankShareRedirect />;
}
