import { createSlice } from "@reduxjs/toolkit";

interface CaseCarouselState {
  loadingCount: number;
}

const initialState: CaseCarouselState = {
  loadingCount: 0,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    finishLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
  },
});

export const { startLoading, finishLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
