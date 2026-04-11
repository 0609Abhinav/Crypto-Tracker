# AGENT.md — CryptoTracker Project

---

# Project Overview

- **Purpose**: Full-stack cryptocurrency tracking web app. Users can browse trending coins, view top 15, track individual coin data, manage a personal watchlist, and register/login.
- **Tech Stack**:
  - Frontend: React 18, Redux Toolkit, React Router v6, Tailwind CSS v3, styled-components, react-icons, react-loader-spinner
  - Backend: Node.js, Express 4, Mongoose 8, MongoDB Atlas, bcrypt, cors
- **Entry Points**:
  - Frontend: `Frontend/src/index.js`
  - Backend: `backend/index.js`
  - App layout shell: `AppLayout` component in `Frontend/src/index.js`

---

# Architecture

- **Type**: Monorepo with two separate apps — a React SPA (Frontend) and a REST API (backend). Not microservices. Loosely coupled client-server monolith.
- **Pattern**: Component-based frontend (React) + MVC-lite backend (Express routes → Mongoose models)

```
[Browser]
    |
[React SPA - Frontend/src/index.js]
    |-- AppLayout (Navbar + Outlet + Footer)
    |-- React Router routes
    |-- Redux Store (watchlist state)
    |
    |-- [CoinGecko Public API] (direct fetch, no proxy)
    |-- [Backend REST API - localhost:3001]
            |
        [Express Routes /api/v1]
            |
        [Mongoose Models]
            |
        [MongoDB Atlas]
```

---

# Folder Structure

```
/
├── backend/
│   ├── index.js              # Express app entry, middleware, server start
│   ├── dbConnections.js      # Mongoose connect to MongoDB Atlas
│   ├── routes/routes.js      # All API routes (/login, /createuser)
│   └── models/users.js       # Mongoose User schema
├── Frontend/
│   ├── src/
│   │   ├── index.js          # App entry, router config, Redux Provider
│   │   ├── App.js            # UNUSED legacy shell (dead code)
│   │   ├── components/
│   │   │   ├── Navbar.js     # Top nav with mobile menu
│   │   │   ├── Card.js       # Single coin card with watchlist toggle
│   │   │   ├── Cards.js      # Grid renderer for Card list
│   │   │   ├── DummyUi.js    # Skeleton loader (pulse animation)
│   │   │   ├── Search.js     # FULLY COMMENTED OUT — dead code
│   │   │   └── footer.js     # Footer with social links + newsletter form
│   │   ├── pages/
│   │   │   ├── home.js       # Landing/marketing page
│   │   │   ├── Top15.js      # Trending coins from CoinGecko
│   │   │   ├── Trending.js   # Top 100 coins by market cap
│   │   │   ├── Watchlist.js  # Redux-driven watchlist view
│   │   │   ├── CoinByIdData.js # Individual coin detail (WIP/dev state)
│   │   │   ├── Login.js      # Login form → POST /api/v1/login
│   │   │   ├── SignIn.js     # Register form → POST /api/v1/createuser
│   │   │   └── ErrorElements.js # 404/error boundary page
│   │   └── store/
│   │       ├── store.js          # Redux store config
│   │       └── watchlistSlice.js # Watchlist add/remove reducers
│   ├── tailwind.config.js    # Tailwind content paths
│   └── package.json
└── package.json              # Root — only has cors dependency (likely unused)
```

---

# Components & Modules

| Component/Module | Responsibility |
|---|---|
| `AppLayout` | Shell: wraps all pages with Navbar, Footer, Redux Provider |
| `Navbar` | Navigation links, mobile hamburger menu, Login/SignIn buttons |
| `Card` | Displays one coin — price, trend arrow, watchlist star toggle |
| `Cards` | Maps array of coins → `Card` grid, handles `top15` vs `trending` data shape differences |
| `DummyUi` | Skeleton loading placeholder (8 card skeletons, pulse animation) |
| `Search` | Dead code — fully commented out |
| `Footer` | Social icons, newsletter form (alert-only, no real submission), contact info |
| `home.js` | Static marketing landing page |
| `Top15.js` | Fetches `/search/trending` from CoinGecko, renders Cards with `checker="top15"` |
| `Trending.js` | Fetches top 100 coins by market cap from CoinGecko, renders Cards |
| `Watchlist.js` | Reads Redux store, renders saved coins via Cards, empty state with navigate |
| `CoinByIdData.js` | Fetches single coin by ID from CoinGecko — WIP, renders raw JSON |
| `Login.js` | Controlled form → POST to backend login endpoint |
| `SignIn.js` | Controlled form with client-side validation → POST to backend createuser |
| `ErrorElements.js` | Catch-all error/404 page |
| `watchlistSlice.js` | Redux slice: add/remove coins from watchlist array |
| `store.js` | Configures Redux store with watchlistSlice |
| `routes.js` (backend) | POST /login and POST /createuser handlers |
| `users.js` (model) | Mongoose schema: name, email, password |
| `dbConnections.js` | Connects Mongoose to MongoDB Atlas |

---

# Data Flow

1. User opens app → `index.js` renders `AppLayout` with `RouterProvider`
2. Redux `Provider` wraps entire app — watchlist state available everywhere
3. Page component mounts → `useEffect` fires `fetch()` directly to CoinGecko API
4. Data stored in local `useState` → passed as `apiData` prop to `Cards`
5. `Cards` maps data → `Card` components
6. User clicks star on `Card` → dispatches `handleAddCoins` or `handleremovecoin` to Redux store
7. `Watchlist` page reads from Redux store via `useSelector`
8. Auth flow: Login/SignIn form submit → `fetch("http://localhost:3001/api/v1/...")` → Express route → bcrypt compare/hash → MongoDB query → JSON response → `console.log` only (no session/token handling)

---

# UI / Design System

- **Framework**: Tailwind CSS v3 (utility-first), no custom theme extensions
- **Component library**: None — all custom
- **Icons**: `react-icons` (Material Design, Font Awesome, FA6)
- **Loader**: `react-loader-spinner` (RotatingLines used in Trending)

### Color Palette

| Color | Hex | Usage |
|---|---|---|
| Primary Blue | `#3B82F6` (blue-500) | Navbar bg, buttons, borders |
| Indigo | `#6366F1` (indigo-500/600) | Gradient end, auth buttons, form accents |
| Yellow/Gold | `#FACC15` (yellow-400) | Logo accent, star icons, CTA hover |
| Orange | `#F97316` (orange-500) | Home page CTA button |
| Gray bg | `#F3F4F6` (gray-100) | Page backgrounds, watchlist bg |
| Green | `#22C55E` (green-400/600) | Positive price change indicators |
| Red | `#EF4444` (red-400/600) | Negative price change indicators |
| Card gradient | `from-blue-100 via-cyan-200 to-blue-300` | Coin card background |
| Error bg | `#F8D7DA` | Error page background |

### Typography
- No custom font — system default (Arial fallback on error page)
- Sizes via Tailwind: `text-sm`, `text-lg`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`
- Weights: `font-semibold`, `font-bold`, `font-extrabold`

### Spacing / Layout
- Tailwind utility spacing throughout
- Card grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl` (Tailwind defaults)

### UI Patterns
- Skeleton loading via `DummyUi` (pulse animation)
- Spinner via `react-loader-spinner` (Trending page only)
- Hover scale transforms on cards (`hover:scale-105`)
- Mobile slide-in menu (fixed overlay, `translate-x-full` → `translate-x-0`)

---

# NUI

- No NUI framework or system detected in this project.

---

# State Management

- **Tool**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- **Store**: Single reducer — `watchlistSlice`
- **State shape**: `{ watchlistSlice: [] }` — array of coin objects
- **Flow**:
  1. User clicks star → `Card` dispatches `handleAddCoins(item)` or `handleremovecoin(item)`
  2. Slice reducer returns new array (immutable pattern)
  3. `Watchlist` page reads via `useSelector((store) => store.watchlistSlice)`
- **Persistence**: None — state is lost on page refresh (no localStorage, no backend sync)
- **All other state**: Local `useState` per component (data fetching, loading, form inputs)

---

# APIs & Services

### External
| API | Endpoint | Used In |
|---|---|---|
| CoinGecko (free, no key) | `GET /api/v3/search/trending` | Top15.js |
| CoinGecko | `GET /api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100` | Trending.js |
| CoinGecko | `GET /api/v3/coins/:id` | CoinByIdData.js |

### Internal (Backend — `http://localhost:3001`)
| Method | Route | Handler | Description |
|---|---|---|---|
| POST | `/api/v1/login` | `routes.js` | Verify email + bcrypt password |
| POST | `/api/v1/createuser` | `routes.js` | Hash password + create user in MongoDB |
| GET | `/` | `index.js` | Health check string |

---

# Config & Environment

### Backend
- **MongoDB URI**: Hardcoded in `dbConnections.js` — includes credentials in plaintext (critical security risk)
- **Port**: Hardcoded `3001` in `index.js`
- **No `.env` file** detected — all config is inline

### Frontend
- **API base URL**: Hardcoded `http://localhost:3001` in `Login.js` and `SignIn.js`
- **CoinGecko base URL**: Hardcoded inline in each page component
- **Build tool**: Create React App (`react-scripts 5`)
- **Tailwind**: PostCSS via CRA, configured in `tailwind.config.js`

### Root `package.json`
- Only has `cors` as a dependency — appears to be a leftover/unused root config

---

# Conventions

### Naming
- Components: PascalCase (`Card.js`, `Navbar.js`)
- Pages: mixed — some PascalCase (`Top15.js`), some lowercase (`home.js`, `footer.js`)
- Functions: camelCase
- Redux actions: camelCase (`handleAddCoins`, `handleremovecoin` — inconsistent casing)

### File Structure
- Components in `src/components/`, pages in `src/pages/`, store in `src/store/`
- No barrel `index.js` files for exports

### Patterns
- Controlled components for all forms
- Direct `fetch` (no axios, no custom hooks, no API abstraction layer)
- `checker` prop pattern used to differentiate `top15` vs `trending` data shapes in `Card`/`Cards`
- `console.log` used extensively for debugging (not removed)

---

# Setup & Run

### Backend
```bash
cd backend
npm install
node index.js        # or: npm start (uses nodemon)
# Runs on http://localhost:3001
```

### Frontend
```bash
cd Frontend
npm install
npm start            # CRA dev server, http://localhost:3000
npm run build        # Production build
```

---

# Dependency Graph

```
Frontend
├── react / react-dom
├── react-router-dom        → routing (AppLayout, all pages)
├── @reduxjs/toolkit        → watchlistSlice, store
├── react-redux             → Provider, useSelector, useDispatch
├── react-icons             → Navbar, Card, Footer, home
├── react-loader-spinner    → Trending (RotatingLines only)
├── styled-components       → installed but NOT used anywhere
├── tailwindcss             → all UI styling
└── [CoinGecko API]         → Top15, Trending, CoinByIdData (external, no SDK)

Backend
├── express                 → HTTP server, routing
├── mongoose                → MongoDB ODM, User model
├── bcrypt                  → password hashing/comparison
├── cors                    → cross-origin for React dev server
└── nodemon (dev)           → auto-restart
```

---

# Risks / Notes

### Critical
- **Hardcoded MongoDB credentials** in `dbConnections.js` — URI with username/password in plaintext, committed to repo. Rotate credentials immediately and move to `.env`.
- **No authentication tokens/sessions** — login returns a JSON status but nothing is stored (no JWT, no cookie, no session). Auth is effectively non-functional beyond the API call.
- **Hardcoded `localhost:3001`** in frontend — breaks in any non-local environment.

### Tech Debt
- `App.js` is dead code — router and layout are defined in `index.js`. `App.js` imports components that don't exist (`components/Top15`, `components/Trending`, `components/Watchlist`).
- `Search.js` is entirely commented out — remove or implement.
- `CoinByIdData.js` is a dev stub — renders raw `JSON.stringify(data)` and has unused `useRef`/counter logic.
- `styled-components` is installed but never used — remove from dependencies.
- Root `package.json` with only `cors` is confusing and likely unused.
- `console.log` calls scattered throughout production code (form data, API responses, coin items).
- Newsletter form in Footer uses `alert()` — no real submission logic.
- Watchlist state is not persisted — lost on refresh. No `localStorage` or backend sync.
- `checker` prop pattern in `Card`/`Cards` is fragile — two different CoinGecko response shapes handled with inline ternaries. Should be normalized at fetch time.
- Inconsistent loading UX — `DummyUi` skeleton on Top15, `RotatingLines` spinner on Trending, inline spinner styles on Watchlist.
- No error handling shown to users — all errors go to `console.error` only.
- `ErrorElements.js` uses a broken placeholder image (`via.placeholder.com` is defunct).

### Performance
- No memoization (`useMemo`, `useCallback`, `React.memo`) anywhere.
- `Cards` re-renders entire grid on any state change.
- CoinGecko free tier has rate limits — no caching, retry logic, or debouncing.
- `isPresent` in `Card` uses `JSON.stringify` comparison on every render for every item in the watchlist — O(n) string serialization per card render.

### Suggested Improvements
1. Move all secrets to `.env` files (backend) and `.env.local` (frontend via `REACT_APP_*`)
2. Implement JWT auth — store token in `httpOnly` cookie or `localStorage`, protect routes
3. Persist watchlist to backend (new endpoint) or `localStorage`
4. Create an API service layer (`src/services/coingecko.js`) instead of inline fetches
5. Normalize CoinGecko response shapes before passing to components — remove `checker` prop
6. Replace `JSON.stringify` comparison in watchlist with coin `id` comparison
7. Add error boundary and user-facing error states
8. Remove dead code: `App.js`, `Search.js`, unused `styled-components`
9. Add `React.memo` to `Card` to prevent unnecessary re-renders
10. Add a proxy in CRA config or environment variable for backend URL
