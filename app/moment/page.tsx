import type { Metadata } from 'next';
import MomentShareRedirect from './MomentShareRedirect';
import {
    isMomentType,
    buildMomentOgUrl,
    momentDestination,
    momentMeta,
    type MomentParams,
    type MomentType,
} from '../lib/moments';

// Unified Share-Moment page (Viral §5 / #359). The destination every moment share points at: it
// renders the crawler <meta> so X / Telegram unfurl the celebratory OG card, then bounces real
// visitors back into the loop (the tournament for win/deep-run, the player's profile/leaderboard
// for rank-up/new-tier/milestone). Frontend-only — no backend, reuses the existing OG routes.

const SITE = 'https://stackedpoker.io';

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
    searchParams: Promise<SearchParams>;
}

function one(v: string | string[] | undefined): string | undefined {
    return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
    const s = one(v);
    if (s == null || s === '') return undefined;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
}

function parseParams(sp: SearchParams): MomentParams | null {
    const type = one(sp.type);
    if (!isMomentType(type)) return null;
    return {
        type: type as MomentType,
        address: one(sp.address),
        rank: num(sp.r),
        points: num(sp.p),
        total: num(sp.t),
        hands: num(sp.hands),
        tierLabel: one(sp.tier),
        tournamentId: num(sp.id),
        tournamentName: one(sp.name),
        fieldSize: num(sp.field),
        isFreePlay: one(sp.free) === '1',
    };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const p = parseParams(await searchParams);
    if (!p) {
        const title = 'Stacked Poker';
        const description = 'On-chain poker on Base — stablecoin buy-ins, smart-contract custody.';
        return { title, description };
    }
    const ogUrl = buildMomentOgUrl(SITE, p);
    const { title, description } = momentMeta(p);
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

export default async function MomentSharePage({ searchParams }: PageProps) {
    const p = parseParams(await searchParams);
    const destination = p ? momentDestination(p) : '/leaderboard';
    return <MomentShareRedirect destination={destination} />;
}
