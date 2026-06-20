---
name: Hytale UI Studio
description: A powerful visual editor simulating Hytale's UI engine
colors:
  primary: "oklch(0.65 0.18 200)"
  background: "oklch(0.13 0.005 260)"
  card: "oklch(0.16 0.005 260)"
  popover: "oklch(0.18 0.005 260)"
  secondary: "oklch(0.22 0.005 260)"
  muted: "oklch(0.2 0.005 260)"
  accent: "oklch(0.7 0.15 145)"
  destructive: "oklch(0.55 0.22 25)"
  border: "oklch(0.25 0.005 260)"
  panel: "oklch(0.14 0.005 260)"
  canvas: "oklch(0.1 0.005 260)"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "oklch(0.98 0 0)"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "oklch(0.93 0.01 260)"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Hytale UI Studio

## 1. Overview

**Creative North Star: "The Precision Sandbox"**

This system focuses on giving the user exact, mathematical tools in a clean canvas. The studio is a native-feeling, highly precise editing environment designed for building 1:1 Hytale UI structures. The interface remains out of the way, serving only as the scaffolding for the user's work. It explicitly rejects glassmorphism, neon colors, and bloated UI trends.

**Key Characteristics:**
- Utilitarian and unobtrusive
- Dark-mode native (Abyss Space theme)
- Mathematically precise layout emulation
- Driven by a sharp "Principal Teal" accent

## 2. Colors

A dark, focused theme anchored by a deep blue-gray canvas and highlighted with a precise teal accent.

### Primary
- **Principal Teal** (`oklch(0.65 0.18 200)`): Used sparingly for active states, selection outlines, and primary actions. It focuses attention exactly where it belongs.

### Secondary
- **Success Green** (`oklch(0.7 0.15 145)`): Used for successful actions or active toggles.

### Tertiary
- **Destructive Red** (`oklch(0.55 0.22 25)`): Used for deletions and destructive modal confirmations.

### Neutral
- **Abyss Space (Canvas)** (`oklch(0.1 0.005 260)`): The deepest dark, reserved for the primary editing canvas.
- **Panel Dark** (`oklch(0.14 0.005 260)`): The base color for sidebars and tools.
- **Border/Divider** (`oklch(0.25 0.005 260)`): Used to separate panels and input fields.
- **Foreground Text** (`oklch(0.93 0.01 260)`): Primary white text for maximum readability.

**The One Voice Rule.** The Principal Teal accent is used on ≤10% of any given screen. Its rarity is the point.

## 3. Typography

**Display Font:** Inter (with sans-serif)
**Body Font:** Inter (with sans-serif)
**Label/Mono Font:** JetBrains Mono (with monospace)

**Character:** Technical, highly legible, and neutral. Inter provides excellent readability for dense UI panels, while JetBrains Mono handles exact pixel coordinates and code.

### Hierarchy
- **Display** (700, 24px+): Used only for major section headers or empty state heroes.
- **Headline** (600, 18px): Panel titles or modal headers.
- **Body** (400, 14px): Standard text in panels and menus.
- **Label** (400, 12px): Property names, numeric inputs, code views, and layout metrics.

**The Utility First Rule.** Typography is never decorative. It exists purely to label, inform, and structure the interface.

## 4. Elevation

The system relies on Subtle Layering. Surfaces are mostly flat, using borders for separation. 

### Shadow Vocabulary
- **Modal Lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5)`): Used for popovers, dropdowns, and dialogs to visually separate them from the main flat canvas.
- **Hover Pop** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3)`): Very subtle shadow used when hovering over interactive elements.

**The Subtle Layering Rule.** Flat by default. Shadows appear only to lift transient surfaces (modals, tooltips, dropdowns) above the permanent studio scaffolding.

## 5. Components

Components are utilitarian and discreet, focusing purely on function in compact sizes without demanding attention.

### Buttons
- **Shape:** Softly rounded (6px radius).
- **Primary:** Principal Teal background, white text.
- **Hover / Focus:** Slight background dimming; a Principal Teal focus ring on keyboard navigation.
- **Secondary / Ghost:** Transparent backgrounds that turn into subtle dark grays (`oklch(0.25 0.005 260)`) on hover.

### Inputs / Fields
- **Style:** Compact, dark background (`oklch(0.2 0.005 260)`), bordered (`oklch(0.25 0.005 260)`).
- **Focus:** A clear Principal Teal ring to indicate keyboard focus.
- **Typography:** Often uses JetBrains Mono for numeric values (padding, anchor points).

### Cards / Panels
- **Corner Style:** Sharp or minimal radius to feel like a native desktop panel.
- **Background:** Panel Dark (`oklch(0.14 0.005 260)`).
- **Shadow Strategy:** Flat by default (see Elevation).
- **Border:** 1px solid border (`oklch(0.25 0.005 260)`).

## 6. Do's and Don'ts

### Do:
- **Do** use Principal Teal (`oklch(0.65 0.18 200)`) strictly for active states and primary actions.
- **Do** rely on JetBrains Mono for technical properties (width, height, flex weights).
- **Do** ensure contrast across the dark Abyss Space backgrounds.

### Don't:
- **Don't** use glassmorphism (blurs, transparent frosted glass).
- **Don't** use neon, heavy glows, or excessive drop shadows on permanent panels.
- **Don't** use colors that deviate significantly from Hytale's original aesthetic.
- **Don't** clutter the interface with decorative typography or excessive whitespace.
