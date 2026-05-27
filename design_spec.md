# Design Specification: YouTube Clipper

## 1. Design Philosophy & Aesthetic
The YouTube Clipper application will employ an **Ultra-Minimalist Dark SaaS** design language, inspired by modern tools like Linear, Vercel, and OpusClip. The goal is to create a highly focused, professional, and distraction-free environment. We will utilize stark contrasts, solid dark backgrounds, crisp 1px borders, and eliminate all neon glows and heavy glassmorphism in favor of a clean, utilitarian aesthetic.

## 2. Color Palette
The color palette is highly constrained, providing stark contrasts for both dark and light modes.

### Dark Theme (Default)
*   **Background (App & Canvas):** Solid pitch black (`#000000`) or very dark gray (e.g., Tailwind `zinc-950` / `#09090b`).
*   **Surface/Panels:** Slightly lighter gray for elevated surfaces (e.g., `zinc-900` / `#18181b`), or completely transparent with borders.
*   **Borders:** Crisp, 1px solid lines using `zinc-800` (`#27272a`).
*   **Primary Accent:** White (`#ffffff`) for primary actions or a muted, sophisticated indigo/blue (e.g., `indigo-500` / `#6366f1`) for specific highlights.
*   **Text Colors:**
    *   *Primary (Headings & Key Values):* White (`#ffffff`)
    *   *Secondary (Body & Labels):* `zinc-400` (`#a1a1aa`)
    *   *Muted:* `zinc-500` (`#71717a`)
    *   *Error:* Muted red (e.g., `red-500` / `#ef4444`)
    *   *Success:* Muted green (e.g., `emerald-500` / `#10b981`)

### Light Theme
*   **Background (App & Canvas):** Solid white (`bg-white` / `#ffffff`) or very light gray (`zinc-50` / `#fafafa`).
*   **Surface/Panels:** White or very light gray (`zinc-100` / `#f4f4f5`) for elevated surfaces.
*   **Borders:** Crisp, 1px solid lines using `zinc-200` (`#e4e4e7`).
*   **Primary Accent:** Black (`#000000`) for primary actions or a sophisticated indigo/blue (`indigo-600` / `#4f46e5`).
*   **Text Colors:**
    *   *Primary (Headings & Key Values):* `zinc-900` (`#18181b`)
    *   *Secondary (Body & Labels):* `zinc-600` (`#52525b`)
    *   *Muted:* `zinc-400` (`#a1a1aa`)
    *   *Error:* Muted red (`red-500` / `#ef4444`)
    *   *Success:* Muted green (`emerald-500` / `#10b981`)

## 3. Typography
Typography will be sharp, high-contrast, and neutral, prioritizing legibility and a stark, technical feel.

*   **Primary Font (Headings & UI Labels):** *Inter*, *Geist*, or system sans-serif (e.g., Apple System, Segoe UI).
    *   *Weights:* 600 (Semibold) for headings, 400 (Regular) or 500 (Medium) for labels and buttons.
*   **Secondary Font (Monospace for Timestamps/URLs/Code):** *Geist Mono*, *JetBrains Mono*, or system monospace.
    *   Used specifically for precise data like timestamps (MM:SS), URLs, and technical logs.

## 4. UI Components & Details

### 4.1. Main Container
The application layout will be flat and structured, avoiding floating "glass" cards.
*   **Style:** Flat, structured panels.
*   **Background:** Solid `zinc-950` or `#000000`.
*   **Border Radius:** Subtle, small corners (e.g., `6px` or `8px`).
*   **Shadow:** None, or an extremely subtle 1px drop shadow for depth (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`).
*   **Border:** `1px solid border-zinc-800`.
*   **Effects:** No backdrop blurs or gradients.

### 4.2. Input Fields (URL & Timestamps)
*   **State (Default):** Solid background `zinc-900`, `6px` border radius, crisp `zinc-800` border.
*   **State (Focus):** Border changes to `zinc-600` or White. Ring effect is minimal (e.g., `box-shadow: 0 0 0 1px #ffffff`). No glowing colors.
*   **Typography:** URLs and timestamps use the Monospace font. `zinc-400` placeholder, White input text.

### 4.3. Primary Action Button ("Generate Clip")
*   **Style:** Minimalist. Solid white background.
*   **Typography:** Black text (`#000000`), Medium weight (500), standard case.
*   **Hover Effect:** Slight opacity change (e.g., `opacity: 0.9`) or background changes to `zinc-200`. No scaling, no glowing drop shadows.
*   **Active Effect:** Slight scale down (`transform: scale(0.98)`).
*   **Alternative Style:** If color is needed, use a solid, muted indigo/blue with white text.

### 4.4. Process Indicators & Loading States
*   **Process Indicator:** Instead of multi-step glowing text, use a simple, clean textual status (e.g., "Processing... 45%") in `zinc-400`.
*   **Progress Bar:** 1px or 2px thin line. Track is `zinc-800`, fill is solid White (`#ffffff`) or a muted blue. No glowing effects.
*   **Video Preview Loading:** A flat, dark gray (`zinc-900`) skeleton with a very subtle shimmer effect. No glass layers.

### 4.5. Auto-Subtitle Toggle Switch
*   **Style:** Small, crisp, standard toggle switch.
*   **Track (Inactive):** Solid `zinc-800`.
*   **Track (Active):** Solid White (`#ffffff`) or muted blue.
*   **Knob (Thumb):** Solid circle. `zinc-400` when inactive, Black (`#000000`) or White when active.
*   **Typography (Label):** `zinc-400` for description, White for the primary label.

### 4.6. Aspect Ratio Selector
*   **Style:** Segmented control with a highly structured, utilitarian look.
*   **Container:** Background `zinc-900`, rounded `6px`, border `1px solid border-zinc-800`, padding `2px`.
*   **Inactive Segment:** Text color `zinc-400`, transparent background.
*   **Active Segment:**
    *   **Background:** Solid `zinc-800` or White (if high emphasis is needed).
    *   **Typography:** White text (or Black if background is White), medium font weight.
    *   **Border & Shadow:** Small drop shadow (`shadow-sm`) if the background is `zinc-800`. No glowing or colored tints.

### 4.7. Algorithm Bypass (Split-Screen B-Roll)
*   **Location:** Displayed immediately under the Aspect Ratio selector in the Step 2 Dashboard.
*   **Toggle Switch ("Enable Split-Screen B-Roll"):**
    *   **Style:** Sleek, standard toggle switch matching the ultra-minimalist aesthetic.
    *   **Typography:** Label in `zinc-400` or White, minimalist sans-serif.
    *   **Behavior:** When active, expands downward to reveal the B-Roll selection options.
*   **B-Roll Type Selection (Conditional):**
    *   **Style:** Subtle dropdown menu or minimalist radio buttons.
    *   **Container:** `zinc-900` background, `1px solid border-zinc-800`, `6px` rounded corners.
    *   **Options:** E.g., "Subway Surfers", "GTA V Parkour", "ASMR Slime".
    *   **Typography:** Text in `zinc-400`, changing to White on hover/selection.
    *   **Aesthetic:** Ultra-minimalist, no glowing outlines or shadows. Selected states use a crisp white 1px border or subtle `zinc-800` background fill.

### 4.8. Notifications (Toasts & Alerts)
*   **Style:** Clean, solid-colored toast notifications.
*   **Container:** Solid `zinc-900` or `#000000`, `6px` radius, `1px solid border-zinc-800`.
*   **Typography:** White for title, `zinc-400` for description.
*   **Iconography:** Simple, unstyled vector icons. Standard red (`red-500`) for errors, without any glows or neon effects.
*   **Animation:** Standard fast slide-in (`ease-out`, 150ms). No dramatic spring bounces.

### 4.9. Terminal Output (Logs)
*   **Style:** True utilitarian terminal log.
*   **Container:** Solid `#000000` background. Crisp `1px solid border-zinc-800`. Small padding (`8px`).
*   **Typography:** Monospace font. `text-xs` (12px). Colors: `zinc-500` for standard logs, `red-400` for errors.
*   **Scrollbar:** Minimalist `zinc-800` thumb, transparent track.
*   **Action:** Simple "Copy" text button (no icons, just text) in `zinc-400` on hover.

### 4.10. Partial Success / Warning Alert
*   **Style:** Utilitarian alert box.
*   **Container:** Solid `zinc-900` background.
*   **Border:** `1px solid border-zinc-800`, or a muted amber (`amber-500 / #f59e0b`) border for emphasis. No glowing effects or heavy blurs.
*   **Typography:** Soft amber (`amber-400`) for context/title. `zinc-400` for the message.
*   **Iconography:** Simple amber warning icon.

### 4.11. Build Error Fallback Screen
*   **Style:** Stark, functional error page.
*   **Layout:** Centered content on a solid `#000000` background. No gradients or mesh animations.
*   **Container:** None. The content sits directly on the background.
*   **Typography:**
    *   **Heading:** "Application Error" — Inter, Medium, `20px`, White.
    *   **Subtext:** "The application failed to load. Please clear your cache and try again." — Inter, Regular, `14px`, `zinc-400`.
*   **Action Buttons:**
    *   **Primary:** Solid white background, black text.
    *   **Secondary:** Transparent background, `1px solid border-zinc-800`, white text.
*   **Collapsible Technical Details:** Pure text link (`zinc-500`) that reveals a raw text block (Monospace, `zinc-400`) with no extra styling.

### 4.12. Clip Dashboard (Analysis & Selection)
*   **Layout:** Structured grid layout with uniform spacing (`16px` or `24px` gaps).
*   **Clip Cards:**
    *   **Style:** Flat containers. Solid `zinc-950` background, `8px` radius, `1px solid border-zinc-800`. No glassmorphism.
    *   **Hover Effect:** Border subtly changes to `zinc-600`. No elevation (`translateY`), no glowing shadows.
    *   **Virality Score:** A crisp, minimalist badge. Solid `zinc-900` background, `1px solid border-zinc-800`, text colored based on score (e.g., `emerald-500` for high).
    *   **SEO Title:** Inter/Geist, Medium, `text-lg`, White.
    *   **SEO Description:** `text-sm`, `zinc-400`.
    *   **Tags/Keywords:** Small badges, solid `zinc-900`, `zinc-400` text, `1px solid border-zinc-800`.
    *   **Primary Action:** Solid white button, black text. Appears at the bottom of the card.

### 4.13. Empty State Dashboard
*   **Style:** Highly subdued, textual empty state.
*   **Container:** Centered layout. No border, no background.
*   **Iconography:** Very simple, monochromatic SVG icon (e.g., a dashed circle or slash) in `zinc-700`. No animations.
*   **Typography:**
    *   **Main Message:** "No clips found." — Medium, `16px`, White.
    *   **Subtext:** "Adjust your filters or analyze a different video." — Regular, `14px`, `zinc-400`.
*   **Action Button:** Muted outline button (`border-zinc-800`, White text).

### 4.14. Credit Quota Indicator
*   **Location:** Top right corner of the application header, adjacent to the theme toggle.
*   **Default State (Sufficient Credits):**
    *   **Badge Style:** Small, minimalist pill or rounded rectangle (`6px` radius).
    *   **Background:** Solid `zinc-900`.
    *   **Border:** `1px solid border-zinc-800`.
    *   **Typography:** "Credits: 1000" in `zinc-400` or White, using the secondary Monospace font for the numeric value.
*   **Tier 1 Warning (Low Credits <= 200):**
    *   **Badge State:** Background shifts to a very dark, muted amber (e.g., `amber-950/30`), border changes to `amber-700/50`, text becomes `amber-400`.
    *   **Banner:** A slim, full-width warning banner appears at the absolute top of the app.
    *   **Banner Style:** Background `amber-950/20` or `zinc-900`, `1px solid border-amber-900`.
    *   **Banner Typography:** "Low API Credits. Please top up soon." in `amber-400`.
*   **Tier 2 Error (Out of Credits == 0):**
    *   **Badge State:** Background shifts to dark red (e.g., `red-950/30`), border changes to `red-800/50`, text becomes `red-400`.
    *   **Banner:** The top banner becomes a critical error indicator.
    *   **Banner Style:** Background `red-950/20`, `1px solid border-red-900`.
    *   **Banner Typography:** "Out of API Credits. Process halted." in `red-400`.
    *   **Input State:** The primary action button ("Generate Clip") is explicitly disabled (e.g., `opacity-50`, `cursor-not-allowed`, background `zinc-800`, text `zinc-600`), preventing any new submissions.

## 5. Animations & Interactions
*   **Animations:** Fast, purposeful, and almost imperceptible (100ms - 150ms). Use `ease-out` for all transitions.
*   **Background:** Completely static. No moving gradients or meshes.
*   **Hover States:** Focus on subtle color shifts (e.g., `zinc-800` to `zinc-700`) or border color changes. Eliminate all scaling, bouncing, or glowing effects.
*   **Focus Rings:** Crisp, solid 1px or 2px outlines (e.g., solid White or a primary brand color), with zero blur or spread.

## 6. Layout & Responsiveness
*   **Structure & Spacing:** Grid-based and aligned. We use a standardized 4px baseline grid. Margins and padding should be consistent multiples of 4 (e.g., `4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
*   **Responsive Breakpoints (Grid Layout):**
    *   **Mobile (Default):** 1 column for clip cards and structured data.
    *   **Tablet (e.g., `md:` / >= 768px):** 2 columns.
    *   **Desktop (e.g., `lg:` / >= 1024px):** 3 columns.
*   **Adaptive Behavior:** The application remains a focused column or structured grid, adapting cleanly to smaller screens without changing its core flat aesthetic.

## 7. Summary
This design approach strips away extraneous visual flair, focusing entirely on utility, precision, and performance. By adopting an Ultra-Minimalist Dark SaaS aesthetic, the YouTube Clipper application feels like a professional, high-end developer tool.
