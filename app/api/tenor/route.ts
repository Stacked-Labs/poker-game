import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'featured';
    const query = searchParams.get('q') || '';
    const pos = searchParams.get('pos') || '';
    const limit = searchParams.get('limit') || '8';

    const key = process.env.TENOR_API_KEY;
    const clientKey = process.env.TENOR_CLIENT_ID;

    const tenorParams = new URLSearchParams({
        key: key!,
        client_key: clientKey!,
        limit,
        pos,
        media_filter: 'gif,tinygif',
        ...(endpoint === 'search' && { q: query }),
    });

    try {
        const response = await fetch(`https://tenor.googleapis.com/v2/${endpoint}?${tenorParams.toString()}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch from Tenor' }, { status: 500 });
    }
}
