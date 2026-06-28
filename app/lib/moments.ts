// Share Moments & Viral Cards (Viral §5). Pure, framework-free model shared by the moment
// detector + celebratory prompt (#358) and the OG card variants + share page (#359). No imports so
// it runs in the edge OG route, the server share page, and node unit tests alike.

export type MomentType = 'win' | 'deeprun' | 'rankup' | 'tierup' | 'milestone';

export const MOMENT_TYPES: MomentType[] = ['win', 'deeprun', 'rankup', 'tierup', 'milestone'];

export function isMomentType(v: string | null | undefined): v is MomentType {
    return !!v && (MOMENT_TYPES as string[]).includes(v);
}

// Event moments belong to a tournament (deep-link → the tournament); status moments belong to the
// player's standing (deep-link → their profile/leaderboard).
export function isEventMoment(type: MomentType): boolean {
    return type === 'win' || type === 'deeprun';
}

// The highest-emotion moments auto-open the celebration; the rest get a quiet, dismissable
// affordance (responsible design — a reward, never a nag).
export function isAutoPromptMoment(type: MomentType): boolean {
    return type === 'win' || type === 'rankup' || type === 'deeprun';
}

export interface MomentParams {
    type: MomentType;
    // Status moments
    address?: string;
    rank?: number;
    points?: number;
    total?: number;
    tierLabel?: string;
    hands?: number;
    // Event moments
    tournamentId?: number;
    tournamentName?: string;
    position?: number;
    fieldSize?: number;
    // Free Play tournaments carry no real-money buy-in — copy + crawler metadata must never imply
    // stablecoin stakes for these (guardrail: never blur Free Play with real-money play).
    isFreePlay?: boolean;
}

// The short uppercase ribbon stamped on the OG card.
export function momentBadge(type: MomentType, hands?: number): string {
    switch (type) {
        case 'win':
            return 'WINNER';
        case 'deeprun':
            return 'DEEP RUN';
        case 'rankup':
            return 'RANKED UP';
        case 'tierup':
            return 'NEW TIER';
        case 'milestone':
            return hands ? `${hands.toLocaleString()} HANDS` : 'MILESTONE';
    }
}

// Player-facing celebration copy. Status-framed, honest, never an earnings claim.
export function momentCopy(p: MomentParams): {
    heading: string;
    sub: string;
    shareText: string;
} {
    const where = p.tournamentName ? ` in ${p.tournamentName}` : '';
    // Free Play events are play-money — tag them so a shared post never reads as a real-money cash.
    const freeTag = p.isFreePlay ? ' (Free Play)' : '';
    switch (p.type) {
        case 'win':
            return {
                heading: 'You took it down',
                sub: `1st place${p.fieldSize ? ` of ${p.fieldSize}` : ''}${where}${freeTag}.`,
                shareText: `Took it down. 1st${p.fieldSize ? ` of ${p.fieldSize}` : ''}${where}${freeTag} on @stacked_poker. Onchain poker on Base.`,
            };
        case 'deeprun':
            return {
                heading: 'Deep run',
                sub: `Final-table run${where}${freeTag}.`,
                shareText: `Deep run. Made the final table${where}${freeTag} on @stacked_poker. Onchain poker on Base.`,
            };
        case 'rankup':
            return {
                heading: 'You ranked up',
                sub: p.rank ? `Now #${p.rank} on the leaderboard.` : 'You climbed the leaderboard.',
                shareText: `Climbing the @stacked_poker leaderboard${p.rank ? `, now #${p.rank}` : ''}. Onchain poker on Base.`,
            };
        case 'tierup':
            return {
                heading: 'New tier unlocked',
                sub: p.tierLabel ? `Welcome to ${p.tierLabel}.` : 'You reached a new tier.',
                shareText: `Just hit ${p.tierLabel ?? 'a new tier'} on @stacked_poker. Onchain poker on Base.`,
            };
        case 'milestone':
            return {
                heading: 'Milestone reached',
                sub: p.hands ? `${p.hands.toLocaleString()} hands played.` : 'A new hands milestone.',
                shareText: `${p.hands ? `Just hit ${p.hands.toLocaleString()} hands` : 'Another milestone'} on @stacked_poker. Onchain poker on Base.`,
            };
    }
}

// The OG image URL for a moment — reuses the existing rank / tournament templates with an `m`
// (and, for milestones, `hands`) param that overlays the celebratory ribbon.
export function buildMomentOgUrl(origin: string, p: MomentParams): string {
    if (isEventMoment(p.type)) {
        const q = new URLSearchParams();
        if (p.tournamentId != null) q.set('id', String(p.tournamentId));
        q.set('m', p.type);
        return `${origin}/api/og/tournament?${q.toString()}`;
    }
    const q = new URLSearchParams();
    if (p.rank != null) q.set('r', String(p.rank));
    if (p.points != null) q.set('p', String(p.points));
    if (p.total != null) q.set('t', String(p.total));
    if (p.hands != null) q.set('hands', String(p.hands));
    q.set('m', p.type);
    return `${origin}/api/og/rank?${q.toString()}`;
}

// The page a moment links to — the unified `/moment` share page, which unfurls into the OG card
// and bounces real visitors to the loop destination (tournament for events, profile for status).
export function buildMomentShareUrl(origin: string, p: MomentParams): string {
    const q = new URLSearchParams();
    q.set('type', p.type);
    if (p.address) q.set('address', p.address);
    if (p.tournamentId != null) q.set('id', String(p.tournamentId));
    if (p.rank != null) q.set('r', String(p.rank));
    if (p.points != null) q.set('p', String(p.points));
    if (p.total != null) q.set('t', String(p.total));
    if (p.hands != null) q.set('hands', String(p.hands));
    if (p.tierLabel) q.set('tier', p.tierLabel);
    if (p.tournamentName) q.set('name', p.tournamentName);
    if (p.fieldSize != null) q.set('field', String(p.fieldSize));
    if (p.isFreePlay) q.set('free', '1');
    return `${origin}/moment?${q.toString()}`;
}

// Where a real visitor who clicks the shared link should land. Event → the tournament; status →
// the sharer's public profile (#345/#586), falling back to the leaderboard only when no address
// is carried (so the §5 viral loop lands on the player who shared, not a generic board).
export function momentDestination(p: MomentParams): string {
    if (isEventMoment(p.type) && p.tournamentId != null) {
        return `/tournament/${p.tournamentId}`;
    }
    if (p.address) {
        return `/profile/${p.address}`;
    }
    return '/leaderboard';
}

// Title/description for the share page's crawler metadata.
export function momentMeta(p: MomentParams): { title: string; description: string } {
    const c = momentCopy(p);
    // Drop the trailing celebration emoji + spaces for the crawler title (keep ASCII punctuation).
    const plainHeading = c.heading.replace(/[^A-Za-z0-9!?. ]+$/, '').trim();
    // Never assert a stablecoin buy-in for a Free Play moment — that would blur Free Play with
    // real-money play on the most public surface (the X / Telegram unfurl description).
    const tagline = p.isFreePlay
        ? 'Free Play on Stacked. Risk-free practice poker on Base.'
        : 'Onchain poker on Base: stablecoin buy-ins, smart-contract custody.';
    return {
        title: `${plainHeading} · Stacked Poker`,
        description: `${c.sub} ${tagline}`,
    };
}
