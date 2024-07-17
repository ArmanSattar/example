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
  },
});

export const { setServerSeed, setStartMiddleItem } = caseCarouselSlice.actions;
export default caseCarouselSlice.reducer;
