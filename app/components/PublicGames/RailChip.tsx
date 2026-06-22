'use client';

import { Box } from '@chakra-ui/react';

type Tone = 'green' | 'usdc';

interface RailChipProps {
    label: string;
    /** Shown only when active (callers pass a count only for the honest active chip). */
    count?: number;
    active: boolean;
    onSelect: () => void;
    /** 'usdc' lights the active chip in USDC's brand blue (trust cue); else felt green. */
    tone?: Tone;
}

const TONE: Record<
    Tone,
    {
        bg: string;
        hoverBg: string;
        color: string;
        colorDark: string;
        ring: string;
        ringDark: string;
    }
> = {
    green: {
        bg: 'bg.greenTint',
        hoverBg: 'bg.greenSubtle',
        // greenEdge (light) + a brighter green (dark) so the active label clears
        // AA 4.5:1 on the green tint in both modes.
        color: 'brand.greenEdge',
        colorDark: '#5CCBA0',
        ring: 'inset 0 0 0 1.5px rgba(54, 163, 123, 0.45)',
        ringDark: 'inset 0 0 0 1.5px rgba(54, 163, 123, 0.55)',
    },
    usdc: {
        bg: 'bg.usdcTint',
        hoverBg: 'bg.usdcSubtle',
        color: 'brand.usdcDark',
        colorDark: '#5BA8E8',
        ring: 'inset 0 0 0 1.5px rgba(39, 117, 202, 0.45)',
        ringDark: 'inset 0 0 0 1.5px rgba(39, 117, 202, 0.55)',
    },
};

// One chip for the lobby filter rail (Type + Stake groups). Active reads as a lit
// poker chip: a warm tint + a 1.5px inset edge "whisper" + weight, no glow, no
// lift (press is a 1px snap). USDC carries its real brand blue for recognition.
// Belongs inside a role="radiogroup".
export default function RailChip({
    label,
    count,
    active,
    onSelect,
    tone = 'green',
}: RailChipProps) {
    const t = TONE[tone];
    return (
        <Box
            as="button"
            type="button"
            aria-pressed={active}
            onClick={onSelect}
            display="inline-flex"
            alignItems="center"
            gap={1}
            flexShrink={0}
            whiteSpace="nowrap"
            px={3}
            h={{ base: '40px', md: '34px' }}
            borderRadius="full"
            fontSize="xs"
            fontWeight={active ? 'bold' : 'semibold'}
            letterSpacing="0.01em"
            color={active ? t.color : 'text.secondary'}
            bg={active ? t.bg : 'transparent'}
            boxShadow={active ? t.ring : 'none'}
            transition="background-color 120ms ease, color 120ms ease"
            _hover={{
                bg: active ? t.bg : t.hoverBg,
                color: active ? t.color : 'text.primary',
            }}
            _active={{ transform: 'translateY(1px)' }}
            _focusVisible={{ boxShadow: 'focus.ring' }}
            _dark={{
                color: active ? t.colorDark : 'text.secondary',
                boxShadow: active ? t.ringDark : 'none',
            }}
        >
            {label}
            {active && typeof count === 'number' && (
                <Box
                    as="span"
                    ml={0.5}
                    fontSize="2xs"
                    fontWeight="bold"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    opacity={0.85}
                >
                    {count}
                </Box>
            )}
        </Box>
    );
}
