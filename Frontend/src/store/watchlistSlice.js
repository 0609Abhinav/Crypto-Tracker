import { createSlice } from "@reduxjs/toolkit";

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: [],
  reducers: {
    handleAddCoins(state, action) {
      // Create a new state with the added coin
      return [...state, action.payload];
    },
    handleremovecoin(state, action) {
      // Find the index of the coin to remove
      const indexOfRemovingCoin = state.findIndex(
        (obj) => JSON.stringify(obj) === JSON.stringify(action.payload)
      );

      // If the coin is found, create a new state without it
      if (indexOfRemovingCoin > -1) {
        return [
          ...state.slice(0, indexOfRemovingCoin),
          ...state.slice(indexOfRemovingCoin + 1),
        ];
      }

      // Return the original state if the coin is not found
      return state;
    },
  },
});

export const { handleAddCoins, handleremovecoin } = watchlistSlice.actions;
export default watchlistSlice.reducer;
