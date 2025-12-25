interface TenorMediaFormat {
    url: string;
    dims: number[];
    duration: number;
    size: number;
}

interface TenorMediaFormats {
    gif: TenorMediaFormat;
    tinygif?: TenorMediaFormat;
    nanogif?: TenorMediaFormat;
}

export interface TenorResult {
    id: string;
    title: string;
    content_description: string;
    itemurl: string;
    url: string;
    media_formats: TenorMediaFormats;
    created: number;
    hasaudio: boolean;
    flags: string[];
    tags: string[];
}

export interface TenorResponse {
    results: TenorResult[],
    next: string
}

export enum TENOR_ENDPOINT {
    SEARCH = 'search',
    FEATURED = 'featured'
}

const useTenor = () => {
    const fetchGifs = async (
        endpoint: TENOR_ENDPOINT,
        query: string = '',
        pos: string = '',
        limit: number = 8
    ): Promise<TenorResponse | null> => {
        const params = new URLSearchParams({
            endpoint,
            limit: limit.toString(),
            pos: pos,
            ...(endpoint === TENOR_ENDPOINT.SEARCH && { q: query }),
        });

        try {
            const response = await fetch(`/api/tenor?${params.toString()}`);
            if (!response.ok) throw new Error('Proxy fetch failed');

            const data = await response.json();
            return { results: data.results as TenorResult[], next: data.next };
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    return { fetchGifs };
};

export default useTenor;