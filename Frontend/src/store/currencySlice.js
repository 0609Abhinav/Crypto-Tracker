import { createSlice } from "@reduxjs/toolkit";

export const CURRENCIES = [
  { code: "usd", symbol: "$",  label: "USD" },
  { code: "eur", symbol: "€",  label: "EUR" },
  { code: "gbp", symbol: "£",  label: "GBP" },
  { code: "inr", symbol: "₹",  label: "INR" },
  { code: "jpy", symbol: "¥",  label: "JPY" },
  { code: "btc", symbol: "₿",  label: "BTC" },
];

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("preferred_currency")) || CURRENCIES[0]; }
  catch { return CURRENCIES[0]; }
})();

const currencySlice = createSlice({
  name: "currency",
  initialState: { current: saved },
  reducers: {
    setCurrency(state, action) {
      state.current = action.payload;
      // Always persist locally for instant load on next visit
      localStorage.setItem("preferred_currency", JSON.stringify(action.payload));
    },
    // Called after loading prefs from DB — sets currency without triggering DB save
    setCurrencyFromDB(state, action) {
      const match = CURRENCIES.find((c) => c.code === action.payload);
      if (match) {
        state.current = match;
        localStorage.setItem("preferred_currency", JSON.stringify(match));
      }
    },
  },
});

export const { setCurrency, setCurrencyFromDB } = currencySlice.actions;
export default currencySlice.reducer;
