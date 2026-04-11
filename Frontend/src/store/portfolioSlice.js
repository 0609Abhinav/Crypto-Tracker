import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { portfolioAPI } from "../services/api";

export const fetchPortfolio = createAsyncThunk("portfolio/fetch", async (_, { rejectWithValue }) => {
  try { return (await portfolioAPI.get()).holdings; }
  catch (err) { return rejectWithValue(err.message); }
});

export const addHolding = createAsyncThunk("portfolio/add", async (body, { rejectWithValue }) => {
  try { return (await portfolioAPI.add(body)).holdings; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateHolding = createAsyncThunk("portfolio/update", async ({ holdingId, ...body }, { rejectWithValue }) => {
  try { return (await portfolioAPI.update(holdingId, body)).holdings; }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeHolding = createAsyncThunk("portfolio/remove", async (holdingId, { rejectWithValue }) => {
  try { return (await portfolioAPI.remove(holdingId)).holdings; }
  catch (err) { return rejectWithValue(err.message); }
});

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: { holdings: [], loading: false, error: null },
  reducers: {
    clearPortfolio(state) { state.holdings = []; },
  },
  extraReducers: (b) => {
    const setHoldings = (s, a) => { s.loading = false; s.holdings = a.payload; };
    b
      .addCase(fetchPortfolio.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPortfolio.fulfilled, setHoldings)
      .addCase(fetchPortfolio.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addHolding.fulfilled,    setHoldings)
      .addCase(updateHolding.fulfilled, setHoldings)
      .addCase(removeHolding.fulfilled, setHoldings);
  },
});

export const { clearPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
