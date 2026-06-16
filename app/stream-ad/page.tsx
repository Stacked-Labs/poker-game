import type { Metadata } from 'next';
import StreamAd from '../components/StreamAd/StreamAd';

// Hidden, single-viewport (100vw x 100vh, no scroll) marketing frame built for the
// 24/7 livestream. Not linked anywhere and noindexed: it exists so the stream worker
// has a lightweight, static-by-default "ad" to park on instead of the full homepage.
// The worker loads it with `?broadcast=1` (skips wallet autoconnect via app/providers).
export const metadata: Metadata = {
    title: 'Stacked Poker',
    robots: { index: false, follow: false },
};

export default function StreamAdPage() {
    return <StreamAd />;
}
