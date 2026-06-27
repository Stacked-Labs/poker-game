import { describe, expect, it } from 'vitest';
import { renderWaitlistEmail, UNSUBSCRIBE_TOKEN_PLACEHOLDER } from './WaitlistEmail';

describe('renderWaitlistEmail', () => {
    it('roots the unsubscribe link at the API origin and keeps the token placeholder literal', async () => {
        const html = await renderWaitlistEmail({ body: 'Hello world' });
        expect(html).toContain(`/api/waitlist/unsubscribe?token=${UNSUBSCRIBE_TOKEN_PLACEHOLDER}`);
    });

    it('renders markdown body into email-safe HTML with inline styles', async () => {
        const html = await renderWaitlistEmail({ body: '# Big news\n\nYou are **in**.' });
        expect(html).toContain('Big news');
        expect(html).toMatch(/<h1[^>]*style=/);
        expect(html).toContain('<strong');
    });

    it('renders inline body images from markdown', async () => {
        const html = await renderWaitlistEmail({ body: '![chips](https://stackedpoker.io/usdc-logo.png)' });
        expect(html).toContain('src="https://stackedpoker.io/usdc-logo.png"');
        expect(html).toContain('alt="chips"');
    });

    it('renders the CTA button only when both text and url are present', async () => {
        const withCta = await renderWaitlistEmail({
            body: 'body',
            cta: { text: 'Play now', url: 'https://stackedpoker.io/public-games' },
        });
        expect(withCta).toContain('Play now');
        expect(withCta).toContain('https://stackedpoker.io/public-games');

        const withoutCta = await renderWaitlistEmail({ body: 'body' });
        expect(withoutCta).not.toContain('Play now');
    });

    it('includes the brand footer tagline and socials', async () => {
        const html = await renderWaitlistEmail({ body: 'body' });
        expect(html).toContain('Your table. Your money.');
        expect(html).toContain('x.com/stacked_poker');
    });
});
