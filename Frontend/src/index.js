import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import { ToastProvider } from "./components/ui/Toast";
import { fetchMe, setInitialized } from "./store/authSlice";
import { fetchWatchlist } from "./store/watchlistSlice";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { CoinDetailSkeleton } from "./components/ui/Skeletons";

const Home         = lazy(() => import("./pages/Home"));
const Market       = lazy(() => import("./pages/Market"));
const Trending     = lazy(() => import("./pages/Trending"));
const Watchlist    = lazy(() => import("./pages/Watchlist"));
const CoinDetail   = lazy(() => import("./pages/CoinDetail"));
const Login        = lazy(() => import("./pages/Login"));
const Signup       = lazy(() => import("./pages/Signup"));
const NotFound     = lazy(() => import("./pages/NotFound"));
const News         = lazy(() => import("./pages/News"));
const GainersLosers= lazy(() => import("./pages/GainersLosers"));
const Profile      = lazy(() => import("./pages/Profile"));

const PageLoader = () => (
  <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
    <CoinDetailSkeleton />
  </div>
);

const S = (C) => <Suspense fallback={<PageLoader />}><C /></Suspense>;

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchMe()).then((res) => {
        if (fetchMe.fulfilled.match(res)) dispatch(fetchWatchlist());
      });
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  if (!initialized) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  return children;
};

const RequireAuth = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login",  element: <Suspense fallback={<PageLoader />}><GuestOnly><Login /></GuestOnly></Suspense> },
      { path: "/signup", element: <Suspense fallback={<PageLoader />}><GuestOnly><Signup /></GuestOnly></Suspense> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/",          element: S(Home) },
      { path: "/market",    element: S(Market) },
      { path: "/trending",  element: S(Trending) },
      { path: "/gainers",   element: S(GainersLosers) },
      { path: "/news",      element: S(News) },
      { path: "/coin/:id",  element: S(CoinDetail) },
      { path: "/watchlist", element: <Suspense fallback={<PageLoader />}><RequireAuth><Watchlist /></RequireAuth></Suspense> },
      { path: "/profile",   element: <Suspense fallback={<PageLoader />}><RequireAuth><Profile /></RequireAuth></Suspense> },
      { path: "*",          element: S(NotFound) },
    ],
  },
]);

const App = () => (
  <Provider store={store}>
    <ToastProvider>
      <ErrorBoundary>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </ErrorBoundary>
    </ToastProvider>
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
