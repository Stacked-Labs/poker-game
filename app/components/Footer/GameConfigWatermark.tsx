'use client';

import { useContext, useMemo } from 'react';
import { Box, Text, Image, Flex, Link, Icon } from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';

interface ConfigWithCrypto {
    maxBuyIn: number;
    bb: number;
    sb: number;
    crypto?: boolean;
    chain?: string;
    ownerAddress?: string;
}

const GameConfigWatermark = () => {
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const { format, mode: displayMode } = useFormatAmount();
    const formatBlinds = useMemo(
        () => displayMode === 'bb'
            ? (v: number) => v.toLocaleString('en-US')
            : format,
        [displayMode, format]
    );

    const configText = useMemo(() => {
        if (!config) return null;

        const parts: string[] = [];

        if (config.sb != null && config.bb != null) {
            parts.push(`NLH - ${formatBlinds(config.sb)}/${formatBlinds(config.bb)}`);
        }

        if (config.maxBuyIn != null) {
            parts.push(`Max Buy-In ${format(config.maxBuyIn)}`);
        }

        return parts.join(' • ');
    }, [config, format, formatBlinds]);

    const chainInfo = useMemo(() => {
        const configWithCrypto = config as ConfigWithCrypto;
        if (!config || !configWithCrypto.crypto || !configWithCrypto.chain)
            return null;

        const getChainLogo = (chain: string) => {
            const chainLower = chain.toLowerCase();
            if (chainLower === 'base') return '/networkLogos/base-logo.png';
            if (chainLower === 'base sepolia')
                return '/networkLogos/base-logo.png';
            if (chainLower === 'base-sepolia')
                return '/networkLogos/base-logo.png';
            if (chainLower === 'arbitrum')
                return '/networkLogos/arbitrum-logo.png';
            if (chainLower === 'optimism')
                return '/networkLogos/optimism-logo.png';
            if (chainLower === 'solana') return '/networkLogos/solana-logo.png';
            return null;
        };

        return {
            name: configWithCrypto.chain,
            logo: getChainLogo(configWithCrypto.chain),
        };
    }, [config]);

    const hostLabel = useMemo(() => {
        if (!config) return null;
        if (config.ownerAddress) {
            const addr = config.ownerAddress;
            return `${addr.slice(0, 6)}...${addr.slice(-4)}`.toUpperCase();
        }
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

    const hostExplorerUrl = useMemo(() => {
        const configWithCrypto = config as ConfigWithCrypto | undefined;
        if (!configWithCrypto?.ownerAddress) return null;
        const chain = configWithCrypto.chain?.toLowerCase();
        if (chain === 'base') {
            return `https://basescan.org/address/${configWithCrypto.ownerAddress}`;
        }
        if (chain === 'base sepolia' || chain === 'base-sepolia') {
            return `https://sepolia.basescan.org/address/${configWithCrypto.ownerAddress}`;
        }
        return null;
    }, [config]);

    if (!configText && !chainInfo) return null;

    const uppercaseText = configText ? configText.toUpperCase() : '';

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
                    >
                        {uppercaseText}
                    </Text>
                )}
                {chainInfo && (
                    <Flex align="center" gap={1.5}>
                        {chainInfo.logo && (
                            <Image
                                src={chainInfo.logo}
                                alt={`${chainInfo.name} logo`}
                                w={{ base: '12px', md: '14px' }}
                                h={{ base: '12px', md: '14px' }}
                                objectFit="contain"
                            />
                        )}
                        <Text
                            color="text.muted"
                            fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                            lineHeight={1.2}
                            fontWeight="medium"
                            letterSpacing="0.04em"
                        >
                            {chainInfo.name.toUpperCase()}
                        </Text>
                    </Flex>
                )}
                {hostLabel && (
                    <Flex align="center" gap={1.5}>
                        <Icon
                            as={FiUser}
                            boxSize={{ base: '12px', md: '14px' }}
                            color="text.muted"
                        />
                        {hostExplorerUrl ? (
                            <Link
                                href={hostExplorerUrl}
                                isExternal
                                pointerEvents="auto"
                                color="text.muted"
                                fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                                lineHeight={1.2}
                                fontWeight="medium"
                                letterSpacing="0.04em"
                                transition="color 80ms ease"
                                _hover={{
                                    color: 'text.primary',
                                    textDecoration: 'underline',
                                    textDecorationThickness: '1.5px',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                {hostLabel}
                            </Link>
                        ) : (
                            <Text
                                color="text.muted"
                                fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                                lineHeight={1.2}
                                fontWeight="medium"
                                letterSpacing="0.04em"
                            >
                                {hostLabel}
                            </Text>
                        )}
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default GameConfigWatermark;
