'use client';

import { Box, Flex, HStack } from '@chakra-ui/react';
import { CardBack, SVGCardFace } from '../../Card';
import { shiver } from '../streamAdMotion';
import { Highlight, InkChip, SceneCopy } from '../primitives';

// The game's card SVGs are a 24x32 viewBox — keep the 3:4 ratio.
const CARD_W = 'clamp(84px, 8.8vw, 146px)';
const CARD_H = 'clamp(112px, 11.7vw, 195px)';

const BOARD_RANKS = ['A', 'K', 'Q', 'J'];

// A dealt board, rendered with the exact SVGs the live table uses: A-K-Q-J of
// spades face up, river face down (burgundy deck). The dealt cards sit still;
// only the hidden river shivers now and then — one card short of a royal flush.
const Board = () => (
    <HStack spacing="clamp(8px, 0.9vw, 14px)" justify="center" align="center" h="100%">
        {BOARD_RANKS.map((rank) => (
            <Box
                key={rank}
                w={CARD_W}
                h={CARD_H}
                filter="drop-shadow(0 12px 22px rgba(11, 20, 48, 0.18))"
            >
                <SVGCardFace rank={rank} suit="S" />
            </Box>
        ))}
        <Box
            w={CARD_W}
            h={CARD_H}
            filter="drop-shadow(0 12px 22px rgba(11, 20, 48, 0.18))"
            sx={{ animation: `${shiver} 5s ease-in-out infinite` }}
        >
            <CardBack variant="classic-burgundy" idSuffix="-stream-river" />
        </Box>
    </HStack>
);

// Scene A — brand hero: the homepage's "Your table / Your rules" with a live board.
export default function SceneHero() {
    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="Onchain poker · always on"
                eyebrowColor="brand.green"
                headline={
                    <>
                        Your <Highlight>table</Highlight>.
                        <br />
                        Your <InkChip>rules</InkChip>.
                    </>
                }
                sub={
                    <>
                        The hottest cash games and tournaments on Stacked, streamed around
                        the clock. Real Texas Hold&apos;em. Real USDC on Base.
                    </>
                }
                badges={['No signup', 'No KYC', 'Built on Base']}
                badgeTone="green"
            />

            <Box position="relative" flex="1" h="100%" minW={0} display={{ base: 'none', sm: 'block' }}>
                <Board />
            </Box>
        </Flex>
    );
}
