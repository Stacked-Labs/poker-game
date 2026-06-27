// Deterministic, AA-safe color pairs for the colored-initials avatar fallback.
//
// chatColors.getColorForUsername() picks a *random* hex (cached in memory), which
// is non-deterministic across SSR/hydration and sessions and carries no contrast
// guarantee — fine for ephemeral chat, wrong for an identity avatar that must be
// stable and legible. This hashes the name to a fixed { bg, fg } pair whose
// contrast clears WCAG AA on its own ground, so it's mode-agnostic: the avatar
// carries its own light tile in both light and dark mode.

export type AvatarColor = { bg: string; fg: string };

// Eight warm, on-brand tiles (no AI-lavender). Each fg/bg pair is >= 4.5:1.
const PALETTE: AvatarColor[] = [
    { bg: '#FBE3DF', fg: '#9A2A12' }, // clay
    { bg: '#E0ECFB', fg: '#16538C' }, // base blue
    { bg: '#E2F0E8', fg: '#1E6B43' }, // felt green
    { bg: '#F4E9D4', fg: '#825410' }, // amber
    { bg: '#ECE4F6', fg: '#5B3C9E' }, // grape
    { bg: '#E5EFF0', fg: '#2C5C66' }, // teal
    { bg: '#EDE5DD', fg: '#6B4A2F' }, // cocoa
    { bg: '#E7E9F1', fg: '#39426A' }, // slate
];

export function avatarColorForName(name: string): AvatarColor {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
}
