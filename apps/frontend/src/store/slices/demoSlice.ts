// src/store/slices/demoSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DemoState {
  demoClicked: boolean;
  numCases: number;
  fastClicked: boolean;
  soundClicked: boolean;
  rarityInfoPopup: boolean;
  paidSpinClicked: boolean;
}

const initialState: DemoState = {
  demoClicked: false,
  numCases: 1,
  fastClicked: false,
  soundClicked: true,
  rarityInfoPopup: false,
  paidSpinClicked: false,
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
    toggleRarityInfoPopup(state) {
      state.rarityInfoPopup = !state.rarityInfoPopup;
    },
    togglePaidSpinClicked(state) {
      state.paidSpinClicked = !state.paidSpinClicked;
    },
  },
});

export const {
  toggleDemoClicked,
  setNumCases,
  toggleFastClicked,
  toggleRarityInfoPopup,
  toggleSoundClicked,
  togglePaidSpinClicked,
} = demoSlice.actions;
export default demoSlice.reducer;
