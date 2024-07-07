// src/store/slices/demoSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DemoState {
  demoClicked: boolean;
  numCases: number;
  fastClicked: boolean;
}

const initialState: DemoState = {
  demoClicked: false,
  numCases: 1,
  fastClicked: false,
};

const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    toggleDemoClicked(state) {
      state.demoClicked = !state.demoClicked;
    },
    toggleFastClicked(state) {
      state.fastClicked = !state.fastClicked;
    },
    setNumCases(state, action) {
      state.numCases = action.payload;
    },
  },
});

export const { toggleDemoClicked, setNumCases, toggleFastClicked } = demoSlice.actions;
export default demoSlice.reducer;
