// src/store/slices/demoSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DemoState {
  demoClicked: boolean;
  numCases: number;
  fastClicked: boolean;
  soundOn: boolean;
  rarityInfoPopup: boolean;
  paidSpinClicked: boolean;
}

const initialState: DemoState = {
  demoClicked: false,
  numCases: 1,
  fastClicked: false,
  soundOn: true,
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
    toggleSoundOn(state) {
      state.soundOn = !state.soundOn;
    },
    toggleRarityInfoPopup(state) {
      state.rarityInfoPopup = !state.rarityInfoPopup;
    },
    togglePaidSpinClicked(state) {
      state.paidSpinClicked = !state.paidSpinClicked;
    },
    resetDemoState(state) {
      state.demoClicked = false;
      state.numCases = 1;
      state.fastClicked = false;
      state.soundOn = true;
      state.rarityInfoPopup = false;
      state.paidSpinClicked = false;
    },
  },
});

export const {
  toggleDemoClicked,
  setNumCases,
  toggleFastClicked,
  toggleRarityInfoPopup,
  toggleSoundOn,
  togglePaidSpinClicked,
  resetDemoState,
} = demoSlice.actions;
export default demoSlice.reducer;
