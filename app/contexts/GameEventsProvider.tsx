'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const GameEventsContext = createContext<GameEventsContextType | undefined>(undefined);

export const useGameEvents = () => {
    const context = useContext(GameEventsContext);
    if (!context) {
        throw new Error('useGameEvents must be used within GameEventsProvider');
    }
    return context;
};

interface GameEventsProviderProps {
    children: React.ReactNode;
}

export const GameEventsProvider: React.FC<GameEventsProviderProps> = ({ children }) => {
    const { appState } = useContext(AppContext);
    const [events, setEvents] = useState<GameEventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 50;

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
                const response: EventsResponse = await fetchTableEvents(
                    appState.table,
                    limit,
                    0
                );

                console.log('[GameEventsProvider] Initial events loaded:', {
                    count: response.events.length,
                    has_more: response.has_more,
                    table: appState.table,
                });

                setEvents(response.events);
                setHasMore(response.has_more);
                setOffset(response.events.length);
            } catch (err) {
                console.error('[GameEventsProvider] Failed to load events:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadInitialEvents();
    }, [appState.table]);

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
            console.error('[GameEventsProvider] Failed to load more events:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
            const response: EventsResponse = await fetchTableEvents(
                appState.table,
                limit,
                0
            );

            console.log('[GameEventsProvider] Events refreshed:', {
                count: response.events.length,
                has_more: response.has_more,
            });

            setEvents(response.events);
            setHasMore(response.has_more);
            setOffset(response.events.length);
        } catch (err) {
            console.error('[GameEventsProvider] Failed to refresh events:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [appState.table]);

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

