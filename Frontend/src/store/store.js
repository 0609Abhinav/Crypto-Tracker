import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import watchlistReducer from "./watchlistSlice";
import marketReducer from "./marketSlice";
import currencyReducer from "./currencySlice";
import portfolioReducer from "./portfolioSlice";
import themeReducer from "./themeSlice";
import prefsReducer from "./prefsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
    market: marketReducer,
    currency: currencyReducer,
    portfolio: portfolioReducer,
    theme: themeReducer,
    prefs: prefsReducer,
  },
});
