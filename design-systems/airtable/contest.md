# Contest.md — Design System for a Competitive Academic Platform

## 1. Visual Theme & Atmosphere

Contest.md is designed like a digital olympiad hall after midnight — silent, precise, intimidating in the best possible way. The system inherits the brutalist monochrome philosophy of xAI, but adapts it for academic competition: less “AI infrastructure”, more “elite examination terminal”.

The interface is built around focus. Students arrive here to solve, compete, rank, and train. Every visual decision removes distraction and amplifies cognitive clarity.

The entire platform lives on a deep graphite background (`#181b20`) with sharp white typography (`#ffffff`). Accent colors are almost entirely avoided except where competitive state matters: rankings, timers, validation, success states.

Typography is the core identity. `GeistMono` becomes the language of systems, rankings, timers, and code-like interaction. `Inter` (or `universalSans`) handles educational reading content. The pairing creates a balance between machine precision and human readability.

Unlike traditional education platforms filled with colorful cards and gamified clutter, Contest.md feels severe, calm, and intellectual. It treats the student like an engineer, not a consumer.

The design philosophy:
- Silence over stimulation
- Precision over decoration
- Density over emptiness
- Tension over friendliness

This is not Duolingo. This is a contest environment.

### Core Identity
- Brutalist monochrome UI
- Terminal-inspired interaction
- Monospace typography as authority
- Sharp edges and rigid spacing
- Minimal animation
- Information-first layouts
- Competitive atmosphere through restraint

---

# 2. Color Palette & Roles

## Primary Colors

| Role | Color | Usage |
|---|---|---|
| Background | `#181b20` | Main application background |
| Foreground | `#ffffff` | Primary text |
| Surface | `rgba(255,255,255,0.03)` | Cards, panels |
| Surface Hover | `rgba(255,255,255,0.06)` | Hovered surfaces |
| Border | `rgba(255,255,255,0.10)` | Default borders |
| Border Strong | `rgba(255,255,255,0.20)` | Active states |

---

## Text System

| Role | Color |
|---|---|
| Primary | `#ffffff` |
| Secondary | `rgba(255,255,255,0.70)` |
| Tertiary | `rgba(255,255,255,0.50)` |
| Disabled | `rgba(255,255,255,0.30)` |

---

## Functional States

Unlike xAI, Contest.md allows restrained semantic colors because competitions require rapid status recognition.

| State | Color | Usage |
|---|---|---|
| Success | `#22c55e` | Accepted solutions |
| Warning | `#f59e0b` | Pending review |
| Error | `#ef4444` | Failed tests |
| Info | `#3b82f6` | Active focus |
| Gold Rank | `#facc15` | Top placements |
| Silver Rank | `#d1d5db` | Rank states |
| Bronze Rank | `#b45309` | Rank states |

These colors should NEVER dominate the UI. They appear only in:
- rank badges
- validation states
- contest timers
- submission verdicts

---

# 3. Typography Rules

## Font Families

### System / Technical
`GeistMono`

Used for:
- rankings
- timers
- buttons
- code
- metadata
- scoreboards
- tags

### Reading / Educational
`Inter`
or
`universalSans`

Used for:
- explanations
- articles
- body text
- descriptions

---

## Typography Scale

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero Display | GeistMono | 160px | 300 | Landing hero |
| Contest Timer | GeistMono | 72px | 400 | Countdown |
| Section Title | Inter | 36px | 500 | Strong but clean |
| Problem Title | Inter | 28px | 500 | Reading clarity |
| Body | Inter | 16px | 400 | Default text |
| Button | GeistMono | 14px | 400 | Uppercase |
| Score Label | GeistMono | 12px | 400 | Metadata |
| Rank Number | GeistMono | 20px | 500 | Leaderboards |

---

## Typography Philosophy

### Monospace Means Authority
Anything critical uses GeistMono:
- scores
- timer
- rank
- submission states
- points
- IDs

### Sans-serif Means Understanding
Educational content remains readable and humane.

### Uppercase Means Action
Buttons are always uppercase monospace:
- SUBMIT
- START CONTEST
- VIEW SOLUTION
- ENTER ROOM

---

# 4. Component Stylings

## Buttons

### Primary

- Background: `#ffffff`
- Text: `#181b20`
- Font: GeistMono 14px uppercase
- Letter spacing: `1.4px`
- Padding: `12px 24px`
- Radius: `0px`

Hover:
- `rgba(255,255,255,0.90)`

Used for:
- Start Contest
- Submit
- Join Room

---

## Secondary

- Transparent background
- Border: `1px solid rgba(255,255,255,0.2)`
- Text: `#ffffff`

Hover:
- `rgba(255,255,255,0.05)`

---

## Danger

- Transparent background
- Border: `1px solid rgba(239,68,68,0.4)`
- Text: `#ef4444`

Hover:
- `rgba(239,68,68,0.08)`

---

# 5. Core Platform Components

## Contest Card

### Structure
- Title
- Difficulty
- Duration
- Participants
- Start Time

### Styling
- Background: `rgba(255,255,255,0.03)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Padding: `24px`
- Radius: `0px`

Hover:
- Border becomes `rgba(255,255,255,0.2)`

---

## Leaderboard Row

### Layout
- Rank
- Username
- Country
- Score
- Penalty

### Behavior
Rows feel like terminal output.

Alternating backgrounds:
- transparent
- `rgba(255,255,255,0.02)`

Top 3 ranks use:
- Gold
- Silver
- Bronze

---

## Problem Statement

### Reading Layout
- Max width: `860px`
- Generous line height
- Strong hierarchy

### Sections
- Statement
- Input
- Output
- Constraints
- Examples
- Notes

Examples use:
- monospace blocks
- dark bordered containers
- no syntax highlighting colors by default

---

## Code Editor Container

- Background: `#111317`
- Border: `1px solid rgba(255,255,255,0.1)`
- Radius: `0px`

No decorative chrome.
The editor should feel embedded into the system itself.

---

## Submission Verdicts

| Verdict | Style |
|---|---|
| ACCEPTED | Green monospace |
| WRONG ANSWER | Red monospace |
| TIME LIMIT | Amber monospace |
| COMPILATION ERROR | Gray/red |
| PENDING | White 50% |

Verdicts are always uppercase GeistMono.

---

# 6. Layout Principles

## Spacing System

Base unit:
`8px`

### Scale
- `4px`
- `8px`
- `16px`
- `24px`
- `48px`
- `96px`

Large whitespace is reserved for:
- landing pages
- hero sections

Competition interfaces become denser:
- tighter tables
- compact rankings
- faster scanning

---

## Grid System

### Main Container
`1280px`

### Problem Reading Width
`860px`

### Dashboard Layout
12-column CSS grid

---

## Whitespace Philosophy

### Landing Pages
Minimalist and cinematic.

### Contest Pages
Dense and operational.

The system intentionally shifts personality:
- marketing → spacious
- competition → compressed

This transition creates psychological tension before contests.

---

# 7. Motion & Interaction

## Animation Rules

Animations are subtle and fast.

### Duration
- `120ms`
- `180ms`

### Allowed Motion
- opacity fade
- border transition
- slight translateY(-2px)

### Forbidden
- bounce
- elastic motion
- large transforms
- playful easing

This is an examination environment.

---

# 8. Navigation System

## Top Navigation

### Left
- Contest.md logotype
- Active section

### Center
- Optional contest status

### Right
- Profile
- Rating
- Notifications

---

## Mobile Navigation

Transforms into:
- drawer menu
- full-width actions
- condensed scoreboard rows

---

# 9. Gamification Philosophy

Contest.md avoids childish gamification.

No:
- mascots
- confetti
- cartoon rewards
- excessive achievements

Instead motivation comes from:
- ranking
- precision
- progress
- mastery
- public scoreboards

The interface should make users feel:
“I am training for something difficult.”

---

# 10. Accessibility

## Contrast
Always WCAG AA minimum.

## Keyboard Navigation
Full keyboard support is mandatory.

## Focus State
- blue ring
- `rgb(59,130,246)/0.5`

## Reduced Motion
All animations removable.

---

# 11. Responsive Behavior

## Mobile

### Hero Headline
160px → 56px

### Layout
Single-column

### Contest Tables
Horizontally scrollable

### Buttons
Full-width

---

## Tablet

Two-column dashboards begin.

---

## Desktop

Full competitive layout:
- editor + statement split
- leaderboard sidebar
- live standings

---

# 12. Design Rules

## Do

- Use monochrome aggressively
- Keep borders subtle
- Use monospace for all competitive data
- Keep buttons uppercase
- Preserve sharp corners
- Favor density in operational views
- Use whitespace intentionally

---

## Don’t

- Don’t use gradients
- Don’t use shadows
- Don’t use playful motion
- Don’t use colorful cards
- Don’t use rounded pills
- Don’t add unnecessary illustrations
- Don’t gamify like a mobile app

---

# 13. Atmosphere Keywords

- Terminal
- Olympiad
- Engineering
- Precision
- Severity
- Focus
- Silence
- Competition
- Discipline
- Midnight coding session

---

# 14. Example Prompt Snippets

## Hero Section
"Create a brutalist academic competition hero section on #181b20 background. Massive GeistMono headline at 120px weight 300. Subtitle in Inter 18px rgba(255,255,255,0.7). Sharp white CTA button with uppercase monospace label. No gradients. No shadows."

---

## Leaderboard
"Design a competitive leaderboard table with alternating dark rows, GeistMono rank numbers, subtle borders, gold/silver/bronze top ranks, and terminal-inspired spacing."

---

## Contest Card
"Create a monochrome contest card with transparent dark surface, 1px white 10% border, uppercase monospace labels, difficulty badge, duration metadata, and hover border transition."

---

## Problem Page
"Build a programming contest problem page with dense reading layout, dark code examples, sharp bordered sections, and split editor layout inspired by competitive programming platforms."

---

# 15. Final Design Philosophy

Contest.md should feel like:
- a secure examination terminal
- an elite coding olympiad
- a modern academic arena

The interface must communicate:
precision,
difficulty,
discipline,
and mastery.

Every unnecessary visual element removed increases trust.

The system should feel engineered —
not decorated.