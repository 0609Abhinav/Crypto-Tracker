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
      localStorage.setItem("preferred_currency", JSON.stringify(action.payload));
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
