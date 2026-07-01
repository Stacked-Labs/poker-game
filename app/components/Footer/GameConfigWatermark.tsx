'use client';

import { useContext, useMemo } from 'react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import {
    Box,
    Text,
    Flex,
    Link,
    Icon,
    useBreakpointValue,
} from '@chakra-ui/react';
import { FiUser, FiChevronRight } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { playerDisplayName } from '@/app/utils/address';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import ChainBadge from '../ChainBadge';
import { levelAt } from '../PublicGames/blindStructures';

interface ConfigWithCrypto {
    maxBuyIn: number;
    bb: number;
    sb: number;
    crypto?: boolean;
    chain?: string;
    ownerAddress?: string;
}

function shortAddr(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`.toUpperCase();
}

// On narrow portrait screens the watermark sits right under the hero's seat HUD,
// so blind/ante numbers get abbreviated (3,000 → "3K", 6,000 → "6K") to keep the
// config line to one short row. Mirrors AnteChip's compactChips.
function compactChips(n: number): string {
    const abbr = (v: number, suffix: string) => {
        if (v >= 100) return `${Math.round(v)}${suffix}`;
        const fixed = v.toFixed(1);
        return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}${suffix}`;
    };
    if (n >= 1_000_000) return abbr(n / 1_000_000, 'M');
    if (n >= 1_000) return abbr(n / 1_000, 'K');
    return n.toLocaleString('en-US');
}

function explorerAddressUrl(
    chain: string | undefined,
    address: string
): string | null {
    const c = chain?.toLowerCase();
    if (c === 'base') return `https://basescan.org/address/${address}`;
    if (c === 'base sepolia' || c === 'base-sepolia')
        return `https://sepolia.basescan.org/address/${address}`;
    return null;
}

// The watermark floats over the table image (green felt in a near-black rail) and,
// at the edges, the letterbox — a backdrop that does NOT track color mode. So it
// paints a fixed light ink plus a dark halo (map-label / subtitle style) that stays
// legible over felt, rail, white community cards AND the light letterbox in both
// modes, instead of the color-mode text tokens (which vanished on the felt in light).
const WM_INK = '#F4F6FB';
const WM_INK_PLAYERS = 'rgba(244,246,251,0.90)';
const WM_INK_HOST = 'rgba(244,246,251,0.76)';
const WM_INK_FREE = '#8FE7C4';
const WM_HALO = '0 1px 2px rgba(6,10,24,0.95), 0 0 4px rgba(6,10,24,0.82)';
const WM_ICON_HALO = 'drop-shadow(0 1px 1.5px rgba(6,10,24,0.9))';
// Invisible hit-slop so the small back-link / host links reach a comfortable tap
// target without inflating the watermark's visual footprint.
const WM_HIT_SLOP = {
    content: '""',
    position: 'absolute' as const,
    top: '-9px',
    bottom: '-9px',
    left: '-6px',
    right: '-6px',
};

const GameConfigWatermark = () => {
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const live = appState.tournamentLive;
    const tMeta = live?.meta ?? null;
    const { format, mode: displayMode } = useFormatAmount();
    // Mobile-first: portrait phones get abbreviated, shorter copy so the watermark
    // doesn't bleed up into the hero's hole cards / seat HUD. SSR falls back to base.
    const compact = useBreakpointValue({ base: true, md: false }) ?? true;

    // The table route slug is the source of truth for which table the player is
    // actually viewing: tournament tables are `tournament-<id>-table-<n>`, cash
    // tables are a bare id. We surface the table number (#604: "show people which
    // table they are on") and a back link (#604/#605: return to the tournament
    // details page, or the lobby for cash games).
    const params = useParams();
    const slug =
        typeof params?.id === 'string'
            ? params.id
            : Array.isArray(params?.id)
              ? params.id[0]
              : '';
    const tourTableMatch = slug.match(/^tournament-(\d+)-table-(\d+)$/);
    const routeTournamentId = tourTableMatch ? Number(tourTableMatch[1]) : null;
    const tableNumber = tourTableMatch ? Number(tourTableMatch[2]) : null;
    const formatBlinds = useMemo(
        () =>
            displayMode === 'bb'
                ? (v: number) => v.toLocaleString('en-US')
                : format,
        [displayMode, format]
    );

    // Tournament tables: level / blinds / ante from the live clock (fall back to
    // the structure template before the first clock arrives) + players-left.
    const tournament = useMemo(() => {
        if (!tMeta) return null;
        const clock = live?.clock;
        // Prefer the host's linked X handle (matched off the live standings by
        // wallet) over the bare address — same identity the standings show.
        const hostEntry = tMeta.hostWallet
            ? live?.leaderboard?.find(
                  (p) =>
                      p.wallet?.toLowerCase() ===
                      tMeta.hostWallet.toLowerCase()
              )
            : null;
        const hostLabel =
            playerDisplayName(
                hostEntry?.xUsername ? `@${hostEntry.xUsername}` : null,
                tMeta.hostWallet,
                hostEntry?.xDisplayName
            ) || null;
        const lvl = clock
            ? {
                  levelNumber: clock.levelNumber,
                  sb: clock.sb,
                  bb: clock.bb,
                  ante: clock.ante,
              }
            : (() => {
                  const l = levelAt(tMeta.blindStructure, 1);
                  return {
                      levelNumber: l.level,
                      sb: l.sb,
                      bb: l.bb,
                      ante: l.ante,
                  };
              })();
        const fmtChip = compact
            ? compactChips
            : (v: number) => v.toLocaleString('en-US');
        const anteSuffix = lvl.ante > 0 ? ` (${fmtChip(lvl.ante)}A)` : '';
        const levelLabel = compact ? `L${lvl.levelNumber}` : `LVL ${lvl.levelNumber}`;
        // On a rest break the level/blinds are frozen — surface the break instead
        // of the blind line so the watermark matches the in-game break banner.
        const configText = clock?.onBreak
            ? 'NLH · ON BREAK'
            : `NLH · ${levelLabel} · ${fmtChip(lvl.sb)}/${fmtChip(
                  lvl.bb
              )}${anteSuffix}`;
        const playersLine =
            live?.playersActive != null
                ? compact
                    ? `${live.playersActive.toLocaleString(
                          'en-US'
                      )}/${tMeta.registeredCount.toLocaleString('en-US')} LEFT`
                    : `${live.playersActive.toLocaleString(
                          'en-US'
                      )} OF ${tMeta.registeredCount.toLocaleString('en-US')} LEFT`
                : null;
        return {
            configText: configText.toUpperCase(),
            playersLine,
            freePlay: tMeta.isFreePlay,
            chain: tMeta.isFreePlay ? undefined : tMeta.chain,
            hostLabel,
            hostExplorerUrl: tMeta.hostWallet
                ? explorerAddressUrl(tMeta.chain, tMeta.hostWallet)
                : null,
        };
    }, [tMeta, live?.clock, live?.playersActive, live?.leaderboard, compact]);

    const cashConfigText = useMemo(() => {
        if (!config) return null;
        const parts: string[] = [];
        if (config.sb != null && config.bb != null) {
            parts.push(
                `NLH - ${formatBlinds(config.sb)}/${formatBlinds(config.bb)}`
            );
        }
        if (config.maxBuyIn != null) {
            parts.push(
                `${compact ? 'Max' : 'Max Buy-In'} ${format(config.maxBuyIn)}`
            );
        }
        return parts.join(' • ');
    }, [config, format, formatBlinds, compact]);

    const cashChain = useMemo(() => {
        const configWithCrypto = config as ConfigWithCrypto;
        if (!config || !configWithCrypto.crypto || !configWithCrypto.chain)
            return null;
        return configWithCrypto.chain;
    }, [config]);

    const cashHostLabel = useMemo(() => {
        if (!config) return null;
        const players = appState.game?.players;
        // Prefer the host's X display name (#340), then their @handle, matched off
        // the seated players by wallet (crypto) or session (free play). Falls back to
        // the bare wallet / session id when the host isn't seated or hasn't linked X.
        if (config.ownerAddress) {
            const owner = players?.find(
                (p) =>
                    p.address?.toLowerCase() ===
                    config.ownerAddress?.toLowerCase()
            );
            return (
                owner?.xDisplayName?.trim() ||
                owner?.username?.trim() ||
                shortAddr(config.ownerAddress)
            );
        }
        if (config.ownerSessionUUID) {
            const owner = players?.find(
                (p) => p.uuid === config.ownerSessionUUID
            );
            if (owner?.xDisplayName?.trim()) return owner.xDisplayName.trim();
            if (owner?.username) return owner.username;
            const uid = config.ownerSessionUUID;
            return `${uid.slice(0, 4)}...${uid.slice(-4)}`;
        }
        return null;
    }, [config, appState.game?.players]);

    const cashHostExplorerUrl = useMemo(() => {
        const configWithCrypto = config as ConfigWithCrypto | undefined;
        if (!configWithCrypto?.ownerAddress) return null;
        return explorerAddressUrl(
            configWithCrypto.chain,
            configWithCrypto.ownerAddress
        );
    }, [config]);

    // Resolve the surface (tournament wins when present).
    const configText = tournament ? tournament.configText : cashConfigText;
    const chain = tournament ? tournament.chain ?? null : cashChain;
    const hostLabel = tournament ? tournament.hostLabel : cashHostLabel;
    const hostExplorerUrl = tournament
        ? tournament.hostExplorerUrl
        : cashHostExplorerUrl;
    const playersLine = tournament?.playersLine ?? null;
    const freePlay = tournament?.freePlay ?? false;
    // The FiUser icon already reads as "host"; drop the word on narrow screens.
    const hostText =
        tournament && !compact && hostLabel ? `Host ${hostLabel}` : hostLabel;

    // Tournament wayfinding back link: returns to the tournament details page and
    // doubles as the "which table am I on" indicator. Cash tables no longer show a
    // back link here; the shared navbar Home button owns "return to the lobby" for
    // both surfaces (dedupe). We trust the route slug so the link (and the table
    // number) appear even before the live meta seed arrives.
    const isTournamentSurface = !!tournament || tourTableMatch != null;
    const tournamentId = live?.tournamentId ?? routeTournamentId;
    const backLink =
        isTournamentSurface && tournamentId != null
            ? {
                  href: `/tournament/${tournamentId}`,
                  label: tableNumber != null ? `TABLE ${tableNumber}` : 'TOURNAMENT',
                  ariaLabel:
                      tableNumber != null
                          ? `You're on table ${tableNumber} — back to tournament details`
                          : 'Back to tournament details',
              }
            : null;

    if (!configText && !chain && !freePlay && !backLink) return null;

    return (
        <Box
            position="absolute"
            bottom={{ base: 'calc(100% + 4px)', md: 'calc(100% + 8px)' }}
            left={0}
            maxW={{ base: '85%', sm: '88%', md: '100%' }}
            px={{ base: 2, md: 4 }}
            pointerEvents="none"
            zIndex={1}
        >
            <Flex direction="column" gap={{ base: 0.5, md: 1 }}>
                {backLink && (
                    // Tournament wayfinding chip: a tappable tag (trophy = the
                    // tournament, trailing chevron = "opens") that stands apart
                    // from the read-only config lines below. The semi-opaque
                    // navy pill is its own contrast carrier, so no text halo.
                    <Link
                        as={NextLink}
                        href={backLink.href}
                        aria-label={backLink.ariaLabel}
                        pointerEvents="auto"
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        width="fit-content"
                        position="relative"
                        color={WM_INK}
                        fontSize={{ base: '10px', sm: '12px', md: '13px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="bold"
                        letterSpacing="0.06em"
                        minW={0}
                        bg="rgba(6,10,24,0.44)"
                        border="1px solid rgba(244,246,251,0.20)"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        transition="background-color 80ms ease, border-color 80ms ease"
                        _after={WM_HIT_SLOP}
                        _hover={{
                            bg: 'rgba(6,10,24,0.60)',
                            borderColor: 'rgba(244,246,251,0.34)',
                        }}
                    >
                        <Icon
                            as={FaTrophy}
                            boxSize={{ base: '10px', md: '11px' }}
                            flexShrink={0}
                        />
                        <Text as="span" color={WM_INK} noOfLines={1}>
                            {backLink.label}
                        </Text>
                        <Icon
                            as={FiChevronRight}
                            boxSize={{ base: '12px', md: '13px' }}
                            flexShrink={0}
                            opacity={0.7}
                        />
                    </Link>
                )}
                {configText && (
                    <Text
                        color={WM_INK}
                        fontSize={{ base: '10px', sm: '12px', md: '13px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        noOfLines={1}
                        sx={{ textShadow: WM_HALO }}
                    >
                        {configText}
                    </Text>
                )}
                {playersLine && (
                    <Text
                        color={WM_INK_PLAYERS}
                        fontSize={{ base: '9px', sm: '11px', md: '12px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="semibold"
                        letterSpacing="0.06em"
                        noOfLines={1}
                        sx={{
                            fontVariantNumeric: 'tabular-nums',
                            textShadow: WM_HALO,
                        }}
                    >
                        {playersLine}
                    </Text>
                )}
                {freePlay ? (
                    <Text
                        color={WM_INK_FREE}
                        fontSize={{ base: '9px', sm: '11px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        noOfLines={1}
                        sx={{ textShadow: WM_HALO }}
                    >
                        {compact ? 'FREE PLAY' : 'FREE PLAY · NO REAL VALUE'}
                    </Text>
                ) : (
                    chain && <ChainBadge chain={chain} size="sm" onDark />
                )}
                {hostLabel && (
                    <Flex align="center" gap={1.5} minW={0}>
                        <Icon
                            as={FiUser}
                            boxSize={{ base: '11px', md: '14px' }}
                            color={WM_INK_HOST}
                            flexShrink={0}
                            sx={{ filter: WM_ICON_HALO }}
                        />
                        {hostExplorerUrl ? (
                            <Link
                                href={hostExplorerUrl}
                                isExternal
                                pointerEvents="auto"
                                position="relative"
                                color={WM_INK_HOST}
                                fontSize={{
                                    base: '9px',
                                    sm: '11px',
                                    md: '12px',
                                }}
                                lineHeight={{ base: 1.15, md: 1.2 }}
                                fontWeight="medium"
                                letterSpacing="0.04em"
                                noOfLines={1}
                                minW={0}
                                transition="color 80ms ease"
                                sx={{ textShadow: WM_HALO }}
                                _after={WM_HIT_SLOP}
                                _hover={{
                                    color: WM_INK,
                                    textDecoration: 'underline',
                                    textDecorationThickness: '1.5px',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                {hostText}
                            </Link>
                        ) : (
                            <Text
                                color={WM_INK_HOST}
                                fontSize={{
                                    base: '9px',
                                    sm: '11px',
                                    md: '12px',
                                }}
                                lineHeight={{ base: 1.15, md: 1.2 }}
                                fontWeight="medium"
                                letterSpacing="0.04em"
                                noOfLines={1}
                                minW={0}
                                sx={{ textShadow: WM_HALO }}
                            >
                                {hostText}
                            </Text>
                        )}
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default GameConfigWatermark;
