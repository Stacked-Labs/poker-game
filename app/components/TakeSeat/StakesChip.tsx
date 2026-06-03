'use client';
import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import ChainBadge from '../ChainBadge';

interface StakesChipProps {
    sb: number;
    bb: number;
    seatId?: number;
    isCrypto: boolean;
    chain?: string;
}

const CHIPS_PER_USDC = 100;

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
                    <ChainBadge chain={chain} size="sm" variant="symbol" />
                </>
            )}
        </HStack>
    );
};

export default StakesChip;
