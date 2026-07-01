'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Box, Text, type ResponsiveValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';

// The seat nameplate. A full X handle or display name can't fit the ~80px name
// slot, so instead of a hard ellipsis we FADE the overflowing edge, and reveal
// the whole name with a marquee while it's this seat's turn (or on hover) — only
// ever one seat (the actor) moves at a time. Reduced-motion / no-JS falls back to
// the static fade plus a native `title` tooltip, so the name is always reachable.

const marquee = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(var(--marq-shift, 0px)); }
`;

const GAP_PX = 28; // space between the two looped copies
const SPEED_PX_PER_S = 32; // marquee scroll speed (distance / speed = duration)
const FADE = 'linear-gradient(to right, #000 74%, transparent 100%)';

interface SeatNameProps {
    label: string;
    href?: string | null;
    color: string;
    fontSize: ResponsiveValue<string>;
    /** Marquee the full name while it's this seat's turn. */
    active: boolean;
}

export default function SeatName({
    label,
    href,
    color,
    fontSize,
    active,
}: SeatNameProps) {
    const prefersReducedMotion = useReducedMotion();
    const clipRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [overflow, setOverflow] = useState(false);
    const [shift, setShift] = useState(0);
    const [hovered, setHovered] = useState(false);

    const measure = useCallback(() => {
        const clip = clipRef.current;
        const text = textRef.current;
        if (!clip || !text) return;
        const copyWidth = text.offsetWidth;
        const isOver = copyWidth - clip.clientWidth > 1;
        setOverflow(isOver);
        setShift(isOver ? copyWidth + GAP_PX : 0);
    }, []);

    // Measure before paint; re-measure as the seat scales (cqw) via ResizeObserver.
    useLayoutEffect(() => {
        measure();
        const clip = clipRef.current;
        if (!clip || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(measure);
        ro.observe(clip);
        return () => ro.disconnect();
    }, [measure, label]);

    const scrolling =
        overflow && (active || hovered) && !prefersReducedMotion;
    const durationS = Math.max(shift / SPEED_PX_PER_S, 4);

    const spanStyle = {
        variant: 'seatText',
        as: 'span' as const,
        fontSize,
        fontWeight: 'bold' as const,
        color,
        lineHeight: '1.2',
        whiteSpace: 'nowrap' as const,
    };

    const linkProps = href
        ? {
              as: 'a' as const,
              href,
              target: '_blank',
              rel: 'noopener noreferrer',
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
              _hover: {
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
              },
          }
        : {};

    return (
        <Box
            ref={clipRef}
            position="relative"
            minWidth={0}
            maxWidth="100%"
            overflow="hidden"
            title={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={
                overflow
                    ? { maskImage: FADE, WebkitMaskImage: FADE }
                    : undefined
            }
        >
            <Box
                className="player-username"
                display="inline-flex"
                width="max-content"
                maxWidth={scrolling ? undefined : '100%'}
                cursor="pointer"
                sx={
                    scrolling
                        ? {
                              animation: `${marquee} ${durationS}s linear infinite`,
                          }
                        : undefined
                }
                style={
                    scrolling
                        ? ({ ['--marq-shift']: `-${shift}px` } as React.CSSProperties)
                        : undefined
                }
                {...linkProps}
            >
                <Text ref={textRef} {...spanStyle}>
                    {label}
                </Text>
                {scrolling && (
                    <Text {...spanStyle} aria-hidden pl={`${GAP_PX}px`}>
                        {label}
                    </Text>
                )}
            </Box>
        </Box>
    );
}
