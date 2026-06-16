'use client';

import { MotionConfig } from 'framer-motion';

// Client boundary for the homepage's broadcast mode (?broadcast=1, the livestream
// worker). Forces all Framer Motion animations off so reveal-on-scroll sections render
// at their visible final state (not stuck hidden) and the page doesn't thrash software-GL
// Chromium while the stream auto-scrolls. Rendered from the server page so the SSR HTML
// is already correct.
export default function BroadcastMotion({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="always">{children}</MotionConfig>;
}
