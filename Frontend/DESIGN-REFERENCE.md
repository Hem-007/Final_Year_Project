# Design Reference Guide - JobShield AI

## Color Palette Reference

### Primary Colors
```
Brand Primary
NAME: Primary Color
VALUE: #1e3a8a
RGB: 30, 58, 138
USAGE: Main buttons, headings, links, navigation
```

```
Brand Dark
NAME: Primary Dark
VALUE: #1e293b
RGB: 30, 41, 59
USAGE: Hover states, active elements
```

```
Brand Light
NAME: Primary Light
VALUE: #3b82f6
RGB: 59, 130, 246
USAGE: Secondary buttons, accents, light elements
```

### Status Colors
```
Success Color
NAME: Success/Safe
VALUE: #10b981
RGB: 16, 185, 129
USAGE: Safe jobs, positive findings, checkmarks
CONTRAST: AAA
```

```
Warning Color
NAME: Warning/Suspicious
VALUE: #f59e0b
RGB: 245, 158, 11
USAGE: Suspicious jobs, cautions, warnings
CONTRAST: AAA
```

```
Danger Color
NAME: Danger/Fake
VALUE: #ef4444
RGB: 239, 68, 68
USAGE: Fake jobs, errors, critical alerts
CONTRAST: AAA
```

### Neutral Colors
```
White: #ffffff        | Primary backgrounds, cards
Gray-50: #f9fafb     | Very light backgrounds
Gray-100: #f3f4f6    | Light backgrounds, hover states
Gray-200: #e5e7eb    | Borders, dividers
Gray-300: #d1d5db    | Light borders
Gray-400: #9ca3af    | Disabled states
Gray-500: #6b7280    | Secondary text
Gray-600: #4b5563    | Muted text
Gray-700: #374151    | Body text
Gray-800: #1f2937    | Dark text
Gray-900: #111827    | Very dark text/headings
Black: #000000        | Text, very dark elements
```

## Typography System

### Font Stack
```
Primary Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif

Monospace: 'Courier New', monospace (for code)
```

### Font Sizes
```
Display Extra Large: 2.25rem (36px)  | Hero titles, main headings
Display Large:       1.875rem (30px)  | Section titles
Display Medium:      1.5rem (24px)    | Subsection titles
Display Small:       1.25rem (20px)   | Card titles
Body Large:          1.125rem (18px)  | Important text
Body Base:           1rem (16px)      | Default text
Body Small:          0.875rem (14px)  | Secondary text
Caption:             0.75rem (12px)   | Captions, helpers

Line Height:         1.6             | Body text
Headings:            1.2             | Headings
```

### Font Weights
```
Light:    300
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

## Spacing System (8px Base)

```
XS:   0.25rem  (2px)
SM:   0.5rem   (4px)
MD:   1rem     (8px)    ← Base unit
LG:   1.5rem   (12px)
XL:   2rem     (16px)
2XL:  3rem     (24px)
```

### Usage Guidelines
- Padding: Use MD for default, LG for large content
- Margin: Use LG between sections
- Gap: Use MD for grid/flex gaps
- Radius: Use LG/XL for rounded elements

## Border Radius Scale

```
SM:   0.375rem (3px)     | Small elements
MD:   0.5rem   (4px)     | Default
LG:   0.75rem  (6px)     | Cards, inputs
XL:   1rem     (8px)     | Large cards
2XL:  1.5rem   (12px)    | Hero sections
Full: 9999px             | Badges, circles
```

## Shadow System

### Elevation Levels
```
None:    No shadow
SM:      0 1px 2px rgba(0,0,0,0.05)
         Used for: Subtle depth, borders

MD:      0 4px 6px -1px rgba(0,0,0,0.1)
         Used for: Cards at rest, buttons

LG:      0 10px 15px -3px rgba(0,0,0,0.1)
         Used for: Cards on hover, dropdowns

XL:      0 20px 25px -5px rgba(0,0,0,0.1)
         Used for: Modals, important overlays

2XL:     0 25px 50px -12px rgba(0,0,0,0.25)
         Used for: Important overlays, focus states
```

## Animation & Transitions

### Durations
```
Fast:    150ms  (micro-interactions)
Base:    200ms  (default transitions)
Slow:    300ms  (important transitions)
```

### Timing Functions
```
ease-out:    For entrance animations
ease-in:     For exit animations
ease-in-out: For transitions
linear:      For loading states
```

### Common Animations
```
Button Hover:     translateY(-2px), box-shadow change
Card Hover:       translateY(-5px), shadow increase
Toast Entry:      slideInFromRight (300ms, ease-out)
Toast Exit:       slideOutToRight (300ms, ease-out)
Loader Pulse:     transform scale (1.5s, infinite)
Counter:          increment smoothly (duration-based)
```

## Component Specifications

### Buttons
```
Primary Button
- Background: #1e3a8a
- Text: White
- Padding: 1rem 1.5rem
- Border-radius: 0.75rem
- Font-weight: 600
- Hover: #1e293b + box-shadow-lg + translateY(-2px)

Secondary Button
- Background: #f3f4f6
- Text: #1e3a8a
- Padding: 1rem 1.5rem
- Border-radius: 0.75rem
- Font-weight: 600
- Hover: #e5e7eb + bordercolor-gray-400

Large Button
- Padding: 1.5rem 3rem
- Font-size: 1.125rem
```

### Cards
```
Feature Card
- Background: White
- Padding: 1.5rem
- Border-radius: 1rem
- Shadow: MD
- Hover: Elevation + translate up

Result Card
- Background: White
- Padding: 1.5rem
- Border-radius: 1rem
- Shadow: LG
- Border: 2px transparent (hover: primary-light)
```

### Input Elements
```
Text Input / Textarea
- Border: 2px solid #e5e7eb
- Border-radius: 0.75rem
- Padding: 1rem
- Focus: Border #1e3a8a + box-shadow (0 0 0 3px rgba(30,58,138,0.1))

Drop Zone
- Border: 2px dashed #d1d5db
- Background: #f9fafb
- Hover: Border #1e3a8a + background-light
```

### Badges
```
Result Badge
- Padding: 0.25rem 1rem
- Border-radius: 9999px
- Font-size: 0.75rem
- Font-weight: 600

Success Badge: Green background + green text
Warning Badge: Orange background + orange text
Danger Badge:  Red background + red text
```

## Responsive Breakpoints

### Mobile First Approach
```
Mobile:     < 480px      | 320px containers
Tablet:     480px - 768px | Optimized for touch
Desktop:    768px+        | Full features

Main Breakpoint: 768px
```

### Layout Changes at 768px
```
BEFORE (< 768px):
- Single column layout
- Full-width inputs
- Stack navigation
- Hide details

AFTER (≥ 768px):
- Multi-column grids
- Optimized spacing
- Horizontal navigation
- Show all details
```

## Accessibility Guidelines

### Color Contrast
```
Text on Background Colors:
- Black on White: 21:1 (AAA+)
- #1e3a8a on White: 8.5:1 (AAA)
- #10b981 on White: 7.5:1 (AAA)
- #f59e0b on White: 8.1:1 (AAA)
- #ef4444 on White: 5:1 (AA)

Minimum WCAG AA: 4.5:1
Target: WCAG AAA (7:1)
```

### Interactive Elements
```
Minimum Click Target: 44x44px
Link Color: Distinct from text (use primary color)
Focus Indicator: Visible outline or box-shadow
States: Hover, Focus, Active clearly distinguished
```

## File Structure for Assets

```
assets/
├── css/
│   ├── styles.css           (Main stylesheet)
│   ├── styles.min.css       (Minified for production)
│   └── print.css            (Print styles)
│
├── js/
│   ├── main.js              (Main functionality)
│   ├── results.js           (Results page)
│   ├── main.min.js          (Minified for production)
│   └── results.min.js       (Minified for production)
│
├── images/
│   ├── icons/               (SVG icons)
│   ├── illustrations/       (PNG/SVG illustrations)
│   └── logos/               (Brand logos)
│
└── fonts/                   (Custom fonts if needed)
    └── system-fonts/        (Fallback references)
```

## Icon Specifications

### Size Recommendations
```
Hero/Large:     48px  (#f59e0b, #1e3a8a)
Section Header: 24px  (#1e3a8a)
Inline:         16px  (varies by site)
Buttons:        20px  (within button)
Status:         32px  (check/x mark)
```

### Icon Style
- Clean, minimalist
- Consistent stroke weight
- Proper padding within container
- Clear at all sizes

### Emoji Usage (Current)
```
Logo:        🛡️ Shield
Analysis:    🔍 Search
Text:        📄 Document
Image:       🖼️ Picture
Link:        🔗 Link
Safe:        ✅ Checkmark
Fake:        ❌ X mark
Warning:     ⚠️ Warning triangle
Tips:        Various context-specific
```

## Print Styles

```css
@media print {
    .navbar,
    .footer,
    .button-group     {display: none;}
    
    * {background: white; color: black;}
    
    .break              {page-break-inside: avoid;}
    
    Links               {text-decoration: underline;}
}
```

## Dark Mode (Future Feature)

```css
@media (prefers-color-scheme: dark) {
    --white: #0f172a
    --gray-900: #f8fafc
    /* Invert colors appropriately */
}
```

## Browser Prefixes Needed

```css
transform:        -webkit-, -moz- (for older browsers)
box-shadow:       -webkit-
background:       -webkit- (gradients)
animation:        -webkit- (animations)
appearance:       -webkit- (form elements)
```

## Performance Targets

### CSS
- Minified size: < 30KB
- No unused selectors
- Media queries at end

### JavaScript
- Main.js minified: < 10KB
- Results.js minified: < 12KB
- No console logs in production

### Images
- Compressed: 85% quality
- Responsive sizes
- Lazy loading where possible

## Version Control

### CSS Changes
- Update version in comments
- Document major changes
- Test on all breakpoints
- Run through CSS validator

### JavaScript Changes
- Test all browsers
- Check console for errors
- Validate HTML
- Update JSDoc comments

---

## Design System Summary

| Element | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Color | #1e3a8a | #f3f4f6 | #3b82f6 |
| Text | Gray-900 | Gray-600 | Primary |
| Border | Gray-200 | Gray-300 | Primary |
| Shadow | MD | SM | LG on hover |

---

**For Questions:** Refer to PROJECT-OVERVIEW.md or DEPLOYMENT.md

**Last Updated:** February 9, 2026
