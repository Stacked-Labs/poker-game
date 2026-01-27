import { create } from 'zustand';

export type Emote = {
    id: string;
    name: string;
    url: string;
};

type EmoteCache = {
    emotes: Emote[];
    lastFetchedAt: number;
};

type EmoteStore = {
    emotesByName: Record<string, Emote>;
    emotesByNameLower: Record<string, Emote>;
    emotesById: Record<string, Emote>;
    recentEmoteIds: string[];
    lastFetchedAt: number;
    isLoading: boolean;
    error?: string;
    hydrateFromCache: () => void;
    hydrateRecentEmotes: () => void;
    fetchGlobalEmotes: (options?: { force?: boolean }) => Promise<void>;
    addRecentEmoteId: (emoteId: string) => void;
    getEmoteByName: (name: string) => Emote | undefined;
};

const CURATED_EMOTE_SET_IDS: string[] = [
    '01HKQT8EWR000ESSWF3625XCS4', // Global
    '635c457cc8dea0b6668a2258', // Classics
    '63f65236e7b1932413a1468c', // High Variety
    '63e7bf32743d199fec640b14', // Native Style
    '6344404594790c62d1eedeaa', // Meta Trending
];
const EMOTE_CACHE_KEY = `pulse_emotes_cache_v2_${CURATED_EMOTE_SET_IDS.join(
    '-'
)}`;
const RECENT_EMOTES_KEY = 'pulse_recent_emotes_v1';
const EMOTE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const SEVEN_TV_GLOBAL_SET_PROXY_URL = '/api/7tv/emote-sets/global';
const SEVEN_TV_SET_PROXY_URL = (setId: string) =>
    `/api/7tv/emote-sets/${setId}`;
const RECENT_EMOTES_MAX = 10;

function buildMaps(emotes: Emote[]) {
    const byName: Record<string, Emote> = {};
    const byNameLower: Record<string, Emote> = {};
    const byId: Record<string, Emote> = {};

    for (const emote of emotes) {
        if (!emote?.id || !emote?.name) continue;
        byName[emote.name] = emote;
        byNameLower[emote.name.toLowerCase()] = emote;
        byId[emote.id] = emote;
    }

    return { byName, byNameLower, byId };
}

function safeReadCache(): EmoteCache | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem(EMOTE_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as EmoteCache;
        if (!Array.isArray(parsed.emotes) || !parsed.lastFetchedAt) {
            return null;
        }
        return parsed;
    } catch (error) {
        console.warn('Failed to read emote cache:', error);
        return null;
    }
}

function safeWriteCache(cache: EmoteCache) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(EMOTE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.warn('Failed to write emote cache:', error);
    }
}

function safeReadRecents(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(RECENT_EMOTES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as string[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Failed to read recent emotes:', error);
        return [];
    }
}

function safeWriteRecents(recents: string[]) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(RECENT_EMOTES_KEY, JSON.stringify(recents));
    } catch (error) {
        console.warn('Failed to write recent emotes:', error);
    }
}

export const useEmoteStore = create<EmoteStore>((set, get) => ({
    emotesByName: {},
    emotesByNameLower: {},
    emotesById: {},
    recentEmoteIds: [],
    lastFetchedAt: 0,
    isLoading: false,
    error: undefined,
    hydrateFromCache: () => {
        const cached = safeReadCache();
        if (!cached) return;

        const { byName, byNameLower, byId } = buildMaps(cached.emotes);
        set({
            emotesByName: byName,
            emotesByNameLower: byNameLower,
            emotesById: byId,
            lastFetchedAt: cached.lastFetchedAt,
            error: undefined,
        });
    },
    hydrateRecentEmotes: () => {
        const recent = safeReadRecents();
        set({ recentEmoteIds: recent.slice(0, RECENT_EMOTES_MAX) });
    },
    fetchGlobalEmotes: async (options) => {
        const { force = false } = options ?? {};
        const { lastFetchedAt, isLoading, emotesByName } = get();
        if (isLoading) return;

        const isFresh =
            lastFetchedAt > 0 && Date.now() - lastFetchedAt < EMOTE_CACHE_TTL_MS;
        if (!force && isFresh && Object.keys(emotesByName).length > 0) {
            return;
        }

        set({ isLoading: true, error: undefined });

        try {
            const urls = [
                SEVEN_TV_GLOBAL_SET_PROXY_URL,
                ...CURATED_EMOTE_SET_IDS.map(SEVEN_TV_SET_PROXY_URL),
            ];

            const responses = await Promise.allSettled(
                urls.map(async (url) => {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(
                            `7TV fetch failed: ${response.status}`
                        );
                    }

                    return (await response.json()) as {
                        emotes?: Array<{ id?: string; name?: string }>;
                    };
                })
            );

            const emotesFromSets = responses
                .filter(
                    (result): result is PromiseFulfilledResult<{
                        emotes?: Array<{ id?: string; name?: string }>;
                    }> => result.status === 'fulfilled'
                )
                .flatMap((result) => result.value.emotes ?? []);

            if (emotesFromSets.length === 0) {
                throw new Error('7TV fetch failed: no emotes returned');
            }

            const mapped = emotesFromSets
                .map((emote) => {
                    if (!emote?.id || !emote?.name) return null;
                    return {
                        id: emote.id,
                        name: emote.name,
                        url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`,
                    } as Emote;
                })
                .filter(Boolean) as Emote[];

            const { byName, byNameLower, byId } = buildMaps(mapped);
            const fetchedAt = Date.now();

            set({
                emotesByName: byName,
                emotesByNameLower: byNameLower,
                emotesById: byId,
                lastFetchedAt: fetchedAt,
                isLoading: false,
                error: undefined,
            });

            safeWriteCache({ emotes: mapped, lastFetchedAt: fetchedAt });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch emotes';
            set({ isLoading: false, error: message });
            console.error('Failed to fetch 7TV emotes:', error);
        }
    },
    getEmoteByName: (name) => {
        const state = get();
        return (
            state.emotesByName[name] ??
            state.emotesByNameLower[name.toLowerCase()]
        );
    },
    addRecentEmoteId: (emoteId) => {
        if (!emoteId) return;
        set((state) => {
            const next = [
                emoteId,
                ...state.recentEmoteIds.filter((id) => id !== emoteId),
            ].slice(0, RECENT_EMOTES_MAX);
            safeWriteRecents(next);
            return { recentEmoteIds: next };
        });
    },
}));
