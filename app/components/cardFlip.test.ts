import { describe, it, expect } from 'vitest';
import { decideFlip, type FlipDecision } from './cardFlip';

const base = {
    placeholder: false,
    cardString: 'AH',
    skipAnimation: false,
    hasPrev: true,
    cardChanged: true,
};

describe('decideFlip', () => {
    const cases: Array<{
        name: string;
        input: Parameters<typeof decideFlip>[0];
        expected: FlipDecision;
    }> = [
        {
            name: 'placeholder is always back',
            input: { ...base, placeholder: true, cardString: 'AH' },
            expected: 'back',
        },
        {
            name: "rabbit '0' sentinel (cardString '?') stays back even with skipAnimation",
            input: { ...base, cardString: '?', skipAnimation: true },
            expected: 'back',
        },
        {
            name: "hidden '?' stays back",
            input: { ...base, cardString: '?', skipAnimation: false },
            expected: 'back',
        },
        {
            name: 'empty / too-short cardString stays back',
            input: { ...base, cardString: '', hasPrev: false, cardChanged: true },
            expected: 'back',
        },
        {
            name: 'enemy reveal (skipAnimation) shows front immediately',
            input: { ...base, cardString: 'KD', skipAnimation: true },
            expected: 'front',
        },
        {
            name: 'unchanged real card shows front without re-animating',
            input: { ...base, cardString: 'KD', cardChanged: false },
            expected: 'front',
        },
        {
            name: 'fresh/changed real card animates',
            input: { ...base, cardString: 'KD', cardChanged: true },
            expected: 'animate',
        },
        {
            name: 'first mount of a real card animates',
            input: {
                ...base,
                cardString: 'KD',
                hasPrev: false,
                cardChanged: true,
            },
            expected: 'animate',
        },
    ];

    it.each(cases)('$name', ({ input, expected }) => {
        expect(decideFlip(input)).toBe(expected);
    });

    // The exact rabbit-hunt reveal sequence that caused the front flash: the
    // waiting '0' back must decide 'back' (not 'front'), so when the SAME reused
    // Card instance flips to its real value it carries 'back' into the reveal
    // render and animates cleanly instead of painting the face for one frame.
    it('rabbit reveal: waiting back -> real value never parks at front', () => {
        const waiting = decideFlip({
            placeholder: false,
            cardString: '?', // cardToString('0')
            skipAnimation: true,
            hasPrev: true,
            cardChanged: false,
        });
        expect(waiting).toBe('back');

        const revealed = decideFlip({
            placeholder: false,
            cardString: 'AH',
            skipAnimation: false,
            hasPrev: true,
            cardChanged: true,
        });
        expect(revealed).toBe('animate');
        expect(revealed).not.toBe('front');
    });
});
