'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { AppContext } from './AppStoreProvider';
import { fetchTableEvents } from '@/app/hooks/server_actions';
import { GameEventRecord, EventsResponse } from '@/app/interfaces';

interface GameEventsContextType {
    events: GameEventRecord[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMoreEvents: () => Promise<void>;
    refreshEvents: () => Promise<void>;
}

const GameEventsContext = createContext<GameEventsContextType | undefined>(
    undefined
);

export const useGameEvents = () => {
    const context = useContext(GameEventsContext);
    if (!context) {
        throw new Error('useGameEvents must be used within GameEventsProvider');
    }
    return context;
};

interface GameEventsProviderProps {
    children: React.ReactNode;
    isModalOpen?: boolean;
    eventTypes?: string[]; // Optional filter for specific event types (e.g., financial events for Ledger)
}

export const GameEventsProvider: React.FC<GameEventsProviderProps> = ({
    children,
    isModalOpen = false,
    eventTypes,
}) => {
    const { appState } = useContext(AppContext);
    const [events, setEvents] = useState<GameEventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 50;

    // Helper function to fetch ALL events by paginating through all pages
    // Optional eventTypes filter reduces data transfer for specific use cases (e.g., Ledger)
    const fetchAllEvents = useCallback(
        async (
            tableName: string,
            eventTypes?: string[]
        ): Promise<GameEventRecord[]> => {
            let allEvents: GameEventRecord[] = [];
            let currentOffset = 0;
            let hasMorePages = true;

            const filterDesc =
                eventTypes && eventTypes.length > 0
                    ? ` (filtered: ${eventTypes.join(', ')})`
                    : ' (all events)';

            console.log(
                '[GameEventsProvider] Starting to fetch events for table:',
                tableName + filterDesc
            );

            while (hasMorePages) {
                const response: EventsResponse = await fetchTableEvents(
                    tableName,
                    limit,
                    currentOffset,
                    eventTypes
                );

                allEvents = [...allEvents, ...response.events];
                hasMorePages = response.has_more;
                currentOffset += response.events.length;

                console.log('[GameEventsProvider] Fetched page:', {
                    page_events: response.events.length,
                    total_so_far: allEvents.length,
                    has_more: hasMorePages,
                    applied_filters: response.event_types,
                });
            }

            console.log('[GameEventsProvider] Finished fetching events:', {
                total_count: allEvents.length,
                filters_applied: eventTypes || 'none',
            });

            return allEvents;
        },
        []
    );

    // Load initial events when table changes
    useEffect(() => {
        const loadInitialEvents = async () => {
            if (!appState.table) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch ALL events (with optional filtering)
                const allEvents = await fetchAllEvents(
                    appState.table,
                    eventTypes
                );

                console.log('[GameEventsProvider] Initial events loaded:', {
                    count: allEvents.length,
                    table: appState.table,
                    filtered: eventTypes ? 'yes' : 'no',
                });

                setEvents(allEvents);
                setHasMore(false); // We loaded everything
                setOffset(allEvents.length);
            } catch (err) {
                console.error(
                    '[GameEventsProvider] Failed to load events:',
                    err
                );
                const errorMessage =
                    err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadInitialEvents();
    }, [appState.table, fetchAllEvents, eventTypes]);

    // Load more events (pagination)
    const loadMoreEvents = useCallback(async () => {
        if (!appState.table || loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const response: EventsResponse = await fetchTableEvents(
                appState.table,
                limit,
                offset
            );

            console.log('[GameEventsProvider] More events loaded:', {
                count: response.events.length,
                has_more: response.has_more,
                new_offset: offset + response.events.length,
            });

            setEvents((prevEvents) => [...prevEvents, ...response.events]);
            setHasMore(response.has_more);
            setOffset(offset + response.events.length);
        } catch (err) {
            console.error(
                '[GameEventsProvider] Failed to load more events:',
                err
            );
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoadingMore(false);
        }
    }, [appState.table, loadingMore, hasMore, offset]);

    // Refresh events (reload from beginning)
    const refreshEvents = useCallback(async () => {
        if (!appState.table) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch ALL events (with optional filtering)
            const allEvents = await fetchAllEvents(appState.table, eventTypes);

            console.log('[GameEventsProvider] Events refreshed:', {
                count: allEvents.length,
                filtered: eventTypes ? 'yes' : 'no',
            });

            setEvents(allEvents);
            setHasMore(false); // We loaded everything
            setOffset(allEvents.length);
        } catch (err) {
            console.error(
                '[GameEventsProvider] Failed to refresh events:',
                err
            );
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [appState.table, fetchAllEvents, eventTypes]);

    // Refresh events when modal opens
    useEffect(() => {
        if (isModalOpen && appState.table) {
            console.log(
                '[GameEventsProvider] Modal opened, refreshing events...'
            );
            refreshEvents();
        }
    }, [isModalOpen, appState.table, refreshEvents]);

    // Removed automatic polling to prevent disruptive refreshes
    // Users can manually refresh using the refresh button in the UI

    const value: GameEventsContextType = {
        events,
        loading,
        error,
        hasMore,
        loadMoreEvents,
        refreshEvents,
    };

    return (
        <GameEventsContext.Provider value={value}>
            {children}
        </GameEventsContext.Provider>
    );
};
