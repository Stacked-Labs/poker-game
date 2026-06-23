import { describe, expect, it } from 'vitest';
import {
    buildTournamentShareText,
    buildTournamentShareUrl,
} from './tournamentShare';

const base = {
    fieldSize: 120,
    isFreePlay: false,
    tournamentName: 'Nightly $50 GTD',
};

describe('buildTournamentShareText', () => {
    it('frames a win with the field size and prize', () => {
        expect(
            buildTournamentShareText({
                ...base,
                kind: 'win',
                position: 1,
                prizeUsdc: 500_000_000,
            })
        ).toBe(
            'Took it down 🏆 1st of 120 in Nightly $50 GTD for $500 on @stacked_poker. On-chain poker on Base.'
        );
    });

    it('frames an in-the-money bust as a cash with the finish ordinal', () => {
        expect(
            buildTournamentShareText({
                ...base,
                kind: 'bust',
                position: 12,
                prizeUsdc: 200_000_000,
            })
        ).toBe(
            'Cashed 12th of 120 in Nightly $50 GTD for $200 on @stacked_poker. On-chain poker on Base.'
        );
    });

    it('frames an out-of-the-money bust without a prize clause', () => {
        expect(
            buildTournamentShareText({
                ...base,
                kind: 'bust',
                position: 47,
                prizeUsdc: 0,
            })
        ).toBe(
            'Finished 47th of 120 in Nightly $50 GTD on @stacked_poker. On-chain poker on Base.'
        );
    });

    it('never advertises a prize for free play, even on a win', () => {
        expect(
            buildTournamentShareText({
                ...base,
                isFreePlay: true,
                tournamentName: 'Free Play Warmup',
                kind: 'win',
                position: 1,
                prizeUsdc: 0,
            })
        ).toBe(
            'Took it down 🏆 1st of 120 in Free Play Warmup on @stacked_poker. On-chain poker on Base.'
        );
    });

    it('compacts large prizes', () => {
        expect(
            buildTournamentShareText({
                ...base,
                kind: 'win',
                position: 1,
                prizeUsdc: 250_000_000_000,
            })
        ).toContain('for $250k');
    });

    it('omits the venue clause when the tournament has no name', () => {
        expect(
            buildTournamentShareText({
                ...base,
                tournamentName: '',
                kind: 'bust',
                position: 5,
                prizeUsdc: 0,
            })
        ).toBe('Finished 5th of 120 on @stacked_poker. On-chain poker on Base.');
    });
});

describe('buildTournamentShareUrl', () => {
    it('points at the tournament page on the production origin by default', () => {
        // jsdom is not configured for this node-environment test, so window is
        // undefined and the builder falls back to the canonical origin.
        expect(buildTournamentShareUrl(42)).toBe(
            'https://stackedpoker.io/tournament/42'
        );
    });
});
