'use client';

import { useContext, useMemo } from 'react';
import {
    Box,
    Text,
    Flex,
    Link,
    Icon,
    useColorModeValue,
    useBreakpointValue,
} from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
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

const GameConfigWatermark = () => {
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const live = appState.tournamentLive;
    const tMeta = live?.meta ?? null;
    const { format, mode: displayMode } = useFormatAmount();
    // brand.green is only ~2.2:1 on the light letterbox/footer surface (fails AA);
    // use the darker greenEdge in light mode, keep the brighter green in dark.
    const freePlayGreen = useColorModeValue('brand.greenEdge', 'brand.green');
    // Mobile-first: portrait phones get abbreviated, shorter copy so the watermark
    // doesn't bleed up into the hero's hole cards / seat HUD. SSR falls back to base.
    const compact = useBreakpointValue({ base: true, md: false }) ?? true;
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

    if (!configText && !chain && !freePlay) return null;

    return (
        <Box
            position="absolute"
            bottom={{ base: 'calc(100% + 4px)', md: 'calc(100% + 8px)' }}
            left={0}
            maxW={{ base: '70%', sm: '85%', md: '100%' }}
            px={{ base: 2, md: 4 }}
            pointerEvents="none"
            zIndex={1}
        >
            <Flex direction="column" gap={{ base: 0.5, md: 1 }}>
                {configText && (
                    <Text
                        color="text.primary"
                        fontSize={{ base: '10px', sm: '12px', md: '13px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="semibold"
                        letterSpacing="0.04em"
                        noOfLines={1}
                    >
                        {configText}
                    </Text>
                )}
                {playersLine && (
                    <Text
                        color="text.secondary"
                        fontSize={{ base: '9px', sm: '11px', md: '12px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="semibold"
                        letterSpacing="0.06em"
                        noOfLines={1}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {playersLine}
                    </Text>
                )}
                {freePlay ? (
                    <Text
                        color={freePlayGreen}
                        fontSize={{ base: '9px', sm: '11px' }}
                        lineHeight={{ base: 1.15, md: 1.2 }}
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        noOfLines={1}
                    >
                        {compact ? 'FREE PLAY' : 'FREE PLAY · NO REAL VALUE'}
                    </Text>
                ) : (
                    chain && <ChainBadge chain={chain} size="sm" />
                )}
                {hostLabel && (
                    <Flex align="center" gap={1.5} minW={0}>
                        <Icon
                            as={FiUser}
                            boxSize={{ base: '11px', md: '14px' }}
                            color="text.muted"
                            flexShrink={0}
                        />
                        {hostExplorerUrl ? (
                            <Link
                                href={hostExplorerUrl}
                                isExternal
                                pointerEvents="auto"
                                color="text.muted"
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
                                _hover={{
                                    color: 'text.primary',
                                    textDecoration: 'underline',
                                    textDecorationThickness: '1.5px',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                {hostText}
                            </Link>
                        ) : (
                            <Text
                                color="text.muted"
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
