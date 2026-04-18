'use client';
import React from 'react';
import { HStack, Image, Text, Box } from '@chakra-ui/react';

interface StakesChipProps {
    sb: number;
    bb: number;
    seatId?: number;
    isCrypto: boolean;
    chain?: string;
}

const CHIPS_PER_USDC = 100;

const getChainLogo = (chain?: string): string | null => {
    if (!chain) return null;
    const c = chain.toLowerCase();
    if (c === 'base' || c === 'base sepolia' || c === 'base-sepolia')
        return '/networkLogos/base-logo.png';
    if (c === 'arbitrum') return '/networkLogos/arbitrum-logo.png';
    if (c === 'optimism') return '/networkLogos/optimism-logo.png';
    if (c === 'solana') return '/networkLogos/solana-logo.png';
    return null;
};

const formatBlind = (chips: number, isCrypto: boolean): string => {
    if (isCrypto) {
        const dollars = chips / CHIPS_PER_USDC;
        if (dollars >= 100) return '$' + Math.round(dollars).toLocaleString('en-US');
        if (dollars >= 10) return '$' + dollars.toFixed(0);
        return '$' + dollars.toFixed(2);
    }
    return chips.toLocaleString('en-US');
};

const Dot = () => (
    <Text
        as="span"
        fontSize="xs"
        color="text.muted"
        opacity={0.5}
        mx={1.5}
        userSelect="none"
    >
        ·
    </Text>
);

const StakesChip: React.FC<StakesChipProps> = ({
    sb,
    bb,
    seatId,
    isCrypto,
    chain,
}) => {
    if (!sb || !bb) return null;

    const chainLogo = getChainLogo(chain);
    const stakesLabel = `NLH ${formatBlind(sb, isCrypto)}/${formatBlind(bb, isCrypto)}`;

    return (
        <HStack
            spacing={0}
            justify="center"
            align="center"
            flexWrap="wrap"
            rowGap={0}
        >
            <Text
                fontSize="xs"
                fontWeight="bold"
                color="text.secondary"
                letterSpacing="0.02em"
                textTransform="uppercase"
                whiteSpace="nowrap"
            >
                {stakesLabel}
            </Text>
            {seatId !== undefined && (
                <>
                    <Dot />
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="text.secondary"
                        letterSpacing="0.02em"
                        textTransform="uppercase"
                        whiteSpace="nowrap"
                    >
                        Seat {seatId}
                    </Text>
                </>
            )}
            {isCrypto && chain && (
                <>
                    <Dot />
                    <HStack spacing={1}>
                        {chainLogo && (
                            <Box boxSize="12px" flexShrink={0}>
                                <Image
                                    src={chainLogo}
                                    alt={chain}
                                    w="100%"
                                    h="100%"
                                    objectFit="contain"
                                />
                            </Box>
                        )}
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="text.secondary"
                            letterSpacing="0.02em"
                            textTransform="uppercase"
                            whiteSpace="nowrap"
                        >
                            {chain}
                        </Text>
                    </HStack>
                </>
            )}
        </HStack>
    );
};

export default StakesChip;
