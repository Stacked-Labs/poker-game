import * as React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Brand palette — matches the homepage LIGHT look (see app/theme.ts).
const C = {
    page: '#ECEEF5', // brand.lightGray
    card: '#FFFFFF',
    ink: '#0B1430', // brand.darkNavy (text.primary)
    navy: '#334479', // brand.navy (text.secondary)
    body: '#374151',
    muted: '#6B7280',
    green: '#36A37B', // brand.green
    greenDark: '#2A8463',
    border: '#E2E5EE',
};

const SITE_URL = 'https://stackedpoker.io';
const LOGO_URL = `${SITE_URL}/IconLogo.png`;

// The template owns the unsubscribe link: it's rooted at our API origin
// (NEXT_PUBLIC_API_URL — where the /api/waitlist/unsubscribe endpoint lives) and
// carries the {{unsubscribe_token}} placeholder. The backend swaps that
// placeholder for the per-recipient token at send time (email/compose.go →
// InjectCompliance), so the link's root stays under frontend control.
export const UNSUBSCRIBE_TOKEN_PLACEHOLDER = '{{unsubscribe_token}}';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const UNSUBSCRIBE_URL = `${API_BASE}/api/waitlist/unsubscribe?token=${UNSUBSCRIBE_TOKEN_PLACEHOLDER}`;

export interface WaitlistEmailProps {
    /** Hidden inbox preview line. */
    preheader?: string;
    /** Main content, authored as markdown. */
    body: string;
    /** Optional call-to-action button. */
    cta?: { text: string; url: string };
    /** Optional hero image shown above the body. */
    heroImage?: string;
}

// Markdown → email-safe React with inline styles. Inline styles are required
// because many clients (notably Outlook) strip <style> blocks.
const markdownComponents: Components = {
    h1: ({ node: _node, ...p }) => (
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.ink, lineHeight: 1.25, margin: '0 0 16px' }} {...p} />
    ),
    h2: ({ node: _node, ...p }) => (
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.ink, lineHeight: 1.3, margin: '24px 0 12px' }} {...p} />
    ),
    h3: ({ node: _node, ...p }) => (
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: C.ink, lineHeight: 1.3, margin: '20px 0 8px' }} {...p} />
    ),
    p: ({ node: _node, ...p }) => (
        <p style={{ fontSize: '16px', color: C.body, lineHeight: 1.6, margin: '0 0 16px' }} {...p} />
    ),
    a: ({ node: _node, ...p }) => (
        <a style={{ color: C.green, textDecoration: 'underline' }} {...p} />
    ),
    ul: ({ node: _node, ...p }) => (
        <ul style={{ paddingLeft: '22px', margin: '0 0 16px', color: C.body }} {...p} />
    ),
    ol: ({ node: _node, ...p }) => (
        <ol style={{ paddingLeft: '22px', margin: '0 0 16px', color: C.body }} {...p} />
    ),
    li: ({ node: _node, ...p }) => (
        <li style={{ fontSize: '16px', lineHeight: 1.6, margin: '0 0 8px' }} {...p} />
    ),
    strong: ({ node: _node, ...p }) => <strong style={{ fontWeight: 700, color: C.ink }} {...p} />,
    em: ({ node: _node, ...p }) => <em style={{ fontStyle: 'italic' }} {...p} />,
    blockquote: ({ node: _node, ...p }) => (
        <blockquote
            style={{ borderLeft: `3px solid ${C.green}`, paddingLeft: '14px', margin: '0 0 16px', color: C.navy }}
            {...p}
        />
    ),
    hr: ({ node: _node, ...p }) => (
        <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '24px 0' }} {...p} />
    ),
    code: ({ node: _node, ...p }) => (
        <code
            style={{
                backgroundColor: '#F3F4F6',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
            {...p}
        />
    ),
    img: ({ node: _node, alt, ...p }) => (
        // Email clients need a plain <img>; next/image is not applicable here.
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img alt={alt ?? ''} style={{ maxWidth: '100%', borderRadius: '8px' }} {...p} />
    ),
};

export function WaitlistEmail({ preheader, body, cta, heroImage }: WaitlistEmailProps) {
    return (
        <Html lang="en">
            <Head />
            {preheader ? <Preview>{preheader}</Preview> : null}
            <Body style={bodyStyle}>
                <Container style={container}>
                    <Section style={headerSection}>
                        <Img src={LOGO_URL} width="44" height="44" alt="Stacked Poker" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                        <span style={wordmark}>STACKED</span>
                    </Section>

                    <Section style={card}>
                        {heroImage ? (
                            <Img src={heroImage} alt="" width="536" style={heroImageStyle} />
                        ) : null}
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {body || '_Your message preview will appear here._'}
                        </ReactMarkdown>
                        {cta?.text && cta?.url ? (
                            <Section style={{ textAlign: 'center', margin: '28px 0 8px' }}>
                                <Button href={cta.url} style={ctaButton}>
                                    {cta.text}
                                </Button>
                            </Section>
                        ) : null}
                    </Section>

                    <Section style={footer}>
                        <Text style={tagline}>Your table. Your money.</Text>
                        <Text style={socials}>
                            <Link href="https://x.com/stacked_poker" style={socialLink}>
                                X
                            </Link>
                            <span style={socialDot}>·</span>
                            <Link href="https://t.me/stackedpoker" style={socialLink}>
                                Telegram
                            </Link>
                            <span style={socialDot}>·</span>
                            <Link href="https://discord.gg/xdaC5gRP4E" style={socialLink}>
                                Discord
                            </Link>
                        </Text>
                        <Hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '16px 0' }} />
                        <Text style={footerNote}>
                            © Stacked Poker · USDC poker you control on Base.
                        </Text>
                        <Text style={footerNote}>
                            You&apos;re receiving this because you joined the Stacked waitlist.{' '}
                            <Link href={UNSUBSCRIBE_URL} style={unsubscribeLink}>
                                Unsubscribe
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export default WaitlistEmail;

// Renders the template to an email-client-safe HTML string. Used both for the
// admin live preview and as the exact payload POSTed to the announce endpoint,
// so the preview is byte-for-byte what subscribers receive.
export async function renderWaitlistEmail(props: WaitlistEmailProps): Promise<string> {
    return render(<WaitlistEmail {...props} />, { pretty: false });
}

const bodyStyle: React.CSSProperties = {
    backgroundColor: C.page,
    margin: 0,
    padding: '24px 0',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
    width: '600px',
    maxWidth: '100%',
    margin: '0 auto',
};

const headerSection: React.CSSProperties = {
    textAlign: 'center',
    padding: '8px 0 20px',
};

const wordmark: React.CSSProperties = {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: '10px',
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: C.ink,
};

const card: React.CSSProperties = {
    backgroundColor: C.card,
    borderRadius: '16px',
    border: `1px solid ${C.border}`,
    padding: '32px',
};

const heroImageStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    marginBottom: '24px',
};

const ctaButton: React.CSSProperties = {
    backgroundColor: C.green,
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    borderRadius: '10px',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-block',
};

const footer: React.CSSProperties = {
    textAlign: 'center',
    padding: '24px 16px 8px',
};

const tagline: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: C.navy,
    margin: '0 0 8px',
};

const socials: React.CSSProperties = {
    fontSize: '14px',
    margin: '0 0 4px',
};

const socialLink: React.CSSProperties = {
    color: C.navy,
    textDecoration: 'none',
    fontWeight: 600,
};

const socialDot: React.CSSProperties = {
    color: C.muted,
    margin: '0 8px',
};

const footerNote: React.CSSProperties = {
    fontSize: '12px',
    color: C.muted,
    lineHeight: 1.5,
    margin: '0 0 4px',
};

const unsubscribeLink: React.CSSProperties = {
    color: C.muted,
    textDecoration: 'underline',
};
