import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (!BACKEND_URL) {
            console.error('NEXT_PUBLIC_API_URL is not set');
            return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
        }

        const res = await fetch(`${BACKEND_URL}/api/waitlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'website' }),
        });

        if (!res.ok) {
            console.error('Waitlist backend error:', await res.text());
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json({ message: data.message ?? 'subscribed' }, { status: 200 });
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Newsletter API is working' });
}
