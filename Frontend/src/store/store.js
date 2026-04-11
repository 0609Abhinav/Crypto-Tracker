import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import watchlistReducer from "./watchlistSlice";
import marketReducer from "./marketSlice";
import currencyReducer from "./currencySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
    market: marketReducer,
    currency: currencyReducer,
  },
});
