// Temporary debug endpoint to diagnose production SSR fetch issues
// DELETE THIS FILE after debugging is complete

export async function GET() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const startTime = Date.now();

    const debugInfo: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        backendUrl: backendUrl || 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
    };

    if (!backendUrl) {
        return Response.json(
            {
                ...debugInfo,
                error: 'NEXT_PUBLIC_API_URL is not set',
            },
            { status: 500 }
        );
    }

    try {
        // Test 1: Health endpoint
        const healthRes = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            headers: { 'User-Agent': 'Netlify-Debug/1.0' },
        });
        debugInfo.health = {
            status: healthRes.status,
            ok: healthRes.ok,
            body: await healthRes.text().catch(() => 'Failed to read body'),
        };
    } catch (e) {
        debugInfo.health = {
            error: e instanceof Error ? e.message : String(e),
        };
    }

    try {
        // Test 2: Health DB endpoint
        const healthDbRes = await fetch(`${backendUrl}/health/db`, {
            method: 'GET',
            headers: { 'User-Agent': 'Netlify-Debug/1.0' },
        });
        debugInfo.healthDb = {
            status: healthDbRes.status,
            ok: healthDbRes.ok,
            body: await healthDbRes.text().catch(() => 'Failed to read body'),
        };
    } catch (e) {
        debugInfo.healthDb = {
            error: e instanceof Error ? e.message : String(e),
        };
    }

    try {
        // Test 3: Tables endpoint (the problematic one)
        const tablesRes = await fetch(`${backendUrl}/api/stats/tables`, {
            method: 'GET',
            headers: { 'User-Agent': 'Netlify-Debug/1.0' },
        });
        debugInfo.tables = {
            status: tablesRes.status,
            ok: tablesRes.ok,
            headers: Object.fromEntries(tablesRes.headers.entries()),
            body: await tablesRes.text().catch(() => 'Failed to read body'),
        };
    } catch (e) {
        debugInfo.tables = {
            error: e instanceof Error ? e.message : String(e),
        };
    }

    debugInfo.totalTimeMs = Date.now() - startTime;

    return Response.json(debugInfo, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}
