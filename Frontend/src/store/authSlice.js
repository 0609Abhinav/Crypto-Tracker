import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../services/api";

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const d = decodeToken(token);
  return d?.exp && d.exp * 1000 > Date.now();
};

// Restore user from valid token — works offline / when backend is down
const getUserFromToken = (token) => {
  const d = decodeToken(token);
  if (!d) return null;
  return { id: d.id, name: d.name || "User", email: d.email || "" };
};

export const loginUser = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const data = await authAPI.login(creds);
    localStorage.setItem("token", data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const signupUser = createAsyncThunk("auth/signup", async (creds, { rejectWithValue }) => {
  try {
    const data = await authAPI.signup(creds);
    localStorage.setItem("token", data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    return rejectWithValue("No valid token");
  }
  try {
    const data = await authAPI.getMe();
    return data.user;
  } catch {
    // Backend down — restore from token payload (name + email are embedded)
    const user = getUserFromToken(token);
    if (user) return user;
    localStorage.removeItem("token");
    return rejectWithValue("Session expired");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },
    clearError(state) { state.error = null; },
    setInitialized(state) { state.initialized = true; },
    updateUser(state, action) { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; s.initialized = true; })
      .addCase(signupUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signupUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
      .addCase(signupUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; s.initialized = true; })
      .addCase(fetchMe.pending, (s) => { s.loading = true; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
      .addCase(fetchMe.rejected, (s) => { s.loading = false; s.user = null; s.initialized = true; });
  },
});

export const { logout, clearError, setInitialized, updateUser } = authSlice.actions;
export default authSlice.reducer;
