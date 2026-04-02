'use client';

import React from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
} from '@chakra-ui/react';

export interface UserStats {
    gamesCreated: number;
    gamesPlayed: number;
    handsPlayed?: number;
}

const defaultStats: UserStats = {
    gamesCreated: 0,
    gamesPlayed: 0,
};

interface StatItemProps {
    value: number | string;
    label: string;
    color: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, color }) => (
    <VStack spacing={0} flex={1} align="center">
        <Text
            fontSize="xl"
            fontWeight={800}
            color={color}
            lineHeight={1.2}
        >
            {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text
            fontSize="2xs"
            fontWeight="semibold"
            color="text.secondary"
            letterSpacing="0.08em"
            textTransform="uppercase"
            mt={0.5}
        >
            {label}
        </Text>
    </VStack>
);

const StatsSection = ({ stats = defaultStats }: { stats?: UserStats }) => {
    return (
        <HStack
            spacing={0}
            justify="center"
            width="100%"
            py={1}
        >
            <StatItem
                value={stats.gamesCreated}
                label="Tables"
                color="brand.green"
            />
            <Box
                w="1px"
                h="28px"
                bg="border.lightGray"
                opacity={0.6}
                _dark={{ opacity: 0.3 }}
            />
            <StatItem
                value={stats.gamesPlayed}
                label="Games"
                color="brand.pink"
            />
            {stats.handsPlayed != null && (
                <>
                    <Box
                        w="1px"
                        h="28px"
                        bg="border.lightGray"
                        opacity={0.6}
                        _dark={{ opacity: 0.3 }}
                    />
                    <StatItem
                        value={stats.handsPlayed}
                        label="Hands"
                        color="brand.yellow"
                    />
                </>
            )}
        </HStack>
    );
};

export default StatsSection;
