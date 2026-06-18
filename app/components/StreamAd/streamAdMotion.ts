'use client';

import { keyframes } from '@emotion/react';

// All StreamAd motion is pure CSS keyframes (compositor-driven transform/opacity),
// not JS/rAF: the stream worker runs headful Chromium under Xvfb where rAF is
// throttled but CSS animation still composites frames.

export const SCENE_COUNT = 6;
export const SCENE_SECS = 12;
export const CYCLE_SECS = SCENE_COUNT * SCENE_SECS;

// Each scene owns an equal window of the cycle; fades last ~0.7s regardless of
// scene count.
const WINDOW_PCT = 100 / SCENE_COUNT;
const FADE_PCT = (0.72 / CYCLE_SECS) * 100;

export const rise = keyframes`
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const floatY = keyframes`
    0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
    50%      { transform: translate(-50%, -50%) translateY(calc(var(--float, 6px) * -1)) rotate(var(--rot, 0deg)); }
`;

// Mostly idle, then a quick wiggle — used by the face-down river card. One shiver
// every ~5s keeps the board alive without animating the dealt cards.
export const shiver = keyframes`
    0%, 84%, 100% { transform: rotate(0deg) translateX(0); }
    86%  { transform: rotate(-2deg) translateX(-2px); }
    88%  { transform: rotate(2.5deg) translateX(2px); }
    90%  { transform: rotate(-2deg) translateX(-2px); }
    92%  { transform: rotate(1.5deg) translateX(1px); }
    94%  { transform: rotate(-1deg) translateX(-1px); }
    96%  { transform: rotate(0deg) translateX(0); }
`;

export const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(0.8); }
`;

export const halo = keyframes`
    0%   { transform: scale(0.85); opacity: 0.55; }
    70%  { transform: scale(2.6); opacity: 0; }
    100% { transform: scale(2.6); opacity: 0; }
`;

// One-time entrance for persistent chrome (top bar, QR). Scenes don't use this —
// the scene crossfade is their entrance.
export const enter = (delay: number) => ({
    animation: `${rise} 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s backwards`,
});

// ── Scene rotation ──────────────────────────────────────────────────────────
//
// Each scene owns a (100 / SCENE_COUNT)% window of the cycle: fade in, hold, fade
// out at the window edge, hidden for the rest. Scene i runs the same keyframes
// delayed by i * SCENE_SECS, so scene i's fade-out overlaps scene i+1's fade-in
// exactly — continuous coverage, no black flash. `backwards` fill keeps
// positive-delay scenes at the 0% frame (hidden) before their first turn.

export const sceneCycle = keyframes`
    0%    { opacity: 0; }
    ${FADE_PCT}%  { opacity: 1; }
    ${WINDOW_PCT - FADE_PCT}% { opacity: 1; }
    ${WINDOW_PCT}%   { opacity: 0; }
    100%  { opacity: 0; }
`;

export const sceneStyle = (i: number) => ({
    position: 'absolute' as const,
    inset: 0,
    opacity: 0,
    animation: `${sceneCycle} ${CYCLE_SECS}s linear ${i * SCENE_SECS}s infinite backwards`,
});

// Slow drift while a scene is on stage so the broadcast never reads as a still.
// Amplitude stays tiny (max 3% scale) — gentle, no spin or zoom.
export const sceneDrift = keyframes`
    0%   { transform: scale(1) translate3d(0, 0, 0); }
    50%  { transform: scale(1.03) translate3d(-0.6%, -0.4%, 0); }
    100% { transform: scale(1) translate3d(0, 0, 0); }
`;

export const driftStyle = (i: number) => ({
    animation: `${sceneDrift} ${CYCLE_SECS}s ease-in-out ${i * SCENE_SECS}s infinite backwards`,
});

// Progress segment fill: scaleX 0 → 1 across the scene's active window, then snap
// back. transform-only so it stays on the compositor.
export const segmentFill = keyframes`
    0%     { transform: scaleX(0); opacity: 0.5; }
    ${FADE_PCT}%   { opacity: 1; }
    ${WINDOW_PCT - 0.1}%  { transform: scaleX(1); opacity: 1; }
    ${WINDOW_PCT}%    { transform: scaleX(1); opacity: 0; }
    ${WINDOW_PCT + 0.1}%  { transform: scaleX(0); opacity: 0; }
    100%   { transform: scaleX(0); opacity: 0; }
`;

export const segmentStyle = (i: number) => ({
    transformOrigin: 'left center',
    animation: `${segmentFill} ${CYCLE_SECS}s linear ${i * SCENE_SECS}s infinite backwards`,
});
