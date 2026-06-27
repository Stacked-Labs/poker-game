'use client';

import { forwardRef } from 'react';
import NextLink from 'next/link';
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    HStack,
    VStack,
    Text,
    Image,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { blo } from 'blo';
import { type PlayerSearchResult } from '@/app/hooks/server_actions';
import { playerDisplayName } from '@/app/utils/address';
import { tierFromString } from '@/app/components/Leaderboard/tierUtils';

export interface PlayerSearchViewProps {
    query: string;
    results: PlayerSearchResult[];
    loading: boolean;
    /** Whether the results dropdown is shown. */
    open: boolean;
    /** Keyboard-highlighted row index, or -1. */
    active: number;
    placeholder?: string;
    maxW?: string | object;
    listboxId?: string;
    onQueryChange: (value: string) => void;
    onFocus: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onRowMouseEnter: (i: number) => void;
    onRowClick: () => void;
}

// Presentational find-a-player search: the pill input + the live results dropdown.
// Pure props (no fetching/router) so every state is reviewable in Storybook.
const PlayerSearchView = forwardRef<HTMLDivElement, PlayerSearchViewProps>(
    function PlayerSearchView(
        {
            query,
            results,
            loading,
            open,
            active,
            placeholder = 'Search players…',
            maxW = '320px',
            listboxId = 'player-search-listbox',
            onQueryChange,
            onFocus,
            onKeyDown,
            onRowMouseEnter,
            onRowClick,
        },
        ref
    ) {
        return (
            <Box position="relative" w="100%" maxW={maxW} ref={ref}>
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="text.secondary" />
                    </InputLeftElement>
                    <Input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        variant="settings"
                        borderRadius="full"
                        role="combobox"
                        aria-label="Search players"
                        aria-expanded={open}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            active >= 0 ? `ps-opt-${active}` : undefined
                        }
                    />
                </InputGroup>

                {open && (
                    <Box
                        id={listboxId}
                        role="listbox"
                        aria-label="Player results"
                        position="absolute"
                        top="calc(100% + 6px)"
                        left={0}
                        right={0}
                        zIndex={20}
                        bg="card.white"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="border.felt"
                        boxShadow="card.lift"
                        overflow="hidden"
                        maxH="320px"
                        overflowY="auto"
                    >
                        {loading && results.length === 0 ? (
                            <HStack justify="center" py={4}>
                                <Spinner size="sm" color="brand.green" />
                            </HStack>
                        ) : results.length === 0 ? (
                            <VStack py={5} spacing={1.5}>
                                <Icon as={FiSearch} color="text.secondary" boxSize={4} />
                                <Text fontSize="sm" color="text.secondary">
                                    No players found
                                </Text>
                                <Text fontSize="2xs" color="text.muted">
                                    Search by name · @handle · wallet
                                </Text>
                            </VStack>
                        ) : (
                            results.map((r, i) => {
                                const name = playerDisplayName(
                                    r.x_username ? `@${r.x_username}` : null,
                                    r.wallet,
                                    r.x_display_name
                                );
                                const tier = tierFromString(r.tier);
                                const isActive = i === active;
                                return (
                                    <HStack
                                        as={NextLink}
                                        href={`/profile/${r.wallet}`}
                                        id={`ps-opt-${i}`}
                                        role="option"
                                        aria-selected={isActive}
                                        key={r.wallet}
                                        px={3}
                                        py={2}
                                        spacing={3}
                                        cursor="pointer"
                                        bg={isActive ? 'bg.greenTint' : undefined}
                                        boxShadow={
                                            isActive
                                                ? 'inset 0 0 0 2px var(--chakra-colors-brand-green)'
                                                : undefined
                                        }
                                        _hover={{ bg: 'bg.greenTint' }}
                                        onMouseEnter={() => onRowMouseEnter(i)}
                                        onClick={onRowClick}
                                    >
                                        <Image
                                            src={
                                                r.avatar_url ||
                                                blo(r.wallet as `0x${string}`)
                                            }
                                            fallbackSrc={blo(r.wallet as `0x${string}`)}
                                            alt=""
                                            boxSize="32px"
                                            borderRadius="full"
                                            flexShrink={0}
                                        />
                                        <VStack
                                            align="start"
                                            spacing={0}
                                            flex={1}
                                            minW={0}
                                        >
                                            <Text
                                                fontSize="sm"
                                                color="text.primary"
                                                noOfLines={1}
                                            >
                                                {name}
                                            </Text>
                                            {r.x_username && (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.secondary"
                                                    noOfLines={1}
                                                >
                                                    @{r.x_username}
                                                </Text>
                                            )}
                                        </VStack>
                                        {r.rank > 0 && (
                                            <HStack
                                                flexShrink={0}
                                                bg="bg.pillNeutral"
                                                border="1px solid"
                                                borderColor="border.pillNeutral"
                                                borderRadius="full"
                                                px={2}
                                                py={0.5}
                                                spacing={1}
                                            >
                                                <Icon
                                                    as={tier.icon}
                                                    color={tier.token}
                                                    boxSize="11px"
                                                    aria-hidden
                                                />
                                                <Text
                                                    fontSize="2xs"
                                                    fontWeight={700}
                                                    color="text.secondary"
                                                >
                                                    #{r.rank}
                                                </Text>
                                            </HStack>
                                        )}
                                    </HStack>
                                );
                            })
                        )}
                    </Box>
                )}
            </Box>
        );
    }
);

export default PlayerSearchView;
