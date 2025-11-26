'use client';

import { useContext, useMemo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

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

    if (!configText) return null;

    const uppercaseText = configText.toUpperCase();

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
            <Text
                color="text.secondary"
                fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                lineHeight={1.2}
                fontWeight="medium"
            >
                {uppercaseText}
            </Text>
        </Box>
    );
};

export default GameConfigWatermark;
