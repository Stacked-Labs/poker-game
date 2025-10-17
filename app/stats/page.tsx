import { Text, Flex, Box, List, ListItem } from '@chakra-ui/react';
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
                            <Text
                                textTransform={'capitalize'}
                                color={
                                    health.status === 'healthy'
                                        ? 'green.400'
                                        : 'red.500'
                                }
                            >
                                {health.status}
                            </Text>
                            <Flex
                                as="span"
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                bg={
                                    health.status === 'healthy'
                                        ? 'green.400'
                                        : 'red.500'
                                }
                                border="2px solid"
                                borderColor="white"
                                aria-label={health.status}
                            />
                        </StatBody>
                        <Timestamp time={health.timestamp} />
                        <StatBody>
                            <Text>Active Connections</Text>
                            <Text>{liveStats.data.active_connections}</Text>
                        </StatBody>
                        <StatBody>
                            <Text>Active Tables</Text>
                            <Text>{liveStats.data.active_tables}</Text>
                        </StatBody>
                        <Timestamp time={liveStats.timestamp} />
                        <StatBody>
                            <Text>Active Players</Text>
                            <Text>{stats.data.active_players_count}</Text>
                        </StatBody>
                        <StatBody>
                            <Text>Active Tables</Text>
                            <Text>{stats.data.active_tables_count}</Text>
                        </StatBody>
                        <SubBody>
                            <Text variant={'statSubHead'}>Last 24 hrs</Text>
                            <StatBody>
                                <Text>Tables</Text>
                                <Text>{stats.data.tables_last_24h}</Text>
                            </StatBody>
                            <StatBody>
                                <Text>Hands</Text>
                                <Text>{stats.data.hands_last_24h}</Text>
                            </StatBody>
                        </SubBody>
                        <SubBody>
                            <Text variant={'statSubHead'}>Total</Text>
                            <StatBody>
                                <Text>Hands Played</Text>
                                <Text>{stats.data.total_hands_played}</Text>
                            </StatBody>
                            <StatBody>
                                <Text>Tables Created</Text>
                                <Text>{stats.data.total_tables_created}</Text>
                            </StatBody>
                            <StatBody>
                                <Text>Unique Players</Text>
                                <Text>{stats.data.total_hands_played}</Text>
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
                                <Text>Database Connection</Text>
                                <Flex
                                    as="span"
                                    w="16px"
                                    h="16px"
                                    borderRadius="full"
                                    bg={
                                        healthDb.database === 'connected'
                                            ? 'green.400'
                                            : 'red.500'
                                    }
                                    border="2px solid"
                                    borderColor="white"
                                    aria-label={healthDb.database}
                                />
                            </StatBody>
                            <StatBody>
                                <Text>Database Status</Text>
                                <Flex
                                    as="span"
                                    w="16px"
                                    h="16px"
                                    borderRadius="full"
                                    bg={
                                        health.status === 'healthy'
                                            ? 'green.400'
                                            : 'red.500'
                                    }
                                    border="2px solid"
                                    borderColor="white"
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
                                <Text variant={'statSubHead'}>Connections</Text>
                                <StatBody>
                                    <Text>Idle</Text>
                                    <Text>
                                        {metrics.database.connections_idle}
                                    </Text>
                                </StatBody>
                                <StatBody>
                                    <Text>Active</Text>
                                    <Text>
                                        {metrics.database.connections_in_use}
                                    </Text>
                                </StatBody>
                            </Flex>
                            <SubBody>
                                <Text variant={'statSubHead'}>Tables</Text>
                                <StatBody>
                                    <Text>Active</Text>
                                    <Text>{metrics.tables.active_count}</Text>
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
                            <Text>Connections</Text>
                            <Text>{debugConnections.total_clients}</Text>
                        </StatBody>
                        <StatBody>
                            <Text>Tables</Text>
                            <Text>{debugTables.total_count}</Text>
                        </StatBody>
                        {debugTables.tables.at(0) ? (
                            <List
                                maxHeight={'100px'}
                                overflowY={'scroll'}
                                flexDirection={'column'}
                            >
                                {debugTables.tables.map((table, index) => {
                                    return (
                                        <ListItem key={index}>
                                            <Text>
                                                {formatDebugTable(table)}
                                            </Text>
                                        </ListItem>
                                    );
                                })}
                            </List>
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
