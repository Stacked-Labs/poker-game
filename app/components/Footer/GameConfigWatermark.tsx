'use client';

import { useContext, useMemo } from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';

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
    const { format, mode: displayMode } = useFormatAmount();
    const formatBlinds = displayMode === 'bb'
        ? (v: number) => v.toLocaleString('en-US')
        : format;

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
