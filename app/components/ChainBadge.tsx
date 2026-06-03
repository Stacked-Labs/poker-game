'use client';

import { HStack, Image, Text, useColorModeValue } from '@chakra-ui/react';

// Official Base brand lockup (the word "Base" set in Base Sans, as vector art) +
// the blue square symbol. Sourced from base/brand-kit, light/dark variants.
// Using the wordmark SVG gives us Base's real typography without embedding the
// (proprietary, unlicensed-for-us) Base Sans font.

const HEIGHTS = { sm: '16px', md: '20px' } as const;

const OTHER_CHAIN_LOGOS: Record<string, string> = {
    arbitrum: '/networkLogos/arbitrum-logo.png',
    optimism: '/networkLogos/optimism-logo.png',
    solana: '/networkLogos/solana-logo.png',
    ethereum: '/networkLogos/eth-logo.png',
    eth: '/networkLogos/eth-logo.png',
};

export interface ChainBadgeProps {
    /** Chain id, e.g. 'base', 'base-sepolia', 'arbitrum'. */
    chain?: string | null;
    size?: 'sm' | 'md';
    /** 'lockup' shows the square + "Base" wordmark; 'symbol' shows the square only. */
    variant?: 'lockup' | 'symbol';
    /** Show a "Testnet" tag next to Base on Sepolia. Default true. */
    showTestnet?: boolean;
}

export default function ChainBadge({
    chain,
    size = 'sm',
    variant = 'lockup',
    showTestnet = true,
}: ChainBadgeProps) {
    const c = (chain ?? '').toLowerCase();
    const isBaseMainnet = c === 'base' || c === 'base-mainnet';
    const isBaseSepolia = c.includes('sepolia');
    const isBase = isBaseMainnet || isBaseSepolia;

    const lockupSrc = useColorModeValue(
        '/networkLogos/base-lockup-2color.svg',
        '/networkLogos/base-lockup-white.svg'
    );
    const symbolSrc = useColorModeValue(
        '/networkLogos/base-square-blue.svg',
        '/networkLogos/base-square-white.svg'
    );
    const testnetBg = useColorModeValue(
        'rgba(237, 137, 54, 0.14)',
        'rgba(237, 137, 54, 0.22)'
    );
    const testnetFg = useColorModeValue('orange.600', 'orange.300');

    const h = HEIGHTS[size];

    if (isBase) {
        const isSymbol = variant === 'symbol';
        const src = isSymbol ? symbolSrc : lockupSrc;
        const label = isBaseSepolia ? 'Base Sepolia' : 'Base';
        return (
            <HStack spacing={1.5} minW={0}>
                <Image
                    src={src}
                    alt={label}
                    h={h}
                    w="auto"
                    loading="lazy"
                    flexShrink={0}
                />
                {isBaseSepolia && showTestnet && (
                    <Text
                        bg={testnetBg}
                        color={testnetFg}
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        px={1.5}
                        py="1px"
                        borderRadius="full"
                        lineHeight="1.4"
                        whiteSpace="nowrap"
                        flexShrink={0}
                    >
                        Testnet
                    </Text>
                )}
            </HStack>
        );
    }

    // Other known chains: logo (if available) + plain label in our type.
    const logo = OTHER_CHAIN_LOGOS[c];
    const label = chain ? chain.charAt(0).toUpperCase() + chain.slice(1) : null;
    if (!label) return null;

    return (
        <HStack spacing={1} minW={0}>
            {logo && (
                <Image
                    src={logo}
                    alt=""
                    h={h}
                    w="auto"
                    borderRadius="3px"
                    loading="lazy"
                    flexShrink={0}
                />
            )}
            <Text
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.04em"
                color="text.secondary"
                noOfLines={1}
                minW={0}
            >
                {label}
            </Text>
        </HStack>
    );
}
