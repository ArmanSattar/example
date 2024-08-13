import { createSlice } from "@reduxjs/toolkit";

interface CaseCarouselState {
  serverSeed: string | null;
  startMiddleItem: number;
}

const initialState: CaseCarouselState = {
  serverSeed: null,
  startMiddleItem: 0,
};

const caseCarouselSlice = createSlice({
  name: "caseCarousel",
  initialState,
  reducers: {
    setServerSeed(state, action) {
      state.serverSeed = action.payload;
    },
    setStartMiddleItem(state, action) {
      state.startMiddleItem = action.payload;
    },
    resetCaseCarouselState(state) {
      state.serverSeed = null;
    },
  },
});

export const { setServerSeed, setStartMiddleItem, resetCaseCarouselState } =
  caseCarouselSlice.actions;
export default caseCarouselSlice.reducer;
