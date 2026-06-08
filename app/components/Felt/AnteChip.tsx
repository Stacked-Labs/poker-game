'use client';

import { useContext } from 'react';
import { Box, Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// Server GameStage: PreFlop === 2 (see poker/game.go). The big-blind ante is
// posted by the BB into the pot at deal time and lives in TotalBet, so it never
// shows as a seat bet chip. We surface it here as a single chip in the middle of
// the board — only preflop. Postflop the pot pill already includes it.
//
// Source: config.tournament.ante is the ante ACTUALLY posted this hand (applied
// between hands), so it stays in step with the SB/BB seat chips beside it on the
// felt. The HUD watermark / tab panel instead read tournamentLive.clock.ante (the
// level clock, which can read one level ahead at a boundary) — right for a clock,
// wrong for chips sitting next to this hand's posted blinds. Amount is rendered as
// a raw chip count (toLocaleString), matching the other ante displays — NOT
// useFormatAmount, whose bb mode would collapse the ante (≈ the big blind) to "1bb".
const PREFLOP_STAGE = 2;

const anteChipIn = keyframes`
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.82); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
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
            gap={{ base: 1.5, md: 2 }}
            px={{ base: 2, md: 2.5 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="full"
            bg="rgba(0, 0, 0, 0.28)"
            backdropFilter="blur(3px)"
            sx={{ WebkitBackdropFilter: 'blur(3px)' }}
            border="1px solid"
            borderColor="rgba(253, 197, 29, 0.5)"
            boxShadow="0 8px 24px rgba(0, 0, 0, 0.35)"
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
            {/* Poker-chip glyph: amber disc with an inset navy ring. */}
            <Box
                aria-hidden
                flexShrink={0}
                w={{ base: '11px', md: '13px' }}
                h={{ base: '11px', md: '13px' }}
                borderRadius="full"
                bg="brand.yellow"
                boxShadow="inset 0 0 0 2px var(--chakra-colors-brand-navy)"
            />
            <Text
                as="span"
                fontSize={{ base: '8px', md: '9px' }}
                fontWeight="bold"
                letterSpacing="0.12em"
                color="whiteAlpha.700"
            >
                ANTE
            </Text>
            <Text
                as="span"
                fontSize={{ base: '11px', md: '13px' }}
                fontWeight="extrabold"
                color="brand.yellow"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {ante.toLocaleString('en-US')}
            </Text>
        </Flex>
    );
};

export default AnteChip;
