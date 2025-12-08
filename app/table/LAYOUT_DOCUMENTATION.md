# Table Page Layout Documentation

## Overview

This document provides a visual representation and detailed breakdown of the component positioning and layout structure for the poker table page (`/app/table/[id]`).

The layout uses a **fixed aspect ratio container** approach:

- **Landscape screens**: 16:9 container
- **Portrait screens**: 9:16 container

This simplifies responsive design by maintaining consistent proportions within each orientation mode.

---

## Layout Architecture

### Fixed Aspect Ratio Container System

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VIEWPORT (100vw × 100vh)                     │
│                         Background: bg.letterbox                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    GameViewport Component                      │  │
│  │         (Full viewport, handles letterbox background)          │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │       GameContainer (Fixed 16:9 or 9:16 ratio)           │  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐│  │  │
│  │  │  │  Content Layer (z-index: 1)                        ││  │  │
│  │  │  │  ┌───────────────────────────────────────────────┐ ││  │  │
│  │  │  │  │  Navbar (position: relative)                 │ ││  │  │
│  │  │  │  └───────────────────────────────────────────────┘ ││  │  │
│  │  │  │  ┌───────────────────────────────────────────────┐ ││  │  │
│  │  │  │  │  Main Content (flex: 1)                       │ ││  │  │
│  │  │  │  │  └── Table Component                          │ ││  │  │
│  │  │  │  └───────────────────────────────────────────────┘ ││  │  │
│  │  │  │  ┌───────────────────────────────────────────────┐ ││  │  │
│  │  │  │  │  Footer                                       │ ││  │  │
│  │  │  │  └───────────────────────────────────────────────┘ ││  │  │
│  │  │  └─────────────────────────────────────────────────────┘│  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐│  │  │
│  │  │  │  Overlays (z-index: 10+)                           ││  │  │
│  │  │  │  - Chat Sidebar (absolute, right: 0)               ││  │  │
│  │  │  │  - Modals                                          ││  │  │
│  │  │  │  - Pause Banner                                    ││  │  │
│  │  │  └─────────────────────────────────────────────────────┘│  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  LoadingScreen (OUTSIDE container, covers full viewport)      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Aspect Ratio Behavior

### Landscape Mode (16:9)

On screens with `orientation: landscape`:

```
On 16:9 screen (perfect fit):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    GAME CONTAINER (16:9)                    │
│                    fills entire screen                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

On 21:9 ultrawide (pillarboxing):
┌─────────────────────────────────────────────────────────────────────┐
│ ████ │                                                     │ ████ │
│ ████ │              GAME CONTAINER (16:9)                  │ ████ │
│ ████ │              centered, full height                  │ ████ │
│ ████ │                                                     │ ████ │
└─────────────────────────────────────────────────────────────────────┘

On 4:3 monitor (letterboxing):
┌───────────────────────────────────────────────┐
│  ██████████████████████████████████████████  │
├───────────────────────────────────────────────┤
│                                               │
│           GAME CONTAINER (16:9)               │
│           centered, full width                │
│                                               │
├───────────────────────────────────────────────┤
│  ██████████████████████████████████████████  │
└───────────────────────────────────────────────┘
```

### Portrait Mode (9:16)

On screens with `orientation: portrait`:

```
On 9:16 phone (perfect fit):
┌───────────────────────┐
│                       │
│   GAME CONTAINER      │
│       (9:16)          │
│                       │
│   fills entire        │
│   screen              │
│                       │
│                       │
└───────────────────────┘

On 3:4 iPad (pillarboxing):
┌─────────────────────────────┐
│ ██ │               │ ██ │
│ ██ │  GAME         │ ██ │
│ ██ │  CONTAINER    │ ██ │
│ ██ │  (9:16)       │ ██ │
│ ██ │  centered     │ ██ │
│ ██ │               │ ██ │
└─────────────────────────────┘
```

---

## Component Structure

### File Structure

```
app/
├── components/
│   ├── GameViewport/
│   │   ├── index.tsx           # Main viewport wrapper
│   │   ├── GameContainer.tsx   # Fixed aspect ratio container
│   │   └── LoadingScreen.tsx   # Full-viewport loading overlay
│   ├── NavBar/                 # Relative positioned navbar
│   ├── Footer/                 # Action buttons
│   └── Table.tsx               # Simplified table (no dimension tracking)
│
├── table/
│   └── [id]/
│       ├── layout.tsx          # Uses GameViewport
│       └── page.tsx            # Renders Table
```

---

## Component Details

### 1. GameViewport (`/app/components/GameViewport/index.tsx`)

The outermost wrapper that handles the full viewport and centers the fixed-ratio container.

**Properties:**

- `position: fixed`
- `width: 100vw`, `height: var(--full-vh)`
- `display: flex`, `align-items: center`, `justify-content: center`
- `bg: bg.letterbox`

**Children:**

- `LoadingScreen` (conditional, outside GameContainer)
- `GameContainer` with content

### 2. GameContainer (`/app/components/GameViewport/GameContainer.tsx`)

Maintains fixed aspect ratio using CSS media queries.

**Landscape Mode:**

```css
aspect-ratio: 16 / 9;
max-width: calc(var(--full-vh) * 1.7778);
max-height: calc(100vw * 0.5625);
```

**Portrait Mode:**

```css
aspect-ratio: 9 / 16;
max-width: calc(var(--full-vh) * 0.5625);
max-height: calc(100vw * 1.7778);
```

**Features:**

- Enables CSS Container Queries (`container-type: size`)
- Applies blur filter during loading

### 3. Navbar (`/app/components/NavBar/index.tsx`)

**Key Change: Now uses relative positioning instead of fixed.**

**Properties:**

- `position: relative` (not fixed)
- `padding: 2%` (percentage-based)
- `width: 100%`
- `flexShrink: 0`

### 4. Table (`/app/components/Table.tsx`)

**Simplified:** Removed all dimension tracking logic.

**Removed:**

- `imageDimensions` state
- `isGridReady` state
- `ResizeObserver` logic
- Window resize event listeners

**Grid Positioning:**

- Uses `width: 100%`, `height: 100%` directly
- No dimension calculations needed
- Same two grid layouts (landscape/portrait) via CSS media queries

### 5. SideBarChat (`/app/components/NavBar/Chat/SideBarChat.tsx`)

**Changed from `position: fixed` to `position: absolute`** to work within the GameContainer.

**Width:**

- Portrait: `100%` of container
- Landscape: `40%` of container

---

## Z-Index Hierarchy

```
9999    →  LoadingScreen (full viewport overlay)
1000    →  SideBarChat
999     →  Chat backdrop overlay
990     →  Pause Banner
99      →  Navbar
1       →  Content Layer
```

---

## Key Benefits of This Architecture

| Aspect                  | Before                       | After                  |
| ----------------------- | ---------------------------- | ---------------------- |
| Navbar positioning      | Fixed to viewport            | Relative in container  |
| Dimension tracking      | ResizeObserver + state       | Not needed             |
| Grid positioning        | Calculated from image bounds | 100% of container      |
| Sizing units            | px, rem, breakpoint arrays   | %, cqw, cqh            |
| Screen ratio handling   | Complex responsive logic     | Automatic letterboxing |
| LandscapeScreen blocker | Required component           | Removed                |

---

## Responsive Design

### Using Container Query Units

With `container-type: size` on GameContainer, children can use:

```css
/* cqw = 1% of container width */
/* cqh = 1% of container height */

.element {
    width: 8cqw;
    font-size: 2cqw;
}
```

### Two Layouts Only

Instead of many responsive breakpoints, we maintain only:

1. **Landscape layout** (16:9) - 5-column grid
2. **Portrait layout** (9:16) - 3-column grid

The container handles all screen ratio variations via letterboxing.

---

## CSS Variables

```css
:root {
    --full-vh: 100vh; /* Falls back to 100dvh when supported */
}
```

---

## Theme Colors

```typescript
semanticTokens: {
    colors: {
        'bg.letterbox': {
            default: '#D8D8DD',  // Light mode: soft gray (slightly darker than game container)
            _dark: '#141418',    // Dark mode: deep charcoal (slightly darker than game container)
        },
    }
}
```

---

## Summary

The table page uses a **fixed aspect ratio container** approach:

1. **GameViewport** fills the full viewport and centers the game
2. **GameContainer** maintains 16:9 (landscape) or 9:16 (portrait) ratio
3. **Letterboxing** handles non-standard screen ratios automatically
4. **All components** use relative/percentage-based sizing within the container
5. **No dimension tracking** - the container's fixed ratio ensures consistent layouts
