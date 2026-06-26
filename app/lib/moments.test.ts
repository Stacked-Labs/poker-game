import { describe, it, expect } from 'vitest';
import {
    isMomentType,
    isEventMoment,
    isAutoPromptMoment,
    momentBadge,
    buildMomentOgUrl,
    buildMomentShareUrl,
    momentDestination,
    momentMeta,
} from './moments';

// Share Moments (Viral §5). The model is pure so the OG route, the share page, and the prompt all
// agree on URLs, badges, and destinations. These tests pin that contract.

const ORIGIN = 'https://stackedpoker.io';

describe('moment classification', () => {
    it('recognises valid moment types only', () => {
        expect(isMomentType('win')).toBe(true);
        expect(isMomentType('milestone')).toBe(true);
        expect(isMomentType('nope')).toBe(false);
        expect(isMomentType(null)).toBe(false);
    });

    it('splits event vs status moments', () => {
        expect(isEventMoment('win')).toBe(true);
        expect(isEventMoment('deeprun')).toBe(true);
        expect(isEventMoment('rankup')).toBe(false);
        expect(isEventMoment('milestone')).toBe(false);
    });

    it('auto-prompts only the highest-emotion moments', () => {
        expect(isAutoPromptMoment('win')).toBe(true);
        expect(isAutoPromptMoment('rankup')).toBe(true);
        expect(isAutoPromptMoment('deeprun')).toBe(true);
        expect(isAutoPromptMoment('tierup')).toBe(false);
        expect(isAutoPromptMoment('milestone')).toBe(false);
    });
});

describe('momentBadge', () => {
    it('renders the milestone hands count', () => {
        expect(momentBadge('milestone', 10000)).toBe('10,000 HANDS');
        expect(momentBadge('milestone')).toBe('MILESTONE');
    });
    it('renders fixed badges for the rest', () => {
        expect(momentBadge('win')).toBe('WINNER');
        expect(momentBadge('deeprun')).toBe('DEEP RUN');
        expect(momentBadge('rankup')).toBe('RANKED UP');
        expect(momentBadge('tierup')).toBe('NEW TIER');
    });
});

describe('buildMomentOgUrl', () => {
    it('routes event moments to the tournament OG card with the moment param', () => {
        const url = buildMomentOgUrl(ORIGIN, { type: 'win', tournamentId: 482, fieldSize: 120 });
        expect(url).toContain('/api/og/tournament?');
        expect(url).toContain('id=482');
        expect(url).toContain('m=win');
    });
    it('routes status moments to the rank OG card with rank data + moment param', () => {
        const url = buildMomentOgUrl(ORIGIN, { type: 'milestone', rank: 9, points: 3400, total: 500, hands: 10000 });
        expect(url).toContain('/api/og/rank?');
        expect(url).toContain('m=milestone');
        expect(url).toContain('hands=10000');
        expect(url).toContain('r=9');
    });
});

describe('buildMomentShareUrl', () => {
    it('encodes all provided params onto /moment', () => {
        const url = buildMomentShareUrl(ORIGIN, {
            type: 'rankup',
            address: '0xABC',
            rank: 4,
            points: 9000,
            total: 800,
        });
        expect(url.startsWith(`${ORIGIN}/moment?`)).toBe(true);
        expect(url).toContain('type=rankup');
        expect(url).toContain('address=0xABC');
        expect(url).toContain('r=4');
    });
});

describe('momentDestination', () => {
    it('sends event moments to the tournament', () => {
        expect(momentDestination({ type: 'win', tournamentId: 482 })).toBe('/tournament/482');
    });
    it('sends status moments to the player home (leaderboard until profiles ship)', () => {
        expect(momentDestination({ type: 'rankup', address: '0xabc' })).toBe('/leaderboard');
        expect(momentDestination({ type: 'milestone' })).toBe('/leaderboard');
    });
});

describe('momentMeta', () => {
    it('produces a clean title without trailing emoji and an honest description', () => {
        const { title, description } = momentMeta({ type: 'win', fieldSize: 120, tournamentName: 'Sunday Major' });
        expect(title).toContain('Stacked Poker');
        expect(title.includes('🏆')).toBe(false);
        expect(description).toContain('On-chain poker on Base');
    });
});
