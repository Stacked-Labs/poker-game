import { formatUsdcCompact, ordinal } from '../PublicGames/tournamentFormatPure';

// Hook-free share-copy + URL builders for the end-of-tournament result modal.
// The branching (win / in-the-money / plain finish, each with a free-play
// variant) lives here as a pure function so it can be table-tested.

const HANDLE = '@stacked_poker';
const TAGLINE = 'On-chain poker on Base.';

export interface TournamentShareInput {
    kind: 'bust' | 'win';
    position: number;
    fieldSize: number;
    prizeUsdc: number;
    isFreePlay: boolean;
    tournamentName: string;
}

export function buildTournamentShareText(input: TournamentShareInput): string {
    const { kind, position, fieldSize, prizeUsdc, isFreePlay, tournamentName } =
        input;
    const cashed = !isFreePlay && prizeUsdc > 0;
    const prize = cashed ? ` for $${formatUsdcCompact(prizeUsdc)}` : '';
    const where = tournamentName ? ` in ${tournamentName}` : '';

    const headline =
        kind === 'win'
            ? `Took it down 🏆 1st of ${fieldSize}${where}${prize}`
            : cashed
              ? `Cashed ${ordinal(position)} of ${fieldSize}${where}${prize}`
              : `Finished ${ordinal(position)} of ${fieldSize}${where}`;

    return `${headline} on ${HANDLE}. ${TAGLINE}`;
}

// Shares the tournament page, which unfurls into the per-tournament OG card
// (see app/tournament/[id]/layout.tsx).
export function buildTournamentShareUrl(tournamentId: number): string {
    const origin =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://stackedpoker.io';
    return `${origin}/tournament/${tournamentId}`;
}
