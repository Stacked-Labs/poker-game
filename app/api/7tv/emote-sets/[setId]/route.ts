import { NextResponse } from 'next/server';

// Real 7TV set IDs are 24-char hex (Mongo ObjectId); 'global' is the one
// reserved word. Anything else (containing `?`, `/`, `#`, ...) would let a
// caller smuggle query params or extra path segments into the upstream URL.
const SET_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

const CACHE_HEADER = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ setId: string }> }
) {
    const { setId } = await params;

    if (!setId || !SET_ID_PATTERN.test(setId)) {
        return NextResponse.json(
            { error: 'Invalid setId' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`https://7tv.io/v3/emote-sets/${setId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data, {
                headers: { 'Cache-Control': CACHE_HEADER },
            });
        }
    } catch (error) {
        console.warn('7TV proxy fetch failed:', error);
    }

    return NextResponse.json(
        { error: 'Failed to fetch 7TV emote set' },
        { status: 502 }
    );
}
