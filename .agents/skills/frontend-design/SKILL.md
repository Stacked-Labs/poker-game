---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

---

## Stacked Poker: Brand-locked design (read first for in-repo work)

When building UI **inside this repo**, the visual identity is already defined. Your job is to execute within the brand — not invent a new aesthetic. Load `references/brand-identity.md` for the full brand system.

### Hard rules

- **Chakra UI v2** — use Chakra props, semantic tokens, and component variants from `app/theme.ts`.
- **Font**: Poppins (`var(--font-poppins)`) — never introduce new typefaces.
- **No hardcoded hex values** — always use semantic tokens or `brand.*` colors.
- **Never add global fonts, CSS variables, or color palettes** bypassing the theme system.
- **Dark-mode-first** — test in dark mode first, then verify light mode.

### Brand aesthetic

**Premium gaming / crypto-native.** Think high-end poker lounge meets web3 dashboard.

| Layer | Pattern | Tokens |
|-------|---------|--------|
| Backgrounds | Deep navy fields, charcoal surfaces, subtle gradients | `bg.charcoal`, `bg.default`, `brand.darkNavy` |
| Accents | Hot pink CTAs, green success, yellow chip highlights | `brand.pink`, `brand.green`, `brand.yellow` |
| Surfaces | Glassmorphism cards with frosted backdrop | `glass`, `glass-hover`, `glass-active` shadows |
| Emphasis | Colored glow halos on featured elements | `glow-green`, `glow-pink`, `glow-yellow` shadows |
| Interactive | Subtle scale (1.02-1.05) + shadow lift on hover | `btn-premium`, `btn-premium-hover` shadows |
| Typography | Poppins throughout, bold headings, light body | Heading/Text variants from theme |

### Motion vocabulary (in-repo)

Load `references/motion-patterns.md` for the complete animation vocabulary. Key principles:

- **Restrained by default** — poker is a game of composure. Use motion to punctuate, not decorate.
- **Physics-based easing** — spring curves (`0.34, 1.56, 0.64, 1`) for playful elements, ease-out for reveals.
- **Staggered entry** — delay children by 40-60ms for list/card reveals.
- **Respect `prefers-reduced-motion`** — always use `useReducedMotion()` and provide a static fallback.

### When to use other skills

- Token/variant reference: `chakra-design-system`
- Component architecture: `react-architecture`
- Quality/a11y/perf: `frontend-quality-bar`
- Storybook visualization: `storybook-testing`

---

## Standalone design (outside this repo)

The guidelines below apply when building UI that is NOT part of the Stacked Poker codebase — standalone pages, prototypes, external projects, or when a genuinely new design element has no theme precedent.

### Design thinking

Before coding, understand the context and commit to a **BOLD** aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick a strong direction — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian. Use these for inspiration but design one that is true to the context.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this **UNFORGETTABLE**? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

### Frontend aesthetics guidelines

**Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial, Inter, Roboto, system fonts. Pair a distinctive display font with a refined body font. Never converge on the same font (e.g., Space Grotesk) across different projects.

**Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.

**Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

**Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays.

### Anti-patterns (never do these)

- Overused font families (Inter, Roboto, Arial, system fonts)
- Cliched color schemes (purple gradients on white, teal-and-coral)
- Predictable card grids with rounded corners and drop shadows
- Cookie-cutter layouts that lack context-specific character
- Uniform spacing and symmetry everywhere (real design has rhythm)

### Complexity matching

Match implementation complexity to the aesthetic vision:
- **Maximalist** designs need elaborate code with extensive animations, layered textures, and rich interactions.
- **Minimalist** designs need restraint, precision, and careful attention to spacing, typography, and subtle details.
- Elegance comes from executing the vision well, not from adding more.

Remember: Claude is capable of extraordinary creative work. Don't hold back — show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
