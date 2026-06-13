'use client';

import {
    Box,
    HStack,
    Icon,
    Text,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdLockClock } from 'react-icons/md';
import { useCountdownWithSeconds } from '../PublicGames/tournamentFormat';

type Size = 'sm' | 'md' | 'lg';

// The countdown reads as a poker chip: a round pill with a hairline ring and a
// soft bottom edge (the tactile "sink"), tabular numerals so the digits do not
// jitter as they tick. Tint carries state, but never alone: a live dot or lock
// icon and a text label always ride along (WCAG, color-blind safe).

const CHIP_PX: Record<Size, number> = { sm: 2.5, md: 3, lg: 3.5 };
const CHIP_PY: Record<Size, number> = { sm: 1, md: 1, lg: 1.5 };
const TIME_FONT: Record<Size, string> = { sm: 'sm', md: 'md', lg: 'xl' };
const LABEL_FONT: Record<Size, string> = { sm: '2xs', md: 'xs', lg: 'sm' };
const DOT_BOX: Record<Size, string> = { sm: '7px', md: '8px', lg: '9px' };
const ICON_BOX: Record<Size, string> = { sm: '13px', md: '14px', lg: '16px' };

type State = 'neutral' | 'soon' | 'lateReg';

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.62); opacity: 0.55; }
`;

const haloPulse = keyframes`
    0% { transform: scale(1); opacity: 0.6; }
    70%, 100% { transform: scale(2.6); opacity: 0; }
`;

function LiveDot({
    size,
    color,
    fast,
}: {
    size: Size;
    color: string;
    fast?: boolean;
}) {
    const reduce = usePrefersReducedMotion();
    // Under a minute, the pulse quickens so the final stretch feels alive.
    const period = fast ? '1.1s' : '2s';
    return (
        <Box
            as="span"
            position="relative"
            display="inline-flex"
            boxSize={DOT_BOX[size]}
            flexShrink={0}
            aria-hidden
        >
            {!reduce && (
                <Box
                    as="span"
                    position="absolute"
                    inset={0}
                    borderRadius="full"
                    bg={color}
                    animation={`${haloPulse} ${period} cubic-bezier(0.2, 0.8, 0.2, 1) infinite`}
                />
            )}
            <Box
                as="span"
                position="relative"
                borderRadius="full"
                boxSize="full"
                bg={color}
                animation={
                    reduce ? undefined : `${pulse} ${period} ease-in-out infinite`
                }
            />
        </Box>
    );
}

export interface TournamentCountdownDisplayProps {
    /** ISO start time. */
    scheduledStartAt: string;
    /** ISO late-registration close, if any. Drives the "Late reg closing" badge. */
    lateRegCloseAt?: string;
    size?: Size;
}

const NEAR_WINDOW_MS = 15 * 60 * 1000;

export default function TournamentCountdownDisplay({
    scheduledStartAt,
    lateRegCloseAt,
    size = 'md',
}: TournamentCountdownDisplayProps) {
    const start = useCountdownWithSeconds(scheduledStartAt);

    const startMs = new Date(scheduledStartAt).getTime();
    const lateClose = lateRegCloseAt
        ? new Date(lateRegCloseAt).getTime()
        : null;
    const nowMs = start.ready ? startMs - start.diffMs : null;

    const lateRegSoon =
        lateClose != null &&
        nowMs != null &&
        lateClose > nowMs &&
        lateClose < startMs &&
        lateClose - nowMs <= NEAR_WINDOW_MS;

    const startingSoon =
        nowMs != null && start.diffMs > 0 && start.diffMs <= NEAR_WINDOW_MS;

    const state: State = lateRegSoon
        ? 'lateReg'
        : startingSoon
          ? 'soon'
          : 'neutral';

    const finalMinute = startingSoon && start.diffMs <= 60_000;

    // Chip skin per state. Late reg is the loud one: a filled chip-yellow pill
    // (the chip color, literally) with dark ink, last-call energy. Soon is a
    // soft green chip with a live dot. Neutral is calm paper/felt. `inlay` is the
    // faint printed ring set in from the rim that makes the pill read as a chip.
    const chip =
        state === 'lateReg'
            ? {
                  bg: 'brand.yellow',
                  color: 'brand.darkNavy',
                  ring: 'rgba(138, 106, 0, 0.55)',
                  edge: 'brand.yellowEdge',
                  inlay: 'rgba(138, 106, 0, 0.35)',
              }
            : state === 'soon'
              ? {
                    bg: 'reminder.soonBg',
                    color: 'reminder.soonText',
                    ring: 'rgba(54, 163, 123, 0.35)',
                    edge: 'rgba(34, 103, 78, 0.45)',
                    inlay: 'rgba(54, 163, 123, 0.32)',
                }
              : {
                    bg: 'reminder.chipBg',
                    color: 'text.primary',
                    ring: 'reminder.chipBorder',
                    edge: 'reminder.chipEdge',
                    inlay: 'reminder.chipBorder',
                };

    // The inlay ring needs room to sit inside the rim, so skip it at sm.
    const showInlay = size !== 'sm';

    const label =
        state === 'lateReg'
            ? 'Last call'
            : state === 'soon'
              ? 'Starting soon'
              : null;

    return (
        <HStack spacing={2} align="center" minW={0}>
            <HStack
                as="span"
                position="relative"
                spacing={1.5}
                align="center"
                px={CHIP_PX[size]}
                py={CHIP_PY[size]}
                borderRadius="full"
                bg={chip.bg}
                color={chip.color}
                boxShadow={`inset 0 0 0 1px ${chip.ring}, inset 0 1px 0 rgba(255,255,255,0.22), 0 1.5px 0 ${chip.edge}`}
            >
                {showInlay && (
                    <Box
                        as="span"
                        position="absolute"
                        inset="3px"
                        borderRadius="full"
                        border="1px solid"
                        borderColor={chip.inlay}
                        pointerEvents="none"
                        aria-hidden
                    />
                )}
                {state === 'soon' && (
                    <LiveDot
                        size={size}
                        color="reminder.soonText"
                        fast={finalMinute}
                    />
                )}
                {state === 'lateReg' && (
                    <Icon
                        as={MdLockClock}
                        boxSize={ICON_BOX[size]}
                        flexShrink={0}
                        aria-hidden
                    />
                )}
                <Text
                    as="span"
                    color={state === 'lateReg' ? 'brand.darkNavy' : 'text.primary'}
                    fontSize={TIME_FONT[size]}
                    fontWeight="extrabold"
                    lineHeight={1}
                    whiteSpace="nowrap"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {start.ready ? start.label : ''}
                </Text>
            </HStack>

            {label && (
                <Text
                    as="span"
                    fontSize={LABEL_FONT[size]}
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    whiteSpace="nowrap"
                    color={state === 'lateReg' ? 'reminder.lateRegText' : 'reminder.soonText'}
                >
                    {label}
                </Text>
            )}
        </HStack>
    );
}
