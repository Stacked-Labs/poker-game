import { NextResponse } from 'next/server';

const SEVEN_TV_GLOBAL_SET_URLS = [
    'https://7tv.io/v3/emote-sets/global',
];

export async function GET() {
    for (const url of SEVEN_TV_GLOBAL_SET_URLS) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            return NextResponse.json(data);
        } catch (error) {
            console.warn('7TV proxy fetch failed:', error);
        }
    }

    return NextResponse.json(
        { error: 'Failed to fetch 7TV global emotes' },
        { status: 502 }
    );
}
