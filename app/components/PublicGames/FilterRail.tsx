'use client';

import {
    Box,
    Flex,
    HStack,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Text,
} from '@chakra-ui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiSliders, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import RailChip from './RailChip';
import type {
    FilterValue,
    StakeFilter as StakeFilterValue,
    SortKey,
    SortConfig,
} from './types';

const MotionBox = motion(Box);

const TYPE_OPTIONS: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'crypto', label: 'USDC' },
    { value: 'free', label: 'Free Play' },
];

const STAKE_OPTIONS: { value: StakeFilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'micro', label: 'Micro' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
];

const SORTS: { key: SortKey; label: string }[] = [
    { key: 'blinds', label: 'Stakes' },
    { key: 'table', label: 'Table' },
    { key: 'seats', label: 'Seats' },
];

interface FilterRailProps {
    /** The real, filter-scoped table count. Rendered on the ACTIVE type chip only. */
    count: number | null;
    filter: FilterValue;
    onFilterChange: (f: FilterValue) => void;
    stake: StakeFilterValue;
    onStakeChange: (s: StakeFilterValue) => void;
    sortConfig: SortConfig;
    onSortChange: (key: SortKey) => void;
}

// The Rail — one warm filter line docked onto the lip of the list panel. Type is
// the primary axis (All / USDC / Free Play); the stake tiers deal in only under
// USDC, so Free Play and real-money never share an axis. Sort folds into a mobile
// menu (desktop sorts via the column header). Honest counts: active chip only.
export default function FilterRail({
    count,
    filter,
    onFilterChange,
    stake,
    onStakeChange,
    sortConfig,
    onSortChange,
}: FilterRailProps) {
    const reduce = useReducedMotion();
    const sortTouched = !(sortConfig.key === 'seats' && sortConfig.direction === 'desc');

    const scrollHide = {
        '::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    } as const;

    return (
        <Box borderBottom="1px solid" borderColor="border.pillNeutral">
            <Flex
                align="center"
                gap={2}
                px={{ base: 3, md: 5 }}
                py={{ base: 2, md: 2.5 }}
            >
                <HStack
                    role="group"
                    aria-label="Filter by table type"
                    spacing={1}
                    minW={0}
                    overflowX="auto"
                    sx={scrollHide}
                >
                    {TYPE_OPTIONS.map((o) => (
                        <RailChip
                            key={o.value}
                            label={o.label}
                            active={filter === o.value}
                            count={filter === o.value ? count ?? undefined : undefined}
                            onSelect={() => onFilterChange(o.value)}
                            tone={o.value === 'crypto' ? 'usdc' : 'green'}
                        />
                    ))}
                </HStack>
                <Spacer />
                <Menu placement="bottom-end" autoSelect={false}>
                    <MenuButton
                        as={IconButton}
                        aria-label={
                            sortTouched
                                ? 'Sort tables (custom sort active)'
                                : 'Sort tables'
                        }
                        icon={
                            <Box position="relative">
                                <Icon as={FiSliders} boxSize="16px" />
                                {sortTouched && (
                                    <Box
                                        position="absolute"
                                        top="-2px"
                                        right="-3px"
                                        w="6px"
                                        h="6px"
                                        borderRadius="full"
                                        bg="brand.green"
                                    />
                                )}
                            </Box>
                        }
                        variant="tactileGhost"
                        size="sm"
                        display={{ base: 'inline-flex', md: 'none' }}
                        flexShrink={0}
                    />
                    <MenuList minW="180px">
                        {SORTS.map((s) => {
                            const active = sortConfig.key === s.key;
                            const dirIcon =
                                active && sortConfig.direction === 'desc'
                                    ? FiChevronDown
                                    : FiChevronUp;
                            return (
                                <MenuItem
                                    key={s.key}
                                    onClick={() => onSortChange(s.key)}
                                    fontWeight={active ? 'bold' : 'medium'}
                                >
                                    <Flex w="full" align="center" justify="space-between">
                                        <Text>{s.label}</Text>
                                        {active && (
                                            <Icon
                                                as={dirIcon}
                                                boxSize="14px"
                                                color="brand.green"
                                            />
                                        )}
                                    </Flex>
                                </MenuItem>
                            );
                        })}
                    </MenuList>
                </Menu>
            </Flex>

            {/* Stake tiers deal in only under USDC — the one signature motion beat. */}
            <AnimatePresence initial={false}>
                {filter === 'crypto' && (
                    <MotionBox
                        key="stake-subrail"
                        overflow="hidden"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Flex
                            align="center"
                            gap={2}
                            px={{ base: 3, md: 5 }}
                            pb={{ base: 2, md: 2.5 }}
                            borderTop="1px solid"
                            borderColor="border.pillNeutral"
                            pt={{ base: 2, md: 2.5 }}
                        >
                            <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="0.10em"
                                textTransform="uppercase"
                                color="text.muted"
                                flexShrink={0}
                            >
                                Stakes
                            </Text>
                            <HStack
                                role="group"
                                aria-label="Filter by stake"
                                spacing={1}
                                minW={0}
                                overflowX="auto"
                                sx={scrollHide}
                            >
                                {STAKE_OPTIONS.map((o) => (
                                    <RailChip
                                        key={o.value}
                                        label={o.label}
                                        active={stake === o.value}
                                        onSelect={() => onStakeChange(o.value)}
                                        tone="usdc"
                                    />
                                ))}
                            </HStack>
                        </Flex>
                    </MotionBox>
                )}
            </AnimatePresence>
        </Box>
    );
}
