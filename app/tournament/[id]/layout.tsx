import type { Metadata } from 'next';
import React from 'react';
import { getTournament } from '../../hooks/server_actions';
import {
    getEntriesLine,
    getStatusDescriptor,
    getTournamentMoney,
    isFreePlay,
} from '../../components/PublicGames/tournamentFormatPure';

const SITE = 'https://stackedpoker.io';
const FALLBACK_IMAGE = `${SITE}/previews/home_preview.png`;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const url = `${SITE}/tournament/${id}`;

    try {
        const { tournament: t } = await getTournament(parseInt(id, 10));
        const money = getTournamentMoney(t);
        const { label: statusLabel } = getStatusDescriptor(t.status);
        const name =
            t.name ||
            (isFreePlay(t) ? 'Free-play tournament' : 'No-limit Hold’em');
        const title = `${name} — Stacked Poker`;
        const entries = getEntriesLine(t);
        const moneyLine = money.suffix
            ? `${money.value} ${money.suffix}`
            : money.value;
        const description = `${money.label}: ${moneyLine} · ${statusLabel} · ${entries}. On-chain poker on Base — stablecoin buy-ins, smart-contract custody.`;
        const ogUrl = `${SITE}/api/og/tournament?id=${id}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url,
                siteName: 'Stacked Poker',
                type: 'website',
                images: [{ url: ogUrl, width: 1200, height: 630, alt: name }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [ogUrl],
            },
            alternates: { canonical: url },
        };
    } catch {
        // Backend lookup failed (bad id, backend hiccup) — still give the page a
        // usable share card instead of falling through to no metadata at all.
        const title = 'Tournament — Stacked Poker';
        const description =
            'On-chain poker tournaments on Base. Stablecoin buy-ins, smart-contract custody.';
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url,
                siteName: 'Stacked Poker',
                type: 'website',
                images: [
                    {
                        url: FALLBACK_IMAGE,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [FALLBACK_IMAGE],
            },
        };
    }
}

export default function TournamentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
