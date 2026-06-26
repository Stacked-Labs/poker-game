'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    HStack,
    VStack,
    Text,
    Image,
    Badge,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { blo } from 'blo';
import {
    searchPlayers,
    type PlayerSearchResult,
} from '@/app/hooks/server_actions';
import { playerDisplayName } from '@/app/utils/address';
import { TIER_EMOJI } from '@/app/components/Leaderboard/tierUtils';

// Find-a-player search (Viral §1 / #346). Debounced live dropdown over the #344 search API;
// each result links to /profile/[address]. Keyboard-navigable (↑/↓/Enter/Esc).
export default function PlayerSearch({
    placeholder = 'Search players…',
    maxW = '320px',
}: {
    placeholder?: string;
    maxW?: string | object;
}) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PlayerSearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(-1);
    const boxRef = useRef<HTMLDivElement>(null);

    // Debounced search.
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => {
            let active = true;
            searchPlayers(q)
                .then((r) => {
                    if (active) {
                        setResults(r);
                        setActive(-1);
                    }
                })
                .finally(() => active && setLoading(false));
            return () => {
                active = false;
            };
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    // Close on outside click.
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const go = (wallet: string) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        router.push(`/profile/${wallet}`);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!open || results.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            go(results[active].wallet);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const showDropdown = open && query.trim().length >= 2;

    return (
        <Box position="relative" w="100%" maxW={maxW} ref={boxRef}>
            <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="text.secondary" />
                </InputLeftElement>
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    borderRadius="full"
                    bg="card.white"
                    aria-label="Search players"
                />
            </InputGroup>

            {showDropdown && (
                <Box
                    position="absolute"
                    top="calc(100% + 6px)"
                    left={0}
                    right={0}
                    zIndex={20}
                    bg="card.white"
                    borderRadius="xl"
                    boxShadow="0 16px 30px rgba(0,0,0,0.25)"
                    overflow="hidden"
                    maxH="320px"
                    overflowY="auto"
                >
                    {loading && results.length === 0 ? (
                        <HStack justify="center" py={4}>
                            <Spinner size="sm" color="brand.green" />
                        </HStack>
                    ) : results.length === 0 ? (
                        <Text px={4} py={3} fontSize="sm" color="text.secondary">
                            No players found
                        </Text>
                    ) : (
                        results.map((r, i) => {
                            const name = playerDisplayName(
                                r.x_username ? `@${r.x_username}` : null,
                                r.wallet,
                                r.x_display_name
                            );
                            const avatar =
                                r.avatar_url || blo(r.wallet as `0x${string}`);
                            return (
                                <HStack
                                    key={r.wallet}
                                    px={3}
                                    py={2}
                                    spacing={3}
                                    cursor="pointer"
                                    bg={i === active ? 'card.lightGray' : undefined}
                                    _hover={{ bg: 'card.lightGray' }}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => go(r.wallet)}
                                >
                                    <Image
                                        src={avatar}
                                        alt={name}
                                        boxSize="28px"
                                        borderRadius="full"
                                    />
                                    <VStack align="start" spacing={0} flex={1} minW={0}>
                                        <Text fontSize="sm" color="text.primary" noOfLines={1}>
                                            {name}
                                        </Text>
                                        {r.x_username && (
                                            <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                                                @{r.x_username}
                                            </Text>
                                        )}
                                    </VStack>
                                    {r.rank > 0 && (
                                        <Badge fontSize="2xs" flexShrink={0}>
                                            {TIER_EMOJI[r.tier.toLowerCase()] ?? ''} #{r.rank}
                                        </Badge>
                                    )}
                                </HStack>
                            );
                        })
                    )}
                    <Text px={3} py={2} fontSize="2xs" color="text.secondary" opacity={0.7}>
                        search by name · @handle · wallet
                    </Text>
                </Box>
            )}
        </Box>
    );
}
