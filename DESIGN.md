# EduTrack Design System

## Purpose
Education management platform for students, teachers, and admins. Trustworthy, professional SaaS interface prioritizing clarity, data accuracy, and role-based visual hierarchy.

## Visual Direction
Professional, refined minimalism. Inspired by Linear and Vercel — clean cards, subtle elevation, grid-aligned composition. No gradients or decorative flourishes. Information hierarchy through color, spacing, and typography only.

## Color Palette

| Role | Color | OKLCH | Light | Dark |
|------|-------|-------|-------|------|
| Primary (Indigo) | Trust, Authority | `0.45 0.21 254` | `0.45 0.21 254` | `0.65 0.18 254` |
| Foreground | Text on white | `0.18 0.02 255` | `0.18 0.02 255` | `0.93 0.02 255` |
| Background | Page base | `0.97 0.02 255` | `0.97 0.02 255` | `0.13 0.02 254` |
| Card | Container | `0.99 0 0` | `0.99 0 0` | `0.16 0.02 254` |
| Border | Divider | `0.92 0.01 255` | `0.92 0.01 255` | `0.25 0.02 254` |
| Accent (Green) | Attendance | `0.65 0.18 142` | `0.65 0.18 142` | `0.72 0.16 142` |
| Chart-2 (Amber) | Fees | `0.68 0.19 76` | `0.68 0.19 76` | `0.75 0.17 76` |
| Chart-3 (Purple) | Performance | `0.58 0.17 290` | `0.58 0.17 290` | `0.65 0.16 290` |
| Destructive (Red) | Delete/Error | `0.55 0.22 25` | `0.55 0.22 25` | `0.65 0.19 22` |
| Success (Teal) | Confirmation | `0.7 0.19 175` | `0.7 0.19 175` | `0.78 0.18 175` |

## Typography

| Role | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display/Headers | General Sans | 28px / 20px / 16px | 600 / 600 / 600 | Page titles, card headers, module labels |
| Body | DM Sans | 14px / 16px | 400 / 500 | Content, forms, UI labels, descriptions |
| Monospace | Geist Mono | 12px / 14px | 400 | Code, IDs, technical data, timestamps |

## Structural Zones

| Zone | Background | Border | Elevation | Purpose |
|------|------------|--------|-----------|---------|
| Header/Nav | `bg-card` with `border-b` | `border-border` | `shadow-md` | Top navigation, branding, user menu |
| Sidebar | `bg-sidebar` with `border-r` | `border-sidebar-border` | None | Module navigation, role indicator, active state in `primary` |
| Main Content | `bg-background` | None | None | Page content area, full width below header |
| Card/Panel | `bg-card` with `border` | `border-border` | `shadow-card` | Data containers, forms, reports, charts |
| Input Fields | `bg-input` with `border` | `border-border` | None | Form fields, search boxes, dropdowns |
| Muted Section | `bg-muted/10` | Optional `border-border` | None | Inactive areas, secondary content, disabled sections |
| Footer | `bg-muted/5` with `border-t` | `border-border` | None | Copyright, links, secondary info |

## Spacing & Rhythm
- **Grid**: 4px base unit. Multiples: 4, 8, 12, 16, 24, 32, 48, 64px.
- **Card padding**: 20px (5 × 4px grid)
- **Section gap**: 24px between major sections
- **Input height**: 36px (9 × 4px)
- **Button height**: 40px (10 × 4px)

## Component Patterns
- **Cards**: `bg-card border border-border rounded-lg shadow-card` with 20px padding
- **Buttons**: Indigo `primary` for actions, grey `secondary` for alternative, green/amber/purple for module-specific actions
- **Forms**: Stacked vertically, labels above inputs, 8px gap between label and field
- **Tables**: Header row in `bg-muted/50`, alternating row backgrounds, 12px cell padding
- **Modals**: Overlay with 30% opacity, card centered at `max-w-md`, backdrop blur optional
- **Badge/Label**: `text-xs font-medium px-2 py-1 rounded-sm` with module accent color

## Motion
- **Transition smooth**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for interactive elements
- **Hover states**: Slight color shift (increase lightness by 2%), no scale or rotate
- **Focus states**: `ring-2 ring-primary ring-offset-2` for keyboard navigation
- **Loading**: Pulse animation on skeleton loaders or disabled buttons

## Module Accent Colors
- **Attendance (Green)**: `oklch(0.65 0.18 142)` for marking present/tracked students
- **Fees (Amber)**: `oklch(0.68 0.19 76)` for payment status, fee amount displays
- **Performance (Purple)**: `oklch(0.58 0.17 290)` for marks, grades, progress indicators
- Use as `text-{module}` or `bg-{module}` utility classes for quick visual identification

## Anti-Patterns
- No full-page gradients or decorative backgrounds
- No shadow stacking (max 1 shadow per element)
- No rainbow palettes; stick to indigo + module colors
- No rounded corners > 12px except for full pills
- No animations > 0.3s; avoid "bouncy" easing
- No all-caps labels; use title case only

## Constraints
- Sidebar always visible on desktop, collapsible on mobile (`md:` breakpoint)
- Cards max-width 100% on mobile, content grid-aligned on desktop
- Text hierarchy enforced: primary 28/20/16px, body 14/16px, never smaller than 12px
- Dark mode inverts lightness values; maintains chroma and hue for consistency

## Signature Detail
Module-specific badge colors in sidebar active state create instant visual scanning for role context — students see green attendance focus, teachers see purple performance dashboards, admins see all colors in unified control panel. This micro-affordance accelerates mental model loading on app entry.
