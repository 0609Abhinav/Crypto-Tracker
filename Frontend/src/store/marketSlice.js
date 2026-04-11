import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coingeckoAPI } from "../services/coingecko";

export const fetchMarket = createAsyncThunk(
  "market/fetch",
  async ({ page = 1, currency = "usd" } = {}, { rejectWithValue }) => {
    try {
      return await coingeckoAPI.getMarkets(page, currency);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrending = createAsyncThunk(
  "market/trending",
  async (_, { rejectWithValue }) => {
    try {
      return await coingeckoAPI.getTrending();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const marketSlice = createSlice({
  name: "market",
  initialState: {
    coins: [],
    trending: [],
    loading: false,
    trendingLoading: false,
    error: null,
  },
  reducers: {
    clearCoins(state) { state.coins = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarket.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMarket.fulfilled, (s, a) => { s.loading = false; s.coins = a.payload; })
      .addCase(fetchMarket.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTrending.pending, (s) => { s.trendingLoading = true; })
      .addCase(fetchTrending.fulfilled, (s, a) => { s.trendingLoading = false; s.trending = a.payload; })
      .addCase(fetchTrending.rejected, (s) => { s.trendingLoading = false; });
  },
});

export const { clearCoins } = marketSlice.actions;
export default marketSlice.reducer;
