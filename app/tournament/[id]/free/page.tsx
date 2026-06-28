import type { Metadata } from 'next';
import { getFreeTicketPreview } from '@/app/hooks/server_actions';
import FreeClaimView from './FreeClaimView';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ c?: string }>;
}

function usdc(base?: number | null): string {
    return ((base ?? 0) / 1_000_000).toLocaleString('en-US', {
        maximumFractionDigits: 0,
    });
}

// SEO / link-unfurl tags for the claim landing page (§3.2): prize + "free entry applied"
// are shown to crawlers and to the visitor BEFORE any sign-in.
export async function generateMetadata({
    params,
    searchParams,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const { c } = await searchParams;
    // Metadata is best-effort: a backend hiccup must never break the page render.
    const preview = await getFreeTicketPreview(Number(id), c).catch(() => null);

    const name = preview?.tournament.name ?? 'Tournament';
    const pool = preview
        ? Math.max(
              preview.tournament.prize_pool_usdc ?? 0,
              preview.tournament.guarantee_usdc ?? 0
          )
        : 0;
    const title = `Free entry: ${name} on Stacked Poker`;
    const description = pool
        ? `Your free entry into ${name} is applied. $${usdc(pool)} prize pool, no buy-in for your first entry. Onchain poker on Base.`
        : `Your free entry into ${name} is applied. Claim your seat. Onchain poker on Base.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: 'Stacked Poker',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function FreeClaimPage({
    params,
    searchParams,
}: PageProps) {
    const { id } = await params;
    const { c } = await searchParams;
    return <FreeClaimView id={Number(id)} code={c ?? ''} />;
}
