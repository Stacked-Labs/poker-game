'use client';

import { Box, HStack, Text, Icon, Button } from '@chakra-ui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import type { SortKey, SortConfig } from './types';

interface SortHeaderProps {
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
    ruleColor: string;
}

function SortHeaderButton({
    label,
    sortKey,
    sortConfig,
    onSortChange,
    align = 'left',
}: {
    label: string;
    sortKey: SortKey;
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
    align?: 'left' | 'right';
}) {
    const active = sortConfig.key === sortKey;
    const icon = active && sortConfig.direction === 'desc' ? FiChevronDown : FiChevronUp;
    return (
        <Button
            variant="unstyled"
            onClick={() => onSortChange(sortKey)}
            h="20px"
            px={0}
            color={active ? 'brand.green' : 'text.muted'}
            _hover={{ color: 'brand.green' }}
            _active={{ color: 'brand.greenDark' }}
            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), color 80ms ease"
            display="inline-flex"
            justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}
            w="full"
        >
            <HStack spacing={1} align="center">
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                >
                    {label}
                </Text>
                <Icon
                    as={icon}
                    boxSize="11px"
                    opacity={active ? 1 : 0.35}
                />
            </HStack>
        </Button>
    );
}

export default function SortHeader({ sortConfig, onSortChange, ruleColor }: SortHeaderProps) {
    return (
        <HStack
            px={{ base: 4, md: 6 }}
            py={3}
            spacing={4}
            borderBottom="1px solid"
            borderColor={ruleColor}
            display={{ base: 'none', md: 'flex' }}
        >
            <Box w="10px" />
            <Box flex="2.2">
                <SortHeaderButton label="Table" sortKey="table" sortConfig={sortConfig} onSortChange={onSortChange} />
            </Box>
            <Box flex="1">
                <SortHeaderButton label="Blinds" sortKey="blinds" sortConfig={sortConfig} onSortChange={onSortChange} align="right" />
            </Box>
            <Box flex="1.2">
                <SortHeaderButton label="Seats" sortKey="seats" sortConfig={sortConfig} onSortChange={onSortChange} />
            </Box>
            <Box w="48px">
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="text.muted"
                    textAlign="right"
                >
                    Age
                </Text>
            </Box>
        </HStack>
    );
}
