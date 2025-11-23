function withValidProperties(properties: Record<string, undefined | string | string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
    );
}

export async function GET() {
    const URL = process.env.NEXT_PUBLIC_URL as string;
    return Response.json(
        {
            "accountAssociation": {  // below are placeholder values, replace with your own
                "header": "eyJmaWQiOjExMDg5NjksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg0NjE3MEZERWY2NkFDNkYyQjBkNjZlYkI5ZjE2NzNmNDVBMjM3RDdlIn0",
                "payload": "eyJkb21haW4iOiJ0aHJvbmVsZXNzLWxlYWRpbmdseS1yb2Iubmdyb2stZnJlZS5kZXYifQ",
                "signature": "B6v2JrAqHnGwLNZytc+cXCoIKUrlNvYOFZh99Kt7q0YNsg3t4X65sfVPgbMQP8DRlOawGL+7mMUiyRdmsh72Mxs="
            },
            "baseBuilder": {
                "ownerAddress": "0x82c9Bd12678DFCC12f132795FDB88B5d558429A6" // add your Base Account address here
            },
            "miniapp": {
                "version": "1",
                "name": "Example Mini App",
                "homeUrl": "https://throneless-leadingly-rob.ngrok-free.dev/",
                "iconUrl": "https://images.pexels.com/photos/34194627/pexels-photo-34194627.jpeg", // this is a placeholder, need to upload images to a public url
                "splashImageUrl": "https://images.pexels.com/photos/34194627/pexels-photo-34194627.jpeg", // this is a placeholder, need to upload images to a public url
                "splashBackgroundColor": "#000000",
                "subtitle": "Fast, fun, social",
                "description": "A fast, fun way to challenge friends in real time.",
                "primaryCategory": "social",
                "tags": ["example", "miniapp", "baseapp"],
                "tagline": "Play instantly",
                "heroImageUrl": "https://images.pexels.com/photos/34194627/pexels-photo-34194627.jpeg", // this is a placeholder, need to upload images to a public url
                "noindex": true
            }
        }
    );
}