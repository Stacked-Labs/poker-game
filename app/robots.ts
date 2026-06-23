import { MetadataRoute } from 'next';

const base = 'https://stackedpoker.io';

// Allow crawling of the public/marketing surfaces; keep app, API, admin, and
// test routes out of the index (they need auth, are per-session, or aren't
// content). Mirrors the public routes listed in sitemap.ts.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Only block genuinely private / per-session / non-content routes.
            // Public landing pages (/, /create-game, /free-tokens, /claim,
            // /leaderboard, /public-games, /cards) stay indexable.
            disallow: ['/api/', '/table/', '/tournament/', '/stats', '/test/'],
        },
        sitemap: `${base}/sitemap.xml`,
    };
}
