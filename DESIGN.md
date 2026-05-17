---
name: Sewasah Agree
description: AI-powered tenancy agreement platform for Malaysian law firms
colors:
  kedai-earth: "#3d2c1e"
  kedai-terracotta: "#c4622d"
  kedai-sand: "#f5ede0"
  kedai-cream: "#faf6f0"
  kedai-warm-white: "#fefcf9"
  kedai-ink: "#1e1610"
  kedai-mist: "#e8ddd0"
  kedai-moss: "#4a6741"
  kedai-amber: "#d4821a"
  kedai-alert: "#b83c2b"
  sidebar-deep: "#2a1f14"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.kedai-terracotta}"
    textColor: "{colors.kedai-warm-white}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.kedai-earth}"
    textColor: "{colors.kedai-warm-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.kedai-earth}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  input-field:
    backgroundColor: "{colors.kedai-warm-white}"
    textColor: "{colors.kedai-ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  status-pending:
    backgroundColor: "#fef3cd"
    textColor: "#7c5c00"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-approved:
    backgroundColor: "#d4edda"
    textColor: "#1a5c2e"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-stamp:
    backgroundColor: "#e8d5f5"
    textColor: "#5b2d8e"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Sewasah Agree

## 1. Overview

**Creative North Star: "The Modern Kedai"**

A kedai is a neighborhood shop — familiar, unpretentious, always there when you need it. The person behind the counter knows your name, handles things without fuss, and makes the complex feel manageable. Sewasah Agree carries this energy into a legal workflow tool: warm earthy tones of timber and terracotta, generous spacing that breathes, and type that guides without shouting.

The user is a 40-something admin or lawyer in a small Malaysian firm. They are not intimidated by Microsoft Word, but they have never used a proper SaaS tool before. Every screen must feel immediately readable: one clear primary action, supporting details at a glance, no hunting for what to do next. The warmth is functional — it lowers the stakes of handling legal documents.

This system rejects the grey utilitarian coldness of government portals (MyTax, LHDN), the formal navy-and-serif of corporate law firms, and the hollow gradient-metric aesthetic of generic SaaS dashboards. It also rejects the neon playfulness of consumer fintech — agreements are serious documents; the interface should feel trustworthy, not party-ready.

**Key Characteristics:**
- Earthy, warm neutrals anchored by terracotta and sand
- Dark sidebar in deep kedai-earth tone, like a timber-paneled wall
- Single saturated accent (terracotta) used with discipline
- Rounded but not bubbly — softness signals approachability, not immaturity
- Flat surfaces with tonal layering; no decorative shadows
- Subtle transitions confirm actions; nothing animates without purpose

## 2. Colors: The Kedai Palette

One saturated anchor (terracotta) against a field of warm earthy neutrals. Committed strategy: terracotta carries 20-30% of interactive surfaces.

### Primary
- **Kedai Terracotta** (oklch(0.55 0.14 40) / #c4622d): The action color. Used on primary buttons, active nav states, progress indicators, and key data points. Never used decoratively.
- **Kedai Earth** (oklch(0.22 0.05 45) / #3d2c1e): Deep brown used in the sidebar background and hover states on the primary button. Grounds the interface.

### Secondary
- **Kedai Moss** (oklch(0.42 0.08 145) / #4a6741): Approval and completed states. Legibility over vibrancy — this is confirmation green, not celebration green.
- **Kedai Amber** (oklch(0.62 0.12 65) / #d4821a): Warning and in-progress states. Warm amber reads as "attention needed" without alarm.

### Neutral
- **Kedai Sand** (oklch(0.93 0.02 60) / #f5ede0): Page backgrounds. Warm, never stark.
- **Kedai Cream** (oklch(0.96 0.015 60) / #faf6f0): Card and panel backgrounds. One step lighter than the page.
- **Kedai Warm White** (oklch(0.99 0.005 60) / #fefcf9): Input backgrounds. The lightest surface in the system.
- **Kedai Mist** (oklch(0.88 0.015 55) / #e8ddd0): Borders, dividers, disabled backgrounds. The quiet separator.
- **Kedai Ink** (oklch(0.12 0.02 45) / #1e1610): Primary text. Warm black — never pure #000.
- **Kedai Alert** (oklch(0.48 0.18 27) / #b83c2b): Destructive actions and error states only.

### Named Rules
**The Terracotta Discipline Rule.** Terracotta appears on at most one primary action per screen. If two buttons are visible, one is terracotta, the other is ghost. Never two filled terracotta buttons side by side.

**The Warm Neutrals Rule.** No pure white (#fff), no pure black (#000), no mid-grey (#888). Every neutral is tinted toward the 45-60° hue range. The interface should feel warm even when empty.

## 3. Typography

**Display/Body Font:** Geist (with system-ui, sans-serif fallback)

**Character:** Geist is clean and modern but slightly humanist — not geometric-cold like Inter, not informal like Poppins. At the weights used here (400 body, 600 headline, 700 display), it carries authority without stiffness. Appropriate for a legal tool that should not feel bureaucratic.

### Hierarchy
- **Display** (700, 2rem, 1.15 line-height, -0.02em tracking): Page titles only. One per screen.
- **Headline** (600, 1.25rem, 1.3): Section headers, card titles, modal titles.
- **Title** (600, 1rem, 1.4): Sub-section labels, list item names, form group headers.
- **Body** (400, 0.9375rem / 15px, 1.6): All running content. Max 65ch line length on prose.
- **Label** (500, 0.75rem, 0.06em tracking, uppercase): Table headers, metadata tags, status labels. Always uppercase with tracked spacing.

### Named Rules
**The Single Voice Rule.** No decorative type — no italic accent fonts, no serif display mixed with sans body. Geist at varied weights is sufficient hierarchy. Mixing typefaces signals distrust.

## 4. Elevation

Flat by default. Surfaces are distinguished by background color alone — the page is sand, cards are cream, inputs are warm-white. No shadow appears at rest.

A single shadow tier exists for hover and elevated state only:

### Shadow Vocabulary
- **Lifted** (`box-shadow: 0 2px 8px oklch(0.22 0.05 45 / 0.10)`): Applied on card hover (`.card-hover`). Subtle upward movement confirms interactivity. Not used decoratively.

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest flat. The lifted shadow appears only in response to user intent (hover, focus, drag). A shadow at rest is decoration; a shadow on hover is communication.

## 5. Components

### Buttons
- **Shape:** Gently rounded (16px radius). Rounded enough to feel approachable, not so rounded it reads as playful.
- **Primary:** Terracotta fill (`#c4622d`), warm-white text, 10px 20px padding. Transitions to kedai-earth on hover over 150ms ease-out.
- **Ghost:** Transparent background, kedai-earth text, kedai-mist border. Used for secondary actions alongside a primary button.
- **Destructive:** Kedai-alert fill, warm-white text. Used only for irreversible actions.

### Status Badges
Round-pill shape (`border-radius: 9999px`), 2px 10px padding, 0.75rem label text. Four variants:
- Draft: mist background, ink text
- Pending Review: warm amber tint, amber-dark text
- Approved: moss tint, moss-dark text
- Awaiting Stamp / Stamped: purple tint (neutral; not a brand color, just a distinguishing hue for this workflow state)
- Completed: deep moss fill, white text

### Cards / Containers
- **Corner Style:** 16px radius (lg)
- **Background:** Kedai cream (#faf6f0)
- **Shadow:** None at rest; lifted shadow on hover
- **Border:** 1px kedai-mist (#e8ddd0)
- **Internal Padding:** 20px (lg minus a step — not uniform across all cards; allow variation)

### Inputs / Fields
- **Style:** 1px mist border, warm-white background, 10px radius
- **Focus:** Terracotta ring (2px, 2px offset). No background color change on focus.
- **Disabled:** Mist background, muted-foreground text, cursor: not-allowed

### Navigation (Sidebar)
- **Background:** Deep kedai earth (oklch(0.16 0.04 45) / #2a1f14) — darker than the primary button, like aged timber
- **Default nav item:** 60% white text, no background
- **Hover:** 10% white overlay, full white text
- **Active:** 15% white overlay, full white text, terracotta left accent dot (4px circle, not a border stripe)
- **Logo mark:** Terracotta on earth background

### Progress Tracker
Used on agreement detail pages. Horizontal step indicator with connected line. Completed steps: moss fill. Active step: terracotta fill with subtle pulse ring. Upcoming: mist fill, muted text. The line between steps fills left-to-right as progress advances.

### Signature Component: The Status Flow Strip
A horizontal progress bar unique to Sewasah Agree. Six named stages (Draft, Review, Approved, Stamp, Stamped, Done). Each stage is a labeled dot. The connecting line fills with terracotta as stages complete. This component is the most important navigation element in the app — always visible on the agreement detail screen.

## 6. Do's and Don'ts

### Do:
- **Do** use terracotta (`#c4622d`) for exactly one primary action per screen. Its rarity signals importance.
- **Do** vary internal padding between cards. 16px on compact cards, 24px on detail panels, 32px on hero sections. Same padding everywhere is monotony.
- **Do** use label-weight uppercase text (0.75rem, 500, 0.06em tracking) for ALL table headers and metadata. Consistency here builds scannability.
- **Do** write short button labels. "Approve" not "Click to Approve Agreement". "Send for Review" not "Submit Agreement for Lawyer Review".
- **Do** show progress explicitly. The status flow strip must be visible on every agreement detail screen. Users must always know where they are.
- **Do** use oklch() for all color definitions in CSS. The warm palette requires precise chroma control that hex cannot express cleanly.
- **Do** transition interactive states at 150ms ease-out. Fast enough to feel responsive, slow enough to feel considered.

### Don't:
- **Don't** use government portal grey. No `#808080`, no `#f2f2f2`, no `#cccccc`. Every surface is warm.
- **Don't** use the sidebar's dark earth tone anywhere in the main content area. The sidebar darkness is the boundary between navigation and work.
- **Don't** put gradient fills on text. Copy from PRODUCT.md: "Gradient text is decorative, never meaningful."
- **Don't** use identical card grids with icon + heading + text repeated. The stat summary on the dashboard breaks this pattern deliberately; don't introduce new identical-card sections elsewhere.
- **Don't** use navy, formal serif typefaces, or dark-on-dark layouts. Per PRODUCT.md: avoid the corporate law firm look.
- **Don't** use bright neon or high-chroma colors. This is not a consumer fintech app. No `oklch(0.8 0.3 300)` purples, no electric teals.
- **Don't** animate layout properties (width, height, padding, margin). Animate opacity and transform only.
- **Don't** use border-left as a colored accent stripe on cards or alerts. Use background tints or leading icons instead.
- **Don't** stack two filled buttons side by side. Primary + ghost, never primary + primary.
- **Don't** use modals for confirmation. Use inline confirmation patterns (the "Mark as Stamped" confirm-expand pattern already in use is correct).
