import { describe, it, expect } from 'vitest';
import { playerDisplayName, resolvePlayerIdentity } from './address';

describe('playerDisplayName (#340 fallback chain)', () => {
    it('prefers the X display name, rendered without "@"', () => {
        expect(playerDisplayName('@degenmike', '0xabc', 'Mike Dawson')).toBe(
            'Mike Dawson'
        );
    });
    it('falls back to the @handle when there is no display name', () => {
        expect(playerDisplayName('@degenmike', '0xabc', '')).toBe('@degenmike');
        expect(playerDisplayName('@degenmike', '0xabc')).toBe('@degenmike');
    });
    it('falls back to a short wallet when there is no identity', () => {
        expect(
            playerDisplayName(null, '0x1234567890abcdef1234', null)
        ).toBe('0x1234…1234');
    });
    it('ignores a blank/whitespace display name', () => {
        expect(playerDisplayName('@mike', '0xabc', '   ')).toBe('@mike');
    });
});

describe('resolvePlayerIdentity (#340 label vs link)', () => {
    it('labels with the display name but keeps the X handle for linking', () => {
        const id = resolvePlayerIdentity('@degenmike', '0xabc', 'Mike Dawson');
        expect(id).toEqual({ kind: 'x', handle: 'degenmike', label: 'Mike Dawson' });
    });
    it('labels with @handle when no display name', () => {
        const id = resolvePlayerIdentity('@degenmike', '0xabc');
        expect(id).toEqual({ kind: 'x', handle: 'degenmike', label: '@degenmike' });
    });
    it('treats a display-name-only player as a plain name (no link)', () => {
        const id = resolvePlayerIdentity(null, '0xabc', 'Mike Dawson');
        expect(id).toEqual({ kind: 'name', label: 'Mike Dawson' });
    });
    it('falls back to a wallet identity when nothing else is present', () => {
        const id = resolvePlayerIdentity(null, '0x1234567890abcdef1234');
        expect(id).toEqual({
            kind: 'wallet',
            address: '0x1234567890abcdef1234',
            label: '0x1234…1234',
        });
    });
});
