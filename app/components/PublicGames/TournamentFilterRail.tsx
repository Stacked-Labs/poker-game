'use client';

import {
    Box,
    Flex,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
} from '@chakra-ui/react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import RailChip from './RailChip';
import { HIDE_X_SCROLLBAR_SX } from './tournamentFormat';
import { accentFor, TYPE_IDENTITY } from './tournamentDefaults';
import type { TemplateName } from './blindStructures';

export type StatusFilter = 'all' | 'open' | 'live';
export type PlayFilter = 'all' | 'real' | 'free';
export type SpeedFilter = 'all' | TemplateName;
export type TournamentSort = 'soon' | 'gtd' | 'filling' | 'buyin';

export const SORT_LABELS: Record<TournamentSort, string> = {
    soon: 'Starts soonest',
    gtd: 'Biggest GTD',
    filling: 'Filling fastest',
    buyin: 'Lowest buy-in',
};

const SPEEDS: TemplateName[] = ['hyper', 'turbo', 'regular', 'deep'];

export interface TournamentFilterRailProps {
    status: StatusFilter;
    onStatus: (v: StatusFilter) => void;
    play: PlayFilter;
    onPlay: (v: PlayFilter) => void;
    speed: SpeedFilter;
    onSpeed: (v: SpeedFilter) => void;
    sort: TournamentSort;
    onSort: (v: TournamentSort) => void;
    /** Honest result count, shown on the active "All" chip. */
    resultCount: number;
}

// The tournaments tab's filter + sort rail — the parity the cash tab already has.
// Poker-chip RailChips for availability / play-money / speed, plus a compact sort
// menu. Belongs above the tournament grid.
export default function TournamentFilterRail({
    status,
    onStatus,
    play,
    onPlay,
    speed,
    onSpeed,
    sort,
    onSort,
    resultCount,
}: TournamentFilterRailProps) {
    return (
        <Box
            as="section"
            aria-label="Filter and sort tournaments"
            borderWidth="1px"
            borderColor="border.pillNeutral"
            borderRadius="14px"
            bg="card.white"
            _dark={{ bg: 'card.darkNavy' }}
            px={{ base: 2.5, md: 3 }}
            py={2.5}
        >
            <Flex align="center" gap={2} flexWrap="wrap">
                <HStack
                    spacing={1}
                    role="radiogroup"
                    aria-label="Availability"
                    flexShrink={0}
                >
                    <RailChip
                        label="All"
                        count={status === 'all' ? resultCount : undefined}
                        active={status === 'all'}
                        onSelect={() => onStatus('all')}
                    />
                    <RailChip
                        label="Open"
                        active={status === 'open'}
                        onSelect={() => onStatus('open')}
                    />
                    <RailChip
                        label="Live"
                        active={status === 'live'}
                        onSelect={() => onStatus('live')}
                    />
                </HStack>

                <Box
                    w="1px"
                    h="22px"
                    bg="border.pillNeutral"
                    flexShrink={0}
                    display={{ base: 'none', sm: 'block' }}
                />

                <HStack spacing={1} flexShrink={0}>
                    <RailChip
                        label="USDC"
                        tone="usdc"
                        active={play === 'real'}
                        onSelect={() => onPlay(play === 'real' ? 'all' : 'real')}
                    />
                    <RailChip
                        label="Free Play"
                        active={play === 'free'}
                        onSelect={() => onPlay(play === 'free' ? 'all' : 'free')}
                    />
                </HStack>

                <Box ml={{ base: 0, md: 'auto' }} flexShrink={0}>
                    <SortMenu sort={sort} onSort={onSort} />
                </Box>
            </Flex>

            <HStack
                spacing={1}
                mt={2}
                pt={2}
                borderTopWidth="1px"
                borderColor="border.pillNeutral"
                overflowX="auto"
                role="radiogroup"
                aria-label="Speed"
                sx={HIDE_X_SCROLLBAR_SX}
            >
                <RailChip
                    label="All speeds"
                    active={speed === 'all'}
                    onSelect={() => onSpeed('all')}
                />
                {SPEEDS.map((s) => {
                    const a = accentFor(s);
                    return (
                        <RailChip
                            key={s}
                            leftGlyph={
                                <Box
                                    as="span"
                                    color={a.inkLight}
                                    _dark={{ color: a.inkDark }}
                                    aria-hidden
                                >
                                    {TYPE_IDENTITY[s].suit}
                                </Box>
                            }
                            label={TYPE_IDENTITY[s].label}
                            active={speed === s}
                            onSelect={() => onSpeed(speed === s ? 'all' : s)}
                        />
                    );
                })}
            </HStack>
        </Box>
    );
}

function SortMenu({
    sort,
    onSort,
}: {
    sort: TournamentSort;
    onSort: (v: TournamentSort) => void;
}) {
    return (
        <Menu placement="bottom-end" autoSelect={false}>
            <MenuButton
                as={Box}
                role="button"
                tabIndex={0}
                cursor="pointer"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                h={{ base: '44px', md: '36px' }}
                px={3}
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.pillNeutral"
                bg="transparent"
                fontSize="xs"
                fontWeight="semibold"
                color="text.secondary"
                whiteSpace="nowrap"
                transition="background-color 120ms ease, color 120ms ease"
                _hover={{ color: 'text.primary', bg: 'bg.pillNeutral' }}
                _focusVisible={{ boxShadow: 'focus.ring', outline: 'none' }}
            >
                <Text as="span" color="text.muted" display={{ base: 'none', md: 'inline' }}>
                    Sort:
                </Text>
                <Text as="span" color="text.secondary">
                    {SORT_LABELS[sort]}
                </Text>
                <Icon as={FiChevronDown} boxSize="14px" />
            </MenuButton>
            <MenuList
                bg="card.white"
                _dark={{ bg: 'card.darkNavy', borderColor: 'border.pillNeutral' }}
                borderColor="border.pillNeutral"
                borderRadius="12px"
                boxShadow="card.lift"
                minW="200px"
                py={1}
            >
                {(Object.keys(SORT_LABELS) as TournamentSort[]).map((key) => (
                    <MenuItem
                        key={key}
                        onClick={() => onSort(key)}
                        bg="transparent"
                        color="text.primary"
                        fontSize="sm"
                        fontWeight={sort === key ? 'bold' : 'medium'}
                        _hover={{ bg: 'bg.pillNeutral' }}
                        _focus={{ bg: 'bg.pillNeutral' }}
                    >
                        <Flex align="center" justify="space-between" w="full">
                            {SORT_LABELS[key]}
                            {sort === key && (
                                <Icon as={FiCheck} boxSize="14px" color="brand.green" />
                            )}
                        </Flex>
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
}
