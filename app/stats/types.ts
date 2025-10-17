export interface Health {
    status: string;
    timestamp: string;
}

export interface HealthDb {
    database: string;
    status: string;
    timestamp: string;
}

export interface MetricsDatabase {
    connections_idle: number;
    connections_in_use: number;
    last_health_check: string;
}

export interface MetricsTables {
    active_count: number;
}

export interface Metrics {
    database: MetricsDatabase;
    tables: MetricsTables;
    timestamp: string;
}

export interface DebugTableEntry {
    name: string;
    player_count: number;
}

export type DebugTableRow = string | DebugTableEntry;

export interface DebugTables {
    tables: DebugTableRow[];
    timestamp: string;
    total_count: number;
}

export interface DebugConnections {
    timestamp: string;
    total_clients: number;
}

export interface StatsData {
    active_players_count: number;
    active_tables_count: number;
    hands_last_24h: number;
    tables_last_24h: number;
    total_hands_played: number;
    total_tables_created: number;
    total_unique_players: number;
}

export interface StatsResponse {
    data: StatsData;
    success: boolean;
    timestamp: string;
}

export interface LiveStatsData {
    active_connections: number;
    active_tables: number;
}

export interface LiveStatsResponse {
    data: LiveStatsData;
    success: boolean;
    timestamp: string;
}

export interface SystemStats {
    health: Health;
    healthDb: HealthDb;
    metrics: Metrics;
    debugTables: DebugTables;
    debugConnections: DebugConnections;
    stats: StatsResponse;
    liveStats: LiveStatsResponse;
}
