# Product

## Register

brand

## Users

**Primary: crypto-native poker players. Degens.** People who already hold USDC on Base, who recognize a Coinbase Wallet popup, who would rather sign a payload than enter a credit card. They're playing on mobile most of the time — phone in hand, on a couch or in bed at 11pm, between rounds of something else. They want real-money cash games and tournaments without the banking-side friction of incumbent poker rooms.

**Secondary: traditional online poker players who are crypto-curious.** We onboard them through a polished side door — never at the expense of the primary audience.

Skill range: casual to serious recreational. Not (yet) optimizing for high-volume professional grinders.

Context of use: **mobile-first by usage, not by reluctance.** Sessions are short and ad-hoc. The lobby is browsed in elevators; the table is played in landscape on a phone. Desktop is supported but secondary in design priority.

## Product Purpose

Stacked is an **onchain poker room**. Real-money cash games and tournaments settled in **USDC on Base** — no chips, no IOU ledger, no withdrawal queue. Sit, play, stand up, your stack is in your wallet.

The differentiator is **settlement, not gameplay**. The poker is the poker. What's new is that money moves like crypto: wallets are first-class, balances live where the player put them, and trust does not depend on an operator's solvency.

Success looks like:
- A crypto-native player can be at a table within 60 seconds of opening the site.
- A traditional player makes it through wallet + USDC onboarding without bouncing.
- Players stay because the room *feels good* — not just because the settlement model is clever.

## Brand Personality

**Three words: playful, smooth, degen.** (Adjacent: fun, easy.)

Cozy, not corporate. Confident, not flashy. The product feels like a **Friday night penthouse at 3am** — rich but lived-in, intimate, the lights are warm, the felt is real, the company is good. Not a Vegas casino floor. Not a sterile fintech dashboard.

**Tone of voice:**
- Direct. Short sentences. Verbs do work.
- Player-to-player. We talk to people who play, not people we're trying to convert.
- Crypto-fluent. "Wallet," "USDC," "onchain," "sign," "Base" used without explanation. We don't define jargon for an audience that doesn't need it.
- Lightly irreverent. A wink is fine. A whole stand-up routine is not.
- No marketing-speak: no "revolutionizing," "next-gen," "experience the future," "unlock."
- No emoji as decoration. Emojis are content (a poker suit, a chip), never garnish.

**Examples:**
- ✅ "Sit down. USDC moves on Base. No chips, no withdraw queue."
- ✅ "You folded. Pot's still hot."
- ❌ "Welcome to the future of decentralized poker! 🚀"
- ❌ "Experience seamless onchain gameplay."

**Positive references — what we'd be proud to be compared to:**
- **PokerNow** — simplicity benchmark for online poker; game-like clarity (table surface).
- **Polymarket** — Web3 + dense data + legibility; dark with confident accents (stats / leaderboard / public-games density).
- **Robinhood** — onboarding ease and a sense of momentum; friendly without being childish (create-game, onboarding flows).
- **Rainbow wallet** — playful, character-rich, crypto-native without slop (lobby personality, motion).
- **Phantom wallet** — Web3 with personality, smooth surfaces (connect / wallet flows).
- **Drift Protocol** — degen-aligned, opinionated, dark UI with edge (tone — willing to have a point of view).

If three of those names show up on a moodboard for a screen, we're on track.

## Anti-references

We do not want to look or feel like:

1. **Generic crypto dashboards** — Uniswap-clone aesthetic, generic chart cards, "swap" gradients. We are not a DEX.
2. **Corporate poker rooms** — WSOP, PokerStars, ClubGG. Stock-photo felt, glossy chip stacks, casino-floor red-and-gold, generic "professional" tone.
3. **Web3 hero-page slop** — gradient meshes, glowing buttons, glassmorphism, "Welcome to the Future" hero copy, abstract 3D blobs.
4. **AI-generated UI** — soft shadows on every card, lavender-to-pink gradients, three-emoji headers, identical card components stacked vertically forever, "✨" anywhere.
5. **Chuck-E-Cheese degen** — neon for neon's sake, comic-sans-energy fonts, screaming chrome.

If we made it and it could ship on five other crypto sites, we did it wrong.

## Design Principles

1. **Wallet-native, not bank-native.** Onchain settlement is the product. Surface it as a feature, never apologize for it, never simulate the deposit/withdrawal/chip-ledger patterns of incumbent rooms. Wallets, USDC, and Base are first-class language.

2. **Penthouse, not casino floor.** Warm dark over cold dark. Intimate, lived-in, confident. Refuse the polished-corporate poker aesthetic and the clinical-fintech aesthetic in equal measure. The room should feel like 3am on a good night, not 9am on a trading floor.

3. **At the table, pixels work. In the lobby, pixels play.** Strict product discipline at `/table/[id]` and game flows — every element earns its space, legibility wins under pressure. Brand permission at `/`, `/leaderboard`, and marketing surfaces — personality, motion, type can carry weight that pure function wouldn't justify.

4. **Talk to players, not converts.** Crypto fluency is assumed. No jargon-defining, no "Welcome to the future of…", no onboarding tutorials that explain what a wallet is by default. The polished side door for traditional players exists, but the front door speaks our audience's native language.

## Accessibility & Inclusion

**WCAG 2.1 AA** target.

**Mobile-first emphasis** is the dominant accessibility lens — primary users are on phones, often one-handed, often in low-attention contexts (commute, bed, between things). Tap targets, thumb reach, landscape table layout, and battery-conscious motion all matter more than equivalent desktop polish.

**Standard considerations:**
- Respect `prefers-reduced-motion` — chip movements, deal animations, and ambient motion all get a toned-down path that preserves causality without the choreography.
- Color is never the only signal for state. Suit identity pairs with shape; action buttons pair with text and icon; stack-tier highlights pair with weight or border.
- Color-blind safety verified on suit indicators (red/black is a known trap when other tints enter), action-state colors, and any data-viz on stats / leaderboard.
- Visible focus states on all interactive elements (Chakra defaults are acceptable; do not strip them).
- Live regions for game-state announcements where screen readers are likely (turn changes, action results) — without spamming.
- Mobile: 44×44pt minimum tap targets, no hover-only affordances, gestures pair with explicit controls.
