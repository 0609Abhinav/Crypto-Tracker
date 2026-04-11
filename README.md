<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/CoinGecko-API-8DC63F?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+" />

# ₿ CoinPulse

**A professional full-stack cryptocurrency tracking platform**

Real-time prices · Portfolio P&L · Candlestick charts · Price alerts · Market heatmap · News · Gas tracker

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Pages & Routes](#pages--routes)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## Overview

CryptoTracker is a full-stack web application that gives you everything you need to follow the crypto market — from live prices and candlestick charts to a personal portfolio tracker with real P&L, price alerts, and a market heatmap. Built with React 18, Redux Toolkit, Express, and MongoDB.

The frontend talks directly to the CoinGecko free API for all market data. The backend handles user authentication, watchlist persistence, portfolio holdings, and price alerts.

---

## Features

### Market Data
- **Live market table** — top 100 coins by market cap with search, sort, and pagination
- **Trending coins** — most searched coins in the last 24 hours
- **Gainers & Losers** — top 20 movers in both directions
- **Market heatmap** — treemap of top 100 coins sized by market cap, colored by 24h change
- **Global stats bar** — total market cap, 24h volume, BTC & ETH dominance

### Coin Detail
- **Candlestick chart** — real OHLC candles with volume bars, hover tooltip, 24H / 7D / 30D / 1Y ranges
- **Area chart** toggle for a cleaner view
- **Stats** — market cap, volume, FDV, 24h high/low, ATH, ATL, circulating supply
- **Exchange tickers** — top markets where the coin is listed with volume
- **About section** — expandable description with external links (website, Twitter, Reddit, GitHub)

### Portfolio Tracker
- Add holdings with coin, quantity, buy price, buy date, and notes
- Live P&L calculated against current prices
- 24h change column per holding
- Total value, total invested, total P&L, and return % summary cards

### Watchlist
- Add/remove coins from any page with a single click
- Optimistic UI updates — no waiting for the server
- Sort by price, 24h change, or market cap
- Filter by name or symbol

### Price Alerts
- Set above/below price targets for any coin
- Toggle alerts on/off without deleting them
- Visual triggered state when a target is hit

### Tools
- **Converter** — real-time coin-to-coin conversion with popular quick-select
- **Compare** — overlay up to 3 coins on the same % change chart with a stats table
- **Gas Tracker** — Ethereum gas prices (slow / standard / fast) with USD cost estimates for common transactions

### News
- Crypto news from CoinTelegraph, Decrypt, and Bitcoin Magazine
- Category filters: All, Bitcoin, Ethereum, DeFi, NFT, Regulation
- Paginated — 9 articles per page

### Auth & Account
- JWT-based authentication with token persistence
- Signup / Login with validation
- Forgot password & reset password flow (token-based)
- Update name and change password from profile page

### UX
- **Dark / Light theme** toggle, persisted to localStorage
- **Currency switcher** — USD, EUR, GBP, INR, JPY, BTC — updates all prices instantly via Redux
- **Back to top** button on long pages
- **Recently viewed** coins tracked in localStorage
- **Fear & Greed Index** widget with 7-day history
- Skeleton loading states, toast notifications, error boundaries
- Fully responsive — mobile hamburger menu with all links

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Redux Toolkit | 2 | Global state (market, auth, watchlist, portfolio, currency, theme) |
| React Router | 6 | Client-side routing with lazy loading |
| Recharts | 3 | Comparison line chart |
| Canvas API | native | Candlestick + volume chart |
| Tailwind CSS | 3 | Utility styling |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 4 | REST API server |
| MongoDB + Mongoose | 8 | Database & ODM |
| bcrypt | 5 | Password hashing (salt 12) |
| jsonwebtoken | 9 | JWT auth tokens |
| express-validator | 7 | Input validation |
| express-rate-limit | 8 | Rate limiting (global + auth) |
| helmet | 8 | Security headers |
| morgan | 1 | HTTP request logging |

### External APIs

| API | Usage |
|---|---|
| CoinGecko (free) | Market data, OHLC, trending, search, global stats |
| Alternative.me | Fear & Greed Index |
| CryptoCompare RSS | Crypto news feeds |
| Etherscan / Owlracle | Ethereum gas prices |

---

## Project Structure

```
crypto-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection with retry logic
│   ├── controllers/
│   │   ├── authController.js      # signup, login, getMe, updateProfile,
│   │   │                          # forgotPassword, resetPassword
│   │   ├── watchlistController.js # getWatchlist, addCoin, removeCoin
│   │   ├── portfolioController.js # getPortfolio, addHolding, updateHolding,
│   │   │                          # deleteHolding
│   │   └── alertController.js     # getAlerts, createAlert, deleteAlert,
│   │                              # toggleAlert
│   ├── middleware/
│   │   └── auth.js                # JWT protect middleware
│   ├── models/
│   │   ├── User.js                # name, email, password, resetToken fields
│   │   ├── Watchlist.js           # userId → coinIds[]
│   │   ├── Portfolio.js           # userId → holdings[] (subdocuments)
│   │   └── PriceAlert.js          # userId, coinId, targetPrice, condition
│   ├── routes/
│   │   ├── auth.js                # /api/v1/auth/*
│   │   ├── watchlist.js           # /api/v1/watchlist/*
│   │   ├── portfolio.js           # /api/v1/portfolio/*
│   │   └── alerts.js              # /api/v1/alerts/*
│   ├── .env                       # environment variables (not committed)
│   ├── index.js                   # Express app entry point
│   └── package.json
│
└── Frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.js      # Reusable button (primary/ghost/success/danger)
    │   │   │   ├── Input.js       # Text input component
    │   │   │   ├── Skeletons.js   # Loading skeletons (card, table row, chart)
    │   │   │   └── Toast.js       # Toast notification system
    │   │   ├── BackToTop.js       # Scroll-to-top floating button
    │   │   ├── Card.js            # Coin card with sparkline + watchlist toggle
    │   │   ├── CardsGrid.js       # Responsive grid of Card components
    │   │   ├── CurrencySwitcher.js# Currency dropdown (USD/EUR/GBP/INR/JPY/BTC)
    │   │   ├── ErrorBoundary.js   # React error boundary
    │   │   ├── FearGreedWidget.js # Fear & Greed gauge + 7-day history
    │   │   ├── Footer.js          # Site footer
    │   │   ├── GlobalSearch.js    # Coin search with autocomplete
    │   │   ├── GlobalStatsBar.js  # Market cap, volume, dominance bar
    │   │   ├── Navbar.js          # Sticky nav with theme toggle + More menu
    │   │   ├── PriceChart.js      # Canvas candlestick + volume chart
    │   │   └── Sparkline.js       # Mini 7-day sparkline
    │   ├── hooks/
    │   │   ├── useCurrency.js     # Read currency from Redux
    │   │   ├── useDebounce.js     # Debounce search input
    │   │   ├── useLocalStorage.js # Stable localStorage hook
    │   │   ├── useRecentlyViewed.js# Track recently viewed coins
    │   │   └── useScrollToTop.js  # Auto scroll on route change
    │   ├── layouts/
    │   │   ├── AppLayout.js       # Main layout (GlobalStatsBar + Navbar + Footer)
    │   │   └── AuthLayout.js      # Centered card layout for auth pages
    │   ├── pages/
    │   │   ├── Alerts.js          # Price alerts management
    │   │   ├── CoinDetail.js      # Individual coin page
    │   │   ├── Compare.js         # Side-by-side coin comparison
    │   │   ├── Converter.js       # Crypto converter calculator
    │   │   ├── ForgotPassword.js  # Request password reset
    │   │   ├── GainersLosers.js   # Top movers
    │   │   ├── GasTracker.js      # Ethereum gas prices
    │   │   ├── Heatmap.js         # Market heatmap
    │   │   ├── Home.js            # Landing page with hero + trending
    │   │   ├── Login.js           # Login form
    │   │   ├── Market.js          # Full market table
    │   │   ├── News.js            # Crypto news with pagination
    │   │   ├── NotFound.js        # 404 page
    │   │   ├── Portfolio.js       # Portfolio tracker with P&L
    │   │   ├── Profile.js         # Account settings
    │   │   ├── ResetPassword.js   # Reset password with token
    │   │   ├── Signup.js          # Registration form
    │   │   ├── Trending.js        # Trending coins grid
    │   │   └── Watchlist.js       # Personal watchlist with sort/filter
    │   ├── services/
    │   │   ├── api.js             # Backend API client (auth, watchlist,
    │   │   │                      # portfolio, alerts)
    │   │   ├── coingecko.js       # CoinGecko API client
    │   │   ├── feargreed.js       # Fear & Greed index
    │   │   ├── gas.js             # Ethereum gas prices
    │   │   └── news.js            # RSS news aggregator
    │   ├── store/
    │   │   ├── authSlice.js       # User auth state
    │   │   ├── currencySlice.js   # Selected currency (persisted)
    │   │   ├── marketSlice.js     # Coins + trending data
    │   │   ├── portfolioSlice.js  # Portfolio holdings
    │   │   ├── store.js           # Redux store config
    │   │   ├── themeSlice.js      # Dark/light theme (persisted)
    │   │   └── watchlistSlice.js  # Watchlist coin IDs
    │   ├── utils/
    │   │   └── format.js          # formatPrice, formatLarge, formatChange,
    │   │                          # formatSupply
    │   ├── App.css
    │   ├── index.css              # CSS variables (dark + light themes)
    │   └── index.js               # App entry, router, auth bootstrap
    ├── .env                       # REACT_APP_* variables (not committed)
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/crypto-tracker.git
cd crypto-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cryptotracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```bash
npm start
# Server running on http://localhost:3001
```

### 3. Set up the frontend

```bash
cd ../Frontend
npm install
```

Create `Frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_COINGECKO_URL=https://api.coingecko.com/api/v3
```

Start the frontend:

```bash
npm start
# App running on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3001` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWTs | `a_long_random_string` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` / `production` |

### Frontend (`Frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend base URL | `http://localhost:3001/api/v1` |
| `REACT_APP_COINGECKO_URL` | CoinGecko API base | `https://api.coingecko.com/api/v3` |

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Create account |
| `POST` | `/login` | — | Login, returns JWT |
| `GET` | `/me` | JWT | Get current user |
| `PUT` | `/profile` | JWT | Update name or password |
| `POST` | `/forgot-password` | — | Request password reset token |
| `POST` | `/reset-password` | — | Reset password with token |

### Watchlist — `/api/v1/watchlist`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get all watchlisted coin IDs |
| `POST` | `/` | JWT | Add coin to watchlist |
| `DELETE` | `/:coinId` | JWT | Remove coin from watchlist |

### Portfolio — `/api/v1/portfolio`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get all holdings |
| `POST` | `/` | JWT | Add a holding |
| `PUT` | `/:holdingId` | JWT | Update a holding |
| `DELETE` | `/:holdingId` | JWT | Delete a holding |

### Alerts — `/api/v1/alerts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get all price alerts |
| `POST` | `/` | JWT | Create a price alert |
| `DELETE` | `/:alertId` | JWT | Delete an alert |
| `PATCH` | `/:alertId/toggle` | JWT | Toggle alert active/paused |

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home — hero, trending, gainers/losers | No |
| `/market` | Full market table with search & sort | No |
| `/trending` | Trending coins grid | No |
| `/gainers` | Top gainers & losers | No |
| `/heatmap` | Market heatmap (top 100) | No |
| `/news` | Crypto news with categories | No |
| `/coin/:id` | Coin detail with candlestick chart | No |
| `/compare` | Side-by-side coin comparison | No |
| `/converter` | Crypto converter calculator | No |
| `/gas` | Ethereum gas tracker | No |
| `/watchlist` | Personal watchlist | Yes |
| `/portfolio` | Portfolio tracker with P&L | Yes |
| `/alerts` | Price alerts | Yes |
| `/profile` | Account settings | Yes |
| `/login` | Login | Guest only |
| `/signup` | Sign up | Guest only |
| `/forgot-password` | Request password reset | Guest only |
| `/reset-password/:token` | Set new password | Guest only |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           BROWSER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  React SPA  (port 3000)                  │   │
│  │                                                          │   │
│  │   Redux Store                                            │   │
│  │   ├── auth       ├── market    ├── watchlist             │   │
│  │   ├── currency   ├── portfolio ├── theme                 │   │
│  │                                                          │   │
│  │   React Router v6 (lazy-loaded pages)                    │   │
│  │   AppLayout → GlobalStatsBar + Navbar + Outlet + Footer  │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│          ┌──────────────┴──────────────┐                        │
│          │                             │                        │
│          ▼                             ▼                        │
│  ┌───────────────┐           ┌──────────────────────┐           │
│  │  CoinGecko    │           │  Express API          │           │
│  │  Public API   │           │  (port 3001)          │           │
│  │               │           │                      │           │
│  │  /markets     │           │  /auth/*              │           │
│  │  /ohlc        │           │  /watchlist/*         │           │
│  │  /trending    │           │  /portfolio/*         │           │
│  │  /search      │           │  /alerts/*            │           │
│  │  /global      │           └──────────┬────────────┘           │
│  └───────────────┘                      │                        │
│                                         ▼                        │
│                              ┌──────────────────────┐            │
│                              │   MongoDB Atlas       │            │
│                              │   users · watchlists  │            │
│                              │   portfolios · alerts │            │
│                              └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

All global state lives in Redux. Currency changes trigger automatic re-fetches across all pages — no manual refresh needed.

```
currencySlice  →  fetchMarket()  →  all price displays update
                  fetchPortfolio prices
                  fetchWatchlist prices
                  CoinDetail re-fetches
                  PriceChart re-fetches
```

### Candlestick Chart

The chart is built on the native Canvas API — no charting library. It renders OHLC candles from the CoinGecko `/ohlc` endpoint with:
- Green/red bodies and wicks
- Volume bars below the chart
- Hover crosshair with O/H/L/C tooltip
- ResizeObserver for responsive width
- Falls back to line-derived pseudo-candles if OHLC is unavailable

---

## Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens with configurable expiry
- Rate limiting: 100 req/15min globally, 20 req/15min on auth routes
- Helmet security headers on all responses
- CORS restricted to `CLIENT_URL` origin
- Input validation via express-validator on all auth routes
- Password reset tokens are SHA-256 hashed before storage

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Data provided by [CoinGecko](https://www.coingecko.com) · Built with React + Express + MongoDB

</div>
