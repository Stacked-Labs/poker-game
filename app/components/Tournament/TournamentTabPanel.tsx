'use client';

import { useContext } from 'react';
import {
    Box,
    Divider,
    Flex,
    HStack,
    Image,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import PlayerAvatar from '../PlayerAvatar';
import PlayerNameLink from '../PlayerNameLink';
import ExternalLink from '../ExternalLink';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    explorerBase,
    formatUsdc,
    ordinal,
} from '../PublicGames/tournamentFormat';
import { distanceToMoney, placesPaid } from '../PublicGames/payouts';
import { useLevelCountdown } from '../../hooks/useLevelCountdown';
import type { LeaderboardPlayer } from '@/app/interfaces';
import PayoutLadder from './PayoutLadder';
import StructureSheet from './StructureSheet';

function shortAddr(a: string): string {
    return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export default function TournamentTabPanel() {
    const { appState } = useContext(AppContext);
    const live = appState.tournamentLive;
    const meta = live?.meta ?? null;
    const clock = live?.clock ?? null;
    const countdown = useLevelCountdown(clock);

    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const rowHover = useColorModeValue(
        'rgba(11, 20, 48, 0.04)',
        'rgba(255, 255, 255, 0.05)'
    );
    const meHighlight = useColorModeValue(
        'rgba(54, 163, 123, 0.08)',
        'rgba(54, 163, 123, 0.16)'
    );
    const goldRank = useColorModeValue('brand.yellowDark', 'brand.yellow');
    // brand.green fails AA as small text on the light card; darken it in light mode
    // (the green tint backgrounds stay as-is).
    const greenFg = useColorModeValue('brand.greenDark', 'brand.green');
    const zebra = useColorModeValue(
        'rgba(11, 20, 48, 0.025)',
        'rgba(255, 255, 255, 0.025)'
    );
    const topSpot = useColorModeValue(
        'rgba(253, 197, 29, 0.10)',
        'rgba(253, 197, 29, 0.12)'
    );

    if (!live || !meta) {
        return (
            <Box p={6} textAlign="center">
                <Text color="text.muted" fontSize="sm">
                    Tournament details will appear here once the live feed
                    connects.
                </Text>
            </Box>
        );
    }

    const myWallet = appState.address?.toLowerCase();
    const isMe = (p: LeaderboardPlayer) =>
        (!!myWallet && p.wallet?.toLowerCase() === myWallet) ||
        p.uuid === appState.clientID;

    const sorted = [...live.leaderboard].sort((a, b) => {
        if (a.finish_pos === 0 && b.finish_pos === 0) return b.stack - a.stack;
        if (a.finish_pos === 0) return -1;
        if (b.finish_pos === 0) return 1;
        return a.finish_pos - b.finish_pos;
    });
    const aliveCount =
        live.playersActive ??
        sorted.filter((p) => p.finish_pos === 0).length;
    // The payout TIER (places paid / percentages) is keyed on UNIQUE players, like
    // the backend's DefaultPayouts(len(players)) — one leaderboard row per player,
    // re-entries don't add rows. registered_count counts bullet entries (the prize
    // POOL basis), which can cross a tier boundary in re-entry-heavy fields.
    const tierEntrants = live.leaderboard.length || meta.registeredCount;
    const paid = placesPaid(tierEntrants);
    const fromMoney = distanceToMoney(aliveCount, tierEntrants);

    const poolForLadder = Math.max(meta.prizePoolUsdc, meta.guaranteeUsdc);
    const overlay = Math.max(0, meta.guaranteeUsdc - meta.prizePoolUsdc);
    const nameByUuid = new Map(
        live.leaderboard.map((p) => [
            p.uuid,
            p.xUsername ? `@${p.xUsername}` : shortAddr(p.wallet),
        ])
    );

    return (
        <VStack align="stretch" spacing={4} px={{ base: 1, md: 2 }} py={2}>
            {/* Header */}
            <Box>
                <Flex justify="space-between" align="baseline" gap={3} wrap="wrap">
                    <Text
                        fontWeight="bold"
                        fontSize="lg"
                        color="text.primary"
                        noOfLines={1}
                    >
                        {meta.name}
                    </Text>
                    {meta.isFreePlay && (
                        <Box
                            bg="rgba(54, 163, 123, 0.12)"
                            color={greenFg}
                            fontSize="2xs"
                            fontWeight="bold"
                            px={2}
                            py="2px"
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            flexShrink={0}
                        >
                            Free Play · no real value
                        </Box>
                    )}
                </Flex>
                {clock && (
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        Level {clock.levelNumber} ·{' '}
                        {clock.sb.toLocaleString('en-US')}/
                        {clock.bb.toLocaleString('en-US')}
                        {clock.ante > 0
                            ? ` (${clock.ante.toLocaleString('en-US')}a)`
                            : ''}{' '}
                        · {countdown.label} to next
                    </Text>
                )}
                <HStack spacing={2} mt={1} flexWrap="wrap">
                    {!meta.isFreePlay && (
                        <HStack spacing={1}>
                            <Image src={USDC_LOGO} alt="" boxSize="15px" />
                            <Text
                                fontWeight="bold"
                                color={USDC_BLUE}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                ${formatUsdc(poolForLadder)}
                            </Text>
                            {meta.guaranteeUsdc > 0 && (
                                <Text fontSize="xs" color="text.muted">
                                    GTD ${formatUsdc(meta.guaranteeUsdc)}
                                </Text>
                            )}
                            {overlay > 0 && (
                                <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={greenFg}
                                >
                                    +${formatUsdc(overlay)} overlay
                                </Text>
                            )}
                        </HStack>
                    )}
                </HStack>
                <Text
                    fontSize="xs"
                    color="text.muted"
                    mt={1}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {aliveCount} of {tierEntrants} left · {paid} paid ·{' '}
                    {fromMoney === 0
                        ? 'in the money'
                        : `${fromMoney} from the money`}
                </Text>
            </Box>

            <PayoutLadder
                entrants={tierEntrants}
                prizePoolUsdc={poolForLadder}
                isFreePlay={meta.isFreePlay}
                status={meta.status}
                bare
            />

            <Divider borderColor={border} />

            {/* Standings */}
            <Box>
                <Text
                    fontWeight="bold"
                    fontSize="md"
                    color="text.primary"
                    mb={2}
                >
                    Standings
                </Text>
                <Box overflowX="auto">
                    <Table
                        size="sm"
                        variant="simple"
                        sx={{ 'th, td': { borderColor: border } }}
                    >
                        <Thead>
                            <Tr>
                                <Th w="44px">#</Th>
                                <Th>Player</Th>
                                {meta.reentryAllowed && <Th isNumeric>Bul.</Th>}
                                <Th isNumeric>Chips</Th>
                                <Th isNumeric>Table</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sorted.map((p, i) => {
                                const rank =
                                    p.finish_pos === 0 ? i + 1 : p.finish_pos;
                                const out = p.finish_pos > 0;
                                const me = isMe(p);
                                const bb =
                                    clock && clock.bb > 0 && !out
                                        ? Math.floor(p.stack / clock.bb)
                                        : null;
                                return (
                                    <Tr
                                        key={p.uuid}
                                        bg={
                                            me
                                                ? meHighlight
                                                : rank === 1 && !out
                                                  ? topSpot
                                                  : i % 2 === 1
                                                    ? zebra
                                                    : undefined
                                        }
                                        _hover={{ bg: me ? meHighlight : rowHover }}
                                        opacity={out ? 0.55 : 1}
                                    >
                                        <Td
                                            fontWeight="bold"
                                            color={
                                                rank === 1
                                                    ? goldRank
                                                    : 'text.primary'
                                            }
                                        >
                                            {rank}
                                        </Td>
                                        <Td>
                                            <HStack spacing={2.5} minW={0}>
                                                <Box
                                                    boxSize="30px"
                                                    flexShrink={0}
                                                >
                                                    <PlayerAvatar
                                                        profileImageUrl={
                                                            p.xProfileImageUrl
                                                        }
                                                        address={p.wallet}
                                                        username={
                                                            p.xUsername
                                                                ? `@${p.xUsername}`
                                                                : p.wallet ||
                                                                  p.uuid
                                                        }
                                                        initialsFontSize="11px"
                                                    />
                                                </Box>
                                                {p.xUsername ? (
                                                    <PlayerNameLink
                                                        username={`@${p.xUsername}`}
                                                        fontSize="sm"
                                                        fontWeight="semibold"
                                                        noOfLines={1}
                                                    />
                                                ) : p.wallet ? (
                                                    <ExternalLink
                                                        href={`${explorerBase(
                                                            meta.chain
                                                        )}/address/${p.wallet}`}
                                                        fontSize="sm"
                                                        fontFamily="mono"
                                                        color="text.primary"
                                                    >
                                                        {shortAddr(p.wallet)}
                                                    </ExternalLink>
                                                ) : (
                                                    <Text
                                                        fontSize="sm"
                                                        color="text.muted"
                                                        fontFamily="mono"
                                                    >
                                                        {p.uuid.slice(0, 8)}
                                                    </Text>
                                                )}
                                                {me && (
                                                    <Text
                                                        fontSize="2xs"
                                                        fontWeight="bold"
                                                        color={greenFg}
                                                        textTransform="uppercase"
                                                    >
                                                        you
                                                    </Text>
                                                )}
                                            </HStack>
                                        </Td>
                                        {meta.reentryAllowed && (
                                            <Td isNumeric>
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    {p.bullet_number ?? 1}
                                                </Text>
                                            </Td>
                                        )}
                                        <Td
                                            isNumeric
                                            sx={{
                                                fontVariantNumeric:
                                                    'tabular-nums',
                                            }}
                                        >
                                            {out ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <VStack
                                                    spacing={0}
                                                    align="flex-end"
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.primary"
                                                    >
                                                        {p.stack.toLocaleString(
                                                            'en-US'
                                                        )}
                                                    </Text>
                                                    {bb != null && (
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                        >
                                                            {bb} BB
                                                        </Text>
                                                    )}
                                                </VStack>
                                            )}
                                        </Td>
                                        <Td isNumeric>
                                            {out || p.table_index < 0 ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <ExternalLink
                                                    href={`/table/tournament-${live.tournamentId}-table-${
                                                        p.table_index + 1
                                                    }`}
                                                    fontSize="xs"
                                                    color="text.secondary"
                                                    iconSize="9px"
                                                >
                                                    T{p.table_index + 1}
                                                </ExternalLink>
                                            )}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Box>

            {/* Recent busts */}
            {live.feed.length > 0 && (
                <Box>
                    <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color="text.primary"
                        mb={1}
                    >
                        Recent busts
                    </Text>
                    <VStack align="stretch" spacing={0.5}>
                        {live.feed.slice(0, 8).map((e, i) => (
                            <Text
                                key={`${e.playerUuid}-${e.position}-${i}`}
                                fontSize="xs"
                                color="text.muted"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {nameByUuid.get(e.playerUuid) ?? 'A player'}{' '}
                                busted {ordinal(e.position)} · {e.remaining} left
                            </Text>
                        ))}
                    </VStack>
                </Box>
            )}

            <Divider borderColor={border} />

            <StructureSheet
                blindStructure={meta.blindStructure}
                startingStack={meta.startingStack}
                lateRegLevels={meta.lateRegLevels}
                currentLevel={clock?.levelNumber ?? null}
                defaultOpen={false}
                bare
            />
        </VStack>
    );
}
