'use client';

import Link from 'next/link';
import {
    Box,
    Container,
    Flex,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    Badge,
    Icon,
    Grid,
    Tooltip,
    Image,
} from '@chakra-ui/react';
import {

    FiArrowUpRight,
    FiPlus,
    FiUsers,
    FiChevronUp,
    FiChevronDown,
    FiEye,
} from 'react-icons/fi';
import Footer from '../components/HomePage/Footer';
import { ReactNode, useEffect, useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import { getPublicGames } from '../hooks/server_actions';

interface PublicGame {
    name: string;
    small_blind: number;
    big_blind: number;
    is_crypto: boolean;
    player_count: number;
    spectator_count: number;
    max_players: number;
    is_active: boolean;
    created_at: string;
}

const statusStyles = {
    Active: {
        badgeBg: 'brand.green',
        badgeColor: 'white',
        dotBg: 'brand.green',
        dotShadow: '0 0 10px rgba(54, 163, 123, 0.6)',
    },
    Open: {
        badgeBg: 'brand.yellow',
        badgeColor: 'brand.darkNavy',
        dotBg: 'brand.yellow',
        dotShadow: '0 0 8px rgba(253, 197, 29, 0.5)',
    },
};

const getStatusStyle = (status: string | boolean) => {
    if (typeof status === 'boolean') {
        return status ? statusStyles.Active : statusStyles.Open;
    }
    return statusStyles[status as keyof typeof statusStyles] ?? statusStyles.Open;
};

const formatUsdc = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeValue);
};

const usdcLogoUrl = '/usdc-logo.png';

const SectionHeader = ({
    title,
    count,
    action,
}: {
    title: string;
    count?: number;
    action?: ReactNode;
}) => {
    return (
        <HStack justify="space-between" align="center" w="full" spacing={4}>
            <HStack spacing={3} align="center">
                <Heading
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="extrabold"
                    color="text.primary"
                >
                    {title}
                </Heading>
                {typeof count === 'number' ? (
                    <Badge
                        bg="brand.green"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                    >
                        {count}
                    </Badge>
                ) : null}
            </HStack>
            {action}
        </HStack>
    );
};


const PublicGameRow = ({ game }: { game: PublicGame }) => {
    const statusStyle = getStatusStyle(game.is_active);
    const statusLabel = game.is_active ? 'Active' : 'Open';
    const rowAccentColor = game.is_crypto ? 'blue.500' : 'brand.green';
    const rowAccentShadow = game.is_crypto
        ? '0 0 8px rgba(59, 130, 246, 0.45)'
        : '0 0 8px rgba(54, 163, 123, 0.45)';
    const chipsPerUsdc = 100;
    const usdcPerChip = 1 / chipsPerUsdc;
    const hasCryptoBlinds = game.is_crypto;
    const blindsLabel = hasCryptoBlinds
        ? `${formatUsdc(game.small_blind * usdcPerChip)} / ${formatUsdc(game.big_blind * usdcPerChip)}`
        : `${game.small_blind} / ${game.big_blind}`;
    const seatsLabel = `${game.player_count} / ${game.max_players}`;

    return (
        <Grid
            w="full"
            templateColumns={{
                base: '1fr auto',
                md: '24px 2.2fr 1fr 0.8fr auto',
            }}
            gap={{ base: 2, md: 4 }}
            alignItems="center"
            px={{ base: 3, md: 6 }}
            py={{ base: 2.5, md: 3 }}
            borderRadius={{ base: '12px', md: '14px' }}
            bg="rgba(12, 21, 49, 0.02)"
            border="1px solid"
            borderColor="rgba(12, 21, 49, 0.08)"
            borderLeft="3px solid"
            borderLeftColor={rowAccentColor}
            _dark={{
                bg: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
            _hover={{
                transform: 'translateY(-1px)',
                bg: 'card.white',
                boxShadow: '0 10px 20px rgba(12, 21, 49, 0.1)',
                _dark: {
                    bg: 'legacy.grayLight',
                    boxShadow: '0 12px 22px rgba(0, 0, 0, 0.45)',
                },
            }}
            transition="all 0.2s ease"
        >
            <Flex
                display={{ base: 'none', md: 'flex' }}
                align="center"
                justify="center"
            >
                <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={rowAccentColor}
                    boxShadow={rowAccentShadow}
                />
            </Flex>
            <HStack spacing={2} minW={0}>
                <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={rowAccentColor}
                    boxShadow={rowAccentShadow}
                    display={{ base: 'block', md: 'none' }}
                    flexShrink={0}
                />
                <VStack align="start" spacing={0.5} minW={0}>
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        color="text.primary"
                        fontFamily="monospace"
                        noOfLines={1}
                        w="full"
                        isTruncated
                    >
                        {game.name}
                    </Text>
                    <HStack spacing={1.5} align="center">
                        <Badge
                            bg={statusStyle.badgeBg}
                            color={statusStyle.badgeColor}
                            borderRadius="full"
                            px={2}
                            py={0}
                            fontSize="2xs"
                            fontWeight="bold"
                            textTransform="uppercase"
                            lineHeight="tall"
                        >
                            {statusLabel}
                        </Badge>
                        {game.is_crypto ? (
                            <Badge
                                bg="blue.500"
                                color="white"
                                borderRadius="full"
                                px={2}
                                py={0}
                                fontSize="2xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                                lineHeight="tall"
                            >
                                Crypto
                            </Badge>
                        ) : null}
                    </HStack>
                    <Text
                        fontSize="xs"
                        color="text.secondary"
                        display={{ base: 'block', md: 'none' }}
                    >
                        {blindsLabel} blinds • {seatsLabel} seats{game.spectator_count > 0 ? ` · ${game.spectator_count} watching` : ''}
                    </Text>
                </VStack>
            </HStack>

            <VStack
                align="start"
                spacing={0.5}
                display={{ base: 'none', md: 'flex' }}
            >
                <Text
                    fontSize="2xs"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                >
                    Blinds
                </Text>
                {hasCryptoBlinds ? (
                    <Tooltip label={`${game.small_blind} / ${game.big_blind} chips`} hasArrow>
                        <HStack spacing={1} align="center">
                            <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="text.primary"
                            >
                                {blindsLabel}
                            </Text>
                            <Image
                                src={usdcLogoUrl}
                                alt="USDC"
                                boxSize="12px"
                            />
                        </HStack>
                    </Tooltip>
                ) : (
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="text.primary"
                    >
                        {blindsLabel}
                    </Text>
                )}
            </VStack>

            <VStack
                align="start"
                spacing={0.5}
                display={{ base: 'none', md: 'flex' }}
            >
                <Text
                    fontSize="2xs"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                >
                    Seats
                </Text>
                <HStack spacing={1} color="text.secondary" fontSize="sm">
                    <Icon as={FiUsers} />
                    <Text fontWeight="semibold" color="text.primary">
                        {seatsLabel}
                    </Text>
                </HStack>
                {game.spectator_count > 0 && (
                    <HStack spacing={1} color="text.secondary" fontSize="xs">
                        <Icon as={FiEye} />
                        <Text>{game.spectator_count} watching</Text>
                    </HStack>
                )}
            </VStack>

            <Button
                as={Link}
                href={`/table/${game.name}`}
                size="xs"
                rightIcon={<FiArrowUpRight />}
                variant="greenGradient"
                borderRadius="10px"
                justifySelf="end"
                w="auto"
                display={{ base: 'inline-flex', md: 'none' }}
                _hover={{
                    boxShadow:
                        '0 0 0 2px rgba(54, 163, 123, 0.25), 0 10px 18px rgba(54, 163, 123, 0.3)',
                }}
            >
                Join
            </Button>
            <Button
                as={Link}
                href={`/table/${game.name}`}
                size="sm"
                rightIcon={<FiArrowUpRight />}
                variant="greenGradient"
                borderRadius="12px"
                justifySelf="end"
                w="auto"
                display={{ base: 'none', md: 'inline-flex' }}
                _hover={{
                    boxShadow:
                        '0 0 0 2px rgba(54, 163, 123, 0.25), 0 10px 18px rgba(54, 163, 123, 0.3)',
                }}
            >
                Join
            </Button>
        </Grid>
    );
};

const PAGE_SIZE = 20;

const sortKeyToParam = (key: 'table' | 'blinds' | 'seats' | null) => {
    if (key === 'table') return 'name';
    if (key === 'blinds') return 'big_blind';
    if (key === 'seats') return 'players';
    return undefined;
};

const PublicGamesSection = ({
    games,
    totalCount,
    filter,
    onFilterChange,
    sortConfig,
    onSortChange,
    hasMore,
    isLoadingMore,
    onLoadMore,
}: {
    games: PublicGame[];
    totalCount: number;
    filter: 'all' | 'crypto' | 'free';
    onFilterChange: (f: 'all' | 'crypto' | 'free') => void;
    sortConfig: { key: 'table' | 'blinds' | 'seats' | null; direction: 'asc' | 'desc' };
    onSortChange: (key: 'table' | 'blinds' | 'seats') => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}) => {
    const SortHeaderButton = ({
        label,
        sortKey,
    }: {
        label: string;
        sortKey: 'table' | 'blinds' | 'seats';
    }) => {
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
                _hover={{ color: 'text.primary' }}
                _focus={{ boxShadow: 'none', outline: 'none' }}
                _focusVisible={{ boxShadow: 'none', outline: 'none' }}
                _dark={{
                    color: 'text.gray600',
                    _hover: { color: 'text.white' },
                }}
            >
                <HStack spacing={1} align="center">
                    <Text
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="0.16em"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        {label}
                    </Text>
                    <Icon
                        as={icon}
                        boxSize="12px"
                        color="text.primary"
                        opacity={isActive ? 0.9 : 0.35}
                    />
                </HStack>
            </Button>
        );
    };

    return (
        <VStack w="full" spacing={{ base: 4, md: 5 }}>
            <SectionHeader
                title="All Public Games"
                count={totalCount}
                action={
                    <HStack
                        spacing={1}
                        bg="rgba(12, 21, 49, 0.04)"
                        borderRadius="full"
                        p={1}
                        border="1px solid"
                        borderColor="rgba(12, 21, 49, 0.12)"
                        _dark={{
                            bg: 'rgba(255, 255, 255, 0.06)',
                            borderColor: 'rgba(255, 255, 255, 0.16)',
                        }}
                    >
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'crypto', label: 'Crypto' },
                            { value: 'free', label: 'Free' },
                        ].map((option) => {
                            const isActive = filter === option.value;
                            return (
                                <Button
                                    key={option.value}
                                    variant="unstyled"
                                    px={3}
                                    h="28px"
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    letterSpacing="0.08em"
                                    textTransform="uppercase"
                                    color={
                                        isActive
                                            ? 'text.primary'
                                            : 'text.secondary'
                                    }
                                    bg={isActive ? 'card.white' : 'transparent'}
                                    border="1px solid"
                                    borderColor={
                                        isActive
                                            ? 'rgba(12, 21, 49, 0.12)'
                                            : 'transparent'
                                    }
                                    boxShadow={
                                        isActive
                                            ? '0 6px 14px rgba(12, 21, 49, 0.12)'
                                            : 'none'
                                    }
                                    _hover={{
                                        bg: isActive
                                            ? 'card.white'
                                            : 'rgba(12, 21, 49, 0.06)',
                                    }}
                                    _focusVisible={{
                                        boxShadow:
                                            '0 0 0 2px rgba(54, 163, 123, 0.3)',
                                    }}
                                    _dark={{
                                        color: isActive
                                            ? 'text.white'
                                            : 'text.secondary',
                                        bg: isActive
                                            ? 'legacy.grayLight'
                                            : 'transparent',
                                        borderColor: isActive
                                            ? 'rgba(255, 255, 255, 0.2)'
                                            : 'transparent',
                                        boxShadow: isActive
                                            ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                                            : 'none',
                                        _hover: {
                                            bg: isActive
                                                ? 'legacy.grayLight'
                                                : 'rgba(255, 255, 255, 0.08)',
                                        },
                                        _focusVisible: {
                                            boxShadow:
                                                '0 0 0 2px rgba(54, 163, 123, 0.45)',
                                        },
                                    }}
                                    onClick={() =>
                                        onFilterChange(
                                            option.value as
                                                | 'all'
                                                | 'crypto'
                                                | 'free'
                                        )
                                    }
                                    aria-pressed={isActive}
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </HStack>
                }
            />
            <Box
                w="full"
                bg="card.white"
                border="1px solid"
                borderColor="card.lightGray"
                borderRadius="24px"
                boxShadow="0 14px 28px rgba(12, 21, 49, 0.08)"
                overflow="hidden"
            >
                {/* Mobile sort buttons row */}
                <HStack
                    display={{ base: 'flex', md: 'none' }}
                    spacing={4}
                    px={3}
                    py={2}
                    bg="rgba(12, 21, 49, 0.03)"
                    borderBottom="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                >
                    <SortHeaderButton label="Table" sortKey="table" />
                    <SortHeaderButton label="Blinds" sortKey="blinds" />
                    <SortHeaderButton label="Seats" sortKey="seats" />
                </HStack>
                {/* Desktop sort header aligned to columns */}
                <Grid
                    display={{ base: 'none', md: 'grid' }}
                    templateColumns="24px 2.2fr 1fr 0.8fr auto"
                    gap={4}
                    alignItems="center"
                    px={6}
                    py={3}
                    bg="rgba(12, 21, 49, 0.03)"
                    borderBottom="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                >
                    <Box />
                    <SortHeaderButton label="Table" sortKey="table" />
                    <SortHeaderButton label="Blinds" sortKey="blinds" />
                    <SortHeaderButton label="Seats" sortKey="seats" />
                    <Box />
                </Grid>

                <Box position="relative">
                    <VStack
                        w="full"
                        spacing={{ base: 1.5, md: 2 }}
                        maxH={{ base: 'none', lg: '680px' }}
                        overflowY={{ base: 'visible', lg: 'auto' }}
                        px={{ base: 3, md: 6 }}
                        py={{ base: 2, md: 4 }}
                        pr={{ base: 3, lg: 6 }}
                        sx={{
                            scrollbarWidth: 'thin',
                            scrollbarColor:
                                'rgba(12, 21, 49, 0.25) transparent',
                            '&::-webkit-scrollbar': { width: '10px' },
                            '&::-webkit-scrollbar-track': {
                                bg: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(12, 21, 49, 0.25)',
                                borderRadius: '999px',
                                border: '3px solid transparent',
                                backgroundClip: 'content-box',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: 'rgba(12, 21, 49, 0.4)',
                                backgroundClip: 'content-box',
                            },
                        }}
                    >
                        {games.map((game) => (
                            <PublicGameRow key={game.name} game={game} />
                        ))}
                    </VStack>
                </Box>

                {hasMore && (
                    <Flex
                        align="center"
                        justify="center"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 3, md: 4 }}
                        bg="rgba(12, 21, 49, 0.02)"
                        borderTop="1px solid"
                        borderColor="rgba(12, 21, 49, 0.08)"
                    >
                        <Button
                            size="md"
                            borderRadius="12px"
                            bg="card.lightGray"
                            color="text.primary"
                            border="1px solid"
                            borderColor="rgba(12, 21, 49, 0.15)"
                            fontWeight="semibold"
                            textTransform="none"
                            isLoading={isLoadingMore}
                            loadingText="Loading..."
                            onClick={onLoadMore}
                            _hover={{ bg: 'rgba(12, 21, 49, 0.06)' }}
                            _dark={{
                                bg: 'legacy.grayDark',
                                color: 'text.white',
                                borderColor: 'rgba(255, 255, 255, 0.12)',
                                _hover: { bg: 'rgba(255, 255, 255, 0.08)' },
                            }}
                        >
                            Load more tables
                        </Button>
                    </Flex>
                )}
            </Box>
        </VStack>
    );
};

const PublicPage = () => {
    const [games, setGames] = useState<PublicGame[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'crypto' | 'free'>('all');
    const [sortConfig, setSortConfig] = useState<{
        key: 'table' | 'blinds' | 'seats' | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });

    const sortByParam = sortKeyToParam(sortConfig.key);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        getPublicGames({
            sortBy: sortByParam,
            order: sortConfig.direction,
            filter,
            limit: PAGE_SIZE,
            offset: 0,
        })
            .then((data) => {
                if (cancelled) return;
                if (data?.success && Array.isArray(data.games)) {
                    setGames(data.games);
                    setTotalCount(data.total_count ?? data.games.length);
                } else {
                    setError('Unable to load games. Please try again.');
                }
            })
            .catch(() => {
                if (!cancelled)
                    setError('Unable to load games. Please try again.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [filter, sortByParam, sortConfig.direction]);

    const handleSortChange = (key: 'table' | 'blinds' | 'seats') => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            const data = await getPublicGames({
                sortBy: sortByParam,
                order: sortConfig.direction,
                filter,
                limit: PAGE_SIZE,
                offset: games.length,
            });
            if (data?.success && Array.isArray(data.games)) {
                setGames((prev) => [...prev, ...data.games]);
            }
        } catch {
            // silent fail — existing rows remain visible
        } finally {
            setIsLoadingMore(false);
        }
    };

    const fetchGames = () => {
        setSortConfig({ key: null, direction: 'asc' });
        setFilter('all');
    };

    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="card.lightGray"
            position="relative"
            overflow="hidden"
        >
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '120px', md: '160px' }}
                right={{ base: '-120px', md: '-80px' }}
                w={{ base: '240px', md: '320px' }}
                h={{ base: '240px', md: '320px' }}
                bg="brand.green"
                opacity={0.08}
                borderRadius="full"
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '240px', md: '200px' }}
                left={{ base: '-120px', md: '-80px' }}
                w={{ base: '240px', md: '300px' }}
                h={{ base: '240px', md: '300px' }}
                bg="brand.pink"
                opacity={0.08}
                borderRadius="40px"
                transform="rotate(12deg)"
            />

            <Box
                pt={{ base: 20, md: 24 }}
                pb={{ base: 10, md: 16 }}
                position="relative"
                zIndex={1}
            >
                <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                    <VStack spacing={{ base: 6, md: 8 }} w="full">
                        <Flex
                            w="full"
                            direction={{ base: 'column', md: 'row' }}
                            align={{ base: 'flex-start', md: 'center' }}
                            justify="space-between"
                            gap={{ base: 4, md: 6 }}
                            bg="card.white"
                            borderRadius="24px"
                            p={{ base: 5, md: 7 }}
                            border="1px solid"
                            borderColor="card.lightGray"
                            boxShadow="0 12px 30px rgba(12, 21, 49, 0.08)"
                        >
                            <VStack align="start" spacing={1.5} flex={1}>
                                <Heading
                                    fontSize={{ base: 'xl', md: '2xl' }}
                                    fontWeight="extrabold"
                                    color="text.primary"
                                    lineHeight={1.1}
                                >
                                    <Box
                                        as="span"
                                        position="relative"
                                        display="inline-block"
                                    >
                                        Public
                                        <Box
                                            as="span"
                                            position="absolute"
                                            left="-4px"
                                            right="-4px"
                                            bottom="2px"
                                            height="10px"
                                            bg="brand.green"
                                            opacity={0.18}
                                            borderRadius="full"
                                            zIndex={-1}
                                        />
                                    </Box>{' '}
                                    games,{' '}
                                    <Box
                                        as="span"
                                        display="inline-block"
                                        bg="brand.pink"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        transform="rotate(-1.5deg)"
                                        boxShadow="0 6px 14px rgba(235, 11, 92, 0.25)"
                                    >
                                        ready now
                                    </Box>
                                    .
                                </Heading>
                                <Text color="text.secondary" fontSize="sm">
                                    Browse live tables or spin up your own—no
                                    fuss, just cards.
                                </Text>
                            </VStack>
                            <HStack spacing={3} align="center">
                                <Button
                                    as={Link}
                                    href="/create-game"
                                    leftIcon={<FiPlus />}
                                    variant="greenGradient"
                                    borderRadius="16px"
                                    height={{ base: '40px', md: '44px' }}
                                    px={{ base: 5, md: 6 }}
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow:
                                            '0 12px 22px rgba(54, 163, 123, 0.35)',
                                    }}
                                >
                                    Create Game
                                </Button>
                            </HStack>
                        </Flex>


                        {isLoading ? (
                            <Flex
                                w="full"
                                justify="center"
                                align="center"
                                py={16}
                            >
                                <VStack spacing={4}>
                                    <Spinner
                                        size="lg"
                                        color="brand.green"
                                        thickness="3px"
                                    />
                                    <Text
                                        color="text.secondary"
                                        fontSize="sm"
                                        fontWeight="semibold"
                                    >
                                        Loading public games...
                                    </Text>
                                </VStack>
                            </Flex>
                        ) : error ? (
                            <Flex
                                w="full"
                                direction="column"
                                align="center"
                                py={16}
                                gap={4}
                            >
                                <Text
                                    color="text.secondary"
                                    fontSize="md"
                                    fontWeight="semibold"
                                >
                                    {error}
                                </Text>
                                <Button
                                    variant="greenGradient"
                                    borderRadius="14px"
                                    onClick={fetchGames}
                                >
                                    Retry
                                </Button>
                            </Flex>
                        ) : games.length === 0 ? (
                            <Flex
                                w="full"
                                direction="column"
                                align="center"
                                py={16}
                                gap={4}
                            >
                                <Text
                                    color="text.secondary"
                                    fontSize="md"
                                    fontWeight="semibold"
                                >
                                    No public games right now.
                                </Text>
                                <Button
                                    as={Link}
                                    href="/create-game"
                                    leftIcon={<FiPlus />}
                                    variant="greenGradient"
                                    borderRadius="14px"
                                >
                                    Create one
                                </Button>
                            </Flex>
                        ) : (
                            <PublicGamesSection
                                games={games}
                                totalCount={totalCount}
                                filter={filter}
                                onFilterChange={setFilter}
                                sortConfig={sortConfig}
                                onSortChange={handleSortChange}
                                hasMore={games.length < totalCount}
                                isLoadingMore={isLoadingMore}
                                onLoadMore={handleLoadMore}
                            />
                        )}
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

export default PublicPage;
