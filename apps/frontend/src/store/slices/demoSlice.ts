// src/store/slices/demoSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DemoState {
  demoClicked: boolean;
  numCases: number;
  fastClicked: boolean;
  soundClicked: boolean;
}

const initialState: DemoState = {
  demoClicked: false,
  numCases: 1,
  fastClicked: false,
  soundClicked: true,
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
    toggleSoundClicked(state) {
      state.soundClicked = !state.soundClicked;
    },
  },
});

export const { toggleDemoClicked, setNumCases, toggleFastClicked, toggleSoundClicked } =
  demoSlice.actions;
export default demoSlice.reducer;
