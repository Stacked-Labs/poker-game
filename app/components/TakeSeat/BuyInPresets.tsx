'use client';
import React, { useMemo } from 'react';
import { HStack, Text, VStack, Box } from '@chakra-ui/react';
import { buildBuyInPresets, BuyInPreset } from '@/app/lib/takeSeat/presets';

interface BuyInPresetsProps {
    bb: number;
    maxBuyIn: number;
    walletBalanceChips: number | null;
    isCrypto: boolean;
    selectedChips: number | null;
    onSelect: (chips: number) => void;
    disabled?: boolean;
}

const PresetPill: React.FC<{
    preset: BuyInPreset;
    selected: boolean;
    onClick: () => void;
    disabled: boolean;
}> = ({ preset, selected, onClick, disabled }) => {
    const isDisabled = disabled || preset.disabled;
    const labelColor = selected
        ? 'white'
        : isDisabled
          ? 'text.muted'
          : 'text.secondary';
    const sublabelColor = selected ? 'whiteAlpha.800' : 'text.muted';
    return (
        <Box
            as="button"
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            flex="1"
            minW={0}
            px={2}
            py={2}
            borderRadius="xl"
            bg={selected ? 'brand.navy' : 'card.lightGray'}
            border="1.5px solid"
            borderColor={selected ? 'brand.navy' : 'transparent'}
            cursor={isDisabled ? 'not-allowed' : 'pointer'}
            opacity={isDisabled ? 0.45 : 1}
            transition="all 0.15s ease"
            _hover={
                !isDisabled && !selected
                    ? {
                          bg: 'card.white',
                          borderColor: 'brand.navy',
                          transform: 'translateY(-1px)',
                      }
                    : {}
            }
            _active={!isDisabled ? { transform: 'translateY(0)' } : {}}
        >
            <VStack spacing={0}>
                <Text
                    fontSize="sm"
                    fontWeight="bold"
                    letterSpacing="-0.01em"
                    noOfLines={1}
                    color={labelColor}
                >
                    {preset.label}
                </Text>
                {preset.sublabel && (
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        noOfLines={1}
                        color={sublabelColor}
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        {preset.sublabel}
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

const BuyInPresets: React.FC<BuyInPresetsProps> = ({
    bb,
    maxBuyIn,
    walletBalanceChips,
    isCrypto,
    selectedChips,
    onSelect,
    disabled = false,
}) => {
    const presets = useMemo(
        () =>
            buildBuyInPresets({ bb, maxBuyIn, walletBalanceChips, isCrypto }),
        [bb, maxBuyIn, walletBalanceChips, isCrypto]
    );

    if (presets.length === 0) return null;

    return (
        <HStack w="100%" spacing={2}>
            {presets.map((preset) => (
                <PresetPill
                    key={preset.key}
                    preset={preset}
                    selected={selectedChips === preset.chips && preset.chips > 0}
                    onClick={() => onSelect(preset.chips)}
                    disabled={disabled}
                />
            ))}
        </HStack>
    );
};

export default BuyInPresets;
