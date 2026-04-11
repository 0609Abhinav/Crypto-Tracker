import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: saved },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.mode);
      document.documentElement.setAttribute("data-theme", state.mode);
    },
    // Called after loading prefs from DB
    setThemeFromDB(state, action) {
      const mode = action.payload === "light" ? "light" : "dark";
      state.mode = mode;
      localStorage.setItem("theme", mode);
      document.documentElement.setAttribute("data-theme", mode);
    },
  },
});

export const { toggleTheme, setThemeFromDB } = themeSlice.actions;
export default themeSlice.reducer;
