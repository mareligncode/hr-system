# Design System Specification: High-End Editorial HR

## 1. Overview & Creative North Star: "The Digital Concierge"
This design system moves away from the utilitarian, "box-heavy" aesthetic of traditional HR software. Instead, it adopts the persona of **The Digital Concierge**. The goal is to make administrative tasks feel like a premium experience, mirroring the 5-star service the hotel provides to its guests.

The system breaks the "template" look through **Intentional Asymmetry** and **Tonal Depth**. By utilizing generous whitespace and overlapping glass layers, we create a layout that feels curated rather than automated. We prioritize editorial layouts where high-contrast typography and "breathing room" guide the user’s eye, rather than rigid grid lines.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated blend of deep authority (Navy) and refined luxury (Gold).

### The Color Tokens
- **Primary (`#00113a`):** The foundation. Used for high-level navigation and moments of absolute authority.
- **Secondary/Gold (`#775a19`):** Our "Signature Polish." Used for accents, refined borders, and critical CTAs.
- **Tertiary/Slate (`#051522`):** Used for deep-contrast elements or dark-mode-style surface accents.
- **Surface & Background (`#f8f9fa`):** A crisp, clean base that allows the luxury elements to pop.

### The "No-Line" Rule
To maintain a premium feel, **1px solid borders for sectioning are strictly prohibited.** Do not use lines to separate a sidebar from a main view or a header from a body. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Generous Whitespace:** Using the spacing scale to create "voids" that act as separators.
3.  **Tonal Transitions:** Subtle shifts in container depth.

### The "Glass & Gradient" Rule
Standard flat containers are for utility; Glassmorphism is for prestige.
- **Floating Elements:** Use `surface-container-lowest` at 70% opacity with a `backdrop-filter: blur(20px)`. This creates a frosted glass effect that allows the underlying colors to bleed through, softening the interface.
- **Signature Textures:** Apply a subtle linear gradient from `primary` to `primary_container` (150-degree angle) for hero cards or primary buttons. This adds a "silk-like" depth that flat hex codes cannot achieve.

---

## 3. Typography: Editorial Authority
We use a high-contrast scale to separate "Information" from "Direction."

*   **Headings: Montserrat (Bold, Sophisticated)**
    *   **Display (`3.5rem` - `2.25rem`):** Used for high-impact welcome messages or key metrics. It should feel like a luxury magazine headline.
    *   **Headline (`2rem` - `1.5rem`):** Used for page titles. Always use `on_surface` or `primary` to maintain weight.
*   **Body & UI: Lato (Clean, Professional)**
    *   **Title (`1.375rem` - `1rem`):** Used for card headers and section labels.
    *   **Body (`1rem` - `0.75rem`):** Optimized for readability in employee records and policy documents.
    *   **Labels (`0.75rem` - `0.6875rem`):** Use `on_surface_variant` for metadata to ensure it recedes behind primary content.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a physical property. We stack surfaces like sheets of fine vellum.

*   **The Layering Principle:** 
    *   Base Page: `surface`
    *   Section Containers: `surface-container-low`
    *   Interactive Cards: `surface-container-lowest` (This creates a "lifted" effect through brightness rather than shadow).
*   **Ambient Shadows:** If a card must "float" (e.g., a modal or dropdown), use a shadow with a blur radius of `40px` and an opacity of `4%`. The shadow color should be a tint of `primary` (`#00113a`) to make it feel like part of the environment.
*   **The Ghost Border:** If a border is required for accessibility, use the `secondary` (Gold) or `outline-variant` token at **15% opacity**. This creates a "suggestion" of a boundary that feels expensive, not restrictive.

---

## 5. Components

### Buttons
*   **Primary:** A gradient-filled container (`primary` to `primary_container`) with `on_primary` text. Use `xl` (0.75rem) roundedness.
*   **Secondary/Gold:** A `secondary` (Gold) ghost border (20% opacity) with `on_secondary_container` text.
*   **Tertiary:** No container. Purely typography-based with an icon, using `on_surface_variant`.

### Input Fields
*   **Style:** Minimalist. No background fill. Only a bottom border (Ghost Gold) that transitions to a full `secondary` (Gold) color on focus.
*   **Labels:** Floating labels using `label-md` Lato.

### Cards & Lists
*   **Rule:** **No Divider Lines.** 
*   **Structure:** Use vertical spacing (e.g., 24px) to separate list items. For cards, use `surface-container-lowest` with a subtle `secondary_fixed_dim` (Gold) top-border (2px) to denote luxury status.

### Premium Accents (System Specific)
*   **The "Status Jewel":** Instead of a standard badge, use a small, glowing 3D-effect sphere for employee status (e.g., "On Duty").
*   **Glass Drawer:** Side navigation should be a full-height `surface-container` glass panel with a heavy backdrop blur, making the dashboard feel like a multi-layered workspace.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-sm` heading on the left with a small `label-md` description offset to the right.
*   **Embrace Whitespace:** If you think a section needs more content, it probably needs more margin.
*   **Layer Glass:** Use glassmorphism for top navigation bars to keep the "5-star" atmosphere consistent.

### Don’t:
*   **Don't use 100% Black:** Use `primary` or `tertiary` for dark text to maintain the navy-luxury undertone.
*   **Don't use Default Shadows:** Never use the standard CSS `box-shadow: 0 2px 4px rgba(0,0,0,0.5)`. It is too "heavy" for this system.
*   **Don't Box Everything:** Avoid wrapping every piece of data in a card. Let some data sit "naked" on the background to create visual hierarchy.