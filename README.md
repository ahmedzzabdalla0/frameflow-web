# FrameFlow Web

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![API Repo](https://img.shields.io/badge/API-frameflow--api-181717?style=flat-square&logo=github)](https://github.com/ahmedzzabdalla0/frameflow-api)
[![Portfolio](https://img.shields.io/badge/Portfolio-frameflow-000000?style=flat-square&logo=vercel&logoColor=white)](https://portfolio-ahmedabdelsalam.vercel.app/projects/frameflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-e44444?style=flat-square)](./LICENSE)

A production-ready **Next.js 16 + TypeScript + Tailwind CSS v4** frontend for the FrameFlow media player. Browses and manages a local video library, controls playback, handles category/rating management, and communicates exclusively with the [FrameFlow API](https://github.com/ahmedzzabdalla0/frameflow-api) over a typed REST client.

---

## 1. Project Overview

FrameFlow is a dark-themed, single-user video library interface built on the Next.js App Router. It connects to the FrameFlow API backend — **[frameflow-api](https://github.com/ahmedzzabdalla0/frameflow-api)** — to display, filter, sort, and play video files stored on a local server — no third-party media services, no cloud dependencies. This project is also featured on the **[author's portfolio](https://portfolio-ahmedabdelsalam.vercel.app/projects/frameflow)**.

Key design decisions:

- **Next.js 16 App Router** with React 19, `strict: true` TypeScript, and zero SSR data fetching — all data is fetched client-side via the typed API layer so the frontend can be deployed as a static export or behind any CDN.
- **Tailwind CSS v4** (`@tailwindcss/postcss`) for utility-first styling with a consistent dark-palette design system.
- **Atomic Design** component architecture: reusable primitives in `components/ui/` (Button, Input, Select, Modal, …) compose upward into feature-level components. No atom is ever re-implemented inline.
- **Feature-sliced** folder structure: every product feature (`dashboard`, `player`) is self-contained under `features/`, keeping cross-feature coupling explicit.
- **Typed API client** in `lib/api/` wraps every backend endpoint with full TypeScript types — the rest of the app never constructs raw `fetch` calls.
- **`sonner`** for non-intrusive toast notifications on async operations.
- **`next-themes`** wired in for future light-mode support without architectural changes.

---

## 2. Application Structure

```
frontend/
├── app/            # Next.js App Router — pages, layouts, global styles, and metadata
├── components/
│   └── ui/         # Atomic UI primitives shared across the entire app
├── features/
│   ├── dashboard/  # Admin dashboard feature — video management, categories, and settings
│   └── player/     # Player feature — reel feed, gallery view, and playback controls
├── lib/
│   ├── api/        # Typed REST client and per-resource endpoint functions
│   └── constants/  # App-wide constants
├── types/          # Shared TypeScript types mirroring backend DTOs and derived UI shapes
└── public/         # Static assets
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
| Accent           | `#a855f7` | Primary action colour, active indicators |
| Accent hover     | `#9333ea` | Hover state for primary actions          |
| Accent muted     | `#2c1750` | Subtle accent backgrounds                |
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
- The [FrameFlow API](https://github.com/ahmedzzabdalla0/frameflow-api) running and reachable

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
- **Portfolio:** [portfolio-ahmedabdelsalam.vercel.app](https://portfolio-ahmedabdelsalam.vercel.app)

---

## 8. License

This project is licensed under the [MIT License](./LICENSE).
