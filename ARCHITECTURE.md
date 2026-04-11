# CryptoTracker — Full Architecture & Project Analysis

---

## 1. What This Project Is

A full-stack cryptocurrency tracking web application. Users can:
- Browse top 15 trending coins and top 100 by market cap
- View individual coin detail pages
- Add/remove coins to a personal watchlist
- Register and log in (auth is partially implemented)

---

## 2. Architecture Type

**Monorepo — Decoupled Client/Server SPA**

Two completely separate apps living in one repo:
- `Frontend/` — React SPA (Create React App)
- `backend/` — Express REST API

They communicate over HTTP. The frontend also talks directly to the CoinGecko public API — the backend is only used for user auth.

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              React SPA (port 3000)                  │   │
│   │                                                     │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│   │  │  Router  │  │  Redux   │  │  React Components│  │   │
│   │  │  (v6)    │  │  Store   │  │  + Pages         │  │   │
│   │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│   └────────────────────┬────────────────────────────────┘   │
│                        │                                    │
│          ┌─────────────┴──────────────┐                     │
│          │                            │                     │
│          ▼                            ▼                     │
│  ┌───────────────┐          ┌──────────────────────┐        │
│  │  CoinGecko    │          │  Express Backend      │        │
│  │  Public API   │          │  (port 3001)          │        │
│  │  (external)   │          │                      │        │
│  └───────────────┘          │  POST /api/v1/login  │        │
│                             │  POST /api/v1/       │        │
│                             │       createuser     │        │
│                             └──────────┬───────────┘        │
│                                        │                    │
│                                        ▼                    │
│                             ┌──────────────────────┐        │
│                             │   MongoDB Atlas      │        │
│                             │   (cloud)            │        │
│                             │   Collection: users  │        │
│                             └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### Entry Point & App Shell

`Frontend/src/index.js` is the true entry point — `App.js` is dead code and not used.

```
index.js
  └── RouterProvider
        └── AppLayout  (shell component)
              ├── Provider (Redux store)
              ├── Navbar
              ├── <Outlet />  ← page renders here
              └── Footer
```

### Route Map

| Path | Component | Data Source |
|---|---|---|
| `/` | `home.js` | Static |
| `/top15` | `Top15.js` | CoinGecko `/search/trending` |
| `/trending` | `Trending.js` | CoinGecko `/coins/markets` |
| `/watchlist` | `Watchlist.js` | Redux store |
| `/coin/:id` | `CoinByIdData.js` | CoinGecko `/coins/:id` |
| `/signin` | `SignIn.js` | Backend POST `/createuser` |
| `/login` | `Login.js` | Backend POST `/login` |
| `*` (error) | `ErrorElements.js` | — |

### Component Tree

```
AppLayout
├── Navbar
│     └── [mobile overlay menu]
├── Pages (via Outlet)
│     ├── home.js          → static marketing sections
│     ├── Top15.js         → fetch → DummyUi (loading) | Cards
│     ├── Trending.js      → fetch → RotatingLines (loading) | Cards
│     ├── Watchlist.js     → Redux → Cards | empty state
│     ├── CoinByIdData.js  → fetch → raw JSON dump [WIP]
│     ├── Login.js         → form → POST backend
│     ├── SignIn.js        → form + validation → POST backend
│     └── ErrorElements.js → static error page
│
│     Cards
│       └── Card (×n)
│             ├── Link → /coin/:id
│             ├── Star icon → dispatch to Redux
│             ├── Price / trend arrow
│             └── Volume / market cap
│
└── Footer
      ├── Social links
      └── Newsletter form (alert only, no real submit)
```

---

## 4. Backend Architecture

Minimal Express server — MVC-lite pattern.

```
backend/index.js          ← app bootstrap, middleware, server start
      │
      ├── cors()           ← allow all origins (no restriction)
      ├── express.json()   ← parse JSON body
      │
      └── /api/v1  ──→  routes/routes.js
                              ├── POST /login
                              │     └── users.findOne(email)
                              │           └── bcrypt.compareSync()
                              │                 └── return JSON status
                              │
                              └── POST /createuser
                                    └── users.findOne(email)  ← check duplicate
                                          └── bcrypt.hashSync()
                                                └── users.create()
                                                      └── return JSON status

backend/models/users.js   ← Mongoose schema { name, email, password }
backend/dbConnections.js  ← mongoose.connect(hardcoded URI)
```

### Backend Data Model

```
Collection: users
{
  name:     String  (required)
  email:    String  (required)
  password: String  (required, bcrypt hash)
}
```

---

## 5. State Management

**Redux Toolkit** — single slice, single concern.

```
Redux Store
└── watchlistSlice  (array of coin objects)
      ├── handleAddCoins(coinObject)    → [...state, payload]
      └── handleremovecoin(coinObject)  → filter by JSON.stringify match
```

- `Card.js` — reads store via `useSelector`, dispatches add/remove
- `Watchlist.js` — reads store via `useSelector` to render saved coins
- No persistence — state resets on every page refresh
- All other state (API data, loading, forms) is local `useState` per component

---

## 6. Data Flow — Step by Step

### Coin Browsing Flow
```
1. User navigates to /trending or /top15
2. Page component mounts
3. useEffect fires fetch() to CoinGecko API
4. Response stored in local useState([])
5. loading = false → Cards component renders
6. Cards maps array → Card components
7. Each Card reads Redux store to check if coin is in watchlist
8. Star icon renders filled/empty based on that check
```

### Watchlist Flow
```
1. User clicks star on Card
2. dispatch(handleAddCoins(item)) or dispatch(handleremovecoin(item))
3. Redux store updates
4. All Card components re-render (useSelector subscription)
5. Star icons update across the page
6. /watchlist page reads same store → shows saved coins
```

### Auth Flow
```
1. User fills Login or SignIn form
2. handleSubmit fires fetch() to http://localhost:3001/api/v1/login (or /createuser)
3. Backend receives JSON body
4. /login: findOne by email → bcrypt.compareSync → return { status, message }
5. /createuser: findOne check → bcrypt.hashSync → users.create → return { status, message }
6. Frontend receives response → console.log only
   ✗ No token stored
   ✗ No redirect
   ✗ No UI feedback to user
   ✗ Auth state not tracked anywhere
```

---

## 7. External API — CoinGecko

All calls are unauthenticated (free tier). No API key, no rate limit handling.

| Endpoint | Used In | Returns |
|---|---|---|
| `GET /api/v3/search/trending` | Top15.js | `{ coins: [{ item: {...} }] }` |
| `GET /api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100` | Trending.js | `[{ id, name, symbol, image, current_price, ... }]` |
| `GET /api/v3/coins/:id` | CoinByIdData.js | Full coin object |

Note: The two endpoints return different data shapes. `Top15` data is nested under `element.item` and uses `item.data.price`, `item.thumb`. `Trending` data is flat and uses `item.image`, `item.current_price`. The `checker` prop is passed through `Cards → Card` to handle this branching.

---

## 8. UI & Design System

No design system library. Pure Tailwind CSS utility classes + react-icons.

### Color Palette

| Role | Tailwind Class | Hex |
|---|---|---|
| Primary / Navbar bg | `blue-500` → `indigo-600` (gradient) | `#3B82F6` → `#4F46E5` |
| Logo / star accent | `yellow-400` | `#FACC15` |
| CTA button (home) | `orange-500` | `#F97316` |
| Card background | `blue-100` → `cyan-200` → `blue-300` | gradient |
| Page background | `gray-100` | `#F3F4F6` |
| Positive price | `green-400` / `green-600` | `#4ADE80` / `#16A34A` |
| Negative price | `red-400` / `red-600` | `#F87171` / `#DC2626` |
| Auth accent | `indigo-500` / `indigo-600` | `#6366F1` / `#4F46E5` |
| Error page bg | inline `#F8D7DA` | — |

### Typography
- No custom font loaded — browser default sans-serif
- Sizes: Tailwind scale (`text-sm` through `text-5xl`)
- Weights: `font-semibold`, `font-bold`, `font-extrabold`

### Responsive Breakpoints
- Mobile-first Tailwind defaults: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Card grid: `grid-cols-1 → sm:2 → md:3 → lg:4`
- Navbar collapses to hamburger below `md`

### Loading States
- `Top15.js` → `DummyUi` (skeleton pulse, Tailwind `animate-pulse`)
- `Trending.js` → `RotatingLines` from `react-loader-spinner`
- `Watchlist.js` → inline CSS spinner (1s artificial delay via `setTimeout`)
- Inconsistent — three different loading patterns across three pages

---

## 9. Dependency Graph

```
Frontend
├── react@18 + react-dom@18
├── react-router-dom@6          → all routing
├── @reduxjs/toolkit@2          → store, createSlice
├── react-redux@9               → Provider, useSelector, useDispatch
├── react-icons@5               → Navbar, Card, Footer, home (MD + FA icons)
├── react-loader-spinner@6      → Trending.js only (RotatingLines)
├── tailwindcss@3               → all styling
├── styled-components@6         ← INSTALLED, NEVER USED
├── react-scripts@5             → CRA build toolchain
└── web-vitals@2                → CRA default, not actively used

Backend
├── express@4                   → HTTP server + routing
├── mongoose@8                  → MongoDB ODM
├── mongodb@6                   → mongoose peer dep (also listed directly)
├── bcrypt@5                    → password hashing
├── cors@2                      → CORS middleware
└── nodemon@3 (dev)             → auto-restart on file change

Root package.json
└── cors@2                      ← UNUSED, leftover artifact
```

---

## 10. Dead Code & Unused Items

| Item | Location | Status |
|---|---|---|
| `App.js` | `Frontend/src/App.js` | Fully unused — router is in `index.js`. Imports non-existent components (`components/Top15`, `components/Trending`, `components/Watchlist`) |
| `Search.js` | `Frontend/src/components/Search.js` | 100% commented out |
| `Name` context | `Frontend/src/index.js` | Created with `createContext()`, exported, never consumed anywhere |
| `styled-components` | `Frontend/package.json` | Installed, zero usage in codebase |
| Root `package.json` | `/package.json` | Only has `cors` — not used by anything at root level |
| `count2` variable | `CoinByIdData.js` | Local var reset every render, never persists |
| `like` state | `CoinByIdData.js` | `useState(0)` incremented by a button, never displayed |
| `increment()` function | `CoinByIdData.js` | Logs to console, no real purpose |

---

## 11. Issues & Risks

### Security — Critical
- MongoDB Atlas URI with credentials is hardcoded in `backend/dbConnections.js` and likely committed to git. Rotate credentials immediately. Move to `.env`.
- `cors()` with no config allows all origins — fine for dev, dangerous in production.
- No input sanitization on backend routes before DB queries.
- `bcrypt.compareSync` / `bcrypt.hashSync` used instead of async versions — blocks the Node.js event loop under load.

### Auth — Broken
- Login/SignIn forms POST to backend and get a response, but the frontend does nothing with it — no token, no session, no redirect, no UI feedback.
- No protected routes — `/watchlist` is accessible without login.
- No logout mechanism exists.

### Data Integrity
- Watchlist uses `JSON.stringify` comparison to detect duplicates and find items to remove. This is O(n × object_size) per render and will break if object property order differs between two otherwise identical objects.
- Watchlist is in-memory only — lost on refresh.

### Performance
- No `React.memo`, `useMemo`, or `useCallback` anywhere.
- Every `Card` in a list re-renders when Redux store changes (star click on one card triggers re-render of all cards).
- CoinGecko free tier has rate limits — no caching, no retry, no debounce.
- `CoinByIdData.js` calls `JSON.stringify(data)` on a full CoinGecko coin object (very large) and renders it as a string in the DOM.

### Code Quality
- `console.log(formData)` fires on every keystroke in `Login.js` (outside `handleSubmit`).
- `console.log(item)` fires on every `Card` render.
- `console.log(isUserPresent)` in backend route leaks user data to server logs.
- Three different loading UX patterns across three pages — no consistency.
- `home.js` uses `<a href="Trending">` (relative string) instead of `<Link to="/trending">` — will break routing.
- `ErrorElements.js` uses `https://via.placeholder.com` which is a defunct service.

---

## 12. Suggested Improvements (Priority Order)

**Immediate**
1. Move MongoDB URI and port to `.env` — `MONGO_URI`, `PORT`
2. Move backend base URL to `Frontend/.env` as `REACT_APP_API_URL`
3. Replace `bcrypt.compareSync/hashSync` with async `bcrypt.compare/hash`
4. Fix `home.js` CTA: `<a href="Trending">` → `<Link to="/trending">`

**Short Term**
5. Implement JWT auth — return token from backend, store in `localStorage` or `httpOnly` cookie, add auth context/hook in frontend
6. Add protected route wrapper for `/watchlist`
7. Persist watchlist to `localStorage` (quick win) or backend (proper solution)
8. Replace `JSON.stringify` watchlist comparison with `item.id` comparison
9. Normalize CoinGecko response shapes in a service layer — remove `checker` prop pattern
10. Remove dead code: `App.js`, `Search.js`, `styled-components` dep, root `package.json`

**Medium Term**
11. Create `src/services/coingecko.js` — centralize all API calls
12. Add `React.memo` to `Card` component
13. Add user-facing error states (not just `console.error`)
14. Unify loading UX — pick one pattern (skeleton or spinner) and use it everywhere
15. Add `cors({ origin: process.env.ALLOWED_ORIGIN })` in production

---

## 13. How to Run

```bash
# Backend
cd backend
npm install
npm start          # nodemon index.js → http://localhost:3001

# Frontend (separate terminal)
cd Frontend
npm install
npm start          # CRA dev server → http://localhost:3000
```
