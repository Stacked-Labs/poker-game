import { NextResponse } from 'next/server';

const SEVEN_TV_SET_URLS = (setId: string) => [
    `https://7tv.io/v3/emote-sets/${setId}`,
];

export async function GET(
    _request: Request,
    { params }: { params: { setId: string } }
) {
    const setId = params.setId;

    if (!setId) {
        return NextResponse.json(
            { error: 'Missing setId' },
            { status: 400 }
        );
    }

    for (const url of SEVEN_TV_SET_URLS(setId)) {
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
        { error: 'Failed to fetch 7TV emote set' },
        { status: 502 }
    );
}
