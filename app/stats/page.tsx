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

// Revalidate stats data every 30 seconds
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
        bg={'gray.200'}
        color={'white'}
        p={6}
        rounded={'lg'}
    >
        <Text color={'white'} fontSize={'xl'} fontWeight={'extrabold'} mb={'4'}>
            {title}
        </Text>
        <Flex direction={'column'} gap={2} height={'full'}>
            {children}
            <Box mt={'auto'} alignSelf={'center'}>
                <Timestamp time={timestamp} />
            </Box>
        </Flex>
    </Flex>
);

const Timestamp = ({ time }: { time: string }) => {
    const formattedTime = new Date(time).toLocaleString();

    return (
        <Text
            fontSize={'sm'}
            fontWeight={'light'}
            color={'grey'}
            align={'center'}
        >
            As of {formattedTime}
        </Text>
    );
};

const StatBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex justify="space-between" align="center" color={'statBody'}>
            {children}
        </Flex>
    );
};

const SubBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex direction={'column'} gap={2}>
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
            bg={'charcoal.800'}
            pt={28}
            pb={10}
            minHeight={'100vh'}
            alignItems={'center'}
            w={'100%'}
            px={30}
        >
            <Tabs
                defaultIndex={0}
                width={{ base: 'full', lg: '70vw' }}
                size="lg"
                variant="enclosed"
                colorScheme="blue"
            >
                <TabList
                    borderBottom="2px solid"
                    borderColor="whiteAlpha.300"
                    mb={4}
                >
                    <Tab
                        fontSize="2xl"
                        py={6}
                        px={8}
                        fontWeight="bold"
                        color="whiteAlpha.600"
                        borderColor="transparent"
                        _selected={{
                            color: 'white',
                            borderColor: 'white',
                            borderBottom: '4px solid',
                            borderTop: '1px solid',
                            borderLeft: '1px solid',
                            borderRight: '1px solid',
                            bg: 'whiteAlpha.100',
                            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
                        }}
                        _hover={{
                            color: 'whiteAlpha.800',
                            bg: 'whiteAlpha.50',
                        }}
                        transition="all 0.3s"
                    >
                        General Stats
                    </Tab>
                    <Tab
                        fontSize="2xl"
                        py={6}
                        px={8}
                        fontWeight="bold"
                        color="whiteAlpha.600"
                        borderColor="transparent"
                        _selected={{
                            color: 'white',
                            borderColor: 'white',
                            borderBottom: '4px solid',
                            borderTop: '1px solid',
                            borderLeft: '1px solid',
                            borderRight: '1px solid',
                            bg: 'whiteAlpha.100',
                            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
                        }}
                        _hover={{
                            color: 'whiteAlpha.800',
                            bg: 'whiteAlpha.50',
                        }}
                        transition="all 0.3s"
                    >
                        Tables
                    </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel py={6} px={0}>
                        <Flex
                            direction={'column'}
                            gap={2}
                            width={'full'}
                            pb={{ base: 4, lg: 0 }}
                        >
                            <Flex
                                width={'full'}
                                gap={2}
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
                                                fontWeight={'semibold'}
                                                color={
                                                    health.status === 'healthy'
                                                        ? 'green.400'
                                                        : 'red.500'
                                                }
                                                cursor="help"
                                            >
                                                {health.status}
                                            </Text>
                                        </Tooltip>
                                        <Flex
                                            as="span"
                                            w="20px"
                                            h="20px"
                                            borderRadius="full"
                                            bg={
                                                health.status === 'healthy'
                                                    ? 'green.400'
                                                    : 'red.500'
                                            }
                                            border="3px solid"
                                            borderColor="white"
                                            boxShadow="0 0 8px rgba(0, 0, 0, 0.3)"
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
                                        <Text variant={'statSubHead'}>
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
                                        <Text variant={'statSubHead'}>
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
                                    gap={2}
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
                                                <Text cursor="help">
                                                    Database Connection
                                                </Text>
                                            </Tooltip>
                                            <Flex
                                                as="span"
                                                w="20px"
                                                h="20px"
                                                borderRadius="full"
                                                bg={
                                                    healthDb.database ===
                                                    'connected'
                                                        ? 'green.400'
                                                        : 'red.500'
                                                }
                                                border="3px solid"
                                                borderColor="white"
                                                boxShadow="0 0 8px rgba(0, 0, 0, 0.3)"
                                                aria-label={healthDb.database}
                                            />
                                        </StatBody>
                                        <StatBody>
                                            <Tooltip
                                                label="Overall database health and query response status (Source: healthDb API)"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text cursor="help">
                                                    Database Status
                                                </Text>
                                            </Tooltip>
                                            <Flex
                                                as="span"
                                                w="20px"
                                                h="20px"
                                                borderRadius="full"
                                                bg={
                                                    health.status === 'healthy'
                                                        ? 'green.400'
                                                        : 'red.500'
                                                }
                                                border="3px solid"
                                                borderColor="white"
                                                boxShadow="0 0 8px rgba(0, 0, 0, 0.3)"
                                                aria-label={healthDb.status}
                                            />
                                        </StatBody>
                                    </StatCard>
                                    <StatCard
                                        flex={1}
                                        title={'Metrics'}
                                        timestamp={metrics.timestamp}
                                    >
                                        <Flex direction={'column'} gap={2}>
                                            <Tooltip
                                                label="Connection pool for database queries - different from WebSocket connections"
                                                placement="top"
                                                hasArrow
                                            >
                                                <Text
                                                    variant={'statSubHead'}
                                                    cursor="help"
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
                                            <Text variant={'statSubHead'}>
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

                    <TabPanel py={6} px={0}>
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
                                        borderColor="whiteAlpha.200"
                                        borderRadius="md"
                                        bg="whiteAlpha.50"
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
                                                        borderColor="whiteAlpha.200"
                                                    >
                                                        <h2>
                                                            <AccordionButton
                                                                py={3}
                                                                px={4}
                                                                _hover={{
                                                                    bg: 'whiteAlpha.100',
                                                                }}
                                                                _expanded={{
                                                                    bg: 'whiteAlpha.100',
                                                                    borderBottom:
                                                                        '1px solid',
                                                                    borderColor:
                                                                        'whiteAlpha.200',
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
                                                                                        ? 'green.400'
                                                                                        : 'gray.600'
                                                                                }
                                                                                boxShadow={
                                                                                    table.is_active
                                                                                        ? '0 0 8px rgba(72, 187, 120, 0.6)'
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
                                                                                    flex: 1,
                                                                                    textDecoration:
                                                                                        'none',
                                                                                }}
                                                                            >
                                                                                <Text
                                                                                    fontFamily="monospace"
                                                                                    fontSize="xs"
                                                                                    color="statBody"
                                                                                    noOfLines={
                                                                                        1
                                                                                    }
                                                                                    textAlign="left"
                                                                                    _hover={{
                                                                                        color: 'blue.400',
                                                                                        fontWeight:
                                                                                            'bold',
                                                                                    }}
                                                                                    cursor="alias"
                                                                                    transition="all 0.2s"
                                                                                >
                                                                                    {
                                                                                        table.name
                                                                                    }
                                                                                </Text>
                                                                            </Link>
                                                                        </Tooltip>
                                                                    </HStack>
                                                                    <HStack
                                                                        gap={2}
                                                                        flexShrink={
                                                                            0
                                                                        }
                                                                    >
                                                                        <Badge
                                                                            colorScheme="blue"
                                                                            fontSize="xs"
                                                                            fontWeight="bold"
                                                                            px={
                                                                                2
                                                                            }
                                                                            py={
                                                                                1
                                                                            }
                                                                            borderRadius="sm"
                                                                        >
                                                                            {
                                                                                table.player_count
                                                                            }
                                                                        </Badge>
                                                                        {table.in_memory && (
                                                                            <Badge
                                                                                colorScheme="purple"
                                                                                fontSize="xs"
                                                                                fontWeight="bold"
                                                                                px={
                                                                                    2
                                                                                }
                                                                                py={
                                                                                    1
                                                                                }
                                                                                borderRadius="sm"
                                                                            >
                                                                                MEM
                                                                            </Badge>
                                                                        )}
                                                                    </HStack>
                                                                </Box>
                                                                <AccordionIcon
                                                                    ml={3}
                                                                    color="statBody"
                                                                />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel
                                                            pb={4}
                                                            pt={3}
                                                            px={4}
                                                            bg="blackAlpha.200"
                                                        >
                                                            <VStack
                                                                gap={3}
                                                                align="stretch"
                                                                divider={
                                                                    <Divider
                                                                        borderColor="whiteAlpha.200"
                                                                        opacity={
                                                                            0.5
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
                                                                        color="gray.400"
                                                                        fontWeight="medium"
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
                                                                            color="statBody"
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
                                                                        color="gray.400"
                                                                        fontWeight="medium"
                                                                    >
                                                                        Buy-in
                                                                        Range
                                                                    </Text>
                                                                    <Text
                                                                        fontSize="sm"
                                                                        fontWeight="semibold"
                                                                        color="statBody"
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
                                                                <Flex
                                                                    justify="space-between"
                                                                    align="center"
                                                                >
                                                                    <Text
                                                                        fontSize="sm"
                                                                        color="gray.400"
                                                                        fontWeight="medium"
                                                                    >
                                                                        Created
                                                                    </Text>
                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="statBody"
                                                                        textAlign="right"
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
                                                                </Flex>
                                                            </VStack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                )
                                            )}
                                        </Accordion>
                                    </Box>
                                ) : (
                                    <Flex justifyContent={'center'} py={4}>
                                        <Text color={'grey'}>
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
