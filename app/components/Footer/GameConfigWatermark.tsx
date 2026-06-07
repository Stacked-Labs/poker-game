'use client';

import { useContext, useMemo } from 'react';
import {
    Box,
    Text,
    Flex,
    Link,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
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
        const anteSuffix =
            lvl.ante > 0 ? ` (${lvl.ante.toLocaleString('en-US')}A)` : '';
        const configText = `NLH · LVL ${lvl.levelNumber} · ${lvl.sb.toLocaleString(
            'en-US'
        )}/${lvl.bb.toLocaleString('en-US')}${anteSuffix}`;
        const playersLine =
            live?.playersActive != null
                ? `${live.playersActive.toLocaleString(
                      'en-US'
                  )} OF ${tMeta.registeredCount.toLocaleString('en-US')} LEFT`
                : null;
        return {
            configText: configText.toUpperCase(),
            playersLine,
            freePlay: tMeta.isFreePlay,
            chain: tMeta.isFreePlay ? undefined : tMeta.chain,
            hostLabel: tMeta.hostWallet ? shortAddr(tMeta.hostWallet) : null,
            hostExplorerUrl: tMeta.hostWallet
                ? explorerAddressUrl(tMeta.chain, tMeta.hostWallet)
                : null,
        };
    }, [tMeta, live?.clock, live?.playersActive]);

    const cashConfigText = useMemo(() => {
        if (!config) return null;
        const parts: string[] = [];
        if (config.sb != null && config.bb != null) {
            parts.push(
                `NLH - ${formatBlinds(config.sb)}/${formatBlinds(config.bb)}`
            );
        }
        if (config.maxBuyIn != null) {
            parts.push(`Max Buy-In ${format(config.maxBuyIn)}`);
        }
        return parts.join(' • ');
    }, [config, format, formatBlinds]);

    const cashChain = useMemo(() => {
        const configWithCrypto = config as ConfigWithCrypto;
        if (!config || !configWithCrypto.crypto || !configWithCrypto.chain)
            return null;
        return configWithCrypto.chain;
    }, [config]);

    const cashHostLabel = useMemo(() => {
        if (!config) return null;
        if (config.ownerAddress) return shortAddr(config.ownerAddress);
        if (config.ownerSessionUUID) {
            const ownerPlayer = appState.game?.players.find(
                (p) => p.uuid === config.ownerSessionUUID
            );
            if (ownerPlayer?.username) return ownerPlayer.username;
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

    if (!configText && !chain && !freePlay) return null;

    return (
        <Box
            position="absolute"
            bottom={{ base: 'calc(100% + 4px)', md: 'calc(100% + 8px)' }}
            left={0}
            width="100%"
            px={{ base: 2, md: 4 }}
            pointerEvents="none"
            zIndex={1}
        >
            <Flex direction="column" gap={1}>
                {configText && (
                    <Text
                        color="text.primary"
                        fontSize={{ base: '11px', sm: '12px', md: '13px' }}
                        lineHeight={1.2}
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
                        fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                        lineHeight={1.2}
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
                        fontSize={{ base: '10px', sm: '11px' }}
                        lineHeight={1.2}
                        fontWeight="bold"
                        letterSpacing="0.08em"
                    >
                        FREE PLAY · NO REAL VALUE
                    </Text>
                ) : (
                    chain && <ChainBadge chain={chain} size="sm" />
                )}
                {hostLabel && (
                    <Flex align="center" gap={1.5} minW={0}>
                        <Icon
                            as={FiUser}
                            boxSize={{ base: '12px', md: '14px' }}
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
                                    base: '10px',
                                    sm: '11px',
                                    md: '12px',
                                }}
                                lineHeight={1.2}
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
                                {tournament ? `Host ${hostLabel}` : hostLabel}
                            </Link>
                        ) : (
                            <Text
                                color="text.muted"
                                fontSize={{
                                    base: '10px',
                                    sm: '11px',
                                    md: '12px',
                                }}
                                lineHeight={1.2}
                                fontWeight="medium"
                                letterSpacing="0.04em"
                                noOfLines={1}
                                minW={0}
                            >
                                {tournament ? `Host ${hostLabel}` : hostLabel}
                            </Text>
                        )}
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default GameConfigWatermark;
