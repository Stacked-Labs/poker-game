'use client';

import { useContext } from 'react';
import { Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// Server GameStage: PreFlop === 2 (see poker/game.go). The big-blind ante is
// posted by the BB into the pot at deal time and lives in TotalBet, so it never
// shows as a seat bet chip. We surface it here as a single chip in the middle of
// the board — only preflop. Postflop the pot pill already includes it.
//
// Visually it mirrors the player bet bubble (TakenSeatButton): a solid amber
// pill with navy text and the same chunky drop-shadow, so it reads as chips put
// into the pot rather than a HUD label — just tagged ANTE to set it apart.
//
// Source: config.tournament.ante is the ante ACTUALLY posted this hand (applied
// between hands), so it stays in step with the SB/BB seat chips beside it on the
// felt. The HUD watermark / tab panel instead read tournamentLive.clock.ante (the
// level clock, which can read one level ahead at a boundary) — right for a clock,
// wrong for chips sitting next to this hand's posted blinds. Amount is a raw chip
// count abbreviated for the felt (24000 → "24K") — NOT useFormatAmount, whose bb
// mode would collapse the ante (≈ the big blind) to "1bb". The aria-label keeps
// the full unabbreviated number.
const PREFLOP_STAGE = 2;

// 800 → "800", 24000 → "24K", 1500 → "1.5K", 2_000_000 → "2M". Antes double each
// level, so deep stacks reach millions — keep the chip compact. Mirrors the
// SessionPointsBadge formatter, extended past K.
const compactChips = (n: number): string => {
    const abbr = (v: number, suffix: string) => {
        if (v >= 100) return `${Math.round(v)}${suffix}`;
        const fixed = v.toFixed(1);
        return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}${suffix}`;
    };
    if (n >= 1_000_000) return abbr(n / 1_000_000, 'M');
    if (n >= 1_000) return abbr(n / 1_000, 'K');
    return n.toLocaleString('en-US');
};

const anteChipIn = keyframes`
    from { opacity: 0; transform: translate(-50%, -50%) translateY(6px) scale(0.9); }
    to   { opacity: 1; transform: translate(-50%, -50%) translateY(0) scale(1); }
`;

const AnteChip = () => {
    const { appState } = useContext(AppContext);
    const prefersReducedMotion = usePrefersReducedMotion();

    const game = appState.game;
    const ante = game?.config?.tournament?.ante ?? 0;
    const show = !!game?.running && game.stage === PREFLOP_STAGE && ante > 0;

    if (!show) return null;

    return (
        <Flex
            data-testid="ante-chip"
            className="felt-ante-chip"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={6}
            align="center"
            gap={{ base: 1, md: 1.5 }}
            px={{ base: 2.5, md: 3 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="full"
            bg="brand.yellow"
            color="brand.navy"
            boxShadow="0 3px 0 #c99500"
            pointerEvents="none"
            userSelect="none"
            whiteSpace="nowrap"
            animation={
                prefersReducedMotion
                    ? undefined
                    : `${anteChipIn} 0.26s cubic-bezier(0.2, 0.8, 0.2, 1)`
            }
            aria-label={`Ante ${ante.toLocaleString('en-US')}`}
            role="img"
        >
            <Text
                as="span"
                fontSize={{ base: '8px', md: '9px' }}
                fontWeight="bold"
                letterSpacing="0.1em"
                opacity={0.65}
            >
                ANTE
            </Text>
            <Text
                as="span"
                fontWeight="bold"
                variant="seatText"
                fontSize={{ base: '10px', sm: '10px', md: '14px' }}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {compactChips(ante)}
            </Text>
        </Flex>
    );
};

export default AnteChip;
