# Design System Strategy: The Atmospheric Lens

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Obsidian"**

This design system moves away from the flat, sterile "SaaS-standard" look in favor of an atmospheric, high-fidelity experience. Inspired by the precision of high-end developer tools and the depth of editorial luxury, the system treats the screen not as a flat canvas, but as a multi-layered viewport into data.

We achieve a "signature" look through **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, centered grids, we utilize wide-margin offsets and overlapping containers to create a sense of motion. By replacing harsh lines with light-source-driven glows, we evoke a sense of physical hardware—sophisticated, dark-machined surfaces illuminated by the soft teal of a high-performance terminal.

## 2. Colors: Depth Over Division
Our palette is rooted in deep midnight navy, designed to reduce eye fatigue while providing a rich foundation for high-contrast typography.

### The Palette
- **Deep Midnight Background:** `surface-container-lowest` (#090E19)
- **Primary Accent:** `primary` (#4FDBC8) / `primary-container` (#14B8A6)
- **Sentiment Roles:**
    - **Positive:** #10B981
    - **Neutral:** #64748B
    - **Negative:** #F43F5E

### The "No-Line" Rule
To achieve a premium editorial feel, **standard 1px solid borders are prohibited for sectioning.** Structural division must be achieved through:
1.  **Background Shifts:** Use `surface-container` (#1B1F2B) for the main content body against a `surface` background (#0E131E).
2.  **Vertical Space:** Use the Spacing Scale (specifically `8` (2rem) and `12` (3rem)) to let content breathe, creating boundaries through negative space.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested obsidian plates.
- **Level 0 (Base):** `surface` (#0E131E)
- **Level 1 (Sections):** `surface-container-low` (#171B27)
- **Level 2 (Cards/Interactives):** `surface-container-high` (#252A36)
- **Level 3 (Popovers/Modals):** `surface-bright` (#343946) with 80% opacity and `backdrop-filter: blur(12px)`.

### Signature Textures
Apply a **Volumetric Glow** to focal points. Use a radial gradient:
`radial-gradient(circle at center, rgba(20, 184, 166, 0.15) 0%, rgba(10, 15, 26, 0) 70%)`.
Place these behind primary metrics or CTA sections to provide "soul" and depth.

## 3. Typography: The Editorial Edge
We pair the architectural precision of **Manrope** (Display/Headlines) with the functional clarity of **Inter** (Body) and the technical rigor of **Space Grotesk** (Labels/Data).

- **Display-LG (3.5rem / Manrope):** Used for "hero" metrics and editorial headers. Keep tracking at -0.02em for a tight, authoritative look.
- **Headline-MD (1.75rem / Manrope):** The primary section header.
- **Body-MD (0.875rem / Inter):** The workhorse. Use `on-surface-variant` (#BBCAC6) for secondary body text to maintain hierarchy.
- **Label-SM (0.6875rem / Space Grotesk):** All-caps for metadata. Use `on-secondary-container` (#ADB5CA) with +0.05em letter spacing.

The contrast between the rounded, friendly Manrope and the rigid, technical Space Grotesk creates a "Digital Curator" personality—approachable yet precise.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web-standard." We use **Ambient Shadows** and **Inner Highlights** to define objects.

### The Layering Principle
Avoid shadows on cards. Instead, place a `surface-container-highest` (#303541) element on top of a `surface-container-low` (#171B27) area. The contrast in value creates the "lift."

### Ambient Shadows
For floating elements (Modals/Dropdowns), use a shadow that mimics natural light:
`box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;`
The `inset` border (Inner Highlight) is crucial—it simulates the "catch-light" on the edge of a glass pane.

### The "Ghost Border" Fallback
If an edge must be defined, use the **Ghost Border**:
`outline: 1px solid rgba(133, 148, 144, 0.15);` (using `outline-variant` at reduced opacity). Never use pure white or solid grey.

## 5. Components
All components utilize a base **12px border-radius** (`md: 0.75rem`).

- **Buttons:**
    - **Primary:** `primary-container` (#14B8A6) background. No border. Subtle 20% glow on hover.
    - **Secondary:** Ghost style. `outline-variant` at 20% opacity. On hover, increase background to `surface-container-highest`.
- **Cards:** No dividers allowed. Separate content blocks with `6` (1.5rem) of padding. Use `surface-container-low` for the card body.
- **Input Fields:** Use `surface-container-lowest` for the field background. The active state should not change the border color to a thick line; instead, use a 1px `primary` bottom-border and a subtle teal glow.
- **Sentiment Chips:** 
    - **Positive:** Background #10B981 at 10% opacity, Text #10B981.
    - **Negative:** Background #F43F5E at 10% opacity, Text #F43F5E.
- **Data Rows:** Forbid divider lines. Use `surface-container-low` for even rows and `surface` for odd rows, or simply use whitespace.

### Custom Component: The Sentiment Heatmap
A specialized data visualization component utilizing the `JetBrains Mono` font. It uses a 1px `outline-variant` grid where each cell is colored based on sentiment density, mimicking a high-end commit graph.

## 6. Do's and Don'ts

### Do
- **Do** use `space-grotesk` for all numeric data and technical labels to imply precision.
- **Do** embrace asymmetry. It is okay to have a left-heavy dashboard if the right side provides significant "visual silence."
- **Do** use `backdrop-filter: blur()` on all floating navigation elements to maintain the atmospheric "Digital Obsidian" feel.

### Don't
- **Don't** use 1px solid borders to separate the sidebar from the main content. Use a background color shift instead.
- **Don't** use pure black (#000000) for shadows. Use a tinted navy shadow to keep the colors vibrant.
- **Don't** use "standard" 16px body text for metadata. Drop to `body-sm` or `label-sm` to keep the UI feeling sophisticated and "dense" like a professional instrument.
- **Don't** use high-contrast white text for everything. Reserve `on-surface` (#DEE2F2) for headlines and `on-surface-variant` (#BBCAC6) for general reading.