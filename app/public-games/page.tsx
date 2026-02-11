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
    Input,
    Icon,
    Grid,
    Tooltip,
    Image,
} from '@chakra-ui/react';
import {
    FiSearch,
    FiArrowUpRight,
    FiPlus,
    FiUsers,
    FiChevronUp,
    FiChevronDown,
} from 'react-icons/fi';
import Footer from '../components/HomePage/Footer';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import { getPublicGames } from '../hooks/server_actions';

interface PublicGame {
    name: string;
    small_blind: number;
    big_blind: number;
    is_crypto: boolean;
    player_count: number;
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

const usdcLogoUrl = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

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

const SearchBar = () => {
    return (
        <Flex
            w="full"
            direction={{ base: 'column', lg: 'row' }}
            gap={{ base: 4, lg: 6 }}
            bg="card.white"
            borderRadius="24px"
            p={{ base: 5, md: 6 }}
            border="1px solid"
            borderColor="card.lightGray"
            boxShadow="0 10px 24px rgba(12, 21, 49, 0.06)"
        >
            <Box position="relative" flex={1}>
                <Icon
                    as={FiSearch}
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="text.secondary"
                />
                <Input
                    type="search"
                    placeholder="Search tables, hosts, or game modes"
                    aria-label="Search public tables"
                    height={{ base: '48px', md: '56px' }}
                    pl={12}
                    bg="card.lightGray"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                    _focus={{
                        borderColor: 'brand.green',
                        boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.2)',
                        bg: 'white',
                    }}
                />
            </Box>
        </Flex>
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
                <VStack align="start" spacing={0} minW={0}>
                    <HStack spacing={1.5} flexWrap="wrap" align="center">
                        <Text
                            fontSize={{ base: 'sm', md: 'lg' }}
                            fontWeight="bold"
                            color="text.primary"
                            fontFamily="monospace"
                            noOfLines={1}
                        >
                            {game.name}
                        </Text>
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
                        {blindsLabel} blinds • {seatsLabel} seats
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

const PublicGamesSection = ({ games }: { games: PublicGame[] }) => {
    const [filter, setFilter] = useState<'all' | 'crypto' | 'free'>('all');
    const [sortConfig, setSortConfig] = useState<{
        key: 'table' | 'blinds' | 'seats' | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });
    const filteredGames = useMemo(() => {
        if (filter === 'crypto') {
            return games.filter((game) => game.is_crypto);
        }
        if (filter === 'free') {
            return games.filter((game) => !game.is_crypto);
        }
        return games;
    }, [filter, games]);
    const sortedGames = useMemo(() => {
        const items = [...filteredGames];
        if (!sortConfig.key) {
            return items;
        }
        const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;
        items.sort((a, b) => {
            switch (sortConfig.key) {
                case 'table':
                    return (
                        a.name.localeCompare(b.name) * directionMultiplier
                    );
                case 'blinds':
                    return (
                        (a.big_blind - b.big_blind) * directionMultiplier
                    );
                case 'seats':
                    return (
                        (a.player_count - b.player_count) * directionMultiplier
                    );
                default:
                    return 0;
            }
        });
        return items;
    }, [filteredGames, sortConfig]);

    const SortHeaderButton = ({
        label,
        sortKey,
        display,
    }: {
        label: string;
        sortKey: 'table' | 'blinds' | 'seats';
        display?: { base?: string; md?: string };
    }) => {
        const isActive = sortConfig.key === sortKey;
        const icon = isActive
            ? sortConfig.direction === 'asc'
                ? FiChevronUp
                : FiChevronDown
            : FiChevronUp;
        return (
            <Button
                variant="unstyled"
                onClick={() =>
                    setSortConfig((prev) => ({
                        key: sortKey,
                        direction:
                            prev.key === sortKey && prev.direction === 'asc'
                                ? 'desc'
                                : 'asc',
                    }))
                }
                display={display}
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
                        opacity={isActive ? 0.9 : 0.25}
                    />
                </HStack>
            </Button>
        );
    };

    return (
        <VStack w="full" spacing={{ base: 4, md: 5 }}>
            <SectionHeader
                title="All Public Games"
                count={filteredGames.length}
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
                                        setFilter(
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
                <Grid
                    templateColumns={{
                        base: '1fr',
                        md: '24px 2.2fr 1fr 0.8fr auto',
                    }}
                    gap={4}
                    alignItems="center"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 2, md: 3 }}
                    bg="rgba(12, 21, 49, 0.03)"
                    borderBottom="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                >
                    <Box display={{ base: 'none', md: 'block' }} />
                    <SortHeaderButton label="Table" sortKey="table" />
                    <SortHeaderButton
                        label="Blinds"
                        sortKey="blinds"
                        display={{ base: 'none', md: 'inline-flex' }}
                    />
                    <SortHeaderButton
                        label="Seats"
                        sortKey="seats"
                        display={{ base: 'none', md: 'inline-flex' }}
                    />
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
                        {sortedGames.map((game) => (
                            <PublicGameRow key={game.name} game={game} />
                        ))}
                    </VStack>
                </Box>

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
            </Box>
        </VStack>
    );
};

const PublicPage = () => {
    const [games, setGames] = useState<PublicGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getPublicGames();
            if (data?.success && Array.isArray(data.games)) {
                setGames(data.games);
            } else {
                setError('Unable to load games. Please try again.');
            }
        } catch (err) {
            console.error('Failed to load public games:', err);
            setError('Unable to load games. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

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

                        <SearchBar />

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
                            <PublicGamesSection games={games} />
                        )}
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

export default PublicPage;
