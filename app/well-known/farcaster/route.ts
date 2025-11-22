function withValidProperties(properties: Record<string, undefined | string | string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
    );
}

export async function GET() {
    const URL = process.env.NEXT_PUBLIC_URL as string;
    return Response.json(obj); // see the next step for the manifest_json_object
}

const obj =
{
    "accountAssociation": {  // these will be added in step 5
        "header": "",
        "payload": "",
        "signature": ""
    },
    "baseBuilder": {
        "ownerAddress": "0x" // add your Base Account address here
    },
    "miniapp": {
        "version": "1",
        "name": "Example Mini App",
        "homeUrl": "https://ex.co",
        "iconUrl": "https://ex.co/i.png",
        "splashImageUrl": "https://ex.co/l.png",
        "splashBackgroundColor": "#a70000ff",
        "webhookUrl": "https://ex.co/api/webhook",
        "subtitle": "Fast, fun, social",
        "description": "A fast, fun way to challenge friends in real time.",
        "screenshotUrls": [
            "https://ex.co/s1.png",
            "https://ex.co/s2.png",
            "https://ex.co/s3.png"
        ],
        "primaryCategory": "social",
        "tags": ["example", "miniapp", "baseapp"],
        "heroImageUrl": "https://ex.co/og.png",
        "tagline": "Play instantly",
        "ogTitle": "Example Mini App",
        "ogDescription": "Challenge friends in real time.",
        "ogImageUrl": "https://ex.co/og.png",
        "noindex": true
    }
}