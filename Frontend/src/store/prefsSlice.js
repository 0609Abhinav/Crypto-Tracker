import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { prefsAPI } from "../services/api";

// Load prefs from DB — called after login/bootstrap
export const fetchPrefs = createAsyncThunk("prefs/fetch", async (_, { rejectWithValue }) => {
  try { return (await prefsAPI.get()).prefs; }
  catch (err) { return rejectWithValue(err.message); }
});

export const savePrefs = createAsyncThunk("prefs/save", async (body, { rejectWithValue }) => {
  try { return (await prefsAPI.update(body)).prefs; }
  catch (err) { return rejectWithValue(err.message); }
});

export const addRecentToDB = createAsyncThunk("prefs/addRecent", async (coin, { rejectWithValue }) => {
  try { return (await prefsAPI.addRecent(coin)).recentlyViewed; }
  catch (err) { return rejectWithValue(err.message); }
});

export const clearRecentFromDB = createAsyncThunk("prefs/clearRecent", async (_, { rejectWithValue }) => {
  try { await prefsAPI.clearRecent(); return []; }
  catch (err) { return rejectWithValue(err.message); }
});

const prefsSlice = createSlice({
  name: "prefs",
  initialState: {
    recentlyViewed: [],
    loaded: false,
  },
  reducers: {
    clearPrefs(state) {
      state.recentlyViewed = [];
      state.loaded = false;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchPrefs.fulfilled, (state, action) => {
        state.recentlyViewed = action.payload.recentlyViewed ?? [];
        state.loaded = true;
      })
      .addCase(addRecentToDB.fulfilled, (state, action) => {
        state.recentlyViewed = action.payload;
      })
      .addCase(clearRecentFromDB.fulfilled, (state) => {
        state.recentlyViewed = [];
      });
  },
});

export const { clearPrefs } = prefsSlice.actions;
export default prefsSlice.reducer;
