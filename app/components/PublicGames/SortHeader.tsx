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
            aria-label={`Sort by ${label}`}
            aria-pressed={active}
            h="22px"
            px={0}
            border="none"
            color={active ? 'text.primary' : 'text.muted'}
            _hover={{ color: 'text.primary' }}
            _active={{ color: 'text.primary' }}
            _focus={{ boxShadow: 'none' }}
            _focusVisible={{ boxShadow: 'focus.ring', borderRadius: '4px' }}
            transition="color 120ms ease"
            display="inline-flex"
            justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}
            w="full"
        >
            <HStack
                spacing={1}
                align="center"
                pb="3px"
                borderBottom="2px solid"
                borderColor={active ? 'brand.green' : 'transparent'}
            >
                <Text
                    color="currentColor"
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                >
                    {label}
                </Text>
                <Icon
                    as={icon}
                    boxSize="11px"
                    opacity={active ? 1 : 0.3}
                    color={active ? 'brand.green' : 'currentColor'}
                />
            </HStack>
        </Button>
    );
}

// Desktop column header. Columns are stakes-led: the money is the anchor, the
// table identity (Host / name) second. Flex weights mirror PublicGameCard. The
// sorted column carries a green underline so it's unmissable.
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
            {/* aligns under the leading StatePill (LIVE/OPEN) */}
            <Box w="52px" flexShrink={0} />
            <Box flex="1.4">
                <SortHeaderButton label="Stakes" sortKey="blinds" sortConfig={sortConfig} onSortChange={onSortChange} />
            </Box>
            <Box flex="2.2">
                <SortHeaderButton label="Table" sortKey="table" sortConfig={sortConfig} onSortChange={onSortChange} />
            </Box>
            <Box flex="1.2">
                <SortHeaderButton label="Seats" sortKey="seats" sortConfig={sortConfig} onSortChange={onSortChange} />
            </Box>
            <Box w="48px">
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.12em"
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
