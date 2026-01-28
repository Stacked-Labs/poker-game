import { useCallback, useRef } from 'react';
import { useEmoteStore } from '@/app/stores/emotes';

export const useEmotesData = () => {
    const hydratedRef = useRef(false);
    const {
        emotesByName,
        emotesByNameLower,
        emotesById,
        emotesCount,
        recentEmoteIds,
        isLoading,
        error,
        hydrateFromCache,
        hydrateRecentEmotes,
        fetchGlobalEmotes,
        addRecentEmoteId,
    } = useEmoteStore((state) => ({
        emotesByName: state.emotesByName,
        emotesByNameLower: state.emotesByNameLower,
        emotesById: state.emotesById,
        emotesCount: Object.keys(state.emotesByName).length,
        recentEmoteIds: state.recentEmoteIds,
        isLoading: state.isLoading,
        error: state.error,
        hydrateFromCache: state.hydrateFromCache,
        hydrateRecentEmotes: state.hydrateRecentEmotes,
        fetchGlobalEmotes: state.fetchGlobalEmotes,
        addRecentEmoteId: state.addRecentEmoteId,
    }));

    const ensureLoaded = useCallback(() => {
        if (!hydratedRef.current) {
            hydrateFromCache();
            hydrateRecentEmotes();
            hydratedRef.current = true;
        }
        if (!emotesCount && !isLoading) {
            fetchGlobalEmotes();
        }
    }, [
        emotesCount,
        fetchGlobalEmotes,
        hydrateFromCache,
        hydrateRecentEmotes,
        isLoading,
    ]);

    return {
        emotesByName,
        emotesByNameLower,
        emotesById,
        recentEmoteIds,
        isLoading,
        error,
        ensureLoaded,
        addRecentEmoteId,
    };
};
