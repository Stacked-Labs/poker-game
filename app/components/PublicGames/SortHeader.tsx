'use client';

import { Box, Grid, HStack, Text, Icon, Button } from '@chakra-ui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import type { SortKey, SortConfig } from './types';

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

interface SortHeaderProps {
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
}

function SortHeaderButton({
    label,
    sortKey,
    sortConfig,
    onSortChange,
}: {
    label: string;
    sortKey: SortKey;
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
}) {
    const isActive = sortConfig.key === sortKey;
    const icon = isActive && sortConfig.direction === 'desc' ? FiChevronDown : FiChevronUp;

    return (
        <Button
            variant="unstyled"
            onClick={() => onSortChange(sortKey)}
            h="20px"
            px={0}
            border="none"
            bg="transparent"
            color="text.primary"
            _hover={{ color: 'brand.green' }}
            _dark={{
                color: 'text.gray600',
                _hover: { color: 'brand.green' },
            }}
            transition={TRANSITION}
        >
            <HStack spacing={1} align="center">
                <Text
                    fontSize="2xs"
                    textTransform="uppercase"
                    letterSpacing="0.16em"
                    fontWeight="bold"
                    color={isActive ? 'brand.green' : 'text.primary'}
                    _dark={{
                        color: isActive ? 'brand.green' : 'text.gray600',
                    }}
                    position="relative"
                    _after={isActive ? {
                        content: '""',
                        position: 'absolute',
                        bottom: '-3px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        w: '4px',
                        h: '4px',
                        borderRadius: 'full',
                        bg: 'brand.green',
                        boxShadow: '0 0 6px rgba(54, 163, 123, 0.5)',
                    } : undefined}
                    transition="color 0.15s ease"
                >
                    {label}
                </Text>
                <Icon
                    as={icon}
                    boxSize="12px"
                    color={isActive ? 'brand.green' : 'text.primary'}
                    opacity={isActive ? 0.9 : 0.35}
                    _dark={{
                        color: isActive ? 'brand.green' : 'text.gray600',
                    }}
                    transition="all 0.15s ease"
                />
            </HStack>
        </Button>
    );
}

export default function SortHeader({ sortConfig, onSortChange }: SortHeaderProps) {
    return (
        <>
            {/* Mobile sort row */}
            <HStack
                display={{ base: 'flex', md: 'none' }}
                spacing={4}
                px={3}
                py={2}
                bg="rgba(12, 21, 49, 0.03)"
                _dark={{ bg: 'rgba(255, 255, 255, 0.03)' }}
            >
                <SortHeaderButton label="Table" sortKey="table" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortHeaderButton label="Blinds" sortKey="blinds" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortHeaderButton label="Seats" sortKey="seats" sortConfig={sortConfig} onSortChange={onSortChange} />
            </HStack>

            {/* Desktop sort header */}
            <Grid
                display={{ base: 'none', md: 'grid' }}
                templateColumns="24px 2.2fr 1fr 0.8fr 20px"
                gap={4}
                alignItems="center"
                px={6}
                py={3}
                bg="rgba(12, 21, 49, 0.03)"
                _dark={{ bg: 'rgba(255, 255, 255, 0.03)' }}
            >
                <Box />
                <SortHeaderButton label="Table" sortKey="table" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortHeaderButton label="Blinds" sortKey="blinds" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortHeaderButton label="Seats" sortKey="seats" sortConfig={sortConfig} onSortChange={onSortChange} />
                <Box />
            </Grid>
        </>
    );
}
