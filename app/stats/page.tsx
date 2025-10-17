import {
    Text,
    Flex,
    Box,
    Tooltip,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import {
    getDebugConnections,
    getDebugTables,
    getHealth,
    getHealthDb,
    getLiveStats,
    getMetrics,
    getStats,
} from '../hooks/server_actions';
import {
    Health,
    HealthDb,
    Metrics,
    DebugTableEntry,
    DebugTables,
    DebugTableRow,
    DebugConnections,
    StatsResponse,
    LiveStatsResponse,
} from '../stats/types';
import { ReactNode } from 'react';

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

const formatDebugTable = (table: DebugTableRow) => {
    if (typeof table === 'string') {
        return table;
    }

    return `${table.name} (${table.player_count})`;
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

    const defaultDebugTables: DebugTables = {
        tables: [],
        timestamp: now,
        total_count: 0,
    };

    const defaultDebugConnections: DebugConnections = {
        timestamp: now,
        total_clients: 0,
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

    const [
        health,
        healthDb,
        metrics,
        debugTables,
        debugConnections,
        stats,
        liveStats,
    ]: [
        Health,
        HealthDb,
        Metrics,
        DebugTables,
        DebugConnections,
        StatsResponse,
        LiveStatsResponse,
    ] = await Promise.all([
        withFallback(getHealth(), defaultHealth, 'health'),
        withFallback(getHealthDb(), defaultHealthDb, 'database health'),
        withFallback(getMetrics(), defaultMetrics, 'metrics'),
        withFallback(getDebugTables(), defaultDebugTables, 'debug tables'),
        withFallback(
            getDebugConnections(),
            defaultDebugConnections,
            'debug connections'
        ),
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
            <Text fontSize="3xl" fontWeight="bold" mb={6} color={'white'}>
                Stats
            </Text>
            <Flex
                direction={'column'}
                gap={2}
                width={{ base: 'full', lg: '70vw' }}
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
                        timestamp={debugTables.timestamp}
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
                                <Text cursor="help">WebSocket Connections</Text>
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
                                <Text cursor="help">Active Tables</Text>
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
                                <Text cursor="help">Active Players</Text>
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
                                <Text cursor="help">Active Tables</Text>
                            </Tooltip>
                            <Text fontWeight={'semibold'}>
                                {stats.data.active_tables_count}
                            </Text>
                        </StatBody>
                        <SubBody>
                            <Text variant={'statSubHead'}>Last 24 hrs</Text>
                            <StatBody>
                                <Tooltip
                                    label="Tables created in the last 24 hours (Source: stats database query)"
                                    placement="top"
                                    hasArrow
                                >
                                    <Text cursor="help">Tables</Text>
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
                            <Text variant={'statSubHead'}>Total</Text>
                            <StatBody>
                                <Tooltip
                                    label="Total hands played since launch (Source: stats database query)"
                                    placement="top"
                                    hasArrow
                                >
                                    <Text cursor="help">Hands Played</Text>
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
                                    <Text cursor="help">Tables Created</Text>
                                </Tooltip>
                                <Text fontWeight={'semibold'}>
                                    {stats.data.total_tables_created}
                                </Text>
                            </StatBody>
                            <StatBody>
                                <Tooltip
                                    label="Total unique players who have joined since launch (Source: stats database query)"
                                    placement="top"
                                    hasArrow
                                >
                                    <Text cursor="help">Unique Players</Text>
                                </Tooltip>
                                <Text fontWeight={'semibold'}>
                                    {stats.data.total_unique_players}
                                </Text>
                            </StatBody>
                        </SubBody>
                    </StatCard>
                    <Flex flex={1} width={'full'} direction={'column'} gap={2}>
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
                                        healthDb.database === 'connected'
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
                                    <Text cursor="help">Database Status</Text>
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
                                    <Text variant={'statSubHead'} cursor="help">
                                        Database Pool
                                    </Text>
                                </Tooltip>
                                <StatBody>
                                    <Tooltip
                                        label="Idle database connections in the pool (Source: metrics API)"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">Idle</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {metrics.database.connections_idle}
                                    </Text>
                                </StatBody>
                                <StatBody>
                                    <Tooltip
                                        label="Database connections currently in use for queries (Source: metrics API)"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">Active</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {metrics.database.connections_in_use}
                                    </Text>
                                </StatBody>
                            </Flex>
                            <SubBody>
                                <Text variant={'statSubHead'}>Tables</Text>
                                <StatBody>
                                    <Tooltip
                                        label="Active tables from metrics API (Source: metrics API)"
                                        placement="top"
                                        hasArrow
                                    >
                                        <Text cursor="help">Active</Text>
                                    </Tooltip>
                                    <Text fontWeight={'semibold'}>
                                        {metrics.tables.active_count}
                                    </Text>
                                </StatBody>
                            </SubBody>
                        </StatCard>
                    </Flex>
                </Flex>
                <Flex width={'full'}>
                    <StatCard
                        flex={1}
                        title={'Debug'}
                        timestamp={debugTables.timestamp}
                    >
                        <StatBody>
                            <Tooltip
                                label="Debug info: Total WebSocket clients connected (Source: debugConnections API)"
                                placement="top"
                                hasArrow
                            >
                                <Text cursor="help">WebSocket Clients</Text>
                            </Tooltip>
                            <Text fontWeight={'semibold'}>
                                {debugConnections.total_clients}
                            </Text>
                        </StatBody>
                        <StatBody>
                            <Tooltip
                                label="Debug info: Total tables in memory with player details listed below (Source: debugTables API)"
                                placement="top"
                                hasArrow
                            >
                                <Text cursor="help">Tables</Text>
                            </Tooltip>
                            <Text fontWeight={'semibold'}>
                                {debugTables.total_count}
                            </Text>
                        </StatBody>
                        {debugTables.tables.at(0) ? (
                            <Box
                                maxHeight={'200px'}
                                overflowY={'auto'}
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                                borderRadius="md"
                            >
                                <Table size="sm" variant="simple">
                                    <Thead
                                        bg="whiteAlpha.100"
                                        position="sticky"
                                        top={0}
                                        zIndex={1}
                                    >
                                        <Tr>
                                            <Th
                                                color="white"
                                                borderColor="whiteAlpha.300"
                                            >
                                                Table Name
                                            </Th>
                                            <Th
                                                color="white"
                                                borderColor="whiteAlpha.300"
                                                isNumeric
                                            >
                                                Players
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {debugTables.tables.map(
                                            (table, index) => {
                                                const tableName =
                                                    typeof table === 'string'
                                                        ? table
                                                        : table.name;
                                                const playerCount =
                                                    typeof table === 'string'
                                                        ? '-'
                                                        : table.player_count;

                                                return (
                                                    <Tr
                                                        key={index}
                                                        _hover={{
                                                            bg: 'whiteAlpha.50',
                                                        }}
                                                    >
                                                        <Td
                                                            color="statBody"
                                                            borderColor="whiteAlpha.300"
                                                            fontFamily="monospace"
                                                            fontSize="xs"
                                                        >
                                                            {tableName}
                                                        </Td>
                                                        <Td
                                                            color="statBody"
                                                            borderColor="whiteAlpha.300"
                                                            isNumeric
                                                            fontWeight="semibold"
                                                        >
                                                            {playerCount}
                                                        </Td>
                                                    </Tr>
                                                );
                                            }
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        ) : (
                            <Flex justifyContent={'center'}>
                                <Text color={'grey'}>No tables</Text>
                            </Flex>
                        )}
                    </StatCard>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default page;
