'use client';

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Highlight, LiveTag, SceneCopy, StageCard } from '../primitives';
import { useShowcaseTournaments } from '../useShowcaseTournaments';
import {
    formatCountdown,
    formatTournamentStart,
    formatUsdcAuto,
    isFreePlay,
} from '../../PublicGames/tournamentFormat';
import type { Tournament } from '../../../hooks/server_actions';

const LIVE_STATUSES = new Set(['running', 'late_registration']);

function isLive(t: Tournament): boolean {
    return LIVE_STATUSES.has(t.status);
}

// Right-hand label: "Live now" for in-progress events, otherwise the start time
// or a short countdown when it's close. No countdown-clock urgency framing —
// just the facts (brand voice: concrete, not FOMO).
function whenLabel(t: Tournament): string {
    if (isLive(t)) return 'Live now';
    const diff = new Date(t.scheduled_start_at).getTime() - Date.now();
    if (Number.isFinite(diff) && diff > 0 && diff < 6 * 60 * 60 * 1000) {
        return `Starts in ${formatCountdown(diff)}`;
    }
    return formatTournamentStart(t.scheduled_start_at);
}

function buyInLabel(t: Tournament): string {
    return isFreePlay(t) ? 'Free Play' : `$${formatUsdcAuto(t.buy_in_usdc)} buy-in`;
}

const TournamentRow = ({ t }: { t: Tournament }) => {
    const live = isLive(t);
    const gtd = (t.guarantee_usdc ?? 0) > 0;
    return (
        <Flex
            justify="space-between"
            align="center"
            bg={live ? 'rgba(235, 11, 92, 0.06)' : 'rgba(54, 163, 123, 0.08)'}
            border="1px solid"
            borderColor={live ? 'rgba(235, 11, 92, 0.22)' : 'rgba(54, 163, 123, 0.24)'}
            borderRadius="12px"
            px="clamp(12px, 1.1vw, 16px)"
            py="clamp(10px, 1.1vh, 14px)"
            gap="12px"
        >
            <VStack align="flex-start" spacing="2px" minW={0}>
                <Text
                    color="brand.darkNavy"
                    fontWeight={800}
                    fontSize="clamp(0.92rem, 1.2vw, 1.2rem)"
                    noOfLines={1}
                >
                    {t.name}
                </Text>
                <Text
                    color="brand.navy"
                    fontWeight={600}
                    fontSize="clamp(0.74rem, 0.95vw, 0.92rem)"
                >
                    {buyInLabel(t)}
                    {gtd ? ` · $${formatUsdcAuto(t.guarantee_usdc)} GTD` : ''}
                </Text>
            </VStack>
            <VStack align="flex-end" spacing="2px" flexShrink={0}>
                <Text
                    color={live ? 'brand.pink' : 'brand.green'}
                    fontWeight={800}
                    fontSize="clamp(0.74rem, 0.95vw, 0.92rem)"
                    whiteSpace="nowrap"
                >
                    {whenLabel(t)}
                </Text>
                {typeof t.registered_count === 'number' && t.registered_count > 0 && (
                    <Text
                        color="brand.navy"
                        fontWeight={600}
                        fontSize="clamp(0.68rem, 0.85vw, 0.82rem)"
                        whiteSpace="nowrap"
                    >
                        {t.registered_count} entered
                    </Text>
                )}
            </VStack>
        </Flex>
    );
};

const TournamentBoard = ({ tournaments }: { tournaments: Tournament[] }) => {
    const anyLive = tournaments.some(isLive);
    return (
        <StageCard
            accent="brand.green"
            header="On the schedule"
            headerRight={anyLive ? <LiveTag /> : undefined}
        >
            <VStack align="stretch" spacing="clamp(8px, 1vh, 12px)">
                {tournaments.map((t) => (
                    <TournamentRow key={t.id} t={t} />
                ))}
                <Text
                    color="brand.navy"
                    fontWeight={600}
                    fontSize="clamp(0.7rem, 0.9vw, 0.85rem)"
                    textAlign="center"
                    pt="2px"
                >
                    Find your seat at stackedpoker.io
                </Text>
            </VStack>
        </StageCard>
    );
};

// Shown when there's no real tournament scheduled. No invented events or numbers —
// just the value prop. Keeps the billboard honest (never fake game data).
const TournamentInvite = () => (
    <StageCard accent="brand.green" header="Host a tournament">
        <VStack align="stretch" spacing="clamp(14px, 1.8vh, 22px)">
            <Text
                color="brand.darkNavy"
                fontWeight={800}
                lineHeight="1.05"
                fontSize="clamp(1.6rem, 2.6vw, 2.4rem)"
                letterSpacing="-0.01em"
            >
                Run your own event.
                <br />
                Your name on the felt.
            </Text>
            <VStack align="stretch" spacing="clamp(8px, 1vh, 12px)">
                {[
                    'Set the buy-in, structure, and start time',
                    'Brand it — your logo, your background',
                    'Real money or Free Play',
                ].map((line) => (
                    <HStack key={line} align="flex-start" spacing="10px">
                        <Box
                            mt="0.55em"
                            w="7px"
                            h="7px"
                            borderRadius="full"
                            bg="brand.green"
                            flexShrink={0}
                        />
                        <Text
                            color="brand.navy"
                            fontWeight={600}
                            fontSize="clamp(0.86rem, 1.1vw, 1.08rem)"
                        >
                            {line}
                        </Text>
                    </HStack>
                ))}
            </VStack>
            <Text
                color="brand.navy"
                fontWeight={600}
                fontSize="clamp(0.7rem, 0.9vw, 0.85rem)"
                textAlign="center"
            >
                Start one at stackedpoker.io
            </Text>
        </VStack>
    </StageCard>
);

// Scene F — Tournaments: real scheduled/live events pulled from the lobby, or the
// host-your-own value prop when nothing's on the schedule. The card is the only
// place real data appears; the copy column is brand-stable either way.
export default function SceneTournaments() {
    const { tournaments } = useShowcaseTournaments(3);
    const hasEvents = tournaments.length > 0;

    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="Tournaments · Your table, your money"
                eyebrowColor="brand.green"
                headline={
                    <>
                        The home game,
                        <br />
                        <Highlight color="brand.green">on-chain.</Highlight>
                    </>
                }
                sub={
                    <>
                        Scheduled tournaments you can join in a couple of taps — buy in with
                        USDC, every hand settles on Base, and you can withdraw yourself any time.
                    </>
                }
                badges={
                    hasEvents
                        ? ['Open for registration', 'USDC on Base', 'Free Play too']
                        : ['Host your own', 'USDC on Base', 'Free Play too']
                }
                badgeTone="green"
            />

            <Flex
                flex="1"
                h="100%"
                minW={0}
                align="center"
                justify="center"
                display={{ base: 'none', sm: 'flex' }}
            >
                {hasEvents ? <TournamentBoard tournaments={tournaments} /> : <TournamentInvite />}
            </Flex>
        </Flex>
    );
}
