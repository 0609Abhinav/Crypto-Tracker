import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { watchlistAPI } from "../services/api";

export const fetchWatchlist = createAsyncThunk("watchlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const data = await watchlistAPI.get();
    return data.coinIds;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addToWatchlist = createAsyncThunk("watchlist/add", async (coinId, { rejectWithValue }) => {
  try {
    const data = await watchlistAPI.add(coinId);
    return data.coinIds;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromWatchlist = createAsyncThunk("watchlist/remove", async (coinId, { rejectWithValue }) => {
  try {
    const data = await watchlistAPI.remove(coinId);
    return data.coinIds;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: { coinIds: [], loading: false, error: null },
  reducers: {
    clearWatchlist(state) {
      state.coinIds = [];
    },
    // Optimistic toggle — instant UI update before backend responds
    optimisticAdd(state, action) {
      if (!state.coinIds.includes(action.payload)) {
        state.coinIds.push(action.payload);
      }
    },
    optimisticRemove(state, action) {
      state.coinIds = state.coinIds.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.coinIds = action.payload;
      })
      // Sync with server response after optimistic update
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.coinIds = action.payload;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.coinIds = action.payload;
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearWatchlist, optimisticAdd, optimisticRemove } = watchlistSlice.actions;
export default watchlistSlice.reducer;
