import { Text, Flex, Box, List, ListItem } from "@chakra-ui/react"
import { getDebugConnections, getDebugTables, getHealth, getHealthDb, getLiveStats, getMetrics, getStats } from "../hooks/server_actions"
import {
    Health,
    HealthDb,
    Metrics,
    DebugTables,
    DebugConnections,
    StatsResponse,
    LiveStatsResponse,
} from "../stats/types";
import { ReactNode } from "react";

const StatCard = ({ title, timestamp, children }: { title: string; timestamp: string; children?: ReactNode }) => (
    <Flex direction={'column'} bg={'gray.200'} color={'white'} width={'300px'} p={6} rounded={'lg'}>
        <Text color={'white'} fontSize={'xl'} fontWeight={'extrabold'} mb={'4'}>{title}</Text>
        <Flex direction={'column'} gap={2} height={'full'}>
            {children}
            <Box mt={'auto'} alignSelf={'center'}>
                <Timestamp time={timestamp} />
            </Box>
        </Flex>
    </Flex>
)

const Timestamp = ({ time }: { time: string }) => {
    const formattedTime = new Date(time).toLocaleString()

    return (
        <Text color={'grey'}>
            {formattedTime}
        </Text>
    )
}

const StatBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex justify="space-between" align="center" color={'statBody'}>
            {children}
        </Flex>
    )
}

const SubBody = ({ children }: { children: ReactNode }) => {
    return (
        <Flex direction={'column'} gap={2}>
            {children}
        </Flex>
    )
}

const page = async () => {
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
            LiveStatsResponse
        ] = await Promise.all([
            getHealth(),
            getHealthDb(),
            getMetrics(),
            getDebugTables(),
            getDebugConnections(),
            getStats(),
            getLiveStats(),
        ]);

    return (
        <Flex direction={'column'} bg={'charcoal.800'} pt={26} minHeight={'100vh'} alignItems={'center'} w={'100%'} px={30}>
            <Text fontSize="3xl" fontWeight="bold" mb={6} color={'white'}>Stats</Text>
            <Flex wrap={'wrap'} gap={2} maxWidth={'70vw'}>
                <StatCard title={"Stats"} timestamp={debugTables.timestamp}>
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
                </StatCard >
                <StatCard title={"Live Stats"} timestamp={liveStats.timestamp}>
                    <StatBody>
                        <Text>Active Connections</Text>
                        <Text>{liveStats.data.active_connections}</Text>
                    </StatBody>
                    <StatBody>
                        <Text>Active Tables</Text>
                        <Text>{liveStats.data.active_tables}</Text>
                    </StatBody>
                </StatCard>
                <StatCard title={"Health"} timestamp={health.timestamp}>
                    <StatBody>
                        <Text>Status</Text>
                        <Flex
                            as="span"
                            w="16px"
                            h="16px"
                            borderRadius="full"
                            bg={health.status === 'healthy' ? 'green.400' : 'red.500'}
                            border="2px solid"
                            borderColor="white"
                            aria-label={health.status}
                        />
                    </StatBody>
                </StatCard >
                <StatCard title={"Database Health"} timestamp={healthDb.timestamp}>
                    <StatBody>
                        <Text>Connection</Text>
                        <Flex
                            as="span"
                            w="16px"
                            h="16px"
                            borderRadius="full"
                            bg={healthDb.database === 'connected' ? 'green.400' : 'red.500'}
                            border="2px solid"
                            borderColor="white"
                            aria-label={healthDb.database}
                        />
                    </StatBody>
                    <StatBody>
                        <Text>Status</Text>
                        <Flex
                            as="span"
                            w="16px"
                            h="16px"
                            borderRadius="full"
                            bg={health.status === 'healthy' ? 'green.400' : 'red.500'}
                            border="2px solid"
                            borderColor="white"
                            aria-label={healthDb.status}
                        />
                    </StatBody>
                </StatCard >
                <StatCard title={"Metrics"} timestamp={metrics.timestamp}>
                    <Flex direction={'column'} gap={2}>
                        <Text variant={'statSubHead'}>Connections</Text>
                        <StatBody>
                            <Text>Idle</Text>
                            <Text>{metrics.database.connections_idle}</Text>
                        </StatBody>
                        <StatBody>
                            <Text>Active</Text>
                            <Text>{metrics.database.connections_in_use}</Text>
                        </StatBody>
                    </Flex>
                    <SubBody>
                        <Text variant={'statSubHead'}>Tables</Text>
                        <StatBody>
                            <Text>Active</Text>
                            <Text>{metrics.tables.active_count}</Text>
                        </StatBody>
                    </SubBody>
                </StatCard >
                <StatCard title={"Debug Tables"} timestamp={debugTables.timestamp}>
                    <StatBody>
                        <Text>Tables</Text>
                        <Text>{debugTables.total_count}</Text>
                    </StatBody>
                    {
                        debugTables.tables.at(0) ? (
                            <List maxHeight={'100px'} overflowY={'scroll'} flexDirection={'column'}>
                                {
                                    debugTables.tables.map((table, index) => {
                                        return (
                                            <ListItem key={index}>
                                                <Text>{table}</Text>
                                            </ListItem>
                                        )
                                    })
                                }
                            </List>
                        ) : (
                            <Flex justifyContent={'center'}>
                                <Text color={'charcoal.600'}>No tables</Text>
                            </Flex>
                        )
                    }
                </StatCard >
                <StatCard title={"Debug Connections"} timestamp={debugConnections.timestamp}>
                    <StatBody>
                        <Text>Connections</Text>
                        <Text>{debugConnections.total_clients}</Text>
                    </StatBody>
                </StatCard >
            </Flex>
        </Flex >
    )
}

export default page
