'use client';

import { useContext, useMemo } from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

interface ConfigWithCrypto {
    maxBuyIn: number;
    bb: number;
    sb: number;
    crypto?: boolean;
    chain?: string;
}

const GameConfigWatermark = () => {
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;

    const configText = useMemo(() => {
        if (!config) return null;

        const formatter = new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 2,
        });
        const formatValue = (value: number | string | null | undefined) => {
            if (value === null || value === undefined) {
                return null;
            }
            const numeric =
                typeof value === 'number' ? value : Number.parseFloat(value);
            if (Number.isNaN(numeric)) {
                return null;
            }
            return formatter.format(numeric);
        };

        const parts: string[] = [];
        const sb = formatValue(config.sb);
        const bb = formatValue(config.bb);
        const maxBuyIn = formatValue(config.maxBuyIn);

        const blindValues = [sb, bb].filter(Boolean).join('/');
        if (blindValues.length) {
            parts.push(`NLH - ${blindValues}`);
        }

        if (maxBuyIn) {
            parts.push(`Max Buy-In ${maxBuyIn}`);
        }

        return parts.join(' • ');
    }, [config]);

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
                        color="text.secondary"
                        fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                        lineHeight={1.2}
                        fontWeight="medium"
                    >
                        {uppercaseText}
                    </Text>
                )}
                {chainInfo && (
                    <Flex align="center" gap={1}>
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
                            color="text.secondary"
                            fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                            lineHeight={1.2}
                            fontWeight="medium"
                        >
                            {chainInfo.name.toUpperCase()}
                        </Text>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default GameConfigWatermark;
