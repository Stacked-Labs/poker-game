// Pure decision for the flip state a Card should adopt when its inputs change.
// Extracted from Card.tsx so the reveal-flash regression is table-testable
// without a DOM (see cardFlip.test.ts).
//
// `cardString` is cardToString(card): a valid 2-char face like "AH", or "?" when
// the card has no resolvable face (the rabbit-hunt '0' sentinel, or a hidden '?').

export type FlipDecision = 'back' | 'front' | 'animate';

export function decideFlip(params: {
    placeholder: boolean;
    cardString: string;
    skipAnimation: boolean;
    hasPrev: boolean;
    cardChanged: boolean;
}): FlipDecision {
    const { placeholder, cardString, skipAnimation, hasPrev, cardChanged } =
        params;

    if (placeholder) return 'back';

    // No resolvable face yet: stay on the back. Without this, the skipAnimation /
    // unchanged path below parks flipState at 'front'. Because the rabbit-hunt
    // slot reuses the same Card instance when it flips from the '0' back to its
    // real value, that stale 'front' would paint the real face for one frame
    // before the flip resets it — the reveal "front flash".
    if (cardString === '?' || cardString.length < 2) return 'back';

    // Show the front immediately (no animation) for enemy reveals, or when the
    // effective card value did not actually change (avoid re-animating).
    if (skipAnimation || (hasPrev && !cardChanged)) return 'front';

    return 'animate';
}
