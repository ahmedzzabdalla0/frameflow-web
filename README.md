# FrameFlow Web

A production-ready **Next.js 16 + TypeScript + Tailwind CSS v4** frontend for the FrameFlow media player. Browses and manages a local video library, controls playback, handles category/rating management, and communicates exclusively with the [FrameFlow API](../backend/README.md) over a typed REST client.

---

## 1. Project Overview

FrameFlow is a dark-themed, single-user video library interface built on the Next.js App Router. It connects to the FrameFlow API backend to display, filter, sort, and play video files stored on a local server — no third-party media services, no cloud dependencies.

Key design decisions:

- **Next.js 16 App Router** with React 19, `strict: true` TypeScript, and zero SSR data fetching — all data is fetched client-side via the typed API layer so the frontend can be deployed as a static export or behind any CDN.
- **Tailwind CSS v4** (`@tailwindcss/postcss`) for utility-first styling with a consistent dark-palette design system (`#111` / `#161616` / `#1e1e1e` backgrounds, `#e44444` accent).
- **Atomic Design** component architecture: reusable primitives in `components/ui/` (Button, Input, Select, Modal, …) compose upward into feature-level components. No atom is ever re-implemented inline.
- **Feature-sliced** folder structure: every product feature (`dashboard`, `player`) is self-contained under `features/`, keeping cross-feature coupling explicit.
- **Typed API client** in `lib/api/` wraps every backend endpoint with full TypeScript types — the rest of the app never constructs raw `fetch` calls.
- **`sonner`** for non-intrusive toast notifications on async operations.
- **`next-themes`** wired in for future light-mode support without architectural changes.

---

## 2. Application Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, Toaster, global CSS
│   ├── page.tsx                  # Entry point — redirects to /dashboard
│   ├── not-found.tsx             # Global 404 page
│   ├── globals.css               # Tailwind base + CSS custom properties
│   ├── fonts/                    # Local font definitions and font variables
│   ├── metadata/                 # Centralised Next.js metadata + viewport exports
│   └── dashboard/                # /dashboard route
│
├── components/
│   └── ui/                       # Atomic primitives
│       ├── button.tsx            # <Button variant="primary|secondary|ghost|danger|icon" size="sm|md|lg">
│       ├── input.tsx             # <Input> — all text inputs
│       ├── select.tsx            # <Select> — all dropdowns
│       ├── modal.tsx             # <Modal> — all dialog overlays
│       ├── loading-spinner.tsx   # Inline / full-screen loading state
│       ├── empty-state.tsx       # Zero-results placeholder
│       ├── error-state.tsx       # Fetch-error placeholder
│       ├── category-badges.tsx   # Pill-style category tag list
│       ├── rating-control.tsx    # Star rating input + display
│       └── sonner.tsx            # Themed <Toaster> wrapper
│
├── features/
│   ├── dashboard/
│   │   └── components/           # Dashboard-specific composed components
│   └── player/
│       ├── components/           # Player UI components
│       ├── hooks/                # Player state and behaviour hooks
│       └── utils/                # Player-local utility functions
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Base fetch wrapper (apiGet, apiPost, apiPut, apiDelete, mediaUrl)
│   │   ├── videos.ts             # Videos endpoint functions
│   │   ├── categories.ts         # Categories endpoint functions
│   │   ├── settings.ts           # Player settings endpoint functions
│   │   └── thumbs.ts             # Thumbnail URL helpers
│   ├── constants/                # App-wide constants (sort options, pagination defaults, …)
│   └── utils.ts                  # General utility functions (cn, formatters, …)
│
├── types/
│   ├── api.ts                    # Raw API response types (mirrors backend DTOs)
│   ├── dashboard.ts              # Dashboard-specific derived types
│   └── player.ts                 # Player-specific derived types
│
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript strict configuration
├── eslint.config.mjs             # ESLint + Next.js + Tailwind rules
├── postcss.config.mjs            # PostCSS with @tailwindcss/postcss
└── .prettierrc.json              # Prettier + import-sort + Tailwind class-sort plugins
```

---

## 3. Design System

All visual decisions are encoded as Tailwind utilities applied consistently through the atomic component layer — no one-off inline styles.

### Colour Palette

| Role             | Value     | Usage                                    |
| ---------------- | --------- | ---------------------------------------- |
| Background base  | `#111`    | Page/body background                     |
| Background card  | `#161616` | Panel, modal, card surfaces              |
| Background hover | `#1e1e1e` | Hover state for interactive surfaces     |
| Accent           | `#e44444` | Primary action colour, active indicators |
| Text primary     | `#ddd`    | Body text, headings                      |
| Text secondary   | `#aaa`    | Labels, metadata                         |
| Text muted       | `#555`    | Placeholders, disabled text              |

### Interaction Conventions

- `transition-colors duration-200` on every interactive element.
- `focus-visible:ring-2` focus rings for keyboard navigation.
- `disabled:opacity-50 disabled:cursor-not-allowed` on all disabled states.
- `motion-reduce:*` overrides on all animated elements.

### Border Radius

| Context                    | Class          |
| -------------------------- | -------------- |
| Controls (inputs, buttons) | `rounded-lg`   |
| Panels, modals             | `rounded-xl`   |
| Category pills             | `rounded-full` |

---

## 4. API Client

All backend communication goes through `lib/api/client.ts`, which provides four typed wrappers and one URL helper:

```ts
apiGet<T>(path, params?)       // GET with optional query string
apiPost<T>(path, body?)        // POST with JSON body
apiPut<T>(path, body?)         // PUT with JSON body
apiDelete<T>(path)             // DELETE
mediaUrl(path)                 // Builds full media/thumbnail URL
```

A custom `ApiError` class carries the HTTP status code alongside the message so callers can branch on specific error codes (401, 404, etc.) without parsing strings.

The base URL is read from `NEXT_PUBLIC_API_URL` at build time, falling back to `http://192.168.1.32:3568` for local development.

---

## 5. Setup & Development

### Prerequisites

- Node.js 20+
- The [FrameFlow API](../backend/README.md) running and reachable

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL to your backend address

# 3. Start the development server
npm run dev
```

The app runs on **`http://localhost:3569`** by default.

```bash
# Production build
npm run build
npm run start

# Lint
npm run lint
```

---

## 6. Environment Variables

| Variable              | Description                           | Example                 |
| --------------------- | ------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FrameFlow API backend | `http://localhost:3568` |

All variables prefixed `NEXT_PUBLIC_` are inlined at build time and visible in the browser bundle — never put secrets here.

---

## 7. Author & Attribution

**FrameFlow** is designed and developed by **Ahmed Mohamed Abdelsalam**.

If you use, modify, or distribute this project or any part of its code, please maintain proper attribution by including a reference to the original author and a link back to this repository.

- **GitHub:** [@ahmedzzabdalla0](https://github.com/ahmedzzabdalla0)
- **LinkedIn:** [Ahmed Mohamed Abdelsalam](https://www.linkedin.com/in/ahmedabdelsalam0)

---

## 8. License

This project is licensed under the [MIT License](./LICENSE).
