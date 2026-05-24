import { NextResponse } from 'next/server';

const CACHE_HEADER = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET() {
    try {
        const response = await fetch('https://7tv.io/v3/emote-sets/global', {
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
        { error: 'Failed to fetch 7TV global emotes' },
        { status: 502 }
    );
}
