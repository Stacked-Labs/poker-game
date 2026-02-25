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

export interface TableEntry {
    name: string;
    created_at: string;
    is_active: boolean;
    owner_uuid: string;
    min_buy_in: number;
    max_buy_in: number;
    player_count: number;
    in_memory: boolean;
}

export interface TablesResponse {
    success: boolean;
    tables: TableEntry[];
    total_count: number;
    timestamp: string;
}

export interface SystemStats {
    health: Health;
    healthDb: HealthDb;
    metrics: Metrics;
    tables: TablesResponse;
    stats: StatsResponse;
    liveStats: LiveStatsResponse;
}

// ============================================================
// Admin types
// ============================================================

export interface AdminStatsData {
    total_tables_created: number;
    total_active_tables: number;
    total_hands_played: number;
    total_unique_players: number;
    hands_last_24h: number;
    tables_last_24h: number;
    crypto_tables_total: number;
    free_tables_total: number;
    unique_wallets: number;
    hands_last_7d: number;
    hands_last_30d: number;
    tables_last_7d: number;
    tables_last_30d: number;
    active_tables_count: number;
    active_players_count: number;
    // Per-type time-bucketed splits
    crypto_tables_24h: number;
    crypto_tables_7d: number;
    crypto_tables_30d: number;
    free_tables_24h: number;
    free_tables_7d: number;
    free_tables_30d: number;
    crypto_hands_total: number;
    crypto_hands_24h: number;
    crypto_hands_7d: number;
    crypto_hands_30d: number;
    free_hands_total: number;
    free_hands_24h: number;
    free_hands_7d: number;
    free_hands_30d: number;
}

export interface AdminStatsResponse {
    success: boolean;
    data: AdminStatsData;
    timestamp: string;
}

export interface AdminLiveStatsData {
    active_tables: number;
    active_connections: number;
    tables_with_players: number;
    hub_tables_in_memory: number;
}

export interface AdminLiveStatsResponse {
    success: boolean;
    data: AdminLiveStatsData;
    timestamp: string;
}

export interface AdminTableEntry {
    name: string;
    is_crypto: boolean;
    is_active: boolean;
    in_memory: boolean;
    created_at: string;
    owner_uuid: string;
    owner_wallet: string;
    player_count: number;
    ws_connections: number;
    blinds: { sb: number | null; bb: number | null };
}

export interface AdminTablesResponse {
    success: boolean;
    tables: AdminTableEntry[];
    total_count: number;
    timestamp: string;
}

export interface AdminHealthPostgres {
    status: string;
    latency_ms: number;
    pool_idle: number;
    pool_active: number;
}

export interface AdminHealthRedis {
    status: string;
    latency_ms: number;
    memory_used: string;
    streams: Record<string, number>;
}

export interface AdminHealthHub {
    tables_in_memory: number;
    ws_connections: number;
}

export interface AdminHealthEngine {
    status: string;
}

export interface AdminHealthThirdweb {
    aggregate_state: string;   // "operational" | "degraded" | "downtime" | "unknown"
    degraded_services: string[];
    url: string;
}

export interface AdminHealthResponse {
    postgres: AdminHealthPostgres;
    redis: AdminHealthRedis;
    hub: AdminHealthHub;
    engine: AdminHealthEngine;
    thirdweb: AdminHealthThirdweb;
    timestamp: string;
}

export interface PendingSettlement {
    table: string;
    hand_id: number;
    queue_id: string;
    player_count: number;
    thirdweb_status?: string;
    thirdweb_error?: string;
}

export interface SettlementHealthResponse {
    pending_count: number;
    pending_settlements: PendingSettlement[];
    timestamp: string;
}

export interface IndexerHealthData {
    height: number | null;
    chainTip: number | null;
    lag: number | null;
    healthy: boolean;
    rakeAllTimeUsdc: string;
    rake24hUsdc: string;
    rake7dUsdc: string;
    rake30dUsdc: string;
    totalHands: number;
}
