// Default branding for tournaments with no uploaded logo/banner.
//
// A Host who skips the upload still gets a clean, on-brand identity that names
// the tournament TYPE at a glance, using the SAME treatment as the create-game
// type picker so the journey from create → lobby → detail stays consistent:
//
//   • Avatar — the type's icon (bolt / fire / clock / layers) in the type's
//              accent color on a faint accent-tinted tile.
//   • Cover  — the neutral theme surface, wallpapered with card suits in the
//              type's accent color: a quiet poker motif, the color the spark.
//
// Both are color-mode aware (light AND dark first-class) and carry the type
// color as a small accent, never a flood.
//
// WHY INLINE SVG for the cover: Chakra v2's `bgImage` prop routes values through
// its gradient parser, which silently drops `url("data:image/svg+xml,…")`
// data-URIs, so the suit wallpaper is rendered as a real inline <svg> pattern.

import { Box, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FaBolt, FaClock, FaFire, FaLayerGroup } from 'react-icons/fa';
import type { TemplateName } from './blindStructures';
import { normalizeTemplate } from './blindStructures';

// ─────────────────────────────────────────────────────────────────────────────
// Type → identity
// ─────────────────────────────────────────────────────────────────────────────

/** The unicode card suits, used as the poker motif on the cover wallpaper. */
export type Suit = '♠' | '♥' | '♦' | '♣';

/** The recognizable identity for one tournament type. */
export interface TypeIdentity {
    /** Card suit glyph paired with the type. */
    suit: Suit;
    /** Display label for the type. */
    label: string;
    /** The icon used for this type in the create-game picker. */
    icon: IconType;
}

// Icon + suit pairing, matching the create-game blind-structure picker:
//   hyper   → ⚡ bolt   · ♠ spade
//   turbo   → 🔥 fire   · ♦ diamond
//   regular → 🕐 clock  · ♣ club
//   deep    → ▤ layers · ♥ heart
export const TYPE_IDENTITY: Record<TemplateName, TypeIdentity> = {
    hyper: { suit: '♠', label: 'Hyper', icon: FaBolt },
    turbo: { suit: '♦', label: 'Turbo', icon: FaFire },
    regular: { suit: '♣', label: 'Regular', icon: FaClock },
    deep: { suit: '♥', label: 'Deep', icon: FaLayerGroup },
};

/** Resolve any (possibly unknown) template string to its locked identity. */
export function identityFor(type?: string | null): TypeIdentity {
    return TYPE_IDENTITY[normalizeTemplate(type)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-type accent
// ─────────────────────────────────────────────────────────────────────────────

// Mirrors the create-game blind-structure picker so a type reads identically
// across create → lobby → detail. `hue` is the vivid graphical color (also fills
// the suit wallpaper); `tint*` is the faint tile wash; `ink*` is the icon color
// that clears WCAG AA on the tint in each mode. These specific AA-tuned shades
// are shared with CreateTournamentForm's BLIND_OPTIONS.
interface TypeAccent {
    hue: string;
    tintLight: string;
    tintDark: string;
    inkLight: string;
    inkDark: string;
}

export const TYPE_ACCENT: Record<TemplateName, TypeAccent> = {
    hyper: {
        hue: '#EB0B5C',
        tintLight: 'rgba(235, 11, 92, 0.10)',
        tintDark: 'rgba(235, 11, 92, 0.18)',
        inkLight: '#950839',
        inkDark: '#FF7DA8',
    },
    turbo: {
        // yellowDark, not pure yellow: it must stay visible on a light surface.
        hue: '#B78900',
        tintLight: 'rgba(253, 197, 29, 0.16)',
        tintDark: 'rgba(253, 197, 29, 0.20)',
        inkLight: '#705400',
        inkDark: '#FDC51D',
    },
    regular: {
        hue: '#36A37B',
        tintLight: 'rgba(54, 163, 123, 0.12)',
        tintDark: 'rgba(54, 163, 123, 0.20)',
        inkLight: '#22674E',
        inkDark: '#5FD0A8',
    },
    deep: {
        hue: '#2775CA',
        tintLight: 'rgba(39, 117, 202, 0.12)',
        tintDark: 'rgba(39, 117, 202, 0.20)',
        inkLight: '#1F5FA3',
        inkDark: '#7FB4E0',
    },
};

// The accent set for a tournament's speed (hyper/turbo/regular/deep), used for the
// suit identity tint and the lobby card's tactile "chip ledge".
export function accentFor(type?: string | null): TypeAccent {
    return TYPE_ACCENT[normalizeTemplate(type)];
}

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, n));
}

// ─────────────────────────────────────────────────────────────────────────────
// Suit geometry + cover wallpaper
// ─────────────────────────────────────────────────────────────────────────────

// Each pip is authored in a 0..100 box centered near (50,50). All four suits are
// vertically symmetric so they preserve a mirror axis.
const PIP_PATHS: Record<Suit, string> = {
    '♠': 'M50 18 C68 38 84 50 84 64 C84 76 74 82 64 80 C58 79 54 75 52 70 C53 78 56 84 62 88 L38 88 C44 84 47 78 48 70 C46 75 42 79 36 80 C26 82 16 76 16 64 C16 50 32 38 50 18 Z',
    '♥': 'M50 84 C24 64 16 52 16 40 C16 28 26 20 37 20 C44 20 49 24 50 30 C51 24 56 20 63 20 C74 20 84 28 84 40 C84 52 76 64 50 84 Z',
    '♦': 'M50 16 L80 50 L50 84 L20 50 Z',
    '♣': 'M50 16 C60 16 67 23 67 32 C67 36 66 39 64 42 C68 39 73 37 78 37 C87 37 92 44 92 52 C92 61 85 67 76 67 C69 67 63 63 60 57 C61 64 64 70 70 76 L30 76 C36 70 39 64 40 57 C37 63 31 67 24 67 C15 67 8 61 8 52 C8 44 13 37 22 37 C27 37 32 39 36 42 C34 39 33 36 33 32 C33 23 40 16 50 16 Z',
};

function round(n: number, dp = 2): number {
    const f = 10 ** dp;
    return Math.round(n * f) / f;
}

/** One suit pip, centered at (cx, cy) with on-box `size`, optionally rotated. */
function suitGlyph(suit: Suit, cx: number, cy: number, size: number, rot = 0): string {
    const s = size / 100;
    return (
        `<g transform="translate(${round(cx)} ${round(cy)}) rotate(${rot}) scale(${round(s, 4)}) translate(-50 -50)">` +
        `<path d="${PIP_PATHS[suit]}"/></g>`
    );
}

/**
 * A repeating card-suit wallpaper in one accent hue. A single 104px tile holds
 * all four suits, gently scattered and rotated, and the whole pattern is tilted
 * so it reads as tossed cards rather than a rigid grid. Pure and deterministic.
 */
function buildSuitWallpaper(
    type: TemplateName,
    hue: string,
    opacity: number
): string {
    const T = 104;
    const tile =
        suitGlyph('♠', 22, 26, 30, -12) +
        suitGlyph('♥', 78, 20, 26, 10) +
        suitGlyph('♦', 90, 74, 28, -6) +
        suitGlyph('♣', 40, 86, 27, 14) +
        suitGlyph('♦', 6, 66, 17, 8);
    const pid = `tsw-${type}`;
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" ` +
        `aria-hidden="true" focusable="false">` +
        `<defs><pattern id="${pid}" width="${T}" height="${T}" ` +
        `patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">` +
        `<g fill="${hue}" fill-opacity="${opacity}">${tile}</g>` +
        `</pattern></defs>` +
        `<rect width="100%" height="100%" fill="url(#${pid})"/></svg>`
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

export interface TournamentDefaultAvatarProps {
    /** Tournament template; unknown values normalize to `turbo`. */
    type?: string | null;
    /** Pixel size of the square tile. Defaults to 56. */
    size?: number;
    /** Optional accessible label override. */
    'aria-label'?: string;
}

/**
 * A rounded-square default avatar for a tournament with no uploaded logo: the
 * type's icon in the type's accent color on a faint accent-tinted tile, the same
 * treatment as the create-game type picker. Legible on a white card AND a dark
 * navy card via color-mode-aware tint, ink, and ring.
 */
export function TournamentDefaultAvatar({
    type,
    size = 56,
    'aria-label': ariaLabel,
}: TournamentDefaultAvatarProps) {
    const t = normalizeTemplate(type);
    const id = TYPE_IDENTITY[t];
    const a = TYPE_ACCENT[t];
    const tile = useColorModeValue(a.tintLight, a.tintDark);
    const ink = useColorModeValue(a.inkLight, a.inkDark);
    const ring = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.10)'
    );
    const radius = clamp(Math.round(size * 0.22), 8, 18);

    return (
        <Flex
            role="img"
            aria-label={ariaLabel ?? `${id.label} tournament`}
            w={`${size}px`}
            h={`${size}px`}
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius={`${radius}px`}
            bg={tile}
            boxShadow={`inset 0 0 0 1px ${ring}`}
        >
            <Icon as={id.icon} boxSize={`${Math.round(size * 0.46)}px`} color={ink} />
        </Flex>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover
// ─────────────────────────────────────────────────────────────────────────────

export interface TournamentDefaultCoverProps {
    /** Tournament template; unknown values normalize to `turbo`. */
    type?: string | null;
}

/**
 * A full-bleed default cover for a tournament with no uploaded banner: the
 * neutral theme surface wallpapered with card suits in the type's accent color.
 * Renders absolutely, filling a `position: relative` parent band.
 */
export function TournamentDefaultCover({ type }: TournamentDefaultCoverProps) {
    const t = normalizeTemplate(type);
    const a = TYPE_ACCENT[t];
    const surface = useColorModeValue('brand.lightGray', 'charcoal.800');
    const opacity = useColorModeValue(0.1, 0.14);
    const svg = buildSuitWallpaper(t, a.hue, opacity);

    return (
        <Box position="absolute" inset={0} bg={surface} aria-hidden>
            <Box
                position="absolute"
                inset={0}
                sx={{ '& svg': { display: 'block', width: '100%', height: '100%' } }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </Box>
    );
}
