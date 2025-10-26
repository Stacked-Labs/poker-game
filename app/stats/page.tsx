import {
    Text,
    Flex,
    Box,
    Tooltip,
    Badge,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    HStack,
    Divider,
    VStack,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
    getHealth,
    getHealthDb,
    getLiveStats,
    getMetrics,
    getStats,
    getTables,
} from '../hooks/server_actions';
import {
    Health,
    HealthDb,
    Metrics,
    TablesResponse,
    StatsResponse,
    LiveStatsResponse,
} from '../stats/types';
import { ReactNode } from 'react';

// Revalidate stats data every 60 seconds
export const revalidate = 60;

const StatCard = ({
    title,
    timestamp,
    flex,
    children,
}: {
    title: string;
    timestamp: string;
    flex: number;
    children?: ReactNode;
}) => (
    <Flex
        flex={flex}
        direction={'column'}
        bg={'white'}
        color={'brand.darkNavy'}
        p={{ base: 4, md: 5 }}
        borderRadius={'16px'}
        boxShadow={'0 4px 12px rgba(0, 0, 0, 0.08)'}
        border={'1px solid'}
        borderColor={'brand.lightGray'}
    >
        <Text
            color={'brand.darkNavy'}
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight={'extrabold'}
            mb={{ base: 2, md: 3 }}
        >
            {title}
        </Text>
        <Flex direction={'column'} gap={{ base: 1.5, md: 2 }} height={'full'}>
            {children}
            <Box mt={'auto'} alignSelf={'center'} pt={2}>
                <Timestamp time={timestamp} />
            </Box>
        </Flex>
    </Flex>
);

const Timestamp = ({ time }: { time: string }) => {
    return (
        <Text
            fontSize={'xs'}
            fontWeight={'medium'}
            color={'brand.navy'}
            align={'center'}
            opacity={0.7}
            suppressHydrationWarning
        >
            As of {new Date(time).toLocaleString()}
        </Text>
    );
};

const StatBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex
            justify="space-between"
            align="center"
            color={'brand.darkNavy'}
            py={{ base: 1.5, md: 2 }}
            px={{ base: 2.5, md: 3 }}
            bg={'brand.lightGray'}
            borderRadius={'8px'}
        >
            {children}
        </Flex>
    );
};

const SubBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex
            direction={'column'}
            gap={{ base: 1.5, md: 2 }}
            p={{ base: 2.5, md: 3 }}
            bg={'rgba(236, 238, 245, 0.5)'}
            borderRadius={'12px'}
        >
            {children}
        </Flex>
    );
};

const page = async () => {
    const now = new Date().toISOString();

    const withFallback = async <T,>(
        promise: Promise<T>,
        fallback: T,
        label: string
    ): Promise<T> => {
        try {
            return await promise;
        } catch (error) {
            console.error(
                `Failed to load ${label}. Falling back to defaults.`,
                error
            );
            return fallback;
        }
    };

    const defaultHealth: Health = {
        status: 'unavailable',
        timestamp: now,
    };

    const defaultHealthDb: HealthDb = {
        database: 'unavailable',
        status: 'unavailable',
        timestamp: now,
    };

    const defaultMetrics: Metrics = {
        database: {
            connections_idle: 0,
            connections_in_use: 0,
            last_health_check: now,
        },
        tables: {
            active_count: 0,
        },
        timestamp: now,
    };

    const defaultTables: TablesResponse = {
        success: false,
        tables: [],
        timestamp: now,
        total_count: 0,
    };

    const defaultStats: StatsResponse = {
        data: {
            active_players_count: 0,
            active_tables_count: 0,
            hands_last_24h: 0,
            tables_last_24h: 0,
            total_hands_played: 0,
            total_tables_created: 0,
            total_unique_players: 0,
        },
        success: false,
        timestamp: now,
    };

    const defaultLiveStats: LiveStatsResponse = {
        data: {
            active_connections: 0,
            active_tables: 0,
        },
        success: false,
        timestamp: now,
    };

    const [health, healthDb, metrics, tables, stats, liveStats]: [
        Health,
        HealthDb,
        Metrics,
        TablesResponse,
        StatsResponse,
        LiveStatsResponse,
    ] = await Promise.all([
        withFallback(getHealth(), defaultHealth, 'health'),
        withFallback(getHealthDb(), defaultHealthDb, 'database health'),
        withFallback(getMetrics(), defaultMetrics, 'metrics'),
        withFallback(getTables(), defaultTables, 'tables'),
        withFallback(getStats(), defaultStats, 'stats'),
        withFallback(getLiveStats(), defaultLiveStats, 'live stats'),
    ]);

    return (
        <Flex
            direction={'column'}
            bg={'brand.lightGray'}
            pt={{ base: 20, md: 24 }}
            pb={{ base: 6, md: 8 }}
            minHeight={'100vh'}
            alignItems={'center'}
            w={'100%'}
            px={{ base: 3, md: 6, lg: 20 }}
        >
            {/* Page Title */}
            <VStack gap={1} mb={{ base: 4, md: 5 }} width="full">
                <Text
                    fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                    fontWeight="extrabold"
                    color="brand.darkNavy"
                >
                    System Statistics
                </Text>
            </VStack>

            <Tabs
                defaultIndex={0}
                width={{ base: 'full', lg: '75vw', xl: '70vw' }}
                size="lg"
                variant="unstyled"
            >
                <TabList
                    bg="white"
                    borderRadius="12px"
                    p={{ base: '6px', md: 1 }}
                    mb={{ base: 3, md: 4 }}
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                >
                    <Tab
                        fontSize={{ base: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
                        py={{ base: 2, sm: 2.5, md: 3 }}
                        px={{ base: 3, sm: 4, md: 6 }}
                        fontWeight="bold"
                        color="brand.navy"
                        borderRadius="10px"
                        flex={1}
                        _selected={{
                            color: 'white',
                            bg: 'brand.green',
                        }}
                        transition="all 0.2s"
                    >
                        General Stats
                    </Tab>
                    <Tab
                        fontSize={{ base: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
                        py={{ base: 2, sm: 2.5, md: 3 }}
                        px={{ base: 3, sm: 4, md: 6 }}
                        fontWeight="bold"
                        color="brand.navy"
                        borderRadius="10px"
                        flex={1}
                        _selected={{
                            color: 'white',
                            bg: 'brand.pink',
                        }}
                        transition="all 0.2s"
                    >
                        Tables
                    </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel py={{ base: 3, md: 4 }} px={0}>
                        <Flex
                            direction={'column'}
                            gap={{ base: 2, md: 3 }}
                            width={'full'}
                            pb={{ base: 2, lg: 0 }}
                        >
                            <Flex
                                width={'full'}
                                gap={{ base: 2, md: 3 }}
                                direction={{ base: 'column', lg: 'row' }}
                            >
                                <StatCard
                                    flex={2}
                                    title={'Stacked'}
                                    timestamp={health.timestamp}
                                >
                                    <StatBody>
                                        <Tooltip
                                            label="Overall system health status from the backend API"
                                            placement="top"
                                            hasArrow
                                        >
                                            <Text
                                                textTransform={'capitalize'}
                                                fontWeight={'bold'}
                                                color={
                                                    health.status === 'healthy'
                                                        ? 'brand.green'
                                                        : 'brand.pink'
                                                }
                                                cursor="help"
                                            >
                                                {health.status}
                                            </Text>
                                        </Tooltip>
                                        <Flex
                                            as="span"
                                            w="16px"
                                            h="16px"
                                            borderRadius="full"
                                            bg={
                                                health.status === 'healthy'
                                                    ? 'brand.green'
                                                    : 'brand.pink'
                                            }
                                            border="2px solid"
                                            borderColor="white"
                                            boxShadow={
                                                health.status === 'healthy'
                                                    ? '0 0 8px rgba(54, 163, 123, 0.5)'
                                                    : '0 0 8px rgba(235, 11, 92, 0.5)'
                                            }
                                            aria-label={health.status}
                                        />
                                    </StatBody>
                                    <Timestamp time={health.timestamp} />
                                    <StatBody>
                                        <Tooltip
                                            label="Active WebSocket connections from clients (Source: liveStats API)"
                                            placement="top"
                                            hasArrow
                                        >
                                            <Text cursor="help">
                                                WebSocket Connections
                                            </Text>
                                        </Tooltip>
                                        <Text fontWeight={'semibold'}>
                                            {liveStats.data.active_connections}
                                        </Text>
                                    </StatBody>
                                    <StatBody>
                                        <Tooltip
                                            label="Number of tables with active games (Source: liveStats API)"
                                            placement="top"
                                            hasArrow
                                        >
                                            <Text cursor="help">
                                                Active Tables
                                            </Text>
                                        </Tooltip>
                                        <Text fontWeight={'semibold'}>
                                            {liveStats.data.active_tables}
                                        </Text>
                                    </StatBody>
                                    <Timestamp time={liveStats.timestamp} />
                                    <StatBody>
                                        <Tooltip
                                            label="Players currently in active games (Source: stats database query)"
                                            placement="top"
                                            hasArrow
                                        >
                                            <Text cursor="help">
                                                Active Players
                                            </Text>
                                        </Tooltip>
                                        <Text fontWeight={'semibold'}>
                                            {stats.data.active_players_count}
                                        </Text>
                                    </StatBody>
                                    <StatBody>
                                        <Tooltip
                                            label="Tables with active games in database - may differ from liveStats count above (Source: stats database query)"
                                            placement="top"
                                            hasArrow
                                        >
                                            <Text cursor="help">
                                                Active Tables
                                            </Text>
                                        </Tooltip>
                                        <Text fontWeight={'semibold'}>
                                            {stats.data.active_tables_count}
                                        </Text>
                                    </StatBody>
                                    <SubBody>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="extrabold"
                                            color="brand.darkNavy"
                                            mb={{ base: 0.5, md: 1 }}
                                        >
                                            Last 24 hrs
                                        </Text>
                                        <StatBody>
                                            <Tooltip
                                                label="Tables created in the last 24 hours (Source: stats database query)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">
                                                    Tables
                                                </Text>
                                            </Tooltip>
                                            <Text fontWeight={'semibold'}>
                                                {stats.data.tables_last_24h}
                                            </Text>
                                        </StatBody>
                                        <StatBody>
                                            <Tooltip
                                                label="Hands played in the last 24 hours (Source: stats database query)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">Hands</Text>
                                            </Tooltip>
                                            <Text fontWeight={'semibold'}>
                                                {stats.data.hands_last_24h}
                                            </Text>
                                        </StatBody>
                                    </SubBody>
                                    <SubBody>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="extrabold"
                                            color="brand.darkNavy"
                                            mb={{ base: 0.5, md: 1 }}
                                        >
                                            Total
                                        </Text>
                                        <StatBody>
                                            <Tooltip
                                                label="Total hands played since launch (Source: stats database query)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">
                                                    Hands Played
                                                </Text>
                                            </Tooltip>
                                            <Text fontWeight={'semibold'}>
                                                {stats.data.total_hands_played}
                                            </Text>
                                        </StatBody>
                                        <StatBody>
                                            <Tooltip
                                                label="Total tables created since launch (Source: stats database query)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">
                                                    Tables Created
                                                </Text>
                                            </Tooltip>
                                            <Text fontWeight={'semibold'}>
                                                {
                                                    stats.data
                                                        .total_tables_created
                                                }
                                            </Text>
                                        </StatBody>
                                        <StatBody>
                                            <Tooltip
                                                label="Total unique players who have joined since launch (Source: stats database query)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">
                                                    Unique Players
                                                </Text>
                                            </Tooltip>
                                            <Text fontWeight={'semibold'}>
                                                {
                                                    stats.data
                                                        .total_unique_players
                                                }
                                            </Text>
                                        </StatBody>
                                    </SubBody>
                                </StatCard>
                                <Flex
                                    flex={1}
                                    width={'full'}
                                    direction={'column'}
                                    gap={{ base: 2, md: 3 }}
                                >
                                    <StatCard
                                        flex={1}
                                        title={'Database Health'}
                                        timestamp={healthDb.timestamp}
                                    >
                                        <StatBody>
                                            <Tooltip
                                                label="Connection status to the PostgreSQL database (Source: healthDb API)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text
                                                    cursor="help"
                                                    fontWeight="medium"
                                                >
                                                    Database Connection
                                                </Text>
                                            </Tooltip>
                                            <Flex
                                                as="span"
                                                w="16px"
                                                h="16px"
                                                borderRadius="full"
                                                bg={
                                                    healthDb.database ===
                                                    'connected'
                                                        ? 'brand.green'
                                                        : 'brand.pink'
                                                }
                                                border="2px solid"
                                                borderColor="white"
                                                boxShadow={
                                                    healthDb.database ===
                                                    'connected'
                                                        ? '0 0 8px rgba(54, 163, 123, 0.5)'
                                                        : '0 0 8px rgba(235, 11, 92, 0.5)'
                                                }
                                                aria-label={healthDb.database}
                                            />
                                        </StatBody>
                                        <StatBody>
                                            <Tooltip
                                                label="Overall database health and query response status (Source: healthDb API)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text
                                                    cursor="help"
                                                    fontWeight="medium"
                                                >
                                                    Database Status
                                                </Text>
                                            </Tooltip>
                                            <Flex
                                                as="span"
                                                w="16px"
                                                h="16px"
                                                borderRadius="full"
                                                bg={
                                                    health.status === 'healthy'
                                                        ? 'brand.green'
                                                        : 'brand.pink'
                                                }
                                                border="2px solid"
                                                borderColor="white"
                                                boxShadow={
                                                    health.status === 'healthy'
                                                        ? '0 0 8px rgba(54, 163, 123, 0.5)'
                                                        : '0 0 8px rgba(235, 11, 92, 0.5)'
                                                }
                                                aria-label={healthDb.status}
                                            />
                                        </StatBody>
                                    </StatCard>
                                    <StatCard
                                        flex={1}
                                        title={'Metrics'}
                                        timestamp={metrics.timestamp}
                                    >
                                        <Flex
                                            direction={'column'}
                                            gap={{ base: 1.5, md: 2 }}
                                        >
                                            <Tooltip
                                                label="Connection pool for database queries - different from WebSocket connections"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="extrabold"
                                                    color="brand.darkNavy"
                                                    cursor="help"
                                                    mb={{ base: 0.5, md: 1 }}
                                                >
                                                    Database Pool
                                                </Text>
                                            </Tooltip>
                                            <StatBody>
                                                <Tooltip
                                                    label="Idle database connections in the pool (Source: metrics API)"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Text cursor="help">
                                                        Idle
                                                    </Text>
                                                </Tooltip>
                                                <Text fontWeight={'semibold'}>
                                                    {
                                                        metrics.database
                                                            .connections_idle
                                                    }
                                                </Text>
                                            </StatBody>
                                            <StatBody>
                                                <Tooltip
                                                    label="Database connections currently in use for queries (Source: metrics API)"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Text cursor="help">
                                                        Active
                                                    </Text>
                                                </Tooltip>
                                                <Text fontWeight={'semibold'}>
                                                    {
                                                        metrics.database
                                                            .connections_in_use
                                                    }
                                                </Text>
                                            </StatBody>
                                        </Flex>
                                        <SubBody>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="extrabold"
                                                color="brand.darkNavy"
                                                mb={{ base: 0.5, md: 1 }}
                                            >
                                                Tables
                                            </Text>
                                            <StatBody>
                                                <Tooltip
                                                    label="Active tables from metrics API (Source: metrics API)"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Text cursor="help">
                                                        Active
                                                    </Text>
                                                </Tooltip>
                                                <Text fontWeight={'semibold'}>
                                                    {
                                                        metrics.tables
                                                            .active_count
                                                    }
                                                </Text>
                                            </StatBody>
                                        </SubBody>
                                    </StatCard>
                                </Flex>
                            </Flex>
                        </Flex>
                    </TabPanel>

                    <TabPanel py={{ base: 3, md: 4 }} px={0}>
                        <Flex width={'full'}>
                            <StatCard
                                flex={1}
                                title={'Tables'}
                                timestamp={tables.timestamp}
                            >
                                <StatBody>
                                    <Tooltip
                                        label="Total tables in the database (both active and inactive)"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">Total Tables</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {tables.total_count}
                                    </Text>
                                </StatBody>
                                <StatBody>
                                    <Tooltip
                                        label="Tables currently active with players"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">Active Tables</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {
                                            tables.tables.filter(
                                                (t) => t.is_active
                                            ).length
                                        }
                                    </Text>
                                </StatBody>
                                <StatBody>
                                    <Tooltip
                                        label="Tables loaded in backend memory"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">In Memory</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {
                                            tables.tables.filter(
                                                (t) => t.in_memory
                                            ).length
                                        }
                                    </Text>
                                </StatBody>
                                {tables.tables.length > 0 ? (
                                    <Box
                                        maxHeight={'400px'}
                                        overflowY={'auto'}
                                        border="1px solid"
                                        borderColor="brand.lightGray"
                                        borderRadius="12px"
                                        bg="rgba(236, 238, 245, 0.3)"
                                    >
                                        <Accordion allowMultiple>
                                            {tables.tables.map(
                                                (table, index) => (
                                                    <AccordionItem
                                                        key={index}
                                                        borderBottom={
                                                            index <
                                                            tables.tables
                                                                .length -
                                                                1
                                                                ? '1px solid'
                                                                : 'none'
                                                        }
                                                        borderColor="rgba(12, 21, 49, 0.08)"
                                                    >
                                                        <h2>
                                                            <AccordionButton
                                                                py={3}
                                                                px={4}
                                                                _hover={{
                                                                    bg: 'brand.lightGray',
                                                                }}
                                                                _expanded={{
                                                                    bg: 'white',
                                                                    borderBottom:
                                                                        '1px solid',
                                                                    borderColor:
                                                                        'brand.lightGray',
                                                                }}
                                                                transition="all 0.2s"
                                                            >
                                                                <Box
                                                                    flex={1}
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="space-between"
                                                                    width="100%"
                                                                >
                                                                    <HStack
                                                                        gap={2}
                                                                        flex={1}
                                                                        minW={0}
                                                                    >
                                                                        <Tooltip
                                                                            label={
                                                                                table.is_active
                                                                                    ? 'Active'
                                                                                    : 'Inactive'
                                                                            }
                                                                            placement="top"
                                                                            hasArrow
                                                                        >
                                                                            <Box
                                                                                width="8px"
                                                                                height="8px"
                                                                                borderRadius="full"
                                                                                bg={
                                                                                    table.is_active
                                                                                        ? 'brand.green'
                                                                                        : 'gray.400'
                                                                                }
                                                                                boxShadow={
                                                                                    table.is_active
                                                                                        ? '0 0 8px rgba(54, 163, 123, 0.6)'
                                                                                        : 'none'
                                                                                }
                                                                                flexShrink={
                                                                                    0
                                                                                }
                                                                            />
                                                                        </Tooltip>
                                                                        <Tooltip
                                                                            label={
                                                                                table.name
                                                                            }
                                                                            placement="top"
                                                                            hasArrow
                                                                        >
                                                                            <Link
                                                                                href={`/table/${table.name}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    textDecoration:
                                                                                        'none',
                                                                                }}
                                                                            >
                                                                                <Text
                                                                                    fontFamily="monospace"
                                                                                    fontSize="xs"
                                                                                    color="brand.navy"
                                                                                    fontWeight="medium"
                                                                                    noOfLines={
                                                                                        1
                                                                                    }
                                                                                    textAlign="left"
                                                                                    _hover={{
                                                                                        color: 'brand.pink',
                                                                                        fontWeight:
                                                                                            'bold',
                                                                                    }}
                                                                                    cursor="pointer"
                                                                                    transition="all 0.2s"
                                                                                >
                                                                                    {
                                                                                        table.name
                                                                                    }
                                                                                </Text>
                                                                            </Link>
                                                                        </Tooltip>
                                                                        <Text
                                                                            fontSize="xs"
                                                                            color="brand.navy"
                                                                            opacity={
                                                                                0.6
                                                                            }
                                                                            flexShrink={
                                                                                0
                                                                            }
                                                                            ml={
                                                                                2
                                                                            }
                                                                        >
                                                                            {new Date(
                                                                                table.created_at
                                                                            ).toLocaleString(
                                                                                'en-US',
                                                                                {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                }
                                                                            )}
                                                                        </Text>
                                                                    </HStack>
                                                                    <HStack
                                                                        gap={2}
                                                                        flexShrink={
                                                                            0
                                                                        }
                                                                    >
                                                                        <Tooltip
                                                                            label="Number of players currently in this table"
                                                                            placement="top"
                                                                            hasArrow
                                                                        >
                                                                            <Badge
                                                                                bg="brand.green"
                                                                                color="white"
                                                                                fontSize="xs"
                                                                                fontWeight="bold"
                                                                                px={
                                                                                    2
                                                                                }
                                                                                py={
                                                                                    1
                                                                                }
                                                                                borderRadius="full"
                                                                                cursor="help"
                                                                            >
                                                                                {
                                                                                    table.player_count
                                                                                }
                                                                            </Badge>
                                                                        </Tooltip>
                                                                        {table.in_memory && (
                                                                            <Tooltip
                                                                                label="Table is currently loaded in backend memory for faster performance"
                                                                                placement="top"
                                                                                hasArrow
                                                                            >
                                                                                <Badge
                                                                                    bg="brand.yellow"
                                                                                    color="brand.darkNavy"
                                                                                    fontSize="xs"
                                                                                    fontWeight="bold"
                                                                                    px={
                                                                                        2
                                                                                    }
                                                                                    py={
                                                                                        1
                                                                                    }
                                                                                    borderRadius="full"
                                                                                    cursor="help"
                                                                                >
                                                                                    MEM
                                                                                </Badge>
                                                                            </Tooltip>
                                                                        )}
                                                                    </HStack>
                                                                </Box>
                                                                <AccordionIcon
                                                                    ml={3}
                                                                    color="brand.navy"
                                                                />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel
                                                            pb={4}
                                                            pt={3}
                                                            px={4}
                                                            bg="rgba(236, 238, 245, 0.5)"
                                                        >
                                                            <VStack
                                                                gap={3}
                                                                align="stretch"
                                                                divider={
                                                                    <Divider
                                                                        borderColor="rgba(12, 21, 49, 0.1)"
                                                                        opacity={
                                                                            1
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                <Flex
                                                                    justify="space-between"
                                                                    align="center"
                                                                >
                                                                    <Text
                                                                        fontSize="sm"
                                                                        color="brand.navy"
                                                                        fontWeight="medium"
                                                                        opacity={
                                                                            0.7
                                                                        }
                                                                    >
                                                                        Owner
                                                                    </Text>
                                                                    <Tooltip
                                                                        label={
                                                                            table.owner_uuid
                                                                        }
                                                                        placement="top"
                                                                        hasArrow
                                                                    >
                                                                        <Text
                                                                            fontSize="xs"
                                                                            fontFamily="monospace"
                                                                            color="brand.darkNavy"
                                                                            fontWeight="medium"
                                                                            textAlign="right"
                                                                            cursor="help"
                                                                        >
                                                                            {table
                                                                                .owner_uuid
                                                                                .length >
                                                                            20
                                                                                ? `${table.owner_uuid.slice(0, 8)}...${table.owner_uuid.slice(-6)}`
                                                                                : table.owner_uuid}
                                                                        </Text>
                                                                    </Tooltip>
                                                                </Flex>
                                                                <Flex
                                                                    justify="space-between"
                                                                    align="center"
                                                                >
                                                                    <Text
                                                                        fontSize="sm"
                                                                        color="brand.navy"
                                                                        fontWeight="medium"
                                                                        opacity={
                                                                            0.7
                                                                        }
                                                                    >
                                                                        Buy-in
                                                                        Range
                                                                    </Text>
                                                                    <Text
                                                                        fontSize="sm"
                                                                        fontWeight="bold"
                                                                        color="brand.darkNavy"
                                                                        textAlign="right"
                                                                    >
                                                                        {
                                                                            table.min_buy_in
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            table.max_buy_in
                                                                        }
                                                                    </Text>
                                                                </Flex>
                                                            </VStack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                )
                                            )}
                                        </Accordion>
                                    </Box>
                                ) : (
                                    <Flex
                                        justifyContent={'center'}
                                        py={8}
                                        bg="rgba(236, 238, 245, 0.4)"
                                        borderRadius="12px"
                                    >
                                        <Text
                                            color={'brand.navy'}
                                            fontWeight="medium"
                                        >
                                            No tables found
                                        </Text>
                                    </Flex>
                                )}
                            </StatCard>
                        </Flex>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Flex>
    );
};

export default page;
